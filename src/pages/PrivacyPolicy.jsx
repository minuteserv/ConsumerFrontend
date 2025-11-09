import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { COMPANY_INFO } from '../lib/constants';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
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
              Privacy Policy
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
          Privacy Policy
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
            At {COMPANY_INFO.name}, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our beauty and wellness services.
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
            By using our services, you consent to the collection and use of information in accordance with this Privacy Policy.
          </p>
        </section>

        {/* Section 1: Information We Collect */}
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
            1. Information We Collect
          </h2>
          
          <h3 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '20px',
            lineHeight: '28px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '12px',
            marginTop: 0
          }}>
            1.1 Personal Information
          </h3>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            We may collect the following personal information:
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
            <li style={{ marginBottom: '8px' }}>Name and contact information (phone number, email address)</li>
            <li style={{ marginBottom: '8px' }}>Service address and location details</li>
            <li style={{ marginBottom: '8px' }}>Payment information (credit/debit card details, UPI information)</li>
            <li style={{ marginBottom: '8px' }}>Booking history and service preferences</li>
            <li style={{ marginBottom: '8px' }}>Medical information relevant to service delivery (allergies, skin conditions)</li>
            <li style={{ marginBottom: '8px' }}>Photographs (if provided for service consultation)</li>
          </ul>

          <h3 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '20px',
            lineHeight: '28px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '12px',
            marginTop: '24px'
          }}>
            1.2 Automatically Collected Information
          </h3>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: '16px',
            marginTop: 0
          }}>
            When you visit our website or use our mobile app, we may automatically collect:
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
            <li style={{ marginBottom: '8px' }}>Device information (device type, operating system, browser type)</li>
            <li style={{ marginBottom: '8px' }}>IP address and location data</li>
            <li style={{ marginBottom: '8px' }}>Usage patterns and website navigation data</li>
            <li style={{ marginBottom: '8px' }}>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        {/* Section 2: How We Use Your Information */}
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
            2. How We Use Your Information
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
            We use your information for the following purposes:
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
            <li style={{ marginBottom: '8px' }}>To process and manage your service bookings</li>
            <li style={{ marginBottom: '8px' }}>To communicate with you about your bookings, services, and inquiries</li>
            <li style={{ marginBottom: '8px' }}>To process payments and manage billing</li>
            <li style={{ marginBottom: '8px' }}>To personalize your service experience and recommendations</li>
            <li style={{ marginBottom: '8px' }}>To improve our services, website, and mobile app</li>
            <li style={{ marginBottom: '8px' }}>To send you promotional offers, updates, and newsletters (with your consent)</li>
            <li style={{ marginBottom: '8px' }}>To comply with legal obligations and protect our rights</li>
            <li style={{ marginBottom: '8px' }}>To prevent fraud and ensure security</li>
          </ul>
        </section>

        {/* Section 3: Information Sharing and Disclosure */}
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
            3. Information Sharing and Disclosure
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
            We do not sell your personal information. We may share your information in the following circumstances:
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
            <li style={{ marginBottom: '8px' }}><strong>Service Providers:</strong> We share information with service professionals and third-party service providers who assist us in delivering services</li>
            <li style={{ marginBottom: '8px' }}><strong>Payment Processors:</strong> We share payment information with secure payment processing companies to process transactions</li>
            <li style={{ marginBottom: '8px' }}><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation</li>
            <li style={{ marginBottom: '8px' }}><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
            <li style={{ marginBottom: '8px' }}><strong>With Your Consent:</strong> We may share information with third parties when you have explicitly consented</li>
          </ul>
        </section>

        {/* Section 4: Data Security */}
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
            4. Data Security
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
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
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
            We use encryption for sensitive data, secure payment gateways, and regular security audits to safeguard your information.
          </p>
        </section>

        {/* Section 5: Your Rights and Choices */}
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
            5. Your Rights and Choices
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
            You have the following rights regarding your personal information:
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
            <li style={{ marginBottom: '8px' }}><strong>Access:</strong> Request access to your personal information</li>
            <li style={{ marginBottom: '8px' }}><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li style={{ marginBottom: '8px' }}><strong>Deletion:</strong> Request deletion of your personal information, subject to legal and contractual obligations</li>
            <li style={{ marginBottom: '8px' }}><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
            <li style={{ marginBottom: '8px' }}><strong>Data Portability:</strong> Request transfer of your personal information to another service provider</li>
            <li style={{ marginBottom: '8px' }}><strong>Withdraw Consent:</strong> Withdraw consent for processing personal information where consent is the legal basis</li>
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
            To exercise these rights, please contact us using the contact information provided at the end of this policy.
          </p>
        </section>

        {/* Section 6: Cookies and Tracking Technologies */}
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
            6. Cookies and Tracking Technologies
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
            We use cookies and similar tracking technologies to enhance your experience on our website and mobile app. Cookies are small text files stored on your device that help us remember your preferences and improve functionality.
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
            You can control cookie settings through your browser preferences. However, disabling cookies may affect the functionality of our website and services.
          </p>
        </section>

        {/* Section 7: Children's Privacy */}
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
            7. Children's Privacy
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
            Our services are intended for individuals who are 18 years of age or older. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take steps to delete such information promptly.
          </p>
        </section>

        {/* Section 8: Data Retention */}
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
            8. Data Retention
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
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
          </p>
        </section>

        {/* Section 9: Changes to Privacy Policy */}
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
            9. Changes to Privacy Policy
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
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website with a new "Last Updated" date. Your continued use of our services after changes are posted constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        {/* Section 10: Contact Information */}
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
            10. Contact Information
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
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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

