import React, { useState, useEffect } from 'react';
import { Pet, Vaccination, Treatment, TickFlea, Deworming, DatabaseStatus, Heartworm, VaccineSymptom, RoutineHealth, AnnualHealth, Memory, Expense } from './types';
import {
  fetchDbStatus,
  fetchPets,
  createPet,
  updatePet,
  deletePet,
  fetchVaccinations,
  fetchTreatments,
  fetchTickFleas,
  fetchDewormings,
  fetchHeartworms,
  fetchVaccineSymptoms,
  fetchRoutineHealths,
  fetchAnnualHealths,
  fetchMemories,
  fetchExpenses
} from './lib/api';
import VaccineList from './components/VaccineList';
import TreatmentList from './components/TreatmentList';
import ParasiteList from './components/ParasiteList';
import AiAssistant from './components/AiAssistant';
import DbGuide from './components/DbGuide';

// Import new modular components
import Dashboard from './components/Dashboard';
import VaccineSymptoms from './components/VaccineSymptoms';
import VaccineKnowledge from './components/VaccineKnowledge';
import RoutineHealthComponent from './components/RoutineHealth';
import AnnualHealthComponent from './components/AnnualHealth';
import MemoriesComponent from './components/Memories';
import ExpensesComponent from './components/Expenses';
import PetIdCard from './components/PetIdCard';
import { formatThaiDate, formatPhoneNumber } from './lib/utils';

import { 
  Plus, 
  Trash2, 
  Edit3, 
  User, 
  Info, 
  Database, 
  Calendar, 
  Check, 
  CheckCircle,
  Heart,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  PieChart,
  Activity,
  Stethoscope,
  Scissors,
  Syringe,
  Bug,
  BookOpen,
  Coins,
  X
} from 'lucide-react';

