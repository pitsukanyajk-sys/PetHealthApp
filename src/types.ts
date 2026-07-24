export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  birthDate: string;
  gender: 'male' | 'female';
  weight: number; // in kg
  ownerName: string;
  notes?: string;
  microchipId?: string;
  birthPlace?: string;
  adoptedAge?: string;
  adoptedDate?: string;     // Added adoption date field
  ownerPhone?: string;
  ownerAddress?: string;
  deathDate?: string;      // Added for deceased pets
  deathReason?: string;    // Added for deceased pets
  deathAge?: string;       // Added for deceased pets
  avatarUrl?: string;      // Added for custom pet photos
}

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  date: string;
  dueDate: string;
  vetName: string;
  status: 'completed' | 'scheduled';
  weight?: number; // Weight at time of vaccination in kg
  age?: string; // Age at time of vaccination
  cost?: number; // Added to support unified expenses
  clinicName?: string; // Added clinic/hospital
  lotNo?: string; // Vaccine Lot No.
  expiryDate?: string; // Vaccine Expiry Date
  proofImage?: string; // Photo evidence/receipt/sticker
}

export interface VaccineSymptom {
  id: string;
  petId: string;
  vaccineName: string;
  date: string;
  weight?: number;
  age?: string;
  appetite: 'normal' | 'decreased' | 'none';
  behavior: 'cheerful' | 'lethargic' | 'agitated';
  abnormality: 'none' | 'vomiting' | 'swollen_face' | 'fever' | 'other';
  notes?: string;
}

export interface TreatmentMedicineItem {
  name: string;
  quantity: number;
  unit: string; // e.g. ถุง, ขวด, แผง
  price: number;
}

export interface Treatment {
  id: string;
  petId: string;
  date: string;
  diagnosis: string;
  treatmentDetail: string;
  medicine: string; // fallback or legacy field
  cost: number;
  clinicName: string;
  weight?: number; // Weight in kg
  age?: string; // Age at treatment
  notes?: string;
  medicinesList?: TreatmentMedicineItem[]; // Added for detailed prescription
  proofImage?: string; // Photo evidence/receipt/medical record
}

export interface TickFlea {
  id: string;
  petId: string;
  date: string;
  dueDate: string;
  productName: string;
  weight?: number;
  age?: string;
  cost?: number; // Added to support expense integration
  notes?: string;
  proofImage?: string; // Photo evidence/box/receipt
}

export interface Deworming {
  id: string;
  petId: string;
  date: string;
  dueDate: string;
  medicineName: string;
  weight?: number;
  age?: string;
  cost?: number; // Added to support expense integration
  notes?: string;
  proofImage?: string; // Photo evidence/box/receipt
}

export interface Heartworm {
  id: string;
  petId: string;
  date: string;
  dueDate: string;
  productName: string;
  weight?: number;
  age?: string;
  cost?: number;
  notes?: string;
  proofImage?: string; // Photo evidence/box/receipt
}

export interface RoutineHealth {
  id: string;
  petId: string;
  date: string;
  category: 'dental' | 'grooming' | 'growth' | 'symptoms';
  title: string;
  detail: string;
  value?: string; // Weight, teeth count, grooming details, etc.
  weight?: number;
  age?: string;
  cost?: number;
  notes?: string;
  proofImage?: string; // Photo evidence/picture
}

export interface AnnualHealth {
  id: string;
  petId: string;
  year: number;
  date: string;
  clinicName: string;
  physicalExam: string; // e.g. ปกติ, มีคราบหินปูน
  bloodTest: string; // e.g. ปกติ, เม็ดเลือดขาวสูง
  vaccineStatus: string; // e.g. ครบถ้วน, ขาดวัคซีนรวม
  cost: number;
  weight?: number;
  age?: string;
  notes?: string;
  proofImage?: string; // Photo evidence/lab report/receipt
}

export interface Memory {
  id: string;
  petId: string;
  date: string;
  title: string;
  story: string;
  mood: string; // e.g. มีความสุข, ซนมาก, นอนทั้งวัน
  notes?: string;
}

export interface ExpenseItem {
  name: string;
  amount: number;
  category: 'medical' | 'vaccine' | 'prevention' | 'grooming' | 'food' | 'other';
}

export interface Expense {
  id: string;
  petId: string;
  date: string;
  category: 'medical' | 'vaccine' | 'prevention' | 'grooming' | 'food' | 'other';
  amount: number;
  description: string;
  refId?: string; // Optional reference ID of treatment, vaccine, etc.
  billImage?: string; // Base64 or URL of attached receipt image
  items?: ExpenseItem[]; // List of items in this single visit/bill
}

export interface DatabaseStatus {
  type: 'local' | 'mssql';
  connected: boolean;
  message: string;
  config?: {
    server?: string;
    database?: string;
    user?: string;
  };
}

