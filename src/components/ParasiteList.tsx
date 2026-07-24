import React, { useState, useEffect } from 'react';
import { TickFlea, Deworming, Heartworm } from '../types';
import { createTickFlea, deleteTickFlea, createDeworming, deleteDeworming, createHeartworm, deleteHeartworm } from '../lib/api';
import { Plus, Trash2, Calendar, Sparkles, Bug, ShieldAlert, CheckCircle2, Heart, Search, Camera, Image as ImageIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { formatThaiDate, calculateAge } from '../lib/utils';
import ImageProofUploader from './ImageProofUploader';
import ImageProofModal from './ImageProofModal';

interface ParasiteListProps {
  petId: string;
  tickFleas: TickFlea[];
  dewormings: Deworming[];
  heartworms: Heartworm[];
  onRefresh: () => void;
  isReadOnly?: boolean;
  petWeight?: number;
  petBirthDate?: string;
  onUpdatePetWeight?: (weight: number) => void;
}

export default function ParasiteList({ petId, tickFleas, dewormings, heartworms, onRefresh, isReadOnly, petWeight, petBirthDate, onUpdatePetWeight }: ParasiteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewProofImage, setViewProofImage] = useState<string | null>(null);
  
  // Tick & Flea States
  const [showTickForm, setShowTickForm] = useState(false);
  const [tickProduct, setTickProduct] = useState('');
  const [tickDate, setTickDate] = useState('');
  const [tickDueDate, setTickDueDate] = useState('');
  const [tickWeight, setTickWeight] = useState('');
  const [tickAge, setTickAge] = useState('');
  const [tickNotes, setTickNotes] = useState('');
  const [tickProofImage, setTickProofImage] = useState<string | undefined>();

  // Deworming States
  const [showDewormForm, setShowDewormForm] = useState(false);
  const [dewormMedicine, setDewormMedicine] = useState('');
  const [dewormDate, setDewormDate] = useState('');
  const [dewormDueDate, setDewormDueDate] = useState('');
  const [dewormWeight, setDewormWeight] = useState('');
  const [dewormAge, setDewormAge] = useState('');
  const [dewormNotes, setDewormNotes] = useState('');
  const [dewormProofImage, setDewormProofImage] = useState<string | undefined>();

  // Heartworm States
  const [showHeartwormForm, setShowHeartwormForm] = useState(false);
  const [hwProduct, setHwProduct] = useState('');
  const [hwDate, setHwDate] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwWeight, setHwWeight] = useState('');
  const [hwAge, setHwAge] = useState('');
  const [hwNotes, setHwNotes] = useState('');
  const [hwProofImage, setHwProofImage] = useState<string | undefined>();

  // Auto-fill age & weight
  useEffect(() => {
    if (petBirthDate) {
      if (tickDate) setTickAge(calculateAge(petBirthDate, tickDate));
      if (dewormDate) setDewormAge(calculateAge(petBirthDate, dewormDate));
      if (hwDate) setHwAge(calculateAge(petBirthDate, hwDate));
    }
  }, [tickDate, dewormDate, hwDate, petBirthDate]);

  useEffect(() => {
    if (petWeight) {
      if (showTickForm && !tickWeight) setTickWeight(String(petWeight));
      if (showDewormForm && !dewormWeight) setDewormWeight(String(petWeight));
      if (showHeartwormForm && !hwWeight) setHwWeight(String(petWeight));
    }
  }, [showTickForm, showDewormForm, showHeartwormForm, petWeight]);

  const [loading, setLoading] = useState(false);
  
  // Deletion state
  const [deleteType, setDeleteType] = useState<'tick' | 'deworm' | 'heartworm' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Handlers
  const handleTickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickProduct || !tickDate || !tickDueDate) {
      alert('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }
    setLoading(true);
    const weightNum = parseFloat(tickWeight) || 0;
    try {
      await createTickFlea({
        petId,
        productName: tickProduct,
        date: tickDate,
        dueDate: tickDueDate,
        weight: weightNum > 0 ? weightNum : undefined,
        age: tickAge.trim() || undefined,
        notes: tickNotes,
        proofImage: tickProofImage || undefined
      });
      if (weightNum > 0 && onUpdatePetWeight) onUpdatePetWeight(weightNum);
      setTickProduct('');
      setTickDate('');
      setTickDueDate('');
      setTickWeight('');
      setTickAge('');
      setTickNotes('');
      setTickProofImage(undefined);
      setShowTickForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถบันทึกข้อมูลกำจัดเห็บหมัดได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDewormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dewormMedicine || !dewormDate || !dewormDueDate) {
      alert('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }
    setLoading(true);
    const weightNum = parseFloat(dewormWeight) || 0;
    try {
      await createDeworming({
        petId,
        medicineName: dewormMedicine,
        date: dewormDate,
        dueDate: dewormDueDate,
        weight: weightNum > 0 ? weightNum : undefined,
        age: dewormAge.trim() || undefined,
        notes: dewormNotes,
        proofImage: dewormProofImage || undefined
      });
      if (weightNum > 0 && onUpdatePetWeight) onUpdatePetWeight(weightNum);
      setDewormMedicine('');
      setDewormDate('');
      setDewormDueDate('');
      setDewormWeight('');
      setDewormAge('');
      setDewormNotes('');
      setDewormProofImage(undefined);
      setShowDewormForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถบันทึกข้อมูลยาถ่ายพยาธิได้');
    } finally {
      setLoading(false);
    }
  };

  const handleHeartwormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwProduct || !hwDate || !hwDueDate) {
      alert('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }
    setLoading(true);
    const weightNum = parseFloat(hwWeight) || 0;
    try {
      await createHeartworm({
        petId,
        productName: hwProduct,
        date: hwDate,
        dueDate: hwDueDate,
        weight: weightNum > 0 ? weightNum : undefined,
        age: hwAge.trim() || undefined,
        notes: hwNotes,
        proofImage: hwProofImage || undefined
      });
      if (weightNum > 0 && onUpdatePetWeight) onUpdatePetWeight(weightNum);
      setHwProduct('');
      setHwDate('');
      setHwDueDate('');
      setHwWeight('');
      setHwAge('');
      setHwNotes('');
      setHwProofImage(undefined);
      setShowHeartwormForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถบันทึกข้อมูลป้องกันพยาธิหนอนหัวใจได้');
    } finally {
      setLoading(false);
    }
  };

  const handleTickDelete = (id: string) => {
    setDeleteType('tick');
    setDeleteId(id);
  };

  const handleDewormDelete = (id: string) => {
    setDeleteType('deworm');
    setDeleteId(id);
  };

  const handleHeartwormDelete = (id: string) => {
    setDeleteType('heartworm');
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (!deleteId || !deleteType) return;
    try {
      if (deleteType === 'tick') {
        await deleteTickFlea(deleteId);
      } else if (deleteType === 'deworm') {
        await deleteDeworming(deleteId);
      } else if (deleteType === 'heartworm') {
        await deleteHeartworm(deleteId);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบข้อมูลได้ค่ะ');
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const filteredTickFleas = tickFleas.filter((tf) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return tf.productName?.toLowerCase().includes(q) || tf.notes?.toLowerCase().includes(q);
  });

  const filteredDewormings = dewormings.filter((dw) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return dw.medicineName?.toLowerCase().includes(q) || dw.notes?.toLowerCase().includes(q);
  });

  const filteredHeartworms = heartworms.filter((hw) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return hw.productName?.toLowerCase().includes(q) || hw.notes?.toLowerCase().includes(q);
  });

  return (
    <>
      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-amber-100/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหายี่ห้อ ผลิตภัณฑ์ ยา หรือบันทึกป้องกันเห็บ/หมัด/พยาธิ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 transition-all"
          />
        </div>
        {isReadOnly && (
          <span className="text-xs text-stone-500 bg-stone-100 border border-stone-250 px-3 py-1.5 rounded-full font-semibold select-none flex items-center gap-1 shrink-0">
            <span>🔒</span>
            <span>อ่านอย่างเดียว</span>
          </span>
        )}
      </div>

      <div id="parasite-section" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* 1. Tick & Flea Prevention Column */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-display font-bold text-amber-900 flex items-center gap-2">
              การป้องกันเห็บและหมัด
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">ป้องกันพยาธิภายนอก ไรหู และโรคพยาธิเม็ดเลือด</p>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => setShowTickForm(!showTickForm)}
              className="bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-full p-2 text-xs font-sans flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="เพิ่มบันทึกป้องกันเห็บหมัด"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {showTickForm && (
          <form onSubmit={handleTickSubmit} className="bg-amber-50/40 rounded-xl p-4 mb-6 border border-amber-100/50 animate-fade-in text-xs">
            <h4 className="text-xs font-bold text-amber-900 mb-2">บันทึกยาเห็บหมัด</h4>
            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-0.5">ตัวยา / ยี่ห้อที่ใช้ *</label>
                <input
                  type="text"
                  placeholder="เช่น Bravecto, Nexgard Spectra, Frontline"
                  value={tickProduct}
                  onChange={(e) => setTickProduct(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">วันที่หยอด/กิน *</label>
                  <input
                    type="date"
                    value={tickDate}
                    onChange={(e) => setTickDate(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">วันที่ครบกำหนด *</label>
                  <input
                    type="date"
                    value={tickDueDate}
                    onChange={(e) => setTickDueDate(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">อายุ ณ วันที่ให้ยา</label>
                  <input
                    type="text"
                    placeholder="เช่น 1 ปี 2 เดือน"
                    value={tickAge}
                    onChange={(e) => setTickAge(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">น้ำหนักตัว (กก.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="เช่น 4.5"
                    value={tickWeight}
                    onChange={(e) => setTickWeight(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-0.5">บันทึกเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น หยอดหลังคอ น้องไม่ดื้อ"
                  value={tickNotes}
                  onChange={(e) => setTickNotes(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-950 focus:outline-none"
                />
              </div>
              <ImageProofUploader
                value={tickProofImage}
                onChange={setTickProofImage}
                label="แนบภาพถ่ายหลักฐาน (กล่องยา/ใบเสร็จ/สติ๊กเกอร์)"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowTickForm(false)}
                className="text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                บันทึก
              </button>
            </div>
          </form>
        )}

        {tickFleas.length === 0 ? (
          <div className="text-center py-6 bg-stone-50/50 rounded-xl border border-stone-100 text-xs text-stone-500">
            <ShieldAlert className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p>ยังไม่มีประวัติการกำจัดเห็บหมัด</p>
          </div>
        ) : filteredTickFleas.length === 0 ? (
          <div className="text-center py-6 bg-stone-50/50 rounded-xl border border-stone-100 text-xs text-stone-500">
            <Search className="w-6 h-6 text-stone-300 mx-auto mb-1.5" />
            <p>ไม่พบข้อมูลตามคำค้นหา</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickFleas.map((tf) => (
              <div key={tf.id} className="bg-stone-50/60 p-4 rounded-xl border border-stone-100/50 text-xs flex flex-col gap-2.5 hover:border-amber-200 hover:bg-amber-50/10 transition duration-150 relative">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-950 text-sm">{tf.productName}</h4>
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="inline-flex bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full text-[10px] items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        ปกป้องอยู่
                      </span>
                      {(tf.weight || tf.age) && (
                        <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                          {tf.weight ? `⚖️ ${tf.weight} kg` : ''} {tf.weight && tf.age ? '• ' : ''} {tf.age ? `🎂 ${tf.age}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleTickDelete(tf.id)}
                      className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/40 text-[11px]">
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase tracking-wider">วันที่ทำ</span>
                    <span className="text-stone-700 font-medium">{formatThaiDate(tf.date)}</span>
                  </div>
                  <div>
                    <span className="text-amber-800 block text-[9px] uppercase tracking-wider font-semibold">นัดครั้งถัดไป</span>
                    <span className="text-amber-900 font-bold">{formatThaiDate(tf.dueDate)}</span>
                  </div>
                </div>

                {tf.notes && (
                  <div className="bg-stone-100/50 rounded-lg p-2.5 text-xs sm:text-sm text-stone-600 mt-0.5">
                    <p className="leading-relaxed"><span className="font-semibold text-stone-700">บันทึก:</span> {tf.notes}</p>
                  </div>
                )}

                {tf.proofImage && (
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2">
                      <img src={tf.proofImage} alt="หลักฐาน" className="w-10 h-10 object-cover rounded border border-amber-200 cursor-pointer" onClick={() => setViewProofImage(tf.proofImage!)} />
                      <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1"><Camera className="w-3 h-3 text-amber-700" /> มีหลักฐาน</span>
                    </div>
                    <button type="button" onClick={() => setViewProofImage(tf.proofImage!)} className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> ดูรูป
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Deworming Column */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-display font-bold text-amber-900 flex items-center gap-2">
              การให้ยาถ่ายพยาธิ (Deworming)
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">กำจัดพยาธิตัวตืด ตัวกลม พยาธิแส้ม้า ในทางเดินอาหาร</p>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => setShowDewormForm(!showDewormForm)}
              className="bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-full p-2 text-xs font-sans flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="เพิ่มบันทึกยาถ่ายพยาธิ"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {showDewormForm && (
          <form onSubmit={handleDewormSubmit} className="bg-amber-50/40 rounded-xl p-4 mb-6 border border-amber-100/50 animate-fade-in text-xs">
            <h4 className="text-xs font-bold text-amber-900 mb-2">บันทึกยาถ่ายพยาธิ</h4>
            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-0.5">ชื่อตัวยาที่ใช้ *</label>
                <input
                  type="text"
                  placeholder="เช่น Drontal, Milbemax"
                  value={dewormMedicine}
                  onChange={(e) => setDewormMedicine(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">วันที่ได้รับยา *</label>
                  <input
                    type="date"
                    value={dewormDate}
                    onChange={(e) => setDewormDate(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">วันที่นัดถัดไป *</label>
                  <input
                    type="date"
                    value={dewormDueDate}
                    onChange={(e) => setDewormDueDate(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">อายุ ณ วันที่ให้ยา</label>
                  <input
                    type="text"
                    placeholder="เช่น 1 ปี 2 เดือน"
                    value={dewormAge}
                    onChange={(e) => setDewormAge(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">น้ำหนักตัว (กก.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="เช่น 4.5"
                    value={dewormWeight}
                    onChange={(e) => setDewormWeight(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-0.5">บันทึกเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น ป้อนง่าย เคี้ยวกลืนเก่ง"
                  value={dewormNotes}
                  onChange={(e) => setDewormNotes(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-950 focus:outline-none"
                />
              </div>
              <ImageProofUploader
                value={dewormProofImage}
                onChange={setDewormProofImage}
                label="แนบภาพถ่ายหลักฐาน (กล่องยา/ใบเสร็จ/สติ๊กเกอร์)"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowDewormForm(false)}
                className="text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                บันทึก
              </button>
            </div>
          </form>
        )}

        {dewormings.length === 0 ? (
          <div className="text-center py-6 bg-stone-50/50 rounded-xl border border-stone-100 text-xs text-stone-500">
            <ShieldAlert className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p>ยังไม่มีประวัติการให้ยาถ่ายพยาธิ</p>
          </div>
        ) : filteredDewormings.length === 0 ? (
          <div className="text-center py-6 bg-stone-50/50 rounded-xl border border-stone-100 text-xs text-stone-500">
            <Search className="w-6 h-6 text-stone-300 mx-auto mb-1.5" />
            <p>ไม่พบข้อมูลตามคำค้นหา</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDewormings.map((dw) => (
              <div key={dw.id} className="bg-stone-50/60 p-4 rounded-xl border border-stone-100/50 text-xs flex flex-col gap-2.5 hover:border-amber-200 hover:bg-amber-50/10 transition duration-150 relative">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-950 text-sm">{dw.medicineName}</h4>
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="inline-flex bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full text-[10px] items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        ปกป้องอยู่
                      </span>
                      {(dw.weight || dw.age) && (
                        <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                          {dw.weight ? `⚖️ ${dw.weight} kg` : ''} {dw.weight && dw.age ? '• ' : ''} {dw.age ? `🎂 ${dw.age}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDewormDelete(dw.id)}
                      className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/40 text-[11px]">
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase tracking-wider">วันที่ทำ</span>
                    <span className="text-stone-700 font-medium">{formatThaiDate(dw.date)}</span>
                  </div>
                  <div>
                    <span className="text-amber-800 block text-[9px] uppercase tracking-wider font-semibold">นัดครั้งถัดไป</span>
                    <span className="text-amber-900 font-bold">{formatThaiDate(dw.dueDate)}</span>
                  </div>
                </div>

                {dw.notes && (
                  <div className="bg-stone-100/50 rounded-lg p-2.5 text-xs sm:text-sm text-stone-600 mt-0.5">
                    <p className="leading-relaxed"><span className="font-semibold text-stone-700">บันทึก:</span> {dw.notes}</p>
                  </div>
                )}

                {dw.proofImage && (
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2">
                      <img src={dw.proofImage} alt="หลักฐาน" className="w-10 h-10 object-cover rounded border border-amber-200 cursor-pointer" onClick={() => setViewProofImage(dw.proofImage!)} />
                      <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1"><Camera className="w-3 h-3 text-amber-700" /> มีหลักฐาน</span>
                    </div>
                    <button type="button" onClick={() => setViewProofImage(dw.proofImage!)} className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> ดูรูป
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Heartworm Prevention Column */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-display font-bold text-amber-900 flex items-center gap-2">
              การป้องกันพยาธิหนอนหัวใจ
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">ป้องกันพยาธิหนอนหัวใจที่เป็นอันตรายถึงชีวิต ติดต่อผ่านยุงกัด</p>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => setShowHeartwormForm(!showHeartwormForm)}
              className="bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-full p-2 text-xs font-sans flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="เพิ่มบันทึกป้องกันพยาธิหนอนหัวใจ"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {showHeartwormForm && (
          <form onSubmit={handleHeartwormSubmit} className="bg-amber-50/40 rounded-xl p-4 mb-6 border border-amber-100/50 animate-fade-in text-xs">
            <h4 className="text-xs font-bold text-amber-900 mb-2">บันทึกป้องกันพยาธิหนอนหัวใจ</h4>
            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-0.5">ตัวยา / ยี่ห้อที่ใช้ *</label>
                <input
                  type="text"
                  placeholder="เช่น Heartgard Plus, Nexgard Spectra, ProHeart"
                  value={hwProduct}
                  onChange={(e) => setHwProduct(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">วันที่ได้รับยา *</label>
                  <input
                    type="date"
                    value={hwDate}
                    onChange={(e) => setHwDate(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">วันที่นัดถัดไป *</label>
                  <input
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">อายุ ณ วันที่ให้ยา</label>
                  <input
                    type="text"
                    placeholder="เช่น 1 ปี 2 เดือน"
                    value={hwAge}
                    onChange={(e) => setHwAge(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-600 mb-0.5">น้ำหนักตัว (กก.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="เช่น 4.5"
                    value={hwWeight}
                    onChange={(e) => setHwWeight(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-950 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-0.5">บันทึกเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น กินพร้อมอาหารมื้อเย็น หรือยาฉีดคุม 1 ปี"
                  value={hwNotes}
                  onChange={(e) => setHwNotes(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-950 focus:outline-none"
                />
              </div>
              <ImageProofUploader
                value={hwProofImage}
                onChange={setHwProofImage}
                label="แนบภาพถ่ายหลักฐาน (กล่องยา/ใบเสร็จ/สติ๊กเกอร์)"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowHeartwormForm(false)}
                className="text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                บันทึก
              </button>
            </div>
          </form>
        )}

        {heartworms.length === 0 ? (
          <div className="text-center py-6 bg-stone-50/50 rounded-xl border border-stone-100 text-xs text-stone-500">
            <ShieldAlert className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p>ยังไม่มีประวัติป้องกันพยาธิหนอนหัวใจ</p>
          </div>
        ) : filteredHeartworms.length === 0 ? (
          <div className="text-center py-6 bg-stone-50/50 rounded-xl border border-stone-100 text-xs text-stone-500">
            <Search className="w-6 h-6 text-stone-300 mx-auto mb-1.5" />
            <p>ไม่พบข้อมูลตามคำค้นหา</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHeartworms.map((hw) => (
              <div key={hw.id} className="bg-stone-50/60 p-4 rounded-xl border border-stone-100/50 text-xs flex flex-col gap-2.5 hover:border-amber-200 hover:bg-amber-50/10 transition duration-150 relative">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-950 text-sm">{hw.productName}</h4>
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="inline-flex bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full text-[10px] items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        ปกป้องอยู่
                      </span>
                      {(hw.weight || hw.age) && (
                        <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                          {hw.weight ? `⚖️ ${hw.weight} kg` : ''} {hw.weight && hw.age ? '• ' : ''} {hw.age ? `🎂 ${hw.age}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleHeartwormDelete(hw.id)}
                      className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/40 text-[11px]">
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase tracking-wider">วันที่ทำ</span>
                    <span className="text-stone-700 font-medium">{formatThaiDate(hw.date)}</span>
                  </div>
                  <div>
                    <span className="text-amber-800 block text-[9px] uppercase tracking-wider font-semibold">นัดครั้งถัดไป</span>
                    <span className="text-amber-900 font-bold">{formatThaiDate(hw.dueDate)}</span>
                  </div>
                </div>

                {hw.notes && (
                  <div className="bg-stone-100/50 rounded-lg p-2.5 text-xs sm:text-sm text-stone-600 mt-0.5">
                    <p className="leading-relaxed"><span className="font-semibold text-stone-700">บันทึก:</span> {hw.notes}</p>
                  </div>
                )}

                {hw.proofImage && (
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2">
                      <img src={hw.proofImage} alt="หลักฐาน" className="w-10 h-10 object-cover rounded border border-amber-200 cursor-pointer" onClick={() => setViewProofImage(hw.proofImage!)} />
                      <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1"><Camera className="w-3 h-3 text-amber-700" /> มีหลักฐาน</span>
                    </div>
                    <button type="button" onClick={() => setViewProofImage(hw.proofImage!)} className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> ดูรูป
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      <ImageProofModal
        imageUrl={viewProofImage}
        title="หลักฐานภาพถ่ายการป้องกันพยาธิ"
        onClose={() => setViewProofImage(null)}
      />

      <ConfirmModal
        isOpen={deleteId !== null}
        title={deleteType === 'tick' ? 'ยืนยันการลบประวัติกำจัดเห็บหมัด' : deleteType === 'deworm' ? 'ยืนยันการลบประวัติถ่ายพยาธิ' : 'ยืนยันการลบประวัติพยาธิหนอนหัวใจ'}
        message={deleteType === 'tick' ? 'คุณแน่ใจหรือไม่ที่จะลบประวัติการกำจัดเห็บหมัดนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾' : deleteType === 'deworm' ? 'คุณแน่ใจหรือไม่ที่จะลบประวัติยาถ่ายพยาธินี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾' : 'คุณแน่ใจหรือไม่ที่จะลบประวัติป้องกันพยาธิหนอนหัวใจนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾'}
        onConfirm={executeDelete}
        onCancel={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
      />
    </>
  );
}
