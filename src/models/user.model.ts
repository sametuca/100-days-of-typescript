import { User, UserRole } from '../types';

export class UserModel {

    // password hariç tüm alanları set eder

    public static createUser(
        email: string,
        username: string,
        passwordHash: string,
        firstName?: string,
        lastName?: string,
        role: UserRole = UserRole.USER
    ): User {

        return {
            id: this.generateId(),
            email,
            username,
            passwordHash,
            firstName,
            lastName,
            role,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    private static idCounter: number = 1;

    private static generateId(): string {
        return `user_${this.idCounter++}`;
    }

    // ==========================================
    // TO SAFE USER
    // ==========================================
    // User objesinden passwordHash'i çıkarır
    // API response'unda password dönmemeli (güvenlik)

    public static toSafeUser(user: User): Omit<User, 'passwordHash'> {
        // Destructuring ile passwordHash'i ayır
        // ...rest = Geri kalan tüm alanlar
        const { passwordHash, ...rest } = user;

        // passwordHash hariç tüm alanları döndür
        return rest;
    }


    public static getFullName(user: User): string {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }

        if (user.firstName) {
            return user.firstName;
        }
        return user.username;
    }
}