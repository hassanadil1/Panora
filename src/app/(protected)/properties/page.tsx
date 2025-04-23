"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, Filter, Home, Building, Search, Bath, Bed, CheckSquare, Wifi, Tv, MountainSnow, Waves, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import * as mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'

// Mock properties data
const properties = [
  {
    id: 1,
    title: "Sunset Bungalows",
    location: "DHA Phase 5, Lahore, Pakistan",
    price: 530,
    beds: 2,
    baths: 1,
    hasPool: true,
    rating: 4.8,
    reviews: 347,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
    coordinates: [74.3991, 31.4697]
  },
  {
    id: 2,
    title: "Cangu Privat Villa",
    location: "DHA Phase 2, Lahore, Pakistan",
    price: 200,
    beds: 2,
    baths: 1,
    hasPool: true,
    rating: 4.8,
    reviews: 347,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    coordinates: [74.4091, 31.4797]
  },
  {
    id: 3,
    title: "Villa Kayu Raja",
    location: "DHA Phase 6, Lahore, Pakistan",
    price: 130,
    beds: 1,
    baths: 1,
    hasPool: true,
    rating: 4.5,
    reviews: 121,
    image: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    coordinates: [74.3971, 31.4607]
  },
  {
    id: 4,
    title: "The Edge Bali",
    location: "DHA Phase 4, Lahore, Pakistan",
    price: 190,
    beds: 2,
    baths: 1,
    hasPool: true,
    rating: 4.4,
    reviews: 134,
    image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    coordinates: [74.4081, 31.4727]
  }
]

// Property types
const propertyTypes = [
  { name: "Rooms", icon: <Home className="h-5 w-5" /> },
  { name: "Townhouse", icon: <Building className="h-5 w-5" /> }, 
  { name: "Apartment", icon: <Building className="h-5 w-5" /> },
  { name: "Villa", icon: <Home className="h-5 w-5" /> },
  { name: "Townhouse", icon: <Home className="h-5 w-5" /> },
  { name: "Cottage", icon: <Home className="h-5 w-5" /> }
]

