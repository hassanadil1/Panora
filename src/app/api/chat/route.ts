import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Define family size types
type FamilySize = '1-2' | '3-4' | '5-6' | '7+'
type BedroomRecommendation = {
  minBedrooms: number;
  idealBedrooms: number;
  maxBedrooms: number;
}
type FamilySizeRecommendations = {
  [key in FamilySize]: BedroomRecommendation;
}

// Define family size to bedroom recommendations
const FAMILY_SIZE_RECOMMENDATIONS: FamilySizeRecommendations = {
  '1-2': { minBedrooms: 1, idealBedrooms: 2, maxBedrooms: 2 },
  '3-4': { minBedrooms: 2, idealBedrooms: 3, maxBedrooms: 4 },
  '5-6': { minBedrooms: 3, idealBedrooms: 4, maxBedrooms: 5 },
  '7+': { minBedrooms: 4, idealBedrooms: 5, maxBedrooms: 6 }
}

// Define budget category types
type BudgetRange = {
  min?: number;
  max?: number;
  description: string;
}

type BudgetCategories = {
  [key: string]: BudgetRange;
}

// Define budget categories (in USD)
const BUDGET_CATEGORIES: BudgetCategories = {
  'very_affordable': { max: 200000, description: 'very budget-friendly' },
  'affordable': { min: 200000, max: 400000, description: 'budget-friendly' },
  'mid_range': { min: 400000, max: 700000, description: 'mid-range' },
  'luxury': { min: 700000, max: 1000000, description: 'luxury' },
  'premium': { min: 1000000, description: 'premium' }
}

// Define amenities and their synonyms
const AMENITIES_MAP = {
  'tv': ['television', 'cable', 'entertainment'],
  'wifi': ['internet', 'wireless', 'connection'],
  'disabled_access': ['wheelchair', 'accessible', 'handicap'],
  'woods': ['forest', 'nature', 'trees'],
  'hot_tubs': ['jacuzzi', 'spa', 'hot tub'],
  'views': ['scenic', 'panoramic', 'overlook'],
  'lake': ['water', 'river', 'waterfront'],
  'pet_friendly': ['pets allowed', 'dog friendly', 'cat friendly']
}

// Update the features type
type Features = {
  familySize: FamilySize | null;
  budgetPreference: 'affordable' | null;
  bedrooms: number | null;
  bathrooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  propertyType: string | null;
  purpose: 'rent' | 'sell' | null;
  location: string | null;
  minArea: number | null;
  maxArea: number | null;
  sortBy: 'price' | 'area' | 'newest' | null;
  sortOrder: 'asc' | 'desc' | null;
  amenities: string[];
}

// Update property type
type Property = {
  title: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  price: number;
  purpose: 'rent' | 'sell';
  amenities?: string[];
  createdAt: number;
  type: string;
}

// Helper function to extract family size from text
function extractFamilySize(text: string): FamilySize | null {
  const familyMatches = text.match(/(\d+)(?:\s*-\s*(\d+))?\s*(?:person|people|family|members)/i)
  if (familyMatches) {
    const start = parseInt(familyMatches[1])
    const end = familyMatches[2] ? parseInt(familyMatches[2]) : start
    const size = Math.max(start, end)
    
    if (size <= 2) return '1-2'
    if (size <= 4) return '3-4'
    if (size <= 6) return '5-6'
    return '7+'
  }
  return null
}

// Helper function to determine budget category
function getBudgetCategory(price: number): string {
  const category = Object.entries(BUDGET_CATEGORIES).find(([_, range]) => {
    if (range.min === undefined) return price <= (range.max ?? Infinity)
    if (range.max === undefined) return price >= range.min
    return price >= range.min && price <= range.max
  })
  
  return category?.[0] ?? 'mid_range'
}

// Helper function to extract property features for matching
function extractPropertyFeatures(text: string): Features {
  const features: Features = {
    bedrooms: text.match(/\d+\s*bed/i) ? parseInt(text.match(/(\d+)\s*bed/i)![1]) : null,
    bathrooms: text.match(/\d+\s*bath/i) ? parseInt(text.match(/(\d+)\s*bath/i)![1]) : null,
    minPrice: text.match(/(\d+)k/i) ? parseInt(text.match(/(\d+)k/i)![1]) * 1000 : 
             text.match(/\$(\d+)/i) ? parseInt(text.match(/\$(\d+)/i)![1]) : null,
    maxPrice: text.match(/under\s*(\d+)k/i) ? parseInt(text.match(/under\s*(\d+)k/i)![1]) * 1000 : null,
    propertyType: text.match(/house|apartment|villa|flat|portion|farm/i) ? 
                  text.match(/house|apartment|villa|flat|portion|farm/i)![0].toLowerCase() : null,
    purpose: text.match(/rent|buy|sale/i) ? 
            text.match(/rent|buy|sale/i)![0].toLowerCase() === 'rent' ? 'rent' : 'sell' : null,
    location: text.match(/in\s+([a-zA-Z\s,]+)/i) ? text.match(/in\s+([a-zA-Z\s,]+)/i)![1].trim() : null,
    minArea: text.match(/min(?:imum)?\s*(\d+)\s*sq(?:ft|uare feet)?/i) ? 
            parseInt(text.match(/min(?:imum)?\s*(\d+)\s*sq(?:ft|uare feet)?/i)![1]) : null,
    maxArea: text.match(/max(?:imum)?\s*(\d+)\s*sq(?:ft|uare feet)?/i) ? 
            parseInt(text.match(/max(?:imum)?\s*(\d+)\s*sq(?:ft|uare feet)?/i)![1]) : null,
    sortBy: text.match(/sort(?:ed)? by (price|area|newest)/i) ? 
            text.match(/sort(?:ed)? by (price|area|newest)/i)![1].toLowerCase() as 'price' | 'area' | 'newest' : null,
    sortOrder: text.match(/\b(asc(?:ending)?|desc(?:ending)?)\b/i) ? 
              text.match(/\b(asc(?:ending)?|desc(?:ending)?)\b/i)![1].toLowerCase().startsWith('asc') ? 'asc' : 'desc' : null,
    amenities: Object.entries(AMENITIES_MAP).reduce((acc: string[], [key, synonyms]) => {
      if (synonyms.some(s => text.toLowerCase().includes(s)) || text.toLowerCase().includes(key)) {
        acc.push(key)
      }
      return acc
    }, []),
    familySize: extractFamilySize(text),
    budgetPreference: text.includes('budget friendly') || text.includes('affordable') ? 'affordable' : null
  }
  return features
}

// Helper function to filter properties based on extracted features
function filterProperties(properties: any[], features: any) {
  return properties.filter(property => {
    let match = true
    if (features.bedrooms && property.bedrooms < features.bedrooms) match = false
    if (features.bathrooms && property.bathrooms < features.bathrooms) match = false
    if (features.minPrice && property.price < features.minPrice) match = false
    if (features.maxPrice && property.price > features.maxPrice) match = false
    if (features.propertyType && property.type !== features.propertyType) match = false
    if (features.purpose && property.purpose !== features.purpose) match = false
    if (features.location && !property.city.toLowerCase().includes(features.location.toLowerCase())) match = false
    if (features.minArea && property.areaSize < features.minArea) match = false
    if (features.maxArea && property.areaSize > features.maxArea) match = false
    
    // Check amenities if specified
    if (features.amenities.length > 0) {
      const propertyAmenities = property.amenities || []
      if (!features.amenities.every((amenity: string) => propertyAmenities.includes(amenity))) {
        match = false
      }
    }
    
    return match
  })
}

// Helper function to sort properties
function sortProperties(properties: any[], sortBy: string | null, sortOrder: string | null) {
  if (!sortBy) return properties

  const order = sortOrder === 'asc' ? 1 : -1
  return [...properties].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.price - b.price) * order
      case 'area':
        return (a.areaSize - b.areaSize) * order
      case 'newest':
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * order
      default:
        return 0
    }
  })
}

// Helper function to get price recommendations
function getPriceRecommendations(properties: any[], features: any) {
  const similarProperties = properties.filter(p => 
    (!features.propertyType || p.type === features.propertyType) &&
    (!features.location || p.city.toLowerCase().includes(features.location.toLowerCase())) &&
    (!features.bedrooms || p.bedrooms === features.bedrooms) &&
    (!features.bathrooms || p.bathrooms === features.bathrooms)
  )

  if (similarProperties.length === 0) return null

  const prices = similarProperties.map(p => p.price)
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return { avgPrice, minPrice, maxPrice }
}

// Helper function to get smart property recommendations
function getSmartRecommendations(properties: any[], features: Features) {
  let recommendations = properties.map(p => ({
    ...p,
    purpose: p.purpose as 'rent' | 'sell'
  })) as Property[]
  
  // Apply family size based filtering
  if (features.familySize && features.familySize in FAMILY_SIZE_RECOMMENDATIONS) {
    const sizeReq = FAMILY_SIZE_RECOMMENDATIONS[features.familySize as FamilySize]
    recommendations = recommendations.filter(p => 
      p.bedrooms >= sizeReq.minBedrooms && p.bedrooms <= sizeReq.maxBedrooms
    )
  }

  // Apply budget preference based filtering
  if (features.budgetPreference === 'affordable') {
    const affordableRange = BUDGET_CATEGORIES['affordable']
    if (affordableRange.max) {
      recommendations = recommendations.filter(p => p.price <= affordableRange.max!)
    }
  }

  // Sort by relevance score
  recommendations = recommendations.map(property => {
    let score = 0
    
    // Location match
    if (features.location && property.city.toLowerCase().includes(features.location.toLowerCase())) {
      score += 3
    }
    
    // Ideal bedroom match for family size
    if (features.familySize) {
      const idealBedrooms = FAMILY_SIZE_RECOMMENDATIONS[features.familySize as FamilySize].idealBedrooms
      score += 3 - Math.abs(property.bedrooms - idealBedrooms)
    }
    
    // Budget category match
    if (features.budgetPreference === 'affordable') {
      const category = getBudgetCategory(property.price)
      if (category === 'very_affordable' || category === 'affordable') {
        score += 2
      }
    }
    
    return { ...property, relevanceScore: score }
  }).sort((a, b) => b.relevanceScore - a.relevanceScore)

  return recommendations
}

// Helper function to generate natural language response
function generateNaturalResponse(properties: any[], features: any) {
  if (properties.length === 0) {
    let suggestion = "I understand you're looking for "
    
    if (features.familySize) {
      const sizeReq = FAMILY_SIZE_RECOMMENDATIONS[features.familySize as FamilySize]
      suggestion += `a home suitable for a family of ${features.familySize} people (ideally ${sizeReq.idealBedrooms} bedrooms). `
    }
    
    if (features.location) {
      suggestion += `in ${features.location}. `
    }
    
    if (features.budgetPreference === 'affordable') {
      suggestion += "with a budget-friendly price. "
    }
    
    suggestion += "\n\nLet me help you find alternatives:\n"
    suggestion += "1. Try expanding your search to nearby areas\n"
    suggestion += "2. Consider properties with slightly fewer bedrooms but good living space\n"
    suggestion += "3. Look at different property types like apartments or portions\n"
    suggestion += "\nWould you like me to show you properties in nearby areas or with different specifications?"
    
    return suggestion
  }

  let response = ""
  const topProperty = properties[0]
  
  if (features.familySize) {
    response += `I've found some great options for your family of ${features.familySize} people. `
  }
  
  if (features.budgetPreference === 'affordable') {
    const category = getBudgetCategory(topProperty.price)
    response += `Here are some ${BUDGET_CATEGORIES[category].description} options `
  }
  
  if (features.location) {
    response += `in ${features.location}:\n\n`
  } else {
    response += ":\n\n"
  }

  properties.slice(0, 3).forEach((property: any) => {
    const category = getBudgetCategory(property.price)
    response += `- ${property.title} in ${property.city}:\n`
    response += `  ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.areaSize} sqft\n`
    response += `  Price: $${property.price.toLocaleString()}${property.purpose === 'rent' ? '/mo' : ''} (${BUDGET_CATEGORIES[category].description})\n`
    if (property.amenities && property.amenities.length > 0) {
      response += `  Features: ${property.amenities.join(', ')}\n`
    }
    response += '\n'
  })

  if (properties.length > 3) {
    response += `I have ${properties.length - 3} more properties that might interest you. Would you like to see more?\n`
  }

  response += "\nI can also help you with:\n"
  response += "- More specific price ranges\n"
  response += "- Different locations or property types\n"
  response += "- Specific amenities you're looking for"

  return response
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content.toLowerCase()

    // Get all properties from the database
    const properties = await convex.query(api.properties.getAllProperties)

    // Extract features from the user's message
    const features = extractPropertyFeatures(lastMessage)
    
    // Get smart recommendations
    const recommendations = getSmartRecommendations(properties, features)

    // Generate response based on the query type and matching properties
    let response = ''

    if (lastMessage.includes('help') || lastMessage.includes('what can you do')) {
      response = "I'm your personal real estate assistant, and I can help you find the perfect property! Here's what I can do:\n\n" +
                "1. Find properties based on your family size and needs\n" +
                "2. Recommend properties within your budget\n" +
                "3. Search for specific property types and locations\n" +
                "4. Filter by amenities and features\n" +
                "5. Sort and compare properties\n" +
                "6. Provide price recommendations\n\n" +
                "Try asking me things like:\n" +
                "- 'Find a house for a family of 4 in Lahore'\n" +
                "- 'Show me budget-friendly apartments with 2 bedrooms'\n" +
                "- 'What's available in DHA with a garden?'\n" +
                "- 'Find properties suitable for a small family'"
    } else if (lastMessage.includes('price') && lastMessage.includes('recommend')) {
      const priceInfo = getPriceRecommendations(properties, features)
      if (priceInfo) {
        response = `Based on the current market in ${features.location || 'your area'}:\n\n`
        response += `Average price: $${priceInfo.avgPrice.toLocaleString()}\n`
        response += `Price range: $${priceInfo.minPrice.toLocaleString()} - $${priceInfo.maxPrice.toLocaleString()}\n\n`
        response += `These prices are for properties with similar specifications. Would you like me to show you some properties within this range?`
      } else {
        response = "I don't have enough data for precise price recommendations, but I can help you explore properties in different price ranges. What's your preferred budget range?"
      }
    } else {
      response = generateNaturalResponse(recommendations, features)
    }

    return NextResponse.json({
      message: response
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
} 