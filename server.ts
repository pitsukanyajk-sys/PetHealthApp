import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Import database adapters (adding .js extension because we're running in ES Modules)
import {
  getDatabaseStatus,
  getPets,
  addPet,
  updatePet,
  deletePet,
  getVaccinations,
  addVaccination,
  updateVaccination,
  deleteVaccination,
  getTreatments,
  addTreatment,
  updateTreatment,
  deleteTreatment,
  getTickFleas,
  addTickFlea,
  updateTickFlea,
  deleteTickFlea,
  getDewormings,
  addDeworming,
  updateDeworming,
  deleteDeworming,
  getVaccineSymptoms,
  addVaccineSymptom,
  updateVaccineSymptom,
  deleteVaccineSymptom,
  getHeartworms,
  addHeartworm,
  updateHeartworm,
  deleteHeartworm,
  getRoutineHealths,
  addRoutineHealth,
  updateRoutineHealth,
  deleteRoutineHealth,
  getAnnualHealths,
  addAnnualHealth,
  updateAnnualHealth,
  deleteAnnualHealth,
  getMemories,
  addMemory,
  updateMemory,
  deleteMemory,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
} from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialisation of Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required but missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

// Middlewares
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API Routes (Attached synchronously so Vercel Serverless Function can route immediately) ---

// Health and DB status
app.get('/api/status', async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pets API
app.get('/api/pets', async (req, res) => {
  try {
    const pets = await getPets();
    res.json(pets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pets', async (req, res) => {
  try {
    const newPet = await addPet(req.body);
    res.status(201).json(newPet);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pets/:id', async (req, res) => {
  try {
    const updated = await updatePet(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pets/:id', async (req, res) => {
  try {
    const success = await deletePet(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vaccinations API
app.get('/api/vaccinations', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const vacs = await getVaccinations(petId);
    res.json(vacs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vaccinations', async (req, res) => {
  try {
    const newVac = await addVaccination(req.body);
    res.status(201).json(newVac);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vaccinations/:id', async (req, res) => {
  try {
    const updated = await updateVaccination(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vaccinations/:id', async (req, res) => {
  try {
    const success = await deleteVaccination(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Treatments API
app.get('/api/treatments', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const treatments = await getTreatments(petId);
    res.json(treatments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/treatments', async (req, res) => {
  try {
    const newTr = await addTreatment(req.body);
    res.status(201).json(newTr);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/treatments/:id', async (req, res) => {
  try {
    const updated = await updateTreatment(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/treatments/:id', async (req, res) => {
  try {
    const success = await deleteTreatment(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// TickFleas API
app.get('/api/tickfleas', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const records = await getTickFleas(petId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickfleas', async (req, res) => {
  try {
    const newRecord = await addTickFlea(req.body);
    res.status(201).json(newRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tickfleas/:id', async (req, res) => {
  try {
    const updated = await updateTickFlea(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tickfleas/:id', async (req, res) => {
  try {
    const success = await deleteTickFlea(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Dewormings API
app.get('/api/dewormings', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const records = await getDewormings(petId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dewormings', async (req, res) => {
  try {
    const newRecord = await addDeworming(req.body);
    res.status(201).json(newRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/dewormings/:id', async (req, res) => {
  try {
    const updated = await updateDeworming(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/dewormings/:id', async (req, res) => {
  try {
    const success = await deleteDeworming(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// VaccineSymptoms API
app.get('/api/vaccinesymptoms', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const records = await getVaccineSymptoms(petId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vaccinesymptoms', async (req, res) => {
  try {
    const record = await addVaccineSymptom(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vaccinesymptoms/:id', async (req, res) => {
  try {
    const updated = await updateVaccineSymptom(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vaccinesymptoms/:id', async (req, res) => {
  try {
    const success = await deleteVaccineSymptom(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Heartworms API
app.get('/api/heartworms', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const records = await getHeartworms(petId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/heartworms', async (req, res) => {
  try {
    const record = await addHeartworm(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/heartworms/:id', async (req, res) => {
  try {
    const updated = await updateHeartworm(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/heartworms/:id', async (req, res) => {
  try {
    const success = await deleteHeartworm(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// RoutineHealths API
app.get('/api/routinehealths', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const records = await getRoutineHealths(petId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/routinehealths', async (req, res) => {
  try {
    const record = await addRoutineHealth(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/routinehealths/:id', async (req, res) => {
  try {
    const updated = await updateRoutineHealth(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/routinehealths/:id', async (req, res) => {
  try {
    const success = await deleteRoutineHealth(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AnnualHealths API
app.get('/api/annualhealths', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const records = await getAnnualHealths(petId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/annualhealths', async (req, res) => {
  try {
    const record = await addAnnualHealth(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/annualhealths/:id', async (req, res) => {
  try {
    const updated = await updateAnnualHealth(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/annualhealths/:id', async (req, res) => {
  try {
    const success = await deleteAnnualHealth(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Memories API
app.get('/api/memories', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const records = await getMemories(petId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/memories', async (req, res) => {
  try {
    const record = await addMemory(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/memories/:id', async (req, res) => {
  try {
    const updated = await updateMemory(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/memories/:id', async (req, res) => {
  try {
    const success = await deleteMemory(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Expenses API
app.get('/api/expenses', async (req, res) => {
  try {
    const petId = req.query.petId as string | undefined;
    const records = await getExpenses(petId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const record = await addExpense(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const updated = await updateExpense(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const success = await deleteExpense(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Vet Assistant advice
app.post('/api/ai/advice', async (req, res) => {
  const { pet, query, context } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(200).json({ 
      advice: "⚠️ **ระบบคำแนะนำ AI ปิดใช้งานอยู่เนื่องจากไม่ได้ใส่ GEMINI_API_KEY**\n\nกรุณาตั้งค่า API Key ในแถบเครื่องมือ Secrets เพื่อเปิดใช้งานระบบวิเคราะห์โรคและจัดทำตารางวัคซีนอัจฉริยะในธีมสุดน่ารักนี้!" 
    });
  }

  try {
    const petContext = pet ? `
      สัตว์เลี้ยงชื่อ: ${pet.name}
      ประเภท: ${pet.type === 'dog' ? 'สุนัข' : pet.type === 'cat' ? 'แมว' : pet.type === 'bird' ? 'นก' : pet.type === 'rabbit' ? 'กระต่าย' : 'อื่นๆ'}
      สายพันธุ์: ${pet.breed || 'ไม่ระบุ'}
      วันเกิด: ${pet.birthDate || 'ไม่ระบุ'}
      เพศ: ${pet.gender === 'male' ? 'ผู้' : 'เมีย'}
      น้ำหนัก: ${pet.weight} กิโลกรัม
      บันทึกเพิ่มเติม: ${pet.notes || 'ไม่มี'}
    ` : 'ไม่มีข้อมูลสัตว์เลี้ยงเฉพาะเจาะจง';

    const prompt = `
      คุณคือสัตวแพทย์ผู้เชี่ยวชาญใจดีและน่ารัก ทำหน้าที่ให้คำปรึกษาดูแลรักษาสัตว์เลี้ยง
      ข้อมูลสัตว์เลี้ยงปัจจุบัน:
      ${petContext}

      ประวัติสุขภาพและบันทึกทางการแพทย์ปัจจุบัน:
      ${JSON.stringify(context || {})}

      คำถามหรืออาการของสัตว์เลี้ยงจากเจ้าของ:
      "${query}"

      คำแนะนำสำคัญในการตอบ (โปรดปฏิบัติตามอย่างเคร่งครัด):
      1. ตอบให้ตรงคำถามของผู้ใช้ทันทีอย่างกระชับและชัดเจนที่สุด
      2. หากผู้ใช้ถามสั้นๆ หรือไม่ได้สั่งหรือขอให้ช่วยอธิบายรายละเอียดเพิ่มเติม ห้ามเขียนอธิบายยาว ห้ามแสดงทฤษฎีหรือคำแนะนำยืดยาว และไม่ต้องอธิบาย ให้ตอบคำตอบสั้นๆ ตรงประเด็นที่ถามทันที (เช่น ถ้าถามว่า 'ฉีดวัคซีนหรือยัง' ให้ตอบสั้นๆ ว่า 'ฉีดแล้วค่ะเมื่อวันที่...' หรือถ้าถามอายุ ให้คำนวณอายุและตอบทันทีโดยไม่อธิบายกระบวนการคำนวณ)
      3. ตอบด้วยภาษาไทยที่สุภาพ อบอุ่น เป็นกันเอง และใช้คำศัพท์น่ารัก ๆ (เช่น น้องส้มแป้น, เจ้าตัวเล็ก, พ่อๆ แม่ๆ)
      4. ใช้สัญลักษณ์ Emoji น่ารักๆ ที่เกี่ยวกับสัตว์เลี้ยงด้วย (เช่น 🐶, 🐱, 💊, 🩺, ✨, 🐾) เพื่อรักษาความเป็นกันเอง
      5. เตือนเสมออย่างกระชับตอนท้ายว่านี่คือคำแนะนำเบื้องต้น และควรปรึกษาสัตวแพทย์โดยตรง
    `;

    console.log('Sending request to Gemini-3.5-flash model...');
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ advice: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: `ไม่สามารถดึงข้อมูลจาก AI ได้: ${error.message}` });
  }
});

async function startServer() {
  // --- Vite Dev Server / Static Assets handling ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Pet Health Record Server] Running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
