'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Search, 
  Phone, 
  MessageSquare, 
  Users, 
  RefreshCw,
  Trash2,
  Database,
  Download,
  FileText,
  Shield
} from 'lucide-react';
import { AccountTypeProtection } from '@/hooks/useAccountTypeAuth';
import { useEmployeePermissions, PermissionGuard, PermissionsInfo } from '@/hooks/useEmployeePermissions';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'registered' | 'potential' | 'vip';
  group: string;
  date: string;
  status: 'active' | 'inactive' | 'pending';
  country?: string;
  countryCode?: string;
  displayName?: string;
  isMyContact?: boolean;
  savedName?: string;
  groupName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastAction?: string;
  lastActionDate?: Date;
  lastActionBy?: string;
  leadScore?: number;
  // New tracking fields
  contactStatus?: 'not_contacted' | 'contacted' | 'interested' | 'not_interested' | 'registered';
  contactHistory?: ContactRecord[];
  lastContactDate?: Date;
  contactCount?: number;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

interface ContactRecord {
  id: string;
  type: 'call' | 'whatsapp' | 'email' | 'visit';
  date: Date;
  status: 'success' | 'no_answer' | 'busy' | 'wrong_number' | 'not_interested';
  notes?: string;
  employeeName: string;
  duration?: number; // for calls
  message?: string; // for whatsapp/email
}

