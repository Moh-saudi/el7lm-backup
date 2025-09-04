'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Employee, EmployeeRole, RolePermissions, EmployeeLocation } from '@/types/employees';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  X,
  Key,
  Copy,
  Check,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  getAuth 
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { useAuth } from '@/lib/firebase/auth-provider';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminFooter from '@/components/layout/AdminFooter';

// الصلاحيات الافتراضية لكل دور وظيفي
const DEFAULT_PERMISSIONS: Record<EmployeeRole, RolePermissions> = {
  support: {
    canViewUsers: true,
    canEditUsers: false,
    canViewFinancials: false,
    canManagePayments: false,
    canViewReports: false,
    canManageContent: false,
    canManageEmployees: false,
    canViewSupport: true,
    canManageSupport: true
  },
  finance: {
    canViewUsers: true,
    canEditUsers: false,
    canViewFinancials: true,
    canManagePayments: true,
    canViewReports: true,
    canManageContent: false,
    canManageEmployees: false,
    canViewSupport: false,
    canManageSupport: false
  },
  sales: {
    canViewUsers: true,
    canEditUsers: false,
    canViewFinancials: false,
    canManagePayments: false,
    canViewReports: true,
    canManageContent: false,
    canManageEmployees: false,
    canViewSupport: true,
    canManageSupport: false,
    allowedRegions: []
  },
  content: {
    canViewUsers: false,
    canEditUsers: false,
    canViewFinancials: false,
    canManagePayments: false,
    canViewReports: false,
    canManageContent: true,
    canManageEmployees: false,
    canViewSupport: false,
    canManageSupport: false
  },
  admin: {
    canViewUsers: true,
    canEditUsers: true,
    canViewFinancials: true,
    canManagePayments: true,
    canViewReports: true,
    canManageContent: true,
    canManageEmployees: true,
    canViewSupport: true,
    canManageSupport: true
  },
  supervisor: {
    canViewUsers: true,
    canEditUsers: true,
    canViewFinancials: true,
    canManagePayments: false,
    canViewReports: true,
    canManageContent: true,
    canManageEmployees: false,
    canViewSupport: true,
    canManageSupport: true
  }
};

// إضافة واجهة للدولة والمدينة
interface Country {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  flag: string;
  currency: string;
  dialCode: string;
  isActive: boolean;
  cities: City[];
}

interface City {
  id: string;
  name: string;
  nameEn: string;
  isCapital: boolean;
  isActive: boolean;
}

