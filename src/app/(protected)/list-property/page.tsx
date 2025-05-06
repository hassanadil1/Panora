"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useClerk } from "@clerk/nextjs"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { 
  Home, 
  Building, 
  Upload, 
  PlusCircle, 
  Info, 
  MapPin, 
  DollarSign,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import Link from "next/link"

// Set your Mapbox access token
// In production, use environment variable
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
console.log("Mapbox token available:", !!mapboxToken);

// Property types
const propertyTypes = [
  { value: "home", label: "Home" },
  { value: "flat", label: "Apartment/Flat" },
  { value: "portion", label: "Portion" },
  { value: "farm", label: "Farm House" },
  { value: "villa", label: "Villa" },
  { value: "other", label: "Other" }
]

// Define the form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  purpose: z.enum(["rent", "sell"]),
  type: z.string(),
  city: z.string().min(2, "City name is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  areaSize: z.coerce.number().positive("Area size must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
  bedrooms: z.coerce.number().int().positive("Number of bedrooms must be positive"),
  bathrooms: z.coerce.number().positive("Number of bathrooms must be positive"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  vrTourLink: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal(""))
})

type FormValues = z.infer<typeof formSchema>

// Initial map center (Lahore, Pakistan)
const INITIAL_LAT = 31.5204;
const INITIAL_LNG = 74.3587;

export default function ListPropertyPage() {
  const router = useRouter()
  const { user } = useClerk()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [mapError, setMapError] = useState<string | null>(null)
  const [viewState, setViewState] = useState({
    longitude: INITIAL_LNG,
    latitude: INITIAL_LAT,
    zoom: 13
  });
  
  // Get userId from Convex
  const userIdQuery = useQuery(api.users.getUserByClerkId, { 
    clerkId: user?.id ?? ""
  })
  const userId = userIdQuery?._id
  
  // Mutation to create a property
  const createProperty = useMutation(api.properties.createProperty)

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      purpose: "rent",
      type: "home",
      city: "",
      latitude: INITIAL_LAT,
      longitude: INITIAL_LNG,
      areaSize: 0,
      price: 0,
      bedrooms: 1,
      bathrooms: 1,
      images: [],
      vrTourLink: "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      phone: ""
    },
  })

  // Update marker position when map is clicked
  const handleMapClick = useCallback((event: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = event.lngLat;
    form.setValue('longitude', lng, { shouldValidate: true });
    form.setValue('latitude', lat, { shouldValidate: true });
    setViewState(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat
    }));
  }, [form]);

  // Update marker position when marker is dragged
  const handleMarkerDrag = useCallback((event: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = event.lngLat;
    form.setValue('longitude', lng, { shouldValidate: true });
    form.setValue('latitude', lat, { shouldValidate: true });
    setViewState(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat
    }));
  }, [form]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast.error("Please sign in to list a property")
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Prepare the data
      const propertyData = {
        title: values.title,
        description: values.description,
        purpose: values.purpose,
        type: values.type,
        city: values.city,
        location: {
          latitude: values.latitude,
          longitude: values.longitude,
        },
        areaSize: values.areaSize,
        price: values.price,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        images: values.images.length > 0 ? values.images : imageUrls,
        vrTourLink: values.vrTourLink || undefined,
        contactInfo: {
          email: values.email || undefined,
          phone: values.phone || undefined,
        },
        sellerId: userId,
      }
      
      // For demo purposes, if no images are provided, add placeholder images
      if (propertyData.images.length === 0) {
        propertyData.images = [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
          "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        ]
      }
      
      // Create the property
      const result = await createProperty(propertyData)
      
      toast.success("Property listed successfully!")
      router.push("/properties")
    } catch (error) {
      toast.error("Failed to list property. Please try again.")
      console.error("Error listing property:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle image upload (simplified for demo)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    // In a real application, you would upload these files to a storage service
    // For demo purposes, we'll use placeholder image URLs
    const demoImageUrls = [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
      "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    ]
    
    const newUrls = [...Array(files.length)].map((_, i) => demoImageUrls[i % demoImageUrls.length])
    setImageUrls(newUrls)
    
    // Update the form
    form.setValue("images", newUrls, { shouldValidate: true, shouldDirty: true })
    toast.success(`${files.length} images uploaded successfully`)
  }

  // Get the current latitude and longitude from the form
  const latitude = form.watch('latitude');
  const longitude = form.watch('longitude');

  // Loading state
  if (!userIdQuery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">List Your Property</CardTitle>
            <CardDescription>
              Fill out the form below to list your property. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Beautiful 3 Bedroom Apartment" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a catchy title for your property listing.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your property in detail..." 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include details about amenities, condition, neighborhood, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="rent">For Rent</SelectItem>
                              <SelectItem value="sell">For Sale</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Location</h3>
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Lahore" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormLabel>Map Location *</FormLabel>
                    <FormDescription>
                      Click on the map or drag the marker to set your property's exact location.
                    </FormDescription>
                    
                    <div className="relative w-full h-64 rounded-md border overflow-hidden">
                      {!mapboxToken ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-4">
                          <div className="text-center text-red-500">
                            <p className="font-medium">Map configuration error</p>
                            <p className="text-sm">Mapbox token is missing or invalid.</p>
                          </div>
                        </div>
                      ) : (
                        <div id="map" className="w-full h-full" ref={(el) => {
                          if (el && !el.hasChildNodes()) {
                            // Initialize map only once
                            const map = new mapboxgl.Map({
                              container: el,
                              style: 'mapbox://styles/mapbox/streets-v12',
                              center: [longitude, latitude],
                              zoom: viewState.zoom,
                              accessToken: mapboxToken
                            });
                            
                            // Add navigation controls
                            map.addControl(new mapboxgl.NavigationControl());
                            
                            // Add a marker
                            const marker = new mapboxgl.Marker({ draggable: true })
                              .setLngLat([longitude, latitude])
                              .addTo(map);
                            
                            // Handle map click
                            map.on('click', (e) => {
                              marker.setLngLat(e.lngLat);
                              form.setValue('longitude', e.lngLat.lng, { shouldValidate: true });
                              form.setValue('latitude', e.lngLat.lat, { shouldValidate: true });
                            });
                            
                            // Handle marker drag
                            marker.on('dragend', () => {
                              const lngLat = marker.getLngLat();
                              form.setValue('longitude', lngLat.lng, { shouldValidate: true });
                              form.setValue('latitude', lngLat.lat, { shouldValidate: true });
                            });
                          }
                        }} />
                      )}
                      {mapError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 p-4">
                          <div className="text-center text-red-500">
                            <p className="font-medium">Map loading error</p>
                            <p className="text-sm">{mapError}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => window.location.reload()}
                            >
                              Reload page
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude *</FormLabel>
                            <FormControl>
                              <Input type="number" step="any" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude *</FormLabel>
                            <FormControl>
                              <Input type="number" step="any" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Property Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="areaSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area Size (sq ft) *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="number" min="0" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Images & Virtual Tour</h3>
                  
                  <div className="border rounded-md p-4">
                    <FormLabel>Property Images *</FormLabel>
                    <div className="mt-2">
                      <Input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="mb-2"
                      />
                      <FormDescription>
                        Upload at least one image of your property. For best results, use high-quality images.
                      </FormDescription>
                    </div>
                    
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative h-24 rounded-md overflow-hidden">
                            <img 
                              src={url} 
                              alt={`Property image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="vrTourLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Virtual Tour Link (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. https://matterport.com/tour/..." {...field} />
                        </FormControl>
                        <FormDescription>
                          If you have a virtual tour, paste the link here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Listing Property..." : "List Property"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 