import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { contactUsAPI } from '../lib/api';
import { COMPANY_INFO } from '../lib/constants';
import { Phone, Mail, MapPin, Clock, MessageCircle, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';

export function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await contactUsAPI(formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${COMPANY_INFO.email}?subject=Contact Us - ${COMPANY_INFO.name}`;
  };

  const handleWhatsApp = () => {
    const whatsappNumber = (COMPANY_INFO.whatsapp || COMPANY_INFO.phone).replace(/[^\d]/g, '');
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_INFO.address)}`;
    window.open(url, '_blank');
  };

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
              Contact Us
            </h1>
          </div>
        </div>
      </div>
      
      <div className="pt-[72px] md:pt-0" style={{ maxWidth: '1232px', width: '100%', margin: '0 auto', padding: '40px 16px' }}>
        {/* Page Title */}
        <h1 className="mt-[40px] md:mt-[20px]" style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '36px',
          lineHeight: '44px',
          color: 'rgb(15, 15, 15)',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          Contact Us
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          lineHeight: '24px',
          color: 'rgb(84, 84, 84)',
          fontWeight: 400,
          marginBottom: '48px',
          marginTop: 0
        }}>
          We'd love to hear from you! Reach out to us through any of the channels below or fill out the form and we'll get back to you soon.
        </p>

        {/* Contact Information Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {/* Phone Card */}
          <div style={{
            padding: '24px',
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(227, 227, 227)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={handleCall}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'rgb(245, 245, 245)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Phone size={24} color="rgb(110, 66, 229)" />
            </div>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              lineHeight: '26px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '8px',
              marginTop: 0
            }}>
              Phone
            </h3>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400,
              marginBottom: '8px',
              marginTop: 0
            }}>
              Call us directly
            </p>
            <a
              href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`}
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(110, 66, 229)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              {COMPANY_INFO.phone}
            </a>
          </div>

          {/* Email Card */}
          <div style={{
            padding: '24px',
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(227, 227, 227)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={handleEmail}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'rgb(245, 245, 245)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Mail size={24} color="rgb(110, 66, 229)" />
            </div>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              lineHeight: '26px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '8px',
              marginTop: 0
            }}>
              Email
            </h3>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400,
              marginBottom: '8px',
              marginTop: 0
            }}>
              Send us an email
            </p>
            <a
              href={`mailto:${COMPANY_INFO.email}?subject=Contact Us - ${COMPANY_INFO.name}`}
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(110, 66, 229)',
                fontWeight: 600,
                textDecoration: 'none',
                wordBreak: 'break-word'
              }}
            >
              {COMPANY_INFO.email}
            </a>
          </div>

          {/* WhatsApp Card */}
          <div
            style={{
              padding: '24px',
              backgroundColor: 'rgb(255, 255, 255)',
              border: '1px solid rgb(227, 227, 227)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              transition: 'box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={handleWhatsApp}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'rgb(245, 245, 245)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <MessageCircle size={24} color="rgb(110, 66, 229)" />
            </div>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              lineHeight: '26px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '8px',
              marginTop: 0
            }}>
              WhatsApp
            </h3>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400,
              marginBottom: '8px',
              marginTop: 0
            }}>
              Chat with us on WhatsApp
            </p>
            <a
              href={`https://wa.me/${(COMPANY_INFO.whatsapp || COMPANY_INFO.phone).replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(110, 66, 229)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              {COMPANY_INFO.whatsapp || COMPANY_INFO.phone}
            </a>
          </div>

          {/* Address Card */}
          <div style={{
            padding: '24px',
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(227, 227, 227)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={handleDirections}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'rgb(245, 245, 245)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <MapPin size={24} color="rgb(110, 66, 229)" />
            </div>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              lineHeight: '26px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '8px',
              marginTop: 0
            }}>
              Address
            </h3>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'rgb(84, 84, 84)',
              fontWeight: 400,
              marginBottom: 0,
              marginTop: 0
            }}>
              {COMPANY_INFO.address}
            </p>
          </div>

          {/* Business Hours Card */}
          {/* <div style={{
            padding: '24px',
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(227, 227, 227)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'rgb(245, 245, 245)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Clock size={24} color="rgb(110, 66, 229)" />
            </div>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              lineHeight: '26px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '8px',
              marginTop: 0
            }}>
              Business Hours
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <p style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                margin: 0
              }}>
                Monday - Sunday
              </p>
              <p style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400,
                margin: 0
              }}>
                9:00 AM - 9:00 PM
              </p>
            </div>
          </div> */}
        </div>

        {/* Contact Form Section */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'start'
          }}>
            {/* Form */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '28px',
                lineHeight: '36px',
                color: 'rgb(15, 15, 15)',
                fontWeight: 600,
                marginBottom: '24px',
                marginTop: 0
              }}>
                Send us a Message
              </h2>
              <Card style={{
                border: '1px solid rgb(227, 227, 227)',
                borderRadius: '8px'
              }}>
                <CardContent style={{ padding: '24px' }}>
                  {submitSuccess && (
                    <div style={{
                      marginBottom: '24px',
                      padding: '16px',
                      backgroundColor: 'rgb(240, 253, 244)',
                      border: '1px solid rgb(187, 247, 208)',
                      borderRadius: '8px',
                      color: 'rgb(22, 101, 52)',
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: 400
                    }}>
                      Thank you for contacting us! We'll get back to you soon.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Label htmlFor="name" style={{
                        fontFamily: 'system-ui, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: 'rgb(15, 15, 15)',
                        fontWeight: 500
                      }}>
                        Full Name *
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          padding: '12px 16px',
                          border: '1px solid rgb(227, 227, 227)',
                          borderRadius: '8px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Label htmlFor="email" style={{
                        fontFamily: 'system-ui, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: 'rgb(15, 15, 15)',
                        fontWeight: 500
                      }}>
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          padding: '12px 16px',
                          border: '1px solid rgb(227, 227, 227)',
                          borderRadius: '8px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Label htmlFor="phone" style={{
                        fontFamily: 'system-ui, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: 'rgb(15, 15, 15)',
                        fontWeight: 500
                      }}>
                        Phone Number *
                      </Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        style={{
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          padding: '12px 16px',
                          border: '1px solid rgb(227, 227, 227)',
                          borderRadius: '8px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Label htmlFor="message" style={{
                        fontFamily: 'system-ui, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: 'rgb(15, 15, 15)',
                        fontWeight: 500
                      }}>
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        style={{
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          padding: '12px 16px',
                          border: '1px solid rgb(227, 227, 227)',
                          borderRadius: '8px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgb(110, 66, 229)',
                        color: 'rgb(255, 255, 255)',
                        fontFamily: 'system-ui, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: 600,
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.backgroundColor = 'rgb(90, 46, 209)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.backgroundColor = 'rgb(110, 66, 229)';
                        }
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '28px',
                lineHeight: '36px',
                color: 'rgb(15, 15, 15)',
                fontWeight: 600,
                marginBottom: '24px',
                marginTop: 0
              }}>
                Why Contact Us?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '18px',
                    lineHeight: '26px',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    marginTop: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <MessageSquare size={20} color="rgb(110, 66, 229)" />
                    General Inquiries
                  </h3>
                  <p style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'rgb(84, 84, 84)',
                    fontWeight: 400,
                    margin: 0
                  }}>
                    Have questions about our services, packages, or how to book an appointment? We're here to help!
                  </p>
                </div>

                <div>
                  <h3 style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '18px',
                    lineHeight: '26px',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    marginTop: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <MessageSquare size={20} color="rgb(110, 66, 229)" />
                    Feedback & Reviews
                  </h3>
                  <p style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'rgb(84, 84, 84)',
                    fontWeight: 400,
                    margin: 0
                  }}>
                    Share your experience or let us know how we can improve our services to serve you better.
                  </p>
                </div>

                <div>
                  <h3 style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '18px',
                    lineHeight: '26px',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    marginTop: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <MessageSquare size={20} color="rgb(110, 66, 229)" />
                    Special Requests
                  </h3>
                  <p style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'rgb(84, 84, 84)',
                    fontWeight: 400,
                    margin: 0
                  }}>
                    Need custom packages, bulk bookings, or have special requirements? Contact us and we'll work with you.
                  </p>
                </div>

                <div>
                  <h3 style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '18px',
                    lineHeight: '26px',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    marginTop: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <MessageSquare size={20} color="rgb(110, 66, 229)" />
                    Support & Assistance
                  </h3>
                  <p style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'rgb(84, 84, 84)',
                    fontWeight: 400,
                    margin: 0
                  }}>
                    Facing any issues with bookings, payments, or service quality? Our support team is ready to assist you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Response Time Section */}
        <section style={{
          padding: '32px',
          backgroundColor: 'rgb(245, 245, 245)',
          borderRadius: '8px',
          marginBottom: '48px'
        }}>
          <h3 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '20px',
            lineHeight: '28px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '16px',
            marginTop: 0
          }}>
            Response Time
          </h3>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            margin: 0
          }}>
            We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly at{' '}
            <a
              href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`}
              style={{
                color: 'rgb(110, 66, 229)',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              {COMPANY_INFO.phone}
            </a>
            .
          </p>
        </section>
      </div>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent style={{
          maxWidth: '420px',
          borderRadius: '8px'
        }}>
          <DialogHeader style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <AlertCircle size={48} color="rgb(220, 38, 38)" style={{ fill: 'rgb(220, 38, 38)', opacity: 0.2 }} />
            </div>
            <DialogTitle style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '20px',
              lineHeight: '28px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              Failed to Send Message
            </DialogTitle>
            <DialogDescription style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'rgb(84, 84, 84)'
            }}>
              We encountered an error while sending your message. Please try again or contact us directly.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '24px'
          }}>
            <Button
              onClick={() => setShowErrorModal(false)}
              style={{
                backgroundColor: 'rgb(110, 66, 229)',
                color: 'white'
              }}
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
