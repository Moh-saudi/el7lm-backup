import { NextRequest, NextResponse } from 'next/server';

// دالة مساعدة لإنشاء FormData
const createFormData = (imageUrl: string | null, imageData: string | null, language: string) => {
  const formData = new FormData();
  
  if (imageData) {
    // إذا كانت البيانات مرسلة كـ base64، نحولها إلى blob
    const [mimeType, base64Data] = imageData.split(',');
    const binaryData = atob(base64Data);
    const uint8Array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    
    // تحديد نوع الملف من MIME type
    let fileType = 'JPG';
    let fileName = 'receipt.jpg';
    let contentType = 'image/jpeg';
    
    if (mimeType.includes('png')) {
      fileType = 'PNG';
      fileName = 'receipt.png';
      contentType = 'image/png';
    } else if (mimeType.includes('gif')) {
      fileType = 'GIF';
      fileName = 'receipt.gif';
      contentType = 'image/gif';
    } else if (mimeType.includes('webp')) {
      fileType = 'JPG'; // OCR.space لا يدعم WebP، نحوله إلى JPG
      fileName = 'receipt.jpg';
      contentType = 'image/jpeg';
    }
    
    const blob = new Blob([uint8Array], { type: contentType });
    formData.append('file', blob, fileName);
    formData.append('filetype', fileType);
  } else if (imageUrl) {
    // استخدام URL إذا كان متوفراً
    formData.append('url', imageUrl);
    formData.append('filetype', 'auto');
  }
  
  formData.append('language', language);
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');
  
  return formData;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, imageData } = body;

    if (!imageUrl && !imageData) {
      return NextResponse.json({ error: 'Image URL or image data is required' }, { status: 400 });
    }

    let result = null;
    let extractedText = '';

    // محاولة أولى باللغة العربية
    try {
      console.log('Trying OCR with Arabic language...');
      const arabicFormData = createFormData(imageUrl, imageData, 'ara');
      
      const arabicResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': 'helloworld', // API key مجاني للاختبار (محدود)
        },
        body: arabicFormData,
      });

      if (arabicResponse.ok) {
        const arabicResult = await arabicResponse.json();
        console.log('Arabic OCR result:', arabicResult);
        if (arabicResult.OCRExitCode === 1 && arabicResult.ParsedResults && arabicResult.ParsedResults.length > 0) {
          result = arabicResult;
          extractedText = arabicResult.ParsedResults[0]?.ParsedText || '';
          console.log('Arabic OCR succeeded, extracted text:', extractedText);
        } else {
          console.log('Arabic OCR failed with exit code:', arabicResult.OCRExitCode);
        }
      }
    } catch (arabicError) {
      console.log('Arabic OCR failed, trying English...', arabicError);
    }

    // محاولة ثانية باللغة الإنجليزية إذا فشلت العربية
    if (!result || !extractedText.trim()) {
      console.log('Trying OCR with English language...');
      const englishFormData = createFormData(imageUrl, imageData, 'eng');
      
      const englishResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': 'helloworld',
        },
        body: englishFormData,
      });

      if (!englishResponse.ok) {
        throw new Error(`OCR API responded with status: ${englishResponse.status}`);
      }

      result = await englishResponse.json();
      extractedText = result.ParsedResults?.[0]?.ParsedText || '';
    }

    // التحقق من نجاح المعالجة
    if (result.OCRExitCode !== 1 || !result.ParsedResults || result.ParsedResults.length === 0) {
      console.error('OCR API Error:', result);
      throw new Error(`OCR processing failed: ${result.ErrorMessage || result.ErrorDetails || 'No text found in image'}`);
    }

    // التأكد من وجود النص (إذا لم يتم تعيينه بعد)
    if (!extractedText) {
      extractedText = result.ParsedResults[0]?.ParsedText || '';
    }
    
    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from the image');
    }

    // تحويل الأرقام العربية إلى إنجليزية
    const convertArabicNumerals = (text: string): string => {
      const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
      const englishNumerals = '0123456789';
      
      let convertedText = text;
      for (let i = 0; i < arabicNumerals.length; i++) {
        const arabicRegex = new RegExp(arabicNumerals[i], 'g');
        convertedText = convertedText.replace(arabicRegex, englishNumerals[i]);
      }
      return convertedText;
    };

    // تحويل النص وإزالة الفواصل والرموز الإضافية
    const convertedText = convertArabicNumerals(extractedText);
    const cleanedText = convertedText
      .replace(/[,،]/g, '') // إزالة الفواصل العربية والإنجليزية
      .replace(/[*]/g, '') // إزالة النجوم
      .replace(/[#]/g, '') // إزالة الرموز
      .replace(/\s+/g, ' '); // تنظيف المسافات الزائدة
    
    // البحث المحسن عن الأرقام مع دعم الكلمات العربية
    const numbers = [];
    
    // البحث عن الأرقام العادية
    const regularNumbers = cleanedText.match(/\d+(?:\.\d+)?/g) || [];
    numbers.push(...regularNumbers);
    
    // البحث عن الأرقام بجانب كلمات مثل "جنيه" أو "ريال" أو "SAR"
    const currencyPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:جنيه|جنية|ريال|درهم|SAR|EGP|AED)/gi,
      /(?:جنيه|جنية|ريال|درهم|SAR|EGP|AED)\s*(\d+(?:\.\d+)?)/gi,
      /(\d+(?:\.\d+)?)\s*(?:ج|ر|د)/gi // اختصارات العملات
    ];
    
    currencyPatterns.forEach(pattern => {
      const matches = cleanedText.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) numbers.push(match[1]);
      }
    });
    
    const amounts = numbers.map(parseFloat).filter(n => !isNaN(n) && n > 0);
    
    // إزالة المكررات وترتيب الأرقام
    const uniqueAmounts = [...new Set(amounts)].sort((a, b) => b - a);

    return NextResponse.json({
      success: true,
      text: extractedText,
      convertedText: convertedText, // النص بعد تحويل الأرقام العربية
      cleanedText: cleanedText, // النص بعد التنظيف
      amounts: uniqueAmounts,
      allNumbers: amounts, // جميع الأرقام المستخرجة قبل إزالة المكررات
      confidence: result.ParsedResults[0]?.TextOrientation || 'N/A',
      processingTimeMs: result.ProcessingTimeInMilliseconds || 0,
      languageUsed: result.ParsedResults[0]?.FileParseExitCode === 1 ? 'Arabic' : 'English'
    });

  } catch (error) {
    console.error('OCR Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process image with OCR', 
      details: errorMessage 
    }, { status: 500 });
  }
}
