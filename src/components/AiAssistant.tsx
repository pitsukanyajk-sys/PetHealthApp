import React, { useState } from 'react';
import { Pet } from '../types';
import { askAiAdvice } from '../lib/api';
import { Sparkles, Send, Stethoscope, AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react';

interface AiAssistantProps {
  activePet: Pet | null;
  petRecords: {
    vaccines: any[];
    treatments: any[];
    tickFleas: any[];
    dewormings: any[];
    heartworms: any[];
    vaccineSymptoms: any[];
    routineHealths: any[];
    annualHealths: any[];
    memories: any[];
    expenses: any[];
  };
}

export default function AiAssistant({ activePet, petRecords }: AiAssistantProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: activePet
        ? `สวัสดีค่ะคุณพ่อคุณแม่ของน้อง **${activePet.name}**! 🐾 ยินดีต้อนรับสู่ห้องปรึกษาสัตวแพทย์ AI อัจฉริยะในธีมสีน้ำตาลสุดอบอุ่นค่ะ 🩺✨\n\nฉันได้เข้าถึงแฟ้มประวัติสุขภาพของน้องแล้ว คุณพ่อคุณแม่สามารถถามคำถามเกี่ยวกับสุขภาพ ตารางวัคซีน หรืออาหารการกินของน้องได้เลยนะคะ หรือจะคลิกเลือกคำถามแนะนำด้านล่างนี้ได้เลยค่ะ 👇`
        : `สวัสดีค่ะคุณพ่อคุณแม่สหายสัตว์เลี้ยงแสนรัก! 🐶🐱 ยินดีต้อนรับสู่ห้องปรึกษาสัตวแพทย์ AI อัจฉริยะค่ะ 🩺✨\n\nกรุณาเลือกสัตว์เลี้ยงตัวโปรดของคุณด้านซ้าย เพื่อให้ฉันสามารถดึงแฟ้มประวัติสุขภาพ และให้คำแนะนำที่เหมาะกับน้องได้ถูกต้องครบถ้วนนะคะ!`
    }
  ]);

  const handleSend = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    setLoading(true);

    // Add user query to conversation
    setConversation((prev) => [...prev, { sender: 'user', text: userQuery }]);
    setQuery('');

    try {
      const response = await askAiAdvice(activePet, userQuery, petRecords);
      setConversation((prev) => [...prev, { sender: 'ai', text: response }]);
    } catch (err: any) {
      console.error(err);
      setConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `ขออภัยนะคะ เกิดข้อผิดพลาดในการเชื่อมต่อกับคลินิก AI: ${err.message || 'กรุณาลองใหม่อีกครั้งค่ะ'} 😢`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = activePet
    ? [
        {
          label: `🩺 แนะนำตารางวัคซีนเพิ่มเติมของ ${activePet.name}`,
          text: `อิงจากอายุและประวัติวัคซีนปัจจุบัน ช่วยแนะนำตารางวัคซีนที่ควรฉีดเพิ่มในอนาคตสำหรับน้องหน่อยค่ะ`
        },
        {
          label: `📋 ประเมินภาพรวมสุขภาพของ ${activePet.name}`,
          text: `ช่วยสรุปภาพรวมสุขภาพของน้อง และแนะนำข้อควรระวังหรือการดูแลเป็นพิเศษตามประวัติการรักษาปัจจุบัน`
        },
        {
          label: `🛡️ แนะนำระบบกำจัดเห็บหมัดและพยาธิ`,
          text: `ช่วยแนะนำยี่ห้อยาป้องกันเห็บหมัดและยาถ่ายพยาธิที่เหมาะกับน้อง รวมถึงความถี่ที่เหมาะสม`
        },
        {
          label: `🥗 แนะนำเรื่องการกินและควบคุมน้ำหนัก`,
          text: `น้องน้ำหนัก ${activePet.weight} กิโลกรัม ควรทานอาหารวันละกี่มื้อ และต้องการสารอาหารแบบใดบ้างเป็นพิเศษ`
        }
      ]
    : [];

  // Simple Markdown parser to convert **bold** and newlines to HTML
  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let formattedLine = line;

      // Replace bold text **bold** with <strong>bold</strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(formattedLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(formattedLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-amber-950 bg-amber-100/30 px-1 rounded">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < formattedLine.length) {
        parts.push(formattedLine.substring(lastIndex));
      }

      const finalContent = parts.length > 0 ? parts : formattedLine;

      // Check if it's a list item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-5 list-disc text-stone-700 my-1 leading-relaxed text-sm">
            {itemText.includes('**') ? finalContent : itemText}
          </li>
        );
      }

      // Check if it's a header
      if (line.trim().startsWith('### ')) {
        return (
          <h5 key={idx} className="text-base font-bold text-amber-950 mt-4 mb-2 font-display flex items-center gap-1 border-b border-amber-150 pb-1">
            <Stethoscope className="w-4 h-4 text-amber-700" />
            {line.trim().substring(4)}
          </h5>
        );
      }

      if (line.trim().startsWith('## ')) {
        return (
          <h4 key={idx} className="text-lg font-bold text-amber-900 mt-5 mb-2 font-display border-b border-amber-200 pb-1">
            {line.trim().substring(3)}
          </h4>
        );
      }

      // Check for quote blocks or key info
      if (line.trim().startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-amber-500 bg-amber-50/50 pl-3 py-1.5 my-2 rounded text-stone-600 text-xs italic">
            {line.trim().substring(2)}
          </blockquote>
        );
      }

      return (
        <p key={idx} className="text-stone-700 my-1.5 leading-relaxed text-sm">
          {finalContent}
        </p>
      );
    });
  };

  return (
    <div id="ai-assistant-section" className="bg-white rounded-2xl shadow-sm border border-amber-100/60 overflow-hidden flex flex-col h-[650px]">
      {/* Header */}
      <div className="bg-amber-800 text-white p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full text-amber-800">
            <Sparkles className="w-5 h-5 fill-amber-700 text-amber-700 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display text-lg">สัตวแพทย์ AI แสนดี (AI Vet Assistant)</h3>
            <p className="text-xs text-amber-200">
              {activePet ? `พร้อมวิเคราะห์ประวัติของน้อง ${activePet.name}` : 'ที่ปรึกษาดูแลรักษาสัตว์เลี้ยงส่วนตัว'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setConversation([
            {
              sender: 'ai',
              text: activePet
                ? `สวัสดีค่ะคุณพ่อคุณแม่ของน้อง **${activePet.name}**! 🐾 ยินดีต้อนรับสู่ห้องปรึกษาสัตวแพทย์ AI อัจฉริยะค่ะ 🩺✨\n\nฉันได้เข้าถึงแฟ้มประวัติสุขภาพของน้องแล้ว คุณพ่อคุณแม่สามารถถามคำถามเกี่ยวกับสุขภาพ ตารางวัคซีน หรืออาหารการกินของน้องได้เลยนะคะ หรือจะคลิกเลือกคำถามแนะนำด้านล่างนี้ได้เลยค่ะ 👇`
                : `สวัสดีค่ะคุณพ่อคุณแม่สหายสัตว์เลี้ยงแสนรัก! 🐶🐱 ยินดีต้อนรับสู่ห้องปรึกษาสัตวแพทย์ AI อัจฉริยะค่ะ 🩺✨\n\nกรุณาเลือกสัตว์เลี้ยงตัวโปรดของคุณด้านซ้าย เพื่อให้ฉันสามารถดึงแฟ้มประวัติสุขภาพ และให้คำแนะนำที่เหมาะกับน้องได้ถูกต้องครบถ้วนนะคะ!`
            }
          ])}
          className="text-amber-100 hover:text-white transition p-1 rounded hover:bg-amber-700"
          title="ล้างการสนทนา"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 bg-stone-50/50 space-y-4">
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                msg.sender === 'user'
                  ? 'bg-amber-700 text-white rounded-tr-none border-amber-850'
                  : 'bg-white text-stone-850 rounded-tl-none border-amber-100/50'
              }`}
            >
              {msg.sender === 'ai' ? (
                <div className="space-y-1">{formatText(msg.text)}</div>
              ) : (
                <p className="text-sm font-sans whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-amber-100/50 shadow-sm flex items-center gap-2 text-sm text-stone-500 font-sans">
              <span className="flex space-x-1">
                <span className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>คุณหมอ AI กำลังเปิดตำราวิเคราะห์ประวัติอยู่ค่ะ...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="p-4 border-t border-stone-100 bg-white shrink-0">
        {/* Quick Questions suggestion */}
        {quickQuestions.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">คำถามแนะนำ</p>
            <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.text)}
                  disabled={loading}
                  className="bg-amber-50 hover:bg-amber-100/85 text-amber-900 border border-amber-150 rounded-full px-3 py-1.5 text-xs text-left transition-all disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <div className="flex gap-2">
          <input
            id="ai-query-input"
            type="text"
            placeholder={activePet ? `ถามเรื่องสุขภาพของน้อง ${activePet.name} ได้ที่นี่...` : 'กรุณาเลือกสัตว์เลี้ยงด้านซ้ายก่อนสอบถามค่ะ...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend(query)}
            disabled={loading || !activePet}
            className="flex-1 text-sm bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
          />
          <button
            id="ai-send-btn"
            onClick={() => handleSend(query)}
            disabled={loading || !query.trim() || !activePet}
            className="bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white rounded-xl p-2.5 transition flex items-center justify-center cursor-pointer shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center gap-1 text-[10px] text-stone-400 justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>คำแนะนำของ AI เป็นเพียงแนวทางเบื้องต้น กรุณาพาน้องไปพบสัตวแพทย์หากมีอาการฉุกเฉินนะคะ 🧡</span>
        </div>
      </div>
    </div>
  );
}
