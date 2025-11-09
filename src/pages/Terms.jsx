import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { COMPANY_INFO } from '../lib/constants';
import { ArrowLeft } from 'lucide-react';

export function Terms() {
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
              Terms & Conditions
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
          Terms & Conditions
        </h1>

        {/* Last Updated */}
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          lineHeight: '20px',
          color: 'rgb(84, 84, 84)',
          fontWeight: 400,
          marginBottom: '40px',
          marginTop: 0,
          fontStyle: 'italic'
        }}>
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* Introduction Section */}
        <section style={{ marginBottom: '48px' }}>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            Welcome to {COMPANY_INFO.name}. These Terms and Conditions ("Terms") govern your use of our beauty and wellness services. By using our services, you agree to be bound by these Terms. Please read them carefully.
          </p>
        </section>

        {/* Section 1: Acceptance of Terms */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            1. Acceptance of Terms
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            By accessing or using {COMPANY_INFO.name}'s services, including booking appointments, using our website, or receiving services from our professionals, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these Terms, please do not use our services.
          </p>
        </section>

        {/* Section 2: Service Description */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            2. Service Description
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            {COMPANY_INFO.name} provides beauty and wellness services, including but not limited to:
          </p>
          <ul style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginLeft: '24px',
            marginTop: 0,
            marginBottom: '16px',
            paddingLeft: '0'
          }}>
            <li style={{ marginBottom: '8px' }}>Hair care and styling services</li>
            <li style={{ marginBottom: '8px' }}>Facial treatments</li>
            <li style={{ marginBottom: '8px' }}>Skin care services</li>
            <li style={{ marginBottom: '8px' }}>Waxing and hair removal</li>
            <li style={{ marginBottom: '8px' }}>Manicure and pedicure services</li>
            <li style={{ marginBottom: '8px' }}>Hair coloring services</li>
          </ul>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            Services are provided at your residence or designated location by trained professionals. Service availability, pricing, and timing are subject to change at our discretion.
          </p>
        </section>

        {/* Section 3: Booking and Cancellation */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            3. Booking and Cancellation
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            <strong>Booking:</strong> All bookings must be made through our website, mobile app, or customer service. Bookings are subject to availability of service professionals.
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            <strong>Cancellation:</strong> You may cancel your booking at least 24 hours before the scheduled service time. Cancellations made less than 24 hours before the service may be subject to a cancellation fee as specified during booking.
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            <strong>Rescheduling:</strong> You may reschedule your booking at least 24 hours before the scheduled service time, subject to professional availability.
          </p>
        </section>

        {/* Section 4: Pricing and Payment */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            4. Pricing and Payment
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            <strong>Pricing:</strong> All prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes unless otherwise specified. Prices are subject to change without prior notice.
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            <strong>Payment:</strong> Payment can be made through cash, credit/debit cards, UPI, or other payment methods accepted by us. Payment is due at the time of service completion unless other arrangements have been made.
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            <strong>Refunds:</strong> Refund policies are handled on a case-by-case basis. If you are unsatisfied with a service, please contact our customer service within 24 hours of service completion.
          </p>
        </section>

        {/* Section 5: Service Quality and Safety */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            5. Service Quality and Safety
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            We strive to provide high-quality services through trained and certified professionals. Our service providers follow strict hygiene and safety protocols. However, please inform us of any allergies, medical conditions, or sensitivities before service begins.
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            {COMPANY_INFO.name} is not liable for any adverse reactions to products used during services if you fail to disclose relevant allergies or medical conditions.
          </p>
        </section>

        {/* Section 6: Customer Responsibilities */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            6. Customer Responsibilities
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            You are responsible for:
          </p>
          <ul style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginLeft: '24px',
            marginTop: 0,
            marginBottom: '16px',
            paddingLeft: '0'
          }}>
            <li style={{ marginBottom: '8px' }}>Providing accurate information during booking</li>
            <li style={{ marginBottom: '8px' }}>Ensuring a safe and appropriate environment for service delivery</li>
            <li style={{ marginBottom: '8px' }}>Being available at the scheduled time</li>
            <li style={{ marginBottom: '8px' }}>Treating our service professionals with respect and courtesy</li>
            <li style={{ marginBottom: '8px' }}>Disclosing any allergies, medical conditions, or sensitivities</li>
          </ul>
        </section>

        {/* Section 7: Limitation of Liability */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            7. Limitation of Liability
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            To the maximum extent permitted by law, {COMPANY_INFO.name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or in connection with our services.
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            Our total liability for any claims arising from our services shall not exceed the amount you paid for the specific service in question.
          </p>
        </section>

        {/* Section 8: Intellectual Property */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            8. Intellectual Property
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            All content on our website, including logos, text, graphics, and images, is the property of {COMPANY_INFO.name} or its licensors and is protected by copyright and trademark laws. You may not use, reproduce, or distribute any content without our prior written permission.
          </p>
        </section>

        {/* Section 9: Privacy */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            9. Privacy
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            Your privacy is important to us. Please review our <a href="/privacy-policy" style={{ color: 'rgb(110, 66, 229)', textDecoration: 'none' }}>Privacy Policy</a> to understand how we collect, use, and protect your personal information.
          </p>
        </section>

        {/* Section 10: Changes to Terms */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            10. Changes to Terms
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms.
          </p>
        </section>

        {/* Section 11: Contact Information */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            11. Contact Information
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '8px',
            marginTop: 0
          }}>
            If you have any questions about these Terms, please contact us:
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '4px',
            marginTop: 0
          }}>
            <strong>Email:</strong> {COMPANY_INFO.email}
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '4px',
            marginTop: 0
          }}>
            <strong>Phone:</strong> {COMPANY_INFO.phone}
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            <strong>Address:</strong> {COMPANY_INFO.address}
          </p>
        </section>
      </div>
    </div>
  );
}

