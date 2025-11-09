import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { COMPANY_INFO } from '../lib/constants';
import { ArrowLeft } from 'lucide-react';

export function AntiDiscriminationPolicy() {
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
              Anti-Discrimination Policy
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
          Anti-Discrimination Policy
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
            {COMPANY_INFO.name} is committed to providing equal access to our beauty and wellness services for all women, regardless of their background, identity, or circumstances. We believe that every woman deserves to feel beautiful, confident, and cared for in the comfort of her own home.
          </p>
        </section>

        {/* Our Commitment Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '20px',
            marginTop: 0
          }}>
            Our Commitment
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
            At {COMPANY_INFO.name}, we do not discriminate against any individual based on:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 16px 0'
          }}>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Race, ethnicity, or national origin
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Religion or religious beliefs
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Caste, creed, or social status
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Gender identity or sexual orientation
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Age (within legal service parameters)
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Disability or health condition
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Marital status or family structure
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Economic status or financial background
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Language or communication preferences
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Location or residential area
              </span>
            </li>
          </ul>
        </section>

        {/* Equal Access to Services Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '20px',
            marginTop: 0
          }}>
            Equal Access to Services
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
            We are committed to providing equal access to all our beauty and wellness services, including but not limited to:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 16px 0'
          }}>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Salon services (haircuts, styling, coloring)
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Facial and skincare treatments
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Spa and wellness services
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Makeup and beauty services
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Nail care and manicure/pedicure services
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Hair removal and waxing services
              </span>
            </li>
          </ul>
        </section>

        {/* Service Providers Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '20px',
            marginTop: 0
          }}>
            Our Service Providers
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
            All our service providers are trained to respect and serve every client with dignity, professionalism, and without discrimination. We maintain strict standards for our service provider network to ensure:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 16px 0'
          }}>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Professional and respectful treatment of all clients
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Equal quality of service regardless of client background
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Sensitivity to cultural, religious, and personal preferences
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Compliance with anti-discrimination policies
              </span>
            </li>
          </ul>
        </section>

        {/* Reporting Discrimination Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '20px',
            marginTop: 0
          }}>
            Reporting Discrimination
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
            If you experience or witness any form of discrimination while using our services, we encourage you to report it immediately. We take all reports seriously and will investigate promptly.
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
            You can report discrimination through:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 16px 0'
          }}>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Email us at{' '}
                <a
                  href={`mailto:${COMPANY_INFO.email}?subject=Discrimination Report`}
                  style={{
                    color: 'rgb(110, 66, 229)',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  {COMPANY_INFO.email}
                </a>
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Call our customer service at{' '}
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
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Use the feedback option in our mobile app or website
              </span>
            </li>
          </ul>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: 0,
            marginTop: 0
          }}>
            All reports will be kept confidential, and we will take appropriate action, which may include investigating the matter, providing additional training to service providers, or terminating relationships with service providers who violate this policy.
          </p>
        </section>

        {/* Our Response Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '20px',
            marginTop: 0
          }}>
            Our Response to Discrimination
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
            When we receive a report of discrimination, we will:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 16px 0'
          }}>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Investigate the matter promptly and thoroughly
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Take corrective action when discrimination is confirmed
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Provide support and resolution to affected clients
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Implement preventive measures to avoid future incidents
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Follow up with you to ensure resolution and satisfaction
              </span>
            </li>
          </ul>
        </section>

        {/* Accessibility Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '20px',
            marginTop: 0
          }}>
            Accessibility and Accommodation
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
            We are committed to making our services accessible to all women. If you require special accommodations due to a disability, health condition, or other specific needs, please inform us when booking your service. We will work with you to ensure:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 16px 0'
          }}>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Reasonable accommodations are made to serve you comfortably
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Service providers are trained to serve clients with diverse needs
              </span>
            </li>
            <li style={{
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgb(84, 84, 84)'
              }}></div>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: 'rgb(84, 84, 84)',
                fontWeight: 400
              }}>
                Your privacy and dignity are always respected
              </span>
            </li>
          </ul>
        </section>

        {/* Policy Updates Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '20px',
            marginTop: 0
          }}>
            Policy Updates
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
            We may update this Anti-Discrimination Policy from time to time to reflect changes in our practices, legal requirements, or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website with a revised "Last Updated" date.
          </p>
        </section>

        {/* Contact Information Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'rgb(15, 15, 15)',
            fontWeight: 600,
            marginBottom: '20px',
            marginTop: 0
          }}>
            Contact Us
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
            If you have any questions about this Anti-Discrimination Policy or wish to discuss any concerns, please contact us:
          </p>
          <div style={{
            backgroundColor: 'rgb(245, 245, 245)',
            padding: '24px',
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 400,
              marginBottom: '8px',
              marginTop: 0
            }}>
              <strong>Email:</strong>{' '}
              <a
                href={`mailto:${COMPANY_INFO.email}?subject=Anti-Discrimination Policy Inquiry`}
                style={{
                  color: 'rgb(110, 66, 229)',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                {COMPANY_INFO.email}
              </a>
            </p>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 400,
              marginBottom: '8px',
              marginTop: 0
            }}>
              <strong>Phone:</strong>{' '}
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
            </p>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgb(15, 15, 15)',
              fontWeight: 400,
              marginBottom: 0,
              marginTop: 0
            }}>
              <strong>Address:</strong> {COMPANY_INFO.address}
            </p>
          </div>
        </section>

        {/* Acknowledgment Section */}
        <section style={{
          padding: '32px',
          backgroundColor: 'rgb(245, 245, 245)',
          borderRadius: '8px',
          marginBottom: '48px'
        }}>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(84, 84, 84)',
            fontWeight: 400,
            marginBottom: 0,
            marginTop: 0,
            fontStyle: 'italic'
          }}>
            By using {COMPANY_INFO.name}'s services, you acknowledge that you have read and understood this Anti-Discrimination Policy. We are committed to creating an inclusive environment where every woman can access beauty and wellness services with dignity and respect.
          </p>
        </section>
      </div>
    </div>
  );
}
