import React, { useState, useEffect } from 'react';
import { RoutineHealth } from '../types';
import { createRoutineHealth, updateRoutineHealth, deleteRoutineHealth } from '../lib/api';
import { Plus, Trash2, Pencil, Calendar, Scissors, Sparkles, TrendingUp, Info, Search, Camera, Image as ImageIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { formatThaiDate, calculateAge } from '../lib/utils';
import ImageProofUploader from './ImageProofUploader';
import ImageProofModal from './ImageProofModal';

interface RoutineHealthProps {
  petId: string;
  records: RoutineHealth[];
  onRefresh: () => void;
  isReadOnly?: boolean;
  petWeight?: number;
  petBirthDate?: string;
  onUpdatePetWeight?: (weight: number) => void;
}

export default function RoutineHealthComponent({ petId, records, onRefresh, isReadOnly, petWeight, petBirthDate, onUpdatePetWeight }: RoutineHealthProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'dental' | 'grooming' | 'growth' | 'symptoms'>('grooming');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [value, setValue] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState<string | undefined>();
  const [viewProofImage, setViewProofImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<RoutineHealth | null>(null);

  const resetForm = () => {
    setEditingRecord(null);
    setCategory('grooming');
    setTitle('');
    setDetail('');
    setValue('');
    setWeight('');
    setAge('');
    setCost('');
    setNotes('');
    setProofImage(undefined);
    setShowForm(false);
  };

  const handleEdit = (rec: RoutineHealth) => {
    setEditingRecord(rec);
    setCategory(rec.category);
    setTitle(rec.title || '');
    setDetail(rec.detail || '');
    setValue(rec.value || '');
    setWeight(rec.weight ? String(rec.weight) : '');
    setAge(rec.age || '');
    setCost(rec.cost ? String(rec.cost) : '');
    setNotes(rec.notes || '');
    setProofImage(rec.proofImage);
    setShowForm(true);
  };

  // Auto age and weight
  useEffect(() => {
    if (petBirthDate) {
      setAge(calculateAge(petBirthDate, new Date().toISOString().split('T')[0]));
    }
  }, [petBirthDate]);

  useEffect(() => {
    if (showForm && petWeight && !editingRecord) {
      setWeight(String(petWeight));
    }
  }, [showForm, petWeight, editingRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !detail) {
      alert('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }
    setLoading(true);
    const weightNum = parseFloat(weight) || 0;
    try {
      if (editingRecord) {
        await updateRoutineHealth({
          ...editingRecord,
          category,
          title,
          detail,
          value,
          weight: weightNum > 0 ? weightNum : undefined,
          age: age.trim() || undefined,
          cost: cost ? Number(cost) : undefined,
          notes,
          proofImage: proofImage || undefined
        });
      } else {
        await createRoutineHealth({
          petId,
          date: new Date().toISOString().split('T')[0],
          category,
          title,
          detail,
          value,
          weight: weightNum > 0 ? weightNum : undefined,
          age: age.trim() || undefined,
          cost: cost ? Number(cost) : undefined,
          notes,
          proofImage: proofImage || undefined
        });
      }
      if (weightNum > 0 && onUpdatePetWeight) {
        onUpdatePetWeight(weightNum);
      }
      resetForm();
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถบันทึกข้อมูลประวัติสุขภาพประจำตัวได้');
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
      await deleteRoutineHealth(deleteId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบประวัติได้');
    } finally {
      setDeleteId(null);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'dental':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-xs">🦷 สุขภาพช่องปาก/ขูดหินปูน</span>;
      case 'grooming':
        return <span className="bg-pink-50 text-pink-700 border border-pink-100 px-2.5 py-0.5 rounded-full text-xs">✂️ กรูมมิ่ง/ตัดขน/เล็บ</span>;
      case 'growth':
        return <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full text-xs">📈 พัฒนาการ/น้ำหนักตัว</span>;
      case 'symptoms':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-xs">⚠️ ติดตามอาการทั่วไป</span>;
      default:
        return <span className="bg-stone-50 text-stone-700 border border-stone-100 px-2.5 py-0.5 rounded-full text-xs">{cat}</span>;
    }
  };

  const filteredRecords = records.filter(rec => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return rec.title?.toLowerCase().includes(q) || 
           rec.detail?.toLowerCase().includes(q) || 
           rec.notes?.toLowerCase().includes(q) ||
           rec.value?.toLowerCase().includes(q);
  });

  return (
    <div id="routine-health-section" className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-display text-amber-900 flex items-center gap-2">
            ประวัติสุขภาพและการดูแลประจำตัว
          </h3>
          <p className="text-xs text-stone-500 mt-1">จดบันทึกการดูแลฟัน เหงือก ตัดขน อาบน้ำ และติดตามน้ำหนักการเจริญเติบโตของน้อง</p>
        </div>
        {isReadOnly ? (
          <span className="text-xs text-stone-500 bg-stone-100 border border-stone-250 px-3 py-1.5 rounded-full font-semibold select-none flex items-center gap-1">
            <span>🔒</span>
            <span>อ่านอย่างเดียว</span>
          </span>
        ) : (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-4 py-2 text-sm font-sans flex items-center gap-1 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'ปิดฟอร์ม' : 'เพิ่มบันทึกการดูแล'}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาชื่อกิจกรรม รายละเอียด ผลลัพธ์ หรือหมายเหตุดูแล..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-sm transition-all"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-amber-50/40 rounded-xl p-4 mb-6 border border-amber-100/50 text-sm">
          <h4 className="text-sm font-bold text-amber-900 mb-3">
            {editingRecord ? 'แก้ไขบันทึกการดูแล' : 'บันทึกการดูแลใหม่'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">หมวดหมู่ดูแล *</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="dental">🦷 สุขภาพช่องปาก & ขูดหินปูน</option>
                <option value="grooming">✂️ กรูมมิ่ง (ตัดแต่งขน/เล็บ/เช็ดหู)</option>
                <option value="growth">📈 น้ำหนัก & พัฒนาการตามวัย</option>
                <option value="symptoms">⚠️ ติดตามอาการทั่วไป (เช่น ขี้หูเยอะ, คันผิวหนัง)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">หัวข้อกิจกรรม *</label>
              <input
                type="text"
                placeholder="เช่น ขูดหินปูนครั้งแรก, อาบน้ำตัดสั้นต้อนรับฤดูร้อน"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">รายละเอียดกิจกรรม *</label>
              <input
                type="text"
                placeholder="เช่น ขูดหินปูนสะอาดวั๊บ ไม่พบฟันผุ, ตัดขนทรงหมี ไถใต้เท้า"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">ผลลัพธ์ / ค่าที่วัดได้ (ตัวเลือก)</label>
              <input
                type="text"
                placeholder="เช่น ฟันสะอาดวิ้ง ไม่มีกลิ่นปาก"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">อายุ ณ วันบันทึก</label>
              <input
                type="text"
                placeholder="เช่น 1 ปี 2 เดือน"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">น้ำหนักตัว (กก.)</label>
              <input
                type="number"
                step="0.01"
                placeholder="เช่น 4.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">ค่าใช้จ่าย (บาท) (ตัวเลือก)</label>
              <input
                type="number"
                placeholder="เช่น 1200, 500"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">หมายเหตุเพิ่มเติม</label>
              <input
                type="text"
                placeholder="เช่น น้องดื้อนิดหน่อยตอนไถอุ้งเท้า, คุณหมอบอกฟันแข็งแรงมาก..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <ImageProofUploader
                value={proofImage}
                onChange={setProofImage}
                label="แนบภาพถ่ายหลักฐาน (รูปหลังตัดขน/ผลขูดหินปูน/ใบเสร็จ)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={resetForm}
              className="text-stone-600 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg text-xs cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-xs font-medium"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกการดูแล'}
            </button>
          </div>
        </form>
      )}

      {filteredRecords.length === 0 ? (
        <div className="text-center py-8 bg-stone-50/50 rounded-xl border border-stone-100 text-sm text-stone-500">
          <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p>ยังไม่มีประวัติการดูแลสุขภาพที่ตรงกับคำค้นหาค่ะ</p>
          <p className="text-xs text-stone-400 mt-1">คลิกปุ่มด้านบนเพื่อเพิ่มกิจกรรมดูแลส่วนตัวให้น้องนะคะ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((rec) => (
            <div key={rec.id} className="bg-stone-50/60 border border-stone-100/60 rounded-xl p-4 flex flex-col justify-between hover:border-amber-100 hover:bg-amber-50/10 transition text-xs">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {getCategoryBadge(rec.category)}
                      {(rec.weight || rec.age) && (
                        <span className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 font-medium">
                          {rec.weight ? `⚖️ ${rec.weight} kg` : ''} {rec.weight && rec.age ? '• ' : ''} {rec.age ? `🎂 ${rec.age}` : ''}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-amber-950 text-sm mt-1">{rec.title}</h4>
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(rec)}
                        className="text-stone-400 hover:text-amber-600 p-1 rounded hover:bg-stone-100 cursor-pointer"
                        title="แก้ไขประวัติ"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="text-stone-400 hover:text-red-500 p-1 rounded hover:bg-stone-100 cursor-pointer"
                        title="ลบประวัติ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-stone-800 text-sm leading-relaxed mt-1.5 font-sans whitespace-pre-wrap">{rec.detail}</p>

                {rec.value && (
                  <div className="mt-2.5 text-xs bg-white p-2.5 rounded border border-stone-100 inline-block font-sans">
                    📊 <b>ผลลัพธ์:</b> <span className="text-amber-900 font-medium">{rec.value}</span>
                  </div>
                )}

                {rec.notes && (
                  <p className="text-xs text-stone-500 bg-amber-50/30 p-2 rounded-lg border border-amber-100/20 italic mt-2.5 leading-relaxed">💡 หมายเหตุ: {rec.notes}</p>
                )}

                {rec.proofImage && (
                  <div className="mt-2.5 flex items-center justify-between bg-white p-2 rounded-lg border border-stone-150">
                    <div className="flex items-center gap-2">
                      <img src={rec.proofImage} alt="หลักฐาน" className="w-10 h-10 object-cover rounded border border-amber-200 cursor-pointer" onClick={() => setViewProofImage(rec.proofImage!)} />
                      <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1"><Camera className="w-3 h-3 text-amber-700" /> มีหลักฐานภาพถ่าย</span>
                    </div>
                    <button type="button" onClick={() => setViewProofImage(rec.proofImage!)} className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> ดูหลักฐาน
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-100 text-[10px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  {formatThaiDate(rec.date)}
                </span>
                {rec.cost && rec.cost > 0 ? (
                  <span className="font-bold text-amber-900">ค่าใช้จ่าย: ฿{rec.cost.toLocaleString()}</span>
                ) : (
                  <span className="text-stone-400 italic">ไม่มีค่าใช้จ่าย</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageProofModal
        imageUrl={viewProofImage}
        title="หลักฐานภาพถ่ายการดูแลสุขภาพ"
        onClose={() => setViewProofImage(null)}
      />

      <ConfirmModal
        isOpen={deleteId !== null}
        title="ยืนยันการลบประวัติการดูแล"
        message="คุณแน่ใจหรือไม่ที่จะลบประวัติสุขภาพประจำตัวนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
