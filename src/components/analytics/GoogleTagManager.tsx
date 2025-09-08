'use client';

import Script from 'next/script';

interface GoogleTagManagerProps {
  gtmId: string;
}

/**
 * مكون Google Tag Manager
 * لإدارة جميع أدوات التحليلات والتتبع
 */
const GoogleTagManager: React.FC<GoogleTagManagerProps> = ({ gtmId }) => {
  if (!gtmId || gtmId === 'GTM-XXXXXXX') {
    console.warn('⚠️ Google Tag Manager ID غير صحيح:', gtmId);
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - Head */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `
        }}
      />
      
      {/* Google Tag Manager - NoScript */}
      <noscript>
        <iframe 
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
};

export default GoogleTagManager;

