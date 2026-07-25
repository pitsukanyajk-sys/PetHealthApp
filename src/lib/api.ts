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
} from '../types';

// --- LocalStorage Fallback Helper Functions ---
function getLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocal<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to set localStorage', err);
  }
}

function mergeData<T extends { id: string }>(serverItems: T[], localItems: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of serverItems) map.set(item.id, item);
  for (const item of localItems) map.set(item.id, item);
  return Array.from(map.values());
}

// --- DB Status ---
export async function fetchDbStatus(): Promise<DatabaseStatus> {
  try {
    const res = await fetch('/api/status');
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API status check failed', err);
  }
  return {
    type: 'local',
    connected: true,
    message: 'ระบบใช้งานได้สมบูรณ์ (โหมดออฟไลน์และสำรองข้อมูลอัตโนมัติบนเบราว์เซอร์)'
  };
}

// --- Pets API ---
export async function fetchPets(): Promise<Pet[]> {
  const local = getLocal<Pet>('pethealth_pets');
  try {
    const res = await fetch('/api/pets');
    if (res.ok) {
      const serverPets = await res.json();
      const merged = mergeData(serverPets, local);
      setLocal('pethealth_pets', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API fetchPets failed, using local storage fallback', err);
  }
  return local;
}

export async function createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
  const id = 'pet_' + Math.random().toString(36).substr(2, 9);
  const newPet: Pet = { ...pet, id } as Pet;

  const local = getLocal<Pet>('pethealth_pets');
  const updatedLocal = [newPet, ...local];
  setLocal('pethealth_pets', updatedLocal);

  try {
    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPet)
    });
    if (res.ok) {
      const serverPet = await res.json();
      return serverPet;
    }
  } catch (err) {
    console.warn('API createPet failed, saved locally', err);
  }

  return newPet;
}

