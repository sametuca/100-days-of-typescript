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
    return;
  }

  if (title.trim().length < 3) {
    res.status(400).json({
      success: false,
      message: 'Task başlığı en az 3 karakter olmalıdır'
    });
    return;
  }

  if (status && !Object.values(TaskStatus).includes(status)) {
    // Object.values(TaskStatus) = ['TODO', 'IN_PROGRESS', 'DONE']
    // includes(status) = status bu array'de var mı?

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