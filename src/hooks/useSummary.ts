import { summarizeCached, type Summary } from '@/domain/calc'
import { useWorkspace } from '@/stores/wealthStore'

/** Summary of the workspace on screen. Memoised per workspace object and currency. */
export function useSummary(): Summary {
  const ws = useWorkspace()
  return summarizeCached(ws)
}
