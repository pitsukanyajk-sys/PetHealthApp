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

export async function fetchDbStatus(): Promise<DatabaseStatus> {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch DB status');
  return res.json();
}

export async function fetchPets(): Promise<Pet[]> {
  const res = await fetch('/api/pets');
  if (!res.ok) throw new Error('Failed to fetch pets');
  return res.json();
}

export async function createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
  const id = 'pet_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/pets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...pet, id })
  });
  if (!res.ok) throw new Error('Failed to create pet');
  return res.json();
}

export async function updatePet(pet: Pet): Promise<Pet> {
  const res = await fetch(`/api/pets/${pet.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pet)
  });
  if (!res.ok) throw new Error('Failed to update pet');
  return res.json();
}

export async function deletePet(id: string): Promise<boolean> {
  const res = await fetch(`/api/pets/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete pet');
  const data = await res.json();
  return data.success;
}

export async function fetchVaccinations(petId?: string): Promise<Vaccination[]> {
  const url = petId ? `/api/vaccinations?petId=${petId}` : '/api/vaccinations';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch vaccinations');
  return res.json();
}

export async function createVaccination(vac: Omit<Vaccination, 'id'>): Promise<Vaccination> {
  const id = 'vac_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/vaccinations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...vac, id })
  });
  if (!res.ok) throw new Error('Failed to create vaccination');
  return res.json();
}

export async function deleteVaccination(id: string): Promise<boolean> {
  const res = await fetch(`/api/vaccinations/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete vaccination');
  const data = await res.json();
  return data.success;
}

export async function fetchTreatments(petId?: string): Promise<Treatment[]> {
  const url = petId ? `/api/treatments?petId=${petId}` : '/api/treatments';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch treatments');
  return res.json();
}

export async function createTreatment(tr: Omit<Treatment, 'id'>): Promise<Treatment> {
  const id = 'tr_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/treatments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...tr, id })
  });
  if (!res.ok) throw new Error('Failed to create treatment');
  return res.json();
}

export async function deleteTreatment(id: string): Promise<boolean> {
  const res = await fetch(`/api/treatments/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete treatment');
  const data = await res.json();
  return data.success;
}

export async function fetchTickFleas(petId?: string): Promise<TickFlea[]> {
  const url = petId ? `/api/tickfleas?petId=${petId}` : '/api/tickfleas';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tickfleas');
  return res.json();
}

export async function createTickFlea(tf: Omit<TickFlea, 'id'>): Promise<TickFlea> {
  const id = 'tf_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/tickfleas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...tf, id })
  });
  if (!res.ok) throw new Error('Failed to create tickflea record');
  return res.json();
}

export async function deleteTickFlea(id: string): Promise<boolean> {
  const res = await fetch(`/api/tickfleas/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete tickflea record');
  const data = await res.json();
  return data.success;
}

export async function fetchDewormings(petId?: string): Promise<Deworming[]> {
  const url = petId ? `/api/dewormings?petId=${petId}` : '/api/dewormings';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch dewormings');
  return res.json();
}

export async function createDeworming(dw: Omit<Deworming, 'id'>): Promise<Deworming> {
  const id = 'dw_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/dewormings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dw, id })
  });
  if (!res.ok) throw new Error('Failed to create deworming record');
  return res.json();
}

export async function deleteDeworming(id: string): Promise<boolean> {
  const res = await fetch(`/api/dewormings/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete deworming record');
  const data = await res.json();
  return data.success;
}

export async function askAiAdvice(pet: Pet | null, query: string, context: any): Promise<string> {
  const res = await fetch('/api/ai/advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pet, query, context })
  });
  if (!res.ok) {
    try {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to connect to AI server');
    } catch {
      throw new Error('Failed to connect to AI server');
    }
  }
  const data = await res.json();
  return data.advice;
}