// قائمة الدول والمدن المحدثة
const COUNTRIES_DATA = [
  {
    id: 'sa',
    name: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    code: 'SA',
    flag: '🇸🇦',
    currency: 'SAR',
    dialCode: '+966',
    isActive: true,
    cities: [
      { id: 'sa_01', name: 'الرياض', nameEn: 'Riyadh', isCapital: true, isActive: true },
      { id: 'sa_02', name: 'جدة', nameEn: 'Jeddah', isCapital: false, isActive: true },
      { id: 'sa_03', name: 'مكة المكرمة', nameEn: 'Makkah', isCapital: false, isActive: true },
      { id: 'sa_04', name: 'المدينة المنورة', nameEn: 'Madinah', isCapital: false, isActive: true },
      { id: 'sa_05', name: 'الدمام', nameEn: 'Dammam', isCapital: false, isActive: true },
      { id: 'sa_06', name: 'الخبر', nameEn: 'Khobar', isCapital: false, isActive: true },
      { id: 'sa_07', name: 'الظهران', nameEn: 'Dhahran', isCapital: false, isActive: true },
      { id: 'sa_08', name: 'الأحساء', nameEn: 'Al-Ahsa', isCapital: false, isActive: true },
      { id: 'sa_09', name: 'الطائف', nameEn: 'Taif', isCapital: false, isActive: true },
      { id: 'sa_10', name: 'تبوك', nameEn: 'Tabuk', isCapital: false, isActive: true },
      { id: 'sa_11', name: 'بريدة', nameEn: 'Buraidah', isCapital: false, isActive: true },
      { id: 'sa_12', name: 'خميس مشيط', nameEn: 'Khamis Mushait', isCapital: false, isActive: true }
    ]
  },
  {
    id: 'ae',
    name: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    dialCode: '+971',
    isActive: true,
    cities: [
      { id: 'ae_01', name: 'أبوظبي', nameEn: 'Abu Dhabi', isCapital: true, isActive: true },
      { id: 'ae_02', name: 'دبي', nameEn: 'Dubai', isCapital: false, isActive: true },
      { id: 'ae_03', name: 'الشارقة', nameEn: 'Sharjah', isCapital: false, isActive: true },
      { id: 'ae_04', name: 'العين', nameEn: 'Al Ain', isCapital: false, isActive: true },
      { id: 'ae_05', name: 'عجمان', nameEn: 'Ajman', isCapital: false, isActive: true },
      { id: 'ae_06', name: 'رأس الخيمة', nameEn: 'Ras Al Khaimah', isCapital: false, isActive: true },
      { id: 'ae_07', name: 'الفجيرة', nameEn: 'Fujairah', isCapital: false, isActive: true },
      { id: 'ae_08', name: 'أم القيوين', nameEn: 'Umm Al Quwain', isCapital: false, isActive: true }
    ]
  },
  {
    id: 'qa',
    name: 'قطر',
    nameEn: 'Qatar',
    code: 'QA',
    flag: '🇶🇦',
    currency: 'QAR',
    dialCode: '+974',
    isActive: true,
    cities: [
      { id: 'qa_01', name: 'الدوحة', nameEn: 'Doha', isCapital: true, isActive: true },
      { id: 'qa_02', name: 'الوكرة', nameEn: 'Al Wakrah', isCapital: false, isActive: true },
      { id: 'qa_03', name: 'الخور', nameEn: 'Al Khor', isCapital: false, isActive: true },
      { id: 'qa_04', name: 'الريان', nameEn: 'Al Rayyan', isCapital: false, isActive: true },
      { id: 'qa_05', name: 'أم صلال', nameEn: 'Umm Salal', isCapital: false, isActive: true }
    ]
  },
  {
    id: 'kw',
    name: 'الكويت',
    nameEn: 'Kuwait',
    code: 'KW',
    flag: '🇰🇼',
    currency: 'KWD',
    dialCode: '+965',
    isActive: true,
    cities: [
      { id: 'kw_01', name: 'مدينة الكويت', nameEn: 'Kuwait City', isCapital: true, isActive: true },
      { id: 'kw_02', name: 'حولي', nameEn: 'Hawalli', isCapital: false, isActive: true },
      { id: 'kw_03', name: 'الجهراء', nameEn: 'Al Jahra', isCapital: false, isActive: true },
      { id: 'kw_04', name: 'الفروانية', nameEn: 'Al Farwaniyah', isCapital: false, isActive: true },
      { id: 'kw_05', name: 'مبارك الكبير', nameEn: 'Mubarak Al-Kabeer', isCapital: false, isActive: true },
      { id: 'kw_06', name: 'الأحمدي', nameEn: 'Al Ahmadi', isCapital: false, isActive: true }
    ]
  },
  {
    id: 'bh',
    name: 'البحرين',
    nameEn: 'Bahrain',
    code: 'BH',
    flag: '🇧🇭',
    currency: 'BHD',
    dialCode: '+973',
    isActive: true,
    cities: [
      { id: 'bh_01', name: 'المنامة', nameEn: 'Manama', isCapital: true, isActive: true },
      { id: 'bh_02', name: 'المحرق', nameEn: 'Muharraq', isCapital: false, isActive: true },
      { id: 'bh_03', name: 'الرفاع', nameEn: 'Riffa', isCapital: false, isActive: true },
      { id: 'bh_04', name: 'مدينة عيسى', nameEn: 'Isa Town', isCapital: false, isActive: true },
      { id: 'bh_05', name: 'مدينة حمد', nameEn: 'Hamad Town', isCapital: false, isActive: true }
    ]
  },
  {
    id: 'om',
    name: 'عمان',
    nameEn: 'Oman',
    code: 'OM',
    flag: '🇴🇲',
    currency: 'OMR',
    dialCode: '+968',
    isActive: true,
    cities: [
      { id: 'om_01', name: 'مسقط', nameEn: 'Muscat', isCapital: true, isActive: true },
      { id: 'om_02', name: 'صلالة', nameEn: 'Salalah', isCapital: false, isActive: true },
      { id: 'om_03', name: 'صحار', nameEn: 'Sohar', isCapital: false, isActive: true },
      { id: 'om_04', name: 'نزوى', nameEn: 'Nizwa', isCapital: false, isActive: true },
      { id: 'om_05', name: 'صور', nameEn: 'Sur', isCapital: false, isActive: true }
    ]
  },
  {
    id: 'eg',
    name: 'مصر',
    nameEn: 'Egypt',
    code: 'EG',
    flag: '🇪🇬',
    currency: 'EGP',
    dialCode: '+20',
    isActive: true,
    cities: [
      { id: 'eg_01', name: 'القاهرة', nameEn: 'Cairo', isCapital: true, isActive: true },
      { id: 'eg_02', name: 'الجيزة', nameEn: 'Giza', isCapital: false, isActive: true },
      { id: 'eg_03', name: 'الإسكندرية', nameEn: 'Alexandria', isCapital: false, isActive: true },
      { id: 'eg_04', name: 'الدقهلية', nameEn: 'Dakahlia', isCapital: false, isActive: true },
      { id: 'eg_05', name: 'البحر الأحمر', nameEn: 'Red Sea', isCapital: false, isActive: true },
      { id: 'eg_06', name: 'البحيرة', nameEn: 'Beheira', isCapital: false, isActive: true },
      { id: 'eg_07', name: 'الفيوم', nameEn: 'Fayoum', isCapital: false, isActive: true },
      { id: 'eg_08', name: 'الغربية', nameEn: 'Gharbia', isCapital: false, isActive: true },
      { id: 'eg_09', name: 'الإسماعيلية', nameEn: 'Ismailia', isCapital: false, isActive: true },
      { id: 'eg_10', name: 'المنوفية', nameEn: 'Menofia', isCapital: false, isActive: true },
      { id: 'eg_11', name: 'المنيا', nameEn: 'Minya', isCapital: false, isActive: true },
      { id: 'eg_12', name: 'القليوبية', nameEn: 'Qalyubia', isCapital: false, isActive: true },
      { id: 'eg_13', name: 'الوادي الجديد', nameEn: 'New Valley', isCapital: false, isActive: true },
      { id: 'eg_14', name: 'السويس', nameEn: 'Suez', isCapital: false, isActive: true },
      { id: 'eg_15', name: 'اسوان', nameEn: 'Aswan', isCapital: false, isActive: true },
      { id: 'eg_16', name: 'اسيوط', nameEn: 'Assiut', isCapital: false, isActive: true },
      { id: 'eg_17', name: 'بني سويف', nameEn: 'Beni Suef', isCapital: false, isActive: true },
      { id: 'eg_18', name: 'بورسعيد', nameEn: 'Port Said', isCapital: false, isActive: true },
      { id: 'eg_19', name: 'دمياط', nameEn: 'Damietta', isCapital: false, isActive: true },
      { id: 'eg_20', name: 'الشرقية', nameEn: 'Sharqia', isCapital: false, isActive: true },
      { id: 'eg_21', name: 'جنوب سيناء', nameEn: 'South Sinai', isCapital: false, isActive: true },
      { id: 'eg_22', name: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', isCapital: false, isActive: true },
      { id: 'eg_23', name: 'مطروح', nameEn: 'Matrouh', isCapital: false, isActive: true },
      { id: 'eg_24', name: 'الأقصر', nameEn: 'Luxor', isCapital: false, isActive: true },
      { id: 'eg_25', name: 'قنا', nameEn: 'Qena', isCapital: false, isActive: true },
      { id: 'eg_26', name: 'شمال سيناء', nameEn: 'North Sinai', isCapital: false, isActive: true },
      { id: 'eg_27', name: 'سوهاج', nameEn: 'Sohag', isCapital: false, isActive: true }
    ]
  }
];

export default function EmployeesManagement() {
  const { user, userData } = useAuth();
  
  // التحقق من صلاحيات المستخدم
  const isSystemAdmin = userData?.role === 'admin';
  const isSupervisor = userData?.role === 'supervisor';

  // تحديث التحكم في الصلاحيات
  const canEditEmployee = (employee: Employee) => {
    if (isSystemAdmin) return true; // مدير النظام يمكنه تعديل أي موظف
    if (isSupervisor) {
      // المشرف يمكنه تعديل الموظفين في نفس المناطق فقط
      return employee.locations?.some(loc => 
        userData?.permissions?.allowedLocations?.some(allowed => 
          allowed.countryId === loc.countryId && allowed.cityId === loc.cityId
        )
      );
    }
    return false;
  };

  const canDeleteEmployee = (employee: Employee) => {
    return isSystemAdmin; // فقط مدير النظام يمكنه حذف الموظفين
  };

  const canAddEmployee = () => {
    return isSystemAdmin || isSupervisor; // مدير النظام والمشرف يمكنهم إضافة موظفين
  };

  const canEditRole = (employee: Employee) => {
    return isSystemAdmin; // فقط مدير النظام يمكنه تغيير نوع الوظيفة
  };

  // تحديث واجهة المستخدم لعرض الصلاحيات
  const renderEmployeeActions = (employee: Employee) => (
    <div className="flex items-center gap-2">
      {canEditEmployee(employee) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditingEmployee(employee);
            setNewEmployee(employee);
            setSelectedCountry(employee.locations[0]?.countryId || '');
            setSelectedCities(employee.locations.map(loc => loc.cityId));
            setShowAddDialog(true);
          }}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit className="w-4 h-4" />
        </Button>
      )}
      
      {canDeleteEmployee(employee) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteEmployee(employee.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  // Add state for form errors
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: ''
  });

  // Add validation function
  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      phone: '',
      role: '',
      department: ''
    };
    let isValid = true;

    if (!newEmployee.name?.trim()) {
      errors.name = 'يرجى إدخال اسم الموظف';
      isValid = false;
    }

    if (!newEmployee.email?.trim()) {
      errors.email = 'يرجى إدخال البريد الإلكتروني';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmployee.email)) {
        errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
        isValid = false;
      }
    }

    if (!newEmployee.phone?.trim()) {
      errors.phone = 'يرجى إدخال رقم الهاتف';
      isValid = false;
    }

    if (!newEmployee.role) {
      errors.role = 'يرجى اختيار الوظيفة';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // تحديث نموذج إضافة/تعديل الموظف
  const EmployeeForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>الاسم الكامل</Label>
        <Input
          value={newEmployee.name || ''}
          onChange={(e) => {
            const value = e.target.value;
            setNewEmployee(prev => ({ ...prev, name: value }));
            if (formErrors.name) {
              setFormErrors(prev => ({ ...prev, name: '' }));
            }
          }}
          placeholder="أدخل الاسم الكامل"
          className={`w-full ${formErrors.name ? 'border-red-500' : ''}`}
          dir="rtl"
        />
        {formErrors.name && (
          <p className="text-sm text-red-500">{formErrors.name}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>البريد الإلكتروني</Label>
        <Input
          type="email"
          value={newEmployee.email || ''}
          onChange={(e) => {
            const value = e.target.value;
            setNewEmployee(prev => ({ ...prev, email: value }));
            if (formErrors.email) {
              setFormErrors(prev => ({ ...prev, email: '' }));
            }
          }}
          placeholder="example@domain.com"
          className={`w-full ${formErrors.email ? 'border-red-500' : ''}`}
          dir="ltr"
        />
        {formErrors.email && (
          <p className="text-sm text-red-500">{formErrors.email}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>رقم الهاتف</Label>
        <Input
          type="tel"
          value={newEmployee.phone || ''}
          onChange={(e) => {
            const value = e.target.value;
            setNewEmployee(prev => ({ ...prev, phone: value }));
            if (formErrors.phone) {
              setFormErrors(prev => ({ ...prev, phone: '' }));
            }
          }}
          placeholder="05xxxxxxxx"
          className={`w-full text-left ${formErrors.phone ? 'border-red-500' : ''}`}
          dir="ltr"
        />
        {formErrors.phone && (
          <p className="text-sm text-red-500">{formErrors.phone}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>الوظيفة</Label>
        <Select
          value={newEmployee.role || ''}
          onValueChange={(value: EmployeeRole) => {
            setNewEmployee(prev => ({ 
              ...prev, 
              role: value,
              permissions: DEFAULT_PERMISSIONS[value]
            }));
            if (formErrors.role) {
              setFormErrors(prev => ({ ...prev, role: '' }));
            }
          }}
        >
          <SelectTrigger className={`w-full ${formErrors.role ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="اختر الوظيفة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="support">دعم فني</SelectItem>
            <SelectItem value="finance">مالية</SelectItem>
            <SelectItem value="sales">مبيعات</SelectItem>
            <SelectItem value="content">محتوى</SelectItem>
            <SelectItem value="supervisor">مشرف</SelectItem>
            <SelectItem value="admin">مدير نظام</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.role && (
          <p className="text-sm text-red-500">{formErrors.role}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>القسم</Label>
        <Input
          value={newEmployee.department || ''}
          onChange={(e) => {
            const value = e.target.value;
            setNewEmployee(prev => ({ ...prev, department: value }));
            if (formErrors.department) {
              setFormErrors(prev => ({ ...prev, department: '' }));
            }
          }}
          placeholder="اسم القسم"
          className={`w-full ${formErrors.department ? 'border-red-500' : ''}`}
          dir="rtl"
        />
        {formErrors.department && (
          <p className="text-sm text-red-500">{formErrors.department}</p>
        )}
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-4">المناطق الجغرافية</h4>
        <LocationSelector />
      </div>
    </div>
  );

  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // New employee form state
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    email: '',
    phone: '',
    role: 'support',
    isActive: true,
    department: '',
    regions: []
  });

  // إضافة state للنافذة المنبثقة لبيانات الدخول
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  // Add state for sending credentials
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [credentialsCopied, setCredentialsCopied] = useState(false);

  // Load employees
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const employeesRef = collection(db, 'employees');
      const employeesSnap = await getDocs(employeesRef);
      
      const employeesList: Employee[] = [];
      employeesSnap.forEach(doc => {
        employeesList.push({ id: doc.id, ...doc.data() } as Employee);
      });

      setEmployees(employeesList);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحميل الدول والمدن
  const loadCountries = async () => {
    try {
      setLoadingLocations(true);
      // استخدام البيانات المحدثة مباشرة
      setCountries(COUNTRIES_DATA);
    } catch (error) {
      console.error('Error loading countries:', error);
      toast.error('حدث خطأ في تحميل بيانات المناطق');
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const employeeName = employee.name || '';
    const employeeEmail = employee.email || '';
    const employeeDepartment = employee.department || '';
    
    const matchesSearch = 
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeDepartment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // تحديث مكون اختيار المناطق
  const LocationSelector = () => {
    const selectedCountryData = countries.find(c => c.id === selectedCountry);
    
    return (
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>الدولة</Label>
          <Select
            value={selectedCountry}
            onValueChange={(value) => {
              setSelectedCountry(value);
              setSelectedCities([]);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر الدولة" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCountryData && (
          <div className="grid gap-2">
            <Label>المدن</Label>
            {selectedCountryData.cities.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg max-h-48 overflow-y-auto">
                {selectedCountryData.cities.map(city => (
                  <div key={city.id} className="flex items-center gap-2">
                    <Checkbox
                      id={city.id}
                      checked={selectedCities.includes(city.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCities(prev => [...prev, city.id]);
                        } else {
                          setSelectedCities(prev => prev.filter(id => id !== city.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={city.id}
                      className="text-sm cursor-pointer select-none flex items-center gap-1"
                    >
                      {city.name}
                      {city.isCapital && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600">
                          عاصمة
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>لا توجد مدن مضافة لهذه الدولة</span>
              </div>
            )}
          </div>
        )}

        {selectedCities.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm text-gray-500">المدن المختارة:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCities.map(cityId => {
                const city = selectedCountryData?.cities.find(c => c.id === cityId);
                if (!city) return null;
                
                return (
                  <Badge key={cityId} variant="secondary" className="flex items-center gap-1">
                    {city.name}
                    <button
                      type="button"
                      onClick={() => setSelectedCities(prev => prev.filter(id => id !== cityId))}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // دالة لإنشاء كلمة مرور قوية
  const generateStrongPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // التأكد من وجود حرف كبير على الأقل
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    
    // التأكد من وجود حرف صغير على الأقل
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    
    // التأكد من وجود رقم على الأقل
    password += "0123456789"[Math.floor(Math.random() * 10)];
    
    // التأكد من وجود رمز خاص على الأقل
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    // إكمال باقي الأحرف عشوائياً
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // خلط الأحرف
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // تحديث دالة حفظ الموظف
  const handleSaveEmployee = async () => {
    try {
      // Validate form
      if (!validateForm()) {
        return;
      }

      // Validate required fields
      if (!newEmployee.name?.trim()) {
        toast.error('يرجى إدخال اسم الموظف');
        return;
      }

      if (!newEmployee.email?.trim()) {
        toast.error('يرجى إدخال البريد الإلكتروني');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmployee.email)) {
        toast.error('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }

      if (!newEmployee.phone?.trim()) {
        toast.error('يرجى إدخال رقم الهاتف');
        return;
      }

      if (!newEmployee.role) {
        toast.error('يرجى اختيار الوظيفة');
        return;
      }

      if (!selectedCountry) {
        toast.error('يرجى اختيار الدولة');
        return;
      }

      if (selectedCities.length === 0) {
        toast.error('يرجى اختيار مدينة واحدة على الأقل');
        return;
      }

      // Check if email already exists in employees collection
      const emailQuery = query(
        collection(db, 'employees'),
        where('email', '==', newEmployee.email)
      );
      const emailQuerySnapshot = await getDocs(emailQuery);
      
      if (!editingEmployee && !emailQuerySnapshot.empty) {
        toast.error('البريد الإلكتروني مستخدم بالفعل');
        return;
      }

      let authUserId = '';

      if (!editingEmployee) {
        try {
          // Generate strong password
          const tempPassword = generateStrongPassword();
          
          // Prepare employee data first
          const employeeData: Partial<Employee> = {
            name: newEmployee.name,
            email: newEmployee.email,
            phone: newEmployee.phone,
            role: newEmployee.role,
            department: newEmployee.department,
            createdAt: new Date(),
            isActive: true,
            locations: selectedCities.map(cityId => {
              const selectedCountryData = countries.find(c => c.id === selectedCountry);
              const city = selectedCountryData?.cities.find(c => c.id === cityId);
              return {
                countryId: selectedCountry,
                countryName: selectedCountryData?.name || '',
                cityId: cityId,
                cityName: city?.name || ''
              };
            })
          };

          // Create Firestore document first
          const employeeRef = doc(collection(db, 'employees'));
          await setDoc(employeeRef, employeeData);

          // Try to create auth account
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              newEmployee.email,
              tempPassword
            );
            
            authUserId = userCredential.user.uid;

            // Update document with auth ID
            await updateDoc(employeeRef, {
              authUserId: authUserId
            });

            // Send password reset email
            await sendPasswordResetEmail(auth, newEmployee.email);

            // Save credentials for display
            setNewUserCredentials({
              email: newEmployee.email,
              password: tempPassword
            });

            setShowCredentialsDialog(true);
            toast.success('تم إنشاء الحساب بنجاح');

          } catch (authError: any) {
            console.error('Firebase Auth Error:', authError);
            
            // If auth creation fails, delete the employee document
            await deleteDoc(employeeRef);

            if (authError.code === 'auth/email-already-in-use') {
              // Special handling for existing email
              const existingUserQuery = query(
                collection(db, 'employees'),
                where('email', '==', newEmployee.email)
              );
              const existingUserSnapshot = await getDocs(existingUserQuery);
              
              if (existingUserSnapshot.empty) {
                // Email exists in Auth but not in employees collection
                toast.error('البريد الإلكتروني مسجل في النظام ولكن غير مرتبط بموظف. يرجى استخدام بريد إلكتروني آخر.');
              } else {
                toast.error('البريد الإلكتروني مستخدم بالفعل');
              }
            } else if (authError.code === 'auth/invalid-email') {
              toast.error('البريد الإلكتروني غير صالح');
            } else if (authError.code === 'auth/operation-not-allowed') {
              toast.error('تم تعطيل إنشاء الحسابات بالبريد الإلكتروني وكلمة المرور');
            } else if (authError.code === 'auth/weak-password') {
              toast.error('كلمة المرور ضعيفة جداً');
            } else {
              toast.error('حدث خطأ أثناء إنشاء الحساب');
            }
            return;
          }

        } catch (error) {
          console.error('Error creating employee:', error);
          toast.error('حدث خطأ أثناء إنشاء الموظف');
          return;
        }
      } else {
        // Update existing employee
        try {
          const employeeData: Partial<Employee> = {
            name: newEmployee.name,
            phone: newEmployee.phone,
            role: newEmployee.role,
            department: newEmployee.department,
            locations: selectedCities.map(cityId => {
              const selectedCountryData = countries.find(c => c.id === selectedCountry);
              const city = selectedCountryData?.cities.find(c => c.id === cityId);
              return {
                countryId: selectedCountry,
                countryName: selectedCountryData?.name || '',
                cityId: cityId,
                cityName: city?.name || ''
              };
            })
          };

          await updateDoc(doc(db, 'employees', editingEmployee.id), employeeData);
          toast.success('تم تحديث بيانات الموظف بنجاح');
        } catch (error) {
          console.error('Error updating employee:', error);
          toast.error('حدث خطأ أثناء تحديث بيانات الموظف');
          return;
        }
      }

      // Reset form
      setShowAddDialog(false);
      setEditingEmployee(null);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        role: 'support',
        isActive: true,
        department: ''
      });
      setSelectedCountry('');
      setSelectedCities([]);
      
      // Refresh employee list
      loadEmployees();
      
    } catch (error) {
      console.error('Error in handleSaveEmployee:', error);
      toast.error('حدث خطأ غير متوقع');
    }
  };

  // Add function to send credentials via email
  const sendCredentialsEmail = async () => {
    try {
      setIsSendingEmail(true);
      // Here you would integrate with your email sending service
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('تم إرسال بيانات الدخول إلى البريد الإلكتروني');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('حدث خطأ أثناء إرسال البريد الإلكتروني');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Add function to send credentials via SMS
  const sendCredentialsSMS = async () => {
    try {
      setIsSendingSMS(true);
      // Here you would integrate with your SMS service
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('تم إرسال بيانات الدخول عبر رسالة نصية');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة النصية');
    } finally {
      setIsSendingSMS(false);
    }
  };

  // Update CredentialsDialog component
  const CredentialsDialog = () => (
    <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            تم إنشاء حساب الموظف بنجاح
          </DialogTitle>
          <DialogDescription>
            يرجى حفظ أو إرسال بيانات الدخول التالية للموظف بشكل آمن
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Credentials Display */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-600">البريد الإلكتروني</Label>
              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="flex-1 font-medium text-gray-900">{newUserCredentials?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600">كلمة المرور المؤقتة</Label>
              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="flex-1 font-mono font-medium text-gray-900">{newUserCredentials?.password}</span>
              </div>
            </div>
          </div>

          {/* Send Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">خيارات إرسال بيانات الدخول</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={sendCredentialsEmail}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 ml-2" />
                    إرسال عبر البريد
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={sendCredentialsSMS}
                disabled={isSendingSMS}
              >
                {isSendingSMS ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 ml-2" />
                    إرسال عبر SMS
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Copy to Clipboard */}
          <div className="space-y-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                const credentials = `
بيانات الدخول للنظام:
------------------------
البريد الإلكتروني: ${newUserCredentials?.email}
كلمة المرور المؤقتة: ${newUserCredentials?.password}

ملاحظات مهمة:
- يرجى تغيير كلمة المرور فور تسجيل الدخول
- هذه البيانات سرية، يرجى عدم مشاركتها
- في حال وجود أي مشكلة، يرجى التواصل مع الدعم الفني
                `.trim();
                
                navigator.clipboard.writeText(credentials);
                setCredentialsCopied(true);
                toast.success('تم نسخ البيانات إلى الحافظة');
                
                setTimeout(() => setCredentialsCopied(false), 2000);
              }}
            >
              {credentialsCopied ? (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ البيانات
                </>
              )}
            </Button>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              تعليمات مهمة
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>سيتم إرسال رابط تغيير كلمة المرور تلقائياً إلى البريد الإلكتروني</li>
              <li>يجب على الموظف تغيير كلمة المرور عند أول تسجيل دخول</li>
              <li>تأكد من إرسال البيانات بشكل آمن</li>
              <li>احتفظ بنسخة من البيانات في مكان آمن للرجوع إليها عند الحاجة</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            onClick={() => {
              setShowCredentialsDialog(false);
              setNewUserCredentials(null);
              setCredentialsCopied(false);
            }}
          >
            <Check className="w-4 h-4 ml-2" />
            تم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Delete employee
  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    try {
      // الحصول على بيانات الموظف
      const employeeDoc = await getDoc(doc(db, 'employees', employeeId));
      const employeeData = employeeDoc.data();

      if (employeeData?.authUserId) {
        // حذف حساب المصادقة إذا كان موجوداً
        try {
          // Note: Deleting Firebase Auth users requires Admin SDK
          // We'll need to implement this through a secure backend function
          toast.info('سيتم تعطيل حساب المصادقة للموظف');
          
          // تحديث حالة الموظف إلى غير نشط
          await updateDoc(doc(db, 'employees', employeeId), {
            isActive: false,
            deactivatedAt: new Date(),
            deactivationReason: 'تم حذف الحساب'
          });
        } catch (authError) {
          console.error('Error deleting auth account:', authError);
        }
      }

      // حذف بيانات الموظف من Firestore
      await deleteDoc(doc(db, 'employees', employeeId));
      toast.success('تم حذف الموظف بنجاح');
      
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('حدث خطأ أثناء حذف الموظف');
    }
  };

  // Toggle employee status
  const toggleEmployeeStatus = async (employee: Employee) => {
    try {
      await updateDoc(doc(db, 'employees', employee.id), {
        isActive: !employee.isActive
      });
      loadEmployees();
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert('حدث خطأ أثناء تحديث حالة الموظف');
    }
  };

  // تحديث عرض المناطق في جدول الموظفين
  const renderLocations = (employee: Employee) => {
    if (!employee.locations?.length) return '-';

    const locationsByCountry = employee.locations.reduce((acc, loc) => {
      if (!acc[loc.countryName]) {
        acc[loc.countryName] = [];
      }
      acc[loc.countryName].push(loc.cityName);
      return acc;
    }, {} as Record<string, string[]>);

    return (
      <div className="space-y-1">
        {Object.entries(locationsByCountry).map(([country, cities]) => (
          <div key={country} className="text-sm">
            <span className="font-medium">{country}:</span>
            <span className="text-gray-600"> {cities.join('، ')}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات الموظفين...</p>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50">
      <AdminHeader />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة موظفي الشركة</h1>
            <p className="text-gray-600">إدارة الموظفين وصلاحياتهم في النظام</p>
          </div>
          {(isSystemAdmin || isSupervisor) && (
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة موظف
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">موظفين نشطين</p>
                  <p className="text-2xl font-bold text-green-600">
                    {employees.filter(e => e.isActive).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الأقسام</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(employees.map(e => e.department).filter(Boolean)).size}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الوظائف</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(employees.map(e => e.role)).size}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث بالاسم، البريد، القسم..."
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <Label>الوظيفة</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الوظائف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الوظائف</SelectItem>
                  <SelectItem value="support">دعم فني</SelectItem>
                  <SelectItem value="finance">مالية</SelectItem>
                  <SelectItem value="sales">مبيعات</SelectItem>
                  <SelectItem value="content">محتوى</SelectItem>
                  <SelectItem value="supervisor">مشرف</SelectItem>
                  <SelectItem value="admin">مدير نظام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <p className="text-sm text-gray-600">
                {filteredEmployees.length} من {employees.length} موظف
              </p>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>الوظيفة</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>التواصل</TableHead>
                <TableHead>المناطق</TableHead>
                <TableHead>التبعية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {employee.role === 'support' && 'دعم فني'}
                      {employee.role === 'finance' && 'مالية'}
                      {employee.role === 'sales' && 'مبيعات'}
                      {employee.role === 'content' && 'محتوى'}
                      {employee.role === 'supervisor' && 'مشرف'}
                      {employee.role === 'admin' && 'مدير نظام'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{employee.department || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{employee.phone || '-'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderLocations(employee)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {employee.supervisor ? (
                          employees.find(emp => emp.id === employee.supervisor)?.name || 'غير محدد'
                        ) : 'بدون مشرف'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={employee.isActive}
                        onCheckedChange={() => toggleEmployeeStatus(employee)}
                      />
                      <span className={employee.isActive ? 'text-green-600' : 'text-red-600'}>
                        {employee.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderEmployeeActions(employee)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Employee Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات الموظف وحدد صلاحياته في النظام
              </DialogDescription>
            </DialogHeader>
            
            <EmployeeForm />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingEmployee(null);
                  setNewEmployee({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'support',
                    isActive: true,
                    department: ''
                  });
                  setSelectedCountry('');
                  setSelectedCities([]);
                }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                onClick={handleSaveEmployee}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingEmployee ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Credentials Dialog */}
        <CredentialsDialog />
      </main>

      <AdminFooter />
    </div>
  );
} 
