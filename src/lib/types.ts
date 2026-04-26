export type Folder = {
  id: string
  user_id: string | null
  name: string
  parent_id: string | null
  created_at: string
}

export type UrlItem = {
  id: string
  user_id: string | null
  folder_id: string | null
  name: string
  url: string
  created_at: string
}

export type User = {
  id: string
  account_name: string
  created_at: string
}

export type TreeNode =
  | { type: 'folder'; data: Folder; children: TreeNode[] }
  | { type: 'url'; data: UrlItem }
