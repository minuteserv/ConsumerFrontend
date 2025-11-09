# Minuteserv - Parlor Booking Website

A modern, responsive website for booking parlor services, built with React and Tailwind CSS.

## Features

- **Service Browsing**: Browse services organized by tiers (Minimal, Exclusive, E-Lite) and categories
- **Shopping Cart**: Add services to cart and manage quantities
- **Booking System**: Complete booking flow with date/time selection and payment options
- **Bookings Management**: View past, upcoming, and favorite bookings
- **Contact Us**: Contact form integrated with API
- **Responsive Design**: Beautiful UI matching Figma designs with purple accent theme

## Tech Stack

- React 19
- React Router DOM
- Tailwind CSS
- Lucide React (Icons)
- Vite

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (Button, Card)
│   └── ...          # Feature components (Header, ServiceCard, etc.)
├── contexts/        # React contexts (CartContext)
├── data/           # JSON data files (services.json)
├── lib/            # Utilities and API functions
├── pages/           # Page components (Home, Checkout, Bookings, Contact)
└── App.jsx         # Main app component with routing
```

## API Integration

The app includes mock API functions that simulate booking and contact form submissions. To integrate with real APIs:

1. Update `src/lib/api.js` - Uncomment the fetch calls
2. Set proper API endpoints in `src/lib/constants.js`
3. Ensure CORS is configured on your backend

## Company Information

- **Name**: Minuteserv
- **Email**: minuteserv@gmail.com
- **Phone**: +91 81002 30459
- **Address**: 75/95, Ram Thakur Road, Bijoygarh, Jadavpur, Kolkata-700032

## Design

The UI follows the Figma design specifications with:
- Primary color: Purple (#6440FE)
- Clean, modern interface
- Card-based layouts
- Responsive design for all screen sizes

## License

Private project for Minuteserv.