export default function App() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    type: 'local',
    connected: true,
    message: 'กำลังโหลดสถานะฐานข้อมูล...'
  });
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  
  // Active pet's health records
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [tickFleas, setTickFleas] = useState<TickFlea[]>([]);
  const [dewormings, setDewormings] = useState<Deworming[]>([]);
  const [heartworms, setHeartworms] = useState<Heartworm[]>([]);
  const [vaccineSymptoms, setVaccineSymptoms] = useState<VaccineSymptom[]>([]);
  const [routineHealths, setRoutineHealths] = useState<RoutineHealth[]>([]);
  const [annualHealths, setAnnualHealths] = useState<AnnualHealth[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // UI Panels
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vaccines' | 'treatments' | 'parasites' | 'routine' | 'annual' | 'memories' | 'expenses' | 'ai' | 'guide'>('dashboard');
  const [showPetForm, setShowPetForm] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form fields for Pet
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat' | 'bird' | 'rabbit' | 'other'>('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petBirthDate, setPetBirthDate] = useState('');
  const [petGender, setPetGender] = useState<'male' | 'female'>('male');
  const [petWeight, setPetWeight] = useState('');
  const [petOwnerName, setPetOwnerName] = useState('');
  const [petNotes, setPetNotes] = useState('');
  const [petMicrochipId, setPetMicrochipId] = useState('');
  const [petBirthPlace, setPetBirthPlace] = useState('');
  const [petAdoptedDate, setPetAdoptedDate] = useState('');
  const [petAdoptedAge, setPetAdoptedAge] = useState('');
  const [petOwnerPhone, setPetOwnerPhone] = useState('');
  const [petOwnerAddress, setPetOwnerAddress] = useState('');
  const [petAvatarUrl, setPetAvatarUrl] = useState('');
  
  // Deceased fields
  const [isDeceased, setIsDeceased] = useState(false);
  const [petDeathDate, setPetDeathDate] = useState('');
  const [petDeathReason, setPetDeathReason] = useState('');
  const [petDeathAge, setPetDeathAge] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Auto-calculate death age when birthDate or deathDate changes
  useEffect(() => {
    if (isDeceased && petBirthDate && petDeathDate) {
      try {
        const birth = new Date(petBirthDate);
        const death = new Date(petDeathDate);
        let years = death.getFullYear() - birth.getFullYear();
        let months = death.getMonth() - birth.getMonth();
        if (months < 0 || (months === 0 && death.getDate() < birth.getDate())) {
          years--;
          months += 12;
        }
        if (years > 0) {
          setPetDeathAge(`${years} ปี ${months} เดือน`);
        } else if (months >= 0) {
          setPetDeathAge(`${months} เดือน`);
        } else {
          setPetDeathAge('0 เดือน (กรุณาตรวจสอบวันที่)');
        }
      } catch {
        setPetDeathAge('');
      }
    } else {
      setPetDeathAge('');
    }
  }, [isDeceased, petBirthDate, petDeathDate]);

  // Initial Load
  useEffect(() => {
    loadDatabaseStatus();
    loadPetsList();
  }, []);

  // Selected Pet Load Records
  useEffect(() => {
    if (selectedPet) {
      loadPetHealthRecords(selectedPet.id);
    } else {
      setVaccines([]);
      setTreatments([]);
      setTickFleas([]);
      setDewormings([]);
      setHeartworms([]);
      setVaccineSymptoms([]);
      setRoutineHealths([]);
      setAnnualHealths([]);
      setMemories([]);
      setExpenses([]);
    }
  }, [selectedPet]);

  const loadDatabaseStatus = async () => {
    try {
      const status = await fetchDbStatus();
      setDbStatus(status);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPetsList = async (selectNewId?: string) => {
    setLoading(true);
    try {
      const list = await fetchPets();
      setPets(list);
      if (list.length > 0) {
        if (selectNewId) {
          const found = list.find(p => p.id === selectNewId);
          setSelectedPet(found || list[0]);
        } else if (!selectedPet || !list.some(p => p.id === selectedPet.id)) {
          setSelectedPet(list[0]);
        } else {
          // Keep current selected pet but updated data
          const updated = list.find(p => p.id === selectedPet.id);
          setSelectedPet(updated || list[0]);
        }
      } else {
        setSelectedPet(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPetHealthRecords = async (petId: string) => {
    setRecordsLoading(true);
    try {
      const [vacs, trs, tfs, dws, hws, syms, rths, anhs, mems, exps] = await Promise.all([
        fetchVaccinations(petId),
        fetchTreatments(petId),
        fetchTickFleas(petId),
        fetchDewormings(petId),
        fetchHeartworms(petId),
        fetchVaccineSymptoms(petId),
        fetchRoutineHealths(petId),
        fetchAnnualHealths(petId),
        fetchMemories(petId),
        fetchExpenses(petId)
      ]);
      setVaccines(vacs);
      setTreatments(trs);
      setTickFleas(tfs);
      setDewormings(dws);
      setHeartworms(hws);
      setVaccineSymptoms(syms);
      setRoutineHealths(rths);
      setAnnualHealths(anhs);
      setMemories(mems);
      setExpenses(exps);
    } catch (err) {
      console.error('Error loading pet health records', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !petBreed || !petBirthDate || !petWeight || !petOwnerName) {
      alert('กรุณากรอกข้อมูลน้องให้ครบถ้วนด้วยนะคะ 🐾');
      return;
    }
    
    const weightNum = parseFloat(petWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      alert('กรุณาระบุน้ำหนักน้องให้ถูกต้องค่ะ');
      return;
    }

    try {
      if (isEditingPet && selectedPet) {
        const payload: Pet = {
          id: selectedPet.id,
          name: petName,
          type: petType,
          breed: petBreed,
          birthDate: petBirthDate,
          gender: petGender,
          weight: weightNum,
          ownerName: petOwnerName,
          notes: petNotes,
          microchipId: petMicrochipId,
          birthPlace: petBirthPlace,
          adoptedDate: petAdoptedDate || undefined,
          adoptedAge: petAdoptedAge,
          ownerPhone: petOwnerPhone,
          ownerAddress: petOwnerAddress,
          deathDate: isDeceased ? petDeathDate : undefined,
          deathReason: isDeceased ? petDeathReason : undefined,
          deathAge: isDeceased ? petDeathAge : undefined,
          avatarUrl: petAvatarUrl || undefined
        };
        const updated = await updatePet(payload);
        await loadPetsList(updated.id);
        setIsEditingPet(false);
      } else {
        const payload = {
          name: petName,
          type: petType,
          breed: petBreed,
          birthDate: petBirthDate,
          gender: petGender,
          weight: weightNum,
          ownerName: petOwnerName,
          notes: petNotes,
          microchipId: petMicrochipId,
          birthPlace: petBirthPlace,
          adoptedDate: petAdoptedDate || undefined,
          adoptedAge: petAdoptedAge,
          ownerPhone: petOwnerPhone,
          ownerAddress: petOwnerAddress,
          deathDate: isDeceased ? petDeathDate : undefined,
          deathReason: isDeceased ? petDeathReason : undefined,
          deathAge: isDeceased ? petDeathAge : undefined,
          avatarUrl: petAvatarUrl || undefined
        };
        const created = await createPet(payload);
        await loadPetsList(created.id);
      }
      resetPetForm();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเซฟข้อมูลสัตว์เลี้ยงได้ค่ะ');
    }
  };

  const handleUpdatePetWeight = async (newWeight: number) => {
    if (!selectedPet) return;
    try {
      const updated = await updatePet({
        ...selectedPet,
        weight: newWeight
      });
      await loadPetsList(updated.id);
    } catch (err) {
      console.error('Failed to update pet weight', err);
    }
  };

  const handleEditPetClick = () => {
    if (!selectedPet) return;
    if (selectedPet.deathDate) {
      alert('สัตว์เลี้ยงตัวนี้ระบุว่าเสียชีวิตแล้ว ถูกล็อคไว้ไม่ให้แก้ไขหรือบันทึกข้อมูลใดๆ เพิ่มเติมค่ะ (ดูได้อย่างเดียว)');
      return;
    }
    setPetName(selectedPet.name);
    setPetType(selectedPet.type);
    setPetBreed(selectedPet.breed);
    setPetBirthDate(selectedPet.birthDate);
    setPetGender(selectedPet.gender);
    setPetWeight(selectedPet.weight.toString());
    setPetOwnerName(selectedPet.ownerName);
    setPetNotes(selectedPet.notes || '');
    setPetMicrochipId(selectedPet.microchipId || '');
    setPetBirthPlace(selectedPet.birthPlace || '');
    setPetAdoptedDate(selectedPet.adoptedDate || '');
    setPetAdoptedAge(selectedPet.adoptedAge || '');
    setPetOwnerPhone(selectedPet.ownerPhone || '');
    setPetOwnerAddress(selectedPet.ownerAddress || '');
    setIsDeceased(!!selectedPet.deathDate);
    setPetDeathDate(selectedPet.deathDate || '');
    setPetDeathReason(selectedPet.deathReason || '');
    setPetDeathAge(selectedPet.deathAge || '');
    setPetAvatarUrl(selectedPet.avatarUrl || '');
    setIsEditingPet(true);
    setShowPetForm(true);
  };

  const handleDeletePetClick = () => {
    if (!selectedPet) return;
    setShowDeleteConfirm(true);
  };

  const resetPetForm = () => {
    setPetName('');
    setPetType('dog');
    setPetBreed('');
    setPetBirthDate('');
    setPetGender('male');
    setPetWeight('');
    setPetOwnerName('');
    setPetNotes('');
    setPetMicrochipId('');
    setPetBirthPlace('');
    setPetAdoptedDate('');
    setPetAdoptedAge('');
    setPetOwnerPhone('');
    setPetOwnerAddress('');
    setIsDeceased(false);
    setPetDeathDate('');
    setPetDeathReason('');
    setPetDeathAge('');
    setPetAvatarUrl('');
    setShowPetForm(false);
    setIsEditingPet(false);
  };

  const getPetEmoji = (type: string) => {
    switch (type) {
      case 'dog': return '🐶';
      case 'cat': return '🐱';
      case 'bird': return '🦜';
      case 'rabbit': return '🐰';
      default: return '🐾';
    }
  };

  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return 'ไม่ระบุอายุ';
    try {
      const birthDate = new Date(birthDateString);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      
      if (years > 0) {
        return `${years} ปี ${months} เดือน`;
      }
      return `${months} เดือน`;
    } catch {
      return 'ไม่ระบุอายุ';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-stone-850 font-sans pb-12">
      {/* Upper Navigation Bar */}
      <header className="bg-[#5C4033] text-amber-50 shadow-md border-b-4 border-amber-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2 text-[#F7E7CE]">
                แอพบันทึกประวัติสุขภาพสัตว์เลี้ยงครบวงจร
              </h1>
              <p className="text-xs text-amber-200">
                ระบบจัดการประวัติน้องหมาน้องแมว ตารางวัคซีน ยาเห็บหมัด พร้อมสัตวแพทย์ AI แสนดี 🩺
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {dbStatus.type === 'mssql' && dbStatus.connected && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-green-800 border-green-700 text-green-200">
                <Database className="w-3.5 h-3.5" />
                MS SQL Server Connected
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Side: Pets List, ID Card & Navigation (lg:col-span-4) */}
          <section className="lg:col-span-4 space-y-4">
            {/* Family Selector */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100/60 space-y-3.5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">สมาชิกสัตว์เลี้ยงแสนรัก ({pets.length})</h3>
                <button
                  id="btn-add-pet"
                  onClick={() => {
                    resetPetForm();
                    setShowPetForm(true);
                  }}
                  className="bg-amber-700 hover:bg-amber-800 text-white rounded-full p-2 hover:scale-105 transition-all shadow-sm flex items-center justify-center cursor-pointer"
                  title="เพิ่มสัตว์เลี้ยงใหม่"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {loading && pets.length === 0 ? (
                <p className="text-center py-4 text-sm text-stone-500 font-sans">กำลังอุ้มน้อง ๆ ออกมา...</p>
              ) : pets.length === 0 ? (
                <div className="text-center py-6 bg-amber-50/20 border border-dashed border-amber-200 rounded-xl">
                  <p className="text-xs text-stone-500 font-sans">ยังไม่มีสมาชิกในบ้านค่ะ</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {pets.map((p) => {
                    const isSelected = selectedPet && selectedPet.id === p.id;
                    return (
                      <button
                        key={p.id}
                        id={`pet-card-${p.id}`}
                        onClick={() => {
                          setSelectedPet(p);
                          setActiveTab('dashboard');
                        }}
                        className="relative shrink-0 flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
                      >
                        <div className={`w-13 h-13 rounded-full border-2 p-0.5 transition-all duration-200 ${
                          isSelected 
                            ? 'border-amber-750 bg-amber-50 scale-105 shadow-md' 
                            : 'border-stone-200 hover:border-amber-300'
                        }`}>
                          {p.avatarUrl ? (
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-amber-100/40 flex items-center justify-center text-2xl">
                              {getPetEmoji(p.type)}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs font-bold truncate max-w-[64px] ${
                          isSelected ? 'text-amber-950 font-black' : 'text-stone-500'
                        }`}>
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Pet Health ID Card (Physical Thai ID style) */}
            {selectedPet && (
              <PetIdCard 
                pet={selectedPet} 
                onEdit={handleEditPetClick} 
                onDelete={handleDeletePetClick} 
              />
            )}


          </section>

          {/* Right Side: Health Logs & Tabs (lg:col-span-8) */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Redesigned Premium Navigation Menu Bar */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-amber-100/65 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none md:grid md:grid-cols-9 md:gap-1.5 md:whitespace-normal">
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#5C4033] text-white shadow'
                    : 'text-stone-600 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <PieChart className="w-4 h-4 shrink-0" />
                <span>แดชบอร์ด</span>
              </button>
              <button
                id="tab-vaccines"
                onClick={() => setActiveTab('vaccines')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'vaccines'
                    ? 'bg-[#5C4033] text-white shadow'
                    : 'text-stone-600 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <Syringe className="w-4 h-4 shrink-0" />
                <span>วัคซีน</span>
              </button>
              <button
                id="tab-treatments"
                onClick={() => setActiveTab('treatments')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'treatments'
                    ? 'bg-[#5C4033] text-white shadow'
                    : 'text-stone-650 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <Stethoscope className="w-4 h-4 shrink-0" />
                <span>การรักษา</span>
              </button>
              <button
                id="tab-parasites"
                onClick={() => setActiveTab('parasites')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'parasites'
                    ? 'bg-[#5C4033] text-white shadow'
                    : 'text-stone-600 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <Bug className="w-4 h-4 shrink-0" />
                <span>เห็บ/พยาธิ</span>
              </button>
              <button
                id="tab-routine"
                onClick={() => setActiveTab('routine')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'routine'
                    ? 'bg-[#5C4033] text-white shadow'
                    : 'text-stone-650 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <Scissors className="w-4 h-4 shrink-0" />
                <span>การดูแล</span>
              </button>
              <button
                id="tab-annual"
                onClick={() => setActiveTab('annual')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'annual'
                    ? 'bg-[#5C4033] text-white shadow'
                    : 'text-stone-650 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0" />
                <span>สุขภาพ</span>
              </button>
              <button
                id="tab-memories"
                onClick={() => setActiveTab('memories')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'memories'
                    ? 'bg-[#5C4033] text-white shadow'
                    : 'text-stone-650 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>สมุดบันทึก</span>
              </button>
              <button
                id="tab-expenses"
                onClick={() => setActiveTab('expenses')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'expenses'
                    ? 'bg-[#5C4033] text-white shadow'
                    : 'text-stone-650 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <Coins className="w-4 h-4 shrink-0" />
                <span>ค่าใช้จ่าย</span>
              </button>
              <button
                id="tab-ai"
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-2 text-xs rounded-xl font-bold flex flex-row md:flex-col items-center justify-center gap-1.5 transition-all duration-205 cursor-pointer w-full shrink-0 ${
                  activeTab === 'ai'
                    ? 'bg-[#5C4033] text-white shadow border border-amber-900/40'
                    : 'text-stone-650 hover:bg-amber-50/50 hover:text-amber-950 border border-transparent hover:border-amber-100/50'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>สัตวแพทย์ AI</span>
              </button>
            </div>

            {/* Records Loading Indicator */}
            {recordsLoading && (
              <div className="bg-white rounded-2xl p-8 border border-amber-100 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
                กำลังเปิดแฟ้มประวัติสุขภาพของน้อง...
              </div>
            )}

            {/* Active Tab View */}
            {!recordsLoading && (
              <div className="transition-all duration-300">
                {activeTab === 'dashboard' && (
                  selectedPet ? (
                    <Dashboard
                      pet={selectedPet}
                      vaccines={vaccines}
                      treatments={treatments}
                      tickFleas={tickFleas}
                      dewormings={dewormings}
                      heartworms={heartworms}
                      routineHealths={routineHealths}
                      annualHealths={annualHealths}
                      memories={memories}
                      expenses={expenses}
                      onNavigate={(tab) => setActiveTab(tab)}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-amber-100 text-center font-sans">
                      <p className="text-stone-500 text-sm">กรุณาเลือกหรือเพิ่มสัตว์เลี้ยงด้านซ้ายเพื่อดูแดชบอร์ดค่ะ 🐾</p>
                    </div>
                  )
                )}

                {activeTab === 'vaccines' && (
                  selectedPet ? (
                    <div className="space-y-8">
                      <VaccineList
                        petId={selectedPet.id}
                        vaccines={vaccines}
                        onRefresh={() => loadPetHealthRecords(selectedPet.id)}
                        isReadOnly={!!selectedPet.deathDate}
                        petWeight={selectedPet.weight}
                        petBirthDate={selectedPet.birthDate}
                        onUpdatePetWeight={handleUpdatePetWeight}
                      />
                      <VaccineSymptoms
                        petId={selectedPet.id}
                        symptoms={vaccineSymptoms}
                        onRefresh={() => loadPetHealthRecords(selectedPet.id)}
                        isReadOnly={!!selectedPet.deathDate}
                      />
                      <VaccineKnowledge />
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-amber-100 text-center font-sans">
                      <p className="text-stone-500 text-sm">กรุณาเลือกสัตว์เลี้ยงด้านซ้ายเพื่อดูประวัติวัคซีนค่ะ 🐾</p>
                    </div>
                  )
                )}

                {activeTab === 'treatments' && (
                  selectedPet ? (
                    <TreatmentList
                      petId={selectedPet.id}
                      treatments={treatments}
                      onRefresh={() => loadPetHealthRecords(selectedPet.id)}
                      isReadOnly={!!selectedPet.deathDate}
                      petWeight={selectedPet.weight}
                      petBirthDate={selectedPet.birthDate}
                      onUpdatePetWeight={handleUpdatePetWeight}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-amber-100 text-center font-sans">
                      <p className="text-stone-500 text-sm">กรุณาเลือกสัตว์เลี้ยงด้านซ้ายเพื่อดูประวัติการรักษาค่ะ 🐾</p>
                    </div>
                  )
                )}

                {activeTab === 'parasites' && (
                  selectedPet ? (
                    <ParasiteList
                      petId={selectedPet.id}
                      tickFleas={tickFleas}
                      dewormings={dewormings}
                      heartworms={heartworms}
                      onRefresh={() => loadPetHealthRecords(selectedPet.id)}
                      isReadOnly={!!selectedPet.deathDate}
                      petWeight={selectedPet.weight}
                      petBirthDate={selectedPet.birthDate}
                      onUpdatePetWeight={handleUpdatePetWeight}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-amber-100 text-center font-sans">
                      <p className="text-stone-500 text-sm">กรุณาเลือกสัตว์เลี้ยงด้านซ้ายเพื่อดูประวัติการป้องกันเห็บและพยาธิค่ะ 🐾</p>
                    </div>
                  )
                )}

                {activeTab === 'routine' && (
                  selectedPet ? (
                    <RoutineHealthComponent
                      petId={selectedPet.id}
                      records={routineHealths}
                      onRefresh={() => loadPetHealthRecords(selectedPet.id)}
                      isReadOnly={!!selectedPet.deathDate}
                      petWeight={selectedPet.weight}
                      petBirthDate={selectedPet.birthDate}
                      onUpdatePetWeight={handleUpdatePetWeight}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-amber-100 text-center font-sans">
                      <p className="text-stone-500 text-sm">กรุณาเลือกสัตว์เลี้ยงด้านซ้ายเพื่อดูประวัติการดูแลฟันและกรูมมิ่งค่ะ 🐾</p>
                    </div>
                  )
                )}

                {activeTab === 'annual' && (
                  selectedPet ? (
                    <AnnualHealthComponent
                      petId={selectedPet.id}
                      records={annualHealths}
                      onRefresh={() => loadPetHealthRecords(selectedPet.id)}
                      isReadOnly={!!selectedPet.deathDate}
                      petWeight={selectedPet.weight}
                      petBirthDate={selectedPet.birthDate}
                      onUpdatePetWeight={handleUpdatePetWeight}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-amber-100 text-center font-sans">
                      <p className="text-stone-500 text-sm">กรุณาเลือกสัตว์เลี้ยงด้านซ้ายเพื่อดูประวัติการตรวจสุขภาพประจำปีค่ะ 🐾</p>
                    </div>
                  )
                )}

                {activeTab === 'memories' && (
                  selectedPet ? (
                    <MemoriesComponent
                      petId={selectedPet.id}
                      records={memories}
                      onRefresh={() => loadPetHealthRecords(selectedPet.id)}
                      isReadOnly={!!selectedPet.deathDate}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-amber-100 text-center font-sans">
                      <p className="text-stone-500 text-sm">กรุณาเลือกสัตว์เลี้ยงด้านซ้ายเพื่อเขียนไดอารี่น้องค่ะ 🐾</p>
                    </div>
                  )
                )}

                {activeTab === 'expenses' && (
                  selectedPet ? (
                    <ExpensesComponent
                      petId={selectedPet.id}
                      activePet={selectedPet}
                      expenses={expenses}
                      onRefresh={() => loadPetHealthRecords(selectedPet.id)}
                      isReadOnly={!!selectedPet.deathDate}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-amber-100 text-center font-sans">
                      <p className="text-stone-500 text-sm">กรุณาเลือกสัตว์เลี้ยงด้านซ้ายเพื่อบันทึกและจำแนกรายจ่ายค่ะ 🐾</p>
                    </div>
                  )
                )}

                {activeTab === 'ai' && (
                  <AiAssistant
                    activePet={selectedPet}
                    petRecords={{
                      vaccines,
                      treatments,
                      tickFleas,
                      dewormings,
                      heartworms,
                      vaccineSymptoms,
                      routineHealths,
                      annualHealths,
                      memories,
                      expenses
                    }}
                  />
                )}

                {activeTab === 'guide' && (
                  <DbGuide dbStatus={dbStatus} />
                )}
              </div>
            )}

          </section>

        </div>
      </main>
      
      {/* Add / Edit Pet Form Overlay */}
      {showPetForm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-100/80 overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-800 to-amber-950 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold font-display text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                {isEditingPet ? 'แก้ไขโปรไฟล์น้อง' : 'ต้อนรับสมาชิกใหม่'}
              </h3>
              <button
                type="button"
                onClick={resetPetForm}
                className="text-amber-100 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="pet-form" onSubmit={handlePetSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
              {/* Section 1: Pet Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-amber-900 text-sm border-l-4 border-amber-700 pl-2">ส่วนที่ 1: ข้อมูลสัตว์เลี้ยง (Pet Information)</h4>
                
                {/* Pet Image Upload */}
                <div className="flex flex-col items-center gap-3 bg-white p-3.5 rounded-xl border border-amber-100 shadow-sm">
                  <span className="block text-xs font-semibold text-stone-700">รูปภาพประจำตัวของน้อง (Pet Photo)</span>
                  <div className="relative group">
                    {petAvatarUrl ? (
                      <img
                        src={petAvatarUrl}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-amber-600 shadow"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-amber-50 border-2 border-dashed border-amber-300 flex items-center justify-center text-4xl shadow-inner">
                        {getPetEmoji(petType)}
                      </div>
                    )}
                    {petAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setPetAvatarUrl('')}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                        title="ลบรูปภาพ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <label className="bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 border border-amber-200 text-xs px-3 py-1.5 rounded-lg font-bold cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                      <span>📸 อัปโหลดรูปภาพน้อง</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 300;
                                const MAX_HEIGHT = 300;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  // Compress to JPEG with 70% quality to get a very lightweight image (<30KB)
                                  const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                                  setPetAvatarUrl(compressedDataUrl);
                                }
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อสัตว์เลี้ยง *</label>
                  <input
                    id="pet-name-input"
                    type="text"
                    placeholder="เช่น ส้มแป้น, โกโก้"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">ประเภทน้อง *</label>
                    <select
                      id="pet-type-select"
                      value={petType}
                      onChange={(e) => setPetType(e.target.value as any)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="dog">สุนัข (Dog)</option>
                      <option value="cat">แมว (Cat)</option>
                      <option value="rabbit">กระต่าย (Rabbit)</option>
                      <option value="bird">นก (Bird)</option>
                      <option value="other">อื่นๆ (Other)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">เพศ *</label>
                    <select
                      id="pet-gender-select"
                      value={petGender}
                      onChange={(e) => setPetGender(e.target.value as any)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="male">ตัวผู้ (ผู้)</option>
                      <option value="female">ตัวเมีย (เมีย)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">สายพันธุ์ *</label>
                    <input
                      id="pet-breed-input"
                      type="text"
                      placeholder="เช่น เปอร์เซีย, ไทย"
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">น้ำหนัก (kg) *</label>
                    <input
                      id="pet-weight-input"
                      type="number"
                      step="0.01"
                      placeholder="เช่น 4.5"
                      value={petWeight}
                      onChange={(e) => setPetWeight(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">วันเกิดน้อง *</label>
                    <input
                      id="pet-birth-input"
                      type="date"
                      value={petBirthDate}
                      onChange={(e) => setPetBirthDate(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">เลขไมโครชิป (Microchip ID)</label>
                    <input
                      id="pet-microchip-input"
                      type="text"
                      placeholder="เช่น 900115000..."
                      value={petMicrochipId}
                      onChange={(e) => setPetMicrochipId(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">สถานที่เกิด/ฟาร์ม</label>
                    <input
                      id="pet-birthplace-input"
                      type="text"
                      placeholder="เช่น ฟาร์มแสนดี..."
                      value={petBirthPlace}
                      onChange={(e) => setPetBirthPlace(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">วันที่รับเลี้ยง</label>
                    <input
                      id="pet-adopted-date-input"
                      type="date"
                      value={petAdoptedDate}
                      onChange={(e) => setPetAdoptedDate(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-2 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">อายุ ณ วันรับเลี้ยง</label>
                    <input
                      id="pet-adopted-age-input"
                      type="text"
                      placeholder="เช่น 2 เดือน"
                      value={petAdoptedAge}
                      onChange={(e) => setPetAdoptedAge(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">บันทึกนิสัยและเรื่องน่ารู้</label>
                  <textarea
                    id="pet-notes-textarea"
                    rows={2}
                    placeholder="เช่น ขี้อ้อนมาก กลัวเครื่องดูดฝุ่น"
                    value={petNotes}
                    onChange={(e) => setPetNotes(e.target.value)}
                    className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Deceased Pet Option */}
                <div className="bg-stone-50 border border-stone-250/60 rounded-xl p-3.5 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800 text-sm">
                    <input
                      type="checkbox"
                      checked={isDeceased}
                      onChange={(e) => setIsDeceased(e.target.checked)}
                      className="rounded text-amber-700 focus:ring-amber-500 h-4.5 w-4.5"
                    />
                    <span>🕯️ บันทึกเป็นสัตว์เลี้ยงที่เสียชีวิตแล้ว (Deceased Record)</span>
                  </label>
                  
                  {isDeceased && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5 animate-fade-in">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">วันที่เสียชีวิต *</label>
                        <input
                          type="date"
                          value={petDeathDate}
                          onChange={(e) => setPetDeathDate(e.target.value)}
                          className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required={isDeceased}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">สาเหตุการเสียชีวิต *</label>
                        <input
                          type="text"
                          placeholder="เช่น ชราภาพ, ป่วยไข้หวัดใหญ่"
                          value={petDeathReason}
                          onChange={(e) => setPetDeathReason(e.target.value)}
                          className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required={isDeceased}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">อายุ ณ ช่วงที่เสียชีวิต</label>
                        <input
                          type="text"
                          placeholder="จะคำนวณอัตโนมัติ"
                          value={petDeathAge}
                          onChange={(e) => setPetDeathAge(e.target.value)}
                          className="w-full text-xs bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 text-stone-700 font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Owner Information */}
              <div className="space-y-3 pt-2 border-t border-amber-100">
                <h4 className="font-bold text-amber-900 text-sm border-l-4 border-amber-700 pl-2">ส่วนที่ 2: ข้อมูลเจ้าของ (Owner Information)</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อเจ้าของน้อง *</label>
                    <input
                      id="pet-owner-input"
                      type="text"
                      placeholder="เช่น สมชาย ใจดี"
                      value={petOwnerName}
                      onChange={(e) => setPetOwnerName(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">เบอร์ติดต่อเจ้าของ</label>
                    <input
                      id="pet-owner-phone"
                      type="text"
                      placeholder="เช่น 089-xxxxxxx"
                      value={petOwnerPhone}
                      onChange={(e) => setPetOwnerPhone(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ที่อยู่เจ้าของ</label>
                  <textarea
                    id="pet-owner-address"
                    rows={1.5}
                    placeholder="เช่น 123/45 ถนนหลัก กรุงเทพฯ"
                    value={petOwnerAddress}
                    onChange={(e) => setPetOwnerAddress(e.target.value)}
                    className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={resetPetForm}
                className="text-stone-700 bg-white hover:bg-stone-100 border border-stone-250 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                id="pet-submit-btn"
                type="submit"
                form="pet-form"
                className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                บันทึกโปรไฟล์
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Pet Confirmation Modal */}
      {showDeleteConfirm && selectedPet && (
        <div id="delete-pet-confirm-modal" className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-amber-100/80 space-y-4">
            <div className="flex gap-3 items-start text-red-700">
              <span className="p-2.5 bg-red-50 rounded-xl border border-red-100 text-red-600 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </span>
              <div>
                <h4 className="font-bold text-lg text-stone-900">ยืนยันการลบโปรไฟล์สัตว์เลี้ยง ⚠️</h4>
                <p className="text-sm text-stone-600 mt-1">
                  คุณแน่ใจหรือไม่ที่จะลบข้อมูลและประวัติสุขภาพทั้งหมดของน้อง <strong className="text-amber-950">"{selectedPet.name}"</strong>?
                </p>
                <p className="text-xs text-red-600 font-semibold mt-2 bg-red-50/50 p-3 rounded-lg border border-red-100 leading-relaxed">
                  🐾 การลบโปรไฟล์นี้จะไม่สามารถกู้ข้อมูลคืนได้ และจะลบประวัติวัคซีน ค่ายา และการรักษาทั้งหมดของน้องออกด้วยค่ะ
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deletePet(selectedPet.id);
                    setSelectedPet(null);
                    setShowDeleteConfirm(false);
                    await loadPetsList();
                  } catch (err) {
                    console.error(err);
                    alert('ไม่สามารถลบน้องได้ค่ะ');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                ใช่, ลบโปรไฟล์น้อง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-amber-200/50 text-center text-xs text-stone-500 leading-relaxed font-sans">
        <p>🐾 Pet Health Record & Tracker © {new Date().getFullYear()} • ออกแบบอย่างประณีตด้วยธีมสีน้ำตาลสุดอบอุ่นสำหรับสหายตัวน้อยของคุณ</p>
        <p className="mt-1">รองรับ SQL Server และใช้สัตวแพทย์ปัญญาประดิษฐ์จาก Google Gemini-3.5-flash ในการดูแลเบื้องต้น</p>
      </footer>
    </div>
  );
}
