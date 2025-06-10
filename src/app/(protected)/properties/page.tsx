"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  MapPin, Filter, Home, Building, Search, Bath, Bed, CheckSquare, 
  Wifi, Tv, MountainSnow, Waves, PawPrint, User, MenuIcon, Heart, 
  ChevronLeft, Grid2X2, Calendar, 
  Star, X, ChevronsDown, ArrowDownUp, Square, 
  ChevronRight, SquareDot, MapIcon as MapIconLucide, ListIcon as ListIconLucide
} from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

// Currency conversion rate (1 USD = 280 PKR approximately)
const USD_TO_PKR = 280;

// Helper function to format price in PKR
const formatPricePKR = (usdPrice: number) => {
  const pkrPrice = usdPrice * USD_TO_PKR;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pkrPrice);
};

// Helper function to convert USD range to PKR for filtering
const convertUSDRangeToPKR = (usdRange: number[]) => {
  return usdRange.map(price => price * USD_TO_PKR);
};

// Property types
const propertyTypes = [
  { name: "Home", icon: <Home className="h-5 w-5" /> },
  { name: "Flat", icon: <Building className="h-5 w-5" /> }, 
  { name: "Portion", icon: <Building className="h-5 w-5" /> },
  { name: "Farm", icon: <Home className="h-5 w-5" /> }
]

