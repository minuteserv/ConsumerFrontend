import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { COMPANY_INFO } from '../lib/constants';
import { ArrowLeft } from 'lucide-react';

export function About() {
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
              About Us
            </h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1232px] w-full mx-auto px-4 md:px-16 pt-20 md:pt-10 pb-10 md:pb-10">
        {/* About Minuteserv Section */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '36px',
            lineHeight: '44px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '24px',
            marginTop: 0
          }}>
            About {COMPANY_INFO.name}
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
            Welcome to {COMPANY_INFO.name}, your personal home beauty partner designed for women. We bring salon-quality beauty and wellness services straight to your doorstep safely, comfortably, and right on time.
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
            At {COMPANY_INFO.name}, we understand that your time is precious. That's why our professional beauticians and stylists come to you fully equipped, ensuring a luxurious experience at home without the hassle of travel or waiting. Whether it's skincare, hair styling, makeup, or spa treatments - we make self-care easy, elegant, and effortless.
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: 0,
            marginTop: 0
          }}>
            Our mission is simple: to make every woman feel confident, beautiful, and cared for in the comfort of her own home.
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: 0,
            marginTop: '16px'
          }}>
            With trusted professionals, premium products, and affordable packages, {COMPANY_INFO.name} is redefining home beauty services - one minute at a time.
          </p>
        </section>

        {/* Mission Section */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '32px',
            lineHeight: '40px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '24px',
            marginTop: 0
          }}>
            Mission
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: 0,
            marginTop: 0
          }}>
            Our mission is to provide each of our clients with the best possible spa and salon services at home in order to establish a long-lasting relationship based on trust and satisfaction. Our expertise and experience in the beauty industry enable us to visualize our mission with utmost safety and satisfaction.
          </p>
        </section>

        {/* Vision Section */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '32px',
            lineHeight: '40px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '24px',
            marginTop: 0
          }}>
            Vision
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: 0,
            marginTop: 0
          }}>
            Our vision is to empower women across India and deliver the highest quality salon-like services at home with a mark of excellence. We envision ourselves being a one-stop spa and salon service provider which caters to everyone's beauty and wellness needs across India.
          </p>
        </section>

        {/* Philosophy Section */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '32px',
            lineHeight: '40px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '24px',
            marginTop: 0
          }}>
            Philosophy
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: 0,
            marginTop: 0
          }}>
            Our primary values are transparency and honesty. We prioritise our clients' needs by giving them complete flexibility of decision-making in all aspects. Our customers can take a variety of services at their convenience and according to their needs, from products & services to places & time.
          </p>
        </section>

        {/* Values Section */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '32px',
            lineHeight: '40px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '24px',
            marginTop: 0
          }}>
            Values
          </h2>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: 0,
            marginTop: 0
          }}>
            Our core values are the inclusion of Women Empowerment, and Transparency with our clients and service providers, along with providing superior customer service. {COMPANY_INFO.name} is pleased to have a large family of more than 1 million happy customers and 3000+ service providers all throughout India.
          </p>
        </section>

        {/* Media Queries */}
        <div style={{
          marginBottom: '64px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          lineHeight: '24px',
          color: 'rgb(84, 84, 84)',
          fontWeight: 400
        }}>
          For media queries, contact:{' '}
          <a
            href="mailto:minuteserv@gmail.com"
            style={{
              color: 'rgb(110, 66, 229)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            minuteserv@gmail.com
          </a>
        </div>

        {/* Careers CTA Section */}
        <section style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: 'rgb(245, 245, 245)',
          borderRadius: '8px',
          marginBottom: '64px'
        }}>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '20px',
            lineHeight: '28px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 400,
            marginBottom: '24px',
            marginTop: 0
          }}>
            You could be a part of our journey. Interested?
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfkayl7iKz6wXHtMKgu49sceCcqVaywAFqKa69zjJ7s3UDjnA/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'rgb(15, 15, 15)',
              color: 'rgb(255, 255, 255)',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '4px',
              textTransform: 'uppercase',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(84, 84, 84)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(15, 15, 15)';
            }}
          >
            APPLY NOW
          </a>
        </section>
      </div>
    </div>
  );
}
