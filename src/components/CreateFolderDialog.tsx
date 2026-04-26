'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/lib/store'
import { Folder } from '@/lib/types'
import { saveFolder, getFolders } from '@/lib/storage'
import { saveFolderRemote } from '@/lib/supabase-storage'

type Props = {
  open: boolean
  onClose: () => void
}

export default function CreateFolderDialog({ open, onClose }: Props) {
  const { user, folders, setFolders, reload } = useApp()
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<string>('root')

  const buildFolderOptions = (folders: Folder[], parentId: string | null, depth = 0): { id: string; label: string }[] => {
    return folders
      .filter(f => f.parent_id === parentId)
      .flatMap(f => [
        { id: f.id, label: '　'.repeat(depth) + f.name },
        ...buildFolderOptions(folders, f.id, depth + 1),
      ])
  }

  const folderOptions = buildFolderOptions(folders, null)

  const handleSave = async () => {
    if (!name.trim()) return
    const pid = parentId === 'root' ? null : parentId
    if (user) {
      await saveFolderRemote(user.id, name.trim(), pid)
      reload()
    } else {
      saveFolder(name.trim(), pid)
      setFolders(getFolders())
    }
    setName('')
    setParentId('root')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="w-[90vw] max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>フォルダを作成</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>フォルダ名 <span className="text-destructive">*</span></Label>
            <Input
              placeholder="例：必修科目"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleSave()}
            />
          </div>
          <div className="space-y-1">
            <Label>親フォルダ</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={parentId}
              onChange={e => setParentId(e.target.value)}
            >
              <option value="root">ルート（トップレベル）</option>
              {folderOptions.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>作成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
