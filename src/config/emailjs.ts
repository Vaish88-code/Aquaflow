// EmailJS Configuration
// Updated with your actual EmailJS credentials

export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'UWE0iseZuRfY4R_Hj', // Your EmailJS public key
  PRIVATE_KEY: '_S97oDpctkJm9jKLsHGp5', // Your EmailJS private key
  SERVICE_ID: 'service_zzzodkt', // Your EmailJS service ID
  TEMPLATE_ID: 'template_6avc2ul', // Your EmailJS template ID for verification emails
};

// Email template variables that will be sent to EmailJS
export interface EmailTemplateParams {
  to_email: string;
  to_name: string;
  verification_code: string;
  company_name: string;
  from_name: string;
  reply_to?: string;
  user_email?: string;
}

// Default template parameters
export const DEFAULT_EMAIL_PARAMS = {
  company_name: 'AquaFlow',
  from_name: 'AquaFlow Team',
};