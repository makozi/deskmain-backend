const crypto = require('crypto');

/**
 * Generate random string
 * @param {Number} length - String length
 * @returns {String} - Random string
 */
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

/**
 * Generate unique code (for referrals, coupons, etc)
 * @param {String} prefix - Code prefix
 * @returns {String} - Unique code
 */
function generateUniqueCode(prefix = '') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`.slice(0, 20);
}

/**
 * Calculate platform fee
 * @param {Number} amount - Transaction amount
 * @param {Number} feePercentage - Fee percentage (default 4%)
 * @returns {Number} - Fee amount
 */
function calculatePlatformFee(amount, feePercentage = 4) {
  return Math.round((amount * feePercentage) / 100 * 100) / 100;
}

/**
 * Calculate merchant earnings
 * @param {Number} amount - Order amount
 * @param {Number} feePercentage - Platform fee percentage
 * @returns {Number} - Merchant earnings
 */
function calculateMerchantEarnings(amount, feePercentage = 4) {
  const fee = calculatePlatformFee(amount, feePercentage);
  return amount - fee;
}

/**
 * Generate slug from text
 * @param {String} text - Text to slugify
 * @returns {String} - Slug
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate email format
 * @param {String} email - Email address
 * @returns {Boolean} - Is valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 * @param {String} phone - Phone number
 * @returns {Boolean} - Is valid phone
 */
function isValidPhone(phone) {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone?.replace(/\s/g, ''));
}

/**
 * Validate URL
 * @param {String} url - URL string
 * @returns {Boolean} - Is valid URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Truncate text
 * @param {String} text - Text to truncate
 * @param {Number} length - Max length
 * @returns {String} - Truncated text
 */
function truncateText(text, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Format currency
 * @param {Number} amount - Amount
 * @param {String} currency - Currency code
 * @param {String} locale - Locale (default: en-US)
 * @returns {String} - Formatted currency
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Convert to cent amount (for payment APIs)
 * @param {Number} amount - Dollar amount
 * @returns {Number} - Amount in cents
 */
function toCents(amount) {
  return Math.round(amount * 100);
}

/**
 * Convert from cent amount
 * @param {Number} cents - Amount in cents
 * @returns {Number} - Dollar amount
 */
function fromCents(cents) {
  return Math.round((cents / 100) * 100) / 100;
}

/**
 * Calculate pagination
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} - Offset and limit
 */
function getPaginationParams(page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  return { offset, limit: limitNum, page: pageNum };
}

/**
 * Format date
 * @param {Date|String} date - Date to format
 * @param {String} locale - Locale (default: en-US)
 * @returns {String} - Formatted date
 */
function formatDate(date, locale = 'en-US') {
  return new Date(date).toLocaleDateString(locale);
}

/**
 * Format datetime
 * @param {Date|String} date - Date to format
 * @param {String} locale - Locale (default: en-US)
 * @returns {String} - Formatted datetime
 */
function formatDateTime(date, locale = 'en-US') {
  return new Date(date).toLocaleString(locale);
}

/**
 * Get time ago string
 * @param {Date|String} date - Date
 * @returns {String} - Time ago string (e.g., "2 hours ago")
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
  return `${Math.floor(seconds)} second${Math.floor(seconds) !== 1 ? 's' : ''} ago`;
}

/**
 * Get country name from country code
 * @param {String} code - Country code (ISO 3166-1 alpha-2)
 * @returns {String} - Country name
 */
function getCountryName(code) {
  const countryNames = {
    NG: 'Nigeria',
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    IN: 'India',
    DE: 'Germany',
    FR: 'France',
    ZA: 'South Africa',
    KE: 'Kenya',
    // Add more as needed
  };

  return countryNames[code?.toUpperCase()] || code;
}

/**
 * Get currency symbol
 * @param {String} code - Currency code
 * @returns {String} - Currency symbol
 */
function getCurrencySymbol(code) {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    NGN: '₦',
    INR: '₹',
    // Add more as needed
  };

  return currencySymbols[code?.toUpperCase()] || code;
}

/**
 * Hash string (for storing references)
 * @param {String} text - Text to hash
 * @returns {String} - SHA256 hash
 */
function hashString(text) {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}

/**
 * Compare hash
 * @param {String} text - Original text
 * @param {String} hash - Hash to compare
 * @returns {Boolean} - Match status
 */
function compareHash(text, hash) {
  return hashString(text) === hash;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects
 * @param {...Object} objects - Objects to merge
 * @returns {Object} - Merged object
 */
function mergeObjects(...objects) {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}

module.exports = {
  generateRandomString,
  generateUniqueCode,
  calculatePlatformFee,
  calculateMerchantEarnings,
  generateSlug,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  truncateText,
  formatCurrency,
  toCents,
  fromCents,
  getPaginationParams,
  formatDate,
  formatDateTime,
  getTimeAgo,
  getCountryName,
  getCurrencySymbol,
  hashString,
  compareHash,
  deepClone,
  mergeObjects,
};
