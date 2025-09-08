'use client';

import Script from 'next/script';

interface ClarityScriptProps {
  projectId: string;
}

/**
 * مكون لتحميل Microsoft Clarity Script
 * بناءً على الكود الرسمي من Microsoft
 */
const ClarityScript: React.FC<ClarityScriptProps> = ({ projectId }) => {
  if (!projectId || projectId === 'your_clarity_project_id_here') {
    console.warn('⚠️ Clarity Project ID غير صحيح:', projectId);
    return null;
  }

  return (
    <Script
      id="clarity-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");
        `
      }}
    />
  );
};

export default ClarityScript;

