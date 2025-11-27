import { TierBadge } from './TierBadge';

export function TierProgress({ progress }) {
  if (!progress || progress.is_max_tier) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Current Tier</span>
          <TierBadge tier={progress?.current_tier || 'bronze'} size="sm" />
        </div>
        <div className="text-xs text-gray-500">You've reached the highest tier! 🎉</div>
      </div>
    );
  }

  const progressPercentage = Math.min(100, progress.progress_percentage || 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Tier Progress</span>
        <TierBadge tier={progress.current_tier} size="sm" />
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            {progress.current_points?.toLocaleString() || 0} / {progress.next_tier_points?.toLocaleString() || 0} points
          </span>
          <span className="text-gray-500">{progressPercentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          {progress.points_to_next_tier?.toLocaleString() || 0} points to{' '}
          <span className="font-semibold capitalize">{progress.next_tier}</span> tier
        </div>
      </div>
    </div>
  );
}

