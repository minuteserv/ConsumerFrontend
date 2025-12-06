import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { sendOTP, verifyOTP } from '@/lib/otp';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';
import { Phone, Shield, Loader2, User, Mail, MapPin } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Register
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isNewPartner, setIsNewPartner] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    service_categories: [],
  });
  const otpInputRefs = useRef([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
      setError('');
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && value) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    const fullPhoneNumber = `+91${phoneNumber}`;
    const result = await sendOTP(fullPhoneNumber);

    setIsLoading(false);

    if (result.success) {
      setStep(2);
      setResendTimer(45);
      
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.message || 'Failed to send OTP. Please try again.');
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const fullPhoneNumber = `+91${phoneNumber}`;
    const result = await verifyOTP(fullPhoneNumber, otpValue);

    setIsLoading(false);

    if (result.success && result.verified) {
      if (result.partner) {
        // Existing partner - login
        login(result.partner);
        navigate('/dashboard', { replace: true });
      } else {
        // New partner - show registration form
        setIsNewPartner(true);
        setStep(3);
      }
    } else {
      setError(result.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  // Register new partner
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!registrationData.name) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      const response = await apiClient.post(API_ENDPOINTS.partnerRegister, {
        phone_number: fullPhoneNumber,
        name: registrationData.name,
        email: registrationData.email || null,
        service_categories: registrationData.service_categories,
      });

      if (response.partner) {
        login(response.partner);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    await handleSendOTP();
  };

  // Change phone number
  const handleChangeNumber = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setResendTimer(0);
    setError('');
    setIsNewPartner(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Partner Login</CardTitle>
          <CardDescription>
            {step === 1 && 'Enter your phone number to continue'}
            {step === 2 && 'Enter the OTP sent to your phone'}
            {step === 3 && 'Complete your registration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Phone Number */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 border rounded-md bg-muted font-medium">
                    +91
                  </div>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210"
                    maxLength={10}
                    autoFocus
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                {error && (
                  <p className="text-sm text-error">{error}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We'll send a 6-digit OTP to verify your number
                </p>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={phoneNumber.length !== 10 || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>

              <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Your number is secure. We never share your details with anyone.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-digit OTP</Label>
                <p className="text-sm text-muted-foreground">
                  OTP sent to +91 {phoneNumber}
                </p>
                <div className="flex gap-2 justify-center" onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
                  if (pastedData.length === 6) {
                    const newOtp = pastedData.split('');
                    setOtp(newOtp);
                    setTimeout(() => handleVerifyOTP(pastedData), 100);
                  }
                }}>
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isLoading}
                      autoFocus={index === 0}
                      className="w-12 h-12 text-center text-lg font-semibold"
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-sm text-error text-center">{error}</p>
                )}
              </div>

              <div className="flex justify-center gap-4 text-sm">
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-primary disabled:text-muted-foreground underline"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  onClick={handleChangeNumber}
                  disabled={isLoading}
                  className="text-primary disabled:text-muted-foreground underline"
                >
                  Change Number
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Registration */}
          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="pl-9"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="pl-9"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-error">{error}</p>
              )}

              <Button
                type="submit"
                disabled={!registrationData.name || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleChangeNumber}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

