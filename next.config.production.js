/** @type {import('next').NextConfig} */
const nextConfig = {
  // إعدادات Production
  env: {
    BEON_API_TOKEN: process.env.BEON_API_TOKEN,
    BEON_BASE_URL: process.env.BEON_BASE_URL,
    BEON_SMS_TOKEN: process.env.BEON_SMS_TOKEN,
    BEON_WHATSAPP_TOKEN: process.env.BEON_WHATSAPP_TOKEN,
    BEON_OTP_TOKEN: process.env.BEON_OTP_TOKEN,
    BEON_SENDER_NAME: process.env.BEON_SENDER_NAME,
    ENABLE_SMS_SIMULATION: 'false',
    ENABLE_WHATSAPP_SIMULATION: 'false'
  },
  
  // إعدادات الأمان
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