// Amenities
const amenities = [
  { name: "TV", icon: <Tv className="h-5 w-5" /> },
  { name: "Disabled Access", icon: <CheckSquare className="h-5 w-5" /> },
  { name: "In the woods", icon: <MountainSnow className="h-5 w-5" /> },
  { name: "Hot Tubs", icon: <CheckSquare className="h-5 w-5" /> },
  { name: "Views", icon: <MountainSnow className="h-5 w-5" /> },
  { name: "Lake & Rivers", icon: <Waves className="h-5 w-5" /> },
  { name: "Pet Friendly", icon: <PawPrint className="h-5 w-5" /> },
  { name: "Wifi", icon: <Wifi className="h-5 w-5" /> }
]

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('split')
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null)
  const [viewport, setViewport] = useState({
    latitude: 31.4697,
    longitude: 74.3991,
    zoom: 13
  })
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popupRefs = useRef<{[key: number]: mapboxgl.Popup}>({})

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize the map only once
    if (!map.current) {
      // Set access token
      (mapboxgl as any).accessToken = "pk.eyJ1IjoiaGFzc2FuYWRpbHpha2kiLCJhIjoiY205dTVqdjI3MDRvdTJqcjhneDFveTF1NCJ9.fRofO78X0uoH0_bfDDmI2Q";
      
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [viewport.longitude, viewport.latitude],
        zoom: viewport.zoom
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Set mapLoaded when the map is fully loaded
      map.current.on('load', () => {
        setMapLoaded(true);
      });
      
      // Update viewport state when the map moves
      map.current.on('move', () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        setViewport({
          latitude: center.lat,
          longitude: center.lng,
          zoom: map.current.getZoom()
        });
      });
    }
    
    // Update markers and popups when the map or selected property changes
    if (map.current && mapLoaded) {
      // Clean up existing markers on rerender
      const markersToRemove = document.querySelectorAll('.mapboxgl-marker');
      markersToRemove.forEach(marker => marker.remove());
      
      // Clear existing popups
      Object.values(popupRefs.current).forEach(popup => popup.remove());
      popupRefs.current = {};
      
      // Add markers for each property
      properties.forEach(property => {
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        
        const markerContent = document.createElement('div');
        markerContent.className = selectedProperty === property.id 
          ? 'p-2 rounded-full bg-primary text-primary-foreground shadow-md cursor-pointer transition-colors'
          : 'p-2 rounded-full bg-background shadow-md cursor-pointer transition-colors';
        
        const priceEl = document.createElement('div');
        priceEl.className = 'px-2 py-1 rounded bg-primary text-primary-foreground font-bold text-sm';
        priceEl.textContent = `$${property.price}`;
        
        markerContent.appendChild(priceEl);
        markerEl.appendChild(markerContent);
        
        // Create marker and add to map
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(property.coordinates as [number, number])
          .addTo(map.current!);
        
        // Handle marker click
        markerEl.addEventListener('click', () => {
          setSelectedProperty(property.id === selectedProperty ? null : property.id);
        });
        
        // Show popup for selected property
        if (selectedProperty === property.id) {
          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 w-60';
          
          const img = document.createElement('img');
          img.src = property.image;
          img.alt = property.title;
          img.className = 'w-full h-32 object-cover rounded-md mb-2';
          
          const title = document.createElement('h3');
          title.className = 'font-bold';
          title.textContent = property.title;
          
          const location = document.createElement('p');
          location.className = 'text-sm text-muted-foreground';
          location.textContent = property.location;
          
          const details = document.createElement('div');
          details.className = 'flex justify-between items-center mt-2';
          
          const rating = document.createElement('div');
          rating.className = 'flex items-center gap-1 text-sm';
          rating.innerHTML = `<svg class="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span>${property.rating}</span>`;
          
          const price = document.createElement('p');
          price.className = 'font-bold';
          price.innerHTML = `$${property.price}<span class="text-sm font-normal text-muted-foreground">/night</span>`;
          
          details.appendChild(rating);
          details.appendChild(price);
          
          popupContent.appendChild(img);
          popupContent.appendChild(title);
          popupContent.appendChild(location);
          popupContent.appendChild(details);
          
          // Create and store the popup reference
          const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
            .setLngLat(property.coordinates as [number, number])
            .setDOMContent(popupContent)
            .addTo(map.current!);
          
          popupRefs.current[property.id] = popup;
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [viewMode, selectedProperty, mapLoaded, properties]);

  const formatPrice = (price: number) => {
    return `$${price}`
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Property Listings</h1>

        {/* Filters and Search Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative w-full md:w-auto md:flex-1">
            <div className="flex items-center gap-2 w-full px-4 py-2 rounded-md border bg-background">
              <Filter className="text-muted-foreground h-5 w-5" />
              <span className="text-sm font-medium">Filter</span>
            </div>
          </div>

          <div className="relative w-full md:w-auto md:flex-[2]">
            <div className="flex items-center gap-2 w-full px-4 py-2 rounded-md border bg-background">
              <Search className="text-muted-foreground h-5 w-5" />
              <Input 
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Culver City, CA"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="flex-1">
              Price <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Beds/Baths <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Home Type <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Specialty Housing <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Move-in Date <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Sort <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            <div className="flex border rounded-md overflow-hidden">
              <button 
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-5 w-5" />
              </button>
              <button 
                className={`p-2 ${viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Property Types */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Property Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {propertyTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex flex-col items-center justify-center p-4 border rounded-lg bg-card hover:border-primary cursor-pointer"
              >
                <div className="h-10 w-10 flex items-center justify-center mb-2">
                  {type.icon}
                </div>
                <span className="text-sm">{type.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Price Range</h2>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Monthly</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-1 bg-border flex-1 rounded-full relative">
                <div className="absolute h-1 bg-primary rounded-full left-[20%] right-[30%]"></div>
                <div className="absolute w-4 h-4 bg-primary rounded-full top-1/2 -translate-y-1/2 left-[20%] -ml-2"></div>
                <div className="absolute w-4 h-4 bg-primary rounded-full top-1/2 -translate-y-1/2 right-[30%] -mr-2"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span>$300</span>
              <span>$1200</span>
            </div>
          </div>
        </div>

        {/* Conveniences */}
        <div className="mb-10">
          <h2 className="text-lg font-medium mb-3">Conveniences</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {amenities.map((amenity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary cursor-pointer"
              >
                <div className="text-muted-foreground">
                  {amenity.icon}
                </div>
                <span className="text-sm">{amenity.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <Button className="px-8">APPLY</Button>
        </div>

        {/* Map and Properties Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(viewMode === 'list' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'lg:col-span-1 flex flex-col gap-6' : 'lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
              {properties.map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                  onMouseEnter={() => setSelectedProperty(property.id)}
                  onMouseLeave={() => setSelectedProperty(null)}
                >
                  <Link href={`/properties/${property.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-52">
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
                        <div className="absolute bottom-3 right-3">
                          <button className="h-8 w-8 rounded-full bg-background flex items-center justify-center">
                            <HeartIcon className="h-5 w-5 text-foreground" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{property.title}</h3>
                          <div className="flex items-center gap-1 text-sm">
                            <StarIcon className="h-4 w-4 text-yellow-500" fill="currentColor" />
                            <span>{property.rating}</span>
                            <span className="text-muted-foreground">({property.reviews})</span>
                          </div>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex gap-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Bed className="h-4 w-4" />
                              <span>{property.beds} bed</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Bath className="h-4 w-4" />
                              <span>{property.baths} bath</span>
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
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {(viewMode === 'map' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div ref={mapContainer} className="h-[600px] rounded-xl overflow-hidden border">
                {/* Map content will be rendered here */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple icons for view modes and others
function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}

function MapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
} 