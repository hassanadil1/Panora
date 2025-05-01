"use client"

import { useState, useRef, useEffect } from "react"
import { 
  MapPin, Filter, Home, Building, Search, Bath, Bed, CheckSquare, 
  Wifi, Tv, MountainSnow, Waves, PawPrint, User, MenuIcon, Heart, 
  ChevronLeft, DollarSign, Grid2X2, Calendar, 
  Sliders, Star, X, ChevronsDown, ArrowDownUp, Square, 
  ChevronRight, SquareDot
} from "lucide-react"
import { Map } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  { name: "Tinyhouse", icon: <Home className="h-5 w-5" /> },
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
  const [priceRange, setPriceRange] = useState([200, 1200])
  const [minPriceInput, setMinPriceInput] = useState(`$${priceRange[0]}`)
  const [maxPriceInput, setMaxPriceInput] = useState(`$${priceRange[1]}`)
  const [areaRange, setAreaRange] = useState([500, 5000])
  const [minAreaInput, setMinAreaInput] = useState(`${areaRange[0]}`)
  const [maxAreaInput, setMaxAreaInput] = useState(`${areaRange[1]}`)
  const [bedsCount, setBedsCount] = useState<string>("Any")
  const [bathsCount, setBathsCount] = useState<string>("Any")
  const [defaultCollapsed, setDefaultCollapsed] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize the map only once
    if (!map.current) {
      // Set access token
      (mapboxgl as any).accessToken = "pk.eyJ1IjoiaGFzc2FuYWRpbHpha2kiLCJhIjoiY205dTVqdjI3MDRvdTJqcjhneDFveTF1NCJ9.fRofO78X0uoH0_bfDDmI2Q";
      
      // Completely disable Mapbox telemetry
      (mapboxgl as any).config.DISABLE_ATTRIBUTION_CONTROL = true;
      (mapboxgl as any).config.TELEMETRY_DISABLED = true;
      (mapboxgl as any).prewarm = false; // Disable session warming
      
      try {
        // Disable sending anonymous usage data to Mapbox
        const mapboxMap = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [viewport.longitude, viewport.latitude],
          zoom: viewport.zoom,
          trackResize: true,
          attributionControl: false, // Disable default attribution which includes telemetry
          collectResourceTiming: false,
          fadeDuration: 0,
          preserveDrawingBuffer: true,
          logoPosition: 'bottom-left',
          boxZoom: true,
          interactive: true,
          localIdeographFontFamily: "'sans-serif'", // Fix for boolean not assignable to string
          maxZoom: 20,
          minZoom: 0,
          renderWorldCopies: true
        });
        
        map.current = mapboxMap;

        // Add navigation controls 
        map.current.addControl(new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: false
        }), 'top-right');
        
        // Add custom attribution WITHOUT telemetry link
        map.current.addControl(new mapboxgl.AttributionControl({
          customAttribution: 'Map data © Mapbox',
          compact: true
        }));
        
        // Set mapLoaded when the map is fully loaded
        map.current.on('load', () => {
          // Further disable tracking after map load - safely with type casting
          try {
            // This effectively prevents events from being sent to Mapbox's analytics
            if (map.current) {
              // Create a no-op function for the 'send' method
              const noopSend = () => {};
              
              // Only set if the current implementation exists and is a function
              const mapAny = map.current as any;
              if (typeof mapAny.send === 'function') {
                mapAny.send = noopSend;
              }
              
              // Force resize to ensure proper rendering
              map.current.resize();
            }
          } catch (e) {
            // Silently ignore errors
          }
          
          setMapLoaded(true);
        });
        
        // Handle any errors during map loading
        map.current.on('error', (err) => {
          console.error("Mapbox error:", err);
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
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    } else if (map.current) {
      // Trigger resize when the component re-renders
      // This helps in cases where the map container size has changed
      map.current.resize();
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
        
        // Create image container
        const markerContent = document.createElement('div');
        markerContent.className = 'relative';
        
        // Add property image
        const imgContainer = document.createElement('div');
        imgContainer.className = 'w-16 h-16 rounded-full border-2 border-primary overflow-hidden shadow-lg';
        
        const img = document.createElement('img');
        img.src = property.image;
        img.className = 'w-full h-full object-cover';
        imgContainer.appendChild(img);
        
        // Add price badge
        const priceEl = document.createElement('div');
        priceEl.className = 'absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md';
        priceEl.textContent = `$${property.price}`;
        
        markerContent.appendChild(imgContainer);
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

  useEffect(() => {
    setMinPriceInput(`$${priceRange[0]}`)
    setMaxPriceInput(`$${priceRange[1]}`)
  }, [priceRange])

  useEffect(() => {
    setMinAreaInput(`${areaRange[0]}`)
    setMaxAreaInput(`${areaRange[1]}`)
  }, [areaRange])

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value) {
      const numValue = parseInt(value)
      setMinPriceInput(`$${numValue}`)
      if (numValue < priceRange[1]) {
        setPriceRange([numValue, priceRange[1]])
      }
    } else {
      setMinPriceInput('$')
    }
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value) {
      const numValue = parseInt(value)
      setMaxPriceInput(`$${numValue}`)
      if (numValue > priceRange[0]) {
        setPriceRange([priceRange[0], numValue])
      }
    } else {
      setMaxPriceInput('$')
    }
  }

  const handleMinAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value) {
      const numValue = parseInt(value)
      setMinAreaInput(numValue.toString())
      if (numValue < areaRange[1]) {
        setAreaRange([numValue, areaRange[1]])
      }
    } else {
      setMinAreaInput('')
    }
  }

  const handleMaxAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value) {
      const numValue = parseInt(value)
      setMaxAreaInput(numValue.toString())
      if (numValue > areaRange[0]) {
        setAreaRange([areaRange[0], numValue])
      }
    } else {
      setMaxAreaInput('')
    }
  }

  const renderPropertyCard = (property: typeof properties[0]) => (
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
  )

  // Add a separate effect to handle resize and view mode changes
  useEffect(() => {
    // Function to handle window resize
    const handleResize = () => {
      if (map.current && mapLoaded) {
        map.current.resize();
      }
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Call resize immediately to ensure proper initial sizing
    // Short timeout to ensure DOM has settled
    const timeoutId = setTimeout(() => {
      handleResize();
    }, 100);

    // Cleanup event listener
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [mapLoaded, viewMode]); // Re-run when map loads or view mode changes

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Top Navigation Filters */}
      <div className="border-b px-4 py-2 flex items-center gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full flex items-center gap-1 md:hidden"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
        
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search location..." 
            className="pl-10 rounded-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Price Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Price
              <DollarSign className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Price Range</h4>
              <Slider
                defaultValue={priceRange}
                value={priceRange}
                min={100}
                max={2000}
                step={50}
                onValueChange={(value) => setPriceRange(value as number[])}
                className="mb-6"
              />
              <div className="flex items-center justify-between">
                <div className="w-[45%]">
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input 
                    value={minPriceInput} 
                    onChange={handleMinPriceChange} 
                    className="mt-1" 
                  />
                </div>
                <div className="text-muted-foreground">—</div>
                <div className="w-[45%]">
                  <label className="text-xs text-muted-foreground">Max</label>
                  <Input 
                    value={maxPriceInput} 
                    onChange={handleMaxPriceChange} 
                    className="mt-1" 
                  />
                </div>
              </div>
              <Button className="w-full mt-2" size="sm">Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Area Size Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Area
              <SquareDot className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Area Size (sq ft)</h4>
              <Slider
                defaultValue={areaRange}
                value={areaRange}
                min={100}
                max={10000}
                step={100}
                onValueChange={(value) => setAreaRange(value as number[])}
                className="mb-6"
              />
              <div className="flex items-center justify-between">
                <div className="w-[45%]">
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input 
                    value={minAreaInput} 
                    onChange={handleMinAreaChange} 
                    className="mt-1" 
                  />
                </div>
                <div className="text-muted-foreground">—</div>
                <div className="w-[45%]">
                  <label className="text-xs text-muted-foreground">Max</label>
                  <Input 
                    value={maxAreaInput} 
                    onChange={handleMaxAreaChange} 
                    className="mt-1" 
                  />
                </div>
              </div>
              <Button className="w-full mt-2" size="sm">Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Beds Dropdown */}
        <Select value={bedsCount} onValueChange={setBedsCount}>
          <SelectTrigger className="h-8 rounded-full w-[100px] border border-input bg-background">
            <span className="flex items-center">
              <Bed className="mr-1 h-3.5 w-3.5" />
              <span>{bedsCount === "Any" ? "Beds" : `${bedsCount} Beds`}</span>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any</SelectItem>
            <SelectItem value="1">1 Bed</SelectItem>
            <SelectItem value="2">2 Beds</SelectItem>
            <SelectItem value="3">3 Beds</SelectItem>
            <SelectItem value="4">4 Beds</SelectItem>
            <SelectItem value="5+">5+ Beds</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Baths Dropdown */}
        <Select value={bathsCount} onValueChange={setBathsCount}>
          <SelectTrigger className="h-8 rounded-full w-[100px] border border-input bg-background">
            <span className="flex items-center">
              <Bath className="mr-1 h-3.5 w-3.5" />
              <span>{bathsCount === "Any" ? "Baths" : `${bathsCount} Baths`}</span>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any</SelectItem>
            <SelectItem value="1">1 Bath</SelectItem>
            <SelectItem value="2">2 Baths</SelectItem>
            <SelectItem value="3">3 Baths</SelectItem>
            <SelectItem value="4+">4+ Baths</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Home Type Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Home Type
              <Home className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3">
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type, i) => (
                <button 
                  key={i}
                  className="flex flex-col items-center justify-center p-3 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="p-2 rounded-full bg-muted mb-1">
                    {type.icon}
                  </div>
                  <span className="text-xs">{type.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex ml-auto">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm" 
            className="rounded-l-md rounded-r-none"
            onClick={() => setViewMode('list')}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'map' ? 'default' : 'outline'} 
            size="sm" 
            className="rounded-l-none rounded-r-none border-l-0 border-r-0"
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'split' ? 'default' : 'outline'}
            size="sm" 
            className="rounded-l-none rounded-r-md"
            onClick={() => setViewMode('split')}
          >
            <div className="h-4 w-4 flex items-center justify-center">
              <div className="h-full w-1/2 border-r"></div>
            </div>
          </Button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Sidebar - Collapsible */}
        <div 
          className={cn(
            "border-r bg-background overflow-y-auto pt-4 flex flex-col h-full transition-all duration-300",
            sidebarCollapsed ? "w-0 md:w-14 overflow-hidden" : "w-64"
          )}
        >
          {/* Toggle button to collapse/expand */}
          <div className="px-4 flex justify-between items-center mb-4">
            <h2 className={cn("font-semibold text-lg", sidebarCollapsed && "hidden md:hidden")}>Filters</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8", 
                sidebarCollapsed && "mx-auto"
              )}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Sidebar Content - Only shows fully when expanded */}
          <div className={cn("flex-1", sidebarCollapsed && "hidden md:hidden")}>
            <div className="px-4 pb-4">
              <h2 className="font-semibold text-lg">Property Type</h2>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {propertyTypes.map((type, i) => (
                  <button 
                    key={i}
                    className="flex flex-col items-center justify-center p-3 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="p-2 rounded-full bg-muted mb-1">
                      {type.icon}
                    </div>
                    <span className="text-xs">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t px-4 py-4">
              <h2 className="font-semibold mb-4">Price Range</h2>
              <div className="text-sm text-muted-foreground flex justify-between mb-2">
                <span>Monthly</span>
                <span>${priceRange[0]} - ${priceRange[1]}</span>
              </div>
              <Slider
                value={priceRange}
                min={100}
                max={2000}
                step={50}
                onValueChange={(value) => setPriceRange(value as number[])}
                className="mb-4"
              />
              <div className="flex items-center justify-between">
                <div className="w-[45%]">
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input 
                    value={minPriceInput} 
                    onChange={handleMinPriceChange} 
                    className="mt-1" 
                  />
                </div>
                <div className="text-muted-foreground">—</div>
                <div className="w-[45%]">
                  <label className="text-xs text-muted-foreground">Max</label>
                  <Input 
                    value={maxPriceInput} 
                    onChange={handleMaxPriceChange} 
                    className="mt-1" 
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t px-4 py-4">
              <h2 className="font-semibold mb-4">Area (sq ft)</h2>
              <div className="text-sm text-muted-foreground flex justify-between mb-2">
                <span>Size</span>
                <span>{areaRange[0]} - {areaRange[1]} sq ft</span>
              </div>
              <Slider
                value={areaRange}
                min={100}
                max={10000}
                step={100}
                onValueChange={(value) => setAreaRange(value as number[])}
                className="mb-4"
              />
              <div className="flex items-center justify-between">
                <div className="w-[45%]">
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input 
                    value={minAreaInput} 
                    onChange={handleMinAreaChange} 
                    className="mt-1" 
                  />
                </div>
                <div className="text-muted-foreground">—</div>
                <div className="w-[45%]">
                  <label className="text-xs text-muted-foreground">Max</label>
                  <Input 
                    value={maxAreaInput} 
                    onChange={handleMaxAreaChange} 
                    className="mt-1" 
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t px-4 py-4">
              <h2 className="font-semibold mb-4">Specialty Housing</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="senior" className="mr-2" />
                  <label htmlFor="senior">Senior Living</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="student" className="mr-2" />
                  <label htmlFor="student">Student Housing</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="income" className="mr-2" />
                  <label htmlFor="income">Income Restricted</label>
                </div>
              </div>
            </div>
            
            <div className="border-t px-4 py-4">
              <h2 className="font-semibold mb-4">Move-in Date</h2>
              <Input 
                type="date" 
                className="w-full" 
              />
            </div>
            
            <div className="border-t px-4 py-4">
              <h2 className="font-semibold mb-4">Conveniences</h2>
              <div className="space-y-3">
                {amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center">
                    <Button variant="outline" size="sm" className="rounded-md mr-2 w-8 h-8 p-0">
                      {amenity.icon}
                    </Button>
                    <span className="text-sm">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Apply button - always shown */}
          <div className={cn("border-t p-4", sidebarCollapsed && "hidden md:hidden")}>
            <Button className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Map and Properties area */}
        <div className="flex-1 flex relative h-full">
          {/* Map container - conditionally sized based on view mode */}
          {viewMode !== 'list' && (
            <div 
              className={cn(
                "relative h-full", 
                viewMode === 'map' ? 'w-full' : 'w-1/2'
              )}
            >
              <div 
                ref={mapContainer} 
                className="absolute inset-0 z-10 bg-muted"
                style={{ width: '100%', height: '100%' }}
              />
              
              {/* Location label */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm z-20">
                <span className="font-medium">DHA PHASE 5, Lahore</span>
              </div>
            </div>
          )}
          
          {/* Property listing - conditionally sized based on view mode */}
          {viewMode !== 'map' && (
            <div 
              className={cn(
                "bg-background overflow-y-auto", 
                viewMode === 'list' ? 'w-full' : 'w-1/2'
              )}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Available Properties</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort:</span>
                    <Button variant="outline" size="sm">
                      Price
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {properties.map(property => renderPropertyCard(property))}
                </div>
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