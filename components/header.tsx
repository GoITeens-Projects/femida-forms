'use client'

import Link from 'next/link'
import { useAuth } from './auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Shield, FileText } from 'lucide-react'

export function Header() {
  const { user, loading } = useAuth()

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Femida Forms</span>
        </Link>

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href="/api/auth/logout" className="flex cursor-pointer items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
