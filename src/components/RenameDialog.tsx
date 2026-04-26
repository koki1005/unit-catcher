'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  open: boolean
  initialName: string
  onClose: () => void
  onSave: (name: string) => void
}

export default function RenameDialog({ open, initialName, onClose, onSave }: Props) {
  const [name, setName] = useState(initialName)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="w-[90vw] max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>名前を変更</DialogTitle>
        </DialogHeader>
        <Input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={() => name.trim() && onSave(name.trim())} disabled={!name.trim()}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
