"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Building, 
  MapPin, 
  Clock, 
  ArrowRight,
  Building2,
  Landmark,
  Hotel
} from "lucide-react"

interface PropertySuggestionProps {
  property: {
    id: string
    title: string
    type: "house" | "apartment" | "plot" | "commercial"
    location: string
    price: string
    features: string[]
    pros: string[]
    cons: string[]
  }
  onViewDetails: (id: string) => void
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "house":
      return <Home className="h-5 w-5" />
    case "apartment":
      return <Building className="h-5 w-5" />
    case "plot":
      return <Landmark className="h-5 w-5" />
    case "commercial":
      return <Building2 className="h-5 w-5" />
    default:
      return <Hotel className="h-5 w-5" />
  }
}

export function PropertySuggestion({ property, onViewDetails }: PropertySuggestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[350px]"
    >
      <Card className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getTypeIcon(property.type)}
                <h3 className="font-semibold">{property.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.location}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {property.price}
            </Badge>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Features</h4>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-600">Pros</h4>
              <ul className="space-y-1 text-sm">
                {property.pros.map((pro, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">Cons</h4>
              <ul className="space-y-1 text-sm">
                {property.cons.map((con, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => onViewDetails(property.id)}
            className="w-full"
            variant="secondary"
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
} 