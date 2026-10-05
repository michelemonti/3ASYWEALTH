/**
 * Wealth store (Zustand).
 *
 * - `personal` is the person's data and the only thing persisted.
 * - `demo` is an in-memory fictional workspace; while it is active every edit goes
 *   there, and leaving the demo simply discards it.
 * - Persistence happens in a subscription; failures are surfaced in `persistence`.
 */

import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore } from 'zustand'
import type { Asset, Currency, Liability, Snapshot, Workspace } from '@/domain/types'
import { emptyWorkspace } from '@/domain/types'
import { createSnapshot, type CreateSnapshotResult } from '@/domain/snapshots'
import { createDemoWorkspace, type DemoLabelKey } from '@/domain/demo'
import { todayISODate } from '@/domain/numbers'
import type { Issue } from '@/domain/validate'
import {
  backupWorkspace,
  createBackup,
  getBrowserStorage,
  loadPrefs,
  loadWorkspace,
  readRaw,
  removeKey,
  savePrefs,
  saveWorkspace,
  type BackupReason,
  type KV,
  type LoadResult,
  type WriteError,
} from '@/lib/storage'

export type AssetInput = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>
export type LiabilityInput = Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>

export type PersistenceState =
  | { status: 'ok' }
  | { status: 'error'; reason: WriteError }
  | { status: 'blocked'; error: 'unreadable' | 'newerVersion' | 'unrecognized' | 'invalidNoBackup'; key: string }

export type LoadNotice = { kind: 'migrated' | 'issues'; backupKey: string | null; issues: Issue[] }

export type GuardedResult = { ok: true; backupKey: string | null } | { ok: false; reason: 'backupFailed' }

export interface DeletedAsset {
  asset: Asset
  index: number
  unlinked: string[]
}

export interface DeletedLiability {
  liability: Liability
  index: number
}

export interface WealthState {
  personal: Workspace
  demo: Workspace | null
  hideAmounts: boolean
  persistence: PersistenceState
  notice: LoadNotice | null
  /** Incremented whenever local backups change, so lists can refresh. */
  backupsRevision: number

  addAsset: (input: AssetInput) => string
  updateAsset: (id: string, input: AssetInput) => void
  duplicateAsset: (id: string, suffix: string) => string | null
  deleteAsset: (id: string) => DeletedAsset | null
  restoreAsset: (deleted: DeletedAsset) => void

  addLiability: (input: LiabilityInput) => string
  updateLiability: (id: string, input: LiabilityInput) => void
  duplicateLiability: (id: string, suffix: string) => string | null
  deleteLiability: (id: string) => DeletedLiability | null
  restoreLiability: (deleted: DeletedLiability) => void

  saveSnapshot: (note?: string) => CreateSnapshotResult
  deleteSnapshot: (id: string) => Snapshot | null

  setDisplayCurrency: (currency: Currency) => void
  setRate: (rate: number) => void

  startDemo: (label: (key: DemoLabelKey) => string) => void
  exitDemo: () => void

  mergeIntoPersonal: (incoming: Pick<Workspace, 'assets' | 'liabilities' | 'snapshots'>, adoptRate: number | null) => void
  replacePersonal: (
    next: Workspace,
    reason: Extract<BackupReason, 'beforeReplace' | 'beforeRestore'>,
    force?: boolean,
  ) => GuardedResult
  clearPersonal: (force?: boolean) => GuardedResult
  resolveBlocked: () => boolean
  /** Reload personal data written by another tab, without saving it back. */
  syncFromStorage: () => boolean

  setHideAmounts: (hide: boolean) => void
  dismissNotice: () => void
  touchBackups: () => void
}

export interface StoreDeps {
  kv: KV | null
  now?: () => Date
  newId?: () => string
}

