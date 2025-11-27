import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Info, Shield, Truck, Lock } from 'lucide-react';
import { calculateTaxFee } from '@/lib/utils';

export function CartOrderSummary() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, getTotalItems } = useCart();
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);

  const rawTotalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const totalPrice = Math.floor(rawTotalPrice * 100) / 100;
  const tax = calculateTaxFee(totalPrice);
  const grandTotal = Math.floor((totalPrice + tax) * 100) / 100;

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0.00';
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

  // Don't show if cart is empty
  if (cart.length === 0) {
    return null;
  }

  return (
    <>
      {/* Order Summary Bottom Tab - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] md:hidden shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        <div
          className="flex items-center justify-between w-full h-[64px] px-4"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
            minHeight: '64px',
            height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Left: Order Summary Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs text-gray-600 font-medium truncate">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
              <span className="text-lg font-bold text-gray-900">
                ₹{formatCurrency(grandTotal)}
              </span>
            </div>
            {/* Info Icon */}
            <button
              onClick={() => setShowOrderSummaryModal(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 min-w-[44px] min-h-[44px]"
              aria-label="View order summary details"
            >
              <Info size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Right: Proceed to Checkout Button */}
          <Button
            onClick={() => navigate('/checkout')}
            className="bg-primary text-white px-4 py-2.5 text-sm font-semibold border-none rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0 min-h-[44px] ml-2"
          >
            Checkout
          </Button>
        </div>
      </div>

      {/* Order Summary Modal - Bottom Sheet for Mobile */}
      <Dialog open={showOrderSummaryModal} onOpenChange={setShowOrderSummaryModal}>
        <DialogContent 
          className="md:max-w-md md:max-h-[90vh] overflow-y-auto
                     md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%]
                     fixed bottom-0 left-0 right-0 top-auto md:top-[50%]
                     translate-x-0 translate-y-0 md:translate-x-[-50%] md:translate-y-[-50%]
                     rounded-t-2xl rounded-b-none md:rounded-lg
                     max-h-[calc(100vh-80px)] md:max-h-[90vh]
                     mb-0 md:mb-auto
                     pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-6
                     w-full md:w-full
                     data-[state=open]:animate-in data-[state=closed]:animate-out
                     data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom
                     md:data-[state=closed]:slide-out-to-top md:data-[state=open]:slide-in-from-top
                     md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Order Summary
            </DialogTitle>
            <DialogDescription>
              Review your order details and pricing breakdown
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Price Breakdown */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center gap-2 text-sm text-gray-600">
                <span className="flex-1 min-w-0 break-words">
                  Subtotal ({totalItems}{' '}
                  {totalItems === 1 ? 'item' : 'items'})
                </span>
                <span className="flex-shrink-0 whitespace-nowrap">
                  ₹{formatCurrency(totalPrice)}
                </span>
              </div>

              {savings > 0 && (
                <div className="flex justify-between items-center gap-2 text-sm text-green-600">
                  <span className="flex-1 min-w-0">Savings</span>
                  <span className="flex-shrink-0 whitespace-nowrap">
                    -₹{formatCurrency(savings)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center gap-2 text-sm text-gray-600">
                <span className="flex-1 min-w-0 break-words">
                  Tax & service fee
                </span>
                <span className="flex-shrink-0 whitespace-nowrap">
                  ₹{formatCurrency(tax)}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-center gap-2 text-lg font-semibold text-gray-900">
                <span className="flex-1 min-w-0">Total</span>
                <span className="flex-shrink-0 whitespace-nowrap">
                  ₹{formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gray-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-gray-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">
                  Home Service Available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-gray-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">
                  Your data is secure
                </span>
              </div>
            </div>

            {/* Service List */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Services ({totalItems})
              </h4>
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                {cart.map((item, idx) => {
                  // Correct price logic: productCost is the selling price
                  const productCost = item.productCost ?? item.price ?? item.servicePrice ?? 0;
                  const itemTotal =
                    Math.floor(productCost * item.quantity * 100) / 100;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-start gap-2 text-xs"
                    >
                      <span className="text-gray-600 flex-1 min-w-0 overflow-hidden text-ellipsis">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium flex-shrink-0 whitespace-nowrap">
                        ₹{formatCurrency(itemTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowOrderSummaryModal(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowOrderSummaryModal(false);
                navigate('/checkout');
              }}
              className="flex-1 bg-primary text-white hover:bg-primary/90"
            >
              Proceed to Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

