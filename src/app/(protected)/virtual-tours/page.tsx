"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Expand, Minimize, View } from "lucide-react"
import { motion } from "framer-motion"

export default function VirtualToursPage() {
  const [fullscreenTour, setFullscreenTour] = useState<string | null>(null)
  const properties = useQuery(api.properties.getAllProperties) || []

  // Filter properties that have virtual tours
  const propertiesWithTours = properties.filter(property => property.vrTourLink)

  const handleFullscreen = (tourUrl: string) => {
    setFullscreenTour(tourUrl)
  }

  const exitFullscreen = () => {
    setFullscreenTour(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4 md:px-8">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl" />
          <div className="relative py-12 px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <View className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Premium Feature</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Immersive Virtual Tours
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Experience properties like never before with our cutting-edge 360° virtual tours. 
                  Explore every corner, every detail, and make informed decisions from the comfort of your home.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border">
                    <h3 className="font-semibold mb-1">Immersive 360°</h3>
                    <p className="text-sm text-muted-foreground">HD quality panoramic views</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border">
                    <h3 className="font-semibold mb-1">2D Floor Plans</h3>
                    <p className="text-sm text-muted-foreground">Interactive layout navigation</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border">
                    <h3 className="font-semibold mb-1">Custom Hotspots</h3>
                    <p className="text-sm text-muted-foreground">Smart navigation points</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border">
                    <h3 className="font-semibold mb-1">Detail Popups</h3>
                    <p className="text-sm text-muted-foreground">Instant property information</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border">
                    <h3 className="font-semibold mb-1">Aerial Views</h3>
                    <p className="text-sm text-muted-foreground">Drone perspective shots</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border">
                    <h3 className="font-semibold mb-1">VR Mode</h3>
                    <p className="text-sm text-muted-foreground">Virtual reality experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Virtual Tour */}
        {fullscreenTour && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="relative w-full h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10"
                onClick={exitFullscreen}
              >
                <Minimize className="h-5 w-5" />
              </Button>
              <iframe
                src={fullscreenTour}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Virtual Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propertiesWithTours.map((property) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="relative aspect-video">
                  <iframe
                    src={property.vrTourLink}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleFullscreen(property.vrTourLink!)}
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{property.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{property.city}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      ${property.price.toLocaleString()}
                      {property.purpose === 'rent' ? '/mo' : ''}
                    </p>
                    <Button variant="link" asChild>
                      <a href={`/properties/${property._id}`}>View Details</a>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {propertiesWithTours.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Virtual Tours Available</h3>
            <p className="text-muted-foreground">
              We're currently working on adding virtual tours for our properties. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 