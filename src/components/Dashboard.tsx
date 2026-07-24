import React from 'react';
import { Pet, Vaccination, Treatment, TickFlea, Deworming, Heartworm, RoutineHealth, AnnualHealth, Memory, Expense } from '../types';
import { Calendar, Heart, Shield, Award, AlertTriangle, Activity, CreditCard, Sparkles, Plus, ChevronRight, CheckCircle2, Bell, Syringe, Bug, Clock } from 'lucide-react';
import { formatThaiDate } from '../lib/utils';

interface DashboardProps {
  pet: Pet;
  vaccines: Vaccination[];
  treatments: Treatment[];
  tickFleas: TickFlea[];
  dewormings: Deworming[];
  heartworms: Heartworm[];
  routineHealths: RoutineHealth[];
  annualHealths: AnnualHealth[];
  memories: Memory[];
  expenses: Expense[];
  onNavigate: (tab: any) => void;
}

export default function Dashboard({
  pet,
  vaccines,
  treatments,
  tickFleas,
  dewormings,
  heartworms,
  routineHealths,
  annualHealths,
  memories,
  expenses,
  onNavigate
}: DashboardProps) {

  // Calculate total expense
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Check upcoming schedules
  const getUpcomingSchedules = () => {
    const today = new Date();
    const schedules: { name: string; type: string; date: string; daysLeft: number }[] = [];

    vaccines.forEach(v => {
      if (v.dueDate && v.status === 'scheduled') {
        const d = new Date(v.dueDate);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
        schedules.push({ name: `วัคซีน: ${v.name}`, type: 'vaccine', date: v.dueDate, daysLeft: diff });
      } else if (v.dueDate) {
        // also check if completed but has a due date in future
        const d = new Date(v.dueDate);
        if (d > today) {
          const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
          schedules.push({ name: `วัคซีนเข็มถัดไป: ${v.name}`, type: 'vaccine', date: v.dueDate, daysLeft: diff });
        }
      }
    });

    tickFleas.forEach(tf => {
      if (tf.dueDate) {
        const d = new Date(tf.dueDate);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
        schedules.push({ name: `หยอดยาเห็บหมัด: ${tf.productName}`, type: 'parasite', date: tf.dueDate, daysLeft: diff });
      }
    });

    dewormings.forEach(dw => {
      if (dw.dueDate) {
        const d = new Date(dw.dueDate);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
        schedules.push({ name: `ยาถ่ายพยาธิ: ${dw.medicineName}`, type: 'parasite', date: dw.dueDate, daysLeft: diff });
      }
    });

    heartworms.forEach(hw => {
      if (hw.dueDate) {
        const d = new Date(hw.dueDate);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
        schedules.push({ name: `ป้องกันพยาธิหนอนหัวใจ: ${hw.productName}`, type: 'parasite', date: hw.dueDate, daysLeft: diff });
      }
    });

    // Sort by soonest
    return schedules.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const upcomingSchedules = getUpcomingSchedules();

  // Helper check for core vaccine coverage
  const getCoreVaccinesStatus = () => {
    const checklist = [
      { name: 'วัคซีนพิษสุนัขบ้า (Rabies)', key: 'rabies', query: ['พิษสุนัขบ้า', 'rabies'] },
      { name: 'วัคซีนรวม 5 โรค (DHLPP)', key: 'combo5', query: ['5 โรค', 'dhlpp', 'วัคซีนรวม'] },
      { name: 'โรคระบบทางเดินหายใจ (Kennel Cough)', key: 'cough', query: ['หลอดลม', 'หวัด', 'cough', 'kennel'] },
    ];

    return checklist.map(item => {
      const isCompleted = vaccines.some(v => 
        v.status === 'completed' && 
        item.query.some(q => v.name.toLowerCase().includes(q))
      );
      return { ...item, isCompleted };
    });
  };

  const coreVaccines = getCoreVaccinesStatus();

  return (
    <div id="dashboard-view" className="space-y-6">
      
      {/* 1. Alerts & Notices banner */}
      {upcomingSchedules.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/40 rounded-2xl p-5 md:p-6 border border-amber-200/75 shadow-[0_4px_20px_rgba(217,119,6,0.04)] flex flex-col lg:flex-row gap-5 items-start justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgba(217,119,6,0.08)] relative overflow-hidden group">
          {/* Subtle warm background glows */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-100/30 rounded-full blur-2xl group-hover:bg-amber-200/40 transition-colors duration-500" />
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-orange-100/20 rounded-full blur-2xl" />

          <div className="flex flex-col sm:flex-row gap-4 items-start w-full flex-1 z-10">
            {/* Elegant glowing icon container */}
            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200/60 rounded-2xl text-amber-800 border border-amber-200/30 shrink-0 shadow-sm relative">
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <Bell className="w-5 h-5 text-amber-800" />
            </div>

            <div className="flex-1 space-y-3.5">
              <div className="space-y-1">
                <h4 className="font-bold font-display text-amber-950 text-base md:text-lg flex items-center gap-1.5 leading-tight">
                  แจ้งเตือนกำหนดการดูแลสุขภาพน้องเร็วๆ นี้!
                </h4>
                <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                  น้อง <strong className="text-amber-950 font-bold font-display">{pet.name}</strong> มีตารางการดูแลสุขภาพที่ใกล้เข้ามาถึง ควรรักษาความสะอาดและนัดหมายสัตวแพทย์ล่วงหน้าเพื่อความปลอดภัยค่ะ
                </p>
              </div>
              
              {/* Refined schedules cards */}
              <div className="flex flex-wrap gap-2 pt-0.5">
                {upcomingSchedules.slice(0, 3).map((sch, i) => {
                  const isOverdue = sch.daysLeft < 0;
                  const isUrgent = sch.daysLeft >= 0 && sch.daysLeft <= 7;
                  
                  return (
                    <div 
                      key={i} 
                      className={`text-xs px-3 py-2 rounded-xl font-semibold border flex items-center gap-2 shadow-sm transition-all hover:-translate-y-[1px] duration-200 ${
                        isOverdue 
                          ? 'bg-red-50/85 border-red-200/80 text-red-800' 
                          : isUrgent 
                            ? 'bg-amber-50/90 border-amber-300 text-amber-900 animate-pulse'
                            : 'bg-stone-50 border-stone-200/70 text-stone-700'
                      }`}
                    >
                      {/* Icons for items based on type */}
                      {sch.type === 'vaccine' ? (
                        <Syringe className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-stone-500'}`} />
                      ) : (
                        <Bug className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-stone-500'}`} />
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                        <span className="font-bold">{sch.name}</span>
                        <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-extrabold ${
                          isOverdue 
                            ? 'bg-red-100/80 text-red-900' 
                            : isUrgent 
                              ? 'bg-amber-100 text-amber-950' 
                              : 'bg-stone-200/70 text-stone-850'
                        }`}>
                          {isOverdue 
                            ? `เลยกำหนด ${Math.abs(sch.daysLeft)} วัน` 
                            : sch.daysLeft === 0 
                              ? 'วันนี้!' 
                              : `อีก ${sch.daysLeft} วัน`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('parasites')}
            className="w-full lg:w-auto text-xs md:text-sm font-bold text-amber-900 hover:text-amber-950 bg-white hover:bg-amber-50 border border-amber-200/70 px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-1 shrink-0 self-stretch lg:self-center font-display z-10 active:scale-[0.98]"
          >
            <span>ไปดูตารางป้องกันทั้งหมด</span>
            <ChevronRight className="w-4 h-4 text-amber-800" />
          </button>
        </div>
      )}

      {/* 2. Key Metrics Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Weight Widget */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider block">น้ำหนักตัวล่าสุด</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-display text-amber-950 block mt-1">{pet.weight} kg</span>
            </div>
            <div className="p-2.5 bg-green-50 rounded-xl text-green-700 border border-green-100/80 shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('routine')}
            className="w-full inline-flex items-center justify-between text-xs font-bold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/60 px-3 py-2 rounded-xl transition-all duration-150 mt-1 active:scale-[0.98]"
          >
            <span className="truncate">ดูประวัติกราฟพัฒนาการ</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
          </button>
        </div>

        {/* Vaccines Widget */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider block">วัคซีนที่ฉีดแล้ว</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-display text-amber-950 block mt-1">
                {vaccines.filter(v => v.status === 'completed').length} เข็ม
              </span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-700 border border-blue-100/80 shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('vaccines')}
            className="w-full inline-flex items-center justify-between text-xs font-bold text-blue-800 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 px-3 py-2 rounded-xl transition-all duration-150 mt-1 active:scale-[0.98]"
          >
            <span className="truncate">ดูตารางและอาการหลังฉีด</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-blue-700" />
          </button>
        </div>

        {/* Treatments Widget */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider block">ประวัติเจ็บป่วย/รักษา</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-display text-amber-950 block mt-1">{treatments.length} ครั้ง</span>
            </div>
            <div className="p-2.5 bg-red-50 rounded-xl text-red-700 border border-red-100/80 shrink-0 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('treatments')}
            className="w-full inline-flex items-center justify-between text-xs font-bold text-rose-800 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/60 px-3 py-2 rounded-xl transition-all duration-150 mt-1 active:scale-[0.98]"
          >
            <span className="truncate">ดูรายงานวินิจฉัยโรค</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-rose-700" />
          </button>
        </div>

        {/* Expenses Widget */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider block">ค่าใช้จ่ายรวมทั้งหมด</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-display text-amber-950 block mt-1">฿{totalExpense.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-pink-50 rounded-xl text-pink-700 border border-pink-100/80 shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('expenses')}
            className="w-full inline-flex items-center justify-between text-xs font-bold text-pink-800 bg-pink-50/80 hover:bg-pink-100 border border-pink-200/60 px-3 py-2 rounded-xl transition-all duration-150 mt-1 active:scale-[0.98]"
          >
            <span className="truncate">แยกหมวดหมู่คลังรายจ่าย</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-pink-700" />
          </button>
        </div>
      </div>

      {/* 3. Core Modules Layout Grid (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Core checklist & Recent actions (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Core Vaccine Coverage Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-amber-100/60 shadow-sm">
            <h3 className="text-lg font-bold text-amber-950 font-display flex items-center gap-2 mb-4">
              เช็คลิสต์วัคซีนพื้นฐานที่จำเป็นตามช่วงวัย
            </h3>
            
            <div className="space-y-3.5 text-sm">
              {coreVaccines.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF6F0]/40 border border-amber-100/20">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${v.isCompleted ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="font-bold text-stone-800 block text-sm">{v.name}</span>
                      <span className="text-xs text-stone-500 mt-1 block">วัคซีนสำคัญเพื่อความปลอดภัยขั้นพื้นฐาน</span>
                    </div>
                  </div>

                  {v.isCompleted ? (
                    <span className="bg-green-50 text-green-700 border border-green-200 font-bold px-3 py-1 rounded-full text-xs">
                      🛡️ ได้รับวัคซีนแล้ว
                    </span>
                  ) : (
                    <button 
                      onClick={() => onNavigate('vaccines')}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-full text-xs transition"
                    >
                      เพิ่มบันทึกฉีดวัคซีน
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Memories Diary Snip */}
          <div className="bg-white rounded-2xl p-6 border border-amber-100/60 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-amber-950 font-display flex items-center gap-2">
                บันทึกความทรงจำล่าสุด (Journal)
              </h3>
              <button 
                onClick={() => onNavigate('memories')}
                className="text-sm text-amber-800 hover:underline font-bold"
              >
                ดูไดอารี่ทั้งหมด →
              </button>
            </div>

            {memories.length === 0 ? (
              <div className="text-center py-8 bg-[#FAF6F0]/30 rounded-xl border border-dashed border-amber-200 text-sm text-stone-500">
                ยังไม่มีบันทึกไดอารี่แสนพิเศษของน้องในหน้าประวัตินี้
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                {memories.slice(0, 2).map((m) => (
                  <div key={m.id} className="bg-[#FAF6F0]/30 p-4 rounded-xl border border-amber-100/30">
                    <div className="flex justify-between items-center text-xs text-stone-500 mb-2">
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-medium text-xs">🐾 {m.mood}</span>
                      <span>📅 {formatThaiDate(m.date)}</span>
                    </div>
                    <h4 className="font-bold text-amber-950 text-base mb-1.5">{m.title}</h4>
                    <p className="text-stone-700 line-clamp-2 leading-relaxed text-sm">{m.story}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Growth weight log & Health checks (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick routine check status */}
          <div className="bg-white rounded-2xl p-6 border border-amber-100/60 shadow-sm">
            <h3 className="text-lg font-bold text-amber-950 font-display flex items-center gap-2 mb-4">
              🦷 กรูมมิ่ง & ตรวจฟันล่าสุด
            </h3>

            {routineHealths.length === 0 ? (
              <p className="text-center py-6 text-sm text-stone-400 bg-stone-50 rounded-xl">ยังไม่ได้จดกิจกรรมดูแลสุขภาพประจำตัว</p>
            ) : (
              <div className="space-y-4 text-sm">
                {routineHealths.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="flex justify-between items-start border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <span className="text-xs bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded">
                        {rec.category === 'dental' ? '🦷 ช่องปาก' : rec.category === 'grooming' ? '✂️ กรูมมิ่ง' : '📈 วัดขนาด'}
                      </span>
                      <h4 className="font-bold text-amber-950 mt-2 text-sm">{rec.title}</h4>
                      <p className="text-stone-600 text-xs mt-1">{rec.detail}</p>
                    </div>
                    <span className="text-xs text-stone-400 font-mono shrink-0">{formatThaiDate(rec.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
