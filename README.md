# Eternal Vows — Elena & Marcus Wedding Website

A beautiful botanical-elegance wedding website built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Home** — Hero with live countdown, venue teaser, quick info cards
- **Our Story** — Photo gallery + wedding party profiles
- **Venue & Itinerary** — Location details and event timeline
- **RSVP** — Interactive form with attendance & meal preference

## Design System

Inspired by *Botanical Elegance*:
- Champagne gold primary, sage green tertiary, dusty rose secondary
- Playfair Display + Montserrat typography
- Soft glassmorphism, ambient shadows, rounded organic shapes

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build       |
| `npm start`   | Start production server  |
| `npm run lint`  | Run ESLint             |

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home
│   ├── our-story/        # Gallery & wedding party
│   ├── venue/            # Venue & itinerary
│   ├── rsvp/             # RSVP form
│   ├── layout.tsx
│   └── globals.css
└── components/
    ├── Navbar.tsx
    ├── Footer.tsx
    └── Countdown.tsx
```

## Customize

- Wedding date: edit `WEDDING_DATE` in `src/components/Countdown.tsx`
- Couple names, venue, colors: search-and-replace in components / Tailwind config
- Images: currently using Unsplash placeholders — swap for your photos

Built from the Stitch "Botanical Elegance" design system.