// --- VaccineSymptoms API ---
export async function fetchVaccineSymptoms(petId?: string): Promise<VaccineSymptom[]> {
  const url = petId ? `/api/vaccinesymptoms?petId=${petId}` : '/api/vaccinesymptoms';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch vaccine symptoms');
  return res.json();
}

export async function createVaccineSymptom(vs: Omit<VaccineSymptom, 'id'>): Promise<VaccineSymptom> {
  const id = 'vs_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/vaccinesymptoms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...vs, id })
  });
  if (!res.ok) throw new Error('Failed to create vaccine symptom record');
  return res.json();
}

export async function deleteVaccineSymptom(id: string): Promise<boolean> {
  const res = await fetch(`/api/vaccinesymptoms/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete vaccine symptom record');
  const data = await res.json();
  return data.success;
}

// --- Heartworms API ---
export async function fetchHeartworms(petId?: string): Promise<Heartworm[]> {
  const url = petId ? `/api/heartworms?petId=${petId}` : '/api/heartworms';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch heartworms');
  return res.json();
}

export async function createHeartworm(hw: Omit<Heartworm, 'id'>): Promise<Heartworm> {
  const id = 'hw_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/heartworms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...hw, id })
  });
  if (!res.ok) throw new Error('Failed to create heartworm record');
  return res.json();
}

export async function deleteHeartworm(id: string): Promise<boolean> {
  const res = await fetch(`/api/heartworms/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete heartworm record');
  const data = await res.json();
  return data.success;
}

// --- RoutineHealth API ---
export async function fetchRoutineHealths(petId?: string): Promise<RoutineHealth[]> {
  const url = petId ? `/api/routinehealths?petId=${petId}` : '/api/routinehealths';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch routine health records');
  return res.json();
}

export async function createRoutineHealth(rh: Omit<RoutineHealth, 'id'>): Promise<RoutineHealth> {
  const id = 'rh_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/routinehealths', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...rh, id })
  });
  if (!res.ok) throw new Error('Failed to create routine health record');
  return res.json();
}

export async function deleteRoutineHealth(id: string): Promise<boolean> {
  const res = await fetch(`/api/routinehealths/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete routine health record');
  const data = await res.json();
  return data.success;
}

// --- AnnualHealths API ---
export async function fetchAnnualHealths(petId?: string): Promise<AnnualHealth[]> {
  const url = petId ? `/api/annualhealths?petId=${petId}` : '/api/annualhealths';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch annual health checks');
  return res.json();
}

export async function createAnnualHealth(ah: Omit<AnnualHealth, 'id'>): Promise<AnnualHealth> {
  const id = 'ah_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/annualhealths', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...ah, id })
  });
  if (!res.ok) throw new Error('Failed to create annual health check');
  return res.json();
}

export async function deleteAnnualHealth(id: string): Promise<boolean> {
  const res = await fetch(`/api/annualhealths/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete annual health check');
  const data = await res.json();
  return data.success;
}

// --- Memories API ---
export async function fetchMemories(petId?: string): Promise<Memory[]> {
  const url = petId ? `/api/memories?petId=${petId}` : '/api/memories';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch memories');
  return res.json();
}

export async function createMemory(mem: Omit<Memory, 'id'>): Promise<Memory> {
  const id = 'mem_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/memories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...mem, id })
  });
  if (!res.ok) throw new Error('Failed to create memory');
  return res.json();
}

export async function deleteMemory(id: string): Promise<boolean> {
  const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete memory');
  const data = await res.json();
  return data.success;
}

// --- Expenses API ---
export async function fetchExpenses(petId?: string): Promise<Expense[]> {
  const url = petId ? `/api/expenses?petId=${petId}` : '/api/expenses';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function createExpense(exp: Omit<Expense, 'id'>): Promise<Expense> {
  const id = 'exp_' + Math.random().toString(36).substr(2, 9);
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...exp, id })
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function deleteExpense(id: string): Promise<boolean> {
  const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete expense');
  const data = await res.json();
  return data.success;
}
