import React from 'react';
import { Database, Terminal, CheckCircle2, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

interface DbGuideProps {
  dbStatus: {
    type: 'local' | 'mssql';
    connected: boolean;
    message: string;
    config?: {
      server?: string;
      database?: string;
      user?: string;
    };
  };
}

export default function DbGuide({ dbStatus }: DbGuideProps) {
  const sqlSchemaCode = `
-- 1. สร้างฐานข้อมูลใหม่ใน SQL Server
CREATE DATABASE PetRecordsDB;
GO
USE PetRecordsDB;
GO

-- 2. สร้างตารางสัตว์เลี้ยงและประวัติสุขภาพ
CREATE TABLE dbo.Pets (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
    breed NVARCHAR(100) NULL,
    birthDate DATE NULL,
    gender NVARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female')),
    weight DECIMAL(5, 2) NOT NULL,
    ownerName NVARCHAR(100) NOT NULL,
    notes NVARCHAR(MAX) NULL
);

-- (ตรวจสอบตารางอื่นๆ เพิ่มเติมในไฟล์ /server/setup.sql)
`;

  const envExampleCode = `
DB_SERVER="localhost"
DB_NAME="PetRecordsDB"
DB_USER="sa"
DB_PASSWORD="YourStrongPassword123"
DB_PORT=1433
DB_TRUST_SERVER_CERTIFICATE=true
`;

  return (
    <div id="db-guide-section" className="space-y-6">
      {/* DB Connection Status Banner */}
      <div className={`rounded-2xl p-6 border shadow-sm ${
        dbStatus.type === 'mssql' && dbStatus.connected
          ? 'bg-green-50 border-green-200 text-green-900'
          : dbStatus.type === 'mssql'
          ? 'bg-red-50 border-red-200 text-red-900'
          : 'bg-amber-50/50 border-amber-200/60 text-amber-900'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-full shrink-0 ${
              dbStatus.type === 'mssql' && dbStatus.connected ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                สถานะฐานข้อมูลปัจจุบัน:
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  dbStatus.type === 'mssql' && dbStatus.connected
                    ? 'bg-green-200 text-green-800'
                    : 'bg-amber-200 text-amber-800'
                }`}>
                  {dbStatus.type === 'mssql' ? 'MS SQL Server' : 'ฐานข้อมูลภายในเครื่อง (Local JSON)'}
                </span>
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{dbStatus.message}</p>
              {dbStatus.config && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] bg-white/60 p-2 rounded-lg font-mono">
                  <span>Server: {dbStatus.config.server}</span>
                  <span>DB: {dbStatus.config.database}</span>
                  <span>User: {dbStatus.config.user}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guide details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60">
        <h3 className="text-xl font-display text-amber-900 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-6 h-6 text-amber-700" />
          คู่มือการติดตั้งและการติดตั้ง SQL Server จบโปรเจค
        </h3>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          แอพพลิเคชันนี้ได้รับการออกแบบให้เป็น **สถาปัตยกรรมแบบ Full-Stack** ด้วย Node.js (Express) + React (Vite) 
          ซึ่งมาพร้อมระบบ **Database Swapping** อัจฉริยะ: หากรันใน sandbox ของ AI Studio หรือไม่ตั้งค่า DB 
          แอพจะรันด้วยฐานข้อมูลไฟล์จำลองแบบ Local JSON อัตโนมัติ (สามารถเพิ่ม ลบ แก้ไข บันทึกประวัติได้เต็มระบบทันที) 
          และพร้อมที่จะเชื่อมต่อเข้ากับฐานข้อมูล **Microsoft SQL Server (MSSQL)** จริงได้ในพริบตาเมื่อคุณนำโค้ดไปรันในเครื่องส่วนตัว!
        </p>

        {/* Step-by-Step Guide */}
        <div className="space-y-6 text-sm">
          {/* Step 1 */}
          <div className="flex gap-4 items-start">
            <span className="flex items-center justify-center w-7 h-7 bg-amber-700 text-white rounded-full font-bold text-xs shrink-0 mt-0.5">1</span>
            <div className="flex-1">
              <h4 className="font-bold text-amber-950 mb-1">ติดตั้งฐานข้อมูล Microsoft SQL Server</h4>
              <p className="text-stone-600 text-xs leading-relaxed mb-2">
                คุณสามารถเลือกติดตั้ง SQL Server ได้หลากหลายรูปแบบตามที่สะดวก:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
                <li>
                  <strong>Windows Local:</strong> ดาวน์โหลดและติดตั้ง <strong>SQL Server Developer / Express Edition</strong> และ <strong>SSMS (SQL Server Management Studio)</strong> จากเว็บไซต์ของ Microsoft
                </li>
                <li>
                  <strong>Docker (แนะนำสำหรับ macOS / Linux / Windows Quick Setup):</strong> รันคำสั่งสั้นๆ นี้ใน Terminal:
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-mono text-[11px] text-stone-700 my-1">
                    docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrongPassword123" -p 1433:1433 --name mssql -d mcr.microsoft.com/mssql/server:2022-latest
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start">
            <span className="flex items-center justify-center w-7 h-7 bg-amber-700 text-white rounded-full font-bold text-xs shrink-0 mt-0.5">2</span>
            <div className="flex-1">
              <h4 className="font-bold text-amber-950 mb-1">สร้าง Schema และตารางสุขภาพ</h4>
              <p className="text-stone-600 text-xs leading-relaxed mb-2">
                เปิดเครื่องมือ SSMS หรือ Azure Data Studio เชื่อมต่อไปยังเซิร์ฟเวอร์ของคุณ และรันคิวรี่ทั้งหมดในไฟล์ <strong>/server/setup.sql</strong> เพื่อสร้างฐานข้อมูลและเพิ่มข้อมูลสัตว์เลี้ยงเริ่มต้นสุดน่ารัก
              </p>
              <pre className="bg-stone-50 p-3 rounded-lg border border-stone-100 font-mono text-[10px] text-stone-600 max-h-[160px] overflow-y-auto">
                {sqlSchemaCode}
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 items-start">
            <span className="flex items-center justify-center w-7 h-7 bg-amber-700 text-white rounded-full font-bold text-xs shrink-0 mt-0.5">3</span>
            <div className="flex-1">
              <h4 className="font-bold text-amber-950 mb-1">ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)</h4>
              <p className="text-stone-600 text-xs leading-relaxed mb-2">
                เปิดไฟล์ <strong>.env</strong> ในโฟลเดอร์หลักของโปรเจคคุณ แล้วทำการตั้งค่าค่าเชื่อมต่อ (Connection String) ของ SQL Server:
              </p>
              <pre className="bg-stone-50 p-3 rounded-lg border border-stone-100 font-mono text-[10px] text-stone-700">
                {envExampleCode}
              </pre>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 items-start">
            <span className="flex items-center justify-center w-7 h-7 bg-amber-700 text-white rounded-full font-bold text-xs shrink-0 mt-0.5">4</span>
            <div className="flex-1">
              <h4 className="font-bold text-amber-950 mb-1">รันโปรเจคและทดสอบการทำงาน</h4>
              <p className="text-stone-600 text-xs leading-relaxed mb-2">
                เมื่อตั้งค่าเรียบร้อยแล้ว ให้รันคำสั่งเหล่านี้ในโฟลเดอร์โปรเจคของคุณเพื่อเริ่มใช้งาน:
              </p>
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-mono text-[11px] text-stone-700 space-y-1">
                <div># 1. ติดตั้ง Dependencies ในเครื่อง</div>
                <div className="text-amber-800">npm install</div>
                <div className="mt-2"># 2. เริ่มเซิร์ฟเวอร์โหมดพัฒนา (Express + Vite)</div>
                <div className="text-amber-800">npm run dev</div>
                <div className="mt-2"># 3. บิลด์เตรียมเข้าสู่ Production (Bundle โค้ดทั้งหมดเข้า dist/)</div>
                <div className="text-amber-800">npm run build</div>
                <div className="mt-2"># 4. รันเซิร์ฟเวอร์จริงหลังบิลด์</div>
                <div className="text-amber-800">npm run start</div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting box */}
        <div className="mt-6 p-4 bg-amber-50/40 rounded-xl border border-amber-200/50 text-xs space-y-2">
          <h4 className="font-bold text-amber-950 flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            คำแนะนำในการแก้ปัญหาหากเชื่อมต่อ SQL Server ไม่ได้ (Troubleshooting)
          </h4>
          <ul className="list-decimal pl-5 space-y-1.5 text-stone-600">
            <li>
              <strong>เปิดใช้งาน TCP/IP:</strong> ไปที่ <em>SQL Server Configuration Manager</em> {`->`} <em>SQL Server Network Configuration</em> {`->`} คลิกที่ <em>Protocols for MSSQLSERVER</em> และกด <strong>Enable TCP/IP</strong> จากนั้นทำการ Restart Service SQL Server
            </li>
            <li>
              <strong>เช็คพอร์ตเซิร์ฟเวอร์:</strong> ตรวจสอบว่าพอร์ตของ SQL Server รันอยู่บนพอร์ตดีฟอลต์ <strong>1433</strong> หรือไม่
            </li>
            <li>
              <strong>Trust Certificate:</strong> โค้ดของเราตั้งค่า <code>DB_TRUST_SERVER_CERTIFICATE=true</code> ไว้แล้วเพื่อเลี่ยงปัญหาใบรับรอง TLS/SSL ในเครื่องพัฒนาส่วนตัว
            </li>
            <li>
              <strong>สิทธิ์ SA Login:</strong> ตรวจสอบว่า SQL Server เปิดใช้งาน <em>Mixed Mode Authentication</em> (อนุญาตทั้ง Windows Auth และ SQL Server Auth) แล้ว
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
