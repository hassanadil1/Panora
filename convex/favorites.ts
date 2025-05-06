import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Add a property to user's favorites
export const addFavorite = mutation({
  args: {
    userId: v.id("users"),
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    // Check if the favorite already exists
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_property", (q) =>
        q.eq("userId", args.userId).eq("propertyId", args.propertyId)
      )
      .first();

    if (existingFavorite) {
      // Already a favorite, no need to add again
      return existingFavorite;
    }

    // Add the favorite
    const favoriteId = await ctx.db.insert("favorites", {
      userId: args.userId,
      propertyId: args.propertyId,
      createdAt: Date.now(),
    });

    return await ctx.db.get(favoriteId);
  },
});

// Remove a property from user's favorites
export const removeFavorite = mutation({
  args: {
    userId: v.id("users"),
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    // Find the favorite to remove
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_property", (q) =>
        q.eq("userId", args.userId).eq("propertyId", args.propertyId)
      )
      .first();

    if (favorite) {
      // Delete the favorite
      await ctx.db.delete(favorite._id);
      return { success: true };
    }

    return { success: false, message: "Favorite not found" };
  },
});

// Get all favorites for a user
export const getUserFavorites = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all favorite IDs for this user
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Fetch all the property details for these favorites
    const propertyPromises = favorites.map(async (favorite) => {
      const property = await ctx.db.get(favorite.propertyId);
      return property;
    });

    const properties = await Promise.all(propertyPromises);
    return properties.filter(property => property !== null);
  },
});

// Check if a property is favorited by a user
export const isPropertyFavorited = query({
  args: {
    userId: v.id("users"),
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_property", (q) =>
        q.eq("userId", args.userId).eq("propertyId", args.propertyId)
      )
      .first();

    return !!favorite;
  },
});

// Get all users who favorited a property
export const getPropertyFavoritesCount = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    return favorites.length;
  },
}); 