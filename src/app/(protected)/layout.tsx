"use client";

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  
  // If auth isn't loaded yet, show a loading spinner or placeholder
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If user isn't signed in, redirect to sign in
  if (!userId) {
    return <RedirectToSignIn />;
  }

  // If user is signed in, show the protected layout
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
} 