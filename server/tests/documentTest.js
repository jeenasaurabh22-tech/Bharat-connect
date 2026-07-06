import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import redisClient from '../config/redis.js';
import User from '../models/User.model.js';
import Document from '../models/Document.model.js';
import ocrService from '../services/ocr.service.js';
import logger from '../config/logger.js';
dotenv.config();
const API_URL = 'http://localhost:5000/api';
const dummyPngBuffer = Buffer.from(
  'iVBOR0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);
const runDocumentTest = async () => {
  logger.info('Starting Document Upload & OCR Unit/Integration Tests...');
  logger.info('Running OCR Regex Parsing Unit Tests...');
  const aadhaarText = 'GOVERNMENT OF INDIA Aadhaar Card Card Number: 9876 5432 1098 DOB: 12/04/1985 Gender: Male';
  const aadhaarParse = ocrService.parseDocumentData('Aadhaar', aadhaarText);
  logger.info(`Aadhaar Parse: ${JSON.stringify(aadhaarParse.parsedFields)}`);
  if (aadhaarParse.parsedFields.aadhaarNumber !== '987654321098' || aadhaarParse.parsedFields.dob !== '12/04/1985') {
    logger.error('Aadhaar unit test parser failed!');
    process.exit(1);
  }
  const panText = 'INCOME TAX DEPARTMENT GOVT OF INDIA PAN NUMBER ABCDE1234F DATE OF BIRTH 22/09/1990';
  const panParse = ocrService.parseDocumentData('PAN', panText);
  logger.info(`PAN Parse: ${JSON.stringify(panParse.parsedFields)}`);
  if (panParse.parsedFields.panNumber !== 'ABCDE1234F' || panParse.parsedFields.dob !== '22/09/1990') {
    logger.error('PAN unit test parser failed!');
    process.exit(1);
  }
  const incomeText = 'This is to certify that annual gross income is Rs. 1,50,000 for financial year 2025';
  const incomeParse = ocrService.parseDocumentData('Income Certificate', incomeText);
  logger.info(`Income Parse: ${JSON.stringify(incomeParse.parsedFields)}`);
  if (incomeParse.parsedFields.annualIncome !== '150000') {
    logger.error('Income unit test parser failed!');
    process.exit(1);
  }
  const casteText = 'This is to certify that applicant belongs to Scheduled Caste SC category';
  const casteParse = ocrService.parseDocumentData('Caste Certificate', casteText);
  logger.info(`Caste Parse: ${JSON.stringify(casteParse.parsedFields)}`);
  if (casteParse.parsedFields.category !== 'SC') {
    logger.error('Caste unit test parser failed!');
    process.exit(1);
  }
  const disabilityText = 'Applicant has permanent physical impairment of 55% disability in limbs';
  const disabilityParse = ocrService.parseDocumentData('Disability Certificate', disabilityText);
  logger.info(`Disability Parse: ${JSON.stringify(disabilityParse.parsedFields)}`);
  if (disabilityParse.parsedFields.disabilityPercentage !== '55' || disabilityParse.parsedFields.isDisabled !== 'true') {
    logger.error('Disability unit test parser failed!');
    process.exit(1);
  }
  const domicileText = 'Certified that resident of state of Maharashtra Domicile Certificate issued';
  const domicileParse = ocrService.parseDocumentData('Domicile', domicileText);
  logger.info(`Domicile Parse: ${JSON.stringify(domicileParse.parsedFields)}`);
  if (domicileParse.parsedFields.state !== 'Maharashtra') {
    logger.error('Domicile unit test parser failed!');
    process.exit(1);
  }
  logger.info('OCR Regex Parsing Unit Tests Passed!');
  logger.info('Running Upload Pipeline Integration Tests...');
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteOne({ email: 'testocr@gmail.com' });
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  const email = 'testocr@gmail.com';
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test OCR User', email, password: 'password123' }),
  });
  await regRes.json();
  const otp = await redisClient.get(`otp:${email}`);
  await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  const tempFilePath = path.join(process.cwd(), 'temp_test_doc.png');
  fs.writeFileSync(tempFilePath, dummyPngBuffer);
  logger.info(`Created temp test file at ${tempFilePath}`);
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="temp_test_doc.png"\r\nContent-Type: image/png\r\n\r\n`;
  const fieldHeader = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="documentType"\r\n\r\nPAN\r\n--${boundary}--\r\n`;
  const payload = Buffer.concat([
    Buffer.from(fileHeader, 'utf-8'),
    dummyPngBuffer,
    Buffer.from(fieldHeader, 'utf-8')
  ]);
  try {
    logger.info('Uploading document...');
    const uploadRes = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: payload,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.message);
    logger.info(`Upload Success: ${uploadData.message}`);
    logger.info(`Uploaded Document ID: ${uploadData.document._id}`);
    logger.info(`Document Active URL: ${uploadData.document.cloudinaryUrl}`);
    logger.info(`Initial Version Count: ${uploadData.document.versionHistory.length}`);
    if (uploadData.document.cloudinaryUrl.includes('/uploads/')) {
      const filename = path.basename(uploadData.document.cloudinaryUrl);
      const localDiskPath = path.join('./uploads', filename);
      logger.info(`Checking if file exists on disk: ${localDiskPath}`);
      if (fs.existsSync(localDiskPath)) {
        logger.info('File verified on local disk.');
        fs.unlinkSync(localDiskPath);
      } else {
        throw new Error('Local file not found on disk!');
      }
    }
    logger.info('Uploading a second version of the document...');
    const secondUploadRes = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: payload,
    });
    const secondUploadData = await secondUploadRes.json();
    if (!secondUploadRes.ok) throw new Error(secondUploadData.message);
    logger.info(`Second Upload Success. Version Count now: ${secondUploadData.document.versionHistory.length}`);
    if (secondUploadData.document.versionHistory.length !== 1) {
      throw new Error('Document version history did not update correctly!');
    }
    if (secondUploadData.document.cloudinaryUrl.includes('/uploads/')) {
      const filename = path.basename(secondUploadData.document.cloudinaryUrl);
      const localDiskPath = path.join('./uploads', filename);
      if (fs.existsSync(localDiskPath)) {
        fs.unlinkSync(localDiskPath);
      }
    }
  } catch (err) {
    logger.error(`Document Upload pipeline test failed: ${err.message}`);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    process.exit(1);
  }
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
  await Document.deleteMany({ citizen: loginData.user._id });
  await User.deleteOne({ email });
  await mongoose.disconnect();
  await redisClient.disconnect();
  logger.info('Document Upload & OCR pipeline tests finished successfully!');
  process.exit(0);
};
runDocumentTest();