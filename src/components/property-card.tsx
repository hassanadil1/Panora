import Image from "next/image"
import Link from "next/link"
import { Bath, Bed, MapPin, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface PropertyCardProps {
  id?: string
  title?: string
  location?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  area?: number
  type?: string
  image?: string
}

export function PropertyCard({
  id = "1",
  title = "Modern Family Home",
  location = "DHA Phase 6, Lahore",
  price = 25000000,
  bedrooms = 4,
  bathrooms = 3,
  area = 2500,
  type = "House",
  image = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60"
}: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-[16/9]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-4 left-4">{type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {location}
            </p>
          </div>
          <p className="text-lg font-bold">
            PKR {price.toLocaleString()}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{area} sqft</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/properties/${id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 