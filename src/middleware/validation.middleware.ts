// ============================================
// VALIDATION MIDDLEWARE
// ============================================
// Input validation (Girdi doğrulama)
// İstek geldiğinde veriyi kontrol eder

import { Request, Response, NextFunction } from 'express';
import { TaskStatus, TaskPriority } from '../types';

// ==========================================
// VALIDATE CREATE TASK
// ==========================================
// Yeni task oluştururken validation
// Body'de gerekli alanlar var mı kontrol et

export const validateCreateTask = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  
  // Body'den title'ı al
  const { title, status, priority } = req.body;
  
  // ------------------------------------------
  // 1. TITLE KONTROLÜ (ZORUNLU)
  // ------------------------------------------
  // title yoksa veya boşsa hata döndür
  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Task başlığı zorunludur ve boş olamaz'
    });
    return; // Middleware'i sonlandır
  }
  
  // Title çok kısa ise (3 karakterden az)
  if (title.trim().length < 3) {
    res.status(400).json({
      success: false,
      message: 'Task başlığı en az 3 karakter olmalıdır'
    });
    return;
  }
  
  // ------------------------------------------
  // 2. STATUS KONTROLÜ (OPSİYONEL)
  // ------------------------------------------
  // status gönderildiyse geçerli bir değer mi kontrol et
  if (status && !Object.values(TaskStatus).includes(status)) {
    // Object.values(TaskStatus) = ['TODO', 'IN_PROGRESS', 'DONE']
    // includes(status) = status bu array'de var mı?
    
    res.status(400).json({
      success: false,
      message: `Geçersiz status. Geçerli değerler: ${Object.values(TaskStatus).join(', ')}`
    });
    return;
  }
  
  // ------------------------------------------
  // 3. PRIORITY KONTROLÜ (OPSİYONEL)
  // ------------------------------------------
  // priority gönderildiyse geçerli bir değer mi kontrol et
  if (priority && !Object.values(TaskPriority).includes(priority)) {
    res.status(400).json({
      success: false,
      message: `Geçersiz priority. Geçerli değerler: ${Object.values(TaskPriority).join(', ')}`
    });
    return;
  }
  
  // Tüm validation'lar başarılı
  // next() = Bir sonraki middleware'e veya controller'a geç
  next();
};

// ==========================================
// VALIDATE UPDATE TASK
// ==========================================
// Task güncellerken validation

export const validateUpdateTask = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  
  const { title, status, priority, description } = req.body;
  
  // ------------------------------------------
  // 1. EN AZ BİR ALAN GÖNDERİLMİŞ Mİ?
  // ------------------------------------------
  // Eğer hiçbir alan gönderilmemişse hata
  if (!title && !status && !priority && description === undefined) {
    res.status(400).json({
      success: false,
      message: 'Güncellenecek en az bir alan belirtilmelidir'
    });
    return;
  }
  
  // ------------------------------------------
  // 2. TITLE KONTROLÜ (EĞER GÖNDERİLDİYSE)
  // ------------------------------------------
  if (title !== undefined) {
    // title gönderildiyse boş olmamalı
    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Task başlığı boş olamaz'
      });
      return;
    }
    
    // Minimum 3 karakter
    if (title.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Task başlığı en az 3 karakter olmalıdır'
      });
      return;
    }
  }
  
  // ------------------------------------------
  // 3. STATUS KONTROLÜ
  // ------------------------------------------
  if (status && !Object.values(TaskStatus).includes(status)) {
    res.status(400).json({
      success: false,
      message: `Geçersiz status. Geçerli değerler: ${Object.values(TaskStatus).join(', ')}`
    });
    return;
  }
  
  // ------------------------------------------
  // 4. PRIORITY KONTROLÜ
  // ------------------------------------------
  if (priority && !Object.values(TaskPriority).includes(priority)) {
    res.status(400).json({
      success: false,
      message: `Geçersiz priority. Geçerli değerler: ${Object.values(TaskPriority).join(', ')}`
    });
    return;
  }
  
  // Tüm validation'lar başarılı
  next();
};

// ==========================================
// VALIDATE TASK ID
// ==========================================
// URL'deki ID geçerli mi kontrol et

export const validateTaskId = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  
  // URL'den ID'yi al
  const { id } = req.params;
  
  // ID yoksa veya boşsa hata
  if (!id || id.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Geçersiz task ID'
    });
    return;
  }
  
  // ID geçerli, devam et
  next();
};