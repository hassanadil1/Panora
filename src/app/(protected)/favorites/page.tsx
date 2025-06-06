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
  Heart, 
  MessageSquare, 
  Home, 
  User, 
  CreditCard, 
  Settings, 
  Edit, 
  Trash, 
  Plus
} from "lucide-react"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog"

// Navigation items for the sidebar
const navigationItems = [
  { name: "Favorites", href: "#favorites", icon: <Heart className="h-5 w-5" /> },
  { name: "My Listings", href: "#listings", icon: <Home className="h-5 w-5" /> },
]

export default function FavoritesPage() {
  const { user } = useClerk()
  const [activeTab, setActiveTab] = useState<"favorites" | "listings">("favorites")
  
  // Get userId from Convex
  const userIdQuery = useQuery(api.users.getUserByClerkId, { 
    clerkId: user?.id ?? ""
  });
  const userId = userIdQuery?._id;
  
  // Get user's favorites
  const favoriteProperties = useQuery(
    api.favorites.getUserFavorites, 
    userId ? { userId } : "skip"
  );
  
  // Get user's listings
  const userListings = useQuery(
    api.properties.getPropertiesBySeller,
    userId ? { sellerId: userId } : "skip"
  );
  
  // Mutations
  const removeFromFavorites = useMutation(api.favorites.removeFavorite);
  const deleteProperty = useMutation(api.properties.deleteProperty);
  
  const handleRemoveFromFavorites = async (propertyId: Id<"properties">) => {
    if (!userId) return;
    
    try {
      await removeFromFavorites({ 
        userId, 
        propertyId 
      });
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Failed to remove from favorites");
      console.error("Error removing from favorites:", error);
    }
  };

  const handleDeleteListing = async (propertyId: Id<"properties">) => {
    if (!userId) return;
    
    try {
      await deleteProperty({ id: propertyId });
      toast.success("Property deleted successfully");
    } catch (error) {
      toast.error("Failed to delete property");
      console.error("Error deleting property:", error);
    }
  };
  
  // Loading state
  if (!favoriteProperties || !userListings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
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
                <p className="font-medium">{user?.fullName || "User"}</p>
                <p className="text-xs text-muted-foreground">Renter</p>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <div className="flex flex-col space-y-1">
              {navigationItems.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    if (item.href === "#favorites") setActiveTab("favorites");
                    if (item.href === "#listings") setActiveTab("listings");
                  }}
                  className={`px-3 py-2 rounded-md flex items-center gap-3 text-sm ${
                    (item.href === "#favorites" && activeTab === "favorites") || 
                    (item.href === "#listings" && activeTab === "listings") 
                      ? "bg-primary text-primary-foreground" 
                      : item.href.startsWith("#")
                        ? "text-muted-foreground hover:bg-muted"
                        : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {activeTab === "favorites" ? (
            <div className="container py-8 px-4 md:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Favorites</h1>
                  <p className="text-muted-foreground">Properties you've saved</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/properties">
                      <Search className="h-4 w-4 mr-2" />
                      Search Properties
                    </Link>
                  </Button>
                </div>
              </div>

              {favoriteProperties.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                  <Heart className="h-20 w-20 mx-auto text-muted-foreground stroke-[1.25px]" />
                  <h3 className="mt-6 text-2xl font-semibold">No Favorites Yet</h3>
                  <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                    You haven't added any properties to your favorites.
                    Click the heart icon on properties you like to save them here.
                  </p>
                  <Button className="mt-8" size="lg" asChild>
                    <Link href="/properties">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Properties
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Properties Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteProperties.map((property, index) => (
                      <motion.div
                        key={property._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                          <div className="relative h-48">
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-card text-foreground">
                                {property.purpose === 'rent' ? 'For Rent' : 'For Sale'}
                              </Badge>
                            </div>
                            <div className="absolute bottom-3 right-3">
                              <button 
                                className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                                onClick={() => handleRemoveFromFavorites(property._id)}
                              >
                                <Heart className="h-5 w-5 fill-current" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <Link href={`/properties/${property._id}`}>
                                <h3 className="font-bold text-lg hover:text-primary">{property.title}</h3>
                              </Link>
                            </div>
                            <div className="flex items-center text-muted-foreground text-sm mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property.city}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div className="flex gap-2">
                                <div className="flex items-center gap-1 text-sm">
                                  <Bed className="h-4 w-4" />
                                  <span>{property.bedrooms} Bed</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Bath className="h-4 w-4" />
                                  <span>{property.bathrooms} Bath</span>
                                </div>
                              </div>
                              <p className="font-bold">${property.price.toLocaleString()}
                                <span className="text-xs text-muted-foreground font-normal">
                                  {property.purpose === 'rent' ? '/mo' : ''}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="container py-8 px-4 md:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">My Listings</h1>
                  <p className="text-muted-foreground">Properties you've listed for sale or rent</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button size="sm" variant="default" asChild>
                    <Link href="/list-property">
                      <Plus className="h-4 w-4 mr-2" />
                      List New Property
                    </Link>
                  </Button>
                </div>
              </div>

              {userListings.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                  <Home className="h-20 w-20 mx-auto text-muted-foreground stroke-[1.25px]" />
                  <h3 className="mt-6 text-2xl font-semibold">No Listings Yet</h3>
                  <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                    You haven't listed any properties yet.
                    Click the button below to list your first property.
                  </p>
                  <Button className="mt-8" size="lg" asChild>
                    <Link href="/list-property">
                      <Plus className="h-4 w-4 mr-2" />
                      List Your Property
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* User Listings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userListings.map((property, index) => (
                      <motion.div
                        key={property._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                          <div className="relative h-48">
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-card text-foreground">
                                {property.purpose === 'rent' ? 'For Rent' : 'For Sale'}
                              </Badge>
                            </div>
                            <div className="absolute bottom-3 right-3 flex gap-2">
                              <Button 
                                variant="default" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                asChild
                              >
                                <Link href={`/properties/${property._id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this property? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleDeleteListing(property._id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <Link href={`/properties/${property._id}`}>
                                <h3 className="font-bold text-lg hover:text-primary">{property.title}</h3>
                              </Link>
                            </div>
                            <div className="flex items-center text-muted-foreground text-sm mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property.city}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div className="flex gap-2">
                                <div className="flex items-center gap-1 text-sm">
                                  <Bed className="h-4 w-4" />
                                  <span>{property.bedrooms} Bed</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Bath className="h-4 w-4" />
                                  <span>{property.bathrooms} Bath</span>
                                </div>
                              </div>
                              <p className="font-bold">${property.price.toLocaleString()}
                                <span className="text-xs text-muted-foreground font-normal">
                                  {property.purpose === 'rent' ? '/mo' : ''}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function LoadMoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="7 11 12 6 17 11" />
      <polyline points="7 17 12 12 17 17" />
    </svg>
  )
} 