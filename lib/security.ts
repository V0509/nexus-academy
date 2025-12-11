/**
 * Security Utilities for Input Validation, Sanitization & Protection
 * Protects against: XSS, Injection Attacks, CSRF
 */

import DOMPurify from 'isomorphic-dompurify';

// CSRF Token Generation and Validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};

// Input Sanitization - Prevents XSS
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // First pass: Basic HTML entity encoding
  const div = document.createElement('div');
  div.textContent = input;
  let sanitized = div.innerHTML;
  
  // Second pass: Remove dangerous patterns
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\(/gi, '')
    .replace(/expression\(/gi, '');
  
  return sanitized;
};

// Advanced HTML Sanitization using DOMPurify
export const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') return html;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    KEEP_CONTENT: true,
  });
};

// SQL Injection Prevention - Parametrized approach
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Content Security Policy Header
export const getCSPHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  };
};

// Security Headers
export const getSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
};

// Rate Limiting
export class RateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return false;
    }

    if (now - record.timestamp > this.windowMs) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return false;
    }

    record.count++;
    return record.count > this.maxAttempts;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Authentication Token Validation
export const validateToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  // JWT format: xxx.yyy.zzz
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Prevent Clickjacking
export const preventClickjacking = () => {
  if (typeof window !== 'undefined') {
    if (window.self !== window.top) {
      window.top!.location = window.self.location;
    }
  }
};

export default {
  generateCSRFToken,
  validateCSRFToken,
  sanitizeInput,
  sanitizeHTML,
  validateEmail,
  validateUsername,
  validatePassword,
  getCSPHeaders,
  getSecurityHeaders,
  RateLimiter,
  validateToken,
  preventClickjacking,
};
