"use client"

import React, { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
  const id = typeof params.id === 'string' ? params.id : ''
  
  // Query the property from Convex using the ID from params
  const property = useQuery(api.properties.getProperty, { id: id as Id<"properties"> });
  
  const [selectedImage, setSelectedImage] = useState(0)
  
  // Always declare hooks, regardless of whether property is loaded
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current || !property) return
    
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
          center: [property.location.longitude, property.location.latitude],
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
          const el = document.createElement('div');
          el.className = 'custom-marker';
          
          // Create a more distinctive property marker with CSS
          el.style.width = '36px';
          el.style.height = '36px';
          el.style.backgroundSize = '100%';
          el.style.backgroundImage = 'none'; // Remove default image
          el.style.backgroundColor = '#ef4444'; // Red color for visibility
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
          el.style.cursor = 'pointer';
          
          // Add an inner dot
          const inner = document.createElement('div');
          inner.style.position = 'absolute';
          inner.style.top = '50%';
          inner.style.left = '50%';
          inner.style.transform = 'translate(-50%, -50%)';
          inner.style.width = '12px';
          inner.style.height = '12px';
          inner.style.backgroundColor = 'white';
          inner.style.borderRadius = '50%';
          el.appendChild(inner);
          
          // Fly to the property location with animation
          map.current?.flyTo({
            center: [property.location.longitude, property.location.latitude],
            zoom: 15,
            essential: true,
            duration: 1000
          });
          
          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat([property.location.longitude, property.location.latitude])
            .addTo(map.current!);
            
          // Add popup with address information
          new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 25
          })
            .setLngLat([property.location.longitude, property.location.latitude])
            .setHTML(`<div class="font-medium text-center">${property.city}</div>`)
            .addTo(map.current!);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, [property]);
  
  // Don't try to render the page until property data is loaded
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Images for the gallery (main image + additional images)
  const galleryImages = property.images || []
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Back button */}
      <Link href="/properties" className="inline-flex items-center gap-2 mb-6 hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Search</span>
      </Link>
      
      {/* Property title and location */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
        <div className="flex items-center mt-2 text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{property.city}</span>
        </div>
      </div>
      
      {/* Image gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 rounded-lg overflow-hidden h-[300px] md:h-[400px] relative">
          {galleryImages.length > 0 && (
            <Image 
              src={galleryImages[selectedImage]} 
              alt={property.title}
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 h-full">
          {galleryImages.slice(0, 4).map((image, index) => (
            <div 
              key={index} 
              className={`relative rounded-lg overflow-hidden cursor-pointer h-[140px] md:h-auto ${
                selectedImage === index ? 'ring-4 ring-primary' : ''
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <Image 
                src={image} 
                alt={`${property.title} ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              {index === 3 && galleryImages.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">+{galleryImages.length - 4} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Property details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {/* Basic details */}
          <div className="flex flex-wrap gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold">{property.purpose === 'rent' ? 'For Rent' : 'For Sale'}</h3>
              <p className="text-3xl font-bold mt-1">${property.price.toLocaleString()}
                <span className="text-base font-normal text-muted-foreground">
                  {property.purpose === 'rent' ? '/mo' : ''}
                </span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Bedrooms</h3>
              <p className="text-3xl font-bold mt-1">{property.bedrooms}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Bathrooms</h3>
              <p className="text-3xl font-bold mt-1">{property.bathrooms}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Size</h3>
              <p className="text-3xl font-bold mt-1">{property.areaSize} <span className="text-base font-normal text-muted-foreground">sq ft</span></p>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
          </div>
          
          {/* Property features */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Property Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <PropertyFeature icon={<Bed className="h-5 w-5" />} text={`${property.bedrooms} Bedrooms`} />
              <PropertyFeature icon={<Bath className="h-5 w-5" />} text={`${property.bathrooms} Bathrooms`} />
              <PropertyFeature icon={<Home className="h-5 w-5" />} text={property.type.charAt(0).toUpperCase() + property.type.slice(1)} />
              <PropertyFeature icon={<Grid2X2 className="h-5 w-5" />} text={`${property.areaSize} sq ft`} />
            </div>
          </div>
          
          {/* VR Tour */}
          {property.vrTourLink && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Virtual Tour</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe 
                  src={property.vrTourLink} 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Map */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <div ref={mapContainer} className="h-[400px] rounded-lg overflow-hidden" />
          </div>
        </div>
        
        {/* Contact information */}
        <div>
          <div className="bg-muted p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            {property.contactInfo.email && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Email:</p>
                <p className="font-medium">{property.contactInfo.email}</p>
              </div>
            )}
            {property.contactInfo.phone && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Phone:</p>
                <p className="font-medium">{property.contactInfo.phone}</p>
              </div>
            )}
            <Button className="w-full">Contact Agent</Button>
          </div>
          
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Schedule a Viewing</h3>
            <Button variant="outline" className="w-full">Schedule Now</Button>
          </div>
        </div>
      </div>
    </div>
  )
} 