import { create } from 'zustand'
import type { AssetCategory } from '@/domain/types'

export type ItemDialogState =
  | { open: false }
  | { open: true; mode: 'add'; kind?: 'asset' | 'liability'; category?: AssetCategory }
  | { open: true; mode: 'edit'; kind: 'asset' | 'liability'; id: string }

interface UiState {
  item: ItemDialogState
  rateOpen: boolean
  openAdd: (preset?: { kind?: 'asset' | 'liability'; category?: AssetCategory }) => void
  openEdit: (kind: 'asset' | 'liability', id: string) => void
  closeItem: () => void
  setRateOpen: (open: boolean) => void
}

export const useUi = create<UiState>()((set) => ({
  item: { open: false },
  rateOpen: false,
  openAdd: (preset = {}) => set({ item: { open: true, mode: 'add', ...preset } }),
  openEdit: (kind, id) => set({ item: { open: true, mode: 'edit', kind, id } }),
  closeItem: () => set({ item: { open: false } }),
  setRateOpen: (rateOpen) => set({ rateOpen }),
}))
