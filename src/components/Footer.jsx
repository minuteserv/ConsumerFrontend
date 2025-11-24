import { Link } from 'react-router-dom';
import { COMPANY_INFO } from '../lib/constants';

export function Footer({ className = '' }) {
  const currentYear = new Date().getFullYear();
  const showAppDownloadButtons = false;

  // Scroll to top when footer link is clicked
  const handleFooterLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={className} style={{ 
      backgroundColor: '#F5F5F5',
      padding: '40px 40px 24px',
      marginTop: '60px'
    }}>
      <div style={{ maxWidth: '1232px', width: '100%', margin: '0 auto' }}>
        {/* Footer Links Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '40px'
        }}>
          {/* Column 1: Company */}
          <div style={{ paddingRight: '32px' }}>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '20px',
              lineHeight: '28px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Company
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/about" onClick={handleFooterLinkClick} style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                About us
              </Link>
              {/* <a href="https://investorrelations.urbancompany.com/" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                Investor Relations
              </a> */}
              <Link to="/terms" onClick={handleFooterLinkClick} style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                Terms & conditions
              </Link>
              <Link to="/privacy-policy" onClick={handleFooterLinkClick} style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                Privacy policy
              </Link>
              <Link to="/anti-discrimination-policy" onClick={handleFooterLinkClick} style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                Anti-discrimination policy
              </Link>
              {/* <a href="https://investorrelations.urbancompany.com/esg" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                ESG Impact
              </a> */}
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSfkayl7iKz6wXHtMKgu49sceCcqVaywAFqKa69zjJ7s3UDjnA/viewform?usp=dialog" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                Careers
              </a>
            </div>
          </div>

          {/* Column 2: For customers */}
          <div style={{ paddingRight: '32px' }}>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '20px',
              lineHeight: '28px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              For customers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/services" onClick={handleFooterLinkClick} style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                Services
              </Link>
              <Link to="/bookings" onClick={handleFooterLinkClick} style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                My Bookings
              </Link>
              <Link to="/contact-us" onClick={handleFooterLinkClick} style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                Contact us
              </Link>
            </div>
          </div>

          {/* Column 3: For professionals */}
          <div style={{ paddingRight: '32px' }}>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '20px',
              lineHeight: '28px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              For professionals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSeuxN25ml-1iN9IXNPUP-XaZ9BoNDDP8RDrKAvULoLRE4cUlw/viewform" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                textDecoration: 'none'
              }}>
                Register as a professional
              </a>
            </div>
          </div>

          {/* Column 4: Social links */}
          <div>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '20px',
              lineHeight: '28px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: 0
            }}>
              Social links
            </h3>
            
            {/* Social Media Icons */}
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              {/* Twitter/X */}
              <a
                href="https://x.com/minuteserv?t=fXRo0JhR9UUVZErhYOGvZw&s=09"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid rgb(227, 227, 227)',
                  borderRadius: '200px',
                  backgroundColor: 'rgb(255, 255, 255)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(200, 200, 200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(227, 227, 227)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0F0F0F" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.991 3.95a1 1 0 00-1.51-.86 7.48 7.48 0 01-1.874.794 5.152 5.152 0 00-3.374-1.242 5.232 5.232 0 00-5.223 5.063 11.032 11.032 0 01-6.814-3.924 1.012 1.012 0 00-.857-.365 1 1 0 00-.785.5 5.276 5.276 0 00-.242 4.769l-.002.001a1.041 1.041 0 00-.496.89c-.002.147.007.294.027.439a5.185 5.185 0 001.568 3.312.998.998 0 00-.066.77 5.204 5.204 0 002.362 2.922 7.465 7.465 0 01-3.59.448A1 1 0 001.45 19.3a12.942 12.942 0 007.01 2.061 12.788 12.788 0 0012.465-9.363c.353-1.183.533-2.411.535-3.646l-.001-.2a5.77 5.77 0 001.532-4.202zm-3.306 3.212a.995.995 0 00-.234.702c.01.165.009.331.009.488a10.822 10.822 0 01-.454 3.08 10.685 10.685 0 01-10.546 7.93c-.859 0-1.715-.1-2.55-.301a9.481 9.481 0 002.942-1.564 1 1 0 00-.602-1.786 3.208 3.208 0 01-2.214-.935 4.95 4.95 0 00.445-.105 1 1 0 00-.08-1.943 3.197 3.197 0 01-2.25-1.726c.18.025.363.04.545.046a1.02 1.02 0 00.984-.696 1 1 0 00-.4-1.137 3.196 3.196 0 01-1.419-2.871 13.014 13.014 0 008.21 3.48 1.02 1.02 0 00.817-.36 1 1 0 00.206-.867 3.152 3.152 0 01-.087-.729 3.23 3.23 0 014.505-2.962c.404.176.767.433 1.066.756a.993.993 0 00.921.298 9.27 9.27 0 001.212-.322 6.683 6.683 0 01-1.026 1.524z" fill="#0F0F0F"></path>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61583149925591"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid rgb(227, 227, 227)',
                  borderRadius: '200px',
                  backgroundColor: 'rgb(255, 255, 255)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(200, 200, 200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(227, 227, 227)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0F0F0F" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.354 5.624C16.604 3.883 14.466 3 12 3c-2.489 0-4.633.884-6.373 2.625C3.884 7.366 3 9.512 3 12c0 2.465.883 4.603 2.624 6.354C7.365 20.11 9.51 21 12 21c2.467 0 4.605-.89 6.356-2.643C20.111 16.604 21 14.465 21 12c0-2.488-.89-4.634-2.646-6.376zm-1.412 11.319c-1.137 1.139-2.436 1.788-3.942 1.985V14h2v-2h-2v-1.4a.6.6 0 01.601-.6H15V8h-1.397c-.742 0-1.361.273-1.857.822-.496.547-.746 1.215-.746 2.008V12H9v2h2v4.93c-1.522-.195-2.826-.845-3.957-1.984C5.668 15.562 5 13.944 5 12c0-1.966.667-3.588 2.042-4.96C8.412 5.667 10.034 5 12 5c1.945 0 3.562.668 4.945 2.043C18.328 8.415 19 10.037 19 12c0 1.941-.673 3.559-2.058 4.943z" fill="#0F0F0F"></path>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/minuteserv?igsh=NW01MTk1azZkcTA2"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid rgb(227, 227, 227)',
                  borderRadius: '200px',
                  backgroundColor: 'rgb(255, 255, 255)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(200, 200, 200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(227, 227, 227)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0F0F0F" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.34 5.46a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zm4.6 2.42a7.588 7.588 0 00-.46-2.43 4.94 4.94 0 00-1.16-1.77 4.7 4.7 0 00-1.77-1.15 7.3 7.3 0 00-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 00-2.43.47 4.78 4.78 0 00-1.77 1.15 4.7 4.7 0 00-1.15 1.77 7.3 7.3 0 00-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 00.47 2.43 4.7 4.7 0 001.15 1.77 4.78 4.78 0 001.77 1.15 7.3 7.3 0 002.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 002.43-.47 4.7 4.7 0 001.77-1.15 4.85 4.85 0 001.16-1.77c.285-.78.44-1.6.46-2.43 0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12zM20.14 16a5.61 5.61 0 01-.34 1.86 3.06 3.06 0 01-.75 1.15c-.324.33-.717.586-1.15.75a5.61 5.61 0 01-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.73 5.73 0 01-1.94-.3 3.27 3.27 0 01-1.1-.75 3 3 0 01-.74-1.15 5.54 5.54 0 01-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.54 5.54 0 01.35-1.9A3 3 0 015 5a3.14 3.14 0 011.1-.8A5.73 5.73 0 018 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.61 5.61 0 011.86.34 3.06 3.06 0 011.19.8c.328.307.584.683.75 1.1.222.609.337 1.252.34 1.9.05 1 .06 1.37.06 4s-.01 3-.06 4zM12 6.87A5.13 5.13 0 1017.14 12 5.12 5.12 0 0012 6.87zm0 8.46a3.33 3.33 0 110-6.66 3.33 3.33 0 010 6.66z" fill="#0F0F0F"></path>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/minute-serv-916612395?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid rgb(227, 227, 227)',
                  borderRadius: '200px',
                  backgroundColor: 'rgb(255, 255, 255)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(200, 200, 200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(227, 227, 227)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0F0F0F" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 16.827V13.13c0-1.98-1.058-2.902-2.468-2.902-1.139 0-1.647.626-1.932 1.066v.02h-.014l.014-.02v-.914h-2.144c.029.605 0 6.447 0 6.447H12.6v-3.601c0-.192.015-.384.071-.522.155-.386.508-.784 1.1-.784.776 0 1.086.591 1.086 1.457v3.45H17zM7 8.385c0-.632.48-1.114 1.213-1.114.734 0 1.185.482 1.199 1.114 0 .619-.465 1.115-1.213 1.115h-.014C7.466 9.5 7 9.005 7 8.385zM9.271 10.38v6.447H7.127V10.38h2.144z" fill="#0F0F0F"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12zm15.657 5.657A8 8 0 116.343 6.342a8 8 0 0111.314 11.315z" fill="#0F0F0F"></path>
                </svg>
              </a>
            </div>

            {/* App Download Buttons */}
            {showAppDownloadButtons && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Apple App Store */}
                <a
                  href="https://apps.apple.com/app/urbancompany"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    width: '108px',
                    height: 'auto',
                    textDecoration: 'none',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_108,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1648463870745-38fece.png"
                    alt="Apple App Store"
                    style={{
                      objectFit: 'contain',
                      height: '100%',
                      width: '100%',
                      backgroundColor: 'transparent',
                      aspectRatio: '3 / 1',
                      borderRadius: '4px',
                      display: 'block'
                    }}
                  />
                </a>

                {/* Google Play Store */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.urbanclap"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    width: '108px',
                    height: 'auto',
                    textDecoration: 'none',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_108,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/home-screen/1696419732772-28cd3d.jpeg"
                    alt="Google Play Store"
                    style={{
                      objectFit: 'contain',
                      height: '100%',
                      width: '100%',
                      backgroundColor: 'transparent',
                      aspectRatio: '3 / 1',
                      borderRadius: '4px',
                      display: 'block'
                    }}
                  />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Copyright Section */}
        <div style={{
          borderTop: '1px solid rgb(227, 227, 227)',
          paddingTop: '24px',
          marginTop: '40px'
        }}>
          <div style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            lineHeight: '18px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400
          }}>
            <p style={{ margin: '4px 0' }}>
              * As on December 31, 2024
            </p>
            <p style={{ margin: '4px 0' }}>
              © Copyright {currentYear} {COMPANY_INFO.name} Limited All rights reserved. | CIN: L74140DL2014PLC274413
            </p>
            <p style={{ margin: '4px 0' }}>
              Managed by Zingcab
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}