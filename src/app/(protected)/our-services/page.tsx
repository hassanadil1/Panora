"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Home, 
  Star, 
  Flame, 
  CheckCircle2, 
  UserCheck, 
  Search, 
  ArrowRight,
  Camera,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  Mail
} from "lucide-react"

const services = [
  {
    title: "List a Property",
    description: "List your property for free on our platform",
    price: "Free",
    features: [
      "Basic property listing",
      "Property details and photos",
      "Contact information",
      "Standard visibility"
    ],
    icon: Home,
    link: "/list-property",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    title: "Hot Listing",
    description: "Make your property stand out in search results",
    price: "5,000 PKR",
    features: [
      "Prominent position in search",
      "Below premium listings",
      "Increased visibility",
      "Quick results"
    ],
    icon: Flame,
    link: "#contact-form",
    color: "bg-red-500/10 text-red-500"
  },
  {
    title: "Premium Listing",
    description: "Get your property featured on our homepage",
    price: "15,000 PKR",
    features: [
      "Featured on homepage",
      "Top position in search results",
      "Priority listing",
      "Existing virtual tour integration",
      "Enhanced visibility"
    ],
    icon: Star,
    link: "#contact-form",
    color: "bg-yellow-500/10 text-yellow-500"
  },
  {
    title: "Verified Premium",
    description: "Complete professional service with virtual tour",
    price: "25,000 PKR",
    features: [
      "Professional photography",
      "Existing virtual tour integration",
      "Featured section on homepage",
      "Verified badge",
      "Priority customer support"
    ],
    icon: CheckCircle2,
    link: "#contact-form",
    color: "bg-green-500/10 text-green-500"
  },
  {
    title: "Virtual Tours",
    description: "Immersive 360° property tours",
    price: "Starting from 25,000 PKR",
    features: [
      "Professional 360° photography",
      "Interactive virtual tour",
      "Custom hotspots",
      "Aerial drone shots"
    ],
    icon: Camera,
    link: "https://www.panoraproperties.com",
    color: "bg-purple-500/10 text-purple-500"
  }
]

const agentServices = [
  {
    title: "Sell It For Me",
    description: "Let our experts handle your property sale",
    features: [
      "Professional property valuation",
      "Marketing and promotion",
      "Viewing arrangements",
      "Negotiation support",
      "Documentation assistance"
    ],
    icon: UserCheck,
    link: "/sell-it-for-me",
    color: "bg-indigo-500/10 text-indigo-500"
  },
  {
    title: "Find It For Me",
    description: "We'll find your perfect property",
    features: [
      "Free AI Panora bot assistance",
      "Premium service available",
      "Personalized property search",
      "Viewing arrangements",
      "Price negotiation support"
    ],
    icon: Search,
    link: "/find-it-for-me",
    color: "bg-pink-500/10 text-pink-500"
  }
]

export default function ServicesPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyType: "",
    budget: "",
    location: "",
    message: "",
    service: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 px-4 md:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Our Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Choose from our range of premium services to maximize your property's potential
          </motion.p>
        </div>

        {/* Property Listing Services */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Property Listing Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${service.color}`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="text-2xl font-bold mb-4">{service.price}</div>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-auto" asChild>
                    <a href={service.link}>Get Started</a>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Agent Services */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Real Estate Agent Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agentServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${service.color}`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {service.title === "Find It For Me" && (
                    <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="text-sm font-medium mb-2">Premium Service:</p>
                      <p className="text-sm text-muted-foreground">
                        0.5% of final purchase price
                      </p>
                    </div>
                  )}
                  <Button className="w-full mt-auto" asChild>
                    <a href={service.link}>Get Started</a>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div id="contact-form" className="max-w-2xl mx-auto scroll-mt-20">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Request a Quote</h2>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+92 XXX XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service</label>
                  <Select
                    value={formData.service}
                    onValueChange={(value) => setFormData({ ...formData, service: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium Listing</SelectItem>
                      <SelectItem value="hot">Hot Listing</SelectItem>
                      <SelectItem value="verified">Verified Premium</SelectItem>
                      <SelectItem value="virtual">Virtual Tour</SelectItem>
                      <SelectItem value="find">Find It For Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  placeholder="Tell us about your requirements..."
                  className="min-h-[120px]"
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
} 