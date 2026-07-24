import mssql from 'mssql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Pet, 
  Vaccination, 
  Treatment, 
  TickFlea, 
  Deworming, 
  DatabaseStatus,
  VaccineSymptom,
  Heartworm,
  RoutineHealth,
  AnnualHealth,
  Memory,
  Expense 
} from '../src/types.js';

// Setup paths for file fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(process.cwd(), 'server-data');
const DATA_FILE = path.join(DATA_DIR, 'pets_db.json');

// Supabase Online Database Client setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://rsbrgjkopuizvwindlkl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYnJnamtvcHVpenZ3aW5kbGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODg0MDEsImV4cCI6MjEwMDQ2NDQwMX0.2LY_5QOQOHVyMpNZL5lCBBDtsKdfxNXRIFA8YA5sHUs';

const useSupabase = !!(supabaseUrl && supabaseKey);
let supabase: SupabaseClient | null = null;

if (useSupabase) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully!');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

// Supabase helper functions
async function supabaseGetAll<T>(tableName: string, filterKey?: string, filterVal?: string): Promise<T[] | null> {
  if (!useSupabase || !supabase) return null;
  try {
    let query = supabase.from(tableName).select('*');
    if (filterKey && filterVal) {
      query = query.eq(filterKey, filterVal);
    }
    const { data, error } = await query;
    if (!error && data) {
      return data as T[];
    }
    if (error) {
      console.error(`Supabase select error on ${tableName}:`, error.message);
      return null;
    }
  } catch (err) {
    console.error(`Supabase select exception on ${tableName}:`, err);
    return null;
  }
  return null;
}

async function supabaseInsert<T>(tableName: string, record: any): Promise<T | null> {
  if (!useSupabase || !supabase) return null;
  try {
    const { error } = await supabase.from(tableName).insert([record]);
    if (!error) return record as T;
    console.error(`Supabase insert error on ${tableName}:`, error.message);
    return null;
  } catch (err) {
    console.error(`Supabase insert exception on ${tableName}:`, err);
    return null;
  }
}

async function supabaseUpdate<T>(tableName: string, id: string, record: any): Promise<T | null> {
  if (!useSupabase || !supabase) return null;
  try {
    const { error } = await supabase.from(tableName).update(record).eq('id', id);
    if (!error) return record as T;
    console.error(`Supabase update error on ${tableName}:`, error.message);
    return null;
  } catch (err) {
    console.error(`Supabase update exception on ${tableName}:`, err);
    return null;
  }
}

async function supabaseDelete(tableName: string, id: string): Promise<boolean | null> {
  if (!useSupabase || !supabase) return null;
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (!error) return true;
    console.error(`Supabase delete error on ${tableName}:`, error.message);
    return null;
  } catch (err) {
    console.error(`Supabase delete exception on ${tableName}:`, err);
    return null;
  }
}

async function supabaseDeleteByFilter(tableName: string, filterKey: string, filterVal: string): Promise<boolean | null> {
  if (!useSupabase || !supabase) return null;
  try {
    const { error } = await supabase.from(tableName).delete().eq(filterKey, filterVal);
    if (!error) return true;
    console.error(`Supabase deleteByFilter error on ${tableName}:`, error.message);
    return null;
  } catch (err) {
    console.error(`Supabase deleteByFilter exception on ${tableName}:`, err);
    return null;
  }
}


// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed data in case file is empty/non-existent
const DEFAULT_DATABASE = {
  pets: [
    {
      id: 'pet_1',
      name: 'ส้มแป้น',
      type: 'cat',
      breed: 'ไทย (สามสี)',
      birthDate: '2024-03-12',
      gender: 'female',
      weight: 4.20,
      ownerName: 'สมชาย ใจดี',
      notes: 'น้องส้มแป้นชอบนอนกลางวันมาก กลัวเสียงฟ้าร้อง'
    },
    {
      id: 'pet_2',
      name: 'โกโก้',
      type: 'dog',
      breed: 'พ็อมเมอเรเนียน',
      birthDate: '2023-08-20',
      gender: 'male',
      weight: 3.50,
      ownerName: 'สุดารัตน์ รักสัตว์',
      notes: 'ขนฟู ขี้เล่น แต่อัลเลอร์จีง่าย แพ้ไก่'
    }
  ],
  vaccinations: [
    {
      id: 'vac_1',
      petId: 'pet_1',
      name: 'วัคซีนรวมแมว (Feline Panleukopenia)',
      date: '2024-06-15',
      dueDate: '2025-06-15',
      vetName: 'หมอวิภา',
      status: 'completed'
    },
    {
      id: 'vac_2',
      petId: 'pet_1',
      name: 'วัคซีนพิษสุนัขบ้า (Rabies)',
      date: '2024-07-01',
      dueDate: '2025-07-01',
      vetName: 'หมอวิภา',
      status: 'completed'
    },
    {
      id: 'vac_3',
      petId: 'pet_2',
      name: 'วัคซีนรวม 5 โรค (DHLPP)',
      date: '2024-01-10',
      dueDate: '2025-01-10',
      vetName: 'หมอมานพ',
      status: 'completed'
    }
  ],
  treatments: [
    {
      id: 'tr_1',
      petId: 'pet_1',
      date: '2024-11-05',
      diagnosis: 'หวัดแมว',
      treatmentDetail: 'พ่นยาแก้ไอและป้อนยาฆ่าเชื้อ',
      medicine: 'Amoxicillin, ยาแก้ไอแบบน้ำ',
      cost: 450.00,
      clinicName: 'คลินิกบ้านรักสัตว์',
      notes: 'น้องทานยาเก่งมาก หายดีใน 1 สัปดาห์'
    },
    {
      id: 'tr_2',
      petId: 'pet_2',
      date: '2024-09-18',
      diagnosis: 'ผิวหนังอักเสบจากเห็บกัด',
      treatmentDetail: 'ทายารักษาโรคผิวหนัง อาบน้ำแชมพูพิเศษ',
      medicine: 'Cortisone cream, แชมพูยา Medicated',
      cost: 850.00,
      clinicName: 'รพ.สัตว์แสนดี',
      notes: 'ห้ามใช้แชมพูธรรมดาชั่วคราว'
    }
  ],
  tickfleas: [
    {
      id: 'tf_1',
      petId: 'pet_1',
      date: '2024-06-01',
      dueDate: '2024-09-01',
      productName: 'Broadline (หยอดหลัง)',
      notes: 'ครอบคลุมพยาธิภายนอกและภายใน'
    },
    {
      id: 'tf_2',
      petId: 'pet_2',
      date: '2024-01-10',
      dueDate: '2024-02-10',
      productName: 'Bravecto (ชนิดเคี้ยว)',
      notes: 'เคี้ยวดีมาก รสเนื้อ ป้องกันได้ 3 เดือนเต็ม'
    }
  ],
  dewormings: [
    {
      id: 'dw_1',
      petId: 'pet_1',
      date: '2024-06-01',
      dueDate: '2024-09-01',
      medicineName: 'Drontal Cat',
      notes: 'ให้ทาน 1 เม็ด ป้อนพร้อมขนมเลีย'
    },
    {
      id: 'dw_2',
      petId: 'pet_2',
      date: '2024-01-10',
      dueDate: '2024-04-10',
      medicineName: 'Drontal Plus',
      notes: 'ให้ทาน 1 เม็ดตามน้ำหนักตัว'
    }
  ],
  vaccinesymptoms: [
    {
      id: 'vs_1',
      petId: 'pet_1',
      vaccineName: 'วัคซีนรวมแมว (Feline Panleukopenia)',
      date: '2024-06-15',
      appetite: 'normal',
      behavior: 'cheerful',
      abnormality: 'none',
      notes: 'น้องร่าเริงดี ทานอาหารปกติมาก ไม่มีไข้ตัวร้อน'
    },
    {
      id: 'vs_2',
      petId: 'pet_2',
      vaccineName: 'วัคซีนรวม 5 โรค (DHLPP)',
      date: '2024-01-10',
      appetite: 'decreased',
      behavior: 'lethargic',
      abnormality: 'none',
      notes: 'น้องซึมเล็กน้อยหลังฉีดวัคซีน ทานข้าวน้อยลงช่วงเย็น แต่เช้าวันถัดมาร่าเริงปกติ'
    }
  ],
  heartworms: [
    {
      id: 'hw_1',
      petId: 'pet_2',
      date: '2024-01-10',
      dueDate: '2024-02-10',
      productName: 'Spectra ชนิดกิน',
      cost: 350,
      notes: 'เม็ดเคี้ยวรสเนื้อ ป้องกันพยาธิหนอนหัวใจและไรหู'
    },
    {
      id: 'hw_2',
      petId: 'pet_1',
      date: '2024-06-01',
      dueDate: '2024-07-01',
      productName: 'Revolution Plus',
      cost: 290,
      notes: 'แบบหยอดหลัง คลุมหมัด ไรหู ไรเกลื้อน และพยาธิหนอนหัวใจ'
    }
  ],
  routinehealths: [
    {
      id: 'rh_1',
      petId: 'pet_1',
      date: '2024-11-10',
      category: 'dental',
      title: 'ขูดหินปูนสะอาดวั๊บ',
      detail: 'ขูดหินปูนช่องปาก ขัดฟัน และพ่นสเปรย์ฆ่าเชื้อลดกลิ่นปาก',
      value: 'คราบหินปูนเกลี้ยง ฟันขาวสะอาด ไม่มีกลิ่นปาก',
      cost: 1200,
      notes: 'ตรวจเหงือกไม่พบเหงือกอักเสบรุนแรง'
    },
    {
      id: 'rh_2',
      petId: 'pet_2',
      date: '2024-12-01',
      category: 'grooming',
      title: 'ตัดแต่งขนเล็บสไตล์หมีน้อย',
      detail: 'อาบน้ำอุ่นด้วยแชมพูบำรุงขน เป่าขน ตัดเล็บ ไถขนใต้เท้า',
      value: 'ตัดเล็บกลมมน ขนตัวกลมทรงปอมเมอเรเนียนแสนรัก',
      cost: 500,
      notes: 'ช่างบอกน้องน่ารักมาก ให้ความร่วมมืออย่างดี'
    },
    {
      id: 'rh_3',
      petId: 'pet_2',
      date: '2024-10-15',
      category: 'growth',
      title: 'ชั่งน้ำหนักติดตามพัฒนาการ',
      detail: 'ชั่งน้ำหนักประจำเดือน วัดรอบตัวเพื่อปรับขนาดเสื้อกาวน์และสายรัดอก',
      value: '3.50 kg (น้ำหนักกำลังพอดีตามสายพันธุ์)',
      cost: 0,
      notes: 'คงที่ รักษาระดับพลังงานได้ดีเยี่ยม'
    }
  ],
  annualhealths: [
    {
      id: 'ah_1',
      petId: 'pet_1',
      year: 2024,
      date: '2024-03-12',
      clinicName: 'คลินิกบ้านรักสัตว์',
      physicalExam: 'ปกติสมบูรณ์ดีมาก มีเหงือกอักเสบเล็กน้อยบริเวณฟันกรามหลัง',
      bloodTest: 'ปกติ (ค่าตับ ALKP/ALT และค่าไต BUN/Creatinine อยู่ในเกณฑ์ดีเยี่ยม)',
      vaccineStatus: 'วัคซีนครบถ้วนตามช่วงอายุ',
      cost: 1500,
      notes: 'หมอแนะนำให้เริ่มแปรงฟันสัปดาห์ละ 2 ครั้งเพื่อป้องกันการสะสมของคราบหินปูน'
    }
  ],
  memories: [
    {
      id: 'mem_1',
      petId: 'pet_1',
      date: '2024-03-12',
      title: 'สุขสันต์วันเกิดครบรอบ 1 ปี! 🐟🎂',
      story: 'วันนี้วันเกิดส้มแป้น! ทำเค้กปลาทูน่าผสมขนมเลียให้ น้องชอบใจมาก ร้องเหมียวๆ ไม่หยุดเลย ทานเสร็จแล้วก็นอนแผ่สองสลึงบนโซฟาอย่างมีความสุข น่ารักที่สุดในสามโลก 💖',
      mood: 'มีความสุขล้นปรี่',
      notes: 'มีแจกของขวัญเป็นตุ๊กตาปลาแคทนิปตัวใหม่'
    },
    {
      id: 'mem_2',
      petId: 'pet_2',
      date: '2024-12-25',
      title: 'ฉลองคริสต์มาสในชุดคุณซานต้าสุดเท่ 🎅',
      story: 'พาน้องโกโก้ไปเดินเที่ยวคาเฟ่หมาในหมู่บ้าน ใส่ชุดซานต้าสีแดงมีพู่ห้อยวิ่งดุ๊กดิ๊กไปทั่ว ทุกคนในงานพากันถ่ายรูปและชมว่าน่ารักมาก น้องร่าเริงได้กินคุกกี้สุนัขโฮมเมดไปสองชิ้นเบ้อเริ่ม!',
      mood: 'ซนมากๆ ร่าเริงเกินร้อย',
      notes: 'กลับมาบ้านหลับปุ๋ยกรนเบาๆ ทันที'
    }
  ],
  expenses: [
    {
      id: 'exp_1',
      petId: 'pet_1',
      date: '2024-11-05',
      category: 'medical',
      amount: 450,
      description: 'ค่ายาหวัดแมว (Amoxicillin, ยาแก้ไอ) - คลินิกบ้านรักสัตว์'
    },
    {
      id: 'exp_2',
      petId: 'pet_1',
      date: '2024-11-10',
      category: 'dental',
      amount: 1200,
      description: 'ค่าขูดหินปูนช่องปากและตรวจฟัน - รพ.สัตว์แสนดี'
    },
    {
      id: 'exp_3',
      petId: 'pet_2',
      date: '2024-12-01',
      category: 'grooming',
      amount: 500,
      description: 'ค่าอาบน้ำและตัดแต่งขนแต่งเล็บทรงคุณหมี - ร้านกรูมมิ่งบัดดี้'
    },
    {
      id: 'exp_4',
      petId: 'pet_2',
      date: '2024-01-10',
      category: 'prevention',
      amount: 350,
      description: 'ค่าตรวจและกินยาป้องกันพยาธิหนอนหัวใจ Spectra'
    }
  ]
};

// Initialize file if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATABASE, null, 2), 'utf-8');
}

// Helper to read/write JSON file database
function readJsonDb() {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading JSON DB, using defaults', error);
    return DEFAULT_DATABASE;
  }
}

function writeJsonDb(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing JSON DB', error);
  }
}

// SQL Server connection pooling config
const useSqlServer = !!(process.env.DB_SERVER && process.env.DB_NAME);

const sqlConfig: mssql.config = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || '',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: true, // Use encrypt for azure
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: mssql.ConnectionPool | null = null;
let mssqlErrorMsg = '';

// Lazy initialisation of SQL Connection Pool
async function getPool(): Promise<mssql.ConnectionPool | null> {
  if (!useSqlServer) {
    return null;
  }
  if (pool && pool.connected) {
    return pool;
  }
  try {
    console.log(`Attempting to connect to SQL Server at ${sqlConfig.server}:${sqlConfig.port}...`);
    pool = await new mssql.ConnectionPool(sqlConfig).connect();
    console.log('Successfully connected to SQL Server!');
    mssqlErrorMsg = '';
    return pool;
  } catch (error: any) {
    console.error('SQL Server connection failed. Falling back to local JSON database.', error.message);
    mssqlErrorMsg = error.message;
    pool = null;
    return null;
  }
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  if (useSupabase && supabase) {
    try {
      const { error } = await supabase.from('pets').select('id').limit(1);
      if (!error) {
        return {
          type: 'supabase' as any,
          connected: true,
          message: 'เชื่อมต่อฐานข้อมูลออนไลน์ Supabase (PostgreSQL) สำเร็จเรียบร้อยแล้ว',
          config: {
            server: supabaseUrl,
            database: 'Supabase Online DB',
            user: 'Supabase API Key'
          }
        };
      } else {
        return {
          type: 'supabase' as any,
          connected: false,
          message: `ระบุ SUPABASE_URL และ SUPABASE_KEY แล้ว แต่ยังเข้าถึงตารางไม่ได้: ${error.message} (กรุณาสร้างตารางผ่าน Supabase SQL Editor)`,
          config: {
            server: supabaseUrl,
            database: 'Supabase Online DB',
            user: 'Supabase API Key'
          }
        };
      }
    } catch (err: any) {
      return {
        type: 'supabase' as any,
        connected: false,
        message: `ข้อผิดพลาดในการเชื่อมต่อ Supabase: ${err.message}`,
      };
    }
  }

  const activePool = await getPool();
  if (useSqlServer) {
    if (activePool && activePool.connected) {
      return {
        type: 'mssql',
        connected: true,
        message: 'Connected successfully to SQL Server',
        config: {
          server: sqlConfig.server,
          database: sqlConfig.database,
          user: sqlConfig.user
        }
      };
    } else {
      return {
        type: 'mssql',
        connected: false,
        message: `SQL Server enabled but disconnected: ${mssqlErrorMsg || 'Unknown error'}`,
        config: {
          server: sqlConfig.server,
          database: sqlConfig.database,
          user: sqlConfig.user
        }
      };
    }
  }
  return {
    type: 'local',
    connected: true,
    message: 'ใช้งานฐานข้อมูลภายในระบบ (Local JSON DB ใน server-data/pets_db.json) พร้อมสำหรับการเชื่อมต่อ Supabase Online DB หรือ MS SQL Server'
  };
}

