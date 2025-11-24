import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Bookings } from './pages/Bookings';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { AntiDiscriminationPolicy } from './pages/AntiDiscriminationPolicy';
import { Terms } from './pages/Terms';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { CartSummary } from './components/CartSummary';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { LocationAutoDetect } from './components/LocationAutoDetect';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';
import { ScrollToTop } from './components/ScrollToTop';

function AppContent() {
  const location = useLocation();
  const isCartOrCheckout = location.pathname === '/cart' || location.pathname === '/checkout';
  
  // Hide footer on mobile for cart and checkout routes only
  // For other routes (including home), show footer on both mobile and desktop
  const footerClassName = isCartOrCheckout 
    ? 'hidden md:block' // Hidden on mobile, shown on desktop
    : 'block'; // Visible on both mobile and desktop for home and other routes

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Protected Routes - Require Authentication */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bookings" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Bookings />
            </ProtectedRoute>
          } 
        />
        {/* Public Routes */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/service/:serviceId" element={<ServiceDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/anti-discrimination-policy" element={<AntiDiscriminationPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      <CartSummary />
      <Footer className={footerClassName} />
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <LocationAutoDetect />
        <CartProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppContent />
          </Router>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;