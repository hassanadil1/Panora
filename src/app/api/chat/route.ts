import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Define conversation state types
type QuestionState = 
  | 'initial'
  | 'ask_city'
  | 'ask_property_type'
  | 'ask_location'
  | 'ask_bedrooms'
  | 'ask_bathrooms'
  | 'ask_area'
  | 'show_prediction'
  | 'complete';

type ConversationState = {
  state: QuestionState;
  city?: string;
  property_type?: string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

// Define supported cities and their corresponding locations
const SUPPORTED_CITIES = ['Islamabad', 'Karachi', 'Lahore', 'Rawalpindi', 'Faisalabad'];

const CITY_LOCATIONS: {[city: string]: string[]} = {
  'Islamabad': [
    'DHA Defence', 'Bahria Town', 'G-11', 'F-10', 'E-11', 'Bani Gala', 'G-13', 'I-8', 'F-8', 'F-7', 
    'Korang Town', 'Soan Garden', 'PWD Housing Scheme', 'Ghauri Town', 'The Springs', 'Diplomatic Enclave', 
    'Blue Area', 'Jinnah Avenue', 'F-6', 'E-7', 'I-16', 'Bhara Kahu', 'Koral Town', 'I-10', 'I-14', 
    'Kashmir Highway', 'CBR Town', 'Naval Anchorage', 'National Police Foundation', 'D-17', 'Simly Dam Road', 
    'Burma Town', 'PWD Road', 'Chak Shehzad', 'Emaar Canyon Views'
  ],
  'Karachi': [
    'DHA Defence', 'Gulshan-e-Iqbal Town', 'Bahria Town Karachi', 'Clifton', 'Bath Island', 'Gulistan-e-Jauhar', 
    'Cantt', 'Malir', 'North Nazimabad', 'Scheme 33', 'Fazaia Housing Scheme', 'Navy Housing Scheme Karsaz', 
    'Shahra-e-Faisal', 'Falcon Complex Faisal', 'Gadap Town', 'Nazimabad', 'New Karachi', 'Liaquatabad', 
    'Baldia Town', 'Federal B Area', 'Zamzama', 'Anda Mor Road', 'Jamshed Town', 'P & T Colony', 'Manzoor Colony', 
    'Airport', 'Model Colony', 'Delhi Colony', 'Aisha Manzil', 'Gizri', 'Saddar Town', 'Garden West', 
    'Khayaban-e-Jinnah Road', 'Khalid Bin Walid Road'
  ],
  'Lahore': [
    'DHA Defence', 'Gulberg', 'Bahria Town', 'Askari', 'Model Town', 'Cavalry Ground', 'Valencia Housing Society', 
    'EME Society', 'Allama Iqbal Town', 'Johar Town', 'Township', 'Paragon City', 'Faisal Town', 'Wapda Town', 
    'Mughalpura', 'Samanabad', 'Iqbal Park', 'Sabzazar Scheme', 'Mustafa Town', 'Al Faisal Town', 'Green Fort', 
    'T & T Aabpara Housing Society', 'PCSIR Housing Scheme', 'State Life Housing Society', 'Pak Arab Housing Society', 
    'Shalimar Link Road', 'Harbanspura', 'Raiwind Road', 'Mozang', 'Misri Shah', 'Sant Nagar', 'Qadri Colony', 
    'Jallo Park Road', 'Tariq Gardens'
  ],
  'Rawalpindi': [
    'Bahria Town Rawalpindi', 'Askari 14', 'Askari 13', 'Westridge', 'Satellite Town', 'Gulraiz Housing Scheme', 
    'Chaklala Scheme', 'Adiala Road', 'Judicial Colony', 'Gulshan-e-Iqbal', 'Shalley Valley', 'Dhok Kashmirian', 
    'Gulbahar Scheme', 'Lalazar', 'Affandi Colony', 'Al-Noor Colony', 'Sadiqabad', 'Misryal Road', 
    'Khayaban-e-Sir Syed', 'Peshawar Road', 'Liaquat Bagh'
  ],
  'Faisalabad': [
    'Muslim Town', 'Satiana Road', 'Abdullahpur', 'Wapda City', 'Ghulam Mohammad Abad', 'Millat Town', 'Raza Abad', 
    'Usman Town', 'Zulfiqar Colony', 'Madina Town', 'Gulshan-e-Rafique', 'Rachna Town', 'Eden Valley', 
    'Ghalib City', 'Sargodha Road', 'Samundari Road', 'Jaranwala'
  ]
};

// Property type options
const PROPERTY_TYPES = ['House', 'Flat'];

// Define user sessions storage - this will reset on server restart
// In a production app, this should be stored in a database
const sessions: { [sessionId: string]: ConversationState } = {};

// Helper function to get a new conversation state
function getNewConversation(): ConversationState {
  return { state: 'ask_city' };
}

// Helper function to get the next question based on the current state
function getNextQuestion(state: ConversationState): string {
  switch (state.state) {
    case 'ask_city':
      return `1. Which city is the property located in?\n(Select one from the list below)\nOptions:\n\n${SUPPORTED_CITIES.join('\n\n')}`;
    
    case 'ask_property_type':
      return `2. What type of property are you interested in?\n(Select one from the list below)\nOptions:\n\n${PROPERTY_TYPES.join('\n\n')}`;
    
    case 'ask_location':
      if (!state.city) return getNextQuestion({ ...state, state: 'ask_city' });
      const locations = CITY_LOCATIONS[state.city] || [];
      return `3. In which specific location/neighborhood is the property situated?\n(Select one from the list below based on your chosen city ${state.city})\n\n${locations.join('\n\n')}`;
    
    case 'ask_bedrooms':
      return `4. How many bedrooms does the property have?\n(Enter a number between 0 and 12)\nExample Inputs: 1, 2, 3, 4, 5, 6, etc.`;
    
    case 'ask_bathrooms':
      return `5. How many bathrooms does the property have?\n(Enter a number between 0 and 10)\nExample Inputs: 1, 2, 3, 4, 5, etc.`;
    
    case 'ask_area':
      return `6. What is the total area of the property (in Marla)?\n(Enter a number, e.g., 5, 10, 20, etc.)\nNote:\n\n1 Kanal = 20 Marla\n\nIf you know the area in Kanal, multiply by 20 (e.g., 1 Kanal = 20 Marla, 2 Kanal = 40 Marla).`;
    
    case 'show_prediction':
      return generatePredictionFromState(state);
    
    default:
      return "I'm sorry, but I encountered an issue with your property prediction questionnaire. Let's start over. Please type 'start' to begin the process again.";
  }
}

// Helper function to process user response based on current state
function processResponse(state: ConversationState, userResponse: string): ConversationState {
  const response = userResponse.trim();

  switch (state.state) {
    case 'ask_city':
      const city = SUPPORTED_CITIES.find(c => c.toLowerCase() === response.toLowerCase());
      if (city) {
        return { ...state, city, state: 'ask_property_type' };
      }
      return { ...state, state: 'ask_city' }; // Stay in same state if invalid
    
    case 'ask_property_type':
      const propertyType = PROPERTY_TYPES.find(t => t.toLowerCase() === response.toLowerCase());
      if (propertyType) {
        return { ...state, property_type: propertyType, state: 'ask_location' };
      }
      return { ...state, state: 'ask_property_type' }; // Stay in same state if invalid
    
    case 'ask_location':
      if (!state.city) return { ...state, state: 'ask_city' };
      const locations = CITY_LOCATIONS[state.city] || [];
      const location = locations.find(l => l.toLowerCase() === response.toLowerCase());
      
      // Also check if the response is contained within any location name (more flexible matching)
      const partialMatch = !location ? locations.find(l => l.toLowerCase().includes(response.toLowerCase())) : null;
      
      if (location || partialMatch) {
        // Fix: Ensure we never assign null to location
        const matchedLocation = location || partialMatch || '';
        return { ...state, location: matchedLocation, state: 'ask_bedrooms' };
      }
      return { ...state, state: 'ask_location' }; // Stay in same state if invalid
    
    case 'ask_bedrooms':
      const bedrooms = parseInt(response);
      if (!isNaN(bedrooms) && bedrooms >= 0 && bedrooms <= 12) {
        return { ...state, bedrooms, state: 'ask_bathrooms' };
      }
      return { ...state, state: 'ask_bedrooms' }; // Stay in same state if invalid
    
    case 'ask_bathrooms':
      const bathrooms = parseInt(response);
      if (!isNaN(bathrooms) && bathrooms >= 0 && bathrooms <= 10) {
        return { ...state, bathrooms, state: 'ask_area' };
      }
      return { ...state, state: 'ask_bathrooms' }; // Stay in same state if invalid
    
    case 'ask_area':
      const area = parseFloat(response);
      if (!isNaN(area) && area > 0 && area <= 100) { // Assuming max area is 100 marla (5 kanal)
        return { ...state, area, state: 'show_prediction' };
      }
      return { ...state, state: 'ask_area' }; // Stay in same state if invalid
    
    case 'show_prediction':
      // If user types "start" or "restart", begin a new conversation
      if (response.toLowerCase() === 'start' || response.toLowerCase() === 'restart') {
        return getNewConversation();
      }
      return { ...state, state: 'complete' };
    
    default:
      // If in any other state or "complete", restart if user types "start"
      if (response.toLowerCase() === 'start' || response.toLowerCase() === 'restart') {
        return getNewConversation();
      }
      return state;
  }
}

// Function to find the best matching property from our prediction data based on user requirements
function findBestMatchingProperty(state: ConversationState) {
  if (!state.city || !state.property_type || !state.location || 
      state.bedrooms === undefined || state.bathrooms === undefined || state.area === undefined) {
    return null;
  }

  const predictionData = loadPredictionData();
  
  // Filter properties based on requirements
  const matchingProperties = predictionData.filter((property: any) => {
    // Check city match
    if (property.city !== state.city) return false;
    
    // Check property type match (case insensitive)
    if (property.property_type.toLowerCase() !== state.property_type?.toLowerCase()) return false;
    
    // Check location (more flexible, looking for partial matches)
    if (!property.location.toLowerCase().includes(state.location!.toLowerCase()) && 
        !state.location!.toLowerCase().includes(property.location.toLowerCase())) {
      return false;
    }
    
    // For bedrooms, bathrooms and area, we'll use a range approach
    const bedroomDiff = Math.abs(parseInt(property.bedrooms) - state.bedrooms!);
    const bathroomDiff = Math.abs(parseInt(property.baths) - state.bathrooms!);
    
    // Extract area as a number from formats like "7.3 Marla"
    let propertyArea = property.area_numeric ? parseFloat(property.area_numeric) : 
                       parseFloat(property.area.split(' ')[0]);
    
    const areaDiff = Math.abs(propertyArea - state.area!);
    
    // Allow some flexibility in matching
    return bedroomDiff <= 1 && bathroomDiff <= 1 && areaDiff <= 3;
  });

  if (matchingProperties.length === 0) {
    return null;
  }

  // Sort by closest match to requirements
  matchingProperties.sort((a: any, b: any) => {
    const aBedroomDiff = Math.abs(parseInt(a.bedrooms) - state.bedrooms!);
    const bBedroomDiff = Math.abs(parseInt(b.bedrooms) - state.bedrooms!);
    
    const aBathroomDiff = Math.abs(parseInt(a.baths) - state.bathrooms!);
    const bBathroomDiff = Math.abs(parseInt(b.baths) - state.bathrooms!);
    
    let aArea = a.area_numeric ? parseFloat(a.area_numeric) : parseFloat(a.area.split(' ')[0]);
    let bArea = b.area_numeric ? parseFloat(b.area_numeric) : parseFloat(b.area.split(' ')[0]);
    
    const aAreaDiff = Math.abs(aArea - state.area!);
    const bAreaDiff = Math.abs(bArea - state.area!);
    
    // Combine differences with weighted importance
    const aTotal = aBedroomDiff * 3 + aBathroomDiff * 2 + aAreaDiff;
    const bTotal = bBedroomDiff * 3 + bBathroomDiff * 2 + bAreaDiff;
    
    return aTotal - bTotal;
  });

  return matchingProperties[0];
}

// Function to generate a prediction response based on the completed state
function generatePredictionFromState(state: ConversationState): string {
  const matchingProperty = findBestMatchingProperty(state);
  
  if (!matchingProperty) {
    return `I'm sorry, but I couldn't find a matching property in my database with these specifications:

• City: ${state.city}
• Property Type: ${state.property_type}
• Location: ${state.location}
• Bedrooms: ${state.bedrooms}
• Bathrooms: ${state.bathrooms}
• Area: ${state.area} Marla

Would you like to try with different specifications? Type 'start' to begin again.`;
  }
  
  // Get the raw predicted price
  let predictedPriceValue = parseInt(matchingProperty.predicted_price);
  
  // Handle negative prices
  if (predictedPriceValue <= 0) {
    predictedPriceValue = 1000000; // Set to Rs. 1 million if negative
  }
  
  // Format the base predicted price nicely
  const basePredictedPrice = predictedPriceValue.toLocaleString();
  
  // Calculate premium prices
  const cornerPropertyPrice = Math.round(predictedPriceValue * 1.10).toLocaleString();
  const facingParkPrice = Math.round(predictedPriceValue * 1.15).toLocaleString();
  const sunfacingPrice = Math.round(predictedPriceValue * 1.05).toLocaleString();
  
  let response = `💰 PROPERTY PRICE PREDICTION 💰\n\n`;
  
  response += `📍 PROPERTY DETAILS:\n`;
  response += `• City: ${state.city}\n`;
  response += `• Property Type: ${state.property_type}\n`;
  response += `• Location: ${state.location}\n`;
  response += `• Bedrooms: ${state.bedrooms}\n`;
  response += `• Bathrooms: ${state.bathrooms}\n`;
  response += `• Area: ${state.area} Marla\n\n`;
  
  response += `💵 PRICE ESTIMATE:\n`;
  response += `• Base Price: Rs. ${basePredictedPrice}\n\n`;
  
  // Add premium property prices
  response += `✨ PREMIUM OPTIONS:\n`;
  response += `• Corner Property: Rs. ${cornerPropertyPrice}\n`;
  response += `• Facing Park: Rs. ${facingParkPrice}\n`;
  response += `• Sun-facing Property: Rs. ${sunfacingPrice}\n\n`;
  
  // Add some contextual information about the matching property
  response += `ℹ️ SIMILAR PROPERTY:\n`;
  response += `This prediction is based on a ${matchingProperty.bedrooms} bedroom, `;
  response += `${matchingProperty.baths} bathroom ${matchingProperty.property_type.toLowerCase()} `;
  response += `in ${matchingProperty.location}, ${matchingProperty.city} with an area of ${matchingProperty.area}.\n\n`;
  
  response += `Would you like to get another prediction? Type 'start' to begin again.`;
  
  return response;
}

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
function filterProperties(properties: any[], features: any) 
{
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
    if (features.amenities.length > 0) 
      {
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

// Helper function to load and parse the property prediction data
function loadPredictionData() {
  try {
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'test_data_with_predictions.csv')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    // Parse the CSV data
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })
    
    return records
  } catch (error) {
    console.error('Error loading prediction data:', error)
    return []
  }
}

// Helper function to find properties in the prediction data
function findPropertiesInPredictionData(query: string) {
  const predictionData = loadPredictionData()
  
  // Extract key parameters from query
  const bedroomsMatch = query.match(/(\d+)\s*bedrooms?/i)
  const bathroomsMatch = query.match(/(\d+)\s*(?:bath(?:room)?s?|baths)/i)
  const locationMatch = query.match(/(?:in|at)\s+([A-Za-z0-9\-]+)/i)
  const cityMatch = query.match(/(?:in|at)\s+([A-Za-z\s]+)(?:city|town)?/i)
  const propertyTypeMatch = query.match(/\b(flat|house|apartment|villa)\b/i)
  const areaSizeMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:marla|kanal)/i)
  const priceMatch = query.match(/(\d+(?:,\d+)?)\s*(?:rs|rupees|pkr)/i)
  
  // Apply filters based on query parameters
  return predictionData.filter((property: any) => {
    let match = true
    
    // Filter by bedrooms if specified
    if (bedroomsMatch && parseInt(bedroomsMatch[1]) !== parseInt(property.bedrooms)) {
      match = false
    }
    
    // Filter by bathrooms if specified
    if (bathroomsMatch && parseInt(bathroomsMatch[1]) !== parseInt(property.baths)) {
      match = false
    }
    
    // Filter by location if specified
    if (locationMatch) {
      const queryLocation = locationMatch[1].toLowerCase()
      if (!property.location.toLowerCase().includes(queryLocation)) {
        match = false
      }
    }
    
    // Filter by city if specified
    if (cityMatch) {
      const queryCity = cityMatch[1].toLowerCase()
      if (!property.city.toLowerCase().includes(queryCity)) {
        match = false
      }
    }
    
    // Filter by property type if specified
    if (propertyTypeMatch) {
      const queryPropertyType = propertyTypeMatch[1].toLowerCase()
      if (property.property_type.toLowerCase() !== queryPropertyType) {
        match = false
      }
    }
    
    // Filter by area size if specified (approximate match)
    if (areaSizeMatch) {
      const queryArea = parseFloat(areaSizeMatch[1])
      // Handle area which might be in format "7.3 Marla"
      const areaStr = property.area_numeric || property.area.split(' ')[0]
      const propertyArea = parseFloat(areaStr)
      
      // Allow for some flexibility in area matching
      if (Math.abs(queryArea - propertyArea) > 2) {
        match = false
      }
    }
    
    // Filter by price if specified
    if (priceMatch) {
      const queryPrice = parseInt(priceMatch[1].replace(',', ''))
      const propertyPrice = parseInt(property.price)
      
      // Allow for price differences within 20%
      if (Math.abs(queryPrice - propertyPrice) / propertyPrice > 0.2) {
        match = false
      }
    }
    
    return match
  })
}

// Helper function to generate response for property prediction queries
function generatePredictionResponse(query: string) {
  const properties = findPropertiesInPredictionData(query)
  
  if (properties.length === 0) {
    return "I couldn't find any property predictions matching your criteria. Could you please try with different specifications or a different location?"
  }
  
  let response = "🏠 PROPERTY PREDICTIONS FOUND 🏠\n\n"
  
  properties.slice(0, 5).forEach((property: any, index: number) => {
    const actualPrice = parseInt(property.price).toLocaleString()
    
    // Get predicted price and handle negative values
    let predictedPriceValue = parseInt(property.predicted_price);
    if (predictedPriceValue <= 0) {
      predictedPriceValue = 1000000; // 1 million if negative
    }
    
    const predictedPrice = predictedPriceValue.toLocaleString()
    const cornerPrice = Math.round(predictedPriceValue * 1.10).toLocaleString();
    const parkPrice = Math.round(predictedPriceValue * 1.15).toLocaleString();
    const sunfacingPrice = Math.round(predictedPriceValue * 1.05).toLocaleString();
    
    // Calculate percentage difference using absolute (positive) values
    const difference = Math.abs(parseInt(property.price) - predictedPriceValue)
    const percentDiff = ((difference / Math.abs(parseInt(property.price))) * 100).toFixed(2)
    
    response += `📌 PROPERTY #${index + 1}\n`;
    response += `• Type: ${property.property_type}\n`;
    response += `• Location: ${property.location}, ${property.city}\n`;
    response += `• Size: ${property.bedrooms} bedroom, ${property.baths} bathroom\n`;
    response += `• Area: ${property.area}\n\n`;
    
    response += `💵 PRICING:\n`;
    response += `• Actual Price: Rs. ${actualPrice}\n`;
    response += `• Predicted Price: Rs. ${predictedPrice}\n`;
    response += `• Difference: ${percentDiff}%\n\n`;
    
    response += `✨ PREMIUM OPTIONS:\n`;
    response += `• Corner Property: Rs. ${cornerPrice}\n`;
    response += `• Facing Park: Rs. ${parkPrice}\n`;
    response += `• Sun-facing: Rs. ${sunfacingPrice}\n\n`;
    
    if (index < 4 && properties.length > index + 1) {
      response += `--------------------------------------------------\n\n`;
    }
  })
  
  if (properties.length > 5) {
    response += `Found ${properties.length - 5} more properties matching your criteria.\n\n`;
  }
  
  response += "Would you like more specific details or information about properties in a different location?";
  
  return response;
}

// Helper function to check if a query is related to property predictions
function isPredictionQuery(query: string) {
  const predictionKeywords = [
    'predict', 'prediction', 'estimate', 'worth', 'value', 'price prediction',
    'how much', 'property value', 'market value', 'predicted price', 'cost',
    'property price', 'flat price', 'house price', 'apartment price'
  ]
  
  const cityKeywords = ['karachi', 'lahore', 'islamabad', 'rawalpindi']
  const propertyTypeKeywords = ['flat', 'apartment', 'house', 'property']
  
  // Check for prediction keywords
  const hasPredictionKeyword = predictionKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  )
  
  // Check for city keywords
  const hasCityKeyword = cityKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  )
  
  // Check for property type keywords
  const hasPropertyTypeKeyword = propertyTypeKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  )
  
  // Check for bedroom/bathroom patterns
  const hasRoomPattern = query.match(/\d+\s*(?:bed|bath|room|bedroom|bathroom)/i) !== null
  
  // Consider it a prediction query if it has a prediction keyword
  // OR if it mentions both a location/city and property characteristics
  return hasPredictionKeyword || 
         ((hasCityKeyword || query.match(/in\s+([A-Za-z0-9\-]+)/i)) && 
          (hasPropertyTypeKeyword || hasRoomPattern))
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content.toLowerCase()
    
    // Generate a unique session ID based on the conversation
    const sessionId = messages.length > 0 ? messages[0].content.substring(0, 20) : 'default';
    
    // Initialize session if it doesn't exist - automatically start questionnaire
    if (!sessions[sessionId]) {
      sessions[sessionId] = getNewConversation();
      return NextResponse.json({
        message: getNextQuestion(sessions[sessionId])
      });
    }
    
    // If restart command, start over
    if (lastMessage === 'start' || lastMessage === 'restart') {
      sessions[sessionId] = getNewConversation();
      return NextResponse.json({
        message: getNextQuestion(sessions[sessionId])
      });
    }
    
    // If we have an active questionnaire session
    if (sessions[sessionId]) {
      // Process user response and update state
      sessions[sessionId] = processResponse(sessions[sessionId], lastMessage);
      
      // If completed, clean up session
      if (sessions[sessionId].state === 'complete') {
        delete sessions[sessionId];
        
        // Default to regular property search
        const properties = await convex.query(api.properties.getAllProperties);
        const features = extractPropertyFeatures(lastMessage);
        const recommendations = getSmartRecommendations(properties, features);
        return NextResponse.json({
          message: generateNaturalResponse(recommendations, features)
        });
      }
      
      // Return the next question
      return NextResponse.json({
        message: getNextQuestion(sessions[sessionId])
      });
    }

    // This code should never execute since we always initialize a session above
    // But kept as a fallback for unexpected scenarios
    const properties = await convex.query(api.properties.getAllProperties)
    const features = extractPropertyFeatures(lastMessage)
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
                "6. Provide price recommendations\n" +
                "7. Predict property values based on location and features\n\n" +
                "Try asking me things like:\n" +
                "- 'Find a house for a family of 4 in Lahore'\n" +
                "- 'Show me budget-friendly apartments with 2 bedrooms'\n" +
                "- 'What's available in DHA with a garden?'\n" +
                "- 'Find properties suitable for a small family'\n" +
                "- 'Predict the price of a 4 bedroom house in E-7 Islamabad'\n\n" +
                "Or type 'start' to begin a guided property valuation process!"
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