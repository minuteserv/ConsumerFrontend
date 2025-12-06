import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getPartnerBookings } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';
import { Calendar, Clock, Search, Loader2 } from 'lucide-react';
import { BOOKING_STATUS } from '@/lib/constants';

export function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    fetchBookings();
  }, [view]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let filters = {};
      
      if (view === 'upcoming') {
        filters.status = 'accepted';
      } else if (view === 'past') {
        filters.status = 'completed';
      }
      
      const data = await getPartnerBookings(filters);
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.booking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const upcomingBookings = bookings.filter(
    (b) => b.status === BOOKING_STATUS.ACCEPTED || b.status === BOOKING_STATUS.ASSIGNED
  );
  const pastBookings = bookings.filter(
    (b) => b.status === BOOKING_STATUS.COMPLETED || b.status === BOOKING_STATUS.CANCELLED
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage your bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={view === 'all' ? 'default' : 'ghost'}
          onClick={() => setView('all')}
          className="rounded-b-none"
        >
          All ({bookings.length})
        </Button>
        <Button
          variant={view === 'upcoming' ? 'default' : 'ghost'}
          onClick={() => setView('upcoming')}
          className="rounded-b-none"
        >
          Upcoming ({upcomingBookings.length})
        </Button>
        <Button
          variant={view === 'past' ? 'default' : 'ghost'}
          onClick={() => setView('past')}
          className="rounded-b-none"
        >
          Past ({pastBookings.length})
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by booking number, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value={BOOKING_STATUS.PENDING}>Pending</option>
              <option value={BOOKING_STATUS.ASSIGNED}>Assigned</option>
              <option value={BOOKING_STATUS.ACCEPTED}>Accepted</option>
              <option value={BOOKING_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={BOOKING_STATUS.COMPLETED}>Completed</option>
              <option value={BOOKING_STATUS.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {view === 'all' && 'All Bookings'}
            {view === 'upcoming' && 'Upcoming Bookings'}
            {view === 'past' && 'Past Bookings'}
            {' '}({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{booking.booking_number}</span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {booking.customer_name || 'Customer'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {booking.customer_phone || '-'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.booking_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(booking.booking_time)}
                      </span>
                    </div>
                    {booking.services && Array.isArray(booking.services) && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Services: {booking.services.map(s => s.name || s.service_name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <div className="font-semibold text-lg">
                      {formatCurrency(booking.partner_payout || booking.grand_total)}
                    </div>
                    <div className="text-xs text-muted-foreground">Earnings</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

