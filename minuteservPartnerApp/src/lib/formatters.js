/**
 * Formatting utilities
 */

/**
 * Format currency
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format time
 */
export function formatTime(timeString) {
  if (!timeString) return '-';
  // Handle both "HH:MM:SS" and "HH:MM" formats
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Format date and time together
 */
export function formatDateTime(dateString, timeString) {
  const date = formatDate(dateString);
  const time = formatTime(timeString);
  return `${date} at ${time}`;
}

/**
 * Calculate time remaining
 */
export function getTimeRemaining(targetDate, targetTime) {
  if (!targetDate || !targetTime) return null;
  
  const now = new Date();
  const [hours, minutes] = targetTime.split(':');
  const target = new Date(targetDate);
  target.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
  const diff = target - now;
  
  if (diff < 0) return null;
  
  const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hoursRemaining > 24) {
    const days = Math.floor(hoursRemaining / 24);
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  }
  
  if (hoursRemaining > 0) {
    return `${hoursRemaining}h ${minutesRemaining}m remaining`;
  }
  
  return `${minutesRemaining}m remaining`;
}

/**
 * Format duration in minutes to readable format
 */
export function formatDuration(minutes) {
  if (!minutes) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

