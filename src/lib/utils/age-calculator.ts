import { DateOrTimestamp } from '../../types/common';

export const calculateAge = (birthDate: DateOrTimestamp): number | null => {
  try {
    let date: Date;

    // Handle different date formats
    if (birthDate instanceof Date) {
      date = birthDate;
    } else if (typeof birthDate === 'string') {
      date = new Date(birthDate);
    } else if (birthDate && typeof birthDate === 'object' && 'seconds' in birthDate) {
      // Firestore timestamp
      date = new Date(birthDate.seconds * 1000);
    } else {
      return null;
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

export const formatAge = (birthDate: DateOrTimestamp): string => {
  const age = calculateAge(birthDate);
  if (age === null) return 'غير محدد';
  return `${age} سنة`;
};

export const validateAge = (
  birthDate: DateOrTimestamp, 
  minAge: number = 7, 
  maxAge: number = 50
): { valid: boolean; message?: string } => {
  const age = calculateAge(birthDate);
  
  if (age === null) {
    return {
      valid: false,
      message: 'تاريخ الميلاد غير صحيح'
    };
  }

  if (age < minAge) {
    return {
      valid: false,
      message: `العمر يجب أن يكون ${minAge} سنوات على الأقل`
    };
  }

  if (age > maxAge) {
    return {
      valid: false,
      message: `العمر يجب أن يكون ${maxAge} سنوات كحد أقصى`
    };
  }

  return { valid: true };
};

export const getAgeRange = (birthDate: DateOrTimestamp): string => {
  const age = calculateAge(birthDate);
  if (age === null) return 'غير محدد';

  if (age < 12) return 'طفل';
  if (age < 16) return 'شاب';
  if (age < 20) return 'مراهق';
  if (age < 30) return 'شاب';
  if (age < 40) return 'بالغ';
  return 'كبير';
};

export const isBirthdayToday = (birthDate: DateOrTimestamp): boolean => {
  try {
    let date: Date;

    if (birthDate instanceof Date) {
      date = birthDate;
    } else if (typeof birthDate === 'string') {
      date = new Date(birthDate);
    } else if (birthDate && typeof birthDate === 'object' && 'seconds' in birthDate) {
      date = new Date(birthDate.seconds * 1000);
    } else {
      return false;
    }

    if (isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
  } catch (error) {
    return false;
  }
};

export const getDaysUntilBirthday = (birthDate: DateOrTimestamp): number => {
  try {
    let date: Date;

    if (birthDate instanceof Date) {
      date = birthDate;
    } else if (typeof birthDate === 'string') {
      date = new Date(birthDate);
    } else if (birthDate && typeof birthDate === 'object' && 'seconds' in birthDate) {
      date = new Date(birthDate.seconds * 1000);
    } else {
      return -1;
    }

    if (isNaN(date.getTime())) {
      return -1;
    }

    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), date.getMonth(), date.getDate());
    
    // If birthday has passed this year, calculate for next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    return -1;
  }
}; 
