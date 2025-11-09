import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { calculateTaxFee } from "@/lib/utils";

const MobileSection = ({
  id,
  icon: IconComponent,
  title,
  helper,
  completed,
  expandedSection,
  onToggleSection,
  children,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => onToggleSection(id)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3"
      >
        <div className="flex items-center gap-3 text-left">
          <IconComponent size={18} className="text-gray-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {helper && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {helper}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completed && <CheckCircle2 size={18} className="text-primary" />}
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform ${
              expandedSection === id ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {expandedSection === id && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { LoginModal } from "../components/LoginModal";
import { bookingAPI, saveAddress, validatePromoCodeAPI } from "../lib/api";
import { COMPANY_INFO, RAZORPAY_CONFIG } from "../lib/constants";
import { paymentService, generateReceiptId } from "../lib/payment";
import {
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  MapPin,
  ChevronDown,
  ChevronRight,
  Edit,
  Lock,
  Shield,
  Truck,
  X,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Package,
  ArrowLeft,
  Info,
} from "lucide-react";

export function Checkout() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();
  const { isAuthenticated, user } = useAuth();
  const { currentLocation, setLocation, addSavedLocation } = useLocation(); // Get location functions from context
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoDetails, setPromoDetails] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showDateErrorModal, setShowDateErrorModal] = useState(false);
  const [showBookingErrorModal, setShowBookingErrorModal] = useState(false);
  const [showPaymentErrorModal, setShowPaymentErrorModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [showCancellationPolicyModal, setShowCancellationPolicyModal] =
    useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [expandedMobileSection, setExpandedMobileSection] = useState("customer");
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  // Load address from localStorage on mount
  const loadAddressFromStorage = () => {
    try {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem("minuteserv_address");
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error loading address from localStorage:", error);
      return null;
    }
  };

  const savedAddress = loadAddressFromStorage();
  const [address, setAddress] = useState(savedAddress?.address || "");
  const [isEditingAddress, setIsEditingAddress] = useState(
    !savedAddress?.address
  ); // Start in edit mode if no address
  const [addressLine1, setAddressLine1] = useState(
    savedAddress?.addressLine1 || ""
  );
  const [addressLine2, setAddressLine2] = useState(
    savedAddress?.addressLine2 || ""
  );
  const [city, setCity] = useState(savedAddress?.city || "Kolkata");
  const [state, setState] = useState(savedAddress?.state || "West Bengal");
  const [pincode, setPincode] = useState(savedAddress?.pincode || "700032");

  // Save address to localStorage
  const saveAddressToStorage = (addrData) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem("minuteserv_address", JSON.stringify(addrData));
    } catch (error) {
      console.error("Error saving address to localStorage:", error);
    }
  };
  // Pre-fill from user data if logged in
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(
    user?.phoneNumber ? user.phoneNumber.replace('+91', '') : ""
  );
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Update form when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name) setCustomerName(user.name);
      if (user.phoneNumber) {
        setCustomerPhone(user.phoneNumber.replace('+91', ''));
      }
      if (user.email) setCustomerEmail(user.email);
    }
  }, [isAuthenticated, user]);
  
  // Sync location from LocationContext to checkout form
  // Only sync if location was NOT manually edited in checkout (to avoid overwriting user edits)
  useEffect(() => {
    if (currentLocation && !currentLocation.manuallyEdited) {
      const fullAddress = [
        currentLocation.addressLine1,
        currentLocation.addressLine2,
        currentLocation.city,
        currentLocation.state,
        currentLocation.pincode,
      ]
        .filter(Boolean)
        .join(', ');

      // Only auto-fill if address fields are empty or user hasn't manually edited
      const hasManualAddress = savedAddress?.address && 
        (addressLine1 || addressLine2 || city || state || pincode);
      
      // Auto-fill if no manual address exists or if location was just selected
      if (fullAddress && !hasManualAddress) {
        console.log('📍 Checkout: Syncing location from LocationContext to form:', currentLocation);
        
        // If addressLine1 is missing but we have a formatted address, extract it
        let addressLine1Value = currentLocation.addressLine1 || '';
        if (!addressLine1Value && currentLocation.address) {
          // Extract first part of address (before first comma)
          const addressParts = currentLocation.address.split(',');
          addressLine1Value = addressParts[0]?.trim() || '';
        }
        
        setAddress(fullAddress || currentLocation.address);
        setAddressLine1(addressLine1Value);
        setAddressLine2(currentLocation.addressLine2 || '');
        setCity(currentLocation.city || 'Kolkata');
        setState(currentLocation.state || 'West Bengal');
        setPincode(currentLocation.pincode || '700032');
        setIsEditingAddress(false);
        
        // Save to localStorage
        saveAddressToStorage({
          address: fullAddress || currentLocation.address,
          addressLine1: addressLine1Value,
          addressLine2: currentLocation.addressLine2 || '',
          city: currentLocation.city || 'Kolkata',
          state: currentLocation.state || 'West Bengal',
          pincode: currentLocation.pincode || '700032',
        });
      }
    }
  }, [currentLocation]);
  
  // Check authentication when cart has items
  useEffect(() => {
    if (cart.length > 0 && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [cart.length, isAuthenticated]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Review, 3: Payment

  const rawTotalPrice = getTotalPrice();
  const totalPrice = Math.floor(rawTotalPrice * 100) / 100;
  const rawPromoDiscount = Number(promoDetails?.discount ?? 0);
  const discount = Math.min(
    Math.floor((Number.isFinite(rawPromoDiscount) ? rawPromoDiscount : 0) * 100) /
      100,
    totalPrice
  );
  const finalPrice = Math.max(totalPrice - discount, 0);
  const tax = calculateTaxFee(finalPrice);
  const grandTotal = Math.floor((finalPrice + tax) * 100) / 100;

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "0.00";
    return num.toFixed(2);
  };

  const formatAddressDisplay = (rawAddress) => {
    if (!rawAddress) return "Not provided";
    return rawAddress.replace(/, /g, ",\n");
  };

  // Calculate savings
  const savingsRaw = cart.reduce((total, item) => {
    if (
      item.marketPrice &&
      item.productCost &&
      item.marketPrice > item.productCost
    ) {
      return total + (item.marketPrice - item.productCost) * item.quantity;
    }
    return total;
  }, 0);
  const savings = Math.floor(savingsRaw * 100) / 100;

  // Track mobile viewport for date picker
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setExpandedMobileSection("customer");
    }
  }, [currentStep, isMobile]);

  // Generate next 14 days for date selection
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  
  // Limit to 6 days on mobile (3 cols x 2 rows)
  const displayDates = isMobile ? dates.slice(0, 6) : dates;

  const timeSlots = [
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
  ];

  const handleApplyPromo = async () => {
    setPromoError("");
    const code = promoCode.toUpperCase().trim();

    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }

    setIsApplyingPromo(true);
    try {
      const result = await validatePromoCodeAPI({
        code,
        amount: totalPrice,
      });

      if (!result?.success || !result?.promo?.valid) {
        setPromoError(
          result?.promo?.message ||
            result?.message ||
            "Invalid promo code. Please try again."
        );
        return;
      }

      const discountValue = Number(result.promo.discount) || 0;

      setAppliedPromo(result.promo.promo_code || code);
      setPromoDetails({
        ...result.promo,
        discount: Math.floor(discountValue * 100) / 100,
      });
      setPromoCode("");
      setPromoError("");
    } catch (error) {
      setPromoError(error.message || "Unable to apply promo code right now.");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDetails(null);
    setPromoError("");
  };

  const validateStep1 = () => {
    if (!customerName.trim()) {
      setShowDateErrorModal(true);
      return false;
    }
    if (!customerPhone.trim()) {
      setShowDateErrorModal(true);
      return false;
    }
    if (
      !address.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      setIsEditingAddress(true);
      setShowDateErrorModal(true);
      return false;
    }
    if (!selectedDate || !selectedTime) {
      setShowDateErrorModal(true);
      return false;
    }
    return true;
  };

  const handleContinueToReview = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /**
   * Handle payment success callback
   */
  const handlePaymentSuccess = async (paymentResponse) => {
    setIsProcessingPayment(true);

    try {
      // Verify payment with backend
      const verificationResult = await paymentService.verifyPayment({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        booking_id: paymentResponse.booking_id || null, // Will be set if booking created first
      });

      if (!verificationResult.verified) {
        throw new Error("Payment verification failed");
      }

      // If booking was already created (flow: booking first, then payment), we're done
      if (verificationResult.booking) {
        clearCart();
        setShowPaymentSuccessModal(true);
        setTimeout(() => {
          navigate("/bookings", {
            state: {
              bookingSuccess: true,
              bookingId: verificationResult.booking.id,
              paymentId: paymentResponse.razorpay_payment_id,
            },
          });
        }, 2000);
        return;
      }

      // Legacy flow: Payment first, then create booking (for backward compatibility)
      // Note: This flow should be updated to create booking first in future
      const bookingData = {
        services: cart,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        paymentMethod: "online",
        paymentId: paymentResponse.razorpay_payment_id,
        paymentOrderId: paymentResponse.razorpay_order_id,
        paymentSignature: paymentResponse.razorpay_signature,
        promoCode: appliedPromo,
        totalPrice: finalPrice,
        tax,
        grandTotal,
        discount,
        customerName,
        customerPhone,
        customerEmail,
        address,
        address_id: savedAddressId || null, // Use saved address ID if available
        receiptId: generateReceiptId(),
      };

      await bookingAPI(bookingData);
      clearCart();
      setShowPaymentSuccessModal(true);

      // Navigate to bookings after short delay
      setTimeout(() => {
        navigate("/bookings", {
          state: {
            bookingSuccess: true,
            paymentId: paymentResponse.razorpay_payment_id,
          },
        });
      }, 2000);
    } catch (error) {
      console.error("Payment success handling error:", error);
      setPaymentError(
        "Payment successful but booking creation failed. Please contact support with payment ID: " +
          paymentResponse.razorpay_payment_id
      );
      setShowPaymentErrorModal(true);
    } finally {
      setIsProcessingPayment(false);
      setPaymentInitiated(false);
    }
  };

  /**
   * Handle payment failure
   */
  const handlePaymentFailure = (error) => {
    console.error("Payment failure:", error);
    setPaymentError(
      error.error?.description ||
        "Payment failed. Please try again or use cash payment."
    );
    setShowPaymentErrorModal(true);
    setIsProcessingPayment(false);
    setPaymentInitiated(false);
  };

  /**
   * Handle payment dismissal (user closed modal)
   */
  const handlePaymentDismiss = () => {
    setIsProcessingPayment(false);
    setPaymentInitiated(false);
  };

  /**
   * Handle payment error during initialization
   */
  const handlePaymentError = (error) => {
    console.error("Payment initialization error:", error);
    setPaymentError(
      "Unable to initialize payment. Please try again or contact support."
    );
    setShowPaymentErrorModal(true);
    setIsProcessingPayment(false);
    setPaymentInitiated(false);
  };

  /**
   * Initialize Razorpay payment - Backend Integrated
   * Creates booking first, then uses backend Razorpay order
   */
  const handleRazorpayPayment = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setIsProcessingPayment(true);
    setPaymentInitiated(true);

    try {
      // Save address to backend first if user is authenticated
      let addressId = null;
      if (isAuthenticated && addressLine1 && city && state && pincode) {
        try {
          const addressResult = await saveAddress({
            name: 'Booking Address',
            address_line1: addressLine1,
            address_line2: addressLine2 || null,
            city,
            state,
            pincode,
            lat: currentLocation?.lat || null,
            lng: currentLocation?.lng || null,
            place_id: currentLocation?.placeId || null,
            is_default: false,
          });
          addressId = addressResult.address_id;
        } catch (error) {
          console.warn('Failed to save address, continuing with booking:', error);
          // Continue without address_id if save fails
        }
      }

      // Create booking via backend (this creates Razorpay order)
      const bookingData = {
        services: cart,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        paymentMethod: "online",
        promoCode: appliedPromo,
        customerName,
        customerPhone,
        customerEmail,
        address,
        address_id: addressId || null,
        cancellation_policy_accepted: true,
      };

      // Create booking - backend will create Razorpay order and return it
      const bookingResult = await bookingAPI(bookingData);

      if (!bookingResult.success) {
        throw new Error("Failed to create booking");
      }

      // Use Razorpay order from backend
      const paymentOrder = bookingResult.payment;

      // If Razorpay order exists, use Razorpay Checkout modal (dynamic pricing)
      if (paymentOrder?.order_id) {
        const payableAmount = paymentOrder?.amount
          ? paymentOrder.amount / 100
          : grandTotal;

        // Initialize Razorpay with backend order (amount is dynamic based on cart)
        await paymentService.initializePayment({
          amount: payableAmount, // Prefer backend order amount to ensure parity
          razorpayOrderId: paymentOrder.order_id,
          orderId: bookingResult.bookingNumber || bookingResult.bookingId,
          bookingId: bookingResult.bookingId,
          customerName,
          customerPhone,
          customerEmail,
          bookingDate: selectedDate.toISOString().split("T")[0],
          bookingTime: selectedTime,
          companyName: COMPANY_INFO.name,
          description: paymentOrder.description || `Booking ${bookingResult.bookingNumber}`,
          razorpayKey: paymentOrder.key || RAZORPAY_CONFIG.keyId,
          onSuccess: (paymentResponse) => {
            // Pass booking_id to payment response for verification
            handlePaymentSuccess({
              ...paymentResponse,
              booking_id: bookingResult.bookingId,
            });
          },
          onFailure: handlePaymentFailure,
          onDismiss: handlePaymentDismiss,
          onError: handlePaymentError,
        });
      } else {
        // Razorpay not configured - show error and suggest cash payment
        setIsProcessingPayment(false);
        setPaymentInitiated(false);
        setPaymentError("Razorpay is not configured. Please use cash payment option or contact support.");
        setShowPaymentErrorModal(true);
        console.warn("Razorpay order_id is null. Payment not configured in backend.");
      }
    } catch (error) {
      console.error("Razorpay payment initialization error:", error);
      handlePaymentError(error);
    }
  };

  /**
   * Handle cash payment booking - Backend Integrated
   */
  const handleCashPaymentBooking = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      // Save address to backend first if user is authenticated
      let addressId = null;
      if (isAuthenticated && addressLine1 && city && state && pincode) {
        try {
          const addressResult = await saveAddress({
            name: 'Booking Address',
            address_line1: addressLine1,
            address_line2: addressLine2 || null,
            city,
            state,
            pincode,
            lat: currentLocation?.lat || null,
            lng: currentLocation?.lng || null,
            place_id: currentLocation?.placeId || null,
            is_default: false,
          });
          addressId = addressResult.address_id;
        } catch (error) {
          console.warn('Failed to save address, continuing with booking:', error);
          // Continue without address_id if save fails
        }
      }

      const bookingData = {
        services: cart,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        paymentMethod: "cash",
        promoCode: appliedPromo,
        customerName,
        customerPhone,
        customerEmail,
        address,
        address_id: addressId || null,
        cancellation_policy_accepted: true,
      };

      await bookingAPI(bookingData);
      clearCart();
      navigate("/bookings", { state: { bookingSuccess: true } });
    } catch (error) {
      setShowBookingErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Main booking handler - routes based on payment method
   */
  const handleBooking = async () => {
    if (paymentMethod === "card") {
      // Online payment - use Razorpay
      await handleRazorpayPayment();
    } else {
      // Cash payment - direct booking
      await handleCashPaymentBooking();
    }
  };

  // Handle login success
  const handleLoginSuccess = () => {
    // User logged in, continue with checkout
    setShowLoginModal(false);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const canProceedToReview =
    customerName.trim() &&
    customerPhone.trim() &&
    address.trim() &&
    addressLine1.trim() &&
    city.trim() &&
    state.trim() &&
    pincode.trim() &&
    selectedDate &&
    selectedTime;

  const isPlaceOrderDisabled =
    isSubmitting ||
    isProcessingPayment ||
    !selectedDate ||
    !selectedTime ||
    !customerName ||
    !customerPhone ||
    paymentInitiated;

  const MobileCheckoutContent = () => {
    const formatSlotLabel = () => {
      if (!selectedDate || !selectedTime) return "Pick a date & time";
      return `${selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })} · ${selectedTime}`;
    };

    const handleToggleMobileSection = (sectionId) => {
      setExpandedMobileSection((prev) =>
        prev === sectionId ? null : sectionId
      );
    };

    const customerComplete = Boolean(
      customerName.trim() && customerPhone.trim()
    );
    const addressComplete = Boolean(
      address.trim() &&
      addressLine1.trim() &&
      city.trim() &&
      state.trim() &&
      pincode.trim()
    );
    const slotComplete = Boolean(selectedDate && selectedTime);
    const paymentComplete = Boolean(paymentMethod);

    return (
      <div className="space-y-5 pb-32">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Checkout Progress
              </p>
              <p className="text-base font-semibold text-gray-900">
                {currentStep === 1 && "Booking Details"}
                {currentStep === 2 && "Review Order"}
                {currentStep === 3 && "Payment"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentStep >= step ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-medium text-gray-600">
            <div className={currentStep === 1 ? "text-primary" : ""}>
              Details
            </div>
            <div className={currentStep === 2 ? "text-primary" : "text-center"}>
              Review
            </div>
            <div className={`text-right ${currentStep === 3 ? "text-primary" : ""}`}>
              Payment
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <>
            <MobileSection
              id="customer"
              icon={User}
              title="Customer Details"
              helper={
                customerComplete
                  ? `${customerName} • ${customerPhone}`
                  : "Who should we contact?"
              }
              completed={customerComplete}
              expandedSection={expandedMobileSection}
              onToggleSection={handleToggleMobileSection}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mobile-customerName" className="text-xs font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="mobile-customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1 text-sm h-11"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobile-customerPhone" className="text-xs font-medium text-gray-700">
                      Phone Number *
                    </Label>
                    <Input
                      id="mobile-customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 12345 67890"
                      className="mt-1 text-sm h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile-customerEmail" className="text-xs font-medium text-gray-700">
                      Email (Optional)
                    </Label>
                    <Input
                      id="mobile-customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1 text-sm h-11"
                    />
                  </div>
                </div>
              </div>
            </MobileSection>

            <MobileSection
              id="address"
              icon={MapPin}
              title="Service Address"
              helper={
                addressComplete
                  ? address
                  : "Where should we arrive?"
              }
              completed={addressComplete}
              expandedSection={expandedMobileSection}
              onToggleSection={handleToggleMobileSection}
            >
              {!isEditingAddress && address ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {address}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingAddress(true)}
                      className="h-9 px-3 text-xs"
                    >
                      <Edit size={14} className="mr-1" /> Edit Address
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mobile-addressLine1" className="text-xs font-medium text-gray-700">
                      Address Line 1 *
                    </Label>
                    <Input
                      id="mobile-addressLine1"
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="House/Flat No., Building"
                      className="mt-1 text-sm h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile-addressLine2" className="text-xs font-medium text-gray-700">
                      Address Line 2 (Optional)
                    </Label>
                    <Input
                      id="mobile-addressLine2"
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Street, Area, Landmark"
                      className="mt-1 text-sm h-11"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <Label htmlFor="mobile-city" className="text-xs font-medium text-gray-700">
                        City *
                      </Label>
                      <Input
                        id="mobile-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 text-sm h-11"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Label htmlFor="mobile-state" className="text-xs font-medium text-gray-700">
                        State *
                      </Label>
                      <Input
                        id="mobile-state"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-1 text-sm h-11"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Label htmlFor="mobile-pincode" className="text-xs font-medium text-gray-700">
                        Pincode *
                      </Label>
                      <Input
                        id="mobile-pincode"
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="mt-1 text-sm h-11"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        const hasRequiredAddress =
                          addressLine1.trim() && city.trim() && state.trim() && pincode.trim();
                        if (hasRequiredAddress) {
                          const displayAddress = [
                            addressLine1,
                            addressLine2,
                            city,
                            state,
                            pincode,
                          ]
                            .filter(Boolean)
                            .join(", ");
                          setAddress(displayAddress);
                          setIsEditingAddress(false);

                          const locationData = {
                            addressLine1,
                            addressLine2,
                            city,
                            state,
                            pincode,
                            address: displayAddress,
                            placeId: currentLocation?.placeId || null,
                            lat: currentLocation?.lat || null,
                            lng: currentLocation?.lng || null,
                            manuallyEdited: true,
                          };

                          setLocation(locationData);
                          addSavedLocation(locationData);
                        } else {
                          setShowDateErrorModal(true);
                        }
                      }}
                      className="px-4 py-2 text-sm font-semibold"
                    >
                      Save Address
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-4 py-2 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </MobileSection>

            <MobileSection
              id="slot"
              icon={Clock}
              title="Visit Slot"
              helper={formatSlotLabel()}
              completed={slotComplete}
              expandedSection={expandedMobileSection}
              onToggleSection={handleToggleMobileSection}
            >
              {slotComplete && (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-900">
                  {formatSlotLabel()}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">
                    Select Date
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {displayDates.map((date, idx) => {
                      const dayName = date.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                      const month = date.toLocaleDateString("en-US", {
                        month: "short",
                      });
                      const dayNum = date.getDate();
                      const isSelected =
                        selectedDate?.toDateString() === date.toDateString();
                      const isToday = idx === 0;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-2 text-xs font-medium transition ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 bg-white text-gray-900"
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-wide">
                            {isToday ? "Today" : dayName}
                          </span>
                          <span className="text-base font-semibold">{dayNum}</span>
                          <span className="text-[10px] opacity-70">{month}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">
                      Select Time
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-xl border-2 px-2 py-2 text-xs font-semibold transition ${
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-gray-200 bg-white text-gray-900"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </MobileSection>

            <MobileSection
              id="payment"
              icon={CreditCard}
              title="Payment Preference"
              helper={
                paymentMethod === "card"
                  ? "Pay online via UPI or card"
                  : "Pay when professional arrives"
              }
              completed={paymentComplete}
              expandedSection={expandedMobileSection}
              onToggleSection={handleToggleMobileSection}
            >
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                    paymentMethod === "cash"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="mobile-payment"
                    className="h-4 w-4"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      Pay by Cash
                    </span>
                    <span className="text-xs text-gray-600">
                      Pay when the service provider arrives
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="mobile-payment"
                    className="h-4 w-4"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      Pay Online
                    </span>
                    <span className="text-xs text-gray-600">
                      Secure payment via UPI or Card
                    </span>
                  </div>
                </label>
              </div>
            </MobileSection>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 m-0">
                    Order total
                  </p>
                  <p className="text-xs text-gray-500 m-0">
                    {savings > 0
                      ? `You save ₹${formatCurrency(savings)}`
                      : "Inclusive of taxes"}
                  </p>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  ₹{formatCurrency(grandTotal)}
                </span>
              </div>
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <CheckCircle2 size={16} />
                    {appliedPromo}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError("");
                      }}
                      placeholder="Promo code"
                      className={`h-11 text-sm ${promoError ? "border-red-500" : ""}`}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoCode.trim()}
                      className="h-11 px-4 text-sm font-semibold disabled:opacity-70"
                    >
                      {isApplyingPromo ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600">{promoError}</p>
                  )}
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowMobileSummary(true)}
                className="px-0 w-fit text-sm font-semibold text-primary"
              >
                View detailed breakdown
              </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 m-0">
                    Safety First
                  </p>
                  <p className="text-xs text-gray-600 m-0">
                    Verified professionals with sanitized equipment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-gray-500" />
                <p className="text-xs text-gray-600 m-0">
                  Home service available across {city || "your city"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-gray-500" />
                <p className="text-xs text-gray-600 m-0">
                  Payment is encrypted and secure
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">
                Cancellation Policy
              </p>
              <p className="text-xs text-gray-600 leading-5">
                Free cancellations up to 5 minutes after booking or if a professional
                is not assigned. Small fee applies otherwise.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCancellationPolicyModal(true)}
                className="w-fit px-2 text-xs font-semibold text-primary"
              >
                Read full policy
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Review your order
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Confirm the details before continuing to payment.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="h-9 px-3 text-xs"
                >
                  <Edit size={14} className="mr-1" /> Edit
                </Button>
              </div>
              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Customer</span>
                  <span className="text-right font-medium max-w-[150px] break-words whitespace-normal">
                    {customerName || "Not provided"}
                    <br />
                    {customerPhone || ""}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Service slot</span>
                  <span className="text-right font-medium">
                    {formatSlotLabel()}
                  </span>
                </div>
                <div className="flex justify-between gap-3 items-start">
                  <span className="text-gray-500">Address</span>
                  <span className="text-right font-medium break-words">
                    {formatAddressDisplay(address)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Payment</span>
                  <span className="text-right font-medium capitalize">
                    {paymentMethod === "card" ? "Pay Online" : "Pay by Cash"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-900">
                  Services ({cart.length})
                </p>
                <Badge className="bg-gray-100 text-gray-700">
                  {totalItems} items
                </Badge>
              </div>
              <div className="space-y-3">
                {cart.map((item, idx) => {
                  const price =
                    item.productCost ?? item.price ?? item.marketPrice ?? 0;
                  return (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} • {item.tier}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        ₹{formatCurrency(price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-900">
                  Price breakdown
                </p>
                <button
                  type="button"
                  onClick={() => setShowMobileSummary(true)}
                  className="text-xs font-semibold text-primary"
                >
                  View details
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{formatCurrency(totalPrice)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Savings</span>
                    <span>-₹{formatCurrency(savings)}</span>
                  </div>
                )}
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo ({appliedPromo})</span>
                    <span>-₹{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax & service fee</span>
                  <span>₹{formatCurrency(tax)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total payable</span>
                <span>₹{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-600" />
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Ready to place your order
                  </p>
                  <p className="text-xs text-gray-600">
                    Double-check the details below before confirming.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3 text-sm text-gray-800">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Customer</span>
                <span className="text-right font-medium">
                  {customerName}
                  <br />
                  {customerPhone}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Service slot</span>
                <span className="text-right font-medium">
                  {formatSlotLabel()}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Payment mode</span>
                <span className="text-right font-medium capitalize">
                  {paymentMethod === "card" ? "Pay Online" : "Pay by Cash"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Service address</span>
                <span className="text-right font-medium line-clamp-3">
                  {address}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-900">
                  Amount payable
                </p>
                <span className="text-lg font-semibold text-gray-900">
                  ₹{formatCurrency(grandTotal)}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                By placing your order you agree to our &nbsp;
                <Link to="/terms" className="text-primary underline">
                  T&C
                </Link>
                ,
                <Link to="/privacy-policy" className="text-primary underline">
                  &nbsp;Privacy
                </Link>
                &nbsp;and
                <button
                  onClick={() => setShowCancellationPolicyModal(true)}
                  className="text-primary underline bg-transparent border-none p-0 ml-1"
                >
                  Cancellation Policy
                </button>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const mobilePrimaryAction = (() => {
    if (currentStep === 1) {
      return {
        label: "Review Order",
        onClick: () => handleContinueToReview(),
        disabled: !canProceedToReview,
      };
    }
    if (currentStep === 2) {
      return {
        label: "Continue to Payment",
        onClick: () => {
          setCurrentStep(3);
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        disabled: false,
      };
    }
    return {
      label:
        paymentMethod === "card"
          ? isProcessingPayment
            ? "Processing..."
            : "Pay & Place Order"
          : "Place Order",
      onClick: () => handleBooking(),
      disabled: isPlaceOrderDisabled,
    };
  })();

  const mobileSecondaryAction = (() => {
    if (currentStep === 1) {
      return {
        label: "Back to Cart",
        onClick: () => navigate("/cart"),
      };
    }
    if (currentStep === 2) {
      return {
        label: "Back to Details",
        onClick: () => {
          setCurrentStep(1);
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
      };
    }
    return {
      label: "Back to Review",
      onClick: () => {
        setCurrentStep(2);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
    };
  })();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div
          style={{
            maxWidth: "1232px",
            width: "100%",
            margin: "0 auto",
            padding: "40px 16px",
          }}
        >
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <h1
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "24px",
                lineHeight: "32px",
                color: "rgb(15, 15, 15)",
                fontWeight: 600,
                marginBottom: "16px",
                marginTop: 0,
              }}
            >
              Your cart is empty
            </h1>
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
                color: "rgb(84, 84, 84)",
                marginBottom: "24px",
              }}
            >
              Add services to your cart to proceed with checkout.
            </p>
            <Button onClick={() => navigate("/services")}>
              Browse Services
            </Button>
          </div>
        </div>
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-32">
      {/* Header - Desktop Only */}
      <div className="hidden md:block">
        <Header showSearch={false} />
      </div>
      
      {/* Mobile Back Button */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-gray-900 bg-transparent border-none cursor-pointer p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-base font-semibold tracking-wide">Checkout</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1232px] mx-auto px-3 sm:px-4 md:px-8 py-4 md:py-10">
        {/* Progress Steps - Evenly Distributed Spacing */}
        <div className="hidden md:flex items-center w-full mb-4 md:mb-8 pb-3 md:pb-6 border-b border-gray-200">
          {/* Step 1 - Equal Width */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 ${
                  currentStep >= 1
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 size={14} className="sm:w-[18px] sm:h-[18px]" /> : "1"}
              </div>
              <span
                className={`text-[10px] sm:text-xs md:text-base truncate ${
                  currentStep >= 1
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 font-normal"
                }`}
              >
                Booking Details
              </span>
            </div>
          </div>
          
          {/* Separator 1 */}
          <div className="flex-shrink-0 px-1 sm:px-2">
            <ChevronRight size={12} className="text-gray-600 hidden sm:block sm:w-4 sm:h-4" />
          </div>

          {/* Step 2 - Equal Width */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 ${
                  currentStep >= 2
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > 2 ? <CheckCircle2 size={14} className="sm:w-[18px] sm:h-[18px]" /> : "2"}
              </div>
              <span
                className={`text-[10px] sm:text-xs md:text-base truncate ${
                  currentStep >= 2
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 font-normal"
                }`}
              >
                Review Order
              </span>
            </div>
          </div>
          
          {/* Separator 2 */}
          <div className="flex-shrink-0 px-1 sm:px-2">
            <ChevronRight size={12} className="text-gray-600 hidden sm:block sm:w-4 sm:h-4" />
          </div>

          {/* Step 3 - Equal Width */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 ${
                  currentStep >= 3
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span
                className={`text-[10px] sm:text-xs md:text-base truncate ${
                  currentStep >= 3
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 font-normal"
                }`}
              >
                Payment
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 md:gap-8 items-start">
          {/* Left Column - Main Content */}
          <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full lg:max-w-[738px]">
            {/* Step 1: Booking Details */}
            {currentStep === 1 && (
              <>
                {/* Customer Information (with Address) */}
                <Card className="border border-gray-200 rounded-lg">
                  <CardHeader className="p-3 md:p-5 border-b border-gray-200 flex items-center gap-2 md:gap-3">
                    <User size={18} className="sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 m-0">
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 md:p-5">
                    <div className="flex flex-col gap-3 md:gap-6">
                      <div>
                        <Label
                          htmlFor="customerName"
                          className="text-xs sm:text-sm font-medium text-gray-900 mb-1 md:mb-1.5 block"
                        >
                          Full Name *
                        </Label>
                        <Input
                          id="customerName"
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-3.5 border-gray-200 rounded-md min-h-[44px]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                        <div>
                          <Label
                            htmlFor="customerPhone"
                            className="text-xs sm:text-sm font-medium text-gray-900 mb-1 md:mb-1.5 flex items-center gap-1 md:gap-1.5"
                          >
                            <Phone size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                            Phone Number *
                          </Label>
                          <Input
                            id="customerPhone"
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+91 12345 67890"
                            required
                            className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-3.5 border-gray-200 rounded-md min-h-[44px]"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="customerEmail"
                            className="text-xs sm:text-sm font-medium text-gray-900 mb-1 md:mb-1.5 flex items-center gap-1 md:gap-1.5"
                          >
                            <Mail size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                            Email (Optional)
                          </Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-3.5 border-gray-200 rounded-md min-h-[44px]"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Address Section */}
                <Card className="border border-gray-200 rounded-lg">
                  <CardHeader className="p-3 md:p-5 border-b border-gray-200 flex items-center gap-2 md:gap-3">
                    <MapPin size={18} className="sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 m-0">
                      Service Address *
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 md:p-5">
                    <div className="flex flex-col gap-3 md:gap-4">
                      {!isEditingAddress && address ? (
                        <div className="flex items-start justify-between gap-2 md:gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm md:text-base text-gray-900 m-0 font-medium break-words">
                              {address}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingAddress(true)}
                            className="text-xs sm:text-sm text-primary px-2 md:px-3 py-1 md:py-2 h-auto font-medium whitespace-nowrap flex-shrink-0"
                          >
                            <Edit size={12} className="sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                            Edit
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 md:gap-4">
                          {/* Address Line 1 */}
                          <div>
                            <Label
                              htmlFor="addressLine1"
                              className="text-xs sm:text-sm font-medium text-gray-900 mb-1 md:mb-1.5 block"
                            >
                              Address Line 1 *
                            </Label>
                            <Input
                              id="addressLine1"
                              type="text"
                              placeholder="House/Flat No., Building Name"
                              value={addressLine1}
                              onChange={(e) => setAddressLine1(e.target.value)}
                              required
                              className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-3.5 border-gray-200 rounded-md min-h-[44px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>

                          {/* Address Line 2 */}
                          <div>
                            <Label
                              htmlFor="addressLine2"
                              className="text-xs sm:text-sm font-medium text-gray-900 mb-1 md:mb-1.5 block"
                            >
                              Address Line 2 (Optional)
                            </Label>
                            <Input
                              id="addressLine2"
                              type="text"
                              placeholder="Street, Area, Landmark"
                              value={addressLine2}
                              onChange={(e) => setAddressLine2(e.target.value)}
                              className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-3.5 border-gray-200 rounded-md min-h-[44px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>

                          {/* City, State, Pincode Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-3 md:gap-6">
                            {/* City */}
                            <div>
                              <Label
                                htmlFor="city"
                                className="text-xs sm:text-sm font-medium text-gray-900 mb-1 md:mb-1.5 block"
                              >
                                City *
                              </Label>
                              <Input
                                id="city"
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-3.5 border-gray-200 rounded-md min-h-[44px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>

                            {/* State */}
                            <div>
                              <Label
                                htmlFor="state"
                                className="text-xs sm:text-sm font-medium text-gray-900 mb-1 md:mb-1.5 block"
                              >
                                State *
                              </Label>
                              <Input
                                id="state"
                                type="text"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                                className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-3.5 border-gray-200 rounded-md min-h-[44px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>

                            {/* Pincode */}
                            <div>
                              <Label
                                htmlFor="pincode"
                                className="text-xs sm:text-sm font-medium text-gray-900 mb-1 md:mb-1.5 block"
                              >
                                Pincode *
                              </Label>
                              <Input
                                id="pincode"
                                type="text"
                                placeholder="Pincode"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                required
                                className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-3.5 border-gray-200 rounded-md min-h-[44px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                          </div>

                          {/* Save/Cancel Buttons */}
                          <div className="flex items-center gap-2 md:gap-3 pt-1">
                            {!isEditingAddress && address && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  // Reset to previous values
                                  const parts = address.split(",");
                                  if (parts.length >= 3) {
                                    setAddressLine1(parts[0] || "");
                                    setAddressLine2(parts[1] || "");
                                  }
                                }}
                                className="text-xs sm:text-sm py-2 md:py-2.5 px-4 md:px-5 border-gray-200 text-gray-600 rounded-lg font-medium min-h-[44px]"
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                const fullAddress = [
                                  addressLine1,
                                  addressLine2,
                                  city,
                                  state,
                                  pincode,
                                ]
                                  .filter(Boolean)
                                  .join(", ");

                                if (
                                  fullAddress &&
                                  addressLine1.trim() &&
                                  city.trim() &&
                                  state.trim() &&
                                  pincode.trim()
                                ) {
                                  setAddress(fullAddress);
                                  setIsEditingAddress(false);
                                  
                                  // Save to localStorage
                                  const addressData = {
                                    address: fullAddress,
                                    addressLine1,
                                    addressLine2,
                                    city,
                                    state,
                                    pincode,
                                  };
                                  saveAddressToStorage(addressData);
                                  
                                  // Also update LocationContext
                                  const locationData = {
                                    id: `manual_${Date.now()}`,
                                    name: addressLine1 || 'Manual Address',
                                    address: fullAddress,
                                    addressLine1,
                                    addressLine2,
                                    city,
                                    state,
                                    pincode,
                                    lat: currentLocation?.lat || null,
                                    lng: currentLocation?.lng || null,
                                    placeId: currentLocation?.placeId || null,
                                    manuallyEdited: true,
                                  };
                                  
                                  setLocation(locationData);
                                  addSavedLocation(locationData);
                                } else {
                                  setShowDateErrorModal(true);
                                }
                              }}
                              className="text-xs sm:text-sm py-2 md:py-2.5 px-4 md:px-5 bg-primary text-white border-none rounded-lg font-medium min-h-[44px] hover:bg-primary/90 transition-colors"
                            >
                              Save Address
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Time Selection - Mobile Optimized */}
                <Card className="border border-gray-200 rounded-lg">
                  <CardHeader className="p-3 md:p-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2 md:gap-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Clock size={18} className="sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                      <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 m-0">
                        Slot
                      </CardTitle>
                    </div>
                    {selectedDate && selectedTime && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDate(null);
                          setSelectedTime(null);
                        }}
                        className="text-xs sm:text-sm text-primary px-2 py-1 h-auto"
                      >
                        <Edit size={12} className="sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-3 md:p-5">
                    {selectedDate && selectedTime ? (
                      <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs sm:text-sm md:text-base text-gray-900 m-0 font-medium">
                          {selectedDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          - {selectedTime}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 md:gap-6">
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-1 md:gap-1.5">
                            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                            Select Date
                          </Label>
                          {/* Mobile: 3 cols x 2 rows (6 days), Desktop: Full calendar */}
                          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
                            {displayDates.map((date, idx) => {
                              const dayName = date.toLocaleDateString("en-US", {
                                weekday: "short",
                              });
                              const dayNum = date.getDate();
                              const month = date.toLocaleDateString("en-US", {
                                month: "short",
                              });
                              const isSelected =
                                selectedDate?.toDateString() ===
                                date.toDateString();
                              const isToday = idx === 0;

                              return (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedDate(date)}
                                  className={`p-1.5 sm:p-2 md:p-2.5 rounded-lg border-2 flex flex-col items-center gap-0.5 sm:gap-1 cursor-pointer transition-all min-h-[44px] min-w-[44px] ${
                                    isSelected
                                      ? "border-primary bg-primary text-white"
                                      : "border-gray-200 bg-white text-gray-900 hover:border-primary hover:bg-gray-50"
                                  }`}
                                >
                                  <div className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${
                                    isSelected ? "opacity-100" : "opacity-70"
                                  }`}>
                                    {isToday ? "Today" : dayName}
                                  </div>
                                  <div className="text-xs sm:text-sm md:text-base font-semibold">
                                    {dayNum}
                                  </div>
                                  <div className={`text-[8px] sm:text-[9px] md:text-[10px] font-normal ${
                                    isSelected ? "opacity-100" : "opacity-60"
                                  }`}>
                                    {month}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedDate && (
                          <div>
                            <Label className="text-xs sm:text-sm font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-1 md:gap-1.5">
                              <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                              Select Time
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
                              {timeSlots.map((time) => {
                                const isSelected = selectedTime === time;
                                return (
                                  <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`p-2 sm:p-2.5 md:p-3 rounded-md border-2 cursor-pointer transition-all text-xs sm:text-sm font-medium min-h-[44px] ${
                                      isSelected
                                        ? "border-primary bg-primary text-white"
                                        : "border-gray-200 bg-white text-gray-900 hover:border-primary hover:bg-gray-50"
                                    }`}
                                  >
                                    {time}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <Card className="border border-gray-200 rounded-lg">
                  <CardHeader className="p-3 md:p-5 border-b border-gray-200 flex items-center gap-2 md:gap-3">
                    <CreditCard size={18} className="sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 m-0">
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 md:p-5">
                    <div className="flex flex-col gap-3 md:gap-4">
                      <label
                        className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg cursor-pointer transition-all min-h-[44px] ${
                          paymentMethod === "cash"
                            ? "border-2 border-primary bg-gray-50"
                            : "border border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={() => setPaymentMethod("cash")}
                          className="cursor-pointer"
                        />
                        <CreditCard size={18} className="sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm sm:text-base font-medium text-gray-900 block">
                            Pay by Cash
                          </span>
                          <p className="text-xs sm:text-sm text-gray-600 m-1 mt-0">
                            Pay when service provider arrives
                          </p>
                        </div>
                        {paymentMethod === "cash" && (
                          <CheckCircle2
                            size={18}
                            className="sm:w-5 sm:h-5 text-primary fill-primary flex-shrink-0"
                          />
                        )}
                      </label>
                      <label
                        className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg cursor-pointer transition-all min-h-[44px] ${
                          paymentMethod === "card"
                            ? "border-2 border-primary bg-gray-50"
                            : "border border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="cursor-pointer"
                        />
                        <CreditCard size={18} className="sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm sm:text-base font-medium text-gray-900 block">
                            Pay Online
                          </span>
                          <p className="text-xs sm:text-sm text-gray-600 m-1 mt-0">
                            Pay securely online via UPI or Card
                          </p>
                        </div>
                        {paymentMethod === "card" && (
                          <CheckCircle2
                            size={18}
                            className="sm:w-5 sm:h-5 text-primary fill-primary flex-shrink-0"
                          />
                        )}
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Cancellation Policy */}
                <div className="p-3 md:p-5 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 m-0 mb-2">
                    Cancellation policy
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 m-0 mb-2">
                    Free cancellations till 5 mins after placing the booking or
                    if a professional is not assigned. A fee will be charged
                    otherwise.
                  </p>
                  <button
                    onClick={() => setShowCancellationPolicyModal(true)}
                    className="text-xs sm:text-sm text-primary font-medium bg-transparent border-none p-0 cursor-pointer hover:underline"
                  >
                    Read full policy.
                  </button>
                </div>

                {/* Continue Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/cart")}
                    className="w-full sm:w-auto text-sm sm:text-base py-2.5 md:py-3 px-4 md:px-6 border-gray-200 text-gray-600 rounded-lg font-medium min-h-[44px] order-2 sm:order-1"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Cart
                  </Button>
                  <Button
                    onClick={handleContinueToReview}
                    className="w-full sm:w-auto text-sm sm:text-base md:text-lg py-2.5 md:py-3 px-4 md:px-6 bg-primary text-white border-none rounded-lg font-semibold min-h-[44px] hover:bg-primary/90 transition-colors order-1 sm:order-2"
                  >
                    Continue to Review
                    <ChevronRight size={18} className="ml-2" />
                  </Button>
                </div>

                {/* Agreement Text */}
                <div className="w-full p-3 md:p-4 bg-gray-50 rounded-lg mt-4">
                  <p className="text-xs sm:text-sm text-gray-900 text-left m-0 leading-relaxed">
                    By proceeding, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="text-primary underline font-medium hover:text-primary/80"
                    >
                      T&C
                    </Link>
                    ,{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-primary underline font-medium hover:text-primary/80"
                    >
                      Privacy
                    </Link>{" "}
                    and{" "}
                    <button
                      onClick={() => setShowCancellationPolicyModal(true)}
                      className="text-primary underline font-medium bg-transparent border-none p-0 cursor-pointer hover:text-primary/80"
                    >
                      Cancellation Policy
                    </button>
                    .
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Review Order */}
            {currentStep === 2 && (
              <>
                {/* Order Summary Card */}
                <Card
                  style={{
                    border: "1px solid rgb(227, 227, 227)",
                    borderRadius: "8px",
                  }}
                >
                  <CardHeader
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid rgb(227, 227, 227)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Package size={20} color="rgb(84, 84, 84)" />
                    <CardTitle
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "18px",
                        lineHeight: "26px",
                        color: "rgb(15, 15, 15)",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      Review Your Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: "0" }}>
                    {/* Customer Info Summary */}
                    <div
                      style={{
                        padding: "20px 24px",
                        borderBottom: "1px solid rgb(227, 227, 227)",
                        backgroundColor: "rgb(250, 250, 250)",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "12px",
                              lineHeight: "16px",
                              color: "rgb(84, 84, 84)",
                              margin: "0 0 4px 0",
                              fontWeight: 500,
                            }}
                          >
                            Customer Name
                          </p>
                          <p
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "14px",
                              lineHeight: "20px",
                              color: "rgb(15, 15, 15)",
                              margin: 0,
                              fontWeight: 500,
                            }}
                          >
                            {customerName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "12px",
                              lineHeight: "16px",
                              color: "rgb(84, 84, 84)",
                              margin: "0 0 4px 0",
                              fontWeight: 500,
                            }}
                          >
                            Phone
                          </p>
                          <p
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "14px",
                              lineHeight: "20px",
                              color: "rgb(15, 15, 15)",
                              margin: 0,
                              fontWeight: 500,
                            }}
                          >
                            {customerPhone || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "12px",
                              lineHeight: "16px",
                              color: "rgb(84, 84, 84)",
                              margin: "0 0 4px 0",
                              fontWeight: 500,
                            }}
                          >
                            Service Date & Time
                          </p>
                          <p
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "14px",
                              lineHeight: "20px",
                              color: "rgb(15, 15, 15)",
                              margin: 0,
                              fontWeight: 500,
                            }}
                          >
                            {selectedDate && selectedTime
                              ? `${selectedDate.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })} at ${selectedTime}`
                              : "Not selected"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        style={{
                          marginTop: "12px",
                          fontSize: "14px",
                          color: "rgb(110, 66, 229)",
                          padding: "4px 12px",
                        }}
                      >
                        <Edit size={14} style={{ marginRight: "4px" }} />
                        Edit Details
                      </Button>
                    </div>

                    {/* Services List */}
                    <div style={{ padding: "24px" }}>
                      <h3
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "rgb(15, 15, 15)",
                          fontWeight: 600,
                          marginBottom: "16px",
                          marginTop: 0,
                        }}
                      >
                        Services ({cart.length})
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        {cart.map((item, idx) => {
                              const price =
                                item.productCost ??
                                item.price ??
                                item.servicePrice ??
                                item.marketPrice ??
                                0;
                          const itemTotal = price * item.quantity;
                          return (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                gap: "12px",
                                padding: "16px",
                                backgroundColor: "rgb(250, 250, 250)",
                                borderRadius: "8px",
                              }}
                            >
                              <div
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgb(110, 66, 229)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: "bold",
                                    color: "white",
                                    fontFamily: "system-ui, sans-serif",
                                  }}
                                >
                                  {item.name.charAt(0)}
                                </span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4
                                  style={{
                                    fontFamily: "system-ui, sans-serif",
                                    fontSize: "14px",
                                    lineHeight: "20px",
                                    color: "rgb(15, 15, 15)",
                                    fontWeight: 600,
                                    margin: "0 0 4px 0",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.name}
                                </h4>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      fontSize: "10px",
                                      padding: "2px 6px",
                                      backgroundColor: "rgb(245, 245, 245)",
                                      color: "rgb(84, 84, 84)",
                                    }}
                                  >
                                    {item.tier}
                                  </Badge>
                                  <span
                                    style={{
                                      fontFamily: "system-ui, sans-serif",
                                      fontSize: "12px",
                                      lineHeight: "16px",
                                      color: "rgb(84, 84, 84)",
                                    }}
                                  >
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "system-ui, sans-serif",
                                    fontSize: "16px",
                                    lineHeight: "24px",
                                    color: "rgb(15, 15, 15)",
                                    fontWeight: 600,
                                  }}
                                >
                                  ₹{formatCurrency(itemTotal)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Summary */}
                <Card
                  style={{
                    border: "1px solid rgb(227, 227, 227)",
                    borderRadius: "8px",
                  }}
                >
                  <CardHeader
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid rgb(227, 227, 227)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <CreditCard size={20} color="rgb(84, 84, 84)" />
                      <CardTitle
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "18px",
                          lineHeight: "26px",
                          color: "rgb(15, 15, 15)",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        Payment Method
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        fontSize: "14px",
                        color: "rgb(110, 66, 229)",
                        padding: "4px 12px",
                      }}
                    >
                      <Edit size={14} style={{ marginRight: "4px" }} />
                      Change
                    </Button>
                  </CardHeader>
                  <CardContent style={{ padding: "24px" }}>
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "rgb(245, 245, 245)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <CreditCard size={20} color="rgb(84, 84, 84)" />
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontFamily: "system-ui, sans-serif",
                            fontSize: "16px",
                            lineHeight: "24px",
                            color: "rgb(15, 15, 15)",
                            fontWeight: 500,
                          }}
                        >
                          {paymentMethod === "cash"
                            ? "Pay by Cash"
                            : "Pay Online"}
                        </span>
                        <p
                          style={{
                            fontFamily: "system-ui, sans-serif",
                            fontSize: "12px",
                            lineHeight: "16px",
                            color: "rgb(84, 84, 84)",
                            margin: "4px 0 0 0",
                          }}
                        >
                          {paymentMethod === "cash"
                            ? "Pay when service provider arrives"
                            : "Pay securely online via UPI or Card"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      padding: "12px 24px",
                      fontSize: "14px",
                      border: "1px solid rgb(227, 227, 227)",
                      color: "rgb(84, 84, 84)",
                    }}
                  >
                    <ArrowLeft size={16} style={{ marginRight: "8px" }} />
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentStep(3);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      backgroundColor: "rgb(110, 66, 229)",
                      color: "white",
                      padding: "12px 24px",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Continue to Payment
                    <ChevronRight size={18} style={{ marginLeft: "8px" }} />
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Place Order */}
            {currentStep === 3 && (
              <>
                <Card
                  style={{
                    border: "1px solid rgb(227, 227, 227)",
                    borderRadius: "8px",
                  }}
                >
                  <CardHeader
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid rgb(227, 227, 227)",
                    }}
                  >
                    <CardTitle
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "18px",
                        lineHeight: "26px",
                        color: "rgb(15, 15, 15)",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      Final Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: "24px" }}>
                      <div
                        style={{
                          padding: "20px",
                          backgroundColor: "rgb(240, 253, 244)",
                          border: "1px solid rgb(187, 247, 208)",
                          borderRadius: "8px",
                          marginBottom: "24px",
                        }}
                      >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <CheckCircle2 size={20} color="rgb(34, 197, 94)" />
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "14px",
                              lineHeight: "20px",
                              color: "rgb(22, 101, 52)",
                              fontWeight: 600,
                              margin: "0 0 4px 0",
                            }}
                          >
                            Ready to place your order
                          </p>
                          <p
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "13px",
                              lineHeight: "18px",
                              color: "rgb(22, 101, 52)",
                              margin: 0,
                            }}
                          >
                            Please review all details above. Click "Place Order"
                            to confirm your booking.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        style={{
                          padding: "12px 24px",
                          fontSize: "14px",
                          border: "1px solid rgb(227, 227, 227)",
                          color: "rgb(84, 84, 84)",
                        }}
                      >
                        <ArrowLeft size={16} style={{ marginRight: "8px" }} />
                        Back
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column - Sticky Order Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start w-full max-w-full lg:max-w-[380px]">
            <Card className="border border-gray-200 rounded-lg shadow-sm w-full">
              <CardHeader className="p-5 md:p-6 border-b border-gray-200">
                <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 m-0 break-words">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6">
                {/* Services Count */}
                <div className="mb-5 pb-4 border-b border-gray-200 w-full">
                  <p className="text-sm text-gray-600 m-0 mb-2 break-words">
                    {cart.length} {cart.length === 1 ? "service" : "services"}{" "}
                    selected
                  </p>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto w-full">
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start gap-2 text-xs w-full min-w-0"
                      >
                        <span className="text-gray-600 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap break-words">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-gray-900 font-medium flex-shrink-0 whitespace-nowrap">
                          ₹
                          {formatCurrency(
                            ((item.productCost ??
                              item.price ??
                              item.servicePrice ??
                              item.marketPrice ??
                              0) *
                              (item.quantity ?? 1)) ||
                              0
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="mb-5">
                  {appliedPromo ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-800 break-words">
                          {appliedPromo} Applied
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="border-none bg-transparent cursor-pointer p-0.5 text-gray-600 hover:text-gray-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Input
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError("");
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !isApplyingPromo) {
                            handleApplyPromo();
                          }
                        }}
                        className={`text-sm py-2.5 px-3 rounded-md mb-2 min-h-[44px] ${
                          promoError
                            ? "border-red-600"
                            : "border-gray-200"
                        }`}
                      />
                      {promoError && (
                        <p className="text-xs text-red-600 m-1 mt-0">
                          {promoError}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="w-full text-sm py-2 px-4 border-gray-200 min-h-[44px] disabled:opacity-70"
                      >
                        {isApplyingPromo ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-5" />

                {/* Price Breakdown */}
                <div className="flex flex-col gap-3 mb-5 w-full">
                  <div className="flex justify-between items-start gap-2 text-sm text-gray-600 w-full min-w-0">
                    <span className="flex-1 min-w-0 break-words overflow-hidden">
                      Subtotal (
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      items)
                    </span>
                    <span className="flex-shrink-0 whitespace-nowrap ml-2">
                      ₹{formatCurrency(totalPrice)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between items-start gap-2 text-sm text-green-600 w-full min-w-0">
                      <span className="flex-1 min-w-0 break-words">
                        Savings
                      </span>
                      <span className="flex-shrink-0 whitespace-nowrap ml-2">
                        -₹{formatCurrency(savings)}
                      </span>
                    </div>
                  )}

                  {appliedPromo && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "rgb(34, 197, 94)",
                        gap: "8px",
                        width: "100%",
                        boxSizing: "border-box",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          flex: "1 1 auto",
                          minWidth: 0,
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        Discount ({appliedPromo})
                      </span>
                        <span
                          style={{
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            marginLeft: "8px",
                          }}
                        >
                          -₹{formatCurrency(discount)}
                        </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "rgb(84, 84, 84)",
                      gap: "8px",
                      width: "100%",
                      boxSizing: "border-box",
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        flex: "1 1 auto",
                        minWidth: 0,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      Tax & service fee
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        marginLeft: "8px",
                      }}
                    >
                      ₹{formatCurrency(tax)}
                    </span>
                  </div>

                  <Separator />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "20px",
                      lineHeight: "28px",
                      color: "rgb(15, 15, 15)",
                      fontWeight: 600,
                      gap: "8px",
                      width: "100%",
                      boxSizing: "border-box",
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        flex: "1 1 auto",
                        minWidth: 0,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        marginLeft: "8px",
                      }}
                    >
                      ₹{formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginBottom: "20px",
                    padding: "16px",
                    backgroundColor: "rgb(245, 245, 245)",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Shield size={16} color="rgb(84, 84, 84)" />
                    <span
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "12px",
                        lineHeight: "16px",
                        color: "rgb(84, 84, 84)",
                      }}
                    >
                      Secure Payment
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Truck size={16} color="rgb(84, 84, 84)" />
                    <span
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "12px",
                        lineHeight: "16px",
                        color: "rgb(84, 84, 84)",
                      }}
                    >
                      Home Service Available
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Lock size={16} color="rgb(84, 84, 84)" />
                    <span
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "12px",
                        lineHeight: "16px",
                        color: "rgb(84, 84, 84)",
                      }}
                    >
                      Your data is secure
                    </span>
                  </div>
                </div>

                {/* Place Order Button - Only show on Step 3 */}
                {currentStep === 3 && (
                  <Button
                    onClick={handleBooking}
                    disabled={
                      isSubmitting ||
                      isProcessingPayment ||
                      !selectedDate ||
                      !selectedTime ||
                      !customerName ||
                      !customerPhone ||
                      paymentInitiated
                    }
                    style={{
                      width: "100%",
                      backgroundColor:
                        isSubmitting ||
                        isProcessingPayment ||
                        !selectedDate ||
                        !selectedTime ||
                        !customerName ||
                        !customerPhone ||
                        paymentInitiated
                          ? "rgb(200, 200, 200)"
                          : "rgb(110, 66, 229)",
                      color: "white",
                      padding: "14px 24px",
                      fontSize: "16px",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: "8px",
                      cursor:
                        isSubmitting ||
                        isProcessingPayment ||
                        !selectedDate ||
                        !selectedTime ||
                        !customerName ||
                        !customerPhone ||
                        paymentInitiated
                          ? "not-allowed"
                          : "pointer",
                      marginBottom: "12px",
                      position: "relative",
                    }}
                  >
                    {paymentInitiated ? (
                      <>
                        <span style={{ marginRight: "8px" }}>⏳</span>
                        Processing Payment...
                      </>
                    ) : isProcessingPayment ? (
                      <>
                        <span style={{ marginRight: "8px" }}>⏳</span>
                        Verifying Payment...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <span style={{ marginRight: "8px" }}>⏳</span>
                        Placing Order...
                      </>
                    ) : paymentMethod === "card" ? (
                      "Pay Online"
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                )}

                {/* Continue Buttons for Steps 1 & 2 */}
                {currentStep === 1 && (
                  <Button
                    onClick={handleContinueToReview}
                    disabled={
                      !selectedDate ||
                      !selectedTime ||
                      !customerName ||
                      !customerPhone
                    }
                    style={{
                      width: "100%",
                      backgroundColor:
                        !selectedDate ||
                        !selectedTime ||
                        !customerName ||
                        !customerPhone
                          ? "rgb(200, 200, 200)"
                          : "rgb(110, 66, 229)",
                      color: "white",
                      padding: "14px 24px",
                      fontSize: "16px",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: "8px",
                      cursor:
                        !selectedDate ||
                        !selectedTime ||
                        !customerName ||
                        !customerPhone
                          ? "not-allowed"
                          : "pointer",
                      marginBottom: "12px",
                    }}
                  >
                    Continue to Review
                  </Button>
                )}

                {currentStep === 2 && (
                  <Button
                    onClick={() => {
                      setCurrentStep(3);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      width: "100%",
                      backgroundColor: "rgb(110, 66, 229)",
                      color: "white",
                      padding: "14px 24px",
                      fontSize: "16px",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginBottom: "12px",
                    }}
                  >
                    Continue to Payment
                  </Button>
                )}

                {/* Terms */}
                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "rgb(84, 84, 84)",
                    textAlign: "center",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  By placing your order, you agree to our{" "}
                  <Link
                    to="/terms"
                    style={{
                      color: "rgb(110, 66, 229)",
                      textDecoration: "none",
                    }}
                  >
                    Terms & Conditions
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="md:hidden">
          {MobileCheckoutContent()}
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-12px_32px_rgba(15,15,15,0.12)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Total payable</p>
            <p className="text-lg font-semibold text-gray-900">
              ₹{formatCurrency(grandTotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileSummary(true)}
            className="text-xs font-semibold text-primary hover:text-primary/80"
          >
            View details
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={mobileSecondaryAction.onClick}
            className="flex-1 h-12 text-sm font-semibold"
          >
            {mobileSecondaryAction.label}
          </Button>
          <Button
            onClick={mobilePrimaryAction.onClick}
            disabled={mobilePrimaryAction.disabled}
            className="flex-1 h-12 text-sm font-semibold"
          >
            {mobilePrimaryAction.label}
          </Button>
        </div>
      </div>

      <Dialog open={showMobileSummary} onOpenChange={setShowMobileSummary}>
        <DialogContent className="md:hidden max-w-[420px] w-[92vw] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b border-gray-200">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Order Summary
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Track services, discounts, and taxes before you confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Services ({cart.length})
              </p>
              <div className="space-y-3 divide-y divide-gray-100">
                {cart.map((item, idx) => {
                  const price =
                    item.productCost ??
                    item.price ??
                    item.servicePrice ??
                    item.marketPrice ??
                    0;
                  return (
                    <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} • {item.tier}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        ₹{formatCurrency(
                          (price ?? 0) * (item.quantity ?? 1)
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Promo code</p>
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <CheckCircle2 size={16} />
                    {appliedPromo}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError("");
                    }}
                    placeholder="Enter code"
                    className={`h-11 text-sm ${
                      promoError ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCode.trim()}
                    className="h-11 px-4 text-sm font-semibold disabled:opacity-70"
                  >
                    {isApplyingPromo ? "Applying..." : "Apply"}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-xs text-red-600">{promoError}</p>
                )}
                </>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{formatCurrency(totalPrice)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Savings</span>
                  <span>-₹{formatCurrency(savings)}</span>
                </div>
              )}
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Promo ({appliedPromo})</span>
                  <span>-₹{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax & service fee</span>
                <span>₹{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total payable</span>
                <span>₹{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="px-4 py-3 border-t border-gray-200">
            <Button className="w-full" onClick={() => setShowMobileSummary(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date/Time Error Modal */}
      <Dialog open={showDateErrorModal} onOpenChange={setShowDateErrorModal}>
        <DialogContent
          style={{
            maxWidth: "420px",
            borderRadius: "8px",
          }}
        >
          <DialogHeader style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <AlertCircle
                size={48}
                color="rgb(220, 38, 38)"
                style={{ fill: "rgb(220, 38, 38)", opacity: 0.2 }}
              />
            </div>
            <DialogTitle
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "20px",
                lineHeight: "28px",
                color: "rgb(15, 15, 15)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Information Required
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: "20px",
                color: "rgb(84, 84, 84)",
              }}
                  >
                    {!customerName.trim()
                      ? "Please enter your full name to continue."
                      : !customerPhone.trim()
                      ? "Please enter your phone number to continue."
                      : !address.trim() ||
                        !addressLine1.trim() ||
                        !city.trim() ||
                        !state.trim() ||
                        !pincode.trim()
                      ? "Please enter a complete service address to continue."
                      : !selectedDate || !selectedTime
                      ? "Please select a date and time slot to proceed with your booking."
                      : "Please complete all required fields to continue."}
                  </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={() => setShowDateErrorModal(false)}
              style={{
                backgroundColor: "rgb(110, 66, 229)",
                color: "white",
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Error Modal */}
      <Dialog
        open={showBookingErrorModal}
        onOpenChange={setShowBookingErrorModal}
      >
        <DialogContent
          style={{
            maxWidth: "420px",
            borderRadius: "8px",
          }}
        >
          <DialogHeader style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <AlertCircle
                size={48}
                color="rgb(220, 38, 38)"
                style={{ fill: "rgb(220, 38, 38)", opacity: 0.2 }}
              />
            </div>
            <DialogTitle
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "20px",
                lineHeight: "28px",
                color: "rgb(15, 15, 15)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Booking Failed
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: "20px",
                color: "rgb(84, 84, 84)",
              }}
            >
              We encountered an error while processing your booking. Please try
              again or contact us for assistance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setShowBookingErrorModal(false)}
              style={{
                border: "1px solid rgb(227, 227, 227)",
                color: "rgb(84, 84, 84)",
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowBookingErrorModal(false);
                handleBooking();
              }}
              style={{
                backgroundColor: "rgb(110, 66, 229)",
                color: "white",
              }}
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Success Modal */}
      <Dialog
        open={showPaymentSuccessModal}
        onOpenChange={setShowPaymentSuccessModal}
      >
        <DialogContent
          style={{
            maxWidth: "420px",
            borderRadius: "8px",
          }}
        >
          <DialogHeader style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <CheckCircle2
                size={48}
                color="rgb(34, 197, 94)"
                style={{ fill: "rgb(34, 197, 94)", opacity: 0.2 }}
              />
            </div>
            <DialogTitle
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "20px",
                lineHeight: "28px",
                color: "rgb(15, 15, 15)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Payment Successful!
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: "20px",
                color: "rgb(84, 84, 84)",
              }}
            >
              Your payment has been processed successfully. Your booking is
              confirmed and you will be redirected to your bookings page
              shortly.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={() => {
                setShowPaymentSuccessModal(false);
                navigate("/bookings", { state: { bookingSuccess: true } });
              }}
              style={{
                backgroundColor: "rgb(110, 66, 229)",
                color: "white",
              }}
            >
              View Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Error Modal */}
      <Dialog
        open={showPaymentErrorModal}
        onOpenChange={setShowPaymentErrorModal}
      >
        <DialogContent
          style={{
            maxWidth: "420px",
            borderRadius: "8px",
          }}
        >
          <DialogHeader style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <AlertCircle
                size={48}
                color="rgb(220, 38, 38)"
                style={{ fill: "rgb(220, 38, 38)", opacity: 0.2 }}
              />
            </div>
            <DialogTitle
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "20px",
                lineHeight: "28px",
                color: "rgb(15, 15, 15)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Payment Error
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: "20px",
                color: "rgb(84, 84, 84)",
                marginBottom: "16px",
              }}
            >
              {paymentError ||
                "Payment could not be processed. Please try again or use cash payment option."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentErrorModal(false);
                setPaymentMethod("cash");
              }}
              style={{
                border: "1px solid rgb(227, 227, 227)",
                color: "rgb(84, 84, 84)",
              }}
            >
              Use Cash Payment
            </Button>
            <Button
              onClick={() => {
                setShowPaymentErrorModal(false);
                if (paymentMethod === "card") {
                  handleRazorpayPayment();
                }
              }}
              style={{
                backgroundColor: "rgb(110, 66, 229)",
                color: "white",
              }}
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Policy Modal - Responsive Design */}
      <Dialog
        open={showCancellationPolicyModal}
        onOpenChange={setShowCancellationPolicyModal}
      >
        <DialogContent
          className="max-w-[520px] w-full rounded-2xl p-0 overflow-hidden sm:max-h-[90vh] max-h-[95vh] flex flex-col"
          hideClose={true}
        >
          {/* Close Button */}
          <div className="flex justify-end p-3 sm:p-4 flex-shrink-0">
            <button
              onClick={() => setShowCancellationPolicyModal(false)}
              className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center rounded-full w-8 h-8 hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-900" />
            </button>
          </div>

          <div className="max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6 flex-1">
            {/* Title */}
            <div className="pb-4">
              <h3 className="text-xl sm:text-2xl md:text-[28px] leading-tight sm:leading-[40px] text-gray-900 font-bold m-0">
                Cancellation policy
              </h3>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mb-4" />

            {/* Cancellation Fee Table */}
            <div className="mb-4">
              {/* Table Header */}
              <div className="flex mb-2">
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-5 text-gray-900 font-semibold m-0 text-left">
                    Time
                  </p>
                </div>
                <div className="flex-1 ml-3">
                  <p className="text-sm sm:text-base leading-5 text-gray-900 font-semibold m-0 text-right">
                    Fee
                  </p>
                </div>
              </div>

              {/* Row 1: Free */}
              <div className="flex py-3 border-b border-dotted border-gray-200">
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-6 text-gray-900 m-0 text-left">
                    Till 5 mins after the booking
                  </p>
                </div>
                <div className="flex-1 ml-3">
                  <p className="text-sm sm:text-base leading-6 text-green-600 m-0 text-right">
                    Free
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 my-2" />

              {/* Row 2: ₹50 */}
              <div className="flex py-3 border-b border-dotted border-gray-200">
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-6 text-gray-900 m-0 text-left">
                    Within 12 hrs of the service
                  </p>
                </div>
                <div className="flex-1 ml-3">
                  <p className="text-sm sm:text-base leading-6 text-gray-900 m-0 text-right">
                    Up to ₹50
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 my-2" />

              {/* Row 3: ₹100 */}
              <div className="flex py-3">
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-6 text-gray-900 m-0 text-left">
                    Within 3 hrs of the service
                  </p>
                </div>
                <div className="flex-1 ml-3">
                  <p className="text-sm sm:text-base leading-6 text-gray-900 m-0 text-right">
                    Up to ₹100
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-4" />

            {/* Important Note */}
            <div className="flex items-start gap-2.5 mb-6">
              <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 11v6h2v-6h-2zM12 6.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
                    fill="rgb(5, 148, 91)"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12zm10 8a8 8 0 110-16 8 8 0 010 16z"
                    fill="rgb(5, 148, 91)"
                  />
                </svg>
              </div>
              <p className="text-sm sm:text-base leading-5 text-green-600 m-0">
                No fee if a professional is not assigned
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-4 mb-6" />

            {/* Fee Explanation */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl leading-7 text-gray-900 font-semibold m-0 mb-2">
                    This fee goes to the professional
                  </h4>
                  <p className="text-sm sm:text-base leading-6 text-gray-600 m-0">
                    Their time is reserved for the service & they cannot get
                    another job for the reserved time
                  </p>
                </div>
                <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden">
                  <img
                    src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_48,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images-stage/growth/home-screen/1689577394216-390457.jpeg"
                    alt="Professional payment"
                    className="w-full h-full object-contain bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mb-4" />
          </div>

          {/* Footer Button */}
          <div className="bg-white p-4 border-t border-gray-200 flex-shrink-0">
            <Button
              onClick={() => setShowCancellationPolicyModal(false)}
              className="w-full bg-white text-primary py-3 px-6 text-sm sm:text-base font-semibold rounded-lg border-none hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Okay
            </Button>
          </div>
          </DialogContent>
        </Dialog>

        {/* Login Modal */}
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }
