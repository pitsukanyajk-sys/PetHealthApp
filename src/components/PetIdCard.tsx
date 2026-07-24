import React from 'react';
import { Pet } from '../types';
import { formatThaiDate, formatPhoneNumber, calculateAge } from '../lib/utils';
import { Edit3, Trash2, Shield, User, MapPin, Phone, Award, Calendar, Heart } from 'lucide-react';

interface PetIdCardProps {
  pet: Pet;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PetIdCard({ pet, onEdit, onDelete }: PetIdCardProps) {
  // Generate a realistic Thai ID Card Number from microchip ID or birthDate
  const getFormattedPetId = () => {
    if (pet.microchipId && pet.microchipId.trim()) {
      return pet.microchipId.trim();
    }
    // Create a pseudo 13-digit number based on birthdate and id if no microchipId is set
    const datePart = pet.birthDate ? pet.birthDate.replace(/\D/g, '') : '20240101';
    const idPart = pet.id ? pet.id.replace(/\D/g, '') : '999';
    const rawDigits = (datePart + idPart + '0000000000000').slice(0, 13);
    // Format as: X-XXXX-XXXXX-XX-X
    return `${rawDigits[0]} - ${rawDigits.slice(1, 5)} - ${rawDigits.slice(5, 10)} - ${rawDigits.slice(10, 12)} - ${rawDigits[12]}`;
  };

  // Convert birth date or adoption date to short Thai format (e.g. 12 มี.ค. 67)
  const formatPetCardDate = (dateStr: string) => {
    return formatThaiDate(dateStr);
  };

  // English translation for pet type
  const getEnglishPetType = (type: string) => {
    switch (type) {
      case 'dog': return 'DOG';
      case 'cat': return 'CAT';
      case 'rabbit': return 'RABBIT';
      case 'bird': return 'BIRD';
      default: return 'PET';
    }
  };

  // Thai translation for pet type
  const getThaiPetType = (type: string) => {
    switch (type) {
      case 'dog': return 'สุนัข';
      case 'cat': return 'แมว';
      case 'rabbit': return 'กระต่าย';
      case 'bird': return 'นก';
      default: return 'สัตว์เลี้ยง';
    }
  };

  // Check if pet is deceased
  const isDeceased = !!pet.deathDate;

  return (
    <div className="space-y-4">
      {/* Physical Thai Citizen style ID Card container */}
      <div 
        id={`pet-thai-id-card-${pet.id}`}
        className="relative bg-gradient-to-br from-sky-100 via-blue-50/90 to-sky-150 rounded-2xl p-4.5 md:p-5 border border-sky-300/80 shadow-[0_12px_24px_rgba(56,189,248,0.15)] overflow-hidden font-sans transition-all duration-300 hover:shadow-[0_16px_32px_rgba(56,189,248,0.22)] select-none text-stone-850"
      >
        {/* Holographic background wave patterns with CSS */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-300 via-sky-200 to-transparent" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full border-4 border-blue-200/20 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border-4 border-blue-200/20 pointer-events-none" />
        
        {/* Left Vertical Thai flag strip representation */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 via-white to-blue-800" />

        {/* Card Header */}
        <div className="flex justify-between items-start border-b border-sky-300/60 pb-3 mb-3.5 relative z-10">
          <div className="flex gap-2">
            {/* National Crest / Cute Paw Shield emblem */}
            <div className="w-10 h-10 bg-sky-200/70 rounded-full flex items-center justify-center border border-sky-300 shrink-0 shadow-inner">
              <Award className="w-6 h-6 text-blue-700 fill-blue-100" />
            </div>
            <div>
              <h4 className="text-[12px] md:text-sm font-black text-blue-900 tracking-wide leading-tight">
                บัตรประจำตัวสุขภาพสัตว์เลี้ยง
              </h4>
              <p className="text-[9px] md:text-[10px] font-bold text-sky-800 uppercase tracking-widest leading-none mt-0.5">
                Pet Health Identification Card
              </p>
            </div>
          </div>
          
          {/* Smart card golden chip representation */}
          <div className="flex items-center gap-2">
            {/* Cute mini barcode display */}
            <div className="hidden sm:flex flex-col items-end opacity-75">
              <div className="flex gap-[1px] h-4 items-center">
                <div className="w-[1px] h-full bg-stone-700" />
                <div className="w-[2px] h-full bg-stone-700" />
                <div className="w-[1px] h-full bg-transparent" />
                <div className="w-[3px] h-full bg-stone-700" />
                <div className="w-[1px] h-full bg-stone-700" />
                <div className="w-[2px] h-full bg-stone-700" />
                <div className="w-[1px] h-full bg-transparent" />
                <div className="w-[1px] h-full bg-stone-700" />
                <div className="w-[3px] h-full bg-stone-700" />
              </div>
              <span className="text-[7px] font-mono tracking-widest mt-0.5">PET-{pet.id.slice(0, 5).toUpperCase()}</span>
            </div>
            
            {/* The gold chip */}
            <div className="w-9 h-7 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-200 rounded-md border border-amber-600/40 shadow-md flex flex-col justify-between p-1 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.05)_50%)]" />
              <div className="grid grid-cols-3 gap-[1px] h-full w-full opacity-60">
                <div className="border-r border-b border-amber-700/30" />
                <div className="border-r border-b border-amber-700/30" />
                <div className="border-b border-amber-700/30" />
                <div className="border-r border-b border-amber-700/30" />
                <div className="border-r border-b border-amber-700/30" />
                <div className="border-b border-amber-700/30" />
                <div className="border-r border-amber-700/30" />
                <div className="border-r border-amber-700/30" />
                <div className="bg-amber-500/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-12 gap-3 md:gap-4 relative z-10 text-xs">
          {/* Photo on the Left (lg:col-span-4 or col-span-4) */}
          <div className="col-span-4 flex flex-col items-center gap-1.5">
            {/* Passport Frame */}
            <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-sky-200/40 to-sky-300/30 border-2 border-sky-300 rounded-lg overflow-hidden shadow-md flex items-center justify-center group">
              {pet.avatarUrl ? (
                <img
                  src={pet.avatarUrl}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl md:text-5xl select-none">
                  {pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : pet.type === 'rabbit' ? '🐰' : pet.type === 'bird' ? '🦜' : '🐾'}
                </div>
              )}
              
              {/* Deceased candle watermark */}
              {isDeceased && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-1 font-bold">
                  <span className="text-xl">🕯️</span>
                  <span className="text-[10px] tracking-wide mt-1">จากไปแล้ว</span>
                </div>
              )}

              {/* Holographic Seal stamp */}
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-blue-600/15 border border-blue-500/40 flex items-center justify-center transform rotate-12 backdrop-blur-[0.5px]">
                <Shield className="w-5 h-5 text-blue-700/30 fill-blue-600/5" />
              </div>
            </div>
            
            {/* Watermark text */}
            <span className="text-[8px] font-bold text-sky-700 tracking-wider text-center uppercase leading-tight bg-sky-200/50 px-1.5 py-0.5 rounded">
              APPROVED RECORD
            </span>
          </div>

          {/* Core Info on the Right (col-span-8) */}
          <div className="col-span-8 space-y-3 md:space-y-3.5 leading-relaxed">
            {/* Pet National ID Number */}
            <div>
              <span className="text-[9px] md:text-[10px] font-bold text-sky-800 block uppercase leading-none">เลขประจำตัวสัตว์เลี้ยง</span>
              <span className="text-sm font-extrabold text-blue-900 font-mono tracking-wide mt-0.5 block">
                {getFormattedPetId()}
              </span>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 border-t border-sky-300/30 pt-2.5">
              <div className="flex items-baseline flex-wrap gap-1.5">
                <span className="text-[10px] font-bold text-sky-800 leading-none">ชื่อ :</span>
                <span className="text-sm font-black text-blue-950 font-display leading-none">
                  น้อง {pet.name}
                </span>
                <span className="text-[10px] text-stone-500 font-normal">
                  ({getEnglishPetType(pet.type)})
                </span>
              </div>
            </div>

            {/* Breed & Type */}
            <div className="grid grid-cols-2 gap-2 border-t border-sky-300/30 pt-2.5">
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">ประเภท</span>
                <span className="font-extrabold text-stone-850 text-sm mt-0.5 block">
                  {getThaiPetType(pet.type)}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">เพศ</span>
                <span className={`font-extrabold text-sm mt-0.5 inline-flex items-center gap-1 ${
                  pet.gender === 'male' ? 'text-blue-800' : 'text-rose-700'
                }`}>
                  {pet.gender === 'male' ? 'ตัวผู้ (Male) ♂' : 'ตัวเมีย (Female) ♀'}
                </span>
              </div>
            </div>

            {/* Breed & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">สายพันธุ์</span>
                <span className="font-bold text-stone-800 text-sm truncate block mt-0.5" title={pet.breed}>
                  {pet.breed}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">น้ำหนักตัว</span>
                <span className="font-extrabold text-amber-900 text-sm mt-0.5 block">
                  {pet.weight} kg
                </span>
              </div>
            </div>

            {/* Birth Date & Adopted Age */}
            <div className="border-t border-sky-300/30 pt-2.5 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">วันเกิด</span>
                <span className="font-bold text-stone-900 block mt-0.5 text-sm">
                  {formatPetCardDate(pet.birthDate)}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">อายุวันที่รับเลี้ยง</span>
                <span className="font-bold text-stone-900 block mt-0.5 text-sm">
                  {pet.adoptedAge || '-'}
                </span>
              </div>
            </div>

            {/* Adoption Date & Current Age */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">วันที่รับเลี้ยง</span>
                <span className="font-bold text-stone-900 block mt-0.5 text-sm">
                  {pet.adoptedDate ? formatPetCardDate(pet.adoptedDate) : '-'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">อายุ ณ ปัจจุบัน</span>
                <span className="font-bold text-amber-950 block mt-0.5 text-sm">
                  {calculateAge(pet.birthDate)}
                </span>
              </div>
            </div>

            {/* Birth Place / Farm */}
            <div>
              <span className="text-[9px] font-bold text-sky-800 block leading-none">สถานที่เกิด/ฟาร์ม</span>
              <span className="font-bold text-stone-900 block mt-0.5 text-sm truncate" title={pet.birthPlace}>
                {pet.birthPlace || '-'}
              </span>
            </div>

            {/* Owner Guardian / Phone */}
            <div className="border-t border-sky-300/30 pt-3 space-y-3.5">
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">ผู้ปกครองน้อง</span>
                <span className="font-bold text-stone-900 text-sm block mt-1">
                  {pet.ownerName}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-sky-800 block leading-none">เบอร์โทรศัพท์</span>
                <span className="font-bold text-stone-900 text-sm block mt-1 font-mono">
                  {formatPhoneNumber(pet.ownerPhone)}
                </span>
              </div>
              {pet.ownerAddress && (
                <div>
                  <span className="text-[9px] font-bold text-sky-800 block leading-none">ที่อยู่ติดต่อ</span>
                  <span className="font-medium text-stone-700 block mt-1 text-sm leading-snug">
                    {pet.ownerAddress}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-4 border-t border-sky-300/60 pt-2 flex justify-between items-center text-[9px] text-sky-900 font-semibold relative z-10">
          <div>
            <span>Date of Issue: </span>
            <span className="font-bold text-blue-900">{formatThaiDate(pet.birthDate || '2024-01-01')}</span>
          </div>
          <div>
            <span>Expiry Date: </span>
            <span className="font-extrabold text-blue-900 uppercase tracking-wider">ตลอดชีพ</span>
          </div>
          
          {/* Golden/Blue mini stamp seal */}
          <div className="absolute right-1 -bottom-1 select-none pointer-events-none opacity-20">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-blue-800 flex items-center justify-center transform rotate-12">
              <span className="text-[6px] font-extrabold text-center text-blue-800 leading-none uppercase">BELOVED<br />PET</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deceased details if any */}
      {isDeceased && (
        <div className="bg-red-50/70 border border-red-200/60 rounded-xl p-3.5 animate-fade-in text-red-950 text-xs leading-normal">
          <h5 className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 mb-2 text-red-850">
            🕯️ บันทึกการจากไปของน้อง (Deceased Record)
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-red-700 block text-[9px] leading-none mb-0.5">วันที่จากไป</span>
              <span className="font-bold text-stone-900">{formatThaiDate(pet.deathDate)}</span>
            </div>
            <div>
              <span className="text-red-700 block text-[9px] leading-none mb-0.5">อายุขัยเฉลี่ย</span>
              <span className="font-bold text-stone-900">{pet.deathAge || 'ไม่ได้ระบุ'}</span>
            </div>
            <div className="col-span-2 border-t border-red-200/40 pt-1.5 mt-1">
              <span className="text-red-700 block text-[9px] leading-none mb-0.5">สาเหตุการจากไป</span>
              <span className="font-bold text-stone-850 block">{pet.deathReason}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons (Edit & Delete Pet profile) underneath the card */}
      {!isDeceased && (
        <div className="flex justify-end gap-2 pt-2">
          <button
            id="btn-edit-pet-profile-left"
            onClick={onEdit}
            className="text-stone-700 hover:text-blue-950 text-xs font-semibold flex items-center gap-1 bg-sky-100 hover:bg-sky-200 px-3.5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-800" />
            แก้ไขประวัติน้อง
          </button>
          <button
            id="btn-delete-pet-profile-left"
            onClick={onDelete}
            className="text-stone-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 bg-stone-100 hover:bg-red-50 px-3.5 py-2.5 rounded-xl transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            ลบโปรไฟล์
          </button>
        </div>
      )}
    </div>
  );
}