// --- Pets API ---
export async function getPets(): Promise<Pet[]> {
  const sbData = await supabaseGetAll<Pet>('pets');
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      const result = await sqlPool.request().query('SELECT * FROM dbo.Pets');
      return result.recordset.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        breed: row.breed || '',
        birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split('T')[0] : '',
        gender: row.gender,
        weight: Number(row.weight),
        ownerName: row.ownerName,
        microchipNo: row.microchipNo || undefined,
        deathDate: row.deathDate ? new Date(row.deathDate).toISOString().split('T')[0] : undefined,
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching pets from MSSQL, using fallback', error);
    }
  }
  return readJsonDb().pets;
}

export async function addPet(pet: Pet): Promise<Pet> {
  const sbRes = await supabaseInsert<Pet>('pets', pet);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), pet.id)
        .input('name', mssql.NVarChar(100), pet.name)
        .input('type', mssql.NVarChar(50), pet.type)
        .input('breed', mssql.NVarChar(100), pet.breed)
        .input('birthDate', mssql.Date, pet.birthDate || null)
        .input('gender', mssql.NVarChar(20), pet.gender)
        .input('weight', mssql.Decimal(5, 2), pet.weight)
        .input('ownerName', mssql.NVarChar(100), pet.ownerName)
        .input('notes', mssql.NVarChar(mssql.MAX), pet.notes || null)
        .query(`
          INSERT INTO dbo.Pets (id, name, type, breed, birthDate, gender, weight, ownerName, notes)
          VALUES (@id, @name, @type, @breed, @birthDate, @gender, @weight, @ownerName, @notes)
        `);
      return pet;
    } catch (error) {
      console.error('Error adding pet to MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.pets.push(pet);
  writeJsonDb(db);
  return pet;
}

export async function updatePet(pet: Pet): Promise<Pet> {
  const sbRes = await supabaseUpdate<Pet>('pets', pet.id, pet);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), pet.id)
        .input('name', mssql.NVarChar(100), pet.name)
        .input('type', mssql.NVarChar(50), pet.type)
        .input('breed', mssql.NVarChar(100), pet.breed)
        .input('birthDate', mssql.Date, pet.birthDate || null)
        .input('gender', mssql.NVarChar(20), pet.gender)
        .input('weight', mssql.Decimal(5, 2), pet.weight)
        .input('ownerName', mssql.NVarChar(100), pet.ownerName)
        .input('notes', mssql.NVarChar(mssql.MAX), pet.notes || null)
        .query(`
          UPDATE dbo.Pets 
          SET name = @name, type = @type, breed = @breed, birthDate = @birthDate, 
              gender = @gender, weight = @weight, ownerName = @ownerName, notes = @notes
          WHERE id = @id
        `);
      return pet;
    } catch (error) {
      console.error('Error updating pet in MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.pets = db.pets.map((p: Pet) => p.id === pet.id ? pet : p);
  writeJsonDb(db);
  return pet;
}

export async function deletePet(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('pets', id);
  if (sbRes !== null) {
    await Promise.all([
      supabaseDeleteByFilter('vaccinations', 'petId', id),
      supabaseDeleteByFilter('treatments', 'petId', id),
      supabaseDeleteByFilter('tickfleas', 'petId', id),
      supabaseDeleteByFilter('dewormings', 'petId', id),
      supabaseDeleteByFilter('vaccinesymptoms', 'petId', id),
      supabaseDeleteByFilter('heartworms', 'petId', id),
      supabaseDeleteByFilter('routinehealths', 'petId', id),
      supabaseDeleteByFilter('annualhealths', 'petId', id),
      supabaseDeleteByFilter('memories', 'petId', id),
      supabaseDeleteByFilter('expenses', 'petId', id),
    ]);
    return true;
  }

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.Pets WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting pet from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.pets = db.pets.filter((p: Pet) => p.id !== id);
  db.vaccinations = db.vaccinations.filter((v: Vaccination) => v.petId !== id);
  db.treatments = db.treatments.filter((t: Treatment) => t.petId !== id);
  db.tickfleas = db.tickfleas.filter((tf: TickFlea) => tf.petId !== id);
  db.dewormings = db.dewormings.filter((dw: Deworming) => dw.petId !== id);
  db.vaccinesymptoms = (db.vaccinesymptoms || []).filter((vs: VaccineSymptom) => vs.petId !== id);
  db.heartworms = (db.heartworms || []).filter((hw: Heartworm) => hw.petId !== id);
  db.routinehealths = (db.routinehealths || []).filter((rh: RoutineHealth) => rh.petId !== id);
  db.annualhealths = (db.annualhealths || []).filter((ah: AnnualHealth) => ah.petId !== id);
  db.memories = (db.memories || []).filter((mem: Memory) => mem.petId !== id);
  db.expenses = (db.expenses || []).filter((exp: Expense) => exp.petId !== id);
  writeJsonDb(db);
  return true;
}

// --- Vaccinations API ---
export async function getVaccinations(petId?: string): Promise<Vaccination[]> {
  const sbData = await supabaseGetAll<Vaccination>('vaccinations', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.Vaccinations';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        name: row.name,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : '',
        vetName: row.vetName || '',
        status: row.status
      }));
    } catch (error) {
      console.error('Error fetching vaccinations from MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (petId) {
    return db.vaccinations.filter((v: Vaccination) => v.petId === petId);
  }
  return db.vaccinations;
}

export async function addVaccination(vac: Vaccination): Promise<Vaccination> {
  const sbRes = await supabaseInsert<Vaccination>('vaccinations', vac);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), vac.id)
        .input('petId', mssql.NVarChar(50), vac.petId)
        .input('name', mssql.NVarChar(100), vac.name)
        .input('date', mssql.Date, vac.date)
        .input('dueDate', mssql.Date, vac.dueDate)
        .input('vetName', mssql.NVarChar(100), vac.vetName)
        .input('status', mssql.NVarChar(50), vac.status)
        .query(`
          INSERT INTO dbo.Vaccinations (id, petId, name, date, dueDate, vetName, status)
          VALUES (@id, @petId, @name, @date, @dueDate, @vetName, @status)
        `);
      return vac;
    } catch (error) {
      console.error('Error adding vaccination to MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.vaccinations.push(vac);
  writeJsonDb(db);
  return vac;
}

export async function deleteVaccination(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('vaccinations', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.Vaccinations WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting vaccination from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.vaccinations = db.vaccinations.filter((v: Vaccination) => v.id !== id);
  writeJsonDb(db);
  return true;
}

// --- Treatments API ---
export async function getTreatments(petId?: string): Promise<Treatment[]> {
  const sbData = await supabaseGetAll<Treatment>('treatments', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.Treatments';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        diagnosis: row.diagnosis,
        treatmentDetail: row.treatmentDetail,
        medicine: row.medicine,
        cost: Number(row.cost),
        clinicName: row.clinicName,
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching treatments from MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (petId) {
    return db.treatments.filter((t: Treatment) => t.petId === petId);
  }
  return db.treatments;
}

export async function addTreatment(tr: Treatment): Promise<Treatment> {
  const sbRes = await supabaseInsert<Treatment>('treatments', tr);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), tr.id)
        .input('petId', mssql.NVarChar(50), tr.petId)
        .input('date', mssql.Date, tr.date)
        .input('diagnosis', mssql.NVarChar(200), tr.diagnosis)
        .input('treatmentDetail', mssql.NVarChar(mssql.MAX), tr.treatmentDetail)
        .input('medicine', mssql.NVarChar(200), tr.medicine)
        .input('cost', mssql.Decimal(10, 2), tr.cost)
        .input('clinicName', mssql.NVarChar(100), tr.clinicName)
        .input('notes', mssql.NVarChar(mssql.MAX), tr.notes || null)
        .query(`
          INSERT INTO dbo.Treatments (id, petId, date, diagnosis, treatmentDetail, medicine, cost, clinicName, notes)
          VALUES (@id, @petId, @date, @diagnosis, @treatmentDetail, @medicine, @cost, @clinicName, @notes)
        `);
      return tr;
    } catch (error) {
      console.error('Error adding treatment to MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.treatments.push(tr);
  writeJsonDb(db);
  return tr;
}

export async function deleteTreatment(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('treatments', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.Treatments WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting treatment from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.treatments = db.treatments.filter((t: Treatment) => t.id !== id);
  writeJsonDb(db);
  return true;
}

// --- Tick & Flea API ---
export async function getTickFleas(petId?: string): Promise<TickFlea[]> {
  const sbData = await supabaseGetAll<TickFlea>('tickfleas', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.TickFleas';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : '',
        productName: row.productName,
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching tickfleas from MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (petId) {
    return db.tickfleas.filter((tf: TickFlea) => tf.petId === petId);
  }
  return db.tickfleas;
}

export async function addTickFlea(tf: TickFlea): Promise<TickFlea> {
  const sbRes = await supabaseInsert<TickFlea>('tickfleas', tf);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), tf.id)
        .input('petId', mssql.NVarChar(50), tf.petId)
        .input('date', mssql.Date, tf.date)
        .input('dueDate', mssql.Date, tf.dueDate)
        .input('productName', mssql.NVarChar(100), tf.productName)
        .input('notes', mssql.NVarChar(mssql.MAX), tf.notes || null)
        .query(`
          INSERT INTO dbo.TickFleas (id, petId, date, dueDate, productName, notes)
          VALUES (@id, @petId, @date, @dueDate, @productName, @notes)
        `);
      return tf;
    } catch (error) {
      console.error('Error adding tick/flea record to MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.tickfleas.push(tf);
  writeJsonDb(db);
  return tf;
}

export async function deleteTickFlea(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('tickfleas', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.TickFleas WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting tickflea from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.tickfleas = db.tickfleas.filter((tf: TickFlea) => tf.id !== id);
  writeJsonDb(db);
  return true;
}

// --- Dewormings API ---
export async function getDewormings(petId?: string): Promise<Deworming[]> {
  const sbData = await supabaseGetAll<Deworming>('dewormings', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.Dewormings';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : '',
        medicineName: row.medicineName,
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching dewormings from MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (petId) {
    return db.dewormings.filter((dw: Deworming) => dw.petId === petId);
  }
  return db.dewormings;
}

export async function addDeworming(dw: Deworming): Promise<Deworming> {
  const sbRes = await supabaseInsert<Deworming>('dewormings', dw);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), dw.id)
        .input('petId', mssql.NVarChar(50), dw.petId)
        .input('date', mssql.Date, dw.date)
        .input('dueDate', mssql.Date, dw.dueDate)
        .input('medicineName', mssql.NVarChar(100), dw.medicineName)
        .input('notes', mssql.NVarChar(mssql.MAX), dw.notes || null)
        .query(`
          INSERT INTO dbo.Dewormings (id, petId, date, dueDate, medicineName, notes)
          VALUES (@id, @petId, @date, @dueDate, @medicineName, @notes)
        `);
      return dw;
    } catch (error) {
      console.error('Error adding deworming to MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.dewormings.push(dw);
  writeJsonDb(db);
  return dw;
}

export async function deleteDeworming(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('dewormings', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.Dewormings WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting deworming from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.dewormings = db.dewormings.filter((dw: Deworming) => dw.id !== id);
  writeJsonDb(db);
  return true;
}

// --- VaccineSymptoms API ---
export async function getVaccineSymptoms(petId?: string): Promise<VaccineSymptom[]> {
  const sbData = await supabaseGetAll<VaccineSymptom>('vaccinesymptoms', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.VaccineSymptoms';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        vaccineName: row.vaccineName,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        appetite: row.appetite,
        behavior: row.behavior,
        abnormality: row.abnormality,
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching vaccine symptoms from MSSQL', error);
    }
  }
  const db = readJsonDb();
  const symptoms = db.vaccinesymptoms || [];
  if (petId) {
    return symptoms.filter((vs: VaccineSymptom) => vs.petId === petId);
  }
  return symptoms;
}

export async function addVaccineSymptom(vs: VaccineSymptom): Promise<VaccineSymptom> {
  const sbRes = await supabaseInsert<VaccineSymptom>('vaccinesymptoms', vs);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), vs.id)
        .input('petId', mssql.NVarChar(50), vs.petId)
        .input('vaccineName', mssql.NVarChar(100), vs.vaccineName)
        .input('date', mssql.Date, vs.date)
        .input('appetite', mssql.NVarChar(50), vs.appetite)
        .input('behavior', mssql.NVarChar(50), vs.behavior)
        .input('abnormality', mssql.NVarChar(50), vs.abnormality)
        .input('notes', mssql.NVarChar(mssql.MAX), vs.notes || null)
        .query(`
          INSERT INTO dbo.VaccineSymptoms (id, petId, vaccineName, date, appetite, behavior, abnormality, notes)
          VALUES (@id, @petId, @vaccineName, @date, @appetite, @behavior, @abnormality, @notes)
        `);
      return vs;
    } catch (error) {
      console.error('Error adding vaccine symptom to MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (!db.vaccinesymptoms) db.vaccinesymptoms = [];
  db.vaccinesymptoms.push(vs);
  writeJsonDb(db);
  return vs;
}

export async function deleteVaccineSymptom(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('vaccinesymptoms', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.VaccineSymptoms WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting vaccine symptom from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.vaccinesymptoms = (db.vaccinesymptoms || []).filter((vs: VaccineSymptom) => vs.id !== id);
  writeJsonDb(db);
  return true;
}

// --- Heartworms API ---
export async function getHeartworms(petId?: string): Promise<Heartworm[]> {
  const sbData = await supabaseGetAll<Heartworm>('heartworms', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.Heartworms';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : '',
        productName: row.productName,
        cost: row.cost ? Number(row.cost) : undefined,
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching heartworms from MSSQL', error);
    }
  }
  const db = readJsonDb();
  const list = db.heartworms || [];
  if (petId) {
    return list.filter((hw: Heartworm) => hw.petId === petId);
  }
  return list;
}

export async function addHeartworm(hw: Heartworm): Promise<Heartworm> {
  const sbRes = await supabaseInsert<Heartworm>('heartworms', hw);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), hw.id)
        .input('petId', mssql.NVarChar(50), hw.petId)
        .input('date', mssql.Date, hw.date)
        .input('dueDate', mssql.Date, hw.dueDate)
        .input('productName', mssql.NVarChar(100), hw.productName)
        .input('cost', mssql.Decimal(10, 2), hw.cost || null)
        .input('notes', mssql.NVarChar(mssql.MAX), hw.notes || null)
        .query(`
          INSERT INTO dbo.Heartworms (id, petId, date, dueDate, productName, cost, notes)
          VALUES (@id, @petId, @date, @dueDate, @productName, @cost, @notes)
        `);
      return hw;
    } catch (error) {
      console.error('Error adding heartworm to MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (!db.heartworms) db.heartworms = [];
  db.heartworms.push(hw);
  writeJsonDb(db);
  return hw;
}

export async function deleteHeartworm(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('heartworms', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.Heartworms WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting heartworm from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.heartworms = (db.heartworms || []).filter((hw: Heartworm) => hw.id !== id);
  writeJsonDb(db);
  return true;
}

// --- RoutineHealths API ---
export async function getRoutineHealths(petId?: string): Promise<RoutineHealth[]> {
  const sbData = await supabaseGetAll<RoutineHealth>('routinehealths', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.RoutineHealths';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        category: row.category,
        title: row.title,
        detail: row.detail,
        value: row.value || '',
        cost: row.cost ? Number(row.cost) : undefined,
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching routine healths from MSSQL', error);
    }
  }
  const db = readJsonDb();
  const list = db.routinehealths || [];
  if (petId) {
    return list.filter((rh: RoutineHealth) => rh.petId === petId);
  }
  return list;
}

export async function addRoutineHealth(rh: RoutineHealth): Promise<RoutineHealth> {
  const sbRes = await supabaseInsert<RoutineHealth>('routinehealths', rh);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), rh.id)
        .input('petId', mssql.NVarChar(50), rh.petId)
        .input('date', mssql.Date, rh.date)
        .input('category', mssql.NVarChar(50), rh.category)
        .input('title', mssql.NVarChar(200), rh.title)
        .input('detail', mssql.NVarChar(mssql.MAX), rh.detail)
        .input('value', mssql.NVarChar(200), rh.value || null)
        .input('cost', mssql.Decimal(10, 2), rh.cost || null)
        .input('notes', mssql.NVarChar(mssql.MAX), rh.notes || null)
        .query(`
          INSERT INTO dbo.RoutineHealths (id, petId, date, category, title, detail, value, cost, notes)
          VALUES (@id, @petId, @date, @category, @title, @detail, @value, @cost, @notes)
        `);
      return rh;
    } catch (error) {
      console.error('Error adding routine health to MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (!db.routinehealths) db.routinehealths = [];
  db.routinehealths.push(rh);
  writeJsonDb(db);
  return rh;
}

export async function deleteRoutineHealth(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('routinehealths', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.RoutineHealths WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting routine health from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.routinehealths = (db.routinehealths || []).filter((rh: RoutineHealth) => rh.id !== id);
  writeJsonDb(db);
  return true;
}

// --- AnnualHealths API ---
export async function getAnnualHealths(petId?: string): Promise<AnnualHealth[]> {
  const sbData = await supabaseGetAll<AnnualHealth>('annualhealths', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.AnnualHealths';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        year: Number(row.year),
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        clinicName: row.clinicName,
        physicalExam: row.physicalExam,
        bloodTest: row.bloodTest,
        vaccineStatus: row.vaccineStatus,
        cost: Number(row.cost),
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching annual healths from MSSQL', error);
    }
  }
  const db = readJsonDb();
  const list = db.annualhealths || [];
  if (petId) {
    return list.filter((ah: AnnualHealth) => ah.petId === petId);
  }
  return list;
}

export async function addAnnualHealth(ah: AnnualHealth): Promise<AnnualHealth> {
  const sbRes = await supabaseInsert<AnnualHealth>('annualhealths', ah);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), ah.id)
        .input('petId', mssql.NVarChar(50), ah.petId)
        .input('year', mssql.Int, ah.year)
        .input('date', mssql.Date, ah.date)
        .input('clinicName', mssql.NVarChar(100), ah.clinicName)
        .input('physicalExam', mssql.NVarChar(mssql.MAX), ah.physicalExam)
        .input('bloodTest', mssql.NVarChar(mssql.MAX), ah.bloodTest)
        .input('vaccineStatus', mssql.NVarChar(mssql.MAX), ah.vaccineStatus)
        .input('cost', mssql.Decimal(10, 2), ah.cost)
        .input('notes', mssql.NVarChar(mssql.MAX), ah.notes || null)
        .query(`
          INSERT INTO dbo.AnnualHealths (id, petId, year, date, clinicName, physicalExam, bloodTest, vaccineStatus, cost, notes)
          VALUES (@id, @petId, @year, @date, @clinicName, @physicalExam, @bloodTest, @vaccineStatus, @cost, @notes)
        `);
      return ah;
    } catch (error) {
      console.error('Error adding annual health to MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (!db.annualhealths) db.annualhealths = [];
  db.annualhealths.push(ah);
  writeJsonDb(db);
  return ah;
}

export async function deleteAnnualHealth(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('annualhealths', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.AnnualHealths WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting annual health from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.annualhealths = (db.annualhealths || []).filter((ah: AnnualHealth) => ah.id !== id);
  writeJsonDb(db);
  return true;
}

// --- Memories API ---
export async function getMemories(petId?: string): Promise<Memory[]> {
  const sbData = await supabaseGetAll<Memory>('memories', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.Memories';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        title: row.title,
        story: row.story,
        mood: row.mood,
        notes: row.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching memories from MSSQL', error);
    }
  }
  const db = readJsonDb();
  const list = db.memories || [];
  if (petId) {
    return list.filter((mem: Memory) => mem.petId === petId);
  }
  return list;
}

export async function addMemory(mem: Memory): Promise<Memory> {
  const sbRes = await supabaseInsert<Memory>('memories', mem);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), mem.id)
        .input('petId', mssql.NVarChar(50), mem.petId)
        .input('date', mssql.Date, mem.date)
        .input('title', mssql.NVarChar(200), mem.title)
        .input('story', mssql.NVarChar(mssql.MAX), mem.story)
        .input('mood', mssql.NVarChar(50), mem.mood)
        .input('notes', mssql.NVarChar(mssql.MAX), mem.notes || null)
        .query(`
          INSERT INTO dbo.Memories (id, petId, date, title, story, mood, notes)
          VALUES (@id, @petId, @date, @title, @story, @mood, @notes)
        `);
      return mem;
    } catch (error) {
      console.error('Error adding memory to MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (!db.memories) db.memories = [];
  db.memories.push(mem);
  writeJsonDb(db);
  return mem;
}

export async function deleteMemory(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('memories', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.Memories WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting memory from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.memories = (db.memories || []).filter((mem: Memory) => mem.id !== id);
  writeJsonDb(db);
  return true;
}

// --- Expenses API ---
export async function getExpenses(petId?: string): Promise<Expense[]> {
  const sbData = await supabaseGetAll<Expense>('expenses', petId ? 'petId' : undefined, petId);
  if (sbData) return sbData;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      let query = 'SELECT * FROM dbo.Expenses';
      const req = sqlPool.request();
      if (petId) {
        query += ' WHERE petId = @petId';
        req.input('petId', mssql.NVarChar(50), petId);
      }
      const result = await req.query(query);
      return result.recordset.map((row: any) => ({
        id: row.id,
        petId: row.petId,
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        category: row.category,
        amount: Number(row.amount),
        description: row.description,
        refId: row.refId || undefined
      }));
    } catch (error) {
      console.error('Error fetching expenses from MSSQL', error);
    }
  }
  const db = readJsonDb();
  const list = db.expenses || [];
  if (petId) {
    return list.filter((exp: Expense) => exp.petId === petId);
  }
  return list;
}

