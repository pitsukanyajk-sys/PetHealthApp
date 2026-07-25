import React, { useState, useEffect } from 'react';
import { AnnualHealth } from '../types';
import { createAnnualHealth, updateAnnualHealth, deleteAnnualHealth } from '../lib/api';
import { Plus, Trash2, Pencil, Calendar, ShieldCheck, Heart, Stethoscope, FileText, Search, Camera, Image as ImageIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { formatThaiDate, calculateAge } from '../lib/utils';
import ImageProofUploader from './ImageProofUploader';
import ImageProofModal from './ImageProofModal';

interface AnnualHealthProps {
  petId: string;
  records: AnnualHealth[];
  onRefresh: () => void;
  isReadOnly?: boolean;
  petWeight?: number;
  petBirthDate?: string;
  onUpdatePetWeight?: (weight: number) => void;
}

export default function AnnualHealthComponent({ petId, records, onRefresh, isReadOnly, petWeight, petBirthDate, onUpdatePetWeight }: AnnualHealthProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicName, setClinicName] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [bloodTest, setBloodTest] = useState('');
  const [vaccineStatus, setVaccineStatus] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState<string | undefined>();
  const [viewProofImage, setViewProofImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<AnnualHealth | null>(null);

  const resetForm = () => {
    setEditingRecord(null);
    setYear(new Date().getFullYear().toString());
    setDate(new Date().toISOString().split('T')[0]);
    setClinicName('');
    setPhysicalExam('');
    setBloodTest('');
    setVaccineStatus('');
    setWeight('');
    setAge('');
    setCost('');
    setNotes('');
    setProofImage(undefined);
    setShowForm(false);
  };

  const handleEdit = (rec: AnnualHealth) => {
    setEditingRecord(rec);
    setYear(String(rec.year));
    setDate(rec.date || '');
    setClinicName(rec.clinicName || '');
    setPhysicalExam(rec.physicalExam || '');
    setBloodTest(rec.bloodTest || '');
    setVaccineStatus(rec.vaccineStatus || '');
    setWeight(rec.weight ? String(rec.weight) : '');
    setAge(rec.age || '');
    setCost(rec.cost ? String(rec.cost) : '');
    setNotes(rec.notes || '');
    setProofImage(rec.proofImage);
    setShowForm(true);
  };

  // Auto age and weight
  useEffect(() => {
    if (petBirthDate && date) {
      setAge(calculateAge(petBirthDate, date));
    }
  }, [date, petBirthDate]);

  useEffect(() => {
    if (showForm && petWeight && !editingRecord) {
      setWeight(String(petWeight));
    }
  }, [showForm, petWeight, editingRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName || !physicalExam || !bloodTest || !vaccineStatus) {
      alert('กรุณากรอกข้อมูลที่สำคัญ (*) ให้ครบถ้วน');
      return;
    }
    setLoading(true);
    const weightNum = parseFloat(weight) || 0;
    try {
      if (editingRecord) {
        await updateAnnualHealth({
          ...editingRecord,
          year: Number(year),
          date,
          clinicName,
          physicalExam,
          bloodTest,
          vaccineStatus,
          weight: weightNum > 0 ? weightNum : undefined,
          age: age.trim() || undefined,
          cost: cost ? Number(cost) : 0,
          notes,
          proofImage: proofImage || undefined
        });
      } else {
        await createAnnualHealth({
          petId,
          year: Number(year),
          date,
          clinicName,
          physicalExam,
          bloodTest,
          vaccineStatus,
          weight: weightNum > 0 ? weightNum : undefined,
          age: age.trim() || undefined,
          cost: cost ? Number(cost) : 0,
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
      alert('ไม่สามารถบันทึกข้อมูลตรวจสุขภาพรายปีได้');
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
      await deleteAnnualHealth(deleteId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบข้อมูลตรวจสุขภาพรายปีได้');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredRecords = records.filter(rec => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return rec.clinicName?.toLowerCase().includes(q) || 
           rec.physicalExam?.toLowerCase().includes(q) || 
           rec.bloodTest?.toLowerCase().includes(q) || 
           rec.vaccineStatus?.toLowerCase().includes(q) || 
           rec.notes?.toLowerCase().includes(q) ||
           rec.year?.toString().includes(q);
  });

  return (
    <div id="annual-health-section" className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-display text-amber-900 flex items-center gap-2">
            ประวัติตรวจสุขภาพประจำปี (Annual Checkups)
          </h3>
          <p className="text-xs text-stone-500 mt-1">เก็บประวัติการตรวจร่างกาย ผลตรวจเลือด เม็ดเลือด ค่าไต ตับ และประเมินสุขภาพโดยรวมรายปี</p>
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
            {showForm ? 'ปิดฟอร์ม' : 'เพิ่มประวัติตรวจสุขภาพ'}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาชื่อคลินิก ปี ตรวจร่างกาย ผลเลือด หรือคำแนะนำ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-sm transition-all"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-amber-50/40 rounded-xl p-4 mb-6 border border-amber-100/50 text-sm">
          <h4 className="text-sm font-bold text-amber-900 mb-3">
            {editingRecord ? 'แก้ไขประวัติตรวจสุขภาพประจำปี' : 'บันทึกประวัติตรวจสุขภาพประจำปี'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">รอบปีที่ตรวจ (พ.ศ. / ค.ศ.) *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">วันที่เข้ารับการตรวจ *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">สถานที่ *</label>
              <input
                type="text"
                placeholder="เช่น รพ.สัตว์แสนดี, คลินิกบ้านรักสัตว์"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">ผลการตรวจร่างกายทั่วไป *</label>
              <input
                type="text"
                placeholder="เช่น สมบูรณ์ดีมาก, มีแผลที่ผิวหนังเล็กน้อย, พบหินปูนปานกลาง"
                value={physicalExam}
                onChange={(e) => setPhysicalExam(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">ผลการตรวจเลือด (ตัวเลือก) *</label>
              <input
                type="text"
                placeholder="เช่น ปกติดีทุกค่า, ค่าไตปกติดีแต่ค่าเม็ดเลือดขาวสูงขึ้นนิดหน่อย"
                value={bloodTest}
                onChange={(e) => setBloodTest(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">ประเมินสถานะวัคซีนประจำปี *</label>
              <input
                type="text"
                placeholder="เช่น วัคซีนครบถ้วนตามระยะอายุ, ควรนัดกระตุ้นรวม 5 โรคอีก 2 เดือน"
                value={vaccineStatus}
                onChange={(e) => setVaccineStatus(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">อายุ ณ วันตรวจ</label>
              <input
                type="text"
                placeholder="เช่น 1 ปี 2 เดือน"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
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
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">ค่าใช้จ่าย (บาท)</label>
              <input
                type="number"
                placeholder="เช่น 1500, 3200"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">หมายเหตุแพทย์ / แนะนำคำแนะเพิ่มเติม</label>
              <textarea
                placeholder="คำแนะนำจากสัตวแพทย์ เช่น ให้เพิ่มปริมาณน้ำดื่ม ปรับสูตรอาหารลดความเค็ม หรือพาวิ่งออกกำลังกาย..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <ImageProofUploader
                value={proofImage}
                onChange={setProofImage}
                label="แนบภาพถ่ายหลักฐาน (ใบผลตรวจเลือด/สมุดตรวจสุขภาพ/ใบเสร็จ)"
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
              {loading ? 'กำลังบันทึก...' : 'บันทึกประวัติตรวจสุขภาพ'}
            </button>
          </div>
        </form>
      )}

      {filteredRecords.length === 0 ? (
        <div className="text-center py-8 bg-stone-50/50 rounded-xl border border-stone-100 text-sm text-stone-500">
          <Stethoscope className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p>ยังไม่มีประวัติตรวจสุขภาพประจำปีที่ตรงกับคำค้นหาค่ะ</p>
          <p className="text-xs text-stone-400 mt-1">การตรวจสุขภาพประจำปีช่วยคัดกรองโรคภัยล่วงหน้าได้ เพื่อให้น้องอยู่กับเราไปนานๆ 🩺❤️</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => (
            <div key={rec.id} className="bg-stone-50/40 border border-stone-100 rounded-xl p-5 hover:border-amber-100 hover:bg-amber-50/10 transition flex flex-col justify-between text-xs">
              <div>
                <div className="flex justify-between items-start border-b border-stone-100 pb-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-amber-700 text-white font-bold px-2.5 py-0.5 rounded text-[11px]">ตรวจสุขภาพปี {rec.year}</span>
                      {(rec.weight || rec.age) && (
                        <span className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium">
                          {rec.weight ? `⚖️ ${rec.weight} kg` : ''} {rec.weight && rec.age ? '• ' : ''} {rec.age ? `🎂 ${rec.age}` : ''}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-amber-950 text-sm mt-2 flex items-center gap-1">
                      🏥 {rec.clinicName}
                    </h4>
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(rec)}
                        className="text-stone-400 hover:text-amber-600 p-1.5 rounded hover:bg-stone-100 transition cursor-pointer"
                        title="แก้ไขข้อมูล"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="text-stone-400 hover:text-red-500 p-1.5 rounded hover:bg-stone-100 transition cursor-pointer"
                        title="ลบข้อมูล"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-stone-100/50">
                    <span className="font-bold text-amber-900 flex items-center gap-1 mb-1 text-xs">
                      🩺 ตรวจร่างกายทั่วไป
                    </span>
                    <p className="text-stone-700 leading-relaxed text-xs">{rec.physicalExam}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-stone-100/50">
                    <span className="font-bold text-amber-900 flex items-center gap-1 mb-1 text-xs">
                      🩸 ผลการตรวจเลือด
                    </span>
                    <p className="text-stone-700 leading-relaxed text-xs">{rec.bloodTest}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-stone-100/50">
                    <span className="font-bold text-amber-900 flex items-center gap-1 mb-1 text-xs">
                      💉 สถานะการรับวัคซีน
                    </span>
                    <p className="text-stone-700 leading-relaxed text-xs">{rec.vaccineStatus}</p>
                  </div>
                </div>

                {rec.notes && (
                  <div className="bg-amber-50/20 p-3.5 rounded-lg border border-amber-100/20 mt-3 text-sm text-stone-700 leading-relaxed">
                    💡 <b>คำแนะนำเพิ่มจากหมอ:</b> {rec.notes}
                  </div>
                )}

                {rec.proofImage && (
                  <div className="mt-3 flex items-center justify-between bg-white p-2.5 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2">
                      <img src={rec.proofImage} alt="หลักฐาน" className="w-12 h-12 object-cover rounded border border-amber-200 cursor-pointer" onClick={() => setViewProofImage(rec.proofImage!)} />
                      <span className="text-xs font-semibold text-stone-700 flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-amber-700" /> มีหลักฐานภาพถ่ายผลตรวจ</span>
                    </div>
                    <button type="button" onClick={() => setViewProofImage(rec.proofImage!)} className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" /> ดูหลักฐาน
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  วันที่ตรวจ: {formatThaiDate(rec.date)}
                </span>
                <span className="font-bold text-amber-900">
                  ค่าใช้จ่ายรวม: ฿{rec.cost.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageProofModal
        imageUrl={viewProofImage}
        title="หลักฐานภาพถ่ายผลตรวจสุขภาพรายปี"
        onClose={() => setViewProofImage(null)}
      />

      <ConfirmModal
        isOpen={deleteId !== null}
        title="ยืนยันการลบประวัติการตรวจสุขภาพ"
        message="คุณแน่ใจหรือไม่ที่จะลบข้อมูลตรวจสุขภาพรายปีนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
