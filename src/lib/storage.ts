/**
 * Browser persistence: one versioned JSON document in localStorage, plus local
 * backups created automatically before migrations and destructive operations.
 *
 * Guarantees:
 * - unreadable data is never overwritten (the store blocks saving until resolved);
 * - v1 data is copied to a backup key before it is migrated, and the v1 key is only
 *   removed once both the backup and the new document have been written;
 * - write failures (quota, disabled storage) are reported, never swallowed.
 */

import { readDocument, toDocument, type Issue } from '@/domain/validate'
import type { Workspace } from '@/domain/types'

export interface KV {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  key(index: number): string | null
  readonly length: number
}

export const DATA_KEY = '3asywealth:data'
export const LEGACY_KEY = 'wealth-storage'
export const BACKUP_PREFIX = '3asywealth:backup:'
const MAX_AUTO_BACKUPS = 5

export type BackupReason = 'migration' | 'beforeReplace' | 'beforeClear' | 'beforeRestore' | 'invalidData' | 'unreadable'

export interface BackupEntry {
  key: string
  reason: BackupReason | 'legacy'
  createdAt: string | null
  size: number
}

export type WriteError = 'quota' | 'unavailable' | 'unknown'
export type WriteResult = { ok: true } | { ok: false; reason: WriteError }

export type LoadResult =
  | { status: 'empty' }
  | { status: 'loaded'; workspace: Workspace; issues: Issue[]; backupKey: string | null }
  | {
      status: 'migrated'
      workspace: Workspace
      issues: Issue[]
      backupKey: string | null
      saved: WriteResult
    }
  | { status: 'failed'; error: 'unreadable' | 'newerVersion' | 'unrecognized'; key: string }
  /** Some records were unreadable and no backup could be written: show the rest, but never save over them. */
  | { status: 'loadedUnsafe'; workspace: Workspace; issues: Issue[]; key: string }

export function getBrowserStorage(): KV | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null
  } catch {
    return null
  }
}

function classify(error: unknown): WriteError {
  if (error instanceof DOMException || (typeof error === 'object' && error !== null && 'name' in error)) {
    const e = error as { name?: string; code?: number }
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014) {
      return 'quota'
    }
    if (e.name === 'SecurityError') return 'unavailable'
  }
  return 'unknown'
}

function write(kv: KV | null, key: string, value: string): WriteResult {
  if (!kv) return { ok: false, reason: 'unavailable' }
  try {
    kv.setItem(key, value)
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: classify(error) }
  }
}

export function saveWorkspace(kv: KV | null, workspace: Workspace, now = new Date()): WriteResult {
  return write(kv, DATA_KEY, JSON.stringify(toDocument(workspace, 'storage', now)))
}

export function createBackup(
  kv: KV | null,
  reason: BackupReason,
  payload: string,
  now = new Date(),
): { ok: true; key: string } | { ok: false; reason: WriteError } {
  const base = `${BACKUP_PREFIX}${reason}:${now.toISOString()}`
  let key = base
  for (let n = 2; readRaw(kv, key) !== null; n++) key = `${base}~${n}`
  const result = write(kv, key, payload)
  if (!result.ok) return result
  pruneBackups(kv!)
  return { ok: true, key }
}

export function backupWorkspace(kv: KV | null, reason: BackupReason, workspace: Workspace, now = new Date()) {
  return createBackup(kv, reason, JSON.stringify(toDocument(workspace, 'backup', now)), now)
}

function parseBackupKey(key: string): Omit<BackupEntry, 'size'> | null {
  if (key === LEGACY_KEY) return { key, reason: 'legacy', createdAt: null }
  if (!key.startsWith(BACKUP_PREFIX)) return null
  const rest = key.slice(BACKUP_PREFIX.length)
  const sep = rest.indexOf(':')
  if (sep < 0) return null
  return { key, reason: rest.slice(0, sep) as BackupReason, createdAt: rest.slice(sep + 1).split('~')[0] ?? null }
}

export function listBackups(kv: KV | null): BackupEntry[] {
  if (!kv) return []
  const entries: BackupEntry[] = []
  try {
    for (let i = 0; i < kv.length; i++) {
      const key = kv.key(i)
      if (!key) continue
      const parsed = parseBackupKey(key)
      if (parsed) entries.push({ ...parsed, size: kv.getItem(key)?.length ?? 0 })
    }
  } catch {
    return []
  }
  return entries.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
}

/** Keep the most recent automatic backups; migration/unreadable backups are never pruned. */
function pruneBackups(kv: KV) {
  const kept: Array<BackupEntry['reason']> = ['migration', 'unreadable', 'invalidData', 'legacy']
  const prunable = listBackups(kv).filter((b) => !kept.includes(b.reason))
  for (const b of prunable.slice(MAX_AUTO_BACKUPS)) {
    try {
      kv.removeItem(b.key)
    } catch {
      /* best effort */
    }
  }
}

export function readRaw(kv: KV | null, key: string): string | null {
  try {
    return kv?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function removeKey(kv: KV | null, key: string): boolean {
  try {
    kv?.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function loadWorkspace(kv: KV | null, now = new Date()): LoadResult {
  const ctx = { newId: () => crypto.randomUUID(), now }
  const current = readRaw(kv, DATA_KEY)

  if (current !== null) {
    let json: unknown
    try {
      json = JSON.parse(current)
    } catch {
      return { status: 'failed', error: 'unreadable', key: DATA_KEY }
    }
    const result = readDocument(json, ctx)
    if (!result.ok) return { status: 'failed', error: result.error, key: DATA_KEY }
    let backupKey: string | null = null
    if (result.issues.some((i) => i.severity === 'error')) {
      // The dropped records only survive in this copy, so it must exist before anything is saved.
      const existing = listBackups(kv).find((b) => b.reason === 'invalidData' && readRaw(kv, b.key) === current)
      if (existing) backupKey = existing.key
      else {
        const backup = createBackup(kv, 'invalidData', current, now)
        if (!backup.ok) return { status: 'loadedUnsafe', workspace: result.workspace, issues: result.issues, key: DATA_KEY }
        backupKey = backup.key
      }
    }
    return { status: 'loaded', workspace: result.workspace, issues: result.issues, backupKey }
  }

  const legacy = readRaw(kv, LEGACY_KEY)
  if (legacy === null) return { status: 'empty' }

  let json: unknown
  try {
    json = JSON.parse(legacy)
  } catch {
    return { status: 'failed', error: 'unreadable', key: LEGACY_KEY }
  }
  const result = readDocument(json, ctx)
  if (!result.ok) return { status: 'failed', error: result.error, key: LEGACY_KEY }

  const backup = createBackup(kv, 'migration', legacy, now)
  const saved = saveWorkspace(kv, result.workspace, now)
  // The v1 key stays in place unless a backup copy and the new document both exist.
  if (backup.ok && saved.ok) removeKey(kv, LEGACY_KEY)
  return {
    status: 'migrated',
    workspace: result.workspace,
    issues: result.issues,
    // Without a backup copy the untouched v1 key is the recovery point.
    backupKey: backup.ok ? backup.key : LEGACY_KEY,
    saved,
  }
}

// ---------------------------------------------------------------------------
// Small UI preferences (not part of the wealth data)
// ---------------------------------------------------------------------------

const PREFS_KEY = '3asywealth:prefs'

export interface Prefs {
  hideAmounts: boolean
}

export function loadPrefs(kv: KV | null): Prefs {
  try {
    const raw = kv?.getItem(PREFS_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<Prefs>) : {}
    return { hideAmounts: parsed.hideAmounts === true }
  } catch {
    return { hideAmounts: false }
  }
}

export function savePrefs(kv: KV | null, prefs: Prefs) {
  write(kv, PREFS_KEY, JSON.stringify(prefs))
}

/** In-memory KV used by tests and as a stand-in when the browser blocks storage. */
export class MemoryKV implements KV {
  private map = new Map<string, string>()
  quotaBytes = Infinity
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null
  }
  setItem(key: string, value: string) {
    const used = [...this.map.entries()].reduce((n, [k, v]) => (k === key ? n : n + k.length + v.length), 0)
    if (used + key.length + value.length > this.quotaBytes) {
      const err = new Error('quota') as Error & { name: string }
      err.name = 'QuotaExceededError'
      throw err
    }
    this.map.set(key, value)
  }
  removeItem(key: string) {
    this.map.delete(key)
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null
  }
  get length() {
    return this.map.size
  }
}
