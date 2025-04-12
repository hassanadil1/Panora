"use client"

import Link from "next/link"
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const routes = [
  {
    label: "Properties",
    href: "/properties",
  },
  {
    label: "List Property",
    href: "/properties/list-property",
    protected: true,
  },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-card">
      <div className="flex h-16 items-center px-4 container">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold">Panora</h1>
        </Link>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 flex-1">
          {routes.map((route) => (
            !route.protected ? (
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
            ) : (
              <SignedIn key={route.href}>
                <Link
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
              </SignedIn>
            )
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
    </div>
  )
} 