# Project Overview
Realtor'sHub is a real estate management platform that connects property sellers with potential buyers. Sellers can list properties with detailed information while buyers can browse, search, and directly contact property owners. Future expansions will include rental management and virtual auction features.

## Property Management Flow  
flowchart TD
    A[ Landing page and User Registration/Login] --> B[Role-Based Dashboard]
    B --> C{Seller Flow}
    C --> D[Property Listing Creation]
    D --> E[Media Upload\n(Photos/3D Tours)]
    E --> F[Price & Details Validation]
    B --> G{Buyer Flow}
    G --> H[Search & Filter Properties]
    H --> I[Save Favorites]
    I --> J[Contact Owner]
    
    subgraph Core Features
        D --> Validation["• Title\n• Description\n• Property Type\n• Square Footage"]
        E --> Media["• Image Gallery\n• Virtual Tour\n• PDF Brochures"]
        H --> Filters["• Price Range\n• Location Map\n• Bed/Bath\n• Amenities"]
        J --> Contact["Secure Messaging System\n+ SMS Notifications"]
    end
    
    style D stroke:#00c4cc,stroke-width:2px
    style H stroke:#2ecc71,stroke-width:2px

# Feature Requirements
- Using Next.js, shadcn, Clerk Auth, Supabase, Mapbox API
## Front-End Feature Requirements for "Realtor'sHub"  
### Homepage (`/`)  
**Core Elements**:  
- **Hero Section**:  
  - Header: "Find Your Dream Property or List Your Investment 🏡"  
  - Dual CTA Buttons: "Browse Properties" / "List Property" (role-aware)  
  - Location Search Bar with Auto-Complete  
- **Featured Listings**:  
  - Grid of 6 cards with swipeable carousel: Property image, price, quick stats  
- **How It Works**:  
  - 3-Step Visual Guide: "1. List/Browse 2. Connect 3. Transact"  

---

### Dashboard (`/dashboard`)  
**Role-Based Views**:  
1. **Seller Dashboard**:  
   - Active Listings Table  
   - Performance Metrics: Views/Leads/Conversion Rate  
   - Quick Action: "+ Add New Property"  
   
2. **Buyer Dashboard**:  
   - Saved Properties Grid  
   - Recent View History  
   - Recommended Properties Slider  

---

### Property Creation (`/list-property`)  
**Core Elements**:  
1. **Multi-Step Form**:  
   - Step 1: Basic Info (Title, Type, Price)  
   - Step 2: Detailed Description & Amenities  
   - Step 3: Media Upload (Drag-and-Drop Zone + Virtual Tour URL)  
   - Step 4: Location Map Pinning  

2. **Preview System**:  
   - Mobile/Desktop Toggle  
   - Auto-Generated Property Brochure Preview  

---

### Property Details (`/properties/[id]`)  
**Core Elements**:  
1. **Gallery Section**:  
   - Main Image Carousel + Thumbnail Strip  
   - 360° Tour Button (if available)  

2. **Key Details**:  
   - Price Breakdown Calculator  
   - Neighborhood Map (Schools/Transportation)  
   - Amenities Checklist  

3. **Contact Widget**:  
   - Secure Message Form  
   - Owner Verification Badge  
   - Schedule Visit Button  

---

## Back-End Implementation Guide  
**Database Schema**:  
```sql
-- Properties Table
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  title VARCHAR(120),
  description TEXT,
  property_type VARCHAR(20),
  price NUMERIC(12,2),
  location GEOGRAPHY(POINT),
  amenities JSONB,
  owner_id UUID REFERENCES users,
  listed_at TIMESTAMPTZ
);

-- Users Table
CREATE TYPE user_role AS ENUM ('buyer', 'seller');
CREATE TABLE users (
  id UUID PRIMARY KEY,
  role user_role NOT NULL,
  contact_info JSONB,
  saved_properties UUID[]
);

Mapbox Integration
Install React Map GL

bash
Copy
npm install react-map-gl
Create wrapper component:

tsx
Copy
<ReactMapGL
  mapboxAccessToken={process.env.MAPBOX_KEY}
  {...viewport}
  onViewportChange={setViewport}
/>
File Upload with Supabase
tsx
Copy
const { data, error } = await supabase.storage
  .from('property-images')
  .upload(`user_${userId}/${file.name}`, file);



  Current File Structure
📁 REALTORSHUB
├── 📁 app
│ ├── 📁 properties
│ │ ├── 📄 [id]
│ │ │ └── 📄 page.tsx
│ │ └── 📄 list-property
│ │ └── 📄 page.tsx
│ ├── 📄 layout.tsx
│ └── 📄 page.tsx
├── 📁 components
│ └── 📄 property-card.tsx
├── 📁 lib
│ └── 📄 supabase-client.ts
└── 📁 public

Rules
All map-related components in /components/maps

Property images stored in Supabase Storage

User-sensitive actions require role verification

Always mask contact info until signed NDA