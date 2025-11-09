import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, IndianRupee } from 'lucide-react';
import { useBookings } from '../hooks/useBookings';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from '../components/LoginModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Format booking date and time for display
 */
function formatBookingDateTime(bookingDate, bookingTime) {
  try {
    // Parse booking date (YYYY-MM-DD)
    const date = new Date(bookingDate);
    
    // Format date as "DD MMM YYYY"
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;
    
    // Format time (already in HH:MM format, convert to 12-hour)
    let time = bookingTime;
    if (time && time.includes(':')) {
      const [hours, minutes] = time.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      time = `${hour12}:${minutes} ${ampm}`;
    }
    
    return { formattedDate, time };
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return { formattedDate: bookingDate, time: bookingTime };
  }
}

/**
 * Format services list for display
 */
function formatServicesList(services) {
  if (!services || !Array.isArray(services)) {
    return 'No services';
  }
  
  // Group services by name and count quantity
  const serviceCounts = {};
  services.forEach(service => {
    const serviceName = service.name || 'Unknown Service';
    serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + (service.quantity || 1);
  });
  
  // Format as "Service Name x quantity + Service Name x quantity"
  return Object.entries(serviceCounts)
    .map(([name, quantity]) => `${name} x ${quantity}`)
    .join(' + ');
}

/**
 * Get location string from address
 */
function getLocationString(address) {
  if (!address) return 'Location not available';
  
  // Try to get city/locality first
  if (address.city || address.locality) {
    const parts = [address.locality, address.city].filter(Boolean);
    return parts.join(', ');
  }
  
  // Fallback to address line
  if (address.address_line_1) {
    return address.address_line_1;
  }
  
  return 'Location not available';
}

/**
 * Check if booking is upcoming (not completed or cancelled)
 */
function isUpcoming(status) {
  return !['completed', 'cancelled'].includes(status);
}

/**
 * Check if booking is past (completed or cancelled)
 */
function isPast(status) {
  return ['completed', 'cancelled'].includes(status);
}

