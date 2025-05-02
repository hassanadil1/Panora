"use client"

import React, { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  MapPin, Heart, ArrowLeft, Star, Check, 
  Bed, Bath, Waves, Wifi, Tv, MountainSnow, PawPrint, 
  Home, Grid2X2, ArrowRight, Star as StarIcon 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mock properties data - same as in properties page
const properties = [
  {
    id: 1,
    title: "Sunset Bungalows",
    location: "DHA Phase 5, Lahore, Pakistan",
    price: 530,
    beds: 2,
    baths: 1,
    area: 980,
    hasPool: true,
    rating: 4.8,
    reviews: 347,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
    coordinates: [74.3991, 31.4697],
    description: "Experience resort style luxury living at Sunset Bungalows. Our newly built community features sophisticated two and three-bedroom residences, each complete with high-end designer finishes, open concept oversized floor plans, gourmet kitchens, and a full size in-unit washer and dryer. Find your personal escape at home beside stunning swimming pools and spas with poolside cabanas. Experience your own private landscaped courtyards, with indoor/outdoor entertainment seating. By day, lounge in the BBQ area and experience the breath taking unobstructed views stretching from the Parus Islands Peninsula to the Santa Monica Mountains. Light up your day with a workout in our full-size state of the art fitness club and yoga studio.",
    amenities: ["Washer/Dryer", "Air Conditioning", "High-Speed Internet", "Walk-In Closets", "Polished Floors", "Refrigerator", "Dishwasher", "Microwave"],
    highlights: ["High-Speed Internet Access", "Washer/Dryer", "Air Conditioning", "Heating", "Cable Ready", "Satellite TV", "Double Vanities", "Smoke Free", "Tub/Shower", "Intercom", "Sprinkler System"],
    fees: {
      application: 30,
      pets: true,
      parking: true
    },
    additionalImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    ]
  },
  {
    id: 2,
    title: "Cangu Privat Villa",
    location: "DHA Phase 2, Lahore, Pakistan",
    price: 200,
    beds: 2,
    baths: 1,
    area: 1150,
    hasPool: true,
    rating: 4.8,
    reviews: 347,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    coordinates: [74.4091, 31.4797],
    description: "Located in the heart of Lahore's most exclusive neighborhood, this private villa offers an unparalleled living experience. Featuring high ceilings, floor-to-ceiling windows, and premium finishes throughout, this property is a perfect blend of luxury and comfort. The property includes access to community amenities including a gym, swimming pool, and 24/7 security.",
    amenities: ["Washer/Dryer", "Air Conditioning", "High-Speed Internet", "Walk-In Closets", "Polished Floors", "Refrigerator", "Dishwasher", "Microwave"],
    highlights: ["High-Speed Internet Access", "Washer/Dryer", "Air Conditioning", "Heating", "Cable Ready", "Satellite TV", "Double Vanities", "Smoke Free", "Tub/Shower", "Intercom", "Sprinkler System"],
    fees: {
      application: 30,
      pets: true,
      parking: true
    },
    additionalImages: [
      "https://images.unsplash.com/photo-1600607687644-c7e5eea20e81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    ]
  },
  {
    id: 3,
    title: "Villa Kayu Raja",
    location: "DHA Phase 6, Lahore, Pakistan",
    price: 130,
    beds: 1,
    baths: 1,
    area: 850,
    hasPool: true,
    rating: 4.5,
    reviews: 121,
    image: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    coordinates: [74.3971, 31.4607],
    description: "Welcome to Villa Kayu Raja, a serene and intimate property in the heart of DHA Phase 6. This charming villa offers a perfect blend of traditional and modern design elements, creating a warm and inviting atmosphere. The property features a private pool, spacious living areas, and lush gardens that provide perfect relaxation spaces and entertainment venues.",
    amenities: ["Washer/Dryer", "Air Conditioning", "High-Speed Internet", "Walk-In Closets", "Polished Floors", "Refrigerator", "Dishwasher", "Microwave"],
    highlights: ["High-Speed Internet Access", "Washer/Dryer", "Air Conditioning", "Heating", "Cable Ready", "Satellite TV", "Double Vanities", "Smoke Free", "Private Pool", "Garden View", "Sprinkler System"],
    fees: {
      application: 25,
      pets: true,
      parking: true
    },
    additionalImages: [
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    ]
  },
  {
    id: 4,
    title: "The Edge Bali",
    location: "DHA Phase 4, Lahore, Pakistan",
    price: 190,
    beds: 2,
    baths: 1,
    area: 920,
    hasPool: true,
    rating: 4.4,
    reviews: 134,
    image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    coordinates: [74.4081, 31.4727],
    description: "Experience the ultimate luxury at The Edge Bali, a stunning property inspired by Balinese aesthetics in the prestigious DHA Phase 4 area. This exclusive property offers breathtaking views, open-concept living spaces, and premium finishes throughout. The outdoor living area features a private infinity pool, perfect for relaxation and entertainment.",
    amenities: ["Washer/Dryer", "Air Conditioning", "High-Speed Internet", "Walk-In Closets", "Polished Floors", "Refrigerator", "Dishwasher", "Microwave", "Infinity Pool"],
    highlights: ["High-Speed Internet Access", "Washer/Dryer", "Air Conditioning", "Heating", "Cable Ready", "Satellite TV", "Double Vanities", "Smoke Free", "Tub/Shower", "Intercom", "Sprinkler System", "Open Concept Design"],
    fees: {
      application: 35,
      pets: true,
      parking: true
    },
    additionalImages: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    ]
  }
]

