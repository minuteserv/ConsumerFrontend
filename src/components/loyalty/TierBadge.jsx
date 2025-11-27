import { Badge } from '@/components/ui/badge';
import { Medal } from 'lucide-react';

const TIER_CONFIG = {
  bronze: {
    color: '#CD7F32',
    label: 'Bronze',
    icon: '🥉',
  },
  silver: {
    color: '#C0C0C0',
    label: 'Silver',
    icon: '🥈',
  },
  gold: {
    color: '#FFD700',
    label: 'Gold',
    icon: '🥇',
  },
  platinum: {
    color: '#E5E4E2',
    label: 'Platinum',
    icon: '💎',
  },
};

export function TierBadge({ tier, size = 'md', showLabel = true, className = '' }) {
  const config = TIER_CONFIG[tier?.toLowerCase()] || TIER_CONFIG.bronze;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      className={`${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        borderColor: config.color,
        borderWidth: '1px',
      }}
    >
      <span className="mr-1">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}

