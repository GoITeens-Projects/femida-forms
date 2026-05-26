"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Shield, FileText } from "lucide-react";
import { ThemeToggle } from "./toggle-theme";
import Image from "next/image";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icon.svg"
            alt="Femida Forms Icon"
            width="32"
            height="32"
          />
          <span className="text-xl font-bold">Femida Forms</span>
        </Link>

        <nav className="flex items-center gap-4">
          <ThemeToggle />
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Адмін панель
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a
                      href="/api/auth/logout"
                      className="flex cursor-pointer items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Вийти
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button>Увійти</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
