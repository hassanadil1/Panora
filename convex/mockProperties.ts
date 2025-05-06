import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Function to add mock property data to the database
export const seedProperties = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    
    // Mock properties data based on src/app/(protected)/properties/[id]/page.tsx
    const properties = [
      {
        title: "Sunset Bungalows",
        description: "Experience resort style luxury living at Sunset Bungalows. Our newly built community features sophisticated two and three-bedroom residences, each complete with high-end designer finishes, open concept oversized floor plans, gourmet kitchens, and a full size in-unit washer and dryer. Find your personal escape at home beside stunning swimming pools and spas with poolside cabanas. Experience your own private landscaped courtyards, with indoor/outdoor entertainment seating. By day, lounge in the BBQ area and experience the breath taking unobstructed views stretching from the Parus Islands Peninsula to the Santa Monica Mountains. Light up your day with a workout in our full-size state of the art fitness club and yoga studio.",
        purpose: "rent", // "rent" or "sell"
        type: "home", // "home", "flat", "portion", "farm"
        city: "Lahore",
        location: {
          latitude: 31.4697,
          longitude: 74.3991,
        },
        areaSize: 980,
        price: 530000,
        bedrooms: 2,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        ],
        vrTourLink: "https://my.matterport.com/show/?m=aSx1MpRRqif",
        contactInfo: {
          email: "contact@sunsetbungalows.com",
          phone: "+92 300 1234567"
        },
        sellerId: userId
      },
      {
        title: "Cangu Privat Villa",
        description: "Located in the heart of Lahore's most exclusive neighborhood, this private villa offers an unparalleled living experience. Featuring high ceilings, floor-to-ceiling windows, and premium finishes throughout, this property is a perfect blend of luxury and comfort. The property includes access to community amenities including a gym, swimming pool, and 24/7 security.",
        purpose: "sell", // "rent" or "sell"
        type: "home", // "home", "flat", "portion", "farm"
        city: "Lahore",
        location: {
          latitude: 31.4797,
          longitude: 74.4091,
        },
        areaSize: 1150,
        price: 200000,
        bedrooms: 2,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600607687644-c7e5eea20e81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        ],
        vrTourLink: "https://my.matterport.com/show/?m=zEWsxhZpGba",
        contactInfo: {
          email: "info@canguvilla.com",
          phone: "+92 300 7654321"
        },
        sellerId: userId
      },
      {
        title: "Villa Kayu Raja",
        description: "Welcome to Villa Kayu Raja, a serene and intimate property in the heart of DHA Phase 6. This charming villa offers a perfect blend of traditional and modern design elements, creating a warm and inviting atmosphere. The property features a private pool, spacious living areas, and lush gardens that provide perfect relaxation spaces and entertainment venues.",
        purpose: "rent", // "rent" or "sell"
        type: "farm", // "home", "flat", "portion", "farm"
        city: "Lahore",
        location: {
          latitude: 31.4607,
          longitude: 74.3971,
        },
        areaSize: 850,
        price: 130000,
        bedrooms: 1,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        ],
        vrTourLink: "https://my.matterport.com/show/?m=SrVSGcZu26S",
        contactInfo: {
          email: "booking@kayuraja.com",
          phone: "+92 300 9876543"
        },
        sellerId: userId
      },
      {
        title: "The Edge Bali",
        description: "Experience the ultimate luxury at The Edge Bali, a stunning property inspired by Balinese aesthetics in the prestigious DHA Phase 4 area. This exclusive property offers breathtaking views, open-concept living spaces, and premium finishes throughout. The outdoor living area features a private infinity pool, perfect for relaxation and entertainment.",
        purpose: "sell", // "rent" or "sell"
        type: "flat", // "home", "flat", "portion", "farm"
        city: "Lahore",
        location: {
          latitude: 31.4727,
          longitude: 74.4081,
        },
        areaSize: 920,
        price: 190000,
        bedrooms: 2,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        ],
        vrTourLink: "https://my.matterport.com/show/?m=Lm9dZoVVCkd",
        contactInfo: {
          email: "sales@edgebali.com",
          phone: "+92 300 4567890"
        },
        sellerId: userId
      },
      {
        title: "Modern City Apartment",
        description: "Perfectly positioned in the heart of Karachi's business district, this modern apartment offers convenience and luxury living. Floor-to-ceiling windows provide abundant natural light and stunning city views. The open floor plan features a gourmet kitchen with premium appliances, a spacious living area, and a private balcony perfect for morning coffee or evening relaxation.",
        purpose: "rent", // "rent" or "sell"
        type: "flat", // "home", "flat", "portion", "farm"
        city: "Karachi",
        location: {
          latitude: 24.8607,
          longitude: 67.0011,
        },
        areaSize: 750,
        price: 85000,
        bedrooms: 1,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1617104678098-de229db51175?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80",
          "https://images.unsplash.com/photo-1599619351208-3e6c839d6828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
          "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        ],
        contactInfo: {
          email: "rentals@cityapartments.com",
          phone: "+92 300 1122334"
        },
        sellerId: userId
      },
      {
        title: "Riverside Garden Home",
        description: "This charming riverside home offers a perfect blend of natural beauty and modern comfort. Set on a spacious plot with mature gardens and direct river access, the property features a large covered veranda perfect for outdoor entertaining. Inside, high ceilings and large windows create bright, airy living spaces with views of the garden and river from almost every room.",
        purpose: "sell", // "rent" or "sell"
        type: "home", // "home", "flat", "portion", "farm"
        city: "Islamabad",
        location: {
          latitude: 33.6844,
          longitude: 73.0479,
        },
        areaSize: 2200,
        price: 450000,
        bedrooms: 4,
        bathrooms: 3,
        images: [
          "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1604014238170-4def1e4e6fcf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        ],
        vrTourLink: "https://my.matterport.com/show/?m=V48EKEiUcf3",
        contactInfo: {
          email: "sales@greenvalley.com",
          phone: "+92 300 5544332"
        },
        sellerId: userId
      }
    ];

    // Add all properties to the database
    const propertyIds = [];
    for (const property of properties) {
      const propertyId = await ctx.db.insert("properties", {
        ...property,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      propertyIds.push(propertyId);
    }

    return {
      success: true,
      message: `Successfully added ${propertyIds.length} properties`,
      propertyIds
    };
  },
});

// Function to clear all properties from the database
export const clearProperties = mutation({
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").collect();
    
    for (const property of properties) {
      await ctx.db.delete(property._id);
    }
    
    return {
      success: true,
      message: `Successfully removed ${properties.length} properties`
    };
  },
}); 