import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getPointsHistory } from '@/lib/api';
import {
  ArrowLeft,
  History,
  TrendingUp,
  TrendingDown,
  Loader2,
  Filter,
  Calendar,
} from 'lucide-react';

export function PointsHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [filters.type, filters.page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: filters.page,
        limit: filters.limit,
        type: filters.type === 'all' ? null : filters.type,
      };

      const data = await getPointsHistory(options);
      setTransactions(data.transactions || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'redeemed':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <History className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'earned':
        return <Badge className="bg-green-100 text-green-800">Earned</Badge>;
      case 'redeemed':
        return <Badge className="bg-red-100 text-red-800">Redeemed</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Points History" />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/loyalty')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filters.type === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, type: 'all', page: 1 })}
              >
                All
              </Button>
              <Button
                variant={filters.type === 'earned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, type: 'earned', page: 1 })}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Earned
              </Button>
              <Button
                variant={filters.type === 'redeemed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, type: 'redeemed', page: 1 })}
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Redeemed
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadHistory}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No transactions found</p>
                <p className="text-sm text-gray-500">
                  {filters.type !== 'all'
                    ? `No ${filters.type} transactions yet`
                    : 'Start booking services to earn points!'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description || 'Transaction'}
                            </p>
                            {getTransactionBadge(transaction.transaction_type)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                          {transaction.source_type && (
                            <p className="text-xs text-gray-400 mt-1">
                              Source: {transaction.source_type.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            transaction.transaction_type === 'earned'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.transaction_type === 'earned' ? '+' : '-'}
                          {Math.abs(transaction.points).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Balance: {transaction.balance_after?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.total_pages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() =>
                          setFilters({ ...filters, page: filters.page - 1 })
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.total_pages}
                        onClick={() =>
                          setFilters({ ...filters, page: filters.page + 1 })
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

