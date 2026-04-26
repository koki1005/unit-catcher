'use client'

import { useState } from 'react'
import { Plus, FolderPlus, UserCircle2, Link2 } from 'lucide-react'
import FolderTree from '@/components/FolderTree'
import AddSheet from '@/components/AddSheet'
import CreateFolderDialog from '@/components/CreateFolderDialog'
import AccountSheet from '@/components/AccountSheet'
import { useApp } from '@/lib/store'

export default function HomePage() {
  const { user, folders, urls } = useApp()
  const [addOpen, setAddOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  const isEmpty = folders.length === 0 && urls.length === 0

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg tracking-tight">Unit Catcher</h1>
        </div>
        <button
          onClick={() => setAccountOpen(true)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <UserCircle2 className="w-5 h-5" />
          <span className="max-w-[120px] truncate">
            {user ? user.account_name : 'ゲスト'}
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Link2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">URLがまだありません</p>
              <p className="text-sm text-muted-foreground mt-1">右下の ＋ ボタンから追加してください</p>
            </div>
          </div>
        ) : (
          <FolderTree parentId={null} />
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-20">
        {fabOpen && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-foreground text-background rounded-full px-2.5 py-1 font-medium shadow">フォルダを作成</span>
              <button
                onClick={() => { setFolderOpen(true); setFabOpen(false) }}
                className="w-12 h-12 rounded-full bg-muted shadow-lg flex items-center justify-center hover:bg-muted/80 transition-colors border border-border"
              >
                <FolderPlus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-foreground text-background rounded-full px-2.5 py-1 font-medium shadow">URLを追加</span>
              <button
                onClick={() => { setAddOpen(true); setFabOpen(false) }}
                className="w-12 h-12 rounded-full bg-muted shadow-lg flex items-center justify-center hover:bg-muted/80 transition-colors border border-border"
              >
                <Link2 className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setFabOpen(prev => !prev)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:opacity-90 transition-all"
          style={{ transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay when FAB open */}
      {fabOpen && (
        <div className="fixed inset-0 z-10 bg-black/20" onClick={() => setFabOpen(false)} />
      )}

      <AddSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <CreateFolderDialog open={folderOpen} onClose={() => setFolderOpen(false)} />
      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  )
}