export async function updatePet(pet: Pet): Promise<Pet> {
  const local = getLocal<Pet>('pethealth_pets');
  const index = local.findIndex(p => p.id === pet.id);
  let updatedLocal: Pet[];
  if (index >= 0) {
    updatedLocal = [...local];
    updatedLocal[index] = pet;
  } else {
    updatedLocal = [pet, ...local];
  }
  setLocal('pethealth_pets', updatedLocal);

  try {
    const res = await fetch(`/api/pets/${pet.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pet)
    });
    if (res.ok) {
      const serverPet = await res.json();
      return serverPet;
    }
  } catch (err) {
    console.warn('API updatePet failed, updated locally', err);
  }

  return pet;
}

export async function deletePet(id: string): Promise<boolean> {
  const local = getLocal<Pet>('pethealth_pets');
  setLocal('pethealth_pets', local.filter(p => p.id !== id));

  try {
    await fetch(`/api/pets/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API deletePet failed, deleted locally', err);
  }
  return true;
}

// Generic CRUD Helper for Health Records
async function fetchRecords<T extends { id: string; petId: string }>(
  storageKey: string,
  apiEndpoint: string,
  petId?: string
): Promise<T[]> {
  const local = getLocal<T>(storageKey);
  const filterLocal = petId ? local.filter(r => r.petId === petId) : local;

  try {
    const url = petId ? `/api/${apiEndpoint}?petId=${petId}` : `/api/${apiEndpoint}`;
    const res = await fetch(url);
    if (res.ok) {
      const serverData = await res.json();
      const merged = mergeData(serverData, local);
      setLocal(storageKey, merged);
      return petId ? merged.filter(r => r.petId === petId) : merged;
    }
  } catch (err) {
    console.warn(`API fetch ${apiEndpoint} failed, using local storage`, err);
  }
  return filterLocal;
}

async function createRecord<T extends { id: string }>(
  storageKey: string,
  apiEndpoint: string,
  prefix: string,
  recordData: Omit<T, 'id'>
): Promise<T> {
  const id = prefix + '_' + Math.random().toString(36).substr(2, 9);
  const newRecord = { ...recordData, id } as unknown as T;

  const local = getLocal<T>(storageKey);
  setLocal(storageKey, [newRecord, ...local]);

  try {
    const res = await fetch(`/api/${apiEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`API create ${apiEndpoint} failed, saved locally`, err);
  }

  return newRecord;
}

async function deleteRecord<T extends { id: string }>(
  storageKey: string,
  apiEndpoint: string,
  id: string
): Promise<boolean> {
  const local = getLocal<T>(storageKey);
  setLocal(storageKey, local.filter(r => r.id !== id));

  try {
    await fetch(`/api/${apiEndpoint}/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn(`API delete ${apiEndpoint} failed, deleted locally`, err);
  }
  return true;
}

// --- Vaccinations ---
export function fetchVaccinations(petId?: string) {
  return fetchRecords<Vaccination>('pethealth_vaccinations', 'vaccinations', petId);
}
export function createVaccination(vac: Omit<Vaccination, 'id'>) {
  return createRecord<Vaccination>('pethealth_vaccinations', 'vaccinations', 'vac', vac);
}
export function deleteVaccination(id: string) {
  return deleteRecord<Vaccination>('pethealth_vaccinations', 'vaccinations', id);
}

// --- Treatments ---
export function fetchTreatments(petId?: string) {
  return fetchRecords<Treatment>('pethealth_treatments', 'treatments', petId);
}
export function createTreatment(tr: Omit<Treatment, 'id'>) {
  return createRecord<Treatment>('pethealth_treatments', 'treatments', 'tr', tr);
}
export function deleteTreatment(id: string) {
  return deleteRecord<Treatment>('pethealth_treatments', 'treatments', id);
}

// --- TickFleas ---
export function fetchTickFleas(petId?: string) {
  return fetchRecords<TickFlea>('pethealth_tickfleas', 'tickfleas', petId);
}
export function createTickFlea(tf: Omit<TickFlea, 'id'>) {
  return createRecord<TickFlea>('pethealth_tickfleas', 'tickfleas', 'tf', tf);
}
export function deleteTickFlea(id: string) {
  return deleteRecord<TickFlea>('pethealth_tickfleas', 'tickfleas', id);
}

// --- Dewormings ---
export function fetchDewormings(petId?: string) {
  return fetchRecords<Deworming>('pethealth_dewormings', 'dewormings', petId);
}
export function createDeworming(dw: Omit<Deworming, 'id'>) {
  return createRecord<Deworming>('pethealth_dewormings', 'dewormings', 'dw', dw);
}
export function deleteDeworming(id: string) {
  return deleteRecord<Deworming>('pethealth_dewormings', 'dewormings', id);
}

// --- VaccineSymptoms ---
export function fetchVaccineSymptoms(petId?: string) {
  return fetchRecords<VaccineSymptom>('pethealth_vaccinesymptoms', 'vaccinesymptoms', petId);
}
export function createVaccineSymptom(vs: Omit<VaccineSymptom, 'id'>) {
  return createRecord<VaccineSymptom>('pethealth_vaccinesymptoms', 'vaccinesymptoms', 'vs', vs);
}
export function deleteVaccineSymptom(id: string) {
  return deleteRecord<VaccineSymptom>('pethealth_vaccinesymptoms', 'vaccinesymptoms', id);
}

// --- Heartworms ---
export function fetchHeartworms(petId?: string) {
  return fetchRecords<Heartworm>('pethealth_heartworms', 'heartworms', petId);
}
export function createHeartworm(hw: Omit<Heartworm, 'id'>) {
  return createRecord<Heartworm>('pethealth_heartworms', 'heartworms', 'hw', hw);
}
export function deleteHeartworm(id: string) {
  return deleteRecord<Heartworm>('pethealth_heartworms', 'heartworms', id);
}

// --- RoutineHealths ---
export function fetchRoutineHealths(petId?: string) {
  return fetchRecords<RoutineHealth>('pethealth_routinehealths', 'routinehealths', petId);
}
export function createRoutineHealth(rh: Omit<RoutineHealth, 'id'>) {
  return createRecord<RoutineHealth>('pethealth_routinehealths', 'routinehealths', 'rh', rh);
}
export function deleteRoutineHealth(id: string) {
  return deleteRecord<RoutineHealth>('pethealth_routinehealths', 'routinehealths', id);
}

// --- AnnualHealths ---
export function fetchAnnualHealths(petId?: string) {
  return fetchRecords<AnnualHealth>('pethealth_annualhealths', 'annualhealths', petId);
}
export function createAnnualHealth(ah: Omit<AnnualHealth, 'id'>) {
  return createRecord<AnnualHealth>('pethealth_annualhealths', 'annualhealths', 'ah', ah);
}
export function deleteAnnualHealth(id: string) {
  return deleteRecord<AnnualHealth>('pethealth_annualhealths', 'annualhealths', id);
}

// --- Memories ---
export function fetchMemories(petId?: string) {
  return fetchRecords<Memory>('pethealth_memories', 'memories', petId);
}
export function createMemory(mem: Omit<Memory, 'id'>) {
  return createRecord<Memory>('pethealth_memories', 'memories', 'mem', mem);
}
export function deleteMemory(id: string) {
  return deleteRecord<Memory>('pethealth_memories', 'memories', id);
}

// --- Expenses ---
export function fetchExpenses(petId?: string) {
  return fetchRecords<Expense>('pethealth_expenses', 'expenses', petId);
}
export function createExpense(exp: Omit<Expense, 'id'>) {
  return createRecord<Expense>('pethealth_expenses', 'expenses', 'exp', exp);
}
export function deleteExpense(id: string) {
  return deleteRecord<Expense>('pethealth_expenses', 'expenses', id);
}

// --- AI Advice ---
export async function askAiAdvice(pet: Pet | null, query: string, context: any): Promise<string> {
  try {
    const res = await fetch('/api/ai/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pet, query, context })
    });
    if (res.ok) {
      const data = await res.json();
      return data.advice;
    }
  } catch (err) {
    console.warn('AI advice endpoint failed', err);
  }
  return "🐶 ขออภัยนะคะ ขณะนี้ระบบ AI ไม่สามารถประมวลผลได้ชั่วคราว กรุณาลองใหม่อีกครั้งในภายหลังค่ะ";
}
