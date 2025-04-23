"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, Filter, Home, Building, Search, Bath, Bed, CheckSquare, Wifi, Tv, MountainSnow, Waves, PawPrint, User, MenuIcon, Heart, ChevronLeft, DollarSign, Grid2X2, Map, Calendar, Sliders, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import * as mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

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

// Main component that doesn't use the useSidebar hook
export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('map')
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
  const [priceRange, setPriceRange] = useState([300, 1200])
  const [defaultCollapsed, setDefaultCollapsed] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(true)

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

  return (
    <div className="h-screen w-screen overflow-hidden flex">
      <SidebarProvider defaultOpen={!defaultCollapsed}>
        <PropertiesContent 
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedProperty={selectedProperty}
          setSelectedProperty={setSelectedProperty}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          defaultCollapsed={defaultCollapsed}
          setDefaultCollapsed={setDefaultCollapsed}
          propertiesOpen={propertiesOpen}
          setPropertiesOpen={setPropertiesOpen}
          mapContainer={mapContainer}
        />
      </SidebarProvider>
    </div>
  )
}

// Internal component that uses the useSidebar hook safely within the provider
function PropertiesContent({
  viewMode,
  setViewMode,
  selectedProperty,
  setSelectedProperty,
  priceRange,
  setPriceRange,
  defaultCollapsed,
  setDefaultCollapsed,
  propertiesOpen,
  setPropertiesOpen,
  mapContainer
}: {
  viewMode: 'map' | 'list' | 'split'
  setViewMode: (mode: 'map' | 'list' | 'split') => void
  selectedProperty: number | null
  setSelectedProperty: (id: number | null) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  defaultCollapsed: boolean
  setDefaultCollapsed: (collapsed: boolean) => void
  propertiesOpen: boolean
  setPropertiesOpen: (open: boolean) => void
  mapContainer: React.RefObject<HTMLDivElement>
}) {
  // Now we can safely use the hook inside the provider
  const { state } = useSidebar()
  
  return (
    <>
      <Sidebar 
        variant="floating" 
        collapsible="icon" 
        className="z-30"
      >
        <SidebarHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
              <Home className="h-6 w-6" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <h3 className="font-bold">Panora</h3>
              <p className="text-xs text-muted-foreground">Property Listings</p>
            </div>
          </div>
          <SidebarTrigger />
        </SidebarHeader>

        <SidebarContent className="pt-0 overflow-y-auto">
          {/* View Toggle Icons */}
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">View</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={viewMode === 'list'} 
                    onClick={() => setViewMode('list')}
                    tooltip="List View"
                  >
                    <Grid2X2 className="h-4 w-4" />
                    <span>List View</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={viewMode === 'map'} 
                    onClick={() => setViewMode('map')}
                    tooltip="Map View"
                  >
                    <Map className="h-4 w-4" />
                    <span>Map View</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={viewMode === 'split'} 
                    onClick={() => setViewMode('split')}
                    tooltip="Split View"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Split View</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />
          
          <div className="group-data-[collapsible=icon]:hidden px-4 py-2">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search properties..." className="pl-8" />
            </div>
          </div>

          {/* Property Type Icons */}
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Property Type</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {propertyTypes.map((type, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton tooltip={type.name}>
                      {type.icon}
                      <span>{type.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />
          
          {/* Price Range - Only visible when expanded */}
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Price Range</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-4 py-2">
                <div className="text-sm text-muted-foreground flex justify-between mb-4">
                  <span>Monthly</span>
                  <span>${priceRange[0]} - ${priceRange[1]}</span>
                </div>
                <Slider
                  defaultValue={priceRange}
                  min={100}
                  max={2000}
                  step={50}
                  onValueChange={(value) => setPriceRange(value as number[])}
                  className="mb-4"
                />
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
          
          {/* Amenities Icons */}
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Amenities</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {amenities.map((amenity, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton tooltip={amenity.name}>
                      {amenity.icon}
                      <span>{amenity.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Filter button - Only visible when expanded */}
          <div className="px-4 py-4 group-data-[collapsible=icon]:hidden">
            <Button className="w-full" size="sm">
              <Sliders className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Main content - Fixed height, no scrolling */}
      <div className="flex-1 relative h-screen">
        {/* Map container - Full height and width */}
        <div 
          ref={mapContainer} 
          className="absolute inset-0 w-full h-full z-0"
        />
        
        {/* Floating header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold shadow-sm bg-background/80 px-4 py-2 rounded-lg backdrop-blur-sm">
              Property Listings
            </h1>
          </div>
          
          {/* Mobile-only toggle button */}
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={() => setDefaultCollapsed(!defaultCollapsed)} 
            className="md:hidden shadow-lg"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Property cards overlay - Slides in from bottom */}
        <AnimatePresence>
          {(viewMode === 'list' || viewMode === 'split' || selectedProperty !== null) && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: propertiesOpen ? "0%" : "calc(100% - 40px)" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm rounded-t-xl shadow-xl z-20",
                "max-h-[60vh] overflow-hidden flex flex-col",
                viewMode === 'list' ? "md:max-h-[80vh]" : "md:max-h-[50vh]"
              )}
            >
              {/* Handle for sliding up/down */}
              <div 
                className="h-10 flex items-center justify-center cursor-pointer hover:bg-muted/50" 
                onClick={() => setPropertiesOpen(!propertiesOpen)}
              >
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              
              <div className="px-4 pb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Available Properties</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <DollarSign className="mr-1 h-4 w-4" />
                    Price
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    Dates
                  </Button>
                </div>
              </div>
              
              {/* Scrollable property list */}
              <div className="overflow-y-auto flex-1 p-4 pt-0 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <Card 
                    key={property.id}
                    className="overflow-hidden hover:shadow-lg transition-all border-transparent hover:border-primary cursor-pointer"
                    onClick={() => setSelectedProperty(property.id === selectedProperty ? null : property.id)}
                  >
                    <div className="relative h-40">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-primary text-primary-foreground shadow-md">Superhost</Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-background/90 text-foreground backdrop-blur-sm shadow-md">
                          ${property.price}<span className="text-muted-foreground">/night</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base line-clamp-1">{property.title}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span>{property.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-muted-foreground text-xs mt-1 mb-2">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          <span>{property.beds} beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          <span>{property.baths} bath</span>
                        </div>
                        {property.hasPool && (
                          <div className="flex items-center gap-1">
                            <Waves className="h-3 w-3" />
                            <span>Pool</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
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