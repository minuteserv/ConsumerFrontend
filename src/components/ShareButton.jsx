import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Share2, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Twitter, 
  Link2, 
  Copy,
  Check
} from 'lucide-react';
import {
  shareToWhatsApp,
  shareToInstagram,
  shareToFacebook,
  shareToTwitter,
  shareViaNative,
  copyToClipboard,
  getServiceShareUrl,
  generateServiceId,
} from '../lib/shareUtils';

/**
 * ShareButton Component
 * Provides one-click sharing to multiple social platforms
 */
export function ShareButton({ service, tier, category, variant = 'outline', size = 'sm', className = '' }) {
  const [copied, setCopied] = useState(false);
  
  // Generate service ID for sharing
  const serviceId = generateServiceId(service, tier || service.tier, category || service.category);
  
  const showNotification = (message) => {
    // Simple notification - you can enhance this later
    console.log('Share notification:', message);
  };
  
  const handleShare = async (platform) => {
    try {
      let result;
      
      switch (platform) {
        case 'whatsapp':
          shareToWhatsApp(service, serviceId);
          showNotification('Opening WhatsApp...');
          break;
          
        case 'instagram':
          result = await shareToInstagram(service, serviceId);
          if (result && result.success) {
            showNotification(result.message || 'Link copied! Paste it in your Instagram story');
          }
          break;
          
        case 'facebook':
          shareToFacebook(service, serviceId);
          showNotification('Opening Facebook...');
          break;
          
        case 'twitter':
          shareToTwitter(service, serviceId);
          showNotification('Opening Twitter...');
          break;
          
        case 'native':
          result = await shareViaNative(service, serviceId);
          if (result && result.success) {
            showNotification('Shared successfully!');
          } else if (result && result.message) {
            showNotification(result.message);
          }
          break;
          
        case 'copy':
          const url = getServiceShareUrl(serviceId, service.name);
          const success = copyToClipboard(url);
          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            showNotification('Link copied to clipboard!');
          } else {
            showNotification('Failed to copy link');
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showNotification('Failed to share. Please try again.');
    }
  };

  // Check if native share is available (mobile devices)
  const isNativeShareAvailable = typeof navigator !== 'undefined' && navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`flex items-center gap-2 ${className}`}
          onClick={(e) => {
            // Prevent event bubbling
            e.stopPropagation();
          }}
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Native Share (Mobile) */}
        {isNativeShareAvailable && (
          <>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleShare('native');
              }}
              className="cursor-pointer"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share via...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* WhatsApp */}
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleShare('whatsapp');
          }}
          className="cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        
        {/* Instagram */}
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleShare('instagram');
          }}
          className="cursor-pointer"
        >
          <Instagram className="w-4 h-4 mr-2 text-pink-600" />
          Instagram
        </DropdownMenuItem>
        
        {/* Facebook */}
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleShare('facebook');
          }}
          className="cursor-pointer"
        >
          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        
        {/* Twitter */}
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleShare('twitter');
          }}
          className="cursor-pointer"
        >
          <Twitter className="w-4 h-4 mr-2 text-blue-400" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Copy Link */}
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleShare('copy');
          }}
          className="cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Simple Share Button (Icon only, no dropdown)
 * For compact spaces
 */
export function ShareButtonIcon({ service, tier, category, className = '' }) {
  const serviceId = generateServiceId(service, tier || service.tier, category || service.category);
  
  const handleQuickShare = async () => {
    // Try native share first, fallback to WhatsApp
    const isNativeShareAvailable = typeof navigator !== 'undefined' && navigator.share;
    
    if (isNativeShareAvailable) {
      const result = await shareViaNative(service, serviceId);
      if (!result.success) {
        // Fallback to WhatsApp
        shareToWhatsApp(service, serviceId);
      }
    } else {
      // Desktop: Open WhatsApp Web
      shareToWhatsApp(service, serviceId);
    }
  };
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleQuickShare();
      }}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      aria-label="Share service"
    >
      <Share2 className="w-5 h-5 text-gray-600" />
    </button>
  );
}

