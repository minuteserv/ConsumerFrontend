import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { COMPANY_INFO } from '../lib/constants';
import { ArrowLeft } from 'lucide-react';

export function CancellationRefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-32">
      {/* Header - Desktop Only */}
      <div className="hidden md:block">
        <Header showSearch={false} />
      </div>
      
      {/* Mobile Header with Title - Fixed */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="w-full px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center text-gray-900 bg-transparent border-none cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 mb-0 leading-tight truncate">
              Cancellation & Refund Policy
            </h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1232px] w-full mx-auto px-4 md:px-16 pt-20 md:pt-10 pb-10 md:pb-10">
        {/* Page Title */}
        <h1 style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '36px',
          lineHeight: '44px',
          color: 'rgb(15, 15, 15)',
          fontWeight: 600,
          marginBottom: '32px',
          marginTop: 0
        }}>
          Cancellation & Refund Policy
        </h1>

        {/* Last Updated */}
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          lineHeight: '20px',
          color: 'rgb(84, 84, 84)',
          fontWeight: 400,
          marginBottom: '32px',
          marginTop: 0
        }}>
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* Content Sections */}
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          lineHeight: '24px',
          color: 'rgb(15, 15, 15)',
          fontWeight: 400
        }}>
          {/* Cancellation Policy */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Cancellation Policy
            </h2>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400
            }}>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                You may cancel your booking at any time before the service provider arrives at your location. Cancellation requests can be made through the app or by contacting our customer support team.
              </p>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                <strong>Cancellation Charges:</strong>
              </p>
              <ul style={{ marginBottom: '16px', marginTop: 0, paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}>
                  Cancellation more than 24 hours before the scheduled service time: <strong>No charges</strong>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Cancellation between 12-24 hours before the scheduled service time: <strong>25% of service fee</strong>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Cancellation less than 12 hours before the scheduled service time: <strong>50% of service fee</strong>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Cancellation after the service provider has arrived or service has started: <strong>No refund</strong>
                </li>
              </ul>
            </div>
          </section>

          {/* Refund Policy */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Refund Policy
            </h2>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400
            }}>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                Refunds will be processed to the original payment method used for the booking. The refund amount will be calculated based on our cancellation policy.
              </p>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                <strong>Refund Processing Time:</strong>
              </p>
              <ul style={{ marginBottom: '16px', marginTop: 0, paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}>
                  Refunds are typically processed within <strong>5-7 business days</strong> after cancellation approval
                </li>
                <li style={{ marginBottom: '8px' }}>
                  The actual credit to your account may take additional time depending on your bank or payment provider
                </li>
              </ul>
            </div>
          </section>

          {/* Service Quality Issues */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Service Quality Issues
            </h2>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400
            }}>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                If you are not satisfied with the quality of service provided, please contact our customer support team within 24 hours of service completion. We will investigate your complaint and may offer:
              </p>
              <ul style={{ marginBottom: '16px', marginTop: 0, paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}>Full or partial refund</li>
                <li style={{ marginBottom: '8px' }}>Re-service at no additional cost</li>
                <li style={{ marginBottom: '8px' }}>Credit for future bookings</li>
              </ul>
            </div>
          </section>

          {/* Company-Initiated Cancellations */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Company-Initiated Cancellations
            </h2>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400
            }}>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                If we need to cancel your booking due to reasons beyond your control (e.g., service provider unavailability, weather conditions, etc.), you will receive a <strong>full refund</strong> or the option to reschedule at no additional cost.
              </p>
            </div>
          </section>

          {/* Payment Methods and Refunds */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Payment Methods and Refunds
            </h2>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400
            }}>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                Refunds will be processed to the same payment method used for the original transaction. If that payment method is no longer available, please contact our support team to arrange an alternative refund method.
              </p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Dispute Resolution
            </h2>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400
            }}>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                If you have any disputes regarding cancellations or refunds, please contact our customer support team. We are committed to resolving all issues fairly and promptly.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Changes to Policy
            </h2>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400
            }}>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                We reserve the right to modify this Cancellation & Refund Policy at any time. Any changes will be effective immediately upon posting on our website. Your continued use of our services after such changes constitutes your acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Contact Information
            </h2>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400
            }}>
              <p style={{ marginBottom: '8px', marginTop: 0 }}>
                For cancellation requests or refund inquiries, please contact us:
              </p>
              <p style={{ marginBottom: '8px', marginTop: 0 }}>
                <strong>Email:</strong> {COMPANY_INFO.email}
              </p>
              <p style={{ marginBottom: '8px', marginTop: 0 }}>
                <strong>Phone:</strong> {COMPANY_INFO.phone}
              </p>
              <p style={{ marginBottom: '16px', marginTop: 0 }}>
                <strong>WhatsApp:</strong> {COMPANY_INFO.whatsapp}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

