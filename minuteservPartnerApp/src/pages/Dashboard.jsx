import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPartnerDashboard, getPartnerEarningsToday, getPartnerBookings } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';
import { Calendar, DollarSign, TrendingUp, Clock, Loader2, Power } from 'lucide-react';
import { updateAvailability } from '@/lib/api';

export function Dashboard() {
  const navigate = useNavigate();
  const { partner } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard data
      const dashboard = await getPartnerDashboard();
      setDashboardData(dashboard);

      // Fetch today's earnings
      const earnings = await getPartnerEarningsToday();
      setTodayEarnings(earnings.today_earnings || earnings.amount || 0);

      // Fetch upcoming bookings
      const bookings = await getPartnerBookings({ status: 'accepted', limit: 5 });
      setUpcomingBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const newStatus = !partner?.is_available;
      await updateAvailability(newStatus);
      // Update partner in context (would need to refresh or update context)
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setIsToggling(false);
    }
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {partner?.name || 'Partner'}!</p>
        </div>
        <Button
          onClick={handleToggleAvailability}
          disabled={isToggling}
          variant={partner?.is_available ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          <Power className="h-4 w-4" />
          {isToggling ? 'Updating...' : partner?.is_available ? 'Go Offline' : 'Go Online'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayEarnings)}</div>
            <p className="text-xs text-muted-foreground">Total earnings today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(partner?.total_earnings || dashboardData?.total_earnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partner?.total_bookings || dashboardData?.total_bookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partner?.rating ? partner.rating.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Bookings</CardTitle>
            <Button variant="ghost" onClick={() => navigate('/bookings')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{booking.booking_number}</span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.customer_name || 'Customer'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.booking_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(booking.booking_time)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(booking.partner_payout || booking.grand_total)}</div>
                    <div className="text-xs text-muted-foreground">Earnings</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Info */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Partner Code</p>
              <p className="font-semibold">{partner?.partner_code || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-semibold">{partner?.phone_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{partner?.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={partner?.is_available ? 'success' : 'secondary'}>
                {partner?.is_available ? 'Available' : 'Offline'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

