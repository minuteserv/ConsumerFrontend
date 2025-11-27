import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../components/Header";
import { CartOrderSummary } from "../components/CartOrderSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { LoginModal } from "../components/LoginModal";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Shield,
  Truck,
  Lock,
  X,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { calculateTaxFee } from "@/lib/utils";
import { InlinePriceDisplay } from "@/components/ui/PriceDisplay";

export function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // CRITICAL SECURITY: Authentication guard - redirect if not authenticated
  // This prevents direct URL access to /cart without authentication
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.error('[Cart] ⚠️ CRITICAL SECURITY: Unauthenticated access attempt blocked');
        console.error('[Cart] Redirecting to home - authentication required for cart');
        // Redirect to home if not authenticated
        navigate('/', { replace: true });
        return;
      }
      console.log('[Cart] ✓ Security check passed - user authenticated');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const rawTotalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const totalPrice = Math.floor(rawTotalPrice * 100) / 100;
  const tax = calculateTaxFee(totalPrice);
  const grandTotal = Math.floor((totalPrice + tax) * 100) / 100;

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "0.00";
    return num.toFixed(2);
  };

  // Calculate savings if any item has marketPrice > productCost
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

  const handleDeleteItem = (item) => {
    setShowDeleteDialog(item);
  };

  const confirmDeleteItem = () => {
    if (showDeleteDialog) {
      removeFromCart(
        showDeleteDialog.name,
        showDeleteDialog.category,
        showDeleteDialog.tier
      );
      setShowDeleteDialog(null);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearDialog(false);
  };

  // CRITICAL SECURITY: Show login modal if not authenticated and cart has items
  // This ensures users cannot proceed without authentication
  useEffect(() => {
    if (!isLoading) {
      if (cart.length > 0 && !isAuthenticated) {
        console.warn('[Cart] ⚠️ Cart has items but user not authenticated - showing login modal');
        setShowLoginModal(true);
      } else if (isAuthenticated) {
        setShowLoginModal(false);
      }
    }
  }, [cart.length, isAuthenticated, isLoading]);

  // Handle login success
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header - Desktop Only */}
        <div className="hidden md:block">
          <Header showSearch={false} />
        </div>
        
        {/* Mobile Back Button */}
        <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="w-full px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-900 bg-transparent border-none cursor-pointer p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
        
        <div className="w-full max-w-[1232px] mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16">
          <div className="text-center p-8 md:p-16 bg-white rounded-lg border border-gray-200">
            <div className="w-24 h-24 md:w-30 md:h-30 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag size={48} className="text-gray-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 mt-0">
              Your cart is empty
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-8 mt-0">
              Looks like you haven't added any services to your cart yet.
            </p>
            <Button
              onClick={() => navigate("/services")}
              className="bg-primary text-white px-6 py-3 text-base font-semibold hover:bg-primary/90"
            >
              Browse Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header - Desktop Only */}
      <div className="hidden md:block">
        <Header showSearch={false} />
      </div>
      
      {/* Mobile Header with Title - Fixed */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="w-full px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center text-gray-900 bg-transparent border-none cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 mb-0.5 mt-0 leading-tight truncate">
              Shopping Cart
            </h1>
            <p className="text-xs text-gray-600 m-0 truncate">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1232px] mx-auto px-4 sm:px-6 md:px-8 pt-[80px] md:pt-6 pb-5 md:pb-10 mt-4 md:mt-0 space-y-5 md:space-y-0">
        {/* Page Header - Desktop Only */}
        <div className="mb-6 md:mb-8 hidden md:block">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-2 mt-0 leading-tight">
            Shopping Cart
          </h1>
          <p className="text-sm md:text-base text-gray-600 m-0">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {/* Price Alert */}
        {savings > 0 && (
          <div className="p-2.5 md:p-4 bg-green-50 border border-green-200 rounded-lg mb-5 md:mb-12 flex items-start gap-2 md:gap-3" style={{marginBottom:'15px'}}>
            <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
            <p className="text-[11px] md:text-base text-green-800 m-0 flex-1 leading-relaxed">
              You're saving ₹{formatCurrency(savings)} on this order!
            </p>
          </div>
        )}

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-16 items-start">

          {/* Left Column - Cart Items */}
          <div className="flex flex-col gap-4 md:gap-8">
            {/* Cart Header Actions - Desktop Only */}
            <div className="hidden md:flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg">
              <span className="text-sm md:text-base text-gray-600 font-medium">
                Price
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="text-sm text-red-600 px-3 py-1.5 h-auto hover:bg-red-50"
              >
                Delete all items
              </Button>
            </div>

            {/* Cart Items List */}
            {cart.map((item, idx) => {
              // Correct price logic: productCost is the selling price
              const productCost = item.productCost ? Number(item.productCost) : (item.price || item.servicePrice || 0);
              const marketPrice = item.marketPrice ? Number(item.marketPrice) : null;
              const showStrikethrough = marketPrice && productCost && marketPrice > productCost;
              
              // Use productCost for calculations
              const price = productCost;
              const itemTotal = Math.floor(price * item.quantity * 100) / 100;
              const itemSavings = showStrikethrough
                ? Math.floor((marketPrice - productCost) * item.quantity * 100) / 100
                : 0;
              const formattedOriginalTotal = showStrikethrough
                ? formatCurrency(marketPrice * item.quantity)
                : null;

              return (
                <Card
                  key={idx}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-8 p-4 md:p-6">
                      {/* Service Icon/Image */}
                      <div className="w-full sm:w-32 md:w-40 h-32 md:h-40 sm:flex-shrink-0 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden relative shadow-sm border border-gray-100">
                        {item.image ? (
                          <div className="w-full h-full p-2 flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                              style={{
                                objectFit: 'contain',
                                objectPosition: 'center',
                                width: 'auto',
                                height: 'auto'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const placeholder = e.target.parentElement.parentElement.querySelector('.image-placeholder');
                                if (placeholder) {
                                  placeholder.style.display = 'flex';
                                }
                              }}
                            />
                          </div>
                        ) : null}
                        <div className="image-placeholder w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80" style={{ display: item.image ? 'none' : 'flex' }}>
                          <span className="text-4xl md:text-5xl font-bold text-white">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        {/* Title and Tier Badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 mt-0 line-clamp-2 break-words">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 font-medium"
                              >
                                {item.tier}
                              </Badge>
                              <span className="text-xs md:text-sm text-gray-600">
                                {item.category}
                              </span>
                              {item.brand && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs md:text-sm text-gray-600">
                                    {item.brand}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 border-none bg-transparent cursor-pointer flex items-center text-gray-600 hover:text-red-600 transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] justify-center"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Price and Quantity Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8 md:h-auto">
                            <button
                              onClick={() => updateQuantity(item.name, item.category, item.tier, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border-none bg-transparent rounded cursor-pointer min-w-[44px] min-h-[44px] ${
                                item.quantity <= 1
                                  ? "cursor-not-allowed text-gray-300"
                                  : "text-gray-900 hover:bg-gray-100"
                              } transition-colors`}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-lg font-medium min-w-[32px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.name, item.category, item.tier, item.quantity + 1)}
                              className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border-none bg-transparent rounded cursor-pointer text-gray-900 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px]"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="flex flex-col items-end sm:items-end">
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {showStrikethrough && (
                                <span className="text-sm md:text-base text-gray-600 line-through">
                                  ₹{formattedOriginalTotal}
                                </span>
                              )}
                              <span className="text-lg md:text-xl font-semibold text-gray-900">
                                ₹{formatCurrency(itemTotal)}
                              </span>
                            </div>
                            {itemSavings > 0 && (
                              <span className="text-xs md:text-sm text-green-600 mt-1">
                                You save ₹{formatCurrency(itemSavings)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Continue Shopping Link */}
            <div className="p-4 text-center bg-white border border-gray-200 rounded-lg">
              <Link
                to="/services"
                className="text-sm md:text-base text-primary no-underline inline-flex items-center gap-1.5 font-medium hover:underline"
              >
                Continue shopping
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-5 md:mb-6 mt-0">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="flex flex-col gap-3 md:gap-4 mb-5 md:mb-6">
                  <div className="flex justify-between items-center gap-2 text-sm md:text-base text-gray-600">
                    <span className="flex-1 min-w-0 break-words">
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span className="flex-shrink-0 whitespace-nowrap">
                      ₹{formatCurrency(totalPrice)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between items-center gap-2 text-sm md:text-base text-green-600">
                      <span className="flex-1 min-w-0">Savings</span>
                      <span className="flex-shrink-0 whitespace-nowrap">
                        -₹{formatCurrency(savings)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2 text-sm md:text-base text-gray-600">
                    <span className="flex-1 min-w-0 break-words">
                      Tax & service fee
                    </span>
                    <span className="flex-shrink-0 whitespace-nowrap">
                      ₹{formatCurrency(tax)}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between items-center gap-2 text-lg md:text-xl font-semibold text-gray-900">
                    <span className="flex-1 min-w-0">Total</span>
                    <span className="flex-shrink-0 whitespace-nowrap">
                      ₹{formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-col gap-3 mb-5 md:mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-gray-600 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-gray-600">
                      Secure Payment
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-gray-600 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-gray-600">
                      Home Service Available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-gray-600 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-gray-600">
                      Your data is secure
                    </span>
                  </div>
                </div>

                {/* Proceed to Checkout Button */}
                <Button
                  onClick={() => {
                    // CRITICAL SECURITY: Verify authentication before allowing checkout
                    if (!isAuthenticated) {
                      console.warn('[Cart] ⚠️ Unauthenticated checkout attempt - showing login modal');
                      setShowLoginModal(true);
                      return;
                    }
                    // Only navigate if authenticated
                    navigate("/checkout");
                  }}
                  className="w-full bg-primary text-white py-3.5 px-6 text-base font-semibold border-none rounded-lg cursor-pointer mb-3 hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                </Button>

                {/* Terms */}
                <p className="text-xs md:text-sm text-gray-600 text-center m-0 break-words">
                  By proceeding, you agree to our{" "}
                  <Link
                    to="/terms"
                    className="text-primary no-underline hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
 
        </div>
      </div>

      {/* Delete Item Confirmation Modal */}
      <Dialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <DialogContent
          style={{
            maxWidth: "420px",
            borderRadius: "8px",
          }}
        >
          <DialogHeader>
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
              Remove Item?
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: "20px",
                color: "rgb(84, 84, 84)",
              }}
            >
              Are you sure you want to remove "{showDeleteDialog?.name}" from
              your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
              style={{
                border: "1px solid rgb(227, 227, 227)",
                color: "rgb(84, 84, 84)",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteItem}
              style={{
                backgroundColor: "rgb(220, 38, 38)",
                color: "white",
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Cart Confirmation Modal */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent
          style={{
            maxWidth: "420px",
            borderRadius: "8px",
          }}
        >
          <DialogHeader>
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
              Clear Cart?
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: "20px",
                color: "rgb(84, 84, 84)",
              }}
            >
              Are you sure you want to remove all items from your cart? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              style={{
                border: "1px solid rgb(227, 227, 227)",
                color: "rgb(84, 84, 84)",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCart}
              style={{
                backgroundColor: "rgb(220, 38, 38)",
                color: "white",
              }}
            >
              Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Summary Bottom Tab - Mobile Only */}
      <CartOrderSummary />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
