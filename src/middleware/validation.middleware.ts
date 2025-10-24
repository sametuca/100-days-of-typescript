// Input validation (Girdi doğrulama)
// İstek geldiğinde veriyi kontrol eder

import { Request, Response, NextFunction } from 'express';
import { TaskStatus, TaskPriority } from '../types';

export const validateCreateTask = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  
  const { title, status, priority } = req.body;
  
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


export const validateUpdateTask = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  
  const { title, status, priority, description } = req.body;
  
  if (!title && !status && !priority && description === undefined) {
    res.status(400).json({
      success: false,
      message: 'Güncellenecek en az bir alan belirtilmelidir'
    });
    return;
  }
  
  if (title !== undefined) {
    // title gönderildiyse boş olmamalı
    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Task başlığı boş olamaz'
      });
      return;
    }
    
    if (title.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Task başlığı en az 3 karakter olmalıdır'
      });
      return;
    }
  }
  
  if (status && !Object.values(TaskStatus).includes(status)) {
    res.status(400).json({
      success: false,
      message: `Geçersiz status. Geçerli değerler: ${Object.values(TaskStatus).join(', ')}`
    });
    return;
  }
  
  if (priority && !Object.values(TaskPriority).includes(priority)) {
    res.status(400).json({
      success: false,
      message: `Geçersiz priority. Geçerli değerler: ${Object.values(TaskPriority).join(', ')}`
    });
    return;
  }
  
  next();
};

// URL'deki ID geçerli mi kontrol et

export const validateTaskId = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  
  const { id } = req.params;
  
  if (!id || id.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Geçersiz task ID'
    });
    return;
  }
  
  next();
};