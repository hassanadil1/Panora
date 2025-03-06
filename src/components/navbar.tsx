"use client"

import Link from "next/link"
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const routes = [
  {
    label: "Home",
    href: "/",
  },
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
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold">RealtorsHub</h1>
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
                    ? "text-black dark:text-white"
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
                      ? "text-black dark:text-white"
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
          <ModeToggle />
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
            <Button asChild>
              <SignInButton mode="modal">
                <span>Sign In</span>
              </SignInButton>
            </Button>
          </SignedOut>
        </div>
      </div>
    </div>
  )
} 