export function Bookings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [notification, setNotification] = useState({ type: null, message: '' });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch all bookings (we'll filter by status on the frontend)
  const { bookings: allBookings, loading, error, refetch: refetchBookings } = useBookings();

  // Filter bookings based on active tab
  const bookings = useMemo(() => {
    if (!allBookings || !Array.isArray(allBookings)) return [];
    
    if (activeTab === 'Upcoming') {
      return allBookings.filter(booking => isUpcoming(booking.status));
    } else if (activeTab === 'Past') {
      return allBookings.filter(booking => isPast(booking.status));
    }
    return [];
  }, [allBookings, activeTab]);

  // Show login modal if not authenticated (like cart/checkout)
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [isAuthenticated]);

  // Handle login success
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    try {
      setIsCancelling(true);
      const response = await apiClient.post(API_ENDPOINTS.cancelBooking(bookingId), {
        reason: cancelReason || 'Cancelled by customer'
      });
      
      setNotification({ type: 'success', message: 'Booking cancelled successfully!' });
      setTimeout(() => setNotification({ type: null, message: '' }), 3000);
      
      setShowCancelDialog(false);
      setCancelReason('');
      setCancellingBookingId(null);
      setIsCancelling(false); // Reset cancelling state
      
      // Refresh bookings by refetching (don't reload entire page)
      // This avoids triggering auth checks that might cause logout
      setTimeout(() => {
        refetchBookings();
      }, 500); // Small delay to ensure backend has processed the cancellation
    } catch (error) {
      console.error('Error cancelling booking:', error);
      
      // Only show error if it's not an auth error (auth errors are handled by API client)
      if (!error.message?.includes('Session expired') && !error.message?.includes('login')) {
        setNotification({ type: 'error', message: error?.message || 'Failed to cancel booking. Please try again.' });
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
      }
      setIsCancelling(false);
    }
  };

  // Handle reschedule booking (placeholder)
  const handleRescheduleBooking = (bookingId) => {
    setNotification({ type: 'info', message: 'Reschedule functionality will be available soon.' });
    setTimeout(() => setNotification({ type: null, message: '' }), 3000);
  };

  // Handle reorder booking
  const handleReorderBooking = (booking) => {
    if (booking?.services && Array.isArray(booking.services) && booking.services.length > 0) {
      // Collect unique categories from the booking's services
      const categories = booking.services
        .map(service => service?.category || service?.service_category || null)
        .filter(Boolean);

      if (categories.length > 0) {
        const primaryCategory = categories[0];
        const params = new URLSearchParams({ category: primaryCategory });
        navigate(`/services?${params.toString()}`);
        return;
      }
    }

    // Fallback: go to services without filters
    navigate('/services');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header showSearch={false} />
      
      <div className="container-main py-6">
        {/* Success notification from booking */}
        {location.state?.bookingSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            Booking confirmed successfully!
          </div>
        )}

        {/* Notification messages */}
        {notification.type === 'success' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {notification.message}
          </div>
        )}
        {notification.type === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {notification.message}
          </div>
        )}
        {notification.type === 'info' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            {notification.message}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full md:w-auto md:max-w-[400px] grid-cols-2 mx-auto md:mx-0 bg-gray-100/50 p-1.5 rounded-xl shadow-sm border border-gray-200/50 gap-1.5 h-[50px]">
            <TabsTrigger 
              value="Past"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=active]:font-semibold text-gray-600 rounded-lg transition-all duration-200 ease-in-out hover:text-gray-900 flex items-center justify-center h-full px-4"
            >
              Past
            </TabsTrigger>
            <TabsTrigger 
              value="Upcoming"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=active]:font-semibold text-gray-600 rounded-lg transition-all duration-200 ease-in-out hover:text-gray-900 flex items-center justify-center h-full px-4"
            >
              Upcoming
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading bookings...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load bookings</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const { formattedDate, time } = formatBookingDateTime(
                booking.booking_date,
                booking.booking_time
              );
              const servicesText = formatServicesList(booking.services);
              const address = booking.user_addresses || (Array.isArray(booking.user_addresses) ? booking.user_addresses[0] : null);
              const locationString = getLocationString(address);
              const primaryService = Array.isArray(booking.services) ? booking.services[0] : null;
              const serviceInitial = primaryService?.name?.charAt(0)?.toUpperCase() || 'M';
              const statusKey = booking.status?.toLowerCase();
              const statusLabel = booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending';
              const statusStyles = {
                completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
                pending: 'bg-amber-50 text-amber-700 border border-amber-200',
                confirmed: 'bg-sky-50 text-sky-700 border border-sky-200',
              };
              const statusClass = statusStyles[statusKey] || 'bg-slate-100 text-slate-700 border border-slate-200';
              const totalAmount = booking.grand_total ?? booking.total_price ?? 0;
              const formattedTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(totalAmount);
              const bookingCode =
                (typeof booking.booking_number === 'string' && booking.booking_number.trim()) ||
                (typeof booking.id === 'string' && booking.id.trim()) ||
                'N/A';
              const primaryServicePrice = primaryService?.price ?? primaryService?.productCost ?? primaryService?.marketPrice ?? null;
              const formattedPrimaryServicePrice = primaryServicePrice !== null
                ? new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(primaryServicePrice)
                : null;
 
              return (
                <Card
                  key={booking.id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-5 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
                          {serviceInitial}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Booking #{bookingCode}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[200px] sm:max-w-[260px]">{locationString}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>
 
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-gray-900 leading-6">
                          {servicesText}
                        </p>
                        <p className="text-base font-semibold text-gray-900 whitespace-nowrap">
                          {formattedTotal}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formattedDate}
                        </span>
                        {time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {formattedPrimaryServicePrice || formattedTotal}
                        </span>
                      </div>
                    </div>
 
                    <div className="flex items-center justify-end flex-wrap gap-3">
                      <div className="flex flex-wrap gap-2">
                        {activeTab === 'Past' && (
                          <Button
                            onClick={() => handleReorderBooking(booking)}
                            className="bg-primary text-white hover:bg-primary/90 shadow-sm px-4"
                          >
                            Reorder Booking
                          </Button>
                        )}
                        {activeTab === 'Upcoming' && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <Button
                            variant="outline"
                            className="px-4 py-2 text-sm font-semibold border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setCancellingBookingId(booking.id);
                              setShowCancelDialog(true);
                            }}
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {bookings.length === 0 && !loading && (
              <div className="text-center py-12 text-secondary">
                <p>No {activeTab.toLowerCase()} bookings yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Booking Dialog */}
      <Dialog 
        open={showCancelDialog} 
        onOpenChange={(open) => {
          setShowCancelDialog(open);
          if (!open) {
            // Reset all states when dialog closes
            setCancelReason('');
            setCancellingBookingId(null);
            setIsCancelling(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? You may be charged a cancellation fee.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Reason for cancellation (optional)
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Let us know why you're cancelling..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancelReason('');
                setCancellingBookingId(null);
                setIsCancelling(false); // Reset cancelling state when closing dialog
              }}
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCancelBooking(cancellingBookingId)}
              disabled={!cancellingBookingId || isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
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
