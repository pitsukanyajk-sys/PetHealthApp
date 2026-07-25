-- ============================================================
-- SQL Schema & Auto-Fix Script for PetHealthRecord in Supabase
-- คัดลอกข้อความทั้งหมดนี้ไปรันใน Supabase:
-- Dashboard -> SQL Editor -> New Query -> วางและกด Run
-- ============================================================

-- 1. Pets Table
CREATE TABLE IF NOT EXISTS public.pets (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT,
  "breed" TEXT,
  "birthDate" TEXT,
  "gender" TEXT,
  "weight" NUMERIC,
  "ownerName" TEXT,
  "notes" TEXT,
  "microchipId" TEXT,
  "birthPlace" TEXT,
  "adoptedAge" TEXT,
  "adoptedDate" TEXT,
  "ownerPhone" TEXT,
  "ownerAddress" TEXT,
  "deathDate" TEXT,
  "deathReason" TEXT,
  "deathAge" TEXT,
  "avatarUrl" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.pets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "breed" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "birthDate" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "ownerName" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "microchipId" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "birthPlace" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "adoptedAge" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "adoptedDate" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "ownerPhone" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "ownerAddress" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "deathDate" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "deathReason" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "deathAge" TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- 2. Vaccinations Table
CREATE TABLE IF NOT EXISTS public.vaccinations (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "date" TEXT,
  "dueDate" TEXT,
  "vetName" TEXT,
  "status" TEXT,
  "weight" NUMERIC,
  "age" TEXT,
  "cost" NUMERIC,
  "clinicName" TEXT,
  "lotNo" TEXT,
  "expiryDate" TEXT,
  "proofImage" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.vaccinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "dueDate" TEXT;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "vetName" TEXT;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "cost" NUMERIC;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "clinicName" TEXT;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "lotNo" TEXT;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "expiryDate" TEXT;
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS "proofImage" TEXT;

-- 3. Vaccine Symptoms Table
CREATE TABLE IF NOT EXISTS public.vaccinesymptoms (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "vaccineName" TEXT,
  "date" TEXT,
  "weight" NUMERIC,
  "age" TEXT,
  "appetite" TEXT,
  "behavior" TEXT,
  "abnormality" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.vaccinesymptoms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinesymptoms ADD COLUMN IF NOT EXISTS "vaccineName" TEXT;
ALTER TABLE public.vaccinesymptoms ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.vaccinesymptoms ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.vaccinesymptoms ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE public.vaccinesymptoms ADD COLUMN IF NOT EXISTS "appetite" TEXT;
ALTER TABLE public.vaccinesymptoms ADD COLUMN IF NOT EXISTS "behavior" TEXT;
ALTER TABLE public.vaccinesymptoms ADD COLUMN IF NOT EXISTS "abnormality" TEXT;
ALTER TABLE public.vaccinesymptoms ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- 4. Treatments Table
CREATE TABLE IF NOT EXISTS public.treatments (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "date" TEXT,
  "diagnosis" TEXT,
  "treatmentDetail" TEXT,
  "medicine" TEXT,
  "cost" NUMERIC,
  "clinicName" TEXT,
  "weight" NUMERIC,
  "age" TEXT,
  "notes" TEXT,
  "medicinesList" JSONB,
  "proofImage" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "diagnosis" TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "treatmentDetail" TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "medicine" TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "cost" NUMERIC;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "clinicName" TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "medicinesList" JSONB;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS "proofImage" TEXT;

-- 5. Tick & Fleas Prevention Table
CREATE TABLE IF NOT EXISTS public.tickfleas (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "date" TEXT,
  "dueDate" TEXT,
  "productName" TEXT,
  "weight" NUMERIC,
  "age" TEXT,
  "cost" NUMERIC,
  "notes" TEXT,
  "proofImage" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.tickfleas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickfleas ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.tickfleas ADD COLUMN IF NOT EXISTS "dueDate" TEXT;
ALTER TABLE public.tickfleas ADD COLUMN IF NOT EXISTS "productName" TEXT;
ALTER TABLE public.tickfleas ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.tickfleas ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE public.tickfleas ADD COLUMN IF NOT EXISTS "cost" NUMERIC;
ALTER TABLE public.tickfleas ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE public.tickfleas ADD COLUMN IF NOT EXISTS "proofImage" TEXT;

-- 6. Dewormings Table
CREATE TABLE IF NOT EXISTS public.dewormings (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "date" TEXT,
  "dueDate" TEXT,
  "medicineName" TEXT,
  "weight" NUMERIC,
  "age" TEXT,
  "cost" NUMERIC,
  "notes" TEXT,
  "proofImage" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.dewormings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS "dueDate" TEXT;
ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS "medicineName" TEXT;
ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS "cost" NUMERIC;
ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS "proofImage" TEXT;

-- 7. Heartworms Table
CREATE TABLE IF NOT EXISTS public.heartworms (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "date" TEXT,
  "dueDate" TEXT,
  "productName" TEXT,
  "weight" NUMERIC,
  "age" TEXT,
  "cost" NUMERIC,
  "notes" TEXT,
  "proofImage" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.heartworms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.heartworms ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.heartworms ADD COLUMN IF NOT EXISTS "dueDate" TEXT;
ALTER TABLE public.heartworms ADD COLUMN IF NOT EXISTS "productName" TEXT;
ALTER TABLE public.heartworms ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.heartworms ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE public.heartworms ADD COLUMN IF NOT EXISTS "cost" NUMERIC;
ALTER TABLE public.heartworms ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE public.heartworms ADD COLUMN IF NOT EXISTS "proofImage" TEXT;

-- 8. Routine Health Checks Table
CREATE TABLE IF NOT EXISTS public.routinehealths (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "date" TEXT,
  "category" TEXT,
  "title" TEXT,
  "detail" TEXT,
  "value" TEXT,
  "weight" NUMERIC,
  "age" TEXT,
  "cost" NUMERIC,
  "notes" TEXT,
  "proofImage" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.routinehealths DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "detail" TEXT;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "value" TEXT;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "cost" NUMERIC;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE public.routinehealths ADD COLUMN IF NOT EXISTS "proofImage" TEXT;

-- 9. Annual Health Checks Table
CREATE TABLE IF NOT EXISTS public.annualhealths (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "year" INTEGER,
  "date" TEXT,
  "clinicName" TEXT,
  "physicalExam" TEXT,
  "bloodTest" TEXT,
  "vaccineStatus" TEXT,
  "cost" NUMERIC,
  "weight" NUMERIC,
  "age" TEXT,
  "notes" TEXT,
  "proofImage" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.annualhealths DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "year" INTEGER;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "clinicName" TEXT;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "physicalExam" TEXT;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "bloodTest" TEXT;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "vaccineStatus" TEXT;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "cost" NUMERIC;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "weight" NUMERIC;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "age" TEXT;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE public.annualhealths ADD COLUMN IF NOT EXISTS "proofImage" TEXT;

-- 10. Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "date" TEXT,
  "title" TEXT,
  "story" TEXT,
  "mood" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.memories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS "story" TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS "mood" TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- 11. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  "id" TEXT PRIMARY KEY,
  "petId" TEXT NOT NULL,
  "date" TEXT,
  "category" TEXT,
  "amount" NUMERIC,
  "description" TEXT,
  "refId" TEXT,
  "billImage" TEXT,
  "items" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS "amount" NUMERIC;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS "refId" TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS "billImage" TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS "items" JSONB;

-- 12. Disable Row Level Security (RLS) & Allow All Policies on ALL Tables
DO $$ 
DECLARE 
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow All Access" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Allow All Access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- 13. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
