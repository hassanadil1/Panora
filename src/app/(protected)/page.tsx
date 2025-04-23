"use client"

import Link from "next/link"
import { useState } from "react"
import { Search, MapPin, Home as HomeIcon, ChevronRight, Building, ArrowRight, Bed, Bath } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Sample properties for featured listings
const featuredProperties = [
  {
    id: 1,
    title: "Modern Luxury Villa",
    location: "Islamabad, Pakistan",
    price: "Rs 45,000,000",
    beds: 4,
    baths: 3,
    area: "3,200 sq ft",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80"
  },
  {
    id: 2,
    title: "Contemporary Apartment",
    location: "Lahore, Pakistan",
    price: "Rs 18,500,000",
    beds: 2,
    baths: 2,
    area: "1,100 sq ft",
    image: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 3,
    title: "Oceanfront Condo",
    location: "Karachi, Pakistan",
    price: "Rs 32,750,000",
    beds: 3,
    baths: 2,
    area: "1,800 sq ft",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 4,
    title: "Suburban Family Home",
    location: "Rawalpindi, Pakistan",
    price: "Rs 28,900,000",
    beds: 4,
    baths: 3,
    area: "2,500 sq ft",
    image: "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 5,
    title: "Downtown Penthouse",
    location: "Faisalabad, Pakistan",
    price: "Rs 52,000,000",
    beds: 3,
    baths: 3,
    area: "2,200 sq ft",
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1084&q=80"
  },
  {
    id: 6,
    title: "Historic Townhouse",
    location: "Multan, Pakistan",
    price: "Rs 35,600,000",
    beds: 4,
    baths: 2,
    area: "2,800 sq ft",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
]

// Image gallery data
const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
    span: "col-span-1 row-span-2 md:col-span-1 md:row-span-2"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
    span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
    span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1"
  }
]

const locations = [
  "Islamabad, Pakistan",
  "Lahore, Pakistan",
  "Karachi, Pakistan",
  "Peshawar, Pakistan",
  "Quetta, Pakistan",
  "Faisalabad, Pakistan",
  "Rawalpindi, Pakistan",
  "Multan, Pakistan",
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length > 0) {
      const filtered = locations.filter(loc => 
        loc.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

  const handleSelectLocation = (location: string) => {
    setSearchQuery(location)
    setShowResults(false)
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-background">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Luxury Property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <img 
                  src="/Fav icon No Black BG.png" 
                  alt="Panora Logo" 
                  className="w-20 md:w-24 lg:w-28 h-auto"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-3 text-primary">
                Find Your Dream Property or List Your Investment
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-muted-foreground">
                Your trusted platform for buying, selling, and managing real estate properties
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex gap-4 justify-center mb-12"
            >
              <Button size="lg" className="rounded-full">
                Browse Properties <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="secondary" className="rounded-full">
                List Property <HomeIcon className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-2 px-5 py-4 bg-card rounded-full shadow-lg">
                <MapPin className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Search by location..."
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-card"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => searchQuery && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                <Button className="rounded-full px-6">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {showResults && searchResults.length > 0 && (
                <div className="absolute mt-2 w-full bg-popover rounded-xl shadow-lg py-2 z-50 border">
                  {searchResults.map((location, i) => (
                    <div
                      key={i}
                      className="px-5 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      {location}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Filters Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">
              Quickly find the home you want using our simple and effective search filters!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              {/* Filter Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="bg-background rounded-xl p-6 shadow-md border overflow-hidden"
              >
                <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="p-4 bg-card rounded-full">
                    <HomeIcon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Trustworthy and Verified Listings</h3>
                <p className="text-muted-foreground mb-4">Discover the best rental options with user reviews and ratings.</p>
                <Button className="w-full" size="sm">Explore</Button>
              </motion.div>
              
              {/* Filter Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-background rounded-xl p-6 shadow-md border overflow-hidden"
              >
                <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="p-4 bg-card rounded-full">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Browse Rental Listings with Ease</h3>
                <p className="text-muted-foreground mb-4">Get access to user reviews and ratings for a better understanding of rental options.</p>
                <Button className="w-full" size="sm">Search</Button>
              </motion.div>
              
              {/* Filter Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-background rounded-xl p-6 shadow-md border overflow-hidden"
              >
                <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="p-4 bg-card rounded-full">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Simplify Your Rental Search with Advanced Filters</h3>
                <p className="text-muted-foreground mb-4">Find trustworthy and verified rental listings to ensure a hassle-free experience.</p>
                <Button className="w-full" size="sm">Discover</Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">Discover Properties</h4>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Featured Listings</h2>
            </div>
            <Link href="/properties" className="text-primary hover:underline flex items-center gap-1">
              View all properties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="overflow-hidden bg-card rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {property.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-foreground">{property.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div><span className="font-medium text-foreground">{property.beds}</span> beds</div>
                      <div><span className="font-medium text-foreground">{property.baths}</span> baths</div>
                      <div><span className="font-medium text-foreground">{property.area}</span></div>
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-full">
                      Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Image Gallery</h2>
            <p className="text-muted-foreground mt-4">Browse our handpicked selection of rental properties and find the perfect home for you!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {galleryImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`${image.span} rounded-xl overflow-hidden relative hover:shadow-xl transition-shadow duration-300`}
              >
                <img
                  src={image.src}
                  alt={`Gallery Image ${image.id}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Simple Process</h4>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Browse Properties", description: "Search through our extensive collection", icon: <Search className="h-6 w-6 text-primary" /> },
              { step: 2, title: "Connect", description: "Get in touch with property owners directly", icon: <MapPin className="h-6 w-6 text-primary" /> },
              { step: 3, title: "Close the Deal", description: "Finalize your transaction securely", icon: <Building className="h-6 w-6 text-primary" /> }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
                className="text-center bg-card p-8 rounded-xl shadow-lg border"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Your Dream Rental Property Today Section */}
      <section className="py-20 bg-background bg-grid-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h4 className="text-lg font-medium text-primary mb-2">Discover</h4>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Find Your Dream Rental Property Today!</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Searching for your dream rental property has never been easier. With our user-friendly search feature, you can quickly find the perfect
              home that meets all your needs. Whether you're looking for a cozy apartment in the city or a spacious house in the suburbs, we have a
              wide range of listings to choose from. Start your search today and discover your dream rental property!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="rounded-full bg-background border w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Search for Properties</h3>
              <p className="text-muted-foreground">
                Browse through our extensive collection of rental properties in your desired location.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center"
            >
              <div className="rounded-full bg-background border w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <div className="h-8 w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Book Your Rental</h3>
              <p className="text-muted-foreground">
                Once you've found the perfect rental property, easily book it online with just a few clicks.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <div className="rounded-full bg-background border w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <div className="h-8 w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Enjoy Your New Home</h3>
              <p className="text-muted-foreground">
                Move into your new rental property and start enjoying your dream home.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-muted/30 rounded-xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Discover a wide range of rental properties in your desired location.</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button className="rounded-full" size="lg">
                    Learn More
                  </Button>
                  <Button variant="secondary" className="rounded-full" size="lg">
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 