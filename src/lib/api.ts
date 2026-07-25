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
      const serverPets: Pet[] = await res.json();
      
      // Auto-sync local pets to Supabase if missing from server
      const serverIds = new Set(serverPets.map(p => p.id));
      const unSynced = local.filter(p => !serverIds.has(p.id));
      if (unSynced.length > 0) {
        for (const pet of unSynced) {
          try {
            await fetch('/api/pets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pet)
            });
            serverPets.push(pet);
          } catch (e) {
            console.warn('Failed to sync local pet to server', e);
          }
        }
      }

      setLocal('pethealth_pets', serverPets);
      return serverPets;
    }
  } catch (err) {
    console.warn('API fetchPets failed, using local storage fallback', err);
  }
  return local;
}

export async function createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
  const id = 'pet_' + Math.random().toString(36).substr(2, 9);
  const newPet: Pet = { ...pet, id } as Pet;

  try {
    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPet)
    });
    if (res.ok) {
      const serverPet = await res.json();
      const local = getLocal<Pet>('pethealth_pets');
      setLocal('pethealth_pets', [serverPet, ...local.filter(p => p.id !== serverPet.id)]);
      return serverPet;
    }
  } catch (err) {
    console.warn('API createPet failed, saved locally', err);
  }

  const local = getLocal<Pet>('pethealth_pets');
  setLocal('pethealth_pets', [newPet, ...local]);
  return newPet;
}

export async function updatePet(pet: Pet): Promise<Pet> {
  try {
    const res = await fetch(`/api/pets/${pet.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pet)
    });
    if (res.ok) {
      const serverPet = await res.json();
      const local = getLocal<Pet>('pethealth_pets');
      const index = local.findIndex(p => p.id === serverPet.id);
      const updatedLocal = [...local];
      if (index >= 0) updatedLocal[index] = serverPet;
      else updatedLocal.unshift(serverPet);
      setLocal('pethealth_pets', updatedLocal);
      return serverPet;
    }
  } catch (err) {
    console.warn('API updatePet failed, updated locally', err);
  }

  const local = getLocal<Pet>('pethealth_pets');
  const index = local.findIndex(p => p.id === pet.id);
  const updatedLocal = [...local];
  if (index >= 0) updatedLocal[index] = pet;
  else updatedLocal.unshift(pet);
  setLocal('pethealth_pets', updatedLocal);
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
      const serverData: T[] = await res.json();

      // Auto-sync any local-only items to Supabase
      const serverIds = new Set(serverData.map(r => r.id));
      const unSynced = local.filter(r => !serverIds.has(r.id));
      if (unSynced.length > 0) {
        for (const item of unSynced) {
          try {
            await fetch(`/api/${apiEndpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            });
            serverData.push(item);
          } catch (e) {
            console.warn(`Failed to auto-sync local ${apiEndpoint} item to server`, e);
          }
        }
      }

      setLocal(storageKey, serverData);
      return petId ? serverData.filter(r => r.petId === petId) : serverData;
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

  try {
    const res = await fetch(`/api/${apiEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    });
    if (res.ok) {
      const created: T = await res.json();
      const local = getLocal<T>(storageKey);
      setLocal(storageKey, [created, ...local.filter(r => r.id !== created.id)]);
      return created;
    }
  } catch (err) {
    console.warn(`API create ${apiEndpoint} failed, saved locally`, err);
  }

  const local = getLocal<T>(storageKey);
  setLocal(storageKey, [newRecord, ...local]);
  return newRecord;
}

async function updateRecord<T extends { id: string }>(
  storageKey: string,
  apiEndpoint: string,
  record: T
): Promise<T> {
  try {
    const res = await fetch(`/api/${apiEndpoint}/${record.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (res.ok) {
      const updated: T = await res.json();
      const local = getLocal<T>(storageKey);
      const index = local.findIndex(r => r.id === updated.id);
      const updatedLocal = [...local];
      if (index >= 0) updatedLocal[index] = updated;
      else updatedLocal.unshift(updated);
      setLocal(storageKey, updatedLocal);
      return updated;
    }
  } catch (err) {
    console.warn(`API update ${apiEndpoint} failed, updated locally`, err);
  }

  const local = getLocal<T>(storageKey);
  const index = local.findIndex(r => r.id === record.id);
  const updatedLocal = [...local];
  if (index >= 0) updatedLocal[index] = record;
  else updatedLocal.unshift(record);
  setLocal(storageKey, updatedLocal);
  return record;
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
export function updateVaccination(vac: Vaccination) {
  return updateRecord<Vaccination>('pethealth_vaccinations', 'vaccinations', vac);
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
export function updateTreatment(tr: Treatment) {
  return updateRecord<Treatment>('pethealth_treatments', 'treatments', tr);
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
export function updateTickFlea(tf: TickFlea) {
  return updateRecord<TickFlea>('pethealth_tickfleas', 'tickfleas', tf);
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
export function updateDeworming(dw: Deworming) {
  return updateRecord<Deworming>('pethealth_dewormings', 'dewormings', dw);
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
export function updateVaccineSymptom(vs: VaccineSymptom) {
  return updateRecord<VaccineSymptom>('pethealth_vaccinesymptoms', 'vaccinesymptoms', vs);
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
export function updateHeartworm(hw: Heartworm) {
  return updateRecord<Heartworm>('pethealth_heartworms', 'heartworms', hw);
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
export function updateRoutineHealth(rh: RoutineHealth) {
  return updateRecord<RoutineHealth>('pethealth_routinehealths', 'routinehealths', rh);
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
export function updateAnnualHealth(ah: AnnualHealth) {
  return updateRecord<AnnualHealth>('pethealth_annualhealths', 'annualhealths', ah);
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
export function updateMemory(mem: Memory) {
  return updateRecord<Memory>('pethealth_memories', 'memories', mem);
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
export function updateExpense(exp: Expense) {
  return updateRecord<Expense>('pethealth_expenses', 'expenses', exp);
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
