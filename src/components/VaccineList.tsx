import React, { useState, useRef, useEffect } from 'react';
import { Vaccination } from '../types';
import { createVaccination, updateVaccination, deleteVaccination } from '../lib/api';
import { Plus, Trash2, Pencil, Calendar, ShieldCheck, User, CheckCircle2, Clock, MapPin, DollarSign, Award, ChevronDown, Check, X, Syringe, Tag, Search, Camera, Image as ImageIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import ImageProofUploader from './ImageProofUploader';
import ImageProofModal from './ImageProofModal';
import { formatThaiDate, calculateAge } from '../lib/utils';

interface VaccineListProps {
  petId: string;
  vaccines: Vaccination[];
  onRefresh: () => void;
  isReadOnly?: boolean;
  petWeight?: number;
  petBirthDate?: string;
  onUpdatePetWeight?: (weight: number) => void;
}

export default function VaccineList({ petId, vaccines, onRefresh, isReadOnly, petWeight, petBirthDate, onUpdatePetWeight }: VaccineListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [vetName, setVetName] = useState('');
  const [status, setStatus] = useState<'completed' | 'scheduled'>('completed');
  const [clinicName, setClinicName] = useState('');
  const [lotNo, setLotNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cost, setCost] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [proofImage, setProofImage] = useState<string | undefined>();
  const [viewProofImage, setViewProofImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccination | null>(null);
  const [editingVaccine, setEditingVaccine] = useState<Vaccination | null>(null);

  const resetForm = () => {
    setEditingVaccine(null);
    setName('');
    setDate('');
    setDueDate('');
    setVetName('');
    setClinicName('');
    setLotNo('');
    setExpiryDate('');
    setCost('');
    setWeight('');
    setAge('');
    setProofImage(undefined);
    setStatus('completed');
    setShowAddForm(false);
  };

  const handleEdit = (vac: Vaccination) => {
    setEditingVaccine(vac);
    setName(vac.name || '');
    setDate(vac.date || '');
    setDueDate(vac.dueDate || '');
    setVetName(vac.vetName || '');
    setClinicName(vac.clinicName || '');
    setLotNo(vac.lotNo || '');
    setExpiryDate(vac.expiryDate || '');
    setCost(vac.cost ? String(vac.cost) : '');
    setWeight(vac.weight ? String(vac.weight) : '');
    setAge(vac.age || '');
    setProofImage(vac.proofImage);
    setStatus(vac.status || 'completed');
    setShowAddForm(true);
  };

  // Auto-fill or calculate age & weight when date/birthDate changes
  useEffect(() => {
    if (petBirthDate) {
      setAge(calculateAge(petBirthDate, date || new Date().toISOString().split('T')[0]));
    }
  }, [date, petBirthDate]);

  useEffect(() => {
    if (showAddForm && petWeight) {
      setWeight(String(petWeight));
    }
  }, [showAddForm, petWeight]);

  // Combobox dropdown state & ref
  const [isComboOpen, setIsComboOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const VACCINE_OPTIONS = [
    'วัคซีนพิษสุนัขบ้า (Rabies)',
    'วัคซีนรวมสุนัข 5-6 โรค',
    'วัคซีนไข้หัดสุนัข (Distemper)',
    'วัคซีนไข้หัดสุนัขและโรคลำไส้อักเสบ (Puppy DP)',
    'วัคซีนตับอักเสบติดต่อ (Hepatitis)',
    'วัคซีนป้องกันโรคหลอดลมอักเสบติดต่อ (Kennel Cough)',
    'วัคซีนลำไส้อักเสบติดต่อ (Parvovirus)',
    'วัคซีนป้องกันพยาธิหนอนหัวใจ',
    'วัคซีนทางเดินหายใจส่วนต้น (Parainfluenza)',
    'วัคซีนป้องกันโรคโคโรนา (Corona)',
    'วัคซีนฉี่หนู (Leptospirosis)',
    'วัคซีนคลาไมเดีย (Chlamydia)',
    'วัคซีนรวมแมว (FVRCP)',
    'วัคซีนเอดส์แมว (FIV)',
    'วัคซีนลิวคีเมียแมว (FeLV)',
    'วัคซีนเยื่อบุช่องท้องอักเสบแมว (FIP)',
    'วัคซีน RHDV1 & RHDV2',
    'วัคซีน Myxomatosis',
    'วัคซีนทางเลือก (Non-Core Vaccines)'
  ];

  const filteredOptions = VACCINE_OPTIONS.filter((opt) =>
    opt.toLowerCase().includes(name.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !dueDate || !vetName) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนด้วยนะคะ (ชื่อวัคซีน, วันที่ฉีด, วันที่นัดครั้งถัดไป, และชื่อสัตวแพทย์) 🐾');
      return;
    }
    setLoading(true);
    const costNum = parseFloat(cost) || 0;
    const weightNum = parseFloat(weight) || 0;
    try {
      if (editingVaccine) {
        await updateVaccination({
          ...editingVaccine,
          name,
          date,
          dueDate,
          vetName,
          status,
          cost: costNum,
          weight: weightNum > 0 ? weightNum : undefined,
          age: age.trim() || undefined,
          clinicName: clinicName || undefined,
          lotNo: lotNo || undefined,
          expiryDate: expiryDate || undefined,
          proofImage: proofImage || undefined
        });
      } else {
        await createVaccination({
          petId,
          name,
          date,
          dueDate,
          vetName,
          status,
          cost: costNum,
          weight: weightNum > 0 ? weightNum : undefined,
          age: age.trim() || undefined,
          clinicName: clinicName || undefined,
          lotNo: lotNo || undefined,
          expiryDate: expiryDate || undefined,
          proofImage: proofImage || undefined
        });
      }

      // Update pet weight if provided and valid
      if (weightNum > 0 && onUpdatePetWeight) {
        onUpdatePetWeight(weightNum);
      }

      resetForm();
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถบันทึกข้อมูลวัคซีนได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVaccination(deleteId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบข้อมูลวัคซีนได้');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredVaccines = vaccines.filter((vac) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      vac.name?.toLowerCase().includes(q) ||
      vac.clinicName?.toLowerCase().includes(q) ||
      vac.vetName?.toLowerCase().includes(q) ||
      vac.lotNo?.toLowerCase().includes(q)
    );
  });

  const totalVaccinesCost = filteredVaccines.reduce((sum, v) => sum + (v.cost || 0), 0);

  return (
    <div id="vaccine-section" className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-display text-amber-900 flex items-center gap-2">
            ประวัติการฉีดวัคซีน
          </h3>
          <p className="text-xs text-stone-500 mt-1">บันทึกวัคซีนและกำหนดการนัดหมายครั้งถัดไป</p>
        </div>
        {isReadOnly ? (
          <span className="text-xs text-stone-500 bg-stone-100 border border-stone-250 px-3 py-1.5 rounded-full font-semibold select-none flex items-center gap-1">
            <span>🔒</span>
            <span>อ่านอย่างเดียว</span>
          </span>
        ) : (
          <button
            id="btn-add-vaccine"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-4 py-2 text-sm font-sans flex items-center gap-1 transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'ปิดฟอร์ม' : 'เพิ่มบันทึก'}
          </button>
        )}
      </div>

      {/* Search Input Box */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาชื่อวัคซีน, สถานที่, ชื่อสัตวแพทย์ หรือเลขล็อต..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-sm transition-all"
        />
      </div>

      {showAddForm && (
        <form id="add-vaccine-form" onSubmit={handleSubmit} className="bg-amber-50/50 rounded-xl p-5 mb-6 border border-amber-100/50 animate-fade-in text-sm space-y-4">
          <h4 className="text-base font-bold text-amber-950 flex items-center gap-2 pb-2 border-b border-amber-100">
            <Award className="w-5 h-5 text-amber-700" />
            {editingVaccine ? 'แก้ไขบันทึกประวัติวัคซีน' : 'บันทึกประวัติฉีดวัคซีนใหม่'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div ref={comboboxRef} className="relative">
              <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อวัคซีน *</label>
              <div className="relative">
                <input
                  id="vac-name-input"
                  type="text"
                  placeholder="เลือกหรือพิมพ์ชื่อวัคซีนเพิ่มเอง"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsComboOpen(true);
                  }}
                  onFocus={() => setIsComboOpen(true)}
                  className="w-full text-sm bg-white border border-amber-200 rounded-lg pl-3 pr-10 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setIsComboOpen(!isComboOpen)}
                  className="absolute right-0 top-0 h-full px-3 text-stone-400 hover:text-amber-700 transition flex items-center"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isComboOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {isComboOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-amber-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-fade-in divide-y divide-stone-50 py-1">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setName(opt);
                          setIsComboOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition flex items-center justify-between"
                      >
                        <span>{opt}</span>
                        {name === opt && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-2.5 text-xs text-stone-500 italic">
                      {name.trim() ? (
                        <button
                          type="button"
                          onClick={() => setIsComboOpen(false)}
                          className="w-full text-left text-amber-700 font-medium hover:underline flex items-center gap-1"
                        >
                          <span>✨ ใช้ชื่อที่คุณพิมพ์เอง: "{name}"</span>
                        </button>
                      ) : (
                        "ไม่พบข้อมูล กรุณาพิมพ์ชื่อวัคซีน"
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">สถานที่</label>
              <input
                type="text"
                placeholder="เช่น รพ.สัตว์แสนดี, คลินิกบ้านรักสัตว์"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Lot No. (เลขล็อตวัคซีน)</label>
              <input
                type="text"
                placeholder="เช่น LOT123456"
                value={lotNo}
                onChange={(e) => setLotNo(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">วันหมดอายุของวัคซีน</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">อายุ ณ วันที่ฉีด</label>
              <input
                type="text"
                placeholder="เช่น 1 ปี 2 เดือน"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">น้ำหนักตัว (กก.)</label>
              <input
                type="number"
                step="0.01"
                placeholder="เช่น 4.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ค่าใช้จ่าย *</label>
              <input
                type="number"
                placeholder="ระบุเฉพาะตัวเลขเท่านั้น"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">สัตวแพทย์ผู้ดูแล *</label>
              <input
                id="vac-vet-input"
                type="text"
                placeholder="ชื่อ-นามสกุล"
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">วันที่ฉีดวัคซีน *</label>
              <input
                id="vac-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">กำหนดฉีดครั้งถัดไป *</label>
              <input
                id="vac-due-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-2">สถานะการฉีดวัคซีน</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 font-medium">
                  <input
                    type="radio"
                    name="vac-status"
                    checked={status === 'completed'}
                    onChange={() => setStatus('completed')}
                    className="accent-amber-700 h-4.5 w-4.5"
                  />
                  ฉีดวัคซีนเรียบร้อยแล้ว
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 font-medium">
                  <input
                    type="radio"
                    name="vac-status"
                    checked={status === 'scheduled'}
                    onChange={() => setStatus('scheduled')}
                    className="accent-amber-700 h-4.5 w-4.5"
                  />
                  เป็นกำหนดการนัดล่วงหน้า
                </label>
              </div>
            </div>

            {/* Proof Image Upload */}
            <div className="md:col-span-2">
              <ImageProofUploader
                value={proofImage}
                onChange={setProofImage}
                label="แนบภาพถ่ายหลักฐาน (สติ๊กเกอร์วัคซีน / ใบรับรอง / ใบเสร็จ)"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-3 border-t border-amber-100">
            <button
              type="button"
              onClick={resetForm}
              className="text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="vac-submit-btn"
              type="submit"
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              {loading ? 'กำลังบันทึกข้อมูล...' : 'บันทึก'}
            </button>
          </div>
        </form>
      )}

      {vaccines.length === 0 ? (
        <div id="no-vaccine" className="text-center py-8 bg-stone-50/50 rounded-xl border border-stone-100">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500 font-sans">ยังไม่มีประวัติการฉีดวัคซีน</p>
          <p className="text-xs text-stone-400 mt-1">คลิกปุ่ม "เพิ่มบันทึก" ด้านบนเพื่อเพิ่มประวัติวัคซีนก้าวแรกให้น้อง</p>
        </div>
      ) : filteredVaccines.length === 0 ? (
        <div id="no-search-results" className="text-center py-8 bg-stone-50/50 rounded-xl border border-stone-100">
          <Search className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500 font-sans">ไม่พบประวัติวัคซีนตามคำค้นหา</p>
          <p className="text-xs text-stone-400 mt-1">ลองใช้คำอื่น หรือคำค้นที่สั้นลงดูนะคะ 🐾</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-amber-100 text-stone-600 bg-stone-50/50 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-bold w-[35%] min-w-[240px]">ชื่อวัคซีน</th>
                <th className="py-3 px-4 font-bold w-[15%] min-w-[120px]">วันที่ฉีด</th>
                <th className="py-3 px-4 font-bold w-[15%] min-w-[120px]">นัดหมายถัดไป</th>
                <th className="py-3 px-4 font-bold w-[15%] min-w-[110px]">ค่าใช้จ่าย</th>
                <th className="py-3 px-4 font-bold w-[12%] min-w-[100px] text-center">สถานะ</th>
                <th className="py-3 px-4 text-right font-bold w-[8%] min-w-[70px]">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccines.map((vac) => (
                <tr key={vac.id} className="border-b border-stone-100 hover:bg-amber-50/30 transition text-stone-800">
                  <td className="py-3.5 px-4 font-bold text-amber-950 w-[35%] min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedVaccine(vac)}
                        className="text-left text-amber-950 hover:text-amber-600 transition-colors duration-200 focus:outline-none flex flex-col font-bold"
                        title="คลิกเพื่อดูรายละเอียดวัคซีนเพิ่มเติม"
                      >
                        <span className="leading-relaxed">
                          {vac.name}
                        </span>
                        {(vac.weight || vac.age) && (
                          <span className="text-[11px] font-normal text-amber-800/80 bg-amber-50/70 px-1.5 py-0.5 rounded border border-amber-100/60 inline-block mt-0.5 w-max">
                            {vac.weight ? `⚖️ ${vac.weight} kg` : ''} {vac.weight && vac.age ? '• ' : ''} {vac.age ? `🎂 ${vac.age}` : ''}
                          </span>
                        )}
                      </button>
                      {vac.proofImage && (
                        <button
                          type="button"
                          onClick={() => setViewProofImage(vac.proofImage!)}
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] px-2 py-0.5 rounded-md border border-amber-200 transition shrink-0 cursor-pointer"
                          title="ดูหลักฐานภาพถ่าย"
                        >
                          <Camera className="w-3 h-3 text-amber-700" />
                          <span>หลักฐาน</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap w-[15%] min-w-[120px]">
                    <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-700 font-medium">
                      {formatThaiDate(vac.date)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap w-[15%] min-w-[120px]">
                    <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200/50 px-2 py-1 rounded font-bold">
                      {formatThaiDate(vac.dueDate)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-900 w-[15%] min-w-[110px]">
                    {vac.cost ? `฿${vac.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '฿0.00'}
                  </td>
                  <td className="py-3.5 px-4 text-center w-[12%] min-w-[100px]">
                    {vac.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full border border-green-200 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        เรียบร้อย
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200 font-semibold">
                        <Clock className="w-3 h-3 text-blue-500" />
                        รอกำหนด
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right w-[8%] min-w-[90px]">
                    {!isReadOnly && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(vac)}
                          className="text-stone-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-stone-150 transition cursor-pointer"
                          title="แก้ไขบันทึกนี้"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vac.id)}
                          className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-150 transition cursor-pointer"
                          title="ลบบันทึกนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50/40 font-bold border-t border-amber-200 text-stone-900">
                <td colSpan={3} className="py-4 px-4 text-stone-700 text-right text-xs uppercase tracking-wider font-bold">
                  รวมยอดค่าใช้จ่ายวัคซีนทั้งหมด:
                </td>
                <td className="py-4 px-4 text-amber-900 text-base font-bold">
                  ฿{totalVaccinesCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Vaccine Detail Popup Modal */}
      {selectedVaccine && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[110] overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[88vh] flex flex-col shadow-2xl border border-amber-100/80 overflow-hidden animate-scale-up my-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 px-5 sm:px-6 py-3.5 sm:py-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold font-display text-base sm:text-lg flex items-center gap-2">
                <Syringe className="w-5 h-5 text-amber-300 shrink-0" />
                <span>รายละเอียดประวัติวัคซีน</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedVaccine(null)}
                className="text-amber-100 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-4 text-stone-850 overflow-y-auto flex-1">
              {/* Row 1: ชื่อวัคซีน */}
              <div>
                <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-0.5">ชื่อวัคซีน</span>
                <p className="text-base font-bold text-amber-950 font-display bg-amber-50/40 px-3 py-2.5 rounded-xl border border-amber-100/50">
                  {selectedVaccine.name}
                </p>
              </div>

              {/* Row: อายุ & น้ำหนัก */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">อายุ ณ วันที่ฉีด</span>
                  <div className="text-xs font-medium bg-amber-50/50 px-3 py-2.5 rounded-xl border border-amber-100/50 text-amber-950 flex items-center">
                    {selectedVaccine.age || (petBirthDate ? calculateAge(petBirthDate, selectedVaccine.date) : '-')}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">น้ำหนักตัว</span>
                  <div className="text-xs font-bold bg-amber-50/50 px-3 py-2.5 rounded-xl border border-amber-100/50 text-amber-950 flex items-center">
                    {selectedVaccine.weight ? `${selectedVaccine.weight} kg` : '-'}
                  </div>
                </div>
              </div>

              {/* Row 2: Lot No. | วันหมดอายุวัคซีน */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">Lot No. (เลขล็อต)</span>
                  <div className="text-xs font-mono font-medium bg-stone-50 px-3 py-2.5 rounded-xl border border-stone-100 text-stone-700 min-h-[42px] flex items-center">
                    {selectedVaccine.lotNo || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">วันหมดอายุวัคซีน</span>
                  <div className="text-xs font-medium bg-stone-50 px-3 py-2.5 rounded-xl border border-stone-100 text-stone-700 min-h-[42px] flex items-center">
                    {selectedVaccine.expiryDate ? formatThaiDate(selectedVaccine.expiryDate) : '-'}
                  </div>
                </div>
              </div>

              {/* Row 3: สถานที่ */}
              <div>
                <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">สถานที่</span>
                <div className="flex items-start gap-1.5 text-xs text-stone-700 bg-stone-50 px-3 py-2.5 rounded-xl border border-stone-100">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>{selectedVaccine.clinicName || '-'}</span>
                </div>
              </div>

              {/* Row 4: สัตวแพทย์ผู้ดูแล */}
              <div>
                <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">สัตวแพทย์ผู้ดูแล</span>
                <div className="flex items-center gap-1.5 text-xs text-stone-700 bg-stone-50 px-3 py-2.5 rounded-xl border border-stone-100">
                  <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{selectedVaccine.vetName || '-'}</span>
                </div>
              </div>

              {/* Row 5: วันที่ฉีด | นัดหมายถัดไป */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">วันที่ฉีด</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium bg-stone-50 px-3 py-2.5 rounded-xl border border-stone-100">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span>{formatThaiDate(selectedVaccine.date)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">นัดหมายถัดไป</span>
                  <div className="flex items-center gap-1.5 text-sm font-bold bg-amber-50/50 text-amber-950 px-3 py-2.5 rounded-xl border border-amber-100/40">
                    <Calendar className="w-4 h-4 text-amber-700 animate-pulse" />
                    <span>{formatThaiDate(selectedVaccine.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Row 6: ค่าใช้จ่าย | สถานะ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">ค่าใช้จ่าย</span>
                  <div className="flex items-center gap-1.5 text-sm font-bold bg-stone-50 text-amber-900 px-3 py-2.5 rounded-xl border border-stone-100">
                    <span className="text-amber-700 font-bold">฿</span>
                    <span>{selectedVaccine.cost ? `${selectedVaccine.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">สถานะ</span>
                  <div className="pt-0.5">
                    {selectedVaccine.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-xl border border-green-200 font-semibold w-full justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        เรียบร้อยแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-xl border border-blue-200 font-semibold w-full justify-center">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        นัดล่วงหน้า
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 7: หลักฐานภาพถ่าย (ถ้ามี) */}
              {selectedVaccine.proofImage && (
                <div>
                  <span className="text-xs text-stone-400 uppercase font-semibold block tracking-wider mb-1">หลักฐานภาพถ่าย</span>
                  <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 flex items-center justify-between">
                    <img 
                      src={selectedVaccine.proofImage} 
                      alt="หลักฐาน" 
                      className="w-16 h-16 object-cover rounded-lg border border-amber-200 cursor-pointer hover:opacity-90 transition"
                      onClick={() => setViewProofImage(selectedVaccine.proofImage!)}
                    />
                    <button
                      type="button"
                      onClick={() => setViewProofImage(selectedVaccine.proofImage!)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      ดูรูปขนาดเต็ม
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with explicit close button */}
            <div className="p-3 sm:px-6 bg-stone-50 border-t border-stone-100 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVaccine(null)}
                className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Image Proof Modal Lightbox */}
      <ImageProofModal
        imageUrl={viewProofImage}
        title="หลักฐานภาพถ่ายวัคซีน"
        onClose={() => setViewProofImage(null)}
      />

      <ConfirmModal
        isOpen={deleteId !== null}
        title="ยืนยันการลบข้อมูลวัคซีน"
        message="คุณแน่ใจหรือไม่ที่จะลบประวัติวัคซีนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
