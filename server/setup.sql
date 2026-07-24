-- =============================================
-- SQL Server Database Setup Script
-- For Pet Health Record Application
-- Designed for Microsoft SQL Server / Azure SQL
-- =============================================

-- 1. Create Database (Run this separately if needed, or uncomment)
-- CREATE DATABASE PetRecordsDB;
-- GO
-- USE PetRecordsDB;
-- GO

-- 2. Drop existing tables if they exist (to restart fresh)
IF OBJECT_ID('dbo.Dewormings', 'U') IS NOT NULL DROP TABLE dbo.Dewormings;
IF OBJECT_ID('dbo.TickFleas', 'U') IS NOT NULL DROP TABLE dbo.TickFleas;
IF OBJECT_ID('dbo.Treatments', 'U') IS NOT NULL DROP TABLE dbo.Treatments;
IF OBJECT_ID('dbo.Vaccinations', 'U') IS NOT NULL DROP TABLE dbo.Vaccinations;
IF OBJECT_ID('dbo.Pets', 'U') IS NOT NULL DROP TABLE dbo.Pets;

-- 3. Create Tables
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

CREATE TABLE dbo.Vaccinations (
    id NVARCHAR(50) PRIMARY KEY,
    petId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Pets(id) ON DELETE CASCADE,
    name NVARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    dueDate DATE NOT NULL,
    vetName NVARCHAR(100) NOT NULL,
    status NVARCHAR(50) NOT NULL CHECK (status IN ('completed', 'scheduled'))
);

CREATE TABLE dbo.Treatments (
    id NVARCHAR(50) PRIMARY KEY,
    petId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Pets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    diagnosis NVARCHAR(200) NOT NULL,
    treatmentDetail NVARCHAR(MAX) NOT NULL,
    medicine NVARCHAR(200) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    clinicName NVARCHAR(100) NOT NULL,
    notes NVARCHAR(MAX) NULL
);

CREATE TABLE dbo.TickFleas (
    id NVARCHAR(50) PRIMARY KEY,
    petId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Pets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    dueDate DATE NOT NULL,
    productName NVARCHAR(100) NOT NULL,
    notes NVARCHAR(MAX) NULL
);

CREATE TABLE dbo.Dewormings (
    id NVARCHAR(50) PRIMARY KEY,
    petId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Pets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    dueDate DATE NOT NULL,
    medicineName NVARCHAR(100) NOT NULL,
    notes NVARCHAR(MAX) NULL
);

-- 4. Insert Cute Seed Data
INSERT INTO dbo.Pets (id, name, type, breed, birthDate, gender, weight, ownerName, notes)
VALUES 
('pet_1', N'ส้มแป้น', 'cat', N'ไทย (สามสี)', '2024-03-12', 'female', 4.20, N'สมชาย ใจดี', N'น้องส้มแป้นชอบนอนกลางวันมาก กลัวเสียงฟ้าร้อง'),
('pet_2', N'โกโก้', 'dog', N'พ็อมเมอเรเนียน', '2023-08-20', 'male', 3.50, N'สุดารัตน์ รักสัตว์', N'ขนฟู ขี้เล่น แต่อัลเลอร์จีง่าย แพ้ไก่');

INSERT INTO dbo.Vaccinations (id, petId, name, date, dueDate, vetName, status)
VALUES
('vac_1', 'pet_1', N'วัคซีนรวมแมว (Feline Panleukopenia)', '2024-06-15', '2025-06-15', N'หมอวิภา', 'completed'),
('vac_2', 'pet_1', N'วัคซีนพิษสุนัขบ้า (Rabies)', '2024-07-01', '2025-07-01', N'หมอวิภา', 'completed'),
('vac_3', 'pet_2', N'วัคซีนรวม 5 โรค (DHLPP)', '2024-01-10', '2025-01-10', N'หมอมานพ', 'completed'),
('vac_4', 'pet_2', N'วัคซีนพิษสุนัขบ้าประจำปี', '2024-01-15', '2025-01-15', N'หมอมานพ', 'completed');

INSERT INTO dbo.Treatments (id, petId, date, diagnosis, treatmentDetail, medicine, cost, clinicName, notes)
VALUES
('tr_1', 'pet_1', '2024-11-05', N'หวัดแมว', N'พ่นยาแก้ไอและป้อนยาฆ่าเชื้อ', N'Amoxicillin, ยาแก้ไอแบบน้ำ', 450.00, N'คลินิกบ้านรักสัตว์', N'น้องทานยาเก่งมาก หายดีใน 1 สัปดาห์'),
('tr_2', 'pet_2', '2024-09-18', N'ผิวหนังอักเสบจากเห็บกัด', N'ทายารักษาโรคผิวหนัง อาบน้ำแชมพูพิเศษ', N'Cortisone cream, แชมพูยา Medicated', 850.00, N'รพ.สัตว์แสนดี', N'ห้ามใช้แชมพูธรรมดาชั่วคราว');

INSERT INTO dbo.TickFleas (id, petId, date, dueDate, productName, notes)
VALUES
('tf_1', 'pet_1', '2024-06-01', '2024-09-01', N'Broadline (หยอดหลัง)', N'ครอบคลุมพยาธิภายนอกและภายใน'),
('tf_2', 'pet_2', '2024-01-10', '2024-02-10', N'Bravecto (ชนิดเคี้ยว)', N'เคี้ยวดีมาก รสเนื้อ ป้องกันได้ 3 เดือนเต็ม');

INSERT INTO dbo.Dewormings (id, petId, date, dueDate, medicineName, notes)
VALUES
('dw_1', 'pet_1', '2024-06-01', '2024-09-01', N'Drontal Cat', N'ให้ทาน 1 เม็ด ป้อนพร้อมขนมเลีย'),
('dw_2', 'pet_2', '2024-01-10', '2024-04-10', N'Drontal Plus', N'ให้ทาน 1 เม็ดตามน้ำหนักตัว');
