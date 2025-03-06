"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PropertyCard } from "@/components/property-card"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState("")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center hero-gradient">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
          >
            <source src="https://player.vimeo.com/external/451942340.sd.mp4?s=646dfa8fcc6e577a3f3c3891cc87e3bc31c3dda8&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Find Your Dream Property in Pakistan
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-600 dark:text-gray-300">
              Your trusted platform for buying, selling, and managing real estate properties
            </p>
            
            {/* Search Section */}
            <div className="glass-effect rounded-xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <Input
                    placeholder="Search by location, property type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/90 dark:bg-black/50 h-12"
                  />
                </div>
                <div className="md:col-span-4">
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-white/90 dark:bg-black/50 h-12">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 dark:from-emerald-500 dark:to-blue-500 dark:hover:from-emerald-600 dark:hover:to-blue-600">
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center gradient-text">
            Featured Properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-hover">
                <PropertyCard />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-emerald-950 dark:via-gray-900 dark:to-sky-950">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg dark:shadow-emerald-500/20">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Browse Properties</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Search through our extensive collection of properties
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg dark:shadow-emerald-500/20">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Connect</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get in touch with property owners directly
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg dark:shadow-emerald-500/20">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Close the Deal</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Finalize your transaction securely
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
