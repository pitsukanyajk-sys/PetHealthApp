import React, { useState, useEffect } from 'react';
import { Treatment, TreatmentMedicineItem } from '../types';
import { createTreatment, updateTreatment, deleteTreatment } from '../lib/api';
import { Plus, Trash2, Pencil, Calendar, Activity, DollarSign, MessageCircle, Heart, MapPin, Pill, Calculator, ListPlus, Search, Camera, Image as ImageIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import ImageProofUploader from './ImageProofUploader';
import ImageProofModal from './ImageProofModal';
import { formatThaiDate, calculateAge } from '../lib/utils';

interface TreatmentListProps {
  petId: string;
  treatments: Treatment[];
  onRefresh: () => void;
  isReadOnly?: boolean;
  petWeight?: number;
  petBirthDate?: string;
  onUpdatePetWeight?: (weight: number) => void;
}

export default function TreatmentList({ petId, treatments, onRefresh, isReadOnly, petWeight, petBirthDate, onUpdatePetWeight }: TreatmentListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentDetail, setTreatmentDetail] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState<string | undefined>();
  const [viewProofImage, setViewProofImage] = useState<string | null>(null);

  // Auto age & weight
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
  
  // Multiple medicines states
  const [medicines, setMedicines] = useState<TreatmentMedicineItem[]>([]);
  const [medName, setMedName] = useState('');
  const [medQty, setMedQty] = useState('');
  const [medUnit, setMedUnit] = useState('');
  const [medPrice, setMedPrice] = useState('');
  
  // Other medical/doctor fees
  const [medicalFee, setMedicalFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);

  const resetForm = () => {
    setEditingTreatment(null);
    setDate('');
    setDiagnosis('');
    setTreatmentDetail('');
    setWeight('');
    setAge('');
    setMedicines([]);
    setMedicalFee('');
    setClinicName('');
    setNotes('');
    setProofImage(undefined);
    setShowAddForm(false);
  };

  const handleEdit = (tr: Treatment) => {
    setEditingTreatment(tr);
    setDate(tr.date || '');
    setDiagnosis(tr.diagnosis || '');
    setTreatmentDetail(tr.treatmentDetail || '');
    setClinicName(tr.clinicName || '');
    setWeight(tr.weight ? String(tr.weight) : '');
    setAge(tr.age || '');
    setNotes(tr.notes || '');
    setProofImage(tr.proofImage);
    const medList = tr.medicinesList || [];
    setMedicines(medList);
    const medsCost = medList.reduce((sum, item) => sum + item.price, 0);
    const fee = (tr.cost || 0) - medsCost;
    setMedicalFee(fee > 0 ? String(fee) : '');
    setShowAddForm(true);
  };

  const handleAddMedicine = () => {
    if (!medName || !medQty || !medUnit) {
      alert('กรุณากรอกชื่อยา จำนวน และหน่วยด้วยนะคะ (เช่น พาราเซตามอล, 1, ขวด) 🐾');
      return;
    }
    const qtyNum = parseFloat(medQty) || 1;
    const priceNum = parseFloat(medPrice) || 0;
    const newItem: TreatmentMedicineItem = {
      name: medName,
      quantity: qtyNum,
      unit: medUnit,
      price: priceNum
    };
    setMedicines([...medicines, newItem]);
    setMedName('');
    setMedQty('');
    setMedUnit('');
    setMedPrice('');
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // Auto-calculated total cost
  const medicinesTotalCost = medicines.reduce((sum, item) => sum + item.price, 0);
  const parsedFee = parseFloat(medicalFee) || 0;
  const computedTotalCost = parsedFee + medicinesTotalCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !diagnosis || !treatmentDetail || !clinicName) {
      alert('กรุณากรอกข้อมูลสำคัญ (*) ให้ครบถ้วนด้วยนะคะ 🐾');
      return;
    }
    setLoading(true);
    const weightNum = parseFloat(weight) || 0;
    try {
      if (editingTreatment) {
        await updateTreatment({
          ...editingTreatment,
          date,
          diagnosis,
          treatmentDetail,
          medicine: medicines.map(m => `${m.name} (${m.quantity} ${m.unit}) - ฿${m.price}`).join(', ') || undefined,
          medicinesList: medicines,
          cost: computedTotalCost,
          clinicName,
          weight: weightNum > 0 ? weightNum : undefined,
          age: age.trim() || undefined,
          notes,
          proofImage: proofImage || undefined
        });
      } else {
        await createTreatment({
          petId,
          date,
          diagnosis,
          treatmentDetail,
          medicine: medicines.map(m => `${m.name} (${m.quantity} ${m.unit}) - ฿${m.price}`).join(', ') || undefined,
          medicinesList: medicines,
          cost: computedTotalCost,
          clinicName,
          weight: weightNum > 0 ? weightNum : undefined,
          age: age.trim() || undefined,
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
      alert('ไม่สามารถบันทึกประวัติการรักษาได้ค่ะ');
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
      await deleteTreatment(deleteId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบประวัติการรักษาได้');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredTreatments = treatments.filter((tr) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      tr.diagnosis?.toLowerCase().includes(q) ||
      tr.treatmentDetail?.toLowerCase().includes(q) ||
      tr.clinicName?.toLowerCase().includes(q) ||
      tr.notes?.toLowerCase().includes(q) ||
      tr.medicine?.toLowerCase().includes(q)
    );
  });

  const grandTotalTreatmentsCost = filteredTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);

  return (
    <div id="treatment-section" className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-display text-amber-900 flex items-center gap-2">
            ประวัติการรักษาและการป่วย
          </h3>
          <p className="text-xs text-stone-500 mt-1">บันทึกการพบแพทย์ การวินิจฉัยโรค ค่ายา และการดูแลสุขภาพน้อง</p>
        </div>
        {isReadOnly ? (
          <span className="text-xs text-stone-500 bg-stone-100 border border-stone-250 px-3 py-1.5 rounded-full font-semibold select-none flex items-center gap-1">
            <span>🔒</span>
            <span>อ่านอย่างเดียว</span>
          </span>
        ) : (
          <button
            id="btn-add-treatment"
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
          placeholder="ค้นหาประวัติการรักษา, อาการ, คลินิก หรือหมายเหตุ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-sm transition-all"
        />
      </div>

      {showAddForm && (
        <form id="add-treatment-form" onSubmit={handleSubmit} className="bg-amber-50/50 rounded-xl p-5 mb-6 border border-amber-100/50 animate-fade-in text-sm space-y-4">
          <h4 className="text-base font-bold text-amber-950 flex items-center gap-2 pb-2 border-b border-amber-100">
            <Activity className="w-5 h-5 text-amber-700" />
            {editingTreatment ? 'แก้ไขประวัติการรักษา' : 'บันทึกประวัติการรักษาใหม่'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">อาการ / การวินิจฉัยโรค *</label>
              <input
                id="tr-diagnosis-input"
                type="text"
                placeholder="เช่น ไข้หวัดใหญ่, ท้องเสียรุนแรง, แผลกัดกัน"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">สถานที่ *</label>
              <input
                id="tr-clinic-input"
                type="text"
                placeholder="เช่น รพ.สัตว์มิตรภาพ, คลินิกรักษาสัตว์แสนดี"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">วันที่เข้ารับการรักษา *</label>
              <input
                id="tr-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">อายุ ณ วันที่รักษา</label>
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
              <label className="block text-xs font-semibold text-stone-700 mb-1">ค่าบริการทางการแพทย์ / ค่าหมออื่นๆ (฿)</label>
              <input
                type="number"
                placeholder="เช่น 200 (ไม่รวมค่ายา)"
                value={medicalFee}
                onChange={(e) => setMedicalFee(e.target.value)}
                className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Medicines Entry Module */}
          <div className="bg-white border border-amber-200/60 rounded-xl p-4 space-y-3">
            <h5 className="font-bold text-xs text-amber-900 flex items-center gap-1">
              <Pill className="w-4 h-4 text-amber-700" />
              เพิ่มรายการยาที่ได้รับ (ใส่ได้มากกว่า 1 รายการ)
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">ชื่อยา</label>
                <input
                  type="text"
                  placeholder="เช่น ยาฆ่าเชื้อ, ยาแก้ไอ"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">จำนวน (ตัวเลข)</label>
                <input
                  type="number"
                  placeholder="เช่น 1, 10"
                  value={medQty}
                  onChange={(e) => setMedQty(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">หน่วย</label>
                <input
                  type="text"
                  placeholder="เช่น ขวด, เม็ด, ซอง"
                  value={medUnit}
                  onChange={(e) => setMedUnit(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">ราคา (฿)</label>
                  <input
                    type="number"
                    placeholder="เช่น 120"
                    value={medPrice}
                    onChange={(e) => setMedPrice(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-3.5 py-2 text-xs font-bold transition flex items-center gap-1 shadow-sm h-[34px]"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  เพิ่มยา
                </button>
              </div>
            </div>

            {/* Medicines List Preview */}
            {medicines.length > 0 ? (
              <div className="border border-stone-100 rounded-lg overflow-hidden mt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100 text-stone-500">
                      <th className="p-2">ชื่อยา</th>
                      <th className="p-2">จำนวน</th>
                      <th className="p-2">หน่วย</th>
                      <th className="p-2 text-right">ราคา</th>
                      <th className="p-2 text-right w-16">ลบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((item, index) => (
                      <tr key={index} className="border-b border-stone-50 text-stone-800">
                        <td className="p-2 font-medium">{item.name}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{item.unit}</td>
                        <td className="p-2 text-right font-bold text-amber-950">฿{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[11px] text-stone-400 italic">ยังไม่มีการเพิ่มรายการยาค่ะ (หากมีกรุณากรอกและคลิกเพิ่มยา)</p>
            )}
          </div>

          {/* Calculated Grand Total cost box */}
          <div className="bg-[#FAF6F0] rounded-xl p-4 border border-amber-200/50 flex justify-between items-center">
            <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
              <Calculator className="w-4 h-4 text-amber-700" />
              สรุปยอดค่าใช้จ่าย (คำนวณจาก ค่าบริการ + ค่ายาทั้งหมด):
            </span>
            <span className="text-base font-bold text-amber-900">
              ฿{computedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">รายละเอียดการรักษา *</label>
            <textarea
              id="tr-detail-input"
              rows={2}
              placeholder="เช่น คุณหมอตรวจพบว่าเป็นแผลลึก จึงโกนขนทำความสะอาดแผล สั่งทายาฆ่าเชื้อสองสัปดาห์"
              value={treatmentDetail}
              onChange={(e) => setTreatmentDetail(e.target.value)}
              className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">บันทึกเพิ่มเติม</label>
            <textarea
              id="tr-notes-input"
              rows={2}
              placeholder="เช่น นัดพาไปล้างแผลเพิ่มวันเสาร์, กินยาทุกวันเช้า-เย็นหลังอาหาร"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <ImageProofUploader
              value={proofImage}
              onChange={setProofImage}
              label="แนบภาพถ่ายหลักฐาน (ใบสั่งยา / ผลตรวจ / ใบเสร็จ / ภาพแผลหรืออาการ)"
            />
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
              id="tr-submit-btn"
              type="submit"
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกประวัติการรักษา'}
            </button>
          </div>
        </form>
      )}

      {treatments.length === 0 ? (
        <div id="no-treatment" className="text-center py-8 bg-stone-50/50 rounded-xl border border-stone-100">
          <Activity className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500 font-sans">ยังไม่มีประวัติการเจ็บป่วย</p>
          <p className="text-xs text-stone-400 mt-1">น้องแข็งแรงดีมาก! คลิกปุ่ม "เพิ่มบันทึก" หากต้องจดบันทึกการป่วยย้อนหลัง</p>
        </div>
      ) : filteredTreatments.length === 0 ? (
        <div id="no-search-results" className="text-center py-8 bg-stone-50/50 rounded-xl border border-stone-100">
          <Search className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500 font-sans">ไม่พบประวัติการรักษาตามคำค้นหา</p>
          <p className="text-xs text-stone-400 mt-1">ลองใช้คำอื่น หรือคำค้นที่สั้นลงดูนะคะ 🐾</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTreatments.map((tr) => {
            const hasMedList = tr.medicinesList && tr.medicinesList.length > 0;
            return (
              <div key={tr.id} className="border border-stone-150 rounded-2xl p-5 hover:border-amber-300 hover:bg-amber-50/5 transition">
                <div className="flex justify-between items-start pb-3 border-b border-stone-100 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 bg-red-50 rounded-xl text-red-600 border border-red-100 shrink-0">
                      <Heart className="w-5 h-5 fill-red-500" />
                    </span>
                    <div>
                      <h4 className="font-bold text-amber-950 text-base">{tr.diagnosis}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-stone-500">
                        <span className="flex items-center gap-1 text-stone-600 font-medium bg-stone-100 px-2 py-0.5 rounded">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          {formatThaiDate(tr.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          {tr.clinicName}
                        </span>
                        {(tr.weight || tr.age) && (
                          <span className="text-stone-700 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-100 font-medium">
                            {tr.weight ? `⚖️ ${tr.weight} kg` : ''} {tr.weight && tr.age ? '• ' : ''} {tr.age ? `🎂 ${tr.age}` : ''}
                          </span>
                        )}
                        {tr.cost > 0 && (
                           <span className="flex items-center gap-0.5 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            ฿{tr.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(tr)}
                        className="text-stone-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                        title="แก้ไขประวัตินี้"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tr.id)}
                        className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                        title="ลบประวัตินี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-sm">
                  <div className="md:col-span-6 bg-stone-50/70 rounded-xl p-3.5 border border-stone-100">
                    <span className="block text-xs font-bold text-amber-900 mb-1">รายละเอียดการรักษา</span>
                    <p className="text-stone-700 text-sm leading-relaxed font-sans">{tr.treatmentDetail}</p>
                  </div>
                  
                  <div className="md:col-span-6 bg-stone-50/70 rounded-xl p-3.5 border border-stone-100">
                    <span className="block text-xs font-bold text-amber-900 mb-1.5">รายการยาที่สั่งจ่าย</span>
                    {hasMedList ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                              <th className="pb-1">ชื่อยา</th>
                              <th className="pb-1">จำนวน</th>
                              <th className="pb-1 text-right">ราคา</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tr.medicinesList!.map((m, i) => (
                              <tr key={i} className="border-b border-stone-100/50 text-stone-800 last:border-0 text-xs sm:text-sm">
                                <td className="py-1 font-semibold text-stone-900">{m.name}</td>
                                <td className="py-1 text-stone-600">{m.quantity} {m.unit}</td>
                                <td className="py-1 text-right font-bold text-amber-900">฿{m.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : tr.medicine ? (
                      <p className="text-stone-700 text-sm leading-relaxed">{tr.medicine}</p>
                    ) : (
                      <p className="text-stone-400 text-sm italic">ไม่มีการสั่งจ่ายยา</p>
                    )}
                  </div>
                </div>

                {tr.notes && (
                  <div className="mt-3 flex gap-1.5 text-sm text-stone-700 bg-amber-50/20 px-3.5 py-2.5 rounded-xl border border-amber-100/40 leading-relaxed">
                    <MessageCircle className="w-4.5 h-4.5 text-amber-700 shrink-0 mt-0.5" />
                    <span><strong>บันทึกเพิ่มเติม:</strong> {tr.notes}</span>
                  </div>
                )}

                {tr.proofImage && (
                  <div className="mt-3 flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <div className="flex items-center gap-2">
                      <img
                        src={tr.proofImage}
                        alt="หลักฐาน"
                        className="w-12 h-12 object-cover rounded-lg border border-amber-200 cursor-pointer hover:opacity-90 transition"
                        onClick={() => setViewProofImage(tr.proofImage!)}
                      />
                      <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-amber-700" />
                        มีหลักฐานภาพถ่าย
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewProofImage(tr.proofImage!)}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      ดูหลักฐาน
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand total treatment costs for current selected pet */}
          <div className="bg-amber-50/30 border-t-2 border-amber-200 rounded-xl p-4 flex justify-between items-center text-stone-900 mt-4">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              รวมยอดค่ารักษาพยาบาลสัตว์เลี้ยงทั้งหมด:
            </span>
            <span className="text-lg font-bold text-amber-950">
              ฿{grandTotalTreatmentsCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      <ImageProofModal
        imageUrl={viewProofImage}
        title="หลักฐานภาพถ่ายการรักษา"
        onClose={() => setViewProofImage(null)}
      />

      <ConfirmModal
        isOpen={deleteId !== null}
        title="ยืนยันการลบประวัติการรักษา"
        message="คุณแน่ใจหรือไม่ที่จะลบประวัติการรักษานี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
