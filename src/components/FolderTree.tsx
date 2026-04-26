'use client'

import { useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Link, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'
import { Folder as FolderType, UrlItem } from '@/lib/types'
import {
  deleteFolder, renameFolder, deleteUrl, renameUrl,
  getFolders, getUrls, moveUrl, moveFolder,
} from '@/lib/storage'
import {
  deleteFolderRemote, renameFolderRemote, deleteUrlRemote, renameUrlRemote,
  moveUrlRemote, moveFolderRemote,
} from '@/lib/supabase-storage'
import RenameDialog from './RenameDialog'
import { cn } from '@/lib/utils'

type Props = {
  parentId: string | null
  depth?: number
}

// Draggable URL item
function DraggableUrl({ item }: { item: UrlItem }) {
  const { user, setUrls, reload, selectMode, selectedIds, toggleSelect } = useApp()
  const [renaming, setRenaming] = useState(false)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `url-${item.id}`,
    data: { type: 'url', id: item.id },
    disabled: selectMode,
  })

  const handleDelete = async () => {
    if (!confirm(`「${item.name}」を削除しますか？`)) return
    if (user) { await deleteUrlRemote(item.id); reload() }
    else { deleteUrl(item.id); setUrls(getUrls()) }
  }

  const handleRename = async (name: string) => {
    if (user) { await renameUrlRemote(item.id, name); reload() }
    else { renameUrl(item.id, name); setUrls(getUrls()) }
    setRenaming(false)
  }

  const isSelected = selectedIds.has(item.id)

  return (
    <>
      <div
        ref={setNodeRef}
        className={cn(
          'flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-muted group touch-none',
          isDragging && 'opacity-40',
          isSelected && 'bg-primary/10'
        )}
      >
        {selectMode ? (
          <button onClick={() => toggleSelect(item.id)} className="flex items-center gap-1.5 flex-1 min-w-0">
            <input type="checkbox" readOnly checked={isSelected} className="w-4 h-4 shrink-0 accent-primary" />
            <Link className="w-4 h-4 shrink-0 text-blue-500" />
            <span className="text-sm truncate">{item.name}</span>
          </button>
        ) : (
          <>
            <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-muted-foreground">
              <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                <circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/>
                <circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
                <circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/>
              </svg>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 flex-1 min-w-0">
              <Link className="w-4 h-4 shrink-0 text-blue-500" />
              <span className="text-sm truncate">{item.name}</span>
            </a>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setRenaming(true)}>
                <Pencil className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDelete}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}
      </div>
      {renaming && (
        <RenameDialog open initialName={item.name} onClose={() => setRenaming(false)} onSave={handleRename} />
      )}
    </>
  )
}

// Droppable + Draggable folder
function DraggableFolder({ folder, depth }: { folder: FolderType; depth: number }) {
  const { user, folders, setFolders, setUrls, reload, selectMode, selectedIds, toggleSelect } = useApp()
  const [open, setOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', id: folder.id },
    disabled: selectMode,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-folder-${folder.id}`,
    data: { type: 'folder', id: folder.id },
  })

  const handleDelete = async () => {
    if (!confirm(`「${folder.name}」を削除しますか？中のURLも全て削除されます。`)) return
    if (user) { await deleteFolderRemote(folder.id, folders); reload() }
    else { deleteFolder(folder.id); setFolders(getFolders()); setUrls(getUrls()) }
  }

  const handleRename = async (name: string) => {
    if (user) { await renameFolderRemote(folder.id, name); reload() }
    else { renameFolder(folder.id, name); setFolders(getFolders()) }
    setRenaming(false)
  }

  const isSelected = selectedIds.has(folder.id)

  return (
    <>
      <div
        ref={node => { setDragRef(node); setDropRef(node) }}
        className={cn(
          'rounded-lg transition-colors',
          isDragging && 'opacity-40',
          isOver && !isDragging && 'bg-primary/10 ring-2 ring-primary/30',
          isSelected && 'bg-primary/10'
        )}
      >
        <div className="flex items-center gap-1 py-1.5 px-2 group">
          {selectMode ? (
            <button onClick={() => toggleSelect(folder.id)} className="flex items-center gap-1.5 flex-1 min-w-0">
              <input type="checkbox" readOnly checked={isSelected} className="w-4 h-4 shrink-0 accent-primary" />
              {open ? <FolderOpen className="w-4 h-4 shrink-0 text-yellow-500" /> : <Folder className="w-4 h-4 shrink-0 text-yellow-500" />}
              <span className="text-sm font-medium truncate">{folder.name}</span>
            </button>
          ) : (
            <>
              <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-muted-foreground touch-none">
                <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                  <circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/>
                  <circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
                  <circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/>
                </svg>
              </div>
              <button onClick={() => setOpen(p => !p)} className="flex items-center gap-1.5 flex-1 min-w-0">
                {open ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
                {open ? <FolderOpen className="w-4 h-4 shrink-0 text-yellow-500" /> : <Folder className="w-4 h-4 shrink-0 text-yellow-500" />}
                <span className="text-sm font-medium truncate">{folder.name}</span>
              </button>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setRenaming(true)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDelete}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </>
          )}
        </div>
        {open && <FolderTree parentId={folder.id} depth={depth + 1} />}
      </div>
      {renaming && (
        <RenameDialog open initialName={folder.name} onClose={() => setRenaming(false)} onSave={handleRename} />
      )}
    </>
  )
}

export default function FolderTree({ parentId, depth = 0 }: Props) {
  const { folders, urls } = useApp()

  const childFolders = folders.filter(f => f.parent_id === parentId)
  const childUrls = urls.filter(u => u.folder_id === parentId)

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-border pl-2' : ''}>
      {childFolders.map(folder => (
        <DraggableFolder key={folder.id} folder={folder} depth={depth} />
      ))}
      {childUrls.map(item => (
        <DraggableUrl key={item.id} item={item} />
      ))}
    </div>
  )
}
