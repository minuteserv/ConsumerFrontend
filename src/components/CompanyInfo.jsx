import { Phone, MapPin, Mail, Star } from 'lucide-react';
import { COMPANY_INFO } from '../lib/constants';
import { Button } from '@/components/ui/button';

export function CompanyInfo() {
  const handleCall = () => {
    window.location.href = `tel:${COMPANY_INFO.phone}`;
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_INFO.address)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: COMPANY_INFO.name,
          text: `Check out ${COMPANY_INFO.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-dark-text mb-2">{COMPANY_INFO.name}</h2>
      <p className="text-secondary text-gray-600 mb-4">
        Beauty Services • {COMPANY_INFO.address.split(',')[0]}
      </p>
      
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-primary fill-primary" />
        <span className="font-semibold text-primary">4.1</span>
        <span className="text-secondary text-gray-500">5k+ ratings</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={handleCall}
          className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Phone className="w-5 h-5 text-primary" />
          <span className="text-xs text-secondary">Call</span>
        </button>
        <button
          onClick={handleDirections}
          className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-xs text-secondary">Directions</span>
        </button>
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-xs text-secondary">Share</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-xs text-secondary">Favorite</span>
        </button>
      </div>

      <div className="space-y-1 text-sm text-secondary">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{COMPANY_INFO.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-primary">
            {COMPANY_INFO.phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-primary">
            {COMPANY_INFO.email}
          </a>
        </div>
      </div>
    </div>
  );
}
