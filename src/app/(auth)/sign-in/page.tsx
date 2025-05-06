"use client"

import Link from "next/link"
import { SignIn, useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

function SignInWithConvex() {
  const { isLoaded, userId } = useAuth();
  const createUser = useMutation(api.users.createUser);

  const handleSignIn = async (user: any) => {
    if (!user) return;
    
    try {
      await createUser({
        name: user.firstName + " " + user.lastName,
        email: user.emailAddresses[0].emailAddress,
        clerkId: user.id,
        imageUrl: user.imageUrl,
      });
    } catch (error) {
      console.error("Error creating user in Convex:", error);
    }
  };

  return (
    <SignIn 
      routing="hash"
      appearance={{
        variables: {
          colorPrimary: 'hsl(145 3% 39%)',
          colorText: 'hsl(145 3% 39%)',
          colorBackground: 'hsl(0 0% 100%)',
          colorInputBackground: 'hsl(0 0% 100%)',
          colorInputText: 'hsl(145 3% 39%)',
          borderRadius: '0.5rem'
        },
        elements: {
          rootBox: 'w-full',
          card: 'bg-background rounded-2xl shadow-xl p-6 md:p-8 border-none',
          headerTitle: 'text-2xl font-bold text-foreground',
          headerSubtitle: 'text-sm text-muted-foreground',
          socialButtonsBlockButton: 'bg-card border border-border hover:bg-secondary text-foreground',
          socialButtonsBlockButtonText: 'font-medium',
          dividerText: 'text-xs text-muted-foreground',
          formFieldLabel: 'text-sm font-medium text-foreground',
          formFieldInput: 'rounded-lg border border-border focus:border-primary focus:ring-primary bg-input',
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2.5',
          footerActionText: 'text-sm text-muted-foreground',
          footerActionLink: 'text-primary hover:text-primary/90 font-medium',
        }
      }}
      signUpUrl="/sign-up"
      redirectUrl="/"
      afterSignInUrl="/"
    />
  );
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
          <SignInWithConvex />
        </motion.div>
      </motion.div>
    </div>
  )
} 