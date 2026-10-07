"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Menu, Heart, PlusSquare } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetDescription,
} from "@/components/ui/sheet"
import { useState } from "react"

const routes = [
  {
    label: "Buy",
    href: "/buy",
  },
  {
    label: "Rent",
    href: "/rent",
  },
  {
    label: "Sell",
    href: "/list-property",
  },
  {
    label: "Virtual Tours",
    href: "/virtual-tours",
  },
  {
    label: "Our Services",
    href: "/our-services",
  },
  {
    label: "Properties",
    href: "/properties",
  },
  {
    label: "Properties Sold",
    href: "/properties-sold",
  },
  {
    label: "Sell It For Me",
    href: "/sell-it-for-me",
  },
]

// After routes declaration, add authenticated routes
const authenticatedRoutes = [
  {
    label: "Favorites",
    href: "/favorites",
    icon: <Heart className="h-4 w-4 mr-1" />,
  },
  {
    label: "List Property",
    href: "/list-property",
    icon: <PlusSquare className="h-4 w-4 mr-1" />,
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, profile, displayName, signOut } = useAuth()

  return (
    <div className="border-b bg-card">
      <div className="flex h-16 items-center px-4 container">
        <Link href="/" className="flex items-center">
          <img 
            src="/panoralogo no bg.png" 
            alt="Panora" 
            className="h-8 w-auto"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center ml-auto gap-6">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            ))}
            
            {profile && authenticatedRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary flex items-center",
                    pathname === route.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {route.icon}
                  {route.label}
                </Link>
              ))}
          </nav>
          
          {profile ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{displayName}</span>
              <Button size="sm" variant="outline" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <Button asChild size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Navigation - Fixed to be truly hidden on md screens and up */}
        <div className="flex md:hidden items-center ml-auto">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Navigation Menu</SheetTitle>
                <SheetDescription className="text-left">
                  Browse Panora's property services
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex flex-col gap-6 pt-6">
                {profile && (
                  <div className="flex items-center justify-between gap-3 pb-4 border-b">
                    <div className="text-sm">
                      <p className="font-medium">{displayName}</p>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => signOut()}>
                      Sign out
                    </Button>
                  </div>
                )}
                
                <nav className="flex flex-col space-y-4">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "text-base font-medium transition-colors hover:text-primary p-2",
                        pathname === route.href
                          ? "text-foreground bg-accent/50 rounded-md"
                          : "text-muted-foreground"
                      )}
                    >
                      {route.label}
                    </Link>
                  ))}
                </nav>
                
                {profile && authenticatedRoutes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "text-base font-medium transition-colors hover:text-primary p-2 flex items-center",
                        pathname === route.href
                          ? "text-foreground bg-accent/50 rounded-md"
                          : "text-muted-foreground"
                      )}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  ))}
                
                {!profile && (
                  <div className="pt-6 border-t">
                    <Button asChild className="w-full">
                      <Link href="/sign-in" onClick={() => setOpen(false)}>Sign In</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
} 