"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { FormEvent, useState } from "react"
import { createClient } from "@/lib/supabase/client"

function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setPending(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    router.push("/")
    router.refresh()
  }

  const onMagicLink = async () => {
    if (!email) {
      setError("Enter your email first.")
      return
    }
    setPending(true)
    setError("")
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    setPending(false)
    setError(otpError ? otpError.message : "Check your email for a sign-in link.")
  }

  const onGoogle = async () => {
    setPending(true)
    setError("")
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (oauthError) setError(oauthError.message)
    setPending(false)
  }

  return (
    <form onSubmit={onSubmit} className="w-full bg-background rounded-2xl shadow-xl p-6 md:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">Use the email and password for your Panora account.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in with password"}
      </Button>
      <Button type="button" variant="secondary" className="w-full" disabled={pending} onClick={onMagicLink}>
        Email me a magic link
      </Button>
      <Button type="button" variant="outline" className="w-full" disabled={pending} onClick={onGoogle}>
        Continue with Google
      </Button>
    </form>
  )
}

export default function SignInPage() {
  const [videoError, setVideoError] = useState(false);
  
  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      {/* Left side - Hidden on small screens, takes full height */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:flex-col justify-between p-12 bg-secondary h-full relative overflow-hidden"
      >
        {/* Simple background video implementation */}
        {!videoError ? (
          <video 
            className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
            autoPlay
            muted
            loop
            playsInline
            src="/panora_demo.mp4"
            onError={() => setVideoError(true)}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-secondary via-secondary/90 to-primary/20 opacity-60 z-0"></div>
        )}
        
        {/* Content positioned above the background */}
        <div className="z-10 relative">
          <div className="flex items-center gap-2">
            <motion.span 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text"
            >
              Panora
            </motion.span>
          </div>
        </div>
        
        <div className="space-y-8 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-secondary-foreground">
            High-Quality 360° Virtual Tours</h2>
            <p className="text-muted-foreground text-lg">Transforming Spaces into Immersive 360° Virtual Tours for Real Estate & Businesses.</p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 z-10 relative">
          {[1, 2, 3, 4].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i, duration: 0.5 }}
              className="h-20 rounded-md bg-muted/80"
            />
          ))}
        </div>
      </motion.div>
      
      {/* Right side - Takes full height, centers content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center p-6 pt-12 md:p-12 bg-background h-full"
      >
        {/* Buttons in normal flow at the top */}
        <div className="w-full max-w-md flex items-center justify-end gap-4 mb-8">
          <Link href="/sign-up">
            <Button variant="outline" className="rounded-full text-sm">
              Sign Up
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 rounded-full text-sm text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Enter as Guest
            </Button>
          </Link>
        </div>
        
        {/* Form Container */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <SignInForm />
        </motion.div>
      </motion.div>
    </div>
  )
} 