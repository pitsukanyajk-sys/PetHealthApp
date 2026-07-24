import React, { useState } from 'react';
import { Memory } from '../types';
import { createMemory, deleteMemory } from '../lib/api';
import { Plus, Trash2, Calendar, Sparkles, Smile, Star, Heart, Search } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { formatThaiDate } from '../lib/utils';

interface MemoriesProps {
  petId: string;
  records: Memory[];
  onRefresh: () => void;
  isReadOnly?: boolean;
}

export default function MemoriesComponent({ petId, records, onRefresh, isReadOnly }: MemoriesProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [mood, setMood] = useState('มีความสุขมาก 💖');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !story) {
      alert('กรุณากรอกหัวข้อและเนื้อเรื่องราวแสนประทับใจ');
      return;
    }
    setLoading(true);
    try {
      await createMemory({
        petId,
        date,
        title,
        story,
        mood,
        notes
      });
      setTitle('');
      setStory('');
      setMood('มีความสุขมาก 💖');
      setNotes('');
      setShowForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเพิ่มบันทึกความทรงจำได้');
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
      await deleteMemory(deleteId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบบันทึกความทรงจำได้');
    } finally {
      setDeleteId(null);
    }
  };

  const sortedAndFilteredMemories = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(rec => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return rec.title?.toLowerCase().includes(q) || 
             rec.story?.toLowerCase().includes(q) || 
             rec.mood?.toLowerCase().includes(q) ||
             rec.notes?.toLowerCase().includes(q);
    });

  return (
    <div id="memories-section" className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-display text-amber-900 flex items-center gap-2">
            สมุดบันทึกความทรงจำ & ไดอารี่แสนรัก (Pet Journal)
          </h3>
          <p className="text-xs text-stone-500 mt-1">จดบันทึกวันเกิด กิจกรรมแสนสนุก วันวิ่งเล่นน่ารัก หรือภาพรวมความอบอุ่นในแต่ละวันของเจ้าตัวเล็ก</p>
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
            {showForm ? 'ปิดไดอารี่' : 'เขียนบันทึกแสนหวาน'}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาความทรงจำ หัวข้อ เรื่องราว อารมณ์น้อง หรือหมายเหตุ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-sm transition-all"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-amber-50/30 rounded-xl p-5 mb-6 border border-amber-100/60 text-sm">
          <h4 className="text-sm font-bold text-amber-950 mb-3">✍️ เขียนไดอารี่หน้าใหม่</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">หัวข้อเรื่องราว *</label>
              <input
                type="text"
                placeholder="เช่น ฉลองวันเกิดครบ 1 ปีส้มแป้น, พาวิ่งเล่นที่สวนสนามหญ้าครั้งแรก!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">วันที่ของเหตุการณ์ *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">อารมณ์ / พฤติกรรมของน้อง *</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="มีความสุขมาก 💖">มีความสุขมาก 💖</option>
                  <option value="ซนมาก พลังล้น ⚡">ซนมาก พลังล้น ⚡</option>
                  <option value="นอนเก่งทั้งวัน 😴">นอนเก่งทั้งวัน 😴</option>
                  <option value="แอบอ้อนขอขนมเลีย 🥺">แอบอ้อนขอขนมเลีย 🥺</option>
                  <option value="ดื้อ ขุดสวนพังนิดหน่อย 🐾">ดื้อ ขุดสวนพังนิดหน่อย 🐾</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">เรื่องราวประทับใจ *</label>
              <textarea
                placeholder="เล่าเรื่องราวน่ารักๆ ความตลก หรือนิสัยออดอ้อนของเจ้าตัวเล็กในวันนี้..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={4}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">หมายเหตุของเจ้าของ (เช่น ของเล่นใหม่ หรืออาหารจานโปรด)</label>
              <input
                type="text"
                placeholder="เช่น ซื้อตุ๊กตานกฮูกสีเหลืองตัวใหม่ให้, น้องชอบทูน่ารสแซลมอนกระป๋องนี้มาก"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              {loading ? 'กำลังแชร์...' : 'บันทึกไดอารี่'}
            </button>
          </div>
        </form>
      )}

      {sortedAndFilteredMemories.length === 0 ? (
        <div className="text-center py-10 bg-stone-50/50 rounded-xl border border-stone-100 text-sm text-stone-500">
          <Sparkles className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <p className="font-bold text-amber-950">ยังไม่มีบันทึกไดอารี่ความทรงจำที่ตรงกับคำค้นหาค่ะ</p>
          <p className="text-xs text-stone-400 mt-1">เพราะเวลาของเจ้าตัวเล็กมีความหมาย มาร่วมเก็บทุกช่วงเวลาน่ารักๆ ไว้ประทับใจก้าวแรกกันนะคะ 📖💝</p>
        </div>
      ) : (
        <div className="relative border-l border-amber-200/60 ml-4 pl-6 space-y-8">
          {sortedAndFilteredMemories.map((rec) => (
            <div key={rec.id} className="relative group text-xs">
              {/* Timeline marker with custom heart icon */}
              <div className="absolute -left-[31px] top-1.5 bg-amber-50 text-amber-700 rounded-full p-1 border-2 border-amber-200 group-hover:bg-amber-700 group-hover:text-white transition duration-200">
                <Smile className="w-3.5 h-3.5" />
              </div>

              <div className="bg-amber-50/30 border border-amber-100/40 rounded-2xl p-5 hover:border-amber-200 hover:bg-amber-50/10 transition duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-sans px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-700" />
                      {formatThaiDate(rec.date)}
                    </span>
                    <h4 className="font-bold text-amber-950 text-sm md:text-base mt-2">{rec.title}</h4>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-stone-850 text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap mt-2 font-sans bg-white/70 p-3.5 rounded-xl border border-stone-100/50">
                  {rec.story}
                </p>

                <div className="flex flex-wrap gap-2 mt-3 items-center text-xs">
                  <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200 font-medium">
                    😊 อารมณ์น้อง: {rec.mood}
                  </span>

                  {rec.notes && (
                    <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
                      💡 เคล็ดลับ/ข้อมูลเสริม: {rec.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        title="ยืนยันการลบบันทึกความทรงจำ"
        message="คุณแน่ใจหรือไม่ที่จะลบบันทึกความทรงจำแสนพิเศษนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้ค่ะ 🐾"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
