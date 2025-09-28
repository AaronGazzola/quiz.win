"use client"

import React, { useState } from "react"
import { LogOut, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExtendedUser } from "@/app/layout.types"

interface UserAvatarMenuProps {
  user: ExtendedUser | null
  onSignOut: () => void
  isLoading?: boolean
}

export function UserAvatarMenu({ user, onSignOut, isLoading = false }: UserAvatarMenuProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getInitials = (email: string | undefined) => {
    if (!email) return "??"
    return email.slice(0, 2).toUpperCase()
  }

  const setLightTheme = () => setTheme("light")
  const setDarkTheme = () => setTheme("dark")
  const setSystemTheme = () => setTheme("system")

  const getThemeIcon = () => {
    if (theme === "dark") return <Moon className="mr-2 h-4 w-4" />
    if (theme === "light") return <Sun className="mr-2 h-4 w-4" />
    return <Monitor className="mr-2 h-4 w-4" />
  }

  const getThemeLabel = () => {
    if (theme === "dark") return "Dark"
    if (theme === "light") return "Light"
    return "System"
  }

  if (!mounted || isLoading || !user) {
    return (
      <Avatar className="h-8 w-8 cursor-pointer">
        <AvatarFallback className="text-xs">
          {isLoading || !user ? <Skeleton className="h-3 w-6 rounded" /> : getInitials(user.email)}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="text-xs">
            {getInitials(user?.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            {getThemeIcon()}
            {getThemeLabel()} mode
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={setLightTheme} className="cursor-pointer">
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={setDarkTheme} className="cursor-pointer">
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={setSystemTheme} className="cursor-pointer">
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}