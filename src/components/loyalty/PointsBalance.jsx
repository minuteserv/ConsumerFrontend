import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coins, Loader2 } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { getPointsBalance } from '@/lib/api';

export function PointsBalance({ className = '', showTier = true }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPointsBalance();
      setBalance(data);
    } catch (err) {
      console.error('Failed to load points balance:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Link to="/loyalty" className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </Link>
    );
  }

  // Always show points balance, even if there's an error or no balance
  // Default to 0 if balance is not available
  const displayBalance = balance?.points_balance || 0;
  const displayTier = balance?.current_tier || null;

  return (
    <Link
      to="/loyalty"
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      <Coins className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
        {displayBalance.toLocaleString()} Points
      </span>
      {showTier && displayTier && (
        <TierBadge tier={displayTier} size="sm" showLabel={false} />
      )}
    </Link>
  );
}

