import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './App.css';
import { ScrollToTop } from './components/ScrollToTop';

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
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/bookings" element={<Bookings />} />
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
            <Footer className="hidden md:block" />
            <BottomNav />
          </Router>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;