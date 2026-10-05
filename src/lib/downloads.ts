import type { Workspace } from '@/domain/types'
import { exportCsv } from './csv'
import { downloadText, fileStamp, serializeBackup } from './importFile'

const prefix = (demo: boolean) => (demo ? '3asywealth-demo' : '3asywealth')

export function downloadBackup(ws: Workspace, demo = false) {
  downloadText(`${prefix(demo)}-backup-${fileStamp()}.json`, serializeBackup(ws), 'application/json')
}

export function downloadCsv(ws: Workspace, demo = false) {
  downloadText(`${prefix(demo)}-${fileStamp()}.csv`, exportCsv(ws.assets, ws.liabilities), 'text/csv;charset=utf-8')
}

export function downloadRaw(name: string, raw: string) {
  downloadText(name, raw, 'application/json')
}
