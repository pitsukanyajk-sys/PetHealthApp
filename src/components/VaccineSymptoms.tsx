import React, { useState } from 'react';
import { VaccineSymptom } from '../types';
import { createVaccineSymptom, deleteVaccineSymptom } from '../lib/api';
import { Plus, Trash2, Calendar, ShieldAlert, Heart, Activity, AlertCircle, Search } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface VaccineSymptomsProps {
  petId: string;
  symptoms: VaccineSymptom[];
  onRefresh: () => void;
  isReadOnly?: boolean;
}

export default function VaccineSymptoms({ petId, symptoms, onRefresh, isReadOnly }: VaccineSymptomsProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [appetite, setAppetite] = useState<'normal' | 'decreased' | 'none'>('normal');
  const [behavior, setBehavior] = useState<'cheerful' | 'lethargic' | 'agitated'>('cheerful');
  const [abnormality, setAbnormality] = useState<'none' | 'vomiting' | 'swollen_face' | 'fever' | 'other'>('none');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName || !date) {
      alert('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }
    setLoading(true);
    try {
      await createVaccineSymptom({
        petId,
        vaccineName,
        date,
        appetite,
        behavior,
        abnormality,
        notes
      });
      setVaccineName('');
      setDate(new Date().toISOString().split('T')[0]);
      setAppetite('normal');
      setBehavior('cheerful');
      setAbnormality('none');
      setNotes('');
      setShowForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเพิ่มประวัติติดตามอาการได้');
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
      await deleteVaccineSymptom(deleteId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบบันทึกติดตามอาการได้');
    } finally {
      setDeleteId(null);
    }
  };

  const getAppetiteText = (v: string) => {
    switch (v) {
      case 'normal': return '😋 ปกติ';
      case 'decreased': return '🍽️ ลดลง';
      case 'none': return '❌ ไม่ทานอาหาร';
      default: return v;
    }
  };

  const getBehaviorText = (v: string) => {
    switch (v) {
      case 'cheerful': return '☀️ ร่าเริงดี';
      case 'lethargic': return '😴 ซึม/นอนเยอะ';
      case 'agitated': return '😡 ดุร้าย/หงุดหงิด';
      default: return v;
    }
  };

  const getAbnormalityBadge = (v: string) => {
    switch (v) {
      case 'none':
        return <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-xs">🟢 ปกติดี ไม่มีอาการผิดปกติ</span>;
      case 'vomiting':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs">🤮 อาเจียน</span>;
      case 'swollen_face':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs">⚠️ หน้าบวม/บวมแดง (แพ้ยา!)</span>;
      case 'fever':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs">🔥 ตัวร้อน/มีไข้</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs">❓ อื่นๆ</span>;
    }
  };

  const filteredSymptoms = symptoms.filter(vs => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return vs.vaccineName?.toLowerCase().includes(q) || vs.notes?.toLowerCase().includes(q);
  });

  return (
    <div id="vaccine-symptoms-section" className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60 mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-display text-amber-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-700" />
            ติดตามอาการหลังฉีดวัคซีน
          </h3>
          <p className="text-xs text-stone-500 mt-1">เฝ้าระวังอาการแพ้และติดตามสภาพร่างกายน้องหลังรับวัคซีนภายใน 24-48 ชม.</p>
        </div>
        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-4 py-2 text-xs font-sans flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'ปิดฟอร์ม' : 'บันทึกอาการหลังฉีด'}
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาชื่อวัคซีน หรือบันทึกอาการ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-sm transition-all"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-stone-50 rounded-xl p-4 mb-6 border border-amber-100 text-sm">
          <h4 className="text-xs font-bold text-amber-900 mb-3">แบบบันทึกอาการหลังฉีดวัคซีน</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">ชื่อวัคซีนที่ฉีด *</label>
              <input
                type="text"
                placeholder="เช่น วัคซีนรวม 5 โรค เข็มที่ 1, พิษสุนัขบ้า"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                className="w-full text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">วันที่ฉีด/สังเกตอาการ *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">ความยากอาหาร (Appetite)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700">
                  <input
                    type="radio"
                    name="appetite"
                    checked={appetite === 'normal'}
                    onChange={() => setAppetite('normal')}
                    className="accent-amber-700 h-3.5 w-3.5"
                  />
                  ปกติ
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700">
                  <input
                    type="radio"
                    name="appetite"
                    checked={appetite === 'decreased'}
                    onChange={() => setAppetite('decreased')}
                    className="accent-amber-700 h-3.5 w-3.5"
                  />
                  ลดลง
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700">
                  <input
                    type="radio"
                    name="appetite"
                    checked={appetite === 'none'}
                    onChange={() => setAppetite('none')}
                    className="accent-amber-700 h-3.5 w-3.5"
                  />
                  ไม่ทานเลย
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">พฤติกรรม (Behavior)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700">
                  <input
                    type="radio"
                    name="behavior"
                    checked={behavior === 'cheerful'}
                    onChange={() => setBehavior('cheerful')}
                    className="accent-amber-700 h-3.5 w-3.5"
                  />
                  ร่าเริงดี
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700">
                  <input
                    type="radio"
                    name="behavior"
                    checked={behavior === 'lethargic'}
                    onChange={() => setBehavior('lethargic')}
                    className="accent-amber-700 h-3.5 w-3.5"
                  />
                  ซึม/นอนซม
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700">
                  <input
                    type="radio"
                    name="behavior"
                    checked={behavior === 'agitated'}
                    onChange={() => setBehavior('agitated')}
                    className="accent-amber-700 h-3.5 w-3.5"
                  />
                  ดุร้าย/กลัวสัมผัส
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-2">ความผิดปกติที่พบ (Abnormality)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700 bg-white p-2 border border-stone-200 rounded-lg">
                  <input
                    type="radio"
                    name="abnormality"
                    checked={abnormality === 'none'}
                    onChange={() => setAbnormality('none')}
                    className="accent-amber-700"
                  />
                  ไม่มี/ปกติ
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700 bg-white p-2 border border-stone-200 rounded-lg">
                  <input
                    type="radio"
                    name="abnormality"
                    checked={abnormality === 'vomiting'}
                    onChange={() => setAbnormality('vomiting')}
                    className="accent-amber-700"
                  />
                  อาเจียน
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700 bg-white p-2 border border-stone-200 rounded-lg">
                  <input
                    type="radio"
                    name="abnormality"
                    checked={abnormality === 'swollen_face'}
                    onChange={() => setAbnormality('swollen_face')}
                    className="accent-amber-700"
                  />
                  หน้าบวมแดง
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700 bg-white p-2 border border-stone-200 rounded-lg">
                  <input
                    type="radio"
                    name="abnormality"
                    checked={abnormality === 'fever'}
                    onChange={() => setAbnormality('fever')}
                    className="accent-amber-700"
                  />
                  ตัวร้อน/มีไข้
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700 bg-white p-2 border border-stone-200 rounded-lg">
                  <input
                    type="radio"
                    name="abnormality"
                    checked={abnormality === 'other'}
                    onChange={() => setAbnormality('other')}
                    className="accent-amber-700"
                  />
                  อื่นๆ
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">หมายเหตุเพิ่มเติม</label>
              <textarea
                placeholder="รายละเอียดเพิ่มเติม เช่น มีรอยแดงบริเวณที่ฉีด แตะตัวแล้วร้อง หรือมีอุณหภูมิร่างกาย..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-stone-600 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg text-xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-xs font-medium"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกอาการ'}
            </button>
          </div>
        </form>
      )}

      {filteredSymptoms.length === 0 ? (
        <div className="text-center py-8 bg-stone-50/50 rounded-xl border border-stone-100 text-xs text-stone-500">
          <Heart className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
          <p>ยังไม่มีประวัติการติดตามอาการหลังฉีดวัคซีนที่ตรงกับคำค้นหา</p>
          <p className="text-[10px] text-stone-400 mt-1">คอยเฝ้าระวังเพื่อให้น้องแข็งแรงและปลอดภัยอยู่เสมอนะคะ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSymptoms.map((vs) => (
            <div key={vs.id} className="bg-stone-50/60 rounded-xl p-4 border border-stone-100/50 flex flex-col justify-between text-xs hover:border-amber-100 hover:bg-amber-50/10 transition">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">{vs.vaccineName}</h4>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {vs.date}
                    </span>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDelete(vs.id)}
                      className="text-stone-400 hover:text-red-500 p-1 rounded hover:bg-stone-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 bg-white/60 p-3 rounded-lg border border-stone-100/40 text-xs">
                  <div>
                    <span className="text-stone-500">ความอยากอาหาร: </span>
                    <span className="font-medium text-stone-850 block mt-0.5">{getAppetiteText(vs.appetite)}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">พฤติกรรม/อารมณ์: </span>
                    <span className="font-medium text-stone-850 block mt-0.5">{getBehaviorText(vs.behavior)}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 text-xs text-stone-500">ความผิดปกติ/อาการแพ้:</div>
                  {getAbnormalityBadge(vs.abnormality)}
                </div>

                {vs.notes && (
                  <p className="text-stone-700 bg-amber-50/30 p-2.5 rounded-lg border border-amber-100/20 text-xs mt-2.5 leading-relaxed">
                    💡 <b>หมายเหตุ:</b> {vs.notes}
                  </p>
                )}
              </div>

              {vs.abnormality !== 'none' && vs.abnormality === 'swollen_face' && (
                <div className="mt-3 flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50/60 p-2 rounded border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>อาการบวมแดงที่หน้าเป็นสัญญาณแพ้วัคซีนรุนแรง ควรรีบนำส่งสัตวแพทย์ด่วน!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        title="ยืนยันการลบบันทึกติดตามอาการ"
        message="คุณแน่ใจหรือไม่ที่จะลบบันทึกติดตามอาการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
