import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { redeemPoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Gift, Coins, Loader2, CheckCircle2, Copy } from 'lucide-react';

export function PointsRedemption({ balance, onClose, onSuccess }) {
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [redemptionType, setRedemptionType] = useState('apply_to_booking');
  const [loading, setLoading] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);
  const { toast } = useToast();

  const quickOptions = [
    { points: 100, discount: 10 },
    { points: 500, discount: 50 },
    { points: 1000, discount: 100 },
    { points: 2500, discount: 250 },
    { points: 5000, discount: 500 },
  ];

  const handleQuickRedeem = (points) => {
    setPointsToRedeem(points.toString());
  };

  const handleRedeem = async () => {
    const points = parseInt(pointsToRedeem);

    // Validation
    if (!points || points < 100) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum redemption is 100 points (₹10)',
        variant: 'destructive',
      });
      return;
    }

    if (points % 100 !== 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Points must be a multiple of 100',
        variant: 'destructive',
      });
      return;
    }

    if (points > balance.points_balance) {
      toast({
        title: 'Insufficient Points',
        description: `You have ${balance.points_balance} points available`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await redeemPoints({
        points_to_redeem: points,
        redemption_type: redemptionType,
      });

      setRedemptionResult(result);
      toast({
        title: 'Success!',
        description: `Successfully redeemed ${points} points for ₹${result.discount_amount}`,
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: 'Redemption Failed',
        description: error.message || 'Failed to redeem points. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyVoucher = () => {
    if (redemptionResult?.voucher_code) {
      navigator.clipboard.writeText(redemptionResult.voucher_code);
      toast({
        title: 'Copied!',
        description: 'Voucher code copied to clipboard',
      });
    }
  };

  if (redemptionResult) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Redemption Successful!
            </DialogTitle>
            <DialogDescription>
              Your points have been redeemed successfully
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Discount Amount</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{redemptionResult.discount_amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {redemptionResult.points_used} points used
                  </p>
                </div>
              </CardContent>
            </Card>

            {redemptionResult.voucher_code && (
              <div className="space-y-2">
                <Label>Voucher Code</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={redemptionResult.voucher_code}
                    readOnly
                    className="font-mono font-semibold"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyVoucher}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Use this code at checkout to apply the discount
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                New Balance: <span className="font-semibold">{redemptionResult.new_balance?.toLocaleString() || 0} points</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Redeem Points
          </DialogTitle>
          <DialogDescription>
            Convert your points into discounts. 100 points = ₹10 discount
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Balance */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Points</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {balance?.points_balance?.toLocaleString() || 0}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Redeem Options */}
          <div className="space-y-2">
            <Label>Quick Redeem</Label>
            <div className="grid grid-cols-3 gap-2">
              {quickOptions
                .filter((option) => option.points <= balance?.points_balance)
                .map((option) => (
                  <Button
                    key={option.points}
                    variant="outline"
                    className="flex flex-col h-auto py-2"
                    onClick={() => handleQuickRedeem(option.points)}
                  >
                    <span className="text-sm font-bold">₹{option.discount}</span>
                    <span className="text-xs opacity-70">{option.points} pts</span>
                  </Button>
                ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="points">Or Enter Custom Amount</Label>
            <div className="flex items-center gap-2">
              <Input
                id="points"
                type="number"
                placeholder="Enter points (min 100)"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(e.target.value)}
                min={100}
                step={100}
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                = ₹{pointsToRedeem ? Math.floor(pointsToRedeem / 10) : 0}
              </span>
            </div>
            {pointsToRedeem && (
              <p className="text-xs text-gray-500">
                {pointsToRedeem % 100 !== 0 && (
                  <span className="text-red-600">Must be multiple of 100. </span>
                )}
                Remaining: {(balance?.points_balance - parseInt(pointsToRedeem || 0)).toLocaleString()} points
              </p>
            )}
          </div>

          {/* Redemption Type */}
          <div className="space-y-2">
            <Label>Redemption Type</Label>
            <div className="space-y-2">
              <Button
                variant={redemptionType === 'apply_to_booking' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setRedemptionType('apply_to_booking')}
              >
                Apply to Next Booking
              </Button>
              <Button
                variant={redemptionType === 'discount_voucher' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setRedemptionType('discount_voucher')}
              >
                Generate Voucher Code
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRedeem}
            disabled={
              loading ||
              !pointsToRedeem ||
              parseInt(pointsToRedeem) < 100 ||
              parseInt(pointsToRedeem) % 100 !== 0 ||
              parseInt(pointsToRedeem) > balance?.points_balance
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Redeem
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

