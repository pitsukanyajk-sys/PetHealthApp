/**
 * Utility functions for Pet Health Record app
 */

/**
 * Formats a date string into a Thai Buddhist Era date
 * Default format is short month + 2-digit BE year, e.g. "2024-03-12" -> "12 มี.ค. 67"
 */
export function formatThaiDate(dateStr: string | null | undefined, formatType: 'short' | 'long' | 'fullBE' = 'short'): string {
  if (!dateStr) return '-';
  try {
    // Handle ISO strings with time by splitting on T
    const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const dateObj = new Date(cleanDateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    
    const day = dateObj.getDate();
    const yearBE = dateObj.getFullYear() + 543;
    const yearBEShort = String(yearBE).slice(-2);
    
    if (formatType === 'long') {
      const monthsLong = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const month = monthsLong[dateObj.getMonth()];
      return `${day} ${month} ${yearBE}`;
    } else if (formatType === 'fullBE') {
      const monthsShort = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const month = monthsShort[dateObj.getMonth()];
      return `${day} ${month} ${yearBE}`;
    } else {
      const monthsShort = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const month = monthsShort[dateObj.getMonth()];
      return `${day} ${month} ${yearBEShort}`;
    }
  } catch {
    return dateStr;
  }
}

/**
 * Formats a phone number string to 000-000-0000 style
 * e.g. "0812345678" -> "081-234-5678"
 */
export function formatPhoneNumber(phoneStr: string | null | undefined): string {
  if (!phoneStr) return '-';
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    // Standard landline e.g. 02-123-4567 or mobile with 9 digits
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return phoneStr;
}

/**
 * Calculates age in years and months from birth date string (as of today or target date)
 */
export function calculateAge(birthDateString: string | null | undefined, targetDateString?: string | null): string {
  if (!birthDateString) return '-';
  try {
    const cleanDateStr = birthDateString.includes('T') ? birthDateString.split('T')[0] : birthDateString;
    const birthDate = new Date(cleanDateStr);
    if (isNaN(birthDate.getTime())) return birthDateString;

    const refDate = targetDateString
      ? new Date(targetDateString.includes('T') ? targetDateString.split('T')[0] : targetDateString)
      : new Date();
    if (isNaN(refDate.getTime())) return '-';

    let years = refDate.getFullYear() - birthDate.getFullYear();
    let months = refDate.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && refDate.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years < 0) return '0 เดือน';

    if (years > 0) {
      return `${years} ปี ${months} เดือน`;
    }
    return `${months} เดือน`;
  } catch {
    return '-';
  }
}

