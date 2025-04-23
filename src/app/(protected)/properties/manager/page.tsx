"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  MapPin, 
  Bed, 
  Bath, 
  Waves, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  User, 
  Heart, 
  MessageSquare, 
  Home, 
  CreditCard, 
  Settings,
  Pencil,
  Trash,
  Eye,
  X
} from "lucide-react"
import Link from "next/link"

// Mock properties managed by the user
const managedProperties = [
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
    status: "active",
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
    status: "active",
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
    status: "active",
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
    status: "pending",
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
    status: "active",
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
    status: "inactive",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
]

// Navigation items for the sidebar
const navigationItems = [
  { name: "Favorites", href: "/favorites", icon: <Heart className="h-5 w-5" /> },
  { name: "Applications", href: "/applications", icon: <MessageSquare className="h-5 w-5" /> },
  { name: "Residences", href: "/properties/manager", icon: <Home className="h-5 w-5" /> },
  { name: "Billing History", href: "/billing", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Payment Methods", href: "/payment-methods", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> }
]

type StatusBadgeProps = {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    case 'inactive':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function PropertyManagerPage() {
  const [properties, setProperties] = useState(managedProperties)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  const toggleMenu = (id: number) => {
    setOpenMenu(openMenu === id ? null : id)
  }

  const deleteProperty = (id: number) => {
    setProperties(properties.filter(property => property.id !== id))
    setShowDeleteConfirm(null)
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
                <p className="text-xs text-muted-foreground">Property Manager</p>
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
                <p className="text-muted-foreground">Manage your property listings</p>
              </div>
              <div className="flex gap-2 items-center">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Property
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative w-full md:w-auto md:flex-1">
                <div className="flex items-center gap-2 w-full px-4 py-2 rounded-md border bg-background">
                  <Search className="text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  All Properties
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Active
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Pending
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Inactive
                </Button>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="relative"
                >
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={property.status} />
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-card text-foreground">Self Check-in</Badge>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <div className="relative">
                          <button 
                            className="h-8 w-8 rounded-full bg-background flex items-center justify-center"
                            onClick={() => toggleMenu(property.id)}
                          >
                            <MoreVertical className="h-5 w-5 text-foreground" />
                          </button>
                          
                          {openMenu === property.id && (
                            <div className="absolute bottom-10 right-0 w-36 bg-card rounded-md shadow-lg py-1 border">
                              <Link 
                                href={`/properties/${property.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                              <Link 
                                href={`/properties/edit/${property.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                              <button 
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive w-full text-left"
                                onClick={() => setShowDeleteConfirm(property.id)}
                              >
                                <Trash className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
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
                  </Card>
                  
                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirm === property.id && (
                    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold">Confirm Deletion</h3>
                          <button 
                            onClick={() => setShowDeleteConfirm(null)}
                            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="mb-6">
                          Are you sure you want to delete <span className="font-medium">{property.title}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={() => deleteProperty(property.id)}>
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
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

function LoadMoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );
} 