// Property purposes
const propertyPurposes = [
  { name: "Rent", icon: <Calendar className="h-5 w-5" /> },
  { name: "Sell", icon: <Grid2X2 className="h-5 w-5" /> }
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
  // Get properties with loading and error states
  const allProperties = useQuery(api.properties.getAllProperties);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handle loading and error states
  useEffect(() => {
    if (allProperties === undefined) {
      setIsLoading(true);
      setError(null);
    } else if (allProperties === null) {
      setIsLoading(false);
      setError("Failed to fetch properties");
    } else {
      setIsLoading(false);
      setError(null);
      console.log('Properties loaded:', allProperties.length);
    }
  }, [allProperties]);
  
  // Get user data
  const { user } = useClerk()
  const userIdQuery = useQuery(api.users.getUserByClerkId, { 
    clerkId: user?.id ?? ""
  });
  const userId = userIdQuery?._id;
  
  // Get user's favorites
  const favoritesQuery = useQuery(
    api.favorites.getUserFavorites, 
    userId ? { userId } : "skip"
  );
  const [favoritesMap, setFavoritesMap] = useState<Map<string, boolean>>(new Map());
  
  // Update favorites map when query results change
  useEffect(() => {
    if (favoritesQuery) {
      const newMap = new Map<string, boolean>();
      favoritesQuery.forEach(property => {
        newMap.set(property._id as string, true);
      });
      setFavoritesMap(newMap);
    }
  }, [favoritesQuery]);
  
  // Mutations for adding and removing favorites
  const addToFavorites = useMutation(api.favorites.addFavorite);
  const removeFromFavorites = useMutation(api.favorites.removeFavorite);
  
  // Toggle favorite status for a property
  const toggleFavorite = async (e: React.MouseEvent, propertyId: Id<"properties">) => {
    e.preventDefault(); // Prevent navigating to property detail page
    e.stopPropagation(); // Prevent bubbling up to parent elements
    
    if (!userId) {
      toast.error("Please sign in to save favorites");
      return;
    }
    
    try {
      const isFavorited = favoritesMap.get(propertyId as string);
      
      if (isFavorited) {
        await removeFromFavorites({ userId, propertyId });
        // Optimistic UI update
        setFavoritesMap((prev: Map<string, boolean>) => {
          const newMap = new Map<string, boolean>(prev);
          newMap.delete(propertyId as string);
          return newMap;
        });
        toast.success("Removed from favorites");
      } else {
        await addToFavorites({ userId, propertyId });
        // Optimistic UI update
        setFavoritesMap((prev: Map<string, boolean>) => {
          const newMap = new Map<string, boolean>(prev);
          newMap.set(propertyId as string, true);
          return newMap;
        });
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
      console.error("Error updating favorites:", error);
    }
  };

  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('split')
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null)
  const [viewport, setViewport] = useState({
    latitude: 31.4697,
    longitude: 74.3991,
    zoom: 13
  })
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popupRefs = useRef<{[key: string]: mapboxgl.Popup}>({})
  
  // Initialize with wider ranges
  const [priceRange, setPriceRange] = useState([20000, 1000000]) // PKR values (20K to 1M PKR)
  const [minPriceInput, setMinPriceInput] = useState(`PKR ${priceRange[0].toLocaleString()}`)
  const [maxPriceInput, setMaxPriceInput] = useState(`PKR ${priceRange[1].toLocaleString()}`)
  const [areaRange, setAreaRange] = useState([0, 10000]) // Wider area range
  const [minAreaInput, setMinAreaInput] = useState(`${areaRange[0]}`)
  const [maxAreaInput, setMaxAreaInput] = useState(`${areaRange[1]}`)
  const [bedsCount, setBedsCount] = useState<string>("Any")
  const [bathsCount, setBathsCount] = useState<string>("Any")
  const [defaultCollapsed, setDefaultCollapsed] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  // Filter properties based on all active filters
  const filteredProperties = (allProperties || []).filter(property => {
    // Ensure property has required fields
    if (!property || !property.price || !property.areaSize) {
      console.log('Filtering out property due to missing required fields:', property);
      return false;
    }

    // Search query filter (location/city)
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase().trim();
      const cityMatch = property.city?.toLowerCase().includes(searchLower);
      const titleMatch = property.title?.toLowerCase().includes(searchLower);
      
      if (!cityMatch && !titleMatch) {
        return false;
      }
    }

    // Price range filter (only if changed from initial values)
    const propertyPricePKR = property.price * USD_TO_PKR;
    if (priceRange[0] !== 20000 || priceRange[1] !== 1000000) {
      if (propertyPricePKR < priceRange[0] || propertyPricePKR > priceRange[1]) {
        return false;
      }
    }

    // Area range filter (only if changed from initial values)
    if (areaRange[0] !== 0 || areaRange[1] !== 10000) {
      if (property.areaSize < areaRange[0] || property.areaSize > areaRange[1]) {
        return false;
      }
    }

    // Bedrooms filter (only if not "Any")
    if (bedsCount !== "Any") {
      const bedsNumber = bedsCount === "5+" ? 5 : parseInt(bedsCount);
      if (bedsCount === "5+") {
        if (property.bedrooms < bedsNumber) return false;
      } else {
        if (property.bedrooms !== bedsNumber) return false;
      }
    }

    // Bathrooms filter (only if not "Any")
    if (bathsCount !== "Any") {
      const bathsNumber = bathsCount === "4+" ? 4 : parseInt(bathsCount);
      if (bathsCount === "4+") {
        if (property.bathrooms < bathsNumber) return false;
      } else {
        if (property.bathrooms !== bathsNumber) return false;
      }
    }

    // Property type filter (only if selected)
    if (selectedType) {
      if (property.type?.toLowerCase() !== selectedType) {
        return false;
      }
    }

    // Property purpose filter (only if selected)
    if (selectedPurpose) {
      if (property.purpose?.toLowerCase() !== selectedPurpose) {
        return false;
      }
    }

    return true;
  });

  // Debug logging for filtered results
  useEffect(() => {
    console.log('Filtered properties:', filteredProperties);
  }, [filteredProperties]);

  // Use filtered properties for display
  const properties = filteredProperties;
  
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
        // Use default center for Lahore
        const center = [viewport.longitude, viewport.latitude];
        
        // Disable sending anonymous usage data to Mapbox
        const mapboxMap = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: center as [number, number],
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
    }
    
    // Cleanup function
    return () => {
      // Don't remove map here, let it persist
    };
  }, [viewMode]); // Only re-run when view mode changes

  // Separate useEffect for handling markers and popups
  useEffect(() => {
    if (!map.current || !mapLoaded || !properties || properties.length === 0) return;
    
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
      img.src = property.images[0];
      img.className = 'w-full h-full object-cover';
      imgContainer.appendChild(img);
      
      // Add price badge
      const priceEl = document.createElement('div');
      priceEl.className = 'absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md';
      priceEl.textContent = formatPricePKR(property.price);
      
      markerContent.appendChild(imgContainer);
      markerContent.appendChild(priceEl);
      markerEl.appendChild(markerContent);
      
      // Create marker and add to map - ensure coordinates are in the correct format
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([property.location.longitude, property.location.latitude] as [number, number])
        .addTo(map.current!);
      
      // Handle marker click
      markerEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProperty(property._id === selectedProperty ? null : property._id);
      });
      
      // Handle marker hover
      markerEl.addEventListener('mouseenter', () => {
        setHoveredProperty(property._id);
      });
      
      markerEl.addEventListener('mouseleave', () => {
        setHoveredProperty(null);
      });
    });
    
  }, [mapLoaded, properties, selectedProperty, hoveredProperty]); // Dependencies for markers and popups

  // Separate useEffect for popups
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing popups
    Object.values(popupRefs.current).forEach(popup => popup.remove());
    popupRefs.current = {};

    // Show popup for hovered property (preview)
    if (hoveredProperty && properties) {
      const property = properties.find(p => p._id === hoveredProperty);
      if (property) {
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 w-64';
        
        const img = document.createElement('img');
        img.src = property.images[0];
        img.alt = property.title;
        img.className = 'w-full h-32 object-cover rounded-md mb-2';
        
        const title = document.createElement('h3');
        title.className = 'font-bold text-sm';
        title.textContent = property.title;
        
        const location = document.createElement('p');
        location.className = 'text-xs text-muted-foreground mb-2';
        location.textContent = property.city;
        
        const details = document.createElement('div');
        details.className = 'flex justify-between items-center';
        
        const rating = document.createElement('div');
        rating.className = 'flex items-center gap-1 text-xs';
        rating.innerHTML = `<svg class="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span>4.8</span>`;
        
        const price = document.createElement('p');
        price.className = 'font-bold text-sm';
        price.innerHTML = `${formatPricePKR(property.price)}<span class="text-xs font-normal text-muted-foreground">${property.purpose === 'rent' ? '/mo' : ''}</span>`;
        
        details.appendChild(rating);
        details.appendChild(price);
        
        popupContent.appendChild(img);
        popupContent.appendChild(title);
        popupContent.appendChild(location);
        popupContent.appendChild(details);
        
        // Create and store the popup reference
        const popup = new mapboxgl.Popup({ 
          closeButton: false, 
          closeOnClick: false,
          anchor: 'bottom',
          offset: [0, -10]
        })
          .setLngLat([property.location.longitude, property.location.latitude] as [number, number])
          .setDOMContent(popupContent)
          .addTo(map.current!);
        
        popupRefs.current[property._id] = popup;
      }
    }
    
    // Show detailed popup for selected property
    if (selectedProperty && properties) {
      const property = properties.find(p => p._id === selectedProperty);
      if (property) {
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 w-72';
        
        const img = document.createElement('img');
        img.src = property.images[0];
        img.alt = property.title;
        img.className = 'w-full h-40 object-cover rounded-md mb-3';
        
        const title = document.createElement('h3');
        title.className = 'font-bold mb-1';
        title.textContent = property.title;
        
        const location = document.createElement('p');
        location.className = 'text-sm text-muted-foreground mb-2';
        location.textContent = property.city;
        
        const propertyDetails = document.createElement('div');
        propertyDetails.className = 'flex gap-4 text-sm mb-3';
        propertyDetails.innerHTML = `
          <div class="flex items-center"><svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>${property.bedrooms}</div>
          <div class="flex items-center"><svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 2v4h8V2M8 6v4h8V6m0 4v4H8v-4m8 4v4H8v-4"></path></svg>${property.bathrooms}</div>
          <div class="flex items-center"><svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>${property.areaSize} sqft</div>
        `;
        
        const details = document.createElement('div');
        details.className = 'flex justify-between items-center';
        
        const rating = document.createElement('div');
        rating.className = 'flex items-center gap-1 text-sm';
        rating.innerHTML = `<svg class="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span>4.8</span>`;
        
        const price = document.createElement('p');
        price.className = 'font-bold';
        price.innerHTML = `${formatPricePKR(property.price)}<span class="text-sm font-normal text-muted-foreground">${property.purpose === 'rent' ? '/mo' : ''}</span>`;
        
        const viewButton = document.createElement('button');
        viewButton.className = 'w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90';
        viewButton.textContent = 'View Details';
        viewButton.onclick = () => {
          window.open(`/properties/${property._id}`, '_blank');
        };
        
        details.appendChild(rating);
        details.appendChild(price);
        
        popupContent.appendChild(img);
        popupContent.appendChild(title);
        popupContent.appendChild(location);
        popupContent.appendChild(propertyDetails);
        popupContent.appendChild(details);
        popupContent.appendChild(viewButton);
        
        // Create and store the popup reference
        const popup = new mapboxgl.Popup({ 
          closeButton: true, 
          closeOnClick: false,
          anchor: 'bottom',
          offset: [0, -10]
        })
          .setLngLat([property.location.longitude, property.location.latitude] as [number, number])
          .setDOMContent(popupContent)
          .addTo(map.current!);
        
        // Handle popup close
        popup.on('close', () => {
          setSelectedProperty(null);
        });
        
        popupRefs.current[property._id + '_selected'] = popup;
      }
    }
  }, [hoveredProperty, selectedProperty, mapLoaded, properties]);

  useEffect(() => {
    setMinPriceInput(`PKR ${priceRange[0].toLocaleString()}`)
    setMaxPriceInput(`PKR ${priceRange[1].toLocaleString()}`)
  }, [priceRange])

  useEffect(() => {
    setMinAreaInput(`${areaRange[0]}`)
    setMaxAreaInput(`${areaRange[1]}`)
  }, [areaRange])

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '') // Remove all non-digit characters
    if (value) {
      const numValue = parseInt(value)
      setMinPriceInput(`PKR ${numValue.toLocaleString()}`)
      if (numValue < priceRange[1]) {
        setPriceRange([numValue, priceRange[1]])
      }
    } else {
      setMinPriceInput('PKR ')
    }
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '') // Remove all non-digit characters
    if (value) {
      const numValue = parseInt(value)
      setMaxPriceInput(`PKR ${numValue.toLocaleString()}`)
      if (numValue > priceRange[0]) {
        setPriceRange([priceRange[0], numValue])
      }
    } else {
      setMaxPriceInput('PKR ')
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

  const renderPropertyCard = (property: any) => {
    const isFavorited = favoritesMap.get(property._id);
    
    return (
      <div
        key={property._id}
        className={cn(
          "relative rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer",
          selectedProperty === property._id ? "ring-2 ring-primary" : "",
          hoveredProperty === property._id ? "shadow-lg" : ""
        )} 
        onMouseEnter={() => setHoveredProperty(property._id)}
        onMouseLeave={() => setHoveredProperty(null)}
        onClick={() => window.open(`/properties/${property._id}`, '_blank')}
      >
        <div className="relative h-64 overflow-hidden">
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="object-cover w-full h-full"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
            onClick={(e) => toggleFavorite(e, property._id)}
          >
            <Heart 
              className={cn(
                "h-4 w-4", 
                isFavorited 
                  ? "fill-red-500 text-red-500" 
                  : "text-muted-foreground"
              )} 
            />
          </Button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium line-clamp-1">{property.title}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="ml-1 text-sm">4.8</span>
            </div>
          </div>
          <div className="mt-1 text-sm text-muted-foreground flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
            <span className="truncate">{property.city}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.areaSize} sqft</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="font-medium">
              {formatPricePKR(property.price)}
              <span className="text-xs text-muted-foreground font-normal">
                {property.purpose === 'rent' ? '/mo' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Cleanup useEffect for component unmount
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      Object.values(popupRefs.current).forEach(popup => popup.remove());
      popupRefs.current = {};
    };
  }, []);

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
              <Grid2X2 className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Price Range</h4>
              <Slider
                defaultValue={priceRange}
                value={priceRange}
                min={20000}
                max={1000000}
                step={10000}
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
                min={0}
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
              Property Type
              <Home className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3">
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type, i) => (
                <button 
                  key={i}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 border rounded-lg transition-colors",
                    selectedType === type.name.toLowerCase() 
                      ? "border-primary bg-primary/5" 
                      : "hover:border-primary"
                  )}
                  onClick={() => setSelectedType(
                    selectedType === type.name.toLowerCase() ? null : type.name.toLowerCase()
                  )}
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
        
        {/* Add Purpose Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Purpose
              <Grid2X2 className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3">
            <div className="grid grid-cols-2 gap-2">
              {propertyPurposes.map((purpose, i) => (
                <button 
                  key={i}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 border rounded-lg transition-colors",
                    selectedPurpose === purpose.name.toLowerCase() 
                      ? "border-primary bg-primary/5" 
                      : "hover:border-primary"
                  )}
                  onClick={() => setSelectedPurpose(
                    selectedPurpose === purpose.name.toLowerCase() ? null : purpose.name.toLowerCase()
                  )}
                >
                  <div className="p-2 rounded-full bg-muted mb-1">
                    {purpose.icon}
                  </div>
                  <span className="text-xs">{purpose.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex ml-auto">
          <Button 
            size="icon" 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => setViewMode('list')}
          >
            <ListIconLucide className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'map' ? 'default' : 'outline'} 
            size="sm" 
            className="rounded-l-none rounded-r-none border-l-0 border-r-0"
            onClick={() => setViewMode('map')}
          >
            <MapIconLucide className="h-4 w-4" />
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
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border rounded-lg transition-colors",
                      selectedType === type.name.toLowerCase() 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-primary"
                    )}
                    onClick={() => setSelectedType(
                      selectedType === type.name.toLowerCase() ? null : type.name.toLowerCase()
                    )}
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
              <h2 className="font-semibold mb-4">Purpose</h2>
              <div className="grid grid-cols-2 gap-2">
                {propertyPurposes.map((purpose, i) => (
                  <button 
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border rounded-lg transition-colors",
                      selectedPurpose === purpose.name.toLowerCase() 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-primary"
                    )}
                    onClick={() => setSelectedPurpose(
                      selectedPurpose === purpose.name.toLowerCase() ? null : purpose.name.toLowerCase()
                    )}
                  >
                    <div className="p-2 rounded-full bg-muted mb-1">
                      {purpose.icon}
                    </div>
                    <span className="text-xs">{purpose.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t px-4 py-4">
              <h2 className="font-semibold mb-4">Price Range (PKR)</h2>
              <div className="text-sm text-muted-foreground flex justify-between mb-2">
                <span>Monthly</span>
                <span>PKR {priceRange[0].toLocaleString()} - PKR {priceRange[1].toLocaleString()}</span>
              </div>
              <Slider
                value={priceRange}
                min={20000}
                max={1000000}
                step={10000}
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
                min={0}
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
              <h2 className="font-semibold mb-4">Bedrooms & Bathrooms</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Bedrooms</label>
                  <Select value={bedsCount} onValueChange={setBedsCount}>
                    <SelectTrigger className="w-full">
                      <span className="flex items-center">
                        <Bed className="mr-1 h-3.5 w-3.5" />
                        <span>{bedsCount === "Any" ? "Any" : `${bedsCount} Beds`}</span>
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
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Bathrooms</label>
                  <Select value={bathsCount} onValueChange={setBathsCount}>
                    <SelectTrigger className="w-full">
                      <span className="flex items-center">
                        <Bath className="mr-1 h-3.5 w-3.5" />
                        <span>{bathsCount === "Any" ? "Any" : `${bathsCount} Baths`}</span>
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
                </div>
              </div>
            </div>
            
            <div className="border-t p-4">
              <Button className="w-full">
                Apply Filters
              </Button>
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
                  <h2 className="text-lg font-semibold">
                    Available Properties {!isLoading && !error && `(${(allProperties || []).length})`}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort:</span>
                    <Button variant="outline" size="sm">
                      Price
                    </Button>
                  </div>
                </div>

                {/* Active Filters */}
                {(searchQuery || 
                  priceRange[0] !== 20000 || 
                  priceRange[1] !== 1000000 ||
                  areaRange[0] !== 0 ||
                  areaRange[1] !== 10000 ||
                  bedsCount !== "Any" ||
                  bathsCount !== "Any" ||
                  selectedType ||
                  selectedPurpose) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {searchQuery && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        {searchQuery}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchQuery("")} />
                      </Badge>
                    )}
                    {(priceRange[0] !== 20000 || priceRange[1] !== 1000000) && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Grid2X2 className="h-3 w-3" />
                        {`${formatPricePKR(priceRange[0])} - ${formatPricePKR(priceRange[1])}`}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setPriceRange([20000, 1000000])} />
                      </Badge>
                    )}
                    {(areaRange[0] !== 0 || areaRange[1] !== 10000) && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Square className="h-3 w-3" />
                        {`${areaRange[0]} - ${areaRange[1]} sqft`}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setAreaRange([0, 10000])} />
                      </Badge>
                    )}
                    {bedsCount !== "Any" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {`${bedsCount} Beds`}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setBedsCount("Any")} />
                      </Badge>
                    )}
                    {bathsCount !== "Any" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {`${bathsCount} Baths`}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setBathsCount("Any")} />
                      </Badge>
                    )}
                    {selectedType && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        {selectedType}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedType(null)} />
                      </Badge>
                    )}
                    {selectedPurpose && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {selectedPurpose === 'rent' ? <Calendar className="h-3 w-3" /> : <Grid2X2 className="h-3 w-3" />}
                        {selectedPurpose}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedPurpose(null)} />
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        setSearchQuery("");
                        setPriceRange([20000, 1000000]);
                        setAreaRange([0, 10000]);
                        setBedsCount("Any");
                        setBathsCount("Any");
                        setSelectedType(null);
                        setSelectedPurpose(null);
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading properties...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (allProperties || []).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No properties found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {(allProperties || []).map(property => renderPropertyCard(property))}
                  </div>
                )}
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