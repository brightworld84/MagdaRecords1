// Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate password strength
  export const validatePassword = (password) => {
    // Check password length
    if (password.length < 8) {
      return {
        isValid: false,
        errorMessage: 'Password must be at least 8 characters long',
      };
    }
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        errorMessage: 'Password must contain at least one uppercase letter',
      };
    }
    
    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        errorMessage: 'Password must contain at least one lowercase letter',
      };
    }
    
    // Check for number
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        errorMessage: 'Password must contain at least one number',
      };
    }
    
    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        errorMessage: 'Password must contain at least one special character',
      };
    }
    
    return {
      isValid: true,
      errorMessage: '',
    };
  };
  
  // Validate name (not empty and no numbers or special characters)
  export const validateName = (name) => {
    if (!name || name.trim() === '') {
      return false;
    }
    
    // Check that the name contains only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(name);
  };
  
  // Validate date of birth format (MM/DD/YYYY)
  export const validateDateOfBirth = (dob) => {
    // Check format
    const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dobRegex.test(dob)) {
      return false;
    }
    
    // Parse date
    const parts = dob.split('/');
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    // Check if date is valid
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return false;
    }
    
    // Check if date is in the past and not more than 120 years ago
    const now = new Date();
    if (date > now || year < now.getFullYear() - 120) {
      return false;
    }
    
    return true;
  };
  
  // Validate phone number
  export const validatePhone = (phone) => {
    // Allow various formats like (123) 456-7890, 123-456-7890, 1234567890
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };
  
  // Validate URL
  export const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  import { ERROR_MESSAGES } from './constants';
  
  // Email validation
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Password validation
  export const isValidPassword = (password) => {
    return password && password.length >= 8;
  };
  
  // Name validation
  export const isValidName = (name) => {
    return name && name.trim().length > 0;
  };
  
  // Date validation
  export const isValidDate = (date) => {
    if (!date) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  };
  
  // Form validation
  export const validateForm = (values, rules) => {
    const errors = {};
  
    Object.keys(rules).forEach(field => {
      const value = values[field];
      const fieldRules = rules[field];
  
      if (fieldRules.required && !value) {
        errors[field] = ERROR_MESSAGES.REQUIRED_FIELD;
      } else if (value) {
        switch (fieldRules.type) {
          case 'email':
            if (!isValidEmail(value)) {
              errors[field] = ERROR_MESSAGES.INVALID_EMAIL;
            }
            break;
          case 'password':
            if (!isValidPassword(value)) {
              errors[field] = ERROR_MESSAGES.INVALID_PASSWORD;
            }
            break;
          case 'date':
            if (!isValidDate(value)) {
              errors[field] = ERROR_MESSAGES.INVALID_DATE;
            }
            break;
        }
      }
    });
  
    return errors;
  };
  