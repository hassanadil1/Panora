"use client"

import Link from "next/link"
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
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
    href: "/sell",
  },
  {
    label: "Virtual Tours",
    href: "/virtual-tours",
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

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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
          </nav>
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
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
            </SignedOut>
          </div>
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
                <SignedIn>
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "h-12 w-12"
                        }
                      }}
                    />
                    <div className="text-sm">
                      <p className="font-medium">Your Account</p>
                      <p className="text-muted-foreground">Manage your profile</p>
                    </div>
                  </div>
                </SignedIn>
                
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
                
                <SignedOut>
                  <div className="pt-6 border-t">
                    <Button asChild className="w-full">
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </div>
                </SignedOut>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
} 