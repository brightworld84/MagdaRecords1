import { ERROR_MESSAGES } from './constants';

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const defaultInvalidMessage = 'Password must be at least 8 characters and meet complexity requirements';

  if (password.length < 8) {
    return {
      isValid: false,
      errorMessage: ERROR_MESSAGES.INVALID_PASSWORD || defaultInvalidMessage,
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      errorMessage: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      errorMessage: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      errorMessage: 'Password must contain at least one number',
    };
  }

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
  if (!name || name.trim() === '') return false;
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(name);
};

// Validate date of birth format (MM/DD/YYYY)
export const validateDateOfBirth = (dob) => {
  const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!dobRegex.test(dob)) return false;

  const parts = dob.split('/');
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month - 1, day);
  const now = new Date();

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date > now ||
    year < now.getFullYear() - 120
  ) {
    return false;
  }

  return true;
};

// Validate phone number
export const validatePhone = (phone) => {
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

// Generic form validation helper
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = values[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !value) {
      errors[field] = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (value) {
      switch (fieldRules.type) {
        case 'email':
          if (!validateEmail(value)) {
            errors[field] = ERROR_MESSAGES.INVALID_EMAIL;
          }
          break;
        case 'password':
          const passwordCheck = validatePassword(value);
          if (!passwordCheck.isValid) {
            errors[field] = passwordCheck.errorMessage;
          }
          break;
        case 'date':
          if (!validateDateOfBirth(value)) {
            errors[field] = ERROR_MESSAGES.INVALID_DATE;
          }
          break;
      }
    }
  });

  return errors;
};