function initialFrom(load: LoadResult, kv: KV | null): Pick<WealthState, 'personal' | 'persistence' | 'notice'> {
  const base: PersistenceState = kv ? { status: 'ok' } : { status: 'error', reason: 'unavailable' }
  switch (load.status) {
    case 'empty':
      return { personal: emptyWorkspace(), persistence: base, notice: null }
    case 'loaded':
      return {
        personal: load.workspace,
        persistence: base,
        notice: load.issues.length > 0 ? { kind: 'issues', backupKey: load.backupKey, issues: load.issues } : null,
      }
    case 'migrated':
      return {
        personal: load.workspace,
        persistence: load.saved.ok ? { status: 'ok' } : { status: 'error', reason: load.saved.reason },
        notice: { kind: 'migrated', backupKey: load.backupKey, issues: load.issues },
      }
    case 'failed':
      return {
        personal: emptyWorkspace(),
        persistence: { status: 'blocked', error: load.error, key: load.key },
        notice: null,
      }
    case 'loadedUnsafe':
      return {
        personal: load.workspace,
        persistence: { status: 'blocked', error: 'invalidNoBackup', key: load.key },
        notice: { kind: 'issues', backupKey: null, issues: load.issues },
      }
  }
}

function withoutLink(l: Liability): Liability {
  const { linkedAssetId: _drop, ...rest } = l
  return rest
}

