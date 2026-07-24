import React, { useState } from 'react';
import { ShieldAlert, BookOpen, Heart, Activity, CheckCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface VaccineGuide {
  title: string;
  emoji: string;
  diseases: string;
  frequency: string;
  description: string;
  symptoms: string;
  tips: string;
}

export default function VaccineKnowledge() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const dogGuides: VaccineGuide[] = [
    {
      title: 'โรคระบบทางเดินหายใจ (Kennel Cough)',
      emoji: '🐕💨',
      diseases: 'โรคหลอดลมอักเสบติดต่อในสุนัข (Infectious Tracheobronchitis)',
      frequency: 'ฉีดครั้งแรกที่อายุ 6-8 สัปดาห์ กระตุ้นซ้ำทุก 1 ปี',
      description: 'เกิดจากเชื้อแบคทีเรีย Bordetella bronchiseptica หรือไวรัสทางเดินหายใจ ติดต่อง่ายมากผ่านการไอ จาม และสัมผัสสิ่งคัดหลั่งของสุนัขอื่น โดยเฉพาะในสถานเลี้ยงสุนัข โรงแรมสัตว์เลี้ยง หรือสวนสาธารณะ',
      symptoms: 'ไอแห้งเสียงดังคล้ายมีอะไรติดคอ (Honking cough), อาจมีน้ำมูกไหล, อาเจียนหลังจากไอหนักๆ แต่ยังร่าเริงและกินอาหารปกติ',
      tips: 'ควรแยกน้องสุนัขที่ไอออกจากสุนัขตัวอื่นๆ ทันที และควรปรึกษาหมอเพื่อรับยาแก้ไอหรือยาฆ่าเชื้อ'
    },
    {
      title: 'โรคไวรัสรุนแรง (Distemper & Parvovirus)',
      emoji: '🚨🐕',
      diseases: 'โรคไข้หัดสุนัข (Canine Distemper) และโรคลำไส้อักเสบติดต่อจากพาร์โวไวรัส (Canine Parvovirus)',
      frequency: 'ฉีดเข็มแรกที่อายุ 6-8 สัปดาห์ ฉีดกระตุ้นรวม 3 เข็มช่วงวัยเด็ก จากนั้นกระตุ้นซ้ำทุกปี',
      description: 'เป็นโรคไวรัสที่ติดต่อร้ายแรงและมีอัตราการเสียชีวิตสูงมากในลูกสุนัข พาร์โวไวรัสทำลายผนังลำไส้ทำให้อักเสบรุนแรง ส่วนไข้หัดทำลายระบบประสาท ระบบทางเดินหายใจ และลำไส้',
      symptoms: 'พาร์โวไวรัส: ซึม ซีด อาเจียนหนัก ท้องเสียปนเลือดสด กลิ่นคาวรุนแรงมาก และขาดน้ำรวดเร็ว / ไข้หัด: มีไข้สูง น้ำมูกและขี้ตาข้นเขียว ไอ ชักกระตุก ผิวอุ้งเท้าหนาตัวขึ้น',
      tips: 'ห้ามนำลูกสุนัขที่ยังฉีดวัคซีนไม่ครบไปเดินสัมผัสพื้นนอกบ้านเด็ดขาด! เพราะเชื้อสามารถอยู่ในสิ่งแวดล้อมได้นานหลายเดือน'
    },
    {
      title: 'วัคซีนรวมสุนัข 5 โรค (DHLPP)',
      emoji: '💉🛡️',
      diseases: 'ไข้หัดสุนัข, ลำไส้อักเสบ, ตับอักเสบติดต่อ, ไข้หวัดใหญ่สุนัข (Para-influenza), และโรคฉี่หนู (Leptospirosis)',
      frequency: 'เข็มแรกที่ 8 สัปดาห์ เข็มสอง 12 สัปดาห์ และเข็มสาม 16 สัปดาห์ จากนั้นกระตุ้นทุกปี',
      description: 'วัคซีนหลักที่สุนัขทุกตัวต้องได้รับ ปกป้องจากโรคติดต่อร้ายแรง 5 โรคหลัก รวมถึงโรคฉี่หนูซึ่งสามารถติดต่อสู่คนได้ด้วย (Zoonosis)',
      symptoms: 'ช่วยกระตุ้นภูมิคุ้มกันเพื่อสู้กับไวรัสและแบคทีเรียฉี่หนู',
      tips: 'โรคฉี่หนูติดต่อผ่านน้ำท่วมขังหรือดินปนเปื้อนปัสสาวะหนู สุนัขที่อยู่ในพื้นที่เสี่ยงหรือลุยน้ำบ่อยจำเป็นต้องได้รับวัคซีนนี้เป็นพิเศษ'
    },
    {
      title: 'วัคซีนรวมสุนัข 6 โรค (DHLPP + Coronavirus)',
      emoji: '🛡️✨',
      diseases: 'ไข้หัดสุนัข, ลำไส้อักเสบ, ตับอักเสบติดต่อ, ไข้หวัดใหญ่สุนัข, โรคฉี่หนู และโรคลำไส้อักเสบจากโคโรนาไวรัสสุนัข (Canine Coronavirus)',
      frequency: 'โปรแกรมเหมือนวัคซีนรวม 5 โรค แต่อัพเกรดเพื่อความครอบคลุมระบบทางเดินอาหารที่สมบูรณ์',
      description: 'เพิ่มความคุ้มครองระบบทางเดินอาหาร ป้องกันโรคลำไส้อักเสบจากโคโรนาไวรัส ซึ่งทำให้เกิดอาการท้องเสีย ถ่ายเหลว และอาเจียน มักพบร่วมกับพาร์โวไวรัสทำให้ทวีความรุนแรงขึ้น',
      symptoms: 'ป้องกันโรคท้องร่วงเฉียบพลัน ถ่ายเป็นมูกเหลว มีกลิ่นฉุน ซึม เบื่ออาหาร',
      tips: 'เหมาะกับน้องสุนัขที่ชอบเคี้ยวสิ่งของนอกบ้าน หรือเลี้ยงรวมกันหลายตัวเพื่อลดการระบาดของโรคทางเดินอาหาร'
    },
    {
      title: 'วัคซีนโรคพิษสุนัขบ้า (Rabies)',
      emoji: '☠️🐶🐱',
      diseases: 'โรคพิษสุนัขบ้า (Rabies Virus) - เป็นได้ทั้งสุนัข แมว และคน',
      frequency: 'ฉีดเข็มแรกที่อายุ 12 สัปดาห์ขึ้นไป ฉีดซ้ำอีกครั้งใน 1-3 เดือน จากนั้นกระตุ้นซ้ำปีละ 1 ครั้งตามกฎหมาย',
      description: 'โรคร้ายแรงอันตรายถึงชีวิตทั้งสัตว์เลี้ยงและผู้เลี้ยง ติดต่อผ่านน้ำลายทางการกัด ข่วน หรือเลียแผล หากติดเชื้อแล้วไม่สามารถรักษาได้ เสียชีวิต 100%',
      symptoms: 'สัตว์เลี้ยงจะมีอารมณ์ดุร้ายขึ้น หรือเซื่องซึมผิดปกติ กลัวน้ำ กลืนน้ำลายลำบาก คลุ้มคลั่ง ลิ้นห้อย และอัมพาตจนเสียชีวิต',
      tips: 'เป็นวัคซีนภาคบังคับตามกฎหมายไทย เจ้าของสุนัขและแมวต้องพาน้องไปฉีดวัคซีนนี้เป็นประจำทุกปีเพื่อความปลอดภัยของทุกคนในครอบครัว'
    },
    {
      title: 'วัคซีนทางเลือกอื่น ๆ',
      emoji: '🌱🌟',
      diseases: 'วัคซีนรวมแมว (Feline Combo), ลูคีเมียแมว (FeLV), เอดส์แมว (FIV), วัคซีนเชื้อรา',
      frequency: 'ปรึกษาสัตวแพทย์ตามพฤติกรรมการเลี้ยง (ระบบเปิด/ปิด) และความเสี่ยงของแต่ละตัว',
      description: 'สำหรับสุนัขและแมวที่มีพฤติกรรมเลี้ยงระบบเปิด หรือมีความเสี่ยงพิเศษ เช่น วัคซีนลูคีเมียแมว และเอดส์แมว ที่มักระบาดในแมวที่ชอบออกไปเที่ยวนอกบ้านและต่อสู้กับแมวจร',
      symptoms: 'ป้องกันไวรัสที่ทำลายระบบภูมิคุ้มกันและก่อให้เกิดเนื้องอกมะเร็งในอนาคต',
      tips: 'ก่อนฉีดวัคซีนลูคีเมียแมวหรือเอดส์แมว จะต้องตรวจเลือดเพื่อเช็คว่าน้องไม่มีเชื้ออยู่ก่อนแล้วเท่านั้น ไม่อย่างนั้นการฉีดวัคซีนจะไม่เกิดผลประโยชน์ใดๆ'
    }
  ];

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  const filteredGuides = dogGuides.filter(guide => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return guide.title?.toLowerCase().includes(q) || 
           guide.diseases?.toLowerCase().includes(q) || 
           guide.description?.toLowerCase().includes(q) ||
           guide.symptoms?.toLowerCase().includes(q) ||
           guide.tips?.toLowerCase().includes(q);
  });

  return (
    <div id="vaccine-knowledge" className="bg-amber-50/60 rounded-2xl p-6 border border-amber-100/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-800" />
          <h3 className="text-lg font-display font-medium text-amber-950">คลังความรู้วัคซีนน่ารู้สำหรับสัตว์เลี้ยง</h3>
        </div>
      </div>
      <p className="text-xs text-stone-600 mb-4 leading-relaxed">
        ข้อมูลและตารางวัคซีนเบื้องต้นเพื่อปกป้องเจ้าตัวเล็กจากโรคร้ายแรงรอบตัว ควรรักษาความสะอาดและปรึกษาสัตวแพทย์อย่างสม่ำเสมอเพื่อสุขภาพที่สมบูรณ์แข็งแรงของน้องค่ะ 💖🐾
      </p>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาข้อมูลวัคซีน อาการ หรือชื่อโรค..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 shadow-sm transition-all"
        />
      </div>

      <div className="space-y-3">
        {filteredGuides.length === 0 ? (
          <div className="text-center py-8 bg-white/60 rounded-xl border border-amber-100 text-xs text-stone-500">
            ไม่พบข้อมูลความรู้วัคซีนที่ตรงกับคำค้นหาค่ะ
          </div>
        ) : (
          filteredGuides.map((guide, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div key={idx} className="bg-white rounded-xl border border-amber-100 overflow-hidden shadow-sm hover:shadow transition duration-200">
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full text-left p-4 flex justify-between items-center bg-white hover:bg-amber-50/20 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{guide.emoji}</span>
                    <div>
                      <h4 className="font-bold text-amber-950 text-sm md:text-base">{guide.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-1">{guide.diseases}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-amber-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-amber-700" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-amber-50 bg-amber-50/10 text-sm text-stone-700 space-y-3.5 animate-fade-in">
                    <div>
                      <span className="font-bold text-amber-900 block mb-1">🦠 โรคและสาเหตุ:</span>
                      <p className="leading-relaxed text-stone-850 font-medium text-[13px]">{guide.diseases}</p>
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block mb-1">📅 กำหนดการฉีดที่แนะนำ:</span>
                      <p className="text-amber-850 font-semibold leading-relaxed text-[13px]">{guide.frequency}</p>
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block mb-1">📖 รายละเอียดความรู้:</span>
                      <p className="leading-relaxed text-stone-800 text-[13px]">{guide.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-amber-50/30 p-3.5 rounded-lg border border-amber-100/40">
                      <div>
                        <span className="font-bold text-red-700 flex items-center gap-1 mb-1 text-xs">
                          <ShieldAlert className="w-4 h-4" />
                          อาการเด่นของโรค:
                        </span>
                        <p className="text-stone-700 leading-relaxed text-xs">{guide.symptoms}</p>
                      </div>
                      <div>
                        <span className="font-bold text-amber-900 flex items-center gap-1 mb-1 text-xs">
                          <Heart className="w-4 h-4 text-amber-600" />
                          เคล็ดลับข้อควรระวัง:
                        </span>
                        <p className="text-stone-700 leading-relaxed text-xs">{guide.tips}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
