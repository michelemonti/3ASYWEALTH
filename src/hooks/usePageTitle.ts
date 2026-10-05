import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · 3ASYWEALTH` : '3ASYWEALTH'
  }, [title])
}
