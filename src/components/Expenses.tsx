import React, { useState, useRef } from 'react';
import { Pet, Expense, ExpenseItem } from '../types';
import { createExpense, deleteExpense } from '../lib/api';
import ConfirmModal from './ConfirmModal';
import { formatThaiDate } from '../lib/utils';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ListFilter, 
  CreditCard, 
  PieChart, 
  Sparkles, 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  Layers, 
  Receipt, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Eye,
  Printer,
  QrCode,
  Coins,
  Search
} from 'lucide-react';

interface ExpensesProps {
  petId: string;
  activePet?: Pet | null;
  expenses: Expense[];
  onRefresh: () => void;
  isReadOnly?: boolean;
}

export default function ExpensesComponent({ petId, activePet, expenses, onRefresh, isReadOnly }: ExpensesProps) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<'medical' | 'vaccine' | 'prevention' | 'grooming' | 'food' | 'other'>('food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Grouped expenses (Multi-item bill) states
  const [isGrouped, setIsGrouped] = useState(false);
  const [tempItems, setTempItems] = useState<ExpenseItem[]>([]);
  const [tempName, setTempName] = useState('');
  const [tempAmount, setTempAmount] = useState('');
  const [tempCategory, setTempCategory] = useState<'medical' | 'vaccine' | 'prevention' | 'grooming' | 'food' | 'other'>('medical');

  // File Upload states
  const [billImage, setBillImage] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox modal state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Collapsed states for grouped bills in history list
  const [expandedBills, setExpandedBills] = useState<Record<string, boolean>>({});

  // Selected bill detail modal state
  const [selectedBill, setSelectedBill] = useState<Expense | null>(null);

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Convert File to Base64
  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ (JPEG, PNG, WEBP) ค่ะ');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBillImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Add line item to grouped list
  const handleAddLineItem = () => {
    if (!tempName.trim()) {
      alert('กรุณาระบุชื่อรายการย่อยค่ะ');
      return;
    }
    const itemAmt = Number(tempAmount);
    if (isNaN(itemAmt) || itemAmt <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้องค่ะ');
      return;
    }

    const newItem: ExpenseItem = {
      name: tempName.trim(),
      amount: itemAmt,
      category: tempCategory
    };

    setTempItems([...tempItems, newItem]);
    setTempName('');
    setTempAmount('');
  };

  // Delete line item
  const handleDeleteLineItem = (index: number) => {
    setTempItems(tempItems.filter((_, i) => i !== index));
  };

  // Submit Expense Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalAmount = 0;
    let finalDescription = description.trim();
    let finalCategory = category;

    if (isGrouped) {
      if (tempItems.length === 0) {
        alert('กรุณาเพิ่มรายการย่อยอย่างน้อย 1 รายการลงในบิลรวมด้วยค่ะ');
        return;
      }
      finalAmount = tempItems.reduce((sum, item) => sum + item.amount, 0);
      if (!finalDescription) {
        finalDescription = `บิลค่ารักษารวมทั้งหมด (${tempItems.length} รายการ)`;
      }
      // Set main category of the bill to the most expensive sub-item's category
      const highestCostItem = [...tempItems].sort((a, b) => b.amount - a.amount)[0];
      finalCategory = highestCostItem.category;
    } else {
      finalAmount = Number(amount);
      if (isNaN(finalAmount) || finalAmount <= 0) {
        alert('กรุณากรอกจำนวนเงินให้ถูกต้องค่ะ');
        return;
      }
      if (!finalDescription) {
        alert('กรุณากรอกรายละเอียดและชื่อร้านค้าค่ะ');
        return;
      }
    }

    setLoading(true);
    try {
      await createExpense({
        petId,
        date,
        category: finalCategory,
        amount: finalAmount,
        description: finalDescription,
        billImage: billImage || undefined,
        items: isGrouped ? tempItems : undefined
      });

      // Reset Form State
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsGrouped(false);
      setTempItems([]);
      setBillImage('');
      setShowForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถบันทึกค่าใช้จ่ายได้');
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
      await deleteExpense(deleteId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบรายการค่าใช้จ่ายได้');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleBillExpanded = (id: string) => {
    setExpandedBills(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Calculations
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = {
    food: expenses.filter(x => x.category === 'food').reduce((sum, x) => sum + x.amount, 0),
    medical: expenses.filter(x => x.category === 'medical').reduce((sum, x) => sum + x.amount, 0),
    vaccine: expenses.filter(x => x.category === 'vaccine').reduce((sum, x) => sum + x.amount, 0),
    prevention: expenses.filter(x => x.category === 'prevention').reduce((sum, x) => sum + x.amount, 0),
    grooming: expenses.filter(x => x.category === 'grooming').reduce((sum, x) => sum + x.amount, 0),
    other: expenses.filter(x => x.category === 'other').reduce((sum, x) => sum + x.amount, 0),
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'food': return '🍔 อาหาร & ขนมเลีย';
      case 'medical': return '💊 รักษาโรค & ยา';
      case 'vaccine': return '💉 วัคซีนป้องกัน';
      case 'prevention': return '🛡️ ป้องกันเห็บ/พยาธิ';
      case 'grooming': return '✂️ อาบน้ำตัดขน';
      default: return '🎈 อื่นๆ ทั่วไป';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'food': return 'bg-amber-500';
      case 'medical': return 'bg-red-500';
      case 'vaccine': return 'bg-blue-500';
      case 'prevention': return 'bg-green-500';
      case 'grooming': return 'bg-pink-500';
      default: return 'bg-purple-500';
    }
  };

  const filteredExpenses = expenses.filter(item => {
    const matchesCategory = filter === 'all' || item.category === filter;
    
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesDescription = item.description?.toLowerCase().includes(query);
    const matchesItems = item.items?.some(subItem => 
      subItem.name?.toLowerCase().includes(query)
    );
    const matchesCatLabel = getCategoryLabel(item.category)?.toLowerCase().includes(query);
    
    return matchesCategory && (matchesDescription || matchesItems || matchesCatLabel);
  });

  const totalGroupedAmount = tempItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div id="expenses-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Visual Statistics Dashboard (Column 1) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60 lg:col-span-1 flex flex-col justify-between h-fit lg:sticky lg:top-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-display font-bold text-amber-900">สรุปงบประมาณค่าใช้จ่าย</h3>
          </div>

          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/30 text-center mb-6">
            <span className="text-xs text-stone-500 block">ยอดรวมสะสมทั้งหมด (บาท)</span>
            <span className="text-3xl font-display font-bold text-amber-900 block mt-1">
              ฿{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">วิเคราะห์สุขภาพทางการเงินของสุนัข/แมวแสนรัก</span>
          </div>

          <h4 className="text-xs font-bold text-stone-600 mb-3 uppercase tracking-wider">สัดส่วนค่าใช้จ่ายตามประเภท</h4>
          <div className="space-y-3 text-xs">
            {Object.entries(categoryTotals).map(([cat, amount]) => {
              const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-700 font-medium">{getCategoryLabel(cat)}</span>
                    <span className="font-bold text-amber-950">
                      ฿{amount.toLocaleString()} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${getCategoryColor(cat)} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-amber-100/40 p-3.5 rounded-xl border border-amber-200/20 text-[11px] text-stone-600 leading-relaxed mt-6">
          🐾 <b>คำแนะนำทางการเงินจากคุณหมอ:</b> การรวมหลายรายการย่อยเป็น "หนึ่งบิล" ช่วยให้จดจำง่ายว่าการหาหมอครั้งนั้นมีรายการตรวจ ยา และวัคซีนอะไรบ้าง พร้อมแนบภาพใบเสร็จเพื่อใช้อ้างอิงประกันสุขภาพได้สะดวกยิ่งขึ้นค่ะ!
        </div>
      </div>

      {/* Expenses History and Add Form (Column 2 & 3) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60 lg:col-span-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
          <div>
            <h3 className="text-xl font-display font-bold text-amber-900 flex items-center gap-2">
              สมุดบันทึกรายจ่ายและบิลหาหมอ
            </h3>
            <p className="text-xs text-stone-500 mt-1">จดแยกเป็นบิลเดียวแบบละเอียดหรือจดทีละรายการ พร้อมจัดหมวดหมู่น่ารักสบายตา</p>
          </div>
          {isReadOnly ? (
            <span className="text-xs text-stone-500 bg-stone-100 border border-stone-250 px-3 py-1.5 rounded-full font-semibold select-none flex items-center gap-1">
              <span>🔒</span>
              <span>อ่านอย่างเดียว</span>
            </span>
          ) : (
            <button
              onClick={() => {
                setShowForm(!showForm);
                // reset internal forms
                setTempItems([]);
                setBillImage('');
              }}
              className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'ปิดแบบฟอร์ม' : 'บันทึกบิลจ่ายเงิน'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#FAF6F0] rounded-2xl p-5 mb-6 border border-amber-200/50 text-sm space-y-4 shadow-inner">
            <div className="flex justify-between items-center border-b border-amber-100 pb-2.5">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-800" />
                จดบันทึกค่าใช้จ่ายใหม่
              </h4>
              <button
                type="button"
                onClick={() => setIsGrouped(!isGrouped)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isGrouped 
                    ? 'bg-amber-700 text-white shadow-sm' 
                    : 'bg-amber-100/60 text-amber-950 hover:bg-amber-200/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {isGrouped ? 'สลับเป็น: จดรายการเดี่ยว' : 'สลับเป็น: รวมเป็นบิลเดียว (หาหมอ/วัคซีน)'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">วันที่ชำระเงิน *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isGrouped ? 'หัวข้อบิล/ชื่อสถานที่ (เช่น ไปโรงพยาบาลสัตว์แสนดี)' : 'รายละเอียดและชื่อร้านค้า *'}
                </label>
                <input
                  type="text"
                  placeholder={isGrouped ? 'เช่น พาโกโก้ไปตรวจเลือดและรับวัคซีนรวม' : 'เช่น ซื้ออาหารเม็ดสูตรขจัดคราบหินปูน 2 ถุง'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required={!isGrouped}
                />
              </div>

              {/* Standard single expense layout */}
              {!isGrouped && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">หมวดหมู่ค่าใช้จ่าย *</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="food">🍔 อาหารเม็ด, เปียก & ขนมเลีย</option>
                      <option value="medical">💊 รักษาโรค (ค่ายา, ค่าตรวจผ่าตัด)</option>
                      <option value="vaccine">💉 ค่าวัคซีนประจำรอบ</option>
                      <option value="prevention">🛡️ ค่าป้องกันเห็บ หมัด พยาธิ</option>
                      <option value="grooming">✂️ ค่ากรูมมิ่ง อาบน้ำตัดแต่งทรงขน</option>
                      <option value="other">🎈 อุปกรณ์ ทั่วไป / ของเล่นแสนรัก</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">จำนวนเงินที่จ่ายจริง (บาท) *</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="เช่น 350, 1200"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required={!isGrouped}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Grouped (Multi-item) expense layout */}
            {isGrouped && (
              <div className="bg-white rounded-xl p-4 border border-amber-100 space-y-3.5">
                <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2">
                  <Layers className="w-4 h-4 text-amber-800" />
                  <span className="text-xs font-bold text-stone-700">ระบุรายการย่อยที่รวมอยู่ในบิลนี้:</span>
                </div>

                {/* Sub-item inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">ชื่อรายการย่อย *</label>
                    <input
                      type="text"
                      placeholder="เช่น ค่าตรวจแล็บ, ค่ายาฆ่าเชื้อ"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1.5 text-stone-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">จำนวนเงิน (บาท) *</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="เช่น 450, 200"
                      value={tempAmount}
                      onChange={(e) => setTempAmount(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1.5 text-stone-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">หมวดหมู่ย่อย</label>
                    <div className="flex gap-1.5">
                      <select
                        value={tempCategory}
                        onChange={(e: any) => setTempCategory(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5 text-stone-900 focus:outline-none"
                      >
                        <option value="medical">💊 รักษาโรค</option>
                        <option value="vaccine">💉 วัคซีน</option>
                        <option value="prevention">🛡️ ป้องกันเห็บ</option>
                        <option value="grooming">✂️ กรูมมิ่ง</option>
                        <option value="food">🍔 อาหาร</option>
                        <option value="other">🎈 อื่นๆ</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="bg-amber-700 hover:bg-amber-800 text-white rounded-md px-3.5 font-bold shrink-0 text-xs transition-colors"
                      >
                        เพิ่ม
                      </button>
                    </div>
                  </div>
                </div>

                {/* Line items list */}
                {tempItems.length === 0 ? (
                  <p className="text-center py-4 text-xs text-stone-400 bg-stone-50/50 rounded-lg border border-dashed border-stone-100">
                    ยังไม่มีรายการย่อย... กรอกข้อมูลด้านบนแล้วกดปุ่ม "เพิ่ม" เพื่อเริ่มสะสมบิลย่อยได้เลยค่ะ
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {tempItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                            {getCategoryLabel(item.category).split(' ')[1]}
                          </span>
                          <span className="text-stone-800 font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-950">฿{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteLineItem(index)}
                            className="text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center bg-amber-50/40 p-2.5 rounded-lg border border-amber-150 text-xs font-bold text-amber-900">
                      <span>ยอดรวมทั้งบิล (Auto-Sum):</span>
                      <span className="text-sm">฿{totalGroupedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bill image upload section */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">แนบภาพบิล / ใบเสร็จรับเงิน</label>
              
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 min-h-[110px] ${
                  dragActive 
                    ? 'border-amber-600 bg-amber-50/40' 
                    : billImage 
                    ? 'border-green-300 bg-green-50/10' 
                    : 'border-amber-200 hover:border-amber-450 hover:bg-amber-50/10'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  className="hidden"
                  accept="image/*"
                />

                {billImage ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="relative w-20 h-20 border border-amber-200 rounded-lg overflow-hidden shrink-0 shadow-sm bg-white">
                      <img src={billImage} alt="receipt" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBillImage('')}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                        ✓ แนบไฟล์สำเร็จแล้วค่ะ
                      </p>
                      <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                        ภาพบิลจะถูกเก็บไว้เป็นหลักฐานอ้างอิงของน้องเพื่อบันทึกประวัติสุขภาพ
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-amber-600/70" />
                    <div>
                      <p className="text-xs font-semibold text-stone-700">ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่ออัปโหลดใบเสร็จ</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WEBP)</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-2.5 pt-2.5 border-t border-amber-150">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTempItems([]);
                  setBillImage('');
                }}
                className="text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                {loading ? 'กำลังจัดเก็บไฟล์...' : 'บันทึกค่าใช้จ่ายลงบิล'}
              </button>
            </div>
          </form>
        )}

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาบิลหรือค่าใช้จ่าย (เช่น อาหาร, ตรวจเลือด, วัคซีน...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-sm transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-2">
          <ListFilter className="w-4 h-4 text-stone-400 shrink-0" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs shrink-0 transition-all ${
              filter === 'all' 
                ? '!bg-amber-800 !text-white font-bold shadow-sm border border-amber-800' 
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium'
            }`}
          >
            ทั้งหมด
          </button>
          {['food', 'medical', 'vaccine', 'prevention', 'grooming', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs shrink-0 transition-all ${
                filter === cat 
                  ? '!bg-amber-800 !text-white font-bold shadow-sm border border-amber-800' 
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium'
              }`}
            >
              {getCategoryLabel(cat).split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-stone-50/50 rounded-2xl border border-stone-150/60 text-xs text-stone-500">
            <Sparkles className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-medium">ยังไม่มีประวัติค่าใช้จ่ายในหมวดหมู่นี้ค่ะ</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredExpenses.map((exp) => {
              const isGroupedBill = exp.items && exp.items.length > 0;
              const isExpanded = expandedBills[exp.id];

              return (
                <div 
                  key={exp.id} 
                  onClick={() => setSelectedBill(exp)}
                  className="bg-stone-50/60 p-4 rounded-2xl border border-stone-150/60 hover:border-amber-400 hover:bg-amber-50/10 cursor-pointer transition duration-200 text-xs shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-amber-950 text-sm leading-normal">{exp.description}</span>
                        {isGroupedBill && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            รวม {exp.items?.length} รายการ
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4 text-[10px] text-stone-500 mt-2 flex-wrap">
                        <span className="bg-amber-100/60 text-amber-900 border border-amber-150/40 px-2 py-0.5 rounded font-medium">
                          {getCategoryLabel(exp.category)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {formatThaiDate(exp.date)}
                        </span>
                        {exp.billImage && (
                          <span className="text-amber-800 font-bold flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5" />
                            มีใบเสร็จแนบ
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-amber-900 font-bold text-base block">
                          ฿{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isGroupedBill && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBillExpanded(exp.id);
                            }}
                            className="text-stone-500 hover:text-amber-800 p-1.5 rounded-lg hover:bg-stone-100 transition"
                            title={isExpanded ? 'ปิดรายการย่อย' : 'ดูรายการย่อย'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                        {!isReadOnly && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(exp.id);
                            }}
                            className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Render Grouped sub-items if expanded */}
                  {isGroupedBill && isExpanded && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3.5 pt-3.5 border-t border-dashed border-stone-200 space-y-1.5 bg-amber-50/20 p-2.5 rounded-xl"
                    >
                      <h5 className="font-bold text-amber-950 text-xs mb-2 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-amber-800" />
                        รายละเอียดรายการย่อยในบิลนี้:
                      </h5>
                      {exp.items?.map((sub, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-100/60 last:border-0">
                          <div className="flex items-center gap-1.5 text-stone-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="font-medium text-stone-800">{sub.name}</span>
                            <span className="text-[10px] text-stone-500">({getCategoryLabel(sub.category).split(' ')[1]})</span>
                          </div>
                          <span className="font-bold text-stone-900">฿{sub.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render attached receipt if present */}
                  {exp.billImage && (
                    <div className="mt-3 pt-3 border-t border-dashed border-stone-200 flex items-center gap-3 bg-stone-50/80 p-2.5 rounded-xl">
                      <div className="relative w-12 h-12 border border-stone-200 rounded-lg overflow-hidden shrink-0 shadow-sm bg-white">
                        <img src={exp.billImage} alt="bill thumbnail" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-stone-700">มีเอกสารใบเสร็จชำระเงินแนบอยู่</p>
                        <p className="text-[9px] text-stone-500 mt-0.5">คลิกเพื่อดูภาพขยายเพื่อตรวจสอบความถูกต้อง</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(exp.billImage || null);
                        }}
                        className="text-amber-800 hover:bg-amber-100/60 bg-amber-50 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        ขยายดูภาพบิล
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs transition-opacity"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-2xl w-full p-4 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
              <h4 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-800" />
                ใบเสร็จ / หลักฐานชำระเงินของน้อง
              </h4>
              <button 
                onClick={() => setLightboxImage(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-stone-950 p-2.5 rounded-xl mt-3 max-h-[70vh] overflow-hidden select-none">
              <img 
                src={lightboxImage} 
                alt="Full receipt" 
                className="max-h-[60vh] max-w-full object-contain rounded-md"
              />
            </div>
            <div className="flex justify-between items-center pt-3.5 text-[10px] text-stone-500">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                ระบบใบเสร็จอิเล็กทรอนิกส์ใน Sandbox
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="bg-stone-900 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        title="ยืนยันการลบรายการค่าใช้จ่าย"
        message="คุณแน่ใจหรือไม่ที่จะลบรายการค่าใช้จ่ายนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
