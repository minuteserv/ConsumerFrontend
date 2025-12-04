import { useState, useEffect, useRef } from 'react';
import { X, Phone, Shield, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { sendOTP, verifyOTP, resendOTP } from '@/lib/otp';

export function LoginModal({ open, onOpenChange, onLoginSuccess }) {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']); // 4-digit OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const otpInputRefs = useRef([]);

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setPhoneNumber(value);
      setError('');
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are filled
    if (newOtp.every((digit) => digit !== '') && value) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 4) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Focus last input
      otpInputRefs.current[3]?.focus();
      // Auto-verify
      setTimeout(() => handleVerifyOTP(pastedData), 100);
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
      setOtpSent(true);
      setStep(2);
      setResendTimer(45); // 45 seconds countdown
      
      // Start countdown timer
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
    if (otpValue.length !== 4) {
      setError('Please enter 4-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const fullPhoneNumber = `+91${phoneNumber}`;
    const result = await verifyOTP(fullPhoneNumber, otpValue);

    setIsLoading(false);

    if (result.success && result.verified) {
      // Login successful - tokens are in HttpOnly cookies, just pass user data
      login({
        user: result.user, // Full user object from backend (tokens in cookies)
      });

      // Close modal
      onOpenChange(false);
      
      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Reset form
      setStep(1);
      setPhoneNumber('');
      setOtp(['', '', '', '']);
      setOtpSent(false);
    } else {
      setError(result.message || 'Invalid OTP. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  // Resend OTP - uses MSG91 retry endpoint
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setOtp(['', '', '', '']);
    setError('');
    setIsLoading(true);

    const fullPhoneNumber = `+91${phoneNumber}`;
    const result = await resendOTP(fullPhoneNumber, 'text');

    setIsLoading(false);

    if (result.success) {
      setResendTimer(45); // 45 seconds countdown
      
      // Start countdown timer
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
      // If resend fails (e.g., no OTP generated yet), fall back to sendOTP
      if (result.message?.includes('No OTP') || result.message?.includes('not generated')) {
        await handleSendOTP();
      } else {
        setError(result.message || 'Failed to resend OTP. Please try again.');
      }
    }
  };

  // Change phone number
  const handleChangeNumber = () => {
    setStep(1);
    setOtp(['', '', '', '']);
    setOtpSent(false);
    setResendTimer(0);
    setError('');
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1);
      setPhoneNumber('');
      setOtp(['', '', '', '']);
      setError('');
      setOtpSent(false);
      setResendTimer(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          maxWidth: '440px',
          width: '100%',
          borderRadius: '16px',
          padding: '0',
        }}
        hideClose={true}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Login or Sign Up</DialogTitle>
          <DialogDescription>Enter your phone number to continue</DialogDescription>
        </DialogHeader>
        {/* Close Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '12px 16px',
          }}
        >
          <button
            onClick={() => onOpenChange(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(245, 245, 245)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} color="rgb(15, 15, 15)" />
          </button>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          {/* Step 1: Phone Number */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <h2
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 600,
                    margin: '0 0 8px 0',
                  }}
                >
                  Login or Sign Up
                </h2>
                <p
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'rgb(84, 84, 84)',
                    margin: 0,
                  }}
                >
                  Enter your phone number to continue
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Label
                  htmlFor="phoneNumber"
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px',
                    lineHeight: '18px',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 500,
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Phone Number
                </Label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 12px',
                      border: '1px solid rgb(227, 227, 227)',
                      borderRadius: '6px',
                      backgroundColor: 'rgb(250, 250, 250)',
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '14px',
                      color: 'rgb(15, 15, 15)',
                      fontWeight: 500,
                    }}
                  >
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
                    style={{
                      flex: 1,
                      fontSize: '14px',
                      padding: '10px 14px',
                      border: error
                        ? '1px solid rgb(220, 38, 38)'
                        : '1px solid rgb(227, 227, 227)',
                      borderRadius: '6px',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && phoneNumber.length === 10) {
                        handleSendOTP();
                      }
                    }}
                  />
                </div>
                {error && (
                  <p
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: 'rgb(220, 38, 38)',
                      margin: '8px 0 0 0',
                    }}
                  >
                    {error}
                  </p>
                )}
                <p
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: 'rgb(84, 84, 84)',
                    margin: '8px 0 0 0',
                  }}
                >
                  We'll send a 4-digit OTP to verify your number
                </p>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={phoneNumber.length !== 10 || isLoading}
                style={{
                  width: '100%',
                  backgroundColor:
                    phoneNumber.length !== 10 || isLoading
                      ? 'rgb(200, 200, 200)'
                      : 'rgb(110, 66, 229)',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '8px',
                  cursor:
                    phoneNumber.length !== 10 || isLoading
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} style={{ marginRight: '8px' }} />
                    Sending OTP...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>

              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'rgb(250, 250, 250)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <Shield size={16} color="rgb(84, 84, 84)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: 'rgb(84, 84, 84)',
                    margin: 0,
                  }}
                >
                  Your number is secure. We never share your details with anyone.
                </p>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <h2
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 600,
                    margin: '0 0 8px 0',
                  }}
                >
                  Enter OTP
                </h2>
                <p
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'rgb(84, 84, 84)',
                    margin: 0,
                  }}
                >
                  OTP sent to +91 {formatPhoneNumber(phoneNumber)}
                </p>
                <p
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: 'rgb(84, 84, 84)',
                    margin: '8px 0 0 0',
                  }}
                >
                  Check your phone for the OTP
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Label
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px',
                    lineHeight: '18px',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 500,
                    marginBottom: '12px',
                    display: 'block',
                  }}
                >
                  Enter 4-digit OTP
                </Label>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                  }}
                  onPaste={handleOtpPaste}
                >
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
                      style={{
                        width: '56px',
                        height: '56px',
                        fontSize: '24px',
                        fontWeight: 600,
                        textAlign: 'center',
                        padding: 0,
                        border: error && index === 0
                          ? '2px solid rgb(220, 38, 38)'
                          : '1px solid rgb(227, 227, 227)',
                        borderRadius: '8px',
                        fontFamily: 'system-ui, sans-serif',
                      }}
                    />
                  ))}
                </div>
                {error && (
                  <p
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: 'rgb(220, 38, 38)',
                      margin: '12px 0 0 0',
                      textAlign: 'center',
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <Button
                  onClick={() => handleVerifyOTP()}
                  disabled={otp.some((digit) => !digit) || isLoading}
                  style={{
                    width: '100%',
                    backgroundColor:
                      otp.some((digit) => !digit) || isLoading
                        ? 'rgb(200, 200, 200)'
                        : 'rgb(110, 66, 229)',
                    color: 'white',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '8px',
                    cursor:
                      otp.some((digit) => !digit) || isLoading
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} style={{ marginRight: '8px' }} />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '8px',
                  }}
                >
                  <button
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: resendTimer > 0 || isLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '14px',
                      color:
                        resendTimer > 0 || isLoading
                          ? 'rgb(150, 150, 150)'
                          : 'rgb(110, 66, 229)',
                      textDecoration: 'underline',
                      fontWeight: 500,
                    }}
                  >
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : 'Resend OTP'}
                  </button>
                  <span
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '14px',
                      color: 'rgb(150, 150, 150)',
                    }}
                  >
                    |
                  </span>
                  <button
                    onClick={handleChangeNumber}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '14px',
                      color: isLoading ? 'rgb(150, 150, 150)' : 'rgb(110, 66, 229)',
                      textDecoration: 'underline',
                      fontWeight: 500,
                    }}
                  >
                    Change Number
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

