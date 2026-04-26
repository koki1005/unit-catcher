'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/lib/store'
import { registerUser, loginUser } from '@/lib/supabase-storage'
import { LogOut, UserCircle2 } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

export default function AccountSheet({ open, onClose }: Props) {
  const { user, setUser } = useApp()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [accountName, setAccountName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (accountName.length < 8) {
      setError('アカウント名は8文字以上で入力してください')
      return
    }
    setLoading(true)
    try {
      if (tab === 'register') {
        const { user: newUser, error: err } = await registerUser(accountName.trim())
        if (err) { setError(err); return }
        setUser(newUser!)
      } else {
        const { user: found, error: err } = await loginUser(accountName.trim())
        if (err) { setError(err); return }
        setUser(found!)
      }
      setAccountName('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>アカウント</SheetTitle>
        </SheetHeader>

        {user ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
              <UserCircle2 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">ログイン中</p>
                <p className="font-semibold">{user.account_name}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full text-destructive border-destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">アカウントなしでもご利用いただけます（ゲストモード）</p>

            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'login' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setTab('login')}
              >ログイン</button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'register' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setTab('register')}
              >新規登録</button>
            </div>

            <div className="space-y-1">
              <Label>アカウント名（8文字以上）</Label>
              <Input
                placeholder="my_account_name"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={handleSubmit} disabled={loading || !accountName.trim()}>
              {tab === 'login' ? 'ログイン' : '登録する'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