// Property Features Icons component for reuse
const PropertyFeature = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="p-5 border rounded-lg flex flex-col items-center justify-center gap-2">
    <div className="rounded-full p-2 bg-muted">
      {icon}
    </div>
    <span className="text-sm text-center">{text}</span>
  </div>
)

export default function PropertyDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? parseInt(params.id) : 0
  
  // Find the property based on the ID from the URL
  const property = properties.find(p => p.id === id) || properties[0]
  
  const [selectedImage, setSelectedImage] = useState(0)
  
  // Images for the gallery (main image + additional images)
  const galleryImages = [property.image, ...property.additionalImages]
  
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return
    
    // Initialize the map only once
    if (!map.current) {
      // Set access token
      (mapboxgl as any).accessToken = "pk.eyJ1IjoiaGFzc2FuYWRpbHpha2kiLCJhIjoiY205dTVqdjI3MDRvdTJqcjhneDFveTF1NCJ9.fRofO78X0uoH0_bfDDmI2Q";
      
      // Completely disable Mapbox telemetry
      (mapboxgl as any).config.DISABLE_ATTRIBUTION_CONTROL = true;
      (mapboxgl as any).config.TELEMETRY_DISABLED = true;
      (mapboxgl as any).prewarm = false; // Disable session warming
      
      try {
        // Create the map instance
        const mapboxMap = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: property.coordinates as [number, number],
          zoom: 15,
          attributionControl: false,
          collectResourceTiming: false
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
        
        // Add marker for the property
        map.current.on('load', () => {
          // Create a DOM element for the marker
          const markerEl = document.createElement('div');
          markerEl.className = 'custom-marker';
          
          // Create image container
          const markerContent = document.createElement('div');
          markerContent.className = 'relative';
          
          // Add property image
          const imgContainer = document.createElement('div');
          imgContainer.className = 'w-12 h-12 rounded-full border-2 border-primary overflow-hidden shadow-lg';
          
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
          new mapboxgl.Marker(markerEl)
            .setLngLat(property.coordinates as [number, number])
            .addTo(map.current!);
        });
        
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    }
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [property.coordinates, property.image, property.price]);
  
  return (
    <div className="min-h-screen pb-16">
      {/* Gallery Section */}
      <div className="relative">
        {/* Main hero image */}
        <div className="h-[300px] md:h-[500px] w-full relative">
          <Image 
            src={galleryImages[selectedImage]} 
            alt={property.title}
            className="object-cover"
            fill
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        {/* Navigation controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Link href="/properties">
            <Button variant="outline" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <Button variant="outline" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Thumbnail gallery */}
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 px-4">
          {galleryImages.slice(0, 4).map((img, i) => (
            <button 
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`h-20 w-20 rounded-md overflow-hidden border-2 ${i === selectedImage ? 'border-primary' : 'border-white'}`}
            >
              <Image 
                src={img} 
                alt={`${property.title} - image ${i+1}`}
                className="object-cover h-full w-full"
                width={80}
                height={80}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Property Info Section */}
      <div className="container max-w-6xl mx-auto mt-16 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left content - Property details */}
          <div className="flex-1">
            {/* Location and Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.location}
              </Badge>
            </div>
            
            {/* Property Title */}
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{property.title}</h1>
            
            {/* Ratings */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="ml-1 font-medium">{property.rating}</span>
              </div>
              <span className="text-muted-foreground">({property.reviews} reviews)</span>
              <Badge variant="outline" className="ml-2">
                <Check className="h-3 w-3 mr-1" /> Verified Listing
              </Badge>
            </div>
            
            {/* Key Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Monthly Rent</div>
                <div className="font-bold mt-1">${property.price} - ${property.price + 125}</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Bedrooms</div>
                <div className="font-bold mt-1">{property.beds} bd</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Bathrooms</div>
                <div className="font-bold mt-1">{property.baths} ba</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Square Feet</div>
                <div className="font-bold mt-1">{property.area} - {property.area + 170} sq ft</div>
              </div>
            </div>
            
            {/* Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button className="flex-1">Request Tour</Button>
              <Button variant="outline" className="flex-1">Message</Button>
            </div>
            
            {/* Info Panel */}
            <div className="p-4 rounded-md bg-muted mb-8">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="font-medium">English, Bahasa</span>
                </div>
                <div className="flex justify-between">
                  <span>Open by appointment:</span>
                  <span className="font-medium">Monday - Sunday</span>
                </div>
              </div>
            </div>
            
            {/* About Property */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">About {property.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>
            
            {/* Villa Features */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Villa Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <PropertyFeature icon={<Wifi className="h-5 w-5" />} text="Wireless/Dryer" />
                <PropertyFeature icon={<Tv className="h-5 w-5" />} text="Air Conditioning" />
                <PropertyFeature icon={<Home className="h-5 w-5" />} text="Dishwasher" />
                <PropertyFeature icon={<Grid2X2 className="h-5 w-5" />} text="High Speed Internet" />
                <PropertyFeature icon={<Bed className="h-5 w-5" />} text="Polished Floors" />
                <PropertyFeature icon={<PawPrint className="h-5 w-5" />} text="Walk-In Closets" />
                <PropertyFeature icon={<MountainSnow className="h-5 w-5" />} text="Microwave" />
                <PropertyFeature icon={<Bath className="h-5 w-5" />} text="Refrigerator" />
              </div>
            </div>
            
            {/* Highlights Section */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
                {property.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Fees and Policies */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Fees and Policies</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The fees below are based on community-supplied data and may exclude additional fees and utilities.
              </p>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Required Fees</h3>
                <div className="flex border-b py-2">
                  <div className="w-1/3 font-medium">Pets</div>
                  <div className="w-2/3">Allowed with deposit</div>
                </div>
                <div className="flex border-b py-2">
                  <div className="w-1/3 font-medium">Parking</div>
                  <div className="w-2/3">Assigned parking</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">One-Time Move-In Fees</h3>
                <div className="flex border-b py-2">
                  <div className="w-1/3 font-medium">Application Fee</div>
                  <div className="w-2/3">${property.fees.application}</div>
                </div>
              </div>
            </div>
            
            {/* Map and Location */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Map and Location</h2>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Property Address: {property.location}, Postal Code 90501</span>
              </div>
              
              {/* Map view */}
              <div 
                ref={mapContainer}
                className="h-60 rounded-md mb-4 relative overflow-hidden"
                style={{ width: '100%' }}
              />
              
              <Button variant="outline" className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              
              {/* Nearby Amenities Tabs */}
              <div className="mt-4 flex overflow-x-auto space-x-2 pb-2">
                {['Hotel', 'Restaurant', 'Bank', 'School', 'Shop', 'Fitness'].map((amenity) => (
                  <button 
                    key={amenity}
                    className="px-4 py-2 rounded-full bg-muted whitespace-nowrap text-sm"
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Contact Info */}
          <div className="md:w-80">
            <div className="sticky top-20 border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  CS
                </div>
                <div>
                  <h3 className="font-semibold">Contact The Property</h3>
                  <p className="text-primary">(424) 340-5574</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full">Request Tour</Button>
                <Button variant="outline" className="w-full">Message</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 