import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { calculateTaxFee } from '@/lib/utils';

export function CartSummary() {
  const { getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const totalItems = getTotalItems();
  const rawTotalPrice = getTotalPrice();
  const totalPrice = Math.floor(rawTotalPrice * 100) / 100;
  const tax = calculateTaxFee(totalPrice);
  const grandTotal = Math.floor((totalPrice + tax) * 100) / 100;

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0.00';
    return num.toFixed(2);
  };

  // Don't show cart summary on checkout, cart, or bookings pages
  if (totalItems === 0 || location.pathname === '/checkout' || location.pathname === '/cart' || location.pathname === '/bookings') {
    return null;
  }

  const handleClearCart = () => {
    clearCart();
    setShowClearDialog(false);
  };

  return (
    <>
      {/* Cart Summary Strip - Desktop Only (Hidden on Mobile) */}
      <div 
        className="hidden md:flex fixed bottom-0 left-0 right-0 z-40 shadow-lg bg-primary text-white p-4 rounded-none"
      >
        <div className="w-full max-w-[1232px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white font-normal m-0">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} • ₹{formatCurrency(grandTotal)} including tax & service fee
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearDialog(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-white cursor-pointer text-sm font-normal transition-opacity duration-200 hover:opacity-80"
              >
                <Trash2 size={16} className="text-white" />
                Clear
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="px-5 py-2.5 bg-white text-primary border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 whitespace-nowrap hover:bg-gray-100"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent style={{
          maxWidth: '420px',
          borderRadius: '8px'
        }}>
          <DialogHeader>
            <DialogTitle style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '20px',
              lineHeight: '28px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              Clear Cart?
            </DialogTitle>
            <DialogDescription style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'rgb(84, 84, 84)'
            }}>
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px'
          }}>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              style={{
                border: '1px solid rgb(227, 227, 227)',
                color: 'rgb(84, 84, 84)'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCart}
              style={{
                backgroundColor: 'rgb(220, 38, 38)',
                color: 'white'
              }}
            >
              Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
