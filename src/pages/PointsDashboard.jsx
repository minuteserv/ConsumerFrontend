import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TierBadge } from '@/components/loyalty/TierBadge';
import { TierProgress } from '@/components/loyalty/TierProgress';
import { PointsRedemption } from '@/components/loyalty/PointsRedemption';
import { getPointsBalance, getPointsHistory, getLoyaltyTiers } from '@/lib/api';
import {
  Coins,
  History,
  Gift,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
  Award,
  Info,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';

export function PointsDashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRedemption, setShowRedemption] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use Promise.allSettled to prevent one failure from aborting others
      const [balanceResult, historyResult, tiersResult] = await Promise.allSettled([
        getPointsBalance(),
        getPointsHistory({ limit: 5 }),
        getLoyaltyTiers(),
      ]);

      // Handle balance data
      if (balanceResult.status === 'fulfilled') {
        setBalance(balanceResult.value);
      } else {
        console.error('Failed to load balance:', balanceResult.reason);
        // Set default balance if failed
        setBalance({ points_balance: 0, can_redeem: false });
      }

      // Handle history data
      if (historyResult.status === 'fulfilled') {
        setRecentTransactions(historyResult.value.transactions || []);
      } else {
        console.error('Failed to load history:', historyResult.reason);
        setRecentTransactions([]);
      }

      // Handle tiers data
      if (tiersResult.status === 'fulfilled') {
        setTiers(tiersResult.value.tiers || []);
        setProgress(tiersResult.value.progress || null);
      } else {
        console.error('Failed to load tiers:', tiersResult.reason);
        setTiers([]);
        setProgress(null);
      }

      // Only show error if all requests failed
      if (balanceResult.status === 'rejected' && 
          historyResult.status === 'rejected' && 
          tiersResult.status === 'rejected') {
        const firstError = balanceResult.reason || historyResult.reason || tiersResult.reason;
        setError(firstError?.message || 'Failed to load loyalty data');
      }
    } catch (err) {
      console.error('Failed to load loyalty data:', err);
      setError(err.message || 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedemptionSuccess = () => {
    setShowRedemption(false);
    loadData(); // Reload balance
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center text-gray-900 bg-transparent border-none cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px]"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900 mb-0 leading-tight truncate">
                Loyalty Points
              </h1>
              <p className="text-xs text-gray-600 m-0 truncate">
                Your rewards & benefits
              </p>
            </div>
          </div>
        </div>
        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header title="Loyalty Points" showSearch={false} />
        </div>
        <div className="pt-[78px] md:pt-0 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center text-gray-900 bg-transparent border-none cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px]"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900 mb-0 leading-tight truncate">
                Loyalty Points
              </h1>
              <p className="text-xs text-gray-600 m-0 truncate">
                Your rewards & benefits
              </p>
            </div>
          </div>
        </div>
        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header title="Loyalty Points" showSearch={false} />
        </div>
        <div className="pt-[78px] md:pt-0 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Points</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <Button onClick={loadData}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Similar to Service Details */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center text-gray-900 bg-transparent border-none cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 mb-0 leading-tight truncate">
              Loyalty Points
            </h1>
            <p className="text-xs text-gray-600 m-0 truncate">
              Your rewards & benefits
            </p>
          </div>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header title="Loyalty Points" showSearch={false} />
      </div>
      
      <div className="w-full max-w-[1232px] mx-auto px-4 md:px-6 pt-[78px] md:pt-6 pb-24 md:pb-6 space-y-6">
        {/* Priority 1: Balance Card - Most Important */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-purple-50 border-primary/20 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-gray-700">Your Points Balance</p>
                </div>
                <h2 className="text-5xl md:text-4xl font-bold text-gray-900 mb-1">
                  {balance?.points_balance?.toLocaleString() || 0}
                </h2>
                <p className="text-xs text-gray-500">Available to redeem</p>
              </div>
              <div className="text-right">
                {balance?.current_tier && (
                  <TierBadge tier={balance.current_tier} size="lg" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-primary/10">
              <div>
                <p className="text-xs text-gray-600 mb-1">Lifetime Earned</p>
                <p className="text-xl font-bold text-gray-900">
                  {balance?.lifetime_points_earned?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Lifetime Redeemed</p>
                <p className="text-xl font-bold text-gray-900">
                  {balance?.lifetime_points_redeemed?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <Button
              className="w-full mt-6 h-12 text-base font-semibold"
              onClick={() => setShowRedemption(true)}
              disabled={!balance?.can_redeem || (balance?.points_balance || 0) < 100}
            >
              <Gift className="h-5 w-5 mr-2" />
              Redeem Points
              {(!balance?.can_redeem || (balance?.points_balance || 0) < 100) && (
                <span className="ml-2 text-xs opacity-80">(Min. 100 points)</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Priority 2: Quick Redeem Options - Actionable */}
        {balance?.can_redeem && balance.points_balance >= 100 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Quick Redeem
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">Tap to instantly redeem these amounts</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { points: 100, discount: 10 },
                  { points: 500, discount: 50 },
                  { points: 1000, discount: 100 },
                ].map((option) => {
                  const canRedeem = balance.points_balance >= option.points;
                  return (
                    <Button
                      key={option.points}
                      variant={canRedeem ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-4 hover:scale-105 transition-transform"
                      disabled={!canRedeem}
                      onClick={() => {
                        setShowRedemption(true);
                      }}
                    >
                      <span className="text-xl font-bold">₹{option.discount}</span>
                      <span className="text-xs opacity-90 mt-1">{option.points} pts</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority 3: Tier Progress - Shows Progress */}
        {progress && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Tier Progress
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">Level up to unlock better rewards and cashback</p>
            </CardHeader>
            <CardContent>
              <TierProgress progress={progress} />
            </CardContent>
          </Card>
        )}

        {/* Priority 4: Recent Transactions - Shows Activity */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
            {recentTransactions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/loyalty/history')}
                className="text-primary"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium mb-1">No transactions yet</p>
                <p className="text-xs">Start booking services to earn points!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description || 'Transaction'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-bold ${
                          transaction.transaction_type === 'earned'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.transaction_type === 'earned' ? '+' : '-'}
                        {Math.abs(transaction.points).toLocaleString()} pts
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Balance: {transaction.balance_after?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority 5: Tier Benefits - Current Tier Info */}
        {balance?.tier_info && (
          <Card className="shadow-sm border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {balance.tier_info.tier_name.charAt(0).toUpperCase() + balance.tier_info.tier_name.slice(1)} Tier Benefits
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">Your current tier unlocks these exclusive benefits</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-700">Cashback Rate</span>
                  </div>
                  <Badge variant="default" className="text-base font-semibold px-3 py-1 bg-primary text-white">
                    {balance.tier_info.cashback_percentage}%
                  </Badge>
                </div>
                {balance.tier_info.benefits && balance.tier_info.benefits.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Your Benefits:</p>
                    <ul className="space-y-2">
                      {balance.tier_info.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2 p-2 bg-gray-50 rounded">
                          <span className="text-primary font-bold mt-0.5">✓</span>
                          <span>{benefit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority 6: Educational Section - Accordion (Bottom, Collapsed by Default) */}
        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-full bg-gradient-to-r from-primary/5 via-purple-50/50 to-primary/5 px-6 py-5 border-b border-gray-100 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900 mb-0.5">
                    How Loyalty Points Work
                  </h2>
                  <p className="text-xs text-gray-600">
                    Simple, transparent, and rewarding
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                  isAccordionOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>
          
          {isAccordionOpen && (
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earn Points */}
                <div className="group p-4 rounded-lg bg-green-50/50 border border-green-100 hover:border-green-200 hover:bg-green-50 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Earn Points</h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">
                        Get <span className="font-semibold text-primary">1 point</span> for every <span className="font-semibold text-gray-900">₹1</span> spent
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>Added automatically after booking</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redeem Points */}
                <div className="group p-4 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/30 hover:bg-primary/10 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Redeem Points</h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">
                        <span className="font-semibold text-primary">100 points</span> = <span className="font-semibold text-gray-900">₹10</span> discount
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>Minimum 100 points to redeem</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tier Benefits */}
                <div className="group p-4 rounded-lg bg-purple-50/50 border border-purple-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Tier Benefits</h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">
                        Higher tiers unlock better <span className="font-semibold text-purple-600">cashback rates</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        <span>Level up for exclusive perks</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Never Expire */}
                <div className="group p-4 rounded-lg bg-blue-50/50 border border-blue-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Coins className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Points Never Expire</h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">
                        Use your points <span className="font-semibold text-blue-600">anytime</span>—no expiry date
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>Save up and redeem when ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Redemption Modal */}
      {showRedemption && (
        <PointsRedemption
          balance={balance}
          onClose={() => setShowRedemption(false)}
          onSuccess={handleRedemptionSuccess}
        />
      )}
    </div>
  );
}

