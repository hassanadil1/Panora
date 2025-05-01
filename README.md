This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Essential Packages to Install

To run this project, you'll need to install the following core packages:

```bash
# Base Next.js and React
npm install next react react-dom

# Map-related packages (essential for the property listing map)
npm install mapbox-gl @types/mapbox-gl react-map-gl @types/react-map-gl

# UI Components and Elements (for the property listings and sidebar)
npm install @radix-ui/react-avatar @radix-ui/react-badge
npm install @radix-ui/react-slider @radix-ui/react-separator
npm install @radix-ui/react-slot @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu @radix-ui/react-tooltip

# Note: The sidebar component is a custom component in @/components/ui/sidebar
# You do not need to install it separately as it comes with the project files

# UI and Animation
npm install framer-motion lucide-react
npm install @radix-ui/react-avatar @radix-ui/react-slider @radix-ui/react-separator
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate

# Authentication and Backend
npm install @clerk/nextjsx
npm install @supabase/supabase-js

# Form handling and validation
npm install react-hook-form @hookform/resolvers zod

### Installing All Dependencies at Once

Instead of installing packages individually, you can copy this `package.json` and run `npm install`:

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.2.7",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-avatar": "^1.1.7",
    "@radix-ui/react-badge": "^1.0.0",
    "@radix-ui/react-dialog": "^1.1.11",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.1.4",
    "@radix-ui/react-slider": "^1.3.2",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.2.4",
    "@shadcn/ui": "^0.0.4",
    "@supabase/supabase-js": "^2.39.7",
    "@tabler/icons-react": "^3.31.0",
    "@types/mapbox-gl": "^3.4.1",
    "@types/react-map-gl": "^6.1.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.6.5",
    "lucide-react": "^0.344.0",
    "mapbox-gl": "^3.11.0",
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.55.0",
    "react-map-gl": "^8.0.4",
    "swiper": "^11.2.5",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

After installing these packages, you'll need to set up your Mapbox API key in the `.env.local` file:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

You can get a Mapbox token by signing up at [mapbox.com](https://www.mapbox.com/).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.