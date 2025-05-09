import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Instagram, Home, MessageCircle, User, Shield, Search, PlusSquare, LogOut } from "lucide-react"
import { UserNav } from "@/components/user-nav"

export function Navbar() {
  // This would normally check if the user is authenticated
  // For now, we'll determine based on the URL path
  const isAuthenticated = typeof window !== "undefined" && window.location.pathname.includes("/dashboard")

  return (
    <header className="border-b sticky top-0 bg-black z-10 instagram-shadow">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="font-bold text-xl flex items-center">
            <Instagram className="h-7 w-7 mr-2 instagram-gradient-text" />
            <span className="hidden md:inline font-semibold text-white">
              <span>Insta</span>
              <span className="instagram-gradient-text">Flow</span>
            </span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              <div className="relative px-3">
                <div className="absolute inset-0 rounded-md bg-gray-100 dark:bg-gray-800"></div>
                <Search className="h-4 w-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent border-none pl-8 pr-4 py-2 text-sm outline-none relative w-64 rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <nav className="flex items-center space-x-5">
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary relative group text-white">
                <Home className="h-6 w-6" />
                <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Home</span>
              </Link>
              <Link href="/dashboard/messages" className="text-sm font-medium transition-colors hover:text-primary relative group text-white">
                <MessageCircle className="h-6 w-6" />
                <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Messages</span>
              </Link>
              <Link href="/dashboard/accounts" className="text-sm font-medium transition-colors hover:text-primary relative group text-white">
                <User className="h-6 w-6" />
                <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Accounts</span>
              </Link>
              <Link href="/dashboard/proxies" className="text-sm font-medium transition-colors hover:text-primary relative group text-white">
                <Shield className="h-6 w-6" />
                <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Proxies</span>
              </Link>
              <div className="border-l h-6 mx-1 border-gray-600"></div>
              <ModeToggle />
              <Link href="/dashboard/accounts/add" className="relative group text-white">
                <PlusSquare className="h-6 w-6" />
                <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
              </Link>
              <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary relative group text-white">
                <LogOut className="h-6 w-6" />
                <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
              </Link>
            </nav>
          ) : (
            <div className="flex gap-3 items-center">
              <ModeToggle />
              <Link href="/login" className="navbar-button">Log In</Link>
              <Link href="/signup" className="navbar-button">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
