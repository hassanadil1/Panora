import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a new property listing
export const createProperty = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    purpose: v.string(), // "rent" or "sell"
    type: v.string(), // "home", "flat", "portion", "farm"
    city: v.string(),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    areaSize: v.number(),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    images: v.array(v.string()),
    vrTourLink: v.optional(v.string()),
    contactInfo: v.object({
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const propertyId = await ctx.db.insert("properties", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(propertyId);
  },
});

// Update an existing property
export const updateProperty = mutation({
  args: {
    id: v.id("properties"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    purpose: v.optional(v.string()),
    type: v.optional(v.string()),
    city: v.optional(v.string()),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    areaSize: v.optional(v.number()),
    price: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    vrTourLink: v.optional(v.string()),
    contactInfo: v.optional(v.object({
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const property = await ctx.db.get(id);
    if (!property) {
      throw new Error("Property not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

// Delete a property
export const deleteProperty = mutation({
  args: {
    id: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id);
    
    if (!property) {
      throw new Error("Property not found");
    }
    
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});

// Get a property by ID
export const getProperty = query({
  args: {
    id: v.id("properties"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all properties
export const getAllProperties = query({
  handler: async (ctx) => {
    return await ctx.db.query("properties").collect();
  },
});

// Get properties by seller ID
export const getPropertiesBySeller = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();
  },
});

// Get properties by city
export const getPropertiesByCity = query({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .collect();
  },
});

// Get properties by purpose (rent/sell)
export const getPropertiesByPurpose = query({
  args: {
    purpose: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_purpose", (q) => q.eq("purpose", args.purpose))
      .collect();
  },
});

// Get properties by type (home, flat, etc.)
export const getPropertiesByType = query({
  args: {
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

// Filter properties by various criteria
export const filterProperties = query({
  args: {
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minBedrooms: v.optional(v.number()),
    minBathrooms: v.optional(v.number()),
    minAreaSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .filter((q) => {
        let condition = q.eq(1, 1); // Always true initial condition
        
        if (args.minPrice !== undefined) {
          condition = q.and(condition, q.gte(q.field("price"), args.minPrice));
        }
        
        if (args.maxPrice !== undefined) {
          condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
        }
        
        if (args.minBedrooms !== undefined) {
          condition = q.and(condition, q.gte(q.field("bedrooms"), args.minBedrooms));
        }
        
        if (args.minBathrooms !== undefined) {
          condition = q.and(condition, q.gte(q.field("bathrooms"), args.minBathrooms));
        }
        
        if (args.minAreaSize !== undefined) {
          condition = q.and(condition, q.gte(q.field("areaSize"), args.minAreaSize));
        }
        
        return condition;
      })
      .collect();
  },
});

// Search properties by city and filters
export const searchPropertiesByCity = query({
  args: {
    city: v.string(),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minBedrooms: v.optional(v.number()),
    minBathrooms: v.optional(v.number()),
    minAreaSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => {
        let condition = q.eq(1, 1); // Always true initial condition
        
        if (args.minPrice !== undefined) {
          condition = q.and(condition, q.gte(q.field("price"), args.minPrice));
        }
        
        if (args.maxPrice !== undefined) {
          condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
        }
        
        if (args.minBedrooms !== undefined) {
          condition = q.and(condition, q.gte(q.field("bedrooms"), args.minBedrooms));
        }
        
        if (args.minBathrooms !== undefined) {
          condition = q.and(condition, q.gte(q.field("bathrooms"), args.minBathrooms));
        }
        
        if (args.minAreaSize !== undefined) {
          condition = q.and(condition, q.gte(q.field("areaSize"), args.minAreaSize));
        }
        
        return condition;
      })
      .collect();
  },
});

// Search properties by purpose and filters
export const searchPropertiesByPurpose = query({
  args: {
    purpose: v.string(),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minBedrooms: v.optional(v.number()),
    minBathrooms: v.optional(v.number()),
    minAreaSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_purpose", (q) => q.eq("purpose", args.purpose))
      .filter((q) => {
        let condition = q.eq(1, 1); // Always true initial condition
        
        if (args.minPrice !== undefined) {
          condition = q.and(condition, q.gte(q.field("price"), args.minPrice));
        }
        
        if (args.maxPrice !== undefined) {
          condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
        }
        
        if (args.minBedrooms !== undefined) {
          condition = q.and(condition, q.gte(q.field("bedrooms"), args.minBedrooms));
        }
        
        if (args.minBathrooms !== undefined) {
          condition = q.and(condition, q.gte(q.field("bathrooms"), args.minBathrooms));
        }
        
        if (args.minAreaSize !== undefined) {
          condition = q.and(condition, q.gte(q.field("areaSize"), args.minAreaSize));
        }
        
        return condition;
      })
      .collect();
  },
});

// Search properties by type and filters
export const searchPropertiesByType = query({
  args: {
    type: v.string(),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minBedrooms: v.optional(v.number()),
    minBathrooms: v.optional(v.number()),
    minAreaSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .filter((q) => {
        let condition = q.eq(1, 1); // Always true initial condition
        
        if (args.minPrice !== undefined) {
          condition = q.and(condition, q.gte(q.field("price"), args.minPrice));
        }
        
        if (args.maxPrice !== undefined) {
          condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
        }
        
        if (args.minBedrooms !== undefined) {
          condition = q.and(condition, q.gte(q.field("bedrooms"), args.minBedrooms));
        }
        
        if (args.minBathrooms !== undefined) {
          condition = q.and(condition, q.gte(q.field("bathrooms"), args.minBathrooms));
        }
        
        if (args.minAreaSize !== undefined) {
          condition = q.and(condition, q.gte(q.field("areaSize"), args.minAreaSize));
        }
        
        return condition;
      })
      .collect();
  },
}); 