import { Project } from '../types';


export class ProjectModel {


    public static createProject(
        name: string,
        ownerId: string,
        description?: string,
        color?: string,
        memberIds: string[] = []
    ): Project {

        return {
            id: this.generateId(),
            name,
            description,
            ownerId,
            color,

            // memberIds = Owner otomatik olarak üye olur
            // [ownerId, ...memberIds] = Owner'ı başa ekle, sonra diğer üyeleri
            memberIds: [ownerId, ...memberIds],

            // status = Yeni proje varsayılan olarak aktif
            status: 'ACTIVE',

            // Tarihler
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }


    private static idCounter: number = 1;

    private static generateId(): string {
        return `project_${this.idCounter++}`;
    }

    // Projeye yeni üye ekler

    public static addMember(project: Project, userId: string): Project {
        // Kullanıcı zaten üye mi kontrol et
        if (project.memberIds.includes(userId)) {
            // Zaten üye, değişiklik yapma
            return project;
        }

        // Yeni üye ekle
        return {
            ...project,
            // Mevcut üyeler + yeni üye
            memberIds: [...project.memberIds, userId],
            // updatedAt güncelle
            updatedAt: new Date()
        };
    }

    // Projeden üye çıkarır

    public static removeMember(project: Project, userId: string): Project {
        // Owner çıkarılamaz
        if (project.ownerId === userId) {
            throw new Error('Proje sahibi çıkarılamaz');
        }

        // Üyeyi filtrele (çıkar)
        return {
            ...project,
            // filter = Koşula uyan elemanları tut
            // id !== userId = userId olmayanları tut
            memberIds: project.memberIds.filter(id => id !== userId),
            updatedAt: new Date()
        };
    }

    // Kullanıcı bu projenin üyesi mi kontrol et
    public static isMember(project: Project, userId: string): boolean {
        return project.memberIds.includes(userId);
    }

    // Kullanıcı bu projenin sahibi mi kontrol et

    public static isOwner(project: Project, userId: string): boolean {
        return project.ownerId === userId;
    }
}