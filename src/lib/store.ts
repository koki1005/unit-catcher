'use client'

import { createContext, useContext } from 'react'
import { Folder, UrlItem, User } from './types'

export type AppContextType = {
  user: User | null
  setUser: (u: User | null) => void
  folders: Folder[]
  urls: UrlItem[]
  setFolders: (f: Folder[]) => void
  setUrls: (u: UrlItem[]) => void
  reload: () => void
}

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  folders: [],
  urls: [],
  setFolders: () => {},
  setUrls: () => {},
  reload: () => {},
})

export function useApp() {
  return useContext(AppContext)
}