export function createWealthStore(deps: StoreDeps, load?: LoadResult): StoreApi<WealthState> {
  const { kv } = deps
  const now = deps.now ?? (() => new Date())
  const newId = deps.newId ?? (() => crypto.randomUUID())
  const initialLoad = load ?? loadWorkspace(kv, now())
  let syncing = false

  const store = createStore<WealthState>()((set, get) => {
    /** Apply a change to whichever workspace is active (demo or personal). */
    const updateActive = (fn: (ws: Workspace) => Workspace) =>
      set((s) => (s.demo ? { demo: fn(s.demo) } : { personal: fn(s.personal) }))
    const active = () => get().demo ?? get().personal
    const stamp = () => now().toISOString()
    const normalizeAsset = (input: AssetInput): AssetInput => ({
      ...input,
      ownershipPercent: input.valueBasis === 'share' ? 100 : input.ownershipPercent,
    })

    const guardedBackup = (reason: BackupReason, force: boolean): GuardedResult => {
      const { personal } = get()
      const isEmpty = personal.assets.length + personal.liabilities.length + personal.snapshots.length === 0
      if (isEmpty) return { ok: true, backupKey: null }
      const backup = backupWorkspace(kv, reason, personal, now())
      if (backup.ok) {
        set((s) => ({ backupsRevision: s.backupsRevision + 1 }))
        return { ok: true, backupKey: backup.key }
      }
      return force ? { ok: true, backupKey: null } : { ok: false, reason: 'backupFailed' }
    }

    return {
      ...initialFrom(initialLoad, kv),
      demo: null,
      hideAmounts: loadPrefs(kv).hideAmounts,
      backupsRevision: 0,

      addAsset: (input) => {
        const id = newId()
        const t = stamp()
        updateActive((ws) => ({
          ...ws,
          assets: [...ws.assets, { ...normalizeAsset(input), id, createdAt: t, updatedAt: t }],
        }))
        return id
      },
      updateAsset: (id, input) =>
        updateActive((ws) => ({
          ...ws,
          assets: ws.assets.map((a) => {
            if (a.id !== id) return a
            const next: Asset = { ...a, ...normalizeAsset(input), id, updatedAt: stamp() }
            if (!input.legacyOwnership) delete next.legacyOwnership
            return next
          }),
        })),
      duplicateAsset: (id, suffix) => {
        const source = active().assets.find((a) => a.id === id)
        if (!source) return null
        const copyId = newId()
        const t = stamp()
        updateActive((ws) => {
          const index = ws.assets.findIndex((a) => a.id === id)
          const copy: Asset = {
            ...structuredClone(source),
            id: copyId,
            name: `${source.name} ${suffix}`,
            createdAt: t,
            updatedAt: t,
          }
          const assets = [...ws.assets]
          assets.splice(index + 1, 0, copy)
          return { ...ws, assets }
        })
        return copyId
      },
      deleteAsset: (id) => {
        const ws = active()
        const index = ws.assets.findIndex((a) => a.id === id)
        if (index < 0) return null
        const asset = ws.assets[index]!
        const unlinked = ws.liabilities.filter((l) => l.linkedAssetId === id).map((l) => l.id)
        updateActive((w) => ({
          ...w,
          assets: w.assets.filter((a) => a.id !== id),
          liabilities: w.liabilities.map((l) => (l.linkedAssetId === id ? withoutLink(l) : l)),
        }))
        return { asset, index, unlinked }
      },
      restoreAsset: ({ asset, index, unlinked }) =>
        updateActive((ws) => {
          if (ws.assets.some((a) => a.id === asset.id)) return ws
          const assets = [...ws.assets]
          assets.splice(Math.min(index, assets.length), 0, asset)
          const relink = new Set(unlinked)
          return {
            ...ws,
            assets,
            liabilities: ws.liabilities.map((l) => (relink.has(l.id) ? { ...l, linkedAssetId: asset.id } : l)),
          }
        }),

      addLiability: (input) => {
        const id = newId()
        const t = stamp()
        const item: Liability = { ...input, id, createdAt: t, updatedAt: t }
        updateActive((ws) => ({ ...ws, liabilities: [...ws.liabilities, input.linkedAssetId ? item : withoutLink(item)] }))
        return id
      },
      updateLiability: (id, input) =>
        updateActive((ws) => ({
          ...ws,
          liabilities: ws.liabilities.map((l) => {
            if (l.id !== id) return l
            const next: Liability = { ...l, ...input, id, updatedAt: stamp() }
            return input.linkedAssetId ? next : withoutLink(next)
          }),
        })),
      duplicateLiability: (id, suffix) => {
        const source = active().liabilities.find((l) => l.id === id)
        if (!source) return null
        const copyId = newId()
        const t = stamp()
        updateActive((ws) => {
          const index = ws.liabilities.findIndex((l) => l.id === id)
          const liabilities = [...ws.liabilities]
          liabilities.splice(index + 1, 0, {
            ...structuredClone(source),
            id: copyId,
            name: `${source.name} ${suffix}`,
            createdAt: t,
            updatedAt: t,
          })
          return { ...ws, liabilities }
        })
        return copyId
      },
      deleteLiability: (id) => {
        const ws = active()
        const index = ws.liabilities.findIndex((l) => l.id === id)
        if (index < 0) return null
        const liability = ws.liabilities[index]!
        updateActive((w) => ({ ...w, liabilities: w.liabilities.filter((l) => l.id !== id) }))
        return { liability, index }
      },
      restoreLiability: ({ liability, index }) =>
        updateActive((ws) => {
          if (ws.liabilities.some((l) => l.id === liability.id)) return ws
          const liabilities = [...ws.liabilities]
          const restored =
            liability.linkedAssetId && !ws.assets.some((a) => a.id === liability.linkedAssetId)
              ? withoutLink(liability)
              : liability
          liabilities.splice(Math.min(index, liabilities.length), 0, restored)
          return { ...ws, liabilities }
        }),

      saveSnapshot: (note) => {
        const result = createSnapshot(active(), { id: newId(), now: now(), note })
        if (result.ok) updateActive((ws) => ({ ...ws, snapshots: [...ws.snapshots, result.snapshot] }))
        return result
      },
      deleteSnapshot: (id) => {
        const snapshot = active().snapshots.find((s) => s.id === id) ?? null
        if (snapshot) updateActive((ws) => ({ ...ws, snapshots: ws.snapshots.filter((s) => s.id !== id) }))
        return snapshot
      },

      setDisplayCurrency: (currency) =>
        updateActive((ws) => ({ ...ws, settings: { ...ws.settings, displayCurrency: currency } })),
      setRate: (rate) => {
        if (!Number.isFinite(rate) || rate <= 0) return
        updateActive((ws) => ({
          ...ws,
          settings: { ...ws.settings, eurUsdRate: rate, eurUsdRateDate: todayISODate(now()) },
        }))
      },

      startDemo: (label) => set({ demo: createDemoWorkspace(label, now()) }),
      exitDemo: () => set({ demo: null }),

      mergeIntoPersonal: (incoming, adoptRate) =>
        set((s) => {
          const ws = s.personal
          const assetIds = new Set(ws.assets.map((a) => a.id))
          const liabilityIds = new Set(ws.liabilities.map((l) => l.id))
          const snapshotIds = new Set(ws.snapshots.map((x) => x.id))
          const remap = new Map<string, string>()
          const assets = incoming.assets.map((a) => {
            const id = assetIds.has(a.id) ? newId() : a.id
            if (id !== a.id) remap.set(a.id, id)
            assetIds.add(id)
            return { ...a, id }
          })
          const liabilities = incoming.liabilities.map((l) => {
            const id = liabilityIds.has(l.id) ? newId() : l.id
            liabilityIds.add(id)
            const linked = l.linkedAssetId ? (remap.get(l.linkedAssetId) ?? l.linkedAssetId) : undefined
            return linked && assetIds.has(linked) ? { ...l, id, linkedAssetId: linked } : withoutLink({ ...l, id })
          })
          // Snapshots are immutable records: the same id means the same snapshot.
          const snapshots = incoming.snapshots.filter((x) => !snapshotIds.has(x.id))
          const settings =
            ws.settings.eurUsdRate === null && adoptRate !== null
              ? { ...ws.settings, eurUsdRate: adoptRate, eurUsdRateDate: todayISODate(now()) }
              : ws.settings
          return {
            personal: {
              assets: [...ws.assets, ...assets],
              liabilities: [...ws.liabilities, ...liabilities],
              snapshots: [...ws.snapshots, ...snapshots],
              settings,
            },
          }
        }),
      replacePersonal: (next, reason, force = false) => {
        const guard = guardedBackup(reason, force)
        if (guard.ok) set({ personal: next })
        return guard
      },
      clearPersonal: (force = false) => {
        const guard = guardedBackup('beforeClear', force)
        if (guard.ok) set((s) => ({ personal: { ...emptyWorkspace(), settings: s.personal.settings } }))
        return guard
      },
      resolveBlocked: () => {
        const p = get().persistence
        if (p.status !== 'blocked') return true
        const raw = readRaw(kv, p.key)
        if (raw !== null) {
          const backup = createBackup(kv, 'unreadable', raw, now())
          if (!backup.ok) return false
          removeKey(kv, p.key)
        }
        const saved = saveWorkspace(kv, get().personal, now())
        set((s) => ({
          persistence: saved.ok ? { status: 'ok' } : { status: 'error', reason: saved.reason },
          backupsRevision: s.backupsRevision + 1,
        }))
        return true
      },

      syncFromStorage: () => {
        if (get().persistence.status === 'blocked') return false
        const result = loadWorkspace(kv, now())
        const next = initialFrom(result, kv)
        syncing = true
        try {
          set({ personal: next.personal, persistence: next.persistence, ...(next.notice ? { notice: next.notice } : {}) })
        } finally {
          syncing = false
        }
        return true
      },

      setHideAmounts: (hide) => {
        set({ hideAmounts: hide })
        savePrefs(kv, { hideAmounts: hide })
      },
      dismissNotice: () => set({ notice: null }),
      touchBackups: () => set((s) => ({ backupsRevision: s.backupsRevision + 1 })),
    }
  })

  store.subscribe((state, prev) => {
    if (syncing || state.personal === prev.personal || state.persistence.status === 'blocked') return
    const result = saveWorkspace(kv, state.personal, now())
    const next: PersistenceState = result.ok ? { status: 'ok' } : { status: 'error', reason: result.reason }
    const current = state.persistence
    const changed =
      current.status !== next.status ||
      (current.status === 'error' && next.status === 'error' && current.reason !== next.reason)
    if (changed) store.setState({ persistence: next })
  })

  return store
}

// ---------------------------------------------------------------------------
// App singleton + hooks
// ---------------------------------------------------------------------------

export const appKV = getBrowserStorage()
export const wealthStore = createWealthStore({ kv: appKV })

export function useWealth<T>(selector: (state: WealthState) => T): T {
  return useStore(wealthStore, selector)
}

/** The workspace currently on screen: demo when active, otherwise personal. */
export const useWorkspace = () => useWealth((s) => s.demo ?? s.personal)
export const useIsDemo = () => useWealth((s) => s.demo !== null)
export const useSettings = () => useWealth((s) => (s.demo ?? s.personal).settings)
