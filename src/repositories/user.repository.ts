import { BaseRepository } from './base.repository';
import { User, UserRole } from '../types';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  public create(userData: CreateUserData): Promise<User> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, email, username, password_hash, first_name, last_name, 
        role, is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userData.email,
      userData.username,
      userData.passwordHash,
      userData.firstName || null,
      userData.lastName || null,
      userData.role || UserRole.USER,
      1, // is_active = true
      now,
      now
    );

    return this.findById(id) as Promise<User>;
  }

  public findByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `);
    
    const row = stmt.get(email) as any;
    
    if (!row) return Promise.resolve(null);
    
    return Promise.resolve(this.parseUser(row));
  }

  public findByUsername(username: string): Promise<User | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE username = ?
    `);
    
    const row = stmt.get(username) as any;
    
    if (!row) return Promise.resolve(null);
    
    return Promise.resolve(this.parseUser(row));
  }

  public emailExists(email: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE email = ?
    `);
    
    const result = stmt.get(email) as { count: number };
    return Promise.resolve(result.count > 0);
  }

  public usernameExists(username: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE username = ?
    `);
    
    const result = stmt.get(username) as { count: number };
    return Promise.resolve(result.count > 0);
  }

  public update(id: string, data: Partial<CreateUserData>): Promise<User | null> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (data.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(data.email);
    }

    if (data.username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(data.username);
    }

    if (data.firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(data.firstName);
    }

    if (data.lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(data.lastName);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());

    if (updateFields.length === 1) {
      return this.findById(id);
    }

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);

    const stmt = this.db.prepare(sql);
    stmt.run(...updateValues);

    return this.findById(id);
  }

  public updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = ? 
      WHERE id = ?
    `);

    const result = stmt.run(passwordHash, new Date().toISOString(), id);

    return Promise.resolve(result.changes > 0);
  }

  private parseUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role as UserRole,
      isActive: row.is_active === 1,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private idCounter: number = 1000;
  
  private generateId(): string {
    return `user_${this.idCounter++}`;
  }
}

export const userRepository = new UserRepository();