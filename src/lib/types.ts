export type Folder = {
  id: string
  user_id: string | null
  name: string
  parent_id: string | null
  position: number | null
  created_at: string
}

export type UrlItem = {
  id: string
  user_id: string | null
  folder_id: string | null
  name: string
  url: string
  position: number | null
  created_at: string
}

export type User = {
  id: string
  account_name: string
  created_at: string
}

export type SortableItem =
  | { type: 'folder'; item: Folder; sortId: string; pos: number }
  | { type: 'url'; item: UrlItem; sortId: string; pos: number }