export async function addExpense(exp: Expense): Promise<Expense> {
  const sbRes = await supabaseInsert<Expense>('expenses', exp);
  if (sbRes) return sbRes;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), exp.id)
        .input('petId', mssql.NVarChar(50), exp.petId)
        .input('date', mssql.Date, exp.date)
        .input('category', mssql.NVarChar(50), exp.category)
        .input('amount', mssql.Decimal(10, 2), exp.amount)
        .input('description', mssql.NVarChar(200), exp.description)
        .input('refId', mssql.NVarChar(50), exp.refId || null)
        .query(`
          INSERT INTO dbo.Expenses (id, petId, date, category, amount, description, refId)
          VALUES (@id, @petId, @date, @category, @amount, @description, @refId)
        `);
      return exp;
    } catch (error) {
      console.error('Error adding expense to MSSQL', error);
    }
  }
  const db = readJsonDb();
  if (!db.expenses) db.expenses = [];
  db.expenses.push(exp);
  writeJsonDb(db);
  return exp;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const sbRes = await supabaseDelete('expenses', id);
  if (sbRes !== null) return true;

  const sqlPool = await getPool();
  if (sqlPool) {
    try {
      await sqlPool.request()
        .input('id', mssql.NVarChar(50), id)
        .query('DELETE FROM dbo.Expenses WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Error deleting expense from MSSQL', error);
    }
  }
  const db = readJsonDb();
  db.expenses = (db.expenses || []).filter((exp: Expense) => exp.id !== id);
  writeJsonDb(db);
  return true;
}
