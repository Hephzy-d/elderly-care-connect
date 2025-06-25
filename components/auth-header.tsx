"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Bell, Settings, LogOut, User } from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function AuthHeader() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getDashboardLink = () => {
    if (user?.profile?.role === "caregiver") {
      return "/caregiver/dashboard"
    }
    return "/client/dashboard"
  }

  if (loading) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Elderly Care Connect</span>
          </Link>
          <div className="w-20 h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Elderly Care Connect</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">
            Services
          </Link>
          <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
            How It Works
          </Link>
          <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user.profile?.first_name?.[0]}
                        {user.profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user.profile?.first_name} {user.profile?.last_name}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
