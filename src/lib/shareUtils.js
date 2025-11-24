/**
 * Social Sharing Utilities
 * Provides one-click sharing to WhatsApp, Instagram, Facebook, and copy link
 */

/**
 * Generate shareable service URL
 */
export function getServiceShareUrl(serviceId, serviceName) {
  const baseUrl = window.location.origin;
  const encodedName = encodeURIComponent(serviceName || '');
  return `${baseUrl}/service/${serviceId}`;
}

/**
 * Generate share message for service
 * Creates a structured, visually appealing message for WhatsApp and other platforms
 * Uses diamond symbol (◆) for consistent display across all devices
 */
export function getServiceShareMessage(service) {
  const serviceName = service.name || 'Service';
  const price = service.productCost || service.marketPrice || service.price || '';
  const duration = service.durationMinutes ? `${service.durationMinutes} mins` : '';
  const brand = service.brand || '';
  const tier = service.tier || '';
  
  // Build structured message with proper formatting
  // Using diamond symbol (◆) for consistent display
  let message = `◆ *Check out this amazing service at Minuteserv!*\n\n`;
  
  // Service details section
  message += `*${serviceName}*\n`;
  
  if (brand) {
    message += `◆ Brand: ${brand}\n`;
  }
  
  if (tier) {
    message += `◆ Tier: ${tier}\n`;
  }
  
  if (price) {
    message += `◆ Price: ₹${price}\n`;
  }
  
  if (duration) {
    message += `◆ Duration: ${duration}\n`;
  }
  
  // Call to action
  message += `\n◆ *Book now and get salon-quality service at your doorstep!*\n\n`;
  message += `◆ `;
  
  return message;
}

/**
 * Share to WhatsApp
 * Creates a beautifully formatted message with structured layout
 */
export function shareToWhatsApp(service, serviceId) {
  const url = getServiceShareUrl(serviceId, service.name);
  const message = getServiceShareMessage(service);
  const fullMessage = `${message}${url}\n\n◆ *Minuteserv* - Your Beauty, Your Time, Your Way`;
  
  // WhatsApp Web/App URL scheme
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
  
  // Open in new window (mobile will open app, desktop will open web)
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  
  return true;
}

/**
 * Share to Instagram (Stories)
 * Note: Instagram doesn't support direct web sharing, so we'll use copy link + instructions
 * For mobile apps, we can use instagram:// URL scheme
 */
export async function shareToInstagram(service, serviceId) {
  const url = getServiceShareUrl(serviceId, service.name);
  
  // Check if on mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Copy link to clipboard (async)
  const copied = await copyToClipboard(url);
  
  if (isMobile) {
    // Try to open Instagram app (if installed) - non-blocking
    setTimeout(() => {
      try {
        // This will only work if Instagram app is installed
        window.location.href = `instagram://camera`;
      } catch (e) {
        // Instagram app not installed, that's okay
      }
    }, 100);
    
    return {
      success: copied,
      message: copied ? 'Link copied! Open Instagram and paste it in your story.' : 'Failed to copy link',
      url: url
    };
  } else {
    // Desktop: Copy link and show instructions
    return {
      success: copied,
      message: copied ? 'Link copied! Share it on Instagram.' : 'Failed to copy link',
      url: url
    };
  }
}

/**
 * Share to Facebook
 */
export function shareToFacebook(service, serviceId) {
  const url = getServiceShareUrl(serviceId, service.name);
  const serviceName = service.name || 'Service';
  const price = service.productCost || service.marketPrice || service.price || '';
  const quote = `✨ Check out ${serviceName}${price ? ` for just ₹${price}` : ''} at Minuteserv! Book now and get salon-quality service at your doorstep!`;
  
  // Facebook Share Dialog
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`;
  
  window.open(facebookUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  
  return true;
}

/**
 * Share to Twitter/X
 */
export function shareToTwitter(service, serviceId) {
  const url = getServiceShareUrl(serviceId, service.name);
  const serviceName = service.name || 'Service';
  const price = service.productCost || service.marketPrice || service.price || '';
  const text = `✨ Check out ${serviceName}${price ? ` for just ₹${price}` : ''} at Minuteserv! 💅 Book now: ${url}`;
  
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  
  return true;
}

/**
 * Copy link to clipboard
 */
export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => {
      return true;
    }).catch(() => {
      // Fallback for older browsers
      return fallbackCopyToClipboard(text);
    });
  } else {
    return Promise.resolve(fallbackCopyToClipboard(text));
  }
}

/**
 * Fallback copy to clipboard for older browsers
 */
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
}

/**
 * Share via native share API (if available)
 */
export async function shareViaNative(service, serviceId) {
  const url = getServiceShareUrl(serviceId, service.name);
  const message = getServiceShareMessage(service);
  const fullText = `${message}${url}\n\n💅 Minuteserv - Your Beauty, Your Time, Your Way`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${service.name} - Minuteserv`,
        text: fullText,
        url: url,
      });
      return { success: true };
    } catch (error) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return { success: false, error: error.message };
    }
  } else {
    // Fallback to copy link
    const copied = await copyToClipboard(url);
    return { 
      success: copied, 
      message: copied ? 'Link copied to clipboard!' : 'Failed to copy link'
    };
  }
}

/**
 * Generate service ID for sharing (consistent with routing)
 */
export function generateServiceId(service, tier, category) {
  if (service.id && service.id.length > 20) {
    // Likely a UUID from database
    return service.id;
  }
  // Generate route-based ID
  return `${tier}-${category}-${service.name}`.toLowerCase().replace(/\s+/g, '-');
}

