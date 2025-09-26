"use client"

import React, { useState } from "react"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExtendedUser } from "@/app/layout.types"
import { RoleBadge } from "@/components/RoleBadge"

interface UserAvatarMenuProps {
  user: ExtendedUser
  onSignOut: () => void
}

export function UserAvatarMenu({ user, onSignOut }: UserAvatarMenuProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase()
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Avatar className="h-8 w-8 cursor-pointer">
        <AvatarFallback className="text-xs">
          {getInitials(user.email)}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="text-xs">
            {getInitials(user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center">
              <RoleBadge
                role={user.role === 'super-admin' ? 'super-admin' :
                      user.members?.some(m => m.role === 'admin') ? 'admin' : 'member'}
                variant="compact"
                organizationName={user.members?.[0]?.organization?.name}
              />
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === "dark" ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          {theme === "dark" ? "Light" : "Dark"} mode
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}