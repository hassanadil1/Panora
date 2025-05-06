import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    active: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
  
  properties: defineTable({
    title: v.string(),
    description: v.string(),
    purpose: v.string(), // "rent" or "sell"
    type: v.string(), // "home", "flat", "portion", "farm"
    city: v.string(),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    areaSize: v.number(), // in square feet/meters
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    images: v.array(v.string()), // URLs to images
    vrTourLink: v.optional(v.string()),
    contactInfo: v.object({
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    sellerId: v.id("users"), // Reference to the user who posted the property
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_city", ["city"])
    .index("by_purpose", ["purpose"])
    .index("by_type", ["type"]),
}); 