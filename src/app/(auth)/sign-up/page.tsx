"use client"

import Link from "next/link"
import { SignUp } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"

export default function SignUpPage() {
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
              className="text-3xl font-semibold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text"
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
            <h2 className="text-3xl font-bold mb-4 text-secondary-foreground">Start Your Property Journey</h2>
            <p className="text-muted-foreground text-lg">Join thousands of users listing and discovering properties every day.</p>
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
        className="flex flex-col items-center justify-center p-6 md:p-12 bg-background relative h-full"
      >
        {/* Top right buttons (positioned absolutely) */}
        <div className="w-full flex items-center justify-end gap-4 absolute top-6 right-6 px-6">
          <Link href="/sign-in">
            <Button variant="outline" className="rounded-full">
              Sign In
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 rounded-full text-muted-foreground">
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
          className="w-full max-w-md mt-16 md:mt-4"
        >
          <SignUp 
            appearance={{
              variables: {
                colorPrimary: 'hsl(145 3% 39%)',
                colorText: 'hsl(145 3% 39%)',
                colorInputBackground: 'hsl(0 0% 100%)',
                colorInputText: 'hsl(145 3% 39%)',
                borderRadius: '0.5rem'
              },
              elements: {
                rootBox: 'w-full',
                card: 'bg-background p-6 md:p-8',
                headerTitle: 'text-2xl font-bold text-primary',
                headerSubtitle: 'text-sm text-muted-foreground',
                socialButtonsBlockButton: 'bg-input border border-border hover:bg-secondary text-foreground',
                socialButtonsBlockButtonText: 'font-medium',
                dividerText: 'text-xs text-muted-foreground',
                formFieldLabel: 'text-sm font-medium text-foreground',
                formFieldInput: 'rounded-lg border border-border focus:border-primary focus:ring-primary bg-input',
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2.5',
                footerActionText: 'text-sm text-muted-foreground',
                footerActionLink: 'text-primary hover:text-primary/90 font-medium',
              }
            }}
            signInUrl="/sign-in"
            redirectUrl="/"
          />
        </motion.div>
      </motion.div>
    </div>
  )
} 