export default function CustomerManagementPage() {
  const { user, userData } = useAuth();
  const { permissions, role, loading: permissionsLoading } = useEmployeePermissions();
  
  // إضافة console.log للتصحيح
  console.log('🔍 CustomerManagementPage - userData:', userData);
  console.log('🔍 CustomerManagementPage - permissions:', permissions);
  console.log('🔍 CustomerManagementPage - role:', role);
  console.log('🔍 CustomerManagementPage - canEditCustomers:', permissions?.canEditCustomers);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'registered' | 'potential' | 'vip'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showMessageTemplates, setShowMessageTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [contactType, setContactType] = useState<'call' | 'whatsapp' | 'email' | 'visit'>('call');
  const [contactStatus, setContactStatus] = useState<'success' | 'no_answer' | 'busy' | 'wrong_number' | 'not_interested'>('success');
  const [contactNotes, setContactNotes] = useState('');
  const [filterContactStatus, setFilterContactStatus] = useState<'all' | 'not_contacted' | 'contacted' | 'interested' | 'not_interested' | 'registered'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  
  // Editing state
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Message templates
  const messageTemplates = {
    welcome: {
      title: 'رسالة ترحيب عامة',
      content: 'مرحباً! أنا من منصة الحلم لاكتشاف المواهب الكروية. كيف يمكنني مساعدتك اليوم؟'
    },
    parentCall: {
      title: 'نموذج مكالمة مع ولي الأمر',
      content: `🎙 نموذج مكالمة مع ولي الأمر

👨‍💼 الموظف:
السلام عليكم يا فندم، أنا [اسم الموظف] من منصة الحلم لاكتشاف المواهب الكروية. أخبار حضرتك إيه؟

👨‍👩‍👦 ولي الأمر (رد عادي).

👨‍💼 الموظف:
حضرتك عندك ابن بيلعب كورة، صح؟ 👌
إحنا عاملين منصة بتجمع الأكاديميات والأندية في مكان واحد، علشان كل لاعب موهوب يقدر يتشاف أسرع. يعني بدل ما تدور أو تستنى صدفة، ابنك هيبقى قدام عيون الأندية مباشرة.

👨‍💼 الموظف (إضافة قيمة):
كمان حضرتك تقدر تتابع ملف ابنك، فيديوهاته، والمباريات اللي بيشارك فيها. ولو اتسجل من خلال أكاديمية أو نادي بياخد فرص أكبر للانضمام لبطولاتنا التسويقية اللي بيحضرها كشافين أندية.

👨‍💼 الموظف (دعوة مباشرة):
إحنا عاملين تسجيل بسيط وسريع، ينفع أشرحلك إزاي نسجّل لابنك دلوقتي علشان يبقى متشاف من الأندية والأكاديميات؟`
    },
    playerCall: {
      title: 'نموذج مكالمة مع اللاعب',
      content: `🎙 نموذج مكالمة مع اللاعب (لو أكبر من 16 سنة مثلاً)

👨‍💼 الموظف:
إزيك يا بطل، أنا [اسم الموظف] من منصة الحلم. سمعت إنك بتلعب كورة. تمام كده؟

👦 اللاعب (يرد).

👨‍💼 الموظف:
بص، المنصة بتاعتنا بتخليك تعمل بروفايل زي السيرة الذاتية بس كروية ⚽. يعني الأندية والأكاديميات يقدروا يشوفوا إحصائياتك وفيديوهاتك، وكمان ممكن تشارك في ماتشات وبطولات بننظمها علشان الكشافين يختاروا لاعبين جداد.

👨‍💼 الموظف (دعوة مباشرة):
تحب أشرحلك إزاي تسجّل دلوقتي وتبدأ تحط بياناتك وفيديوهاتك؟`
    },
    followUp: {
      title: 'رسالة متابعة',
      content: 'مرحباً مرة تانية! أتمنى تكون بخير. هل فكرت في التسجيل في منصة الحلم؟ نحن هنا لمساعدتك في أي خطوة.'
    },
    reminder: {
      title: 'رسالة تذكير',
      content: 'تذكير ودود: لا تفوت فرصة ابنك في الظهور أمام الأندية والأكاديميات! سجل الآن في منصة الحلم.'
    }
  };

  // Format phone number function
  const formatPhoneNumber = (phone: string, country?: string, countryCode?: string): string => {
    if (!phone || typeof phone !== 'string') {
      return '';
    }
    
    // Remove all non-digit characters and spaces
    let cleanPhone = phone.replace(/[^\d]/g, '');
    cleanPhone = cleanPhone.replace(/\s/g, '');
    
    // Handle international format starting with 00
    if (cleanPhone.startsWith('00')) {
      cleanPhone = cleanPhone.substring(2);
      return '+' + cleanPhone;
    }
    
    // Get country code from parameters
    let targetCountryCode = '';
    if (countryCode) {
      targetCountryCode = countryCode.replace('+', '');
    } else if (country) {
      const countryCodes: { [key: string]: string } = {
        'Egypt': '20', 'Saudi Arabia': '966', 'UAE': '971', 'Kuwait': '965',
        'Oman': '968', 'Bahrain': '973', 'Qatar': '974', 'Jordan': '962',
        'Lebanon': '961', 'Syria': '963', 'Iraq': '964', 'Yemen': '967',
        'Sudan': '249', 'Morocco': '212', 'Algeria': '213', 'Tunisia': '216', 'Libya': '218'
      };
      targetCountryCode = countryCodes[country] || '';
    }
    
    // Special handling for Egyptian numbers (remove extra 2 after country code)
    if (targetCountryCode === '20' && cleanPhone.startsWith('202')) {
      // Remove the extra 2 after country code (202 -> 20)
      cleanPhone = '20' + cleanPhone.substring(3);
    }
    
    // Handle Egyptian numbers that start with 2 (common format: 2 0128811)
    if (targetCountryCode === '20' && cleanPhone.startsWith('2') && cleanPhone.length > 9) {
      // Remove the leading 2 and add country code
      cleanPhone = '20' + cleanPhone.substring(1);
    }
    
    // Check if phone already starts with country code
    if (targetCountryCode && cleanPhone.startsWith(targetCountryCode)) {
      // Phone already has country code, just add +
      return '+' + cleanPhone;
    }
    
    // Check if phone starts with any known country code
    const knownCountryCodes = ['20', '966', '971', '965', '968', '973', '974', '962', '961', '963', '964', '967', '249', '212', '213', '216', '218'];
    for (const code of knownCountryCodes) {
      if (cleanPhone.startsWith(code)) {
        // Phone already has a country code
        return '+' + cleanPhone;
      }
    }
    
    // Add country code if we have one and phone doesn't already have it
    if (targetCountryCode) {
      return '+' + targetCountryCode + cleanPhone;
    }
    
    // If no country code available, return as is with +
    return '+' + cleanPhone;
  };

  // Load customers from Firebase
  const loadCustomersFromFirebase = async () => {
    try {
      setIsLoading(true);
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      
      setCustomers(customersData);
      console.log(`تم جلب ${customersData.length} عميل من Firebase`);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process file data
  const processFileData = async (data: any[]) => {
    try {
      setUploadProgress(85);
      setUploadMessage('جاري معالجة البيانات...');
      
      const newCustomers: Omit<Customer, 'id'>[] = data.map((row: any, index: number) => {
        const name = String(row['Contact\'s Public Display Name'] || row['Name'] || row['Name'] || `Customer ${index + 1}`);
        const phone = String(row['Phone Number'] || row['Phone'] || row['Phone'] || '');
        const email = String(row['Email'] || row['Email'] || '');
        const country = String(row['Country'] || row['Country'] || '');
        const countryCode = String(row['Country Code'] || row['Country Code'] || '');
        const displayName = String(row['Contact\'s Public Display Name'] || row['Display Name'] || name);
        const savedName = String(row['Saved Name'] || row['Saved Name'] || '');
        const groupName = String(row['Group Name'] || row['Group Name'] || '');
        const isMyContact = Boolean(row['is My Contact'] || row['Is My Contact'] || false);

        const formattedPhone = formatPhoneNumber(phone, country, countryCode);
        
        return {
          name,
          phone: formattedPhone,
          email,
          type: 'potential' as const,
          group: groupName || 'General',
          date: new Date().toISOString(),
          status: 'active' as const,
          country,
          countryCode,
          displayName,
          isMyContact,
          savedName,
          groupName,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      setUploadProgress(90);
      setUploadMessage(`جاري حفظ ${newCustomers.length} عميل...`);

      for (let i = 0; i < newCustomers.length; i++) {
        await addDoc(collection(db, 'customers'), newCustomers[i]);
        const progress = 90 + Math.round((i / newCustomers.length) * 5);
        setUploadProgress(progress);
        setUploadMessage(`جاري حفظ العميل ${i + 1} من ${newCustomers.length}...`);
      }

      setUploadProgress(95);
      setUploadMessage('جاري تحديث البيانات...');
      
      await loadCustomersFromFirebase();
      
      setUploadProgress(100);
      setUploadMessage(`تم رفع ${newCustomers.length} عميل بنجاح!`);
      
      // Show success message
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadMessage('');
        alert(`تم رفع ${newCustomers.length} عميل بنجاح!`);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing data:', error);
      setUploadMessage('خطأ في معالجة البيانات');
      setIsUploading(false);
      setUploadProgress(0);
      alert(`خطأ في معالجة البيانات: ${error}`);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset upload state
    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage('جاري قراءة الملف...');

    const reader = new FileReader();
    
    reader.onloadstart = () => {
      setUploadProgress(10);
      setUploadMessage('بدء قراءة الملف...');
    };

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 50) + 10;
        setUploadProgress(progress);
        setUploadMessage(`جاري قراءة الملف... ${progress}%`);
      }
    };

    reader.onload = async (e) => {
      try {
        setUploadProgress(60);
        setUploadMessage('جاري معالجة البيانات...');
        
        const data = e.target?.result;
        if (!data) {
          throw new Error('فشل في قراءة الملف');
        }

        if (file.name.endsWith('.csv')) {
          Papa.parse(data as string, {
            header: true,
            complete: (results) => {
              setUploadProgress(80);
              setUploadMessage('جاري حفظ البيانات...');
              processFileData(results.data);
            },
            error: (error) => {
              console.error('Error reading CSV file:', error);
              setUploadMessage('خطأ في قراءة ملف CSV');
              setIsUploading(false);
              setUploadProgress(0);
              alert('خطأ في قراءة ملف CSV');
            }
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setUploadProgress(80);
          setUploadMessage('جاري حفظ البيانات...');
          processFileData(jsonData);
        } else {
          throw new Error('نوع الملف غير مدعوم');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadMessage('خطأ في معالجة الملف');
        setIsUploading(false);
        setUploadProgress(0);
        alert(`خطأ في معالجة الملف: ${error}`);
      }
    };

    reader.onerror = () => {
      setUploadMessage('خطأ في قراءة الملف');
      setIsUploading(false);
      setUploadProgress(0);
      alert('خطأ في قراءة الملف');
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // Remove duplicates
  const removeDuplicates = () => {
    const confirmed = confirm('هل تريد إزالة التكرارات من البيانات؟');
    if (!confirmed) return;
    
    const uniqueCustomers = customers.filter((customer, index, self) => 
      index === self.findIndex(c => c.phone === customer.phone)
    );
    
    if (uniqueCustomers.length < customers.length) {
      setCustomers(uniqueCustomers);
      alert(`تم إزالة ${customers.length - uniqueCustomers.length} تكرار بنجاح`);
    } else {
      alert('لم يتم العثور على تكرارات');
    }
  };

  // Test phone number formatting
  const testPhoneFormatting = () => {
    const testCases = [
      { input: '+20 2 0128811', country: 'Egypt', expected: '+20128811' },
      { input: '2020128811', country: 'Egypt', expected: '+20128811' },
      { input: '2 0128811', country: 'Egypt', expected: '+20128811' },
      { input: '0128811', country: 'Egypt', expected: '+20128811' },
      { input: '+966 966123456', country: 'Saudi Arabia', expected: '+966123456' },
      { input: '966123456', country: 'Saudi Arabia', expected: '+966123456' },
    ];
    
    console.log('=== اختبار تنسيق أرقام الهواتف ===');
    testCases.forEach((testCase, index) => {
      const result = formatPhoneNumber(testCase.input, testCase.country);
      const status = result === testCase.expected ? '✅ نجح' : '❌ فشل';
      console.log(`${index + 1}. ${status} | المدخل: "${testCase.input}" | الناتج: "${result}" | المتوقع: "${testCase.expected}"`);
    });
    console.log('=== نهاية الاختبار ===');
    
    alert('تحقق من console المتصفح لرؤية نتائج الاختبار');
  };

  // Fix phone numbers in existing data
  const fixPhoneNumbers = async () => {
    const confirmed = confirm('سيتم إصلاح تنسيق أرقام الهواتف لجميع العملاء الموجودين. هل تريد المتابعة؟');
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      
      let fixedCount = 0;
      for (const doc of snapshot.docs) {
        const customerData = doc.data();
        const originalPhone = customerData.phone;
        const fixedPhone = formatPhoneNumber(originalPhone, customerData.country, customerData.countryCode);
        
        if (originalPhone !== fixedPhone) {
          await updateDoc(doc.ref, { phone: fixedPhone });
          fixedCount++;
        }
      }
      
      await loadCustomersFromFirebase();
      alert(`تم إصلاح ${fixedCount} رقم هاتف بنجاح`);
    } catch (error) {
      console.error('Error fixing phone numbers:', error);
      alert('خطأ في إصلاح أرقام الهواتف');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete all data
  const deleteAllData = async () => {
    const confirmed = confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.');
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setCustomers([]);
      alert('تم حذف جميع البيانات بنجاح');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('خطأ في حذف البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter customers
  const filterCustomers = () => {
    let filtered = customers.filter(customer => {
      if (searchTerm && !customer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !customer.phone.includes(searchTerm) && 
          !(customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }

      if (filterType !== 'all' && customer.type !== filterType) {
        return false;
      }

      if (filterStatus !== 'all' && customer.status !== filterStatus) {
        return false;
      }

      if (filterContactStatus !== 'all' && customer.contactStatus !== filterContactStatus) {
        return false;
      }

      if (filterPriority !== 'all' && customer.priority !== filterPriority) {
        return false;
      }

      return true;
    });

    setFilteredCustomers(filtered);
  };

  // Communication functions
  const sendWhatsApp = async (phone: string, country?: string, countryCode?: string, customerId?: string) => {
    const formattedPhone = formatPhoneNumber(phone, country, countryCode);
    const message = 'مرحباً! كيف يمكنني مساعدتك؟';
    const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Update last action if customer ID is provided
    if (customerId) {
      try {
        const customerRef = doc(db, 'customers', customerId);
        await updateDoc(customerRef, {
          lastAction: 'إرسال رسالة واتساب',
          lastActionDate: new Date().toISOString(),
          lastActionBy: userData?.name || 'Unknown',
          updatedAt: new Date().toISOString()
        });
        await loadCustomersFromFirebase();
      } catch (error) {
        console.error('Error updating last action:', error);
      }
    }
  };

  const makeCall = async (phone: string, country?: string, countryCode?: string, customerId?: string) => {
    const formattedPhone = formatPhoneNumber(phone, country, countryCode);
    window.open(`tel:${formattedPhone}`, '_blank');
    
    // Update last action if customer ID is provided
    if (customerId) {
      try {
        const customerRef = doc(db, 'customers', customerId);
        await updateDoc(customerRef, {
          lastAction: 'إجراء مكالمة',
          lastActionDate: new Date().toISOString(),
          lastActionBy: userData?.name || 'Unknown',
          updatedAt: new Date().toISOString()
        });
        await loadCustomersFromFirebase();
      } catch (error) {
        console.error('Error updating last action:', error);
      }
    }
  };

  const sendEmail = async (email: string, customerId?: string) => {
    if (email) {
      const subject = 'مرحباً من أكاديمية كرة القدم';
      const body = 'مرحباً! كيف يمكنني مساعدتك؟';
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
      
      // Update last action if customer ID is provided
      if (customerId) {
        try {
          const customerRef = doc(db, 'customers', customerId);
                  await updateDoc(customerRef, {
          lastAction: 'إرسال بريد إلكتروني',
          lastActionDate: new Date().toISOString(),
          lastActionBy: userData?.name || 'Unknown',
          updatedAt: new Date().toISOString()
        });
          await loadCustomersFromFirebase();
        } catch (error) {
          console.error('Error updating last action:', error);
        }
      }
    } else {
      alert('لا يوجد بريد إلكتروني لهذا العميل');
    }
  };

  // Copy template to clipboard
  const copyTemplate = (templateKey: string) => {
    const template = messageTemplates[templateKey as keyof typeof messageTemplates];
    if (template) {
      navigator.clipboard.writeText(template.content).then(() => {
        alert(`تم نسخ "${template.title}" إلى الحافظة`);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = template.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`تم نسخ "${template.title}" إلى الحافظة`);
      });
    }
  };

  // Contact tracking functions
  const openContactModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowContactModal(true);
    setContactNotes('');
  };

  const saveContactRecord = async () => {
    if (!selectedCustomer) return;

    try {
      const contactRecord: ContactRecord = {
        id: Date.now().toString(),
        type: contactType,
        date: new Date(),
        status: contactStatus,
        notes: contactNotes,
        employeeName: userData?.name || 'Unknown',
        message: contactType === 'whatsapp' || contactType === 'email' ? contactNotes : undefined
      };

      const customerRef = doc(db, 'customers', selectedCustomer.id);
      const updatedContactHistory = [...(selectedCustomer.contactHistory || []), contactRecord];
      
      await updateDoc(customerRef, {
        contactHistory: updatedContactHistory,
        lastContactDate: new Date().toISOString(),
        contactCount: (selectedCustomer.contactCount || 0) + 1,
        contactStatus: contactStatus === 'success' ? 'contacted' : 
                      contactStatus === 'not_interested' ? 'not_interested' : 'contacted',
        lastAction: `تواصل ${contactType === 'call' ? 'مكالمة' : 
                              contactType === 'whatsapp' ? 'واتساب' : 
                              contactType === 'email' ? 'بريد إلكتروني' : 'زيارة'} - ${contactStatus === 'success' ? 'نجح' : 
                              contactStatus === 'no_answer' ? 'لم يرد' : 
                              contactStatus === 'busy' ? 'مشغول' : 
                              contactStatus === 'wrong_number' ? 'رقم خاطئ' : 'غير مهتم'}`,
        lastActionDate: new Date().toISOString(),
        lastActionBy: userData?.name || 'Unknown',
        updatedAt: new Date().toISOString()
      });

      await loadCustomersFromFirebase();
      setShowContactModal(false);
      setSelectedCustomer(null);
      alert('تم حفظ سجل التواصل بنجاح');
    } catch (error) {
      console.error('Error saving contact record:', error);
      alert('خطأ في حفظ سجل التواصل');
    }
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'not_contacted': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'registered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContactStatusText = (status: string) => {
    switch (status) {
      case 'not_contacted': return 'لم يتم التواصل';
      case 'contacted': return 'تم التواصل';
      case 'interested': return 'مهتم';
      case 'not_interested': return 'غير مهتم';
      case 'registered': return 'مسجل';
      default: return 'غير محدد';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  // Format date and time
  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'لا يوجد';
    
    try {
      let dateObj: Date;
      
      // Handle different date formats
      if (typeof date === 'string') {
        // If it's a Firestore timestamp string
        if (date.includes('T') && date.includes('Z')) {
          dateObj = new Date(date);
        } else if (date.includes('timestamp')) {
          // Handle Firestore timestamp object
          const timestamp = JSON.parse(date);
          dateObj = new Date(timestamp.seconds * 1000);
        } else {
          dateObj = new Date(date);
        }
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        // Handle Firestore timestamp object
        const timestamp = date as any;
        dateObj = new Date(timestamp.seconds * 1000);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'تاريخ غير صحيح';
      }
      
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
      
      // If less than 24 hours, show relative time
      if (diffInHours < 24) {
        if (diffInHours < 1) {
          const diffInMinutes = Math.round(diffInHours * 60);
          return `منذ ${diffInMinutes} دقيقة`;
        } else {
          const hours = Math.round(diffInHours);
          return `منذ ${hours} ساعة`;
        }
      } else {
        // Show full date and time
        return dateObj.toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'تاريخ غير صحيح';
    }
  };

  // Editing functions
  const startEditing = (customer: Customer) => {
    setEditingCustomer(customer.id);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      type: customer.type,
      group: customer.group,
      status: customer.status,
      country: customer.country,
      countryCode: customer.countryCode,
      displayName: customer.displayName,
      isMyContact: customer.isMyContact,
      savedName: customer.savedName,
      groupName: customer.groupName,
      contactStatus: customer.contactStatus,
      priority: customer.priority,
      notes: customer.notes
    });
  };

  const cancelEditing = () => {
    setEditingCustomer(null);
    setEditForm({});
  };

  const saveCustomer = async (customerId: string) => {
    if (!permissions?.canEditCustomers) {
      alert('ليس لديك صلاحية لتعديل بيانات العملاء');
      return;
    }

    setIsSaving(true);
    try {
      const customerRef = doc(db, 'customers', customerId);
      const updateData = {
        ...editForm,
        updatedAt: new Date().toISOString(),
        lastAction: 'تعديل البيانات',
        lastActionDate: new Date().toISOString(),
        lastActionBy: userData?.name || 'Unknown'
      };

      await updateDoc(customerRef, updateData);
      
      // Update local state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === customerId 
            ? { 
                ...customer, 
                ...editForm,
                updatedAt: new Date(),
                lastAction: 'تعديل البيانات',
                lastActionDate: new Date(),
                lastActionBy: userData?.name || 'Unknown'
              }
            : customer
        )
      );

      setEditingCustomer(null);
      setEditForm({});
      alert('تم حفظ التعديلات بنجاح');
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChange = (field: keyof Customer, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get last action info
  const getLastActionInfo = (customer: Customer) => {
    if (!customer.lastAction && !customer.lastActionDate) {
      return { text: 'لا يوجد إجراء', date: null };
    }
    
    const actionText = customer.lastAction || 'إجراء غير محدد';
    const actionDate = customer.lastActionDate;
    
    return {
      text: actionText,
      date: actionDate
    };
  };

  // Calculate paginated customers
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // Load data on component mount
  useEffect(() => {
    loadCustomersFromFirebase();
  }, []);

  // Apply filters when criteria change
  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, filterType, filterStatus, filterContactStatus, filterPriority]);

  return (
    <AccountTypeProtection allowedTypes={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
          <div className="flex gap-2">
            <Button onClick={() => loadCustomersFromFirebase()} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث البيانات
            </Button>
          </div>
        </div>

        {/* Quick Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">إجمالي العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{customers.length.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">لم يتم التواصل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {customers.filter(c => !c.contactStatus || c.contactStatus === 'not_contacted').length.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">تم التواصل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {customers.filter(c => c.contactStatus === 'contacted' || c.contactStatus === 'interested').length.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">مهتمون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {customers.filter(c => c.contactStatus === 'interested').length.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">أولوية عالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.priority === 'high').length.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">مسجلون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.contactStatus === 'registered').length.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">غير مهتمون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.contactStatus === 'not_interested').length.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Management Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setShowMessageTemplates(!showMessageTemplates)} 
            className="bg-teal-600 hover:bg-teal-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            نماذج الرسائل
          </Button>
          
          {/* Advanced Tools - Only for authorized roles */}
          <PermissionGuard 
            requiredPermissions={['canAccessAdvancedTools']}
            fallback={
              <div className="text-sm text-gray-500 italic">
                الأدوات المتقدمة متاحة للمشرفين والمديرين فقط
              </div>
            }
          >
            <div className="flex gap-2 flex-wrap">
              <PermissionGuard requiredPermissions={['canTestPhoneFormatting']}>
                <Button onClick={testPhoneFormatting} className="bg-indigo-600 hover:bg-indigo-700">
                  <Phone className="w-4 h-4 mr-2" />
                  اختبار تنسيق الأرقام
                </Button>
              </PermissionGuard>
              
              <PermissionGuard requiredPermissions={['canFixPhoneNumbers']}>
                <Button onClick={fixPhoneNumbers} className="bg-purple-600 hover:bg-purple-700">
                  <Phone className="w-4 h-4 mr-2" />
                  إصلاح أرقام الهواتف
                </Button>
              </PermissionGuard>
              
              <PermissionGuard requiredPermissions={['canRemoveDuplicates']}>
                <Button onClick={removeDuplicates} className="bg-orange-600 hover:bg-orange-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  إزالة التكرارات
                </Button>
              </PermissionGuard>
              
              <PermissionGuard requiredPermissions={['canDeleteAllData']}>
                <Button onClick={deleteAllData} className="bg-red-600 hover:bg-red-700">
                  <Database className="w-4 h-4 mr-2" />
                  حذف جميع البيانات
                </Button>
              </PermissionGuard>
            </div>
          </PermissionGuard>
        </div>



        {/* Permissions Info - Always visible for debugging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              معلومات الصلاحيات الحالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">معلومات الصلاحيات</h3>
              <p className="text-sm text-gray-600 mb-4">الدور: {role || 'غير محدد'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">إدارة العملاء</h4>
                  <ul className="text-sm space-y-1">
                    <li>عرض العملاء: {permissions?.canViewCustomers ? '✅' : '❌'}</li>
                    <li>تعديل العملاء: {permissions?.canEditCustomers ? '✅' : '❌'}</li>
                    <li>حذف العملاء: {permissions?.canDeleteCustomers ? '✅' : '❌'}</li>
                    <li>إضافة عملاء: {permissions?.canAddCustomers ? '✅' : '❌'}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">التواصل</h4>
                  <ul className="text-sm space-y-1">
                    <li>إرسال واتساب: {permissions?.canSendWhatsApp ? '✅' : '❌'}</li>
                    <li>إجراء مكالمات: {permissions?.canMakeCalls ? '✅' : '❌'}</li>
                    <li>إرسال بريد إلكتروني: {permissions?.canSendEmails ? '✅' : '❌'}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">الأدوات المتقدمة</h4>
                  <ul className="text-sm space-y-1">
                    <li>الوصول للأدوات المتقدمة: {permissions?.canAccessAdvancedTools ? '✅' : '❌'}</li>
                    <li>اختبار تنسيق الأرقام: {permissions?.canTestPhoneFormatting ? '✅' : '❌'}</li>
                    <li>إصلاح أرقام الهواتف: {permissions?.canFixPhoneNumbers ? '✅' : '❌'}</li>
                    <li>إزالة التكرارات: {permissions?.canRemoveDuplicates ? '✅' : '❌'}</li>
                    <li>حذف جميع البيانات: {permissions?.canDeleteAllData ? '✅' : '❌'}</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>ملاحظة:</strong> إذا كنت لا ترى زر التعديل، تأكد من أن لديك صلاحية "تعديل العملاء" (canEditCustomers)
                </p>
              </div>
              
              {/* زر تجريبي لإجبار الصلاحيات */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium mb-2">🔧 أدوات التصحيح</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      console.log('🔧 Force Admin Permissions');
                      console.log('🔧 Current permissions:', permissions);
                      console.log('🔧 Current role:', role);
                      console.log('🔧 userData:', userData);
                      alert(`الصلاحيات الحالية:\nالدور: ${role}\nتعديل العملاء: ${permissions?.canEditCustomers}\n\nuserData: ${JSON.stringify(userData, null, 2)}`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    عرض معلومات التصحيح
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Templates Section */}
        {showMessageTemplates && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                نماذج الرسائل للشات بوت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(messageTemplates).map(([key, template]) => (
                  <div key={key} className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-lg">{template.title}</h3>
                    <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                      {template.content.length > 200 
                        ? template.content.substring(0, 200) + '...' 
                        : template.content}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyTemplate(key)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        نسخ النموذج
                      </Button>
                      <Button 
                        onClick={() => setSelectedTemplate(key)}
                        size="sm"
                        variant="outline"
                      >
                        عرض كامل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Full Template View */}
              {selectedTemplate && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {messageTemplates[selectedTemplate as keyof typeof messageTemplates]?.title}
                    </h3>
                    <Button 
                      onClick={() => setSelectedTemplate('')}
                      size="sm"
                      variant="outline"
                    >
                      إغلاق
                    </Button>
                  </div>
                  <div className="bg-white p-4 rounded border whitespace-pre-wrap text-sm">
                    {messageTemplates[selectedTemplate as keyof typeof messageTemplates]?.content}
                  </div>
                  <div className="mt-4">
                    <Button 
                      onClick={() => copyTemplate(selectedTemplate)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      نسخ النموذج الكامل
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filter and Search Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              البحث والفلترة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">البحث</label>
                <Input
                  placeholder="البحث بالاسم أو رقم الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">حالة التواصل</label>
                <select
                  value={filterContactStatus}
                  onChange={(e) => setFilterContactStatus(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                  aria-label="Contact Status"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="not_contacted">لم يتم التواصل</option>
                  <option value="contacted">تم التواصل</option>
                  <option value="interested">مهتم</option>
                  <option value="not_interested">غير مهتم</option>
                  <option value="registered">مسجل</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">الأولوية</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                  aria-label="Priority"
                >
                  <option value="all">جميع الأولويات</option>
                  <option value="high">عالية</option>
                  <option value="medium">متوسطة</option>
                  <option value="low">منخفضة</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">نوع العميل</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                  aria-label="Customer Type"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="registered">مسجل</option>
                  <option value="potential">محتمل</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">الحالة</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                  aria-label="Customer Status"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="pending">في الانتظار</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              قائمة العملاء ({filteredCustomers.length})
            </CardTitle>
            <div className="text-sm text-gray-600 mt-2">
              <strong>الأعمدة المتاحة:</strong> الاسم | رقم الهاتف | حالة التواصل | الأولوية | عدد التواصل | آخر تواصل | آخر إجراء | البلد | الإجراءات
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                <span className="mr-2">جاري التحميل...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-3 text-right whitespace-nowrap">الاسم</th>
                      <th className="border p-3 text-right whitespace-nowrap">رقم الهاتف</th>
                      <th className="border p-3 text-right whitespace-nowrap">حالة التواصل</th>
                      <th className="border p-3 text-right whitespace-nowrap">الأولوية</th>
                      <th className="border p-3 text-right whitespace-nowrap">عدد التواصل</th>
                      <th className="border p-3 text-right whitespace-nowrap">آخر تواصل</th>
                      <th className="border p-3 text-right whitespace-nowrap">آخر إجراء</th>
                      <th className="border p-3 text-right whitespace-nowrap">البلد</th>
                      <th className="border p-3 text-right whitespace-nowrap">التعديل</th>
                      <th className="border p-3 text-right whitespace-nowrap">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                                         {paginatedCustomers.map(customer => (
                       <tr key={customer.id} className="hover:bg-gray-50">
                         <td className="border p-3 font-medium min-w-[150px]">
                           {editingCustomer === customer.id ? (
                             <Input
                               value={editForm.name || ''}
                               onChange={(e) => handleEditChange('name', e.target.value)}
                               className="w-full"
                               placeholder="اسم العميل"
                             />
                           ) : (
                             customer.name
                           )}
                         </td>
                                                    <td className="border p-3 font-mono text-sm min-w-[120px]">
                             {editingCustomer === customer.id ? (
                               <Input
                                 value={editForm.phone || ''}
                                 onChange={(e) => handleEditChange('phone', e.target.value)}
                                 className="w-full"
                                 placeholder="رقم الهاتف"
                               />
                             ) : (
                               customer.phone
                             )}
                           </td>
                         <td className="border p-3 min-w-[120px]">
                           {editingCustomer === customer.id ? (
                             <select
                               value={editForm.contactStatus || customer.contactStatus || 'not_contacted'}
                               onChange={(e) => handleEditChange('contactStatus', e.target.value)}
                               className="w-full p-1 border rounded text-sm"
                               aria-label="حالة التواصل"
                             >
                               <option value="not_contacted">لم يتم التواصل</option>
                               <option value="contacted">تم التواصل</option>
                               <option value="interested">مهتم</option>
                               <option value="not_interested">غير مهتم</option>
                               <option value="registered">مسجل</option>
                             </select>
                           ) : (
                             <Badge className={getContactStatusColor(customer.contactStatus || 'not_contacted')}>
                               {getContactStatusText(customer.contactStatus || 'not_contacted')}
                             </Badge>
                           )}
                         </td>
                         <td className="border p-3 min-w-[100px]">
                           {editingCustomer === customer.id ? (
                             <select
                               value={editForm.priority || customer.priority || 'low'}
                               onChange={(e) => handleEditChange('priority', e.target.value)}
                               className="w-full p-1 border rounded text-sm"
                               aria-label="الأولوية"
                             >
                               <option value="low">منخفضة</option>
                               <option value="medium">متوسطة</option>
                               <option value="high">عالية</option>
                             </select>
                           ) : (
                             <Badge className={getPriorityColor(customer.priority || 'low')}>
                               {getPriorityText(customer.priority || 'low')}
                             </Badge>
                           )}
                         </td>
                         <td className="border p-3 text-center min-w-[100px]">
                           <span className="font-bold text-blue-600">
                             {customer.contactCount || 0}
                           </span>
                         </td>
                         <td className="border p-3 text-sm min-w-[120px]">
                           {customer.lastContactDate ? 
                             new Date(customer.lastContactDate).toLocaleDateString('ar-EG') : 
                             'لم يتم التواصل'}
                         </td>
                         <td className="border p-3 text-sm min-w-[200px]">
                           <div className="space-y-1">
                             <div className="font-medium text-gray-900 truncate">
                               {getLastActionInfo(customer).text}
                             </div>
                             <div className="text-xs text-gray-500">
                               {formatDateTime(getLastActionInfo(customer).date)}
                             </div>
                           </div>
                         </td>
                         <td className="border p-3 min-w-[100px]">
                           {editingCustomer === customer.id ? (
                             <Input
                               value={editForm.country || ''}
                               onChange={(e) => handleEditChange('country', e.target.value)}
                               className="w-full"
                               placeholder="البلد"
                             />
                           ) : (
                             customer.country || '-'
                           )}
                         </td>
                         <td className="border p-3 min-w-[150px]">
                           {/* زر التعديل مع الصلاحيات */}
                           <PermissionGuard requiredPermissions={['canEditCustomers']}>
                             {editingCustomer === customer.id ? (
                               <div className="flex gap-1">
                                 <Button
                                   size="sm"
                                   onClick={() => saveCustomer(customer.id)}
                                   disabled={isSaving}
                                   className="bg-green-600 hover:bg-green-700 text-white"
                                 >
                                   {isSaving ? 'حفظ...' : 'حفظ'}
                                 </Button>
                                 <Button
                                   size="sm"
                                   onClick={cancelEditing}
                                   variant="outline"
                                   className="border-red-300 text-red-600 hover:bg-red-50"
                                 >
                                   إلغاء
                                 </Button>
                               </div>
                             ) : (
                               <Button
                                 size="sm"
                                 onClick={() => startEditing(customer)}
                                 className="bg-blue-600 hover:bg-blue-700 text-white"
                               >
                                 تعديل
                               </Button>
                             )}
                           </PermissionGuard>
                           
                           {/* زر تجريبي بدون صلاحيات - للاختبار فقط */}
                           {!permissions?.canEditCustomers && (
                             <div className="text-center">
                               <Button
                                 size="sm"
                                 onClick={() => alert('لا تملك صلاحية التعديل. الدور الحالي: ' + (role || 'غير محدد'))}
                                 className="bg-gray-400 hover:bg-gray-500 text-white"
                                 disabled
                               >
                                 تعديل (غير متاح)
                               </Button>
                               <p className="text-xs text-red-600 mt-1">لا تملك صلاحية</p>
                             </div>
                           )}
                           
                           {/* زر تجريبي مؤقت للتأكد من عمل الكود */}
                           {userData?.accountType === 'admin' && (
                             <div className="text-center mt-1">
                               <Button
                                 size="sm"
                                 onClick={() => {
                                   alert('زر تجريبي - أنت admin!');
                                   startEditing(customer);
                                 }}
                                 className="bg-purple-600 hover:bg-purple-700 text-white"
                               >
                                 تعديل (تجريبي)
                               </Button>
                               <p className="text-xs text-purple-600 mt-1">للاختبار فقط</p>
                             </div>
                           )}
                         </td>
                         <td className="border p-3 min-w-[200px]">
                           <div className="flex gap-1 flex-wrap">
                             <PermissionGuard requiredPermissions={['canEditCustomers']}>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => openContactModal(customer)}
                                 className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                                 title="تسجيل تواصل"
                               >
                                 <MessageSquare className="w-3 h-3" />
                               </Button>
                             </PermissionGuard>
                             
                             <PermissionGuard requiredPermissions={['canSendWhatsApp']}>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => sendWhatsApp(customer.phone, customer.country, customer.countryCode, customer.id)}
                                 className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                                 title="واتساب"
                               >
                                 <MessageSquare className="w-3 h-3" />
                               </Button>
                             </PermissionGuard>
                             
                             <PermissionGuard requiredPermissions={['canMakeCalls']}>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => makeCall(customer.phone, customer.country, customer.countryCode, customer.id)}
                                 className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                 title="اتصال"
                               >
                                 <Phone className="w-3 h-3" />
                               </Button>
                             </PermissionGuard>
                             
                             <PermissionGuard requiredPermissions={['canSendEmails']}>
                               {customer.email && (
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => sendEmail(customer.email!, customer.id)}
                                   className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
                                   title="بريد إلكتروني"
                                 >
                                   <MessageSquare className="w-3 h-3" />
                                 </Button>
                               )}
                             </PermissionGuard>
                           </div>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              الأولى
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            
            <span className="px-4 py-2">
              صفحة {currentPage} من {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              الأخيرة
            </Button>
          </div>
        )}

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              رفع ملفات العملاء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اختر ملف CSV أو Excel</label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full"
                disabled={isUploading}
              />
            </div>
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadMessage}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={() => {
                const csvContent = 'Country Code,Country,Contact\'s Public Display Name,Phone Number,is My Contact,Saved Name,Group Name\n+20,Egypt,Ahmed Mohamed,123456789,true,Ahmed,General Group';
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'customers_template.csv';
                a.click();
              }} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                تحميل نموذج CSV
              </Button>
              
              <Button onClick={() => {
                const csvContent = 'Country Code,Country,Contact\'s Public Display Name,Phone Number,is My Contact,Saved Name,Group Name\n+20,Egypt,Ahmed Mohamed,2 0128811,true,Ahmed,General Group\n+20,Egypt,Sara Ahmed,+20 2 0128811,true,Sara,Test Group\n+20,Egypt,Mohamed Ali,2020128811,false,Mohamed,VIP Group';
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'test_egyptian_numbers.csv';
                a.click();
              }} className="bg-blue-600 hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                تحميل اختبار الأرقام المصرية
              </Button>
            </div>
          </CardContent>
                 </Card>

         {/* Contact Modal */}
         {showContactModal && selectedCustomer && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
               <h2 className="text-xl font-bold mb-4">تسجيل تواصل مع {selectedCustomer.name}</h2>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-2">نوع التواصل</label>
                   <select
                     value={contactType}
                     onChange={(e) => setContactType(e.target.value as any)}
                     className="w-full p-2 border rounded-md"
                     aria-label="Contact Type"
                   >
                     <option value="call">مكالمة</option>
                     <option value="whatsapp">واتساب</option>
                     <option value="email">بريد إلكتروني</option>
                     <option value="visit">زيارة</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium mb-2">حالة التواصل</label>
                   <select
                     value={contactStatus}
                     onChange={(e) => setContactStatus(e.target.value as any)}
                     className="w-full p-2 border rounded-md"
                     aria-label="Contact Status"
                   >
                     <option value="success">نجح</option>
                     <option value="no_answer">لم يرد</option>
                     <option value="busy">مشغول</option>
                     <option value="wrong_number">رقم خاطئ</option>
                     <option value="not_interested">غير مهتم</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium mb-2">ملاحظات</label>
                   <textarea
                     value={contactNotes}
                     onChange={(e) => setContactNotes(e.target.value)}
                     className="w-full p-2 border rounded-md h-20"
                     placeholder="اكتب ملاحظاتك هنا..."
                   />
                 </div>
               </div>
               
               <div className="flex gap-2 mt-6">
                 <Button
                   onClick={saveContactRecord}
                   className="bg-blue-600 hover:bg-blue-700 flex-1"
                 >
                   حفظ التواصل
                 </Button>
                 <Button
                   onClick={() => setShowContactModal(false)}
                   variant="outline"
                   className="flex-1"
                 >
                   إلغاء
                 </Button>
               </div>
             </div>
           </div>
         )}
       </div>
     </AccountTypeProtection>
   );
 }
