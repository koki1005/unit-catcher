'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Link, MoreVertical, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'
import { Folder as FolderType, UrlItem } from '@/lib/types'
import {
  deleteFolder, renameFolder, deleteUrl, renameUrl,
  getFolders, getUrls,
} from '@/lib/storage'
import {
  deleteFolderRemote, renameFolderRemote, deleteUrlRemote, renameUrlRemote,
} from '@/lib/supabase-storage'
import RenameDialog from './RenameDialog'

type Props = {
  parentId: string | null
  depth?: number
}

export default function FolderTree({ parentId, depth = 0 }: Props) {
  const { user, folders, urls, setFolders, setUrls, reload } = useApp()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [renaming, setRenaming] = useState<{ type: 'folder' | 'url'; id: string; name: string } | null>(null)

  const childFolders = folders.filter(f => f.parent_id === parentId)
  const childUrls = urls.filter(u => u.folder_id === parentId)

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDeleteFolder = async (folder: FolderType) => {
    if (!confirm(`「${folder.name}」を削除しますか？中のURLも全て削除されます。`)) return
    if (user) {
      await deleteFolderRemote(folder.id, folders)
      reload()
    } else {
      deleteFolder(folder.id)
      setFolders(getFolders())
      setUrls(getUrls())
    }
  }

  const handleDeleteUrl = async (item: UrlItem) => {
    if (!confirm(`「${item.name}」を削除しますか？`)) return
    if (user) {
      await deleteUrlRemote(item.id)
      reload()
    } else {
      deleteUrl(item.id)
      setUrls(getUrls())
    }
  }

  const handleRename = async (newName: string) => {
    if (!renaming) return
    if (renaming.type === 'folder') {
      if (user) {
        await renameFolderRemote(renaming.id, newName)
        reload()
      } else {
        renameFolder(renaming.id, newName)
        setFolders(getFolders())
      }
    } else {
      if (user) {
        await renameUrlRemote(renaming.id, newName)
        reload()
      } else {
        renameUrl(renaming.id, newName)
        setUrls(getUrls())
      }
    }
    setRenaming(null)
  }

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-border pl-2' : ''}>
      {childFolders.map(folder => {
        const open = expanded.has(folder.id)
        return (
          <div key={folder.id}>
            <div className="flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-muted group">
              <button onClick={() => toggle(folder.id)} className="flex items-center gap-1.5 flex-1 min-w-0">
                {open ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
                {open ? <FolderOpen className="w-4 h-4 shrink-0 text-yellow-500" /> : <Folder className="w-4 h-4 shrink-0 text-yellow-500" />}
                <span className="text-sm font-medium truncate">{folder.name}</span>
              </button>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setRenaming({ type: 'folder', id: folder.id, name: folder.name })}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDeleteFolder(folder)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {open && <FolderTree parentId={folder.id} depth={depth + 1} />}
          </div>
        )
      })}

      {childUrls.map(item => (
        <div key={item.id} className="flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-muted group">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 flex-1 min-w-0"
          >
            <Link className="w-4 h-4 shrink-0 text-blue-500" />
            <span className="text-sm truncate">{item.name}</span>
          </a>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setRenaming({ type: 'url', id: item.id, name: item.name })}>
              <Pencil className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDeleteUrl(item)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}

      {renaming && (
        <RenameDialog
          open
          initialName={renaming.name}
          onClose={() => setRenaming(null)}
          onSave={handleRename}
        />
      )}
    </div>
  )
}
