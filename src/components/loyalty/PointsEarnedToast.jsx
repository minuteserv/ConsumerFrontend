import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Coins } from 'lucide-react';

export function PointsEarnedToast({ points, onViewBalance }) {
  const { toast } = useToast();

  useEffect(() => {
    if (points && points > 0) {
      toast({
        title: `🎉 You earned ${points.toLocaleString()} points!`,
        description: 'Points have been added to your account',
        duration: 5000,
        action: onViewBalance ? {
          altText: 'View Balance',
          onClick: onViewBalance,
          label: 'View',
        } : undefined,
      });
    }
  }, [points, onViewBalance, toast]);

  return null;
}

