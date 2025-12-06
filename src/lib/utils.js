import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TAX_FEE_SLABS = [
  { max: 400, fee: 59 },
  { max: 800, fee: 78 },
  { max: 1200, fee: 97 },
  { max: 1500, fee: 109 },
  { max: 2000, fee: 119 },
  { max: 2500, fee: 138 },
  { max: 3000, fee: 167 },
  { max: 3500, fee: 188 },
  { max: 4000, fee: 209 },
  { max: 5000, fee: 249 },
  { max: 6000, fee: 269 },
];

export function calculateTaxFee(amount) {
  const value = Math.max(Number(amount) || 0, 0);
  if (value === 0) return 0;

  for (const slab of TAX_FEE_SLABS) {
    if (value <= slab.max) {
      return slab.fee;
    }
  }

  return 279;
}

/**
 * Sanitize a string for use in URLs
 * Converts to lowercase, replaces spaces and special characters with hyphens
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitizeForUrl(str) {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    // Replace spaces and common special characters with hyphens
    .replace(/[\s_()[\]{}&@#%$*+=|\\/:;"'<>?,!~`]/g, '-')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}
