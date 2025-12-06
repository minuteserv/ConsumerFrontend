import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getPartnerBookingById, acceptBooking, rejectBooking, startBooking, completeBooking, verifyStartOTP } from '@/lib/api';
import { formatCurrency, formatDate, formatTime, formatDuration, getTimeRemaining } from '@/lib/formatters';
import { Calendar, Clock, MapPin, Phone, User, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { BOOKING_STATUS } from '@/lib/constants';

export function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(null); // Timer in seconds
  const [timerInterval, setTimerInterval] = useState(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const otpInputRefs = useRef([]);
  const swipeRef = useRef(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  useEffect(() => {
    // Start timer if booking is in progress
    if (booking?.status === BOOKING_STATUS.IN_PROGRESS && booking?.service_started_at) {
      startServiceTimer();
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [booking?.status, booking?.service_started_at]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await getPartnerBookingById(id);
      setBooking(data.booking || data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const startServiceTimer = () => {
    if (!booking?.service_started_at) return;
    
    // Calculate total duration from services
    const totalDuration = booking.services?.reduce((sum, service) => {
      return sum + (service.duration_minutes || 60);
    }, 0) || 60;
    
    const startTime = new Date(booking.service_started_at).getTime();
    const endTime = startTime + (totalDuration * 60 * 1000);
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimer(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    setTimerInterval(interval);
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await acceptBooking(id);
      await fetchBooking();
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejecting this booking:');
    if (!reason) return;
    
    try {
      setActionLoading(true);
      await rejectBooking(id, reason);
      navigate('/bookings');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = () => {
    setShowOTPDialog(true);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && value) {
      handleVerifyStartOTP(newOtp.join(''));
    }
  };

  const handleVerifyStartOTP = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      setOtpError('Please enter 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const result = await verifyStartOTP(id, otpValue);
      
      if (result.success && result.verified) {
        // Start the booking service
        await startBooking(id, otpValue);
        setShowOTPDialog(false);
        setOtp(['', '', '', '', '', '']);
        await fetchBooking();
        startServiceTimer();
      } else {
        setOtpError(result.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      setOtpError(error.message || 'Failed to verify OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSwipeStart = (e) => {
    setIsSwiping(true);
    setSwipeStartX(e.touches ? e.touches[0].clientX : e.clientX);
  };

  const handleSwipeMove = (e) => {
    if (!isSwiping) return;
    
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const swipeRefElement = swipeRef.current;
    if (!swipeRefElement) return;
    
    const width = swipeRefElement.offsetWidth;
    const deltaX = currentX - swipeStartX;
    const progress = Math.min(Math.max((deltaX / width) * 100, 0), 100);
    setSwipeProgress(progress);
  };

  const handleSwipeEnd = async () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    
    if (swipeProgress >= 80) {
      // Complete booking
      try {
        setActionLoading(true);
        await completeBooking(id);
        await fetchBooking();
        setSwipeProgress(0);
        alert('Booking completed successfully!');
      } catch (error) {
        console.error('Error completing booking:', error);
        alert('Failed to complete booking. Please try again.');
      } finally {
        setActionLoading(false);
      }
    } else {
      setSwipeProgress(0);
    }
  };

  const formatTimer = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      assigned: 'default',
      accepted: 'default',
      in_progress: 'default',
      completed: 'success',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Booking not found</p>
            <Button onClick={() => navigate('/bookings')} className="mt-4">
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDuration = booking.services?.reduce((sum, service) => {
    return sum + (service.duration_minutes || 60);
  }, 0) || 60;

  const canStart = booking.status === BOOKING_STATUS.ACCEPTED;
  const canComplete = booking.status === BOOKING_STATUS.IN_PROGRESS;
  const isCompleted = booking.status === BOOKING_STATUS.COMPLETED;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground">{booking.booking_number}</p>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      {/* Booking Info */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-semibold">{booking.customer_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-semibold">{booking.customer_phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{formatDate(booking.booking_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-semibold">{formatTime(booking.booking_time)}</p>
              </div>
            </div>
          </div>
          
          {booking.address && (
            <div className="flex items-start gap-3 pt-4 border-t">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-semibold">
                  {booking.address.address_line1 || booking.address}
                  {booking.address.city && `, ${booking.address.city}`}
                  {booking.address.pincode && ` - ${booking.address.pincode}`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {booking.services && Array.isArray(booking.services) ? (
              booking.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{service.name || service.service_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {formatDuration(service.duration_minutes || 60)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(service.price || service.unit_price || 0)}</p>
                    {service.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">Qty: {service.quantity}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No services listed</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="font-semibold">Total Duration</span>
            <span className="font-semibold">{formatDuration(totalDuration)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold">{formatCurrency(booking.grand_total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-semibold capitalize">{booking.payment_method || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-semibold">Your Earnings</span>
              <span className="font-semibold text-lg text-primary">
                {formatCurrency(booking.partner_payout || booking.grand_total * 0.7)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer (if service in progress) */}
      {booking.status === BOOKING_STATUS.IN_PROGRESS && timer !== null && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Service Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {formatTimer(timer)}
              </div>
              <p className="text-sm text-muted-foreground">
                Time remaining for {formatDuration(totalDuration)} service
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {booking.status === BOOKING_STATUS.ASSIGNED && (
        <div className="flex gap-4">
          <Button
            onClick={handleAccept}
            disabled={actionLoading}
            className="flex-1"
            size="lg"
          >
            {actionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept Booking
              </>
            )}
          </Button>
          <Button
            onClick={handleReject}
            disabled={actionLoading}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      )}

      {canStart && (
        <Button
          onClick={handleStartService}
          disabled={actionLoading}
          className="w-full"
          size="lg"
        >
          Start Service
        </Button>
      )}

      {/* Swipe to Complete */}
      {canComplete && (
        <Card>
          <CardHeader>
            <CardTitle>Swipe to Complete</CardTitle>
            <p className="text-sm text-muted-foreground">
              Swipe right to mark this booking as completed
            </p>
          </CardHeader>
          <CardContent>
            <div
              ref={swipeRef}
              className="relative h-16 bg-muted rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
              onTouchStart={handleSwipeStart}
              onTouchMove={handleSwipeMove}
              onTouchEnd={handleSwipeEnd}
              onMouseDown={handleSwipeStart}
              onMouseMove={handleSwipeMove}
              onMouseUp={handleSwipeEnd}
              onMouseLeave={handleSwipeEnd}
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-200 flex items-center justify-end pr-4"
                style={{ width: `${swipeProgress}%` }}
              >
                {swipeProgress > 20 && (
                  <ArrowRight className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-semibold">
                  {swipeProgress >= 80 ? 'Release to Complete' : 'Swipe Right →'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCompleted && (
        <Card className="border-success">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Booking Completed!</h3>
            <p className="text-muted-foreground">
              Earnings of {formatCurrency(booking.partner_payout || booking.grand_total * 0.7)} will be added to your account.
            </p>
          </CardContent>
        </Card>
      )}

      {/* OTP Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify OTP to Start Service</DialogTitle>
            <DialogDescription>
              Enter the OTP sent to your phone to start the service
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  disabled={otpLoading}
                  autoFocus={index === 0}
                  className="w-12 h-12 text-center text-lg font-semibold"
                />
              ))}
            </div>
            {otpError && (
              <p className="text-sm text-error text-center">{otpError}</p>
            )}
            <Button
              onClick={() => handleVerifyStartOTP()}
              disabled={otp.some((digit) => !digit) || otpLoading}
              className="w-full"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Start Service'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

