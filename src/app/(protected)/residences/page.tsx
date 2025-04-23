"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { MapPin, Bed, Bath, Waves, Heart, MessageSquare, Home, User, CreditCard, Settings } from "lucide-react"
import Link from "next/link"

// Mock residence properties data
const residenceProperties = [
  {
    id: 1,
    title: "The Naka Phuket Villa",
    location: "Phuket, Thailand",
    price: 243,
    beds: 2,
    baths: 1,
    hasPool: true,
    rating: 4.8,
    reviews: 347,
    moveInDate: "05/15/2023",
    leaseEnds: "05/14/2024",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80"
  },
  {
    id: 2,
    title: "Banyan Tree Samui",
    location: "Koh Samui, Thailand",
    price: 150,
    beds: 1,
    baths: 1,
    hasPool: true,
    rating: 4.5,
    reviews: 321,
    moveInDate: "06/01/2023",
    leaseEnds: "05/31/2024",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 3,
    title: "Koh Kood Beach Resort",
    location: "Koh Kood, Thailand",
    price: 170,
    beds: 2,
    baths: 1,
    hasPool: true,
    rating: 4.9,
    reviews: 134,
    moveInDate: "07/10/2023",
    leaseEnds: "07/09/2024",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 4,
    title: "The Datai Langkawi",
    location: "Langkawi, Malaysia",
    price: 213,
    beds: 2,
    baths: 1,
    hasPool: true,
    rating: 4.9,
    reviews: 567,
    moveInDate: "04/22/2023",
    leaseEnds: "04/21/2024",
    image: "https://images.unsplash.com/photo-1610530460358-dadd8d5e2a0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 5,
    title: "Amarterra Villas Bali Nusa Dua",
    location: "Nusa Dua, Bali, Indonesia",
    price: 190,
    beds: 1,
    baths: 1,
    hasPool: true,
    rating: 4.8,
    reviews: 322,
    moveInDate: "09/01/2023",
    leaseEnds: "08/31/2024",
    image: "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
  },
  {
    id: 6,
    title: "Banyan Tree Ungasan",
    location: "Ungasan, Bali, Indonesia",
    price: 150,
    beds: 1,
    baths: 1,
    hasPool: true,
    rating: 4.9,
    reviews: 324,
    moveInDate: "08/15/2023",
    leaseEnds: "08/14/2024",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
]

// Navigation items for the sidebar
const navigationItems = [
  { name: "Favorites", href: "/favorites", icon: <Heart className="h-5 w-5" /> },
  { name: "Applications", href: "/applications", icon: <MessageSquare className="h-5 w-5" /> },
  { name: "Residences", href: "/residences", icon: <Home className="h-5 w-5" /> },
  { name: "Billing History", href: "/billing", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Payment Methods", href: "/payment-methods", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> }
]

export default function ResidencesPage() {
  const [residences] = useState(residenceProperties)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateTimeLeft = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = Math.abs(end.getTime() - now.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card h-screen sticky top-0 hidden md:block">
          <div className="p-4 border-b">
            <Link href="/">
              <div className="flex items-center justify-center">
                <img 
                  src="/Fav icon No Black BG.png" 
                  alt="Panora Logo" 
                  className="h-8 w-auto"
                />
              </div>
            </Link>
          </div>
          
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Syarip Yunus</p>
                <p className="text-xs text-muted-foreground">Renter</p>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <div className="flex flex-col space-y-1">
              {navigationItems.map((item, i) => (
                <Link 
                  key={i} 
                  href={item.href}
                  className={`px-3 py-2 rounded-md flex items-center gap-3 text-sm ${
                    item.name === "Residences" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="container py-8 px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Residences</h1>
                <p className="text-muted-foreground">Your current rental properties</p>
              </div>
              <div className="flex gap-2 items-center">
                <Button size="sm" variant="outline">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search Rentals
                </Button>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {residences.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-card text-foreground">Superhost</Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-card text-foreground">Self Check-in</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/properties/${property.id}`}>
                          <h3 className="font-bold text-lg hover:text-primary">{property.title}</h3>
                        </Link>
                        <div className="flex items-center gap-1 text-sm">
                          <StarIcon className="h-4 w-4 text-yellow-500" fill="currentColor" />
                          <span>{property.rating}</span>
                          <span className="text-muted-foreground">({property.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.location}
                      </div>

                      <div className="border-t border-b py-3 mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Move-in Date</p>
                            <p className="text-sm font-medium">{formatDate(property.moveInDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Lease Ends</p>
                            <p className="text-sm font-medium">{formatDate(property.leaseEnds)}</p>
                          </div>
                          <div className="col-span-2 mt-2">
                            <p className="text-xs text-muted-foreground">Lease Time Left</p>
                            <div className="w-full bg-muted h-2 rounded-full mt-1">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ 
                                  width: `${(calculateTimeLeft(property.leaseEnds) / 365) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-right mt-1">{calculateTimeLeft(property.leaseEnds)} days left</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Bed className="h-4 w-4" />
                            <span>{property.beds} Bed</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Bath className="h-4 w-4" />
                            <span>{property.baths} Bath</span>
                          </div>
                          {property.hasPool && (
                            <div className="flex items-center gap-1 text-sm">
                              <Waves className="h-4 w-4" />
                              <span>Pool</span>
                            </div>
                          )}
                        </div>
                        <p className="font-bold">${property.price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">Submit Maintenance</Button>
                      <Button size="sm" className="flex-1">Contact Landlord</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load more button */}
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="gap-2">
                <LoadMoreIcon className="h-5 w-5" />
                Load more properties
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Icons
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function LoadMoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );
} 