import { Request, Response } from 'express';

export class HealthController {
  
  public static getHealth(_req: Request, res: Response): void {
    
    // healthCheck objesi = Sunucu bilgilerini içeren obje
    const healthCheck = {
      // process.uptime() = Sunucu kaç saniyedir çalışıyor
      uptime: process.uptime(),
      
      // message = Sunucunun durumu (OK = sağlıklı)
      message: 'OK',
      
      // timestamp = Şu anki tarih ve saat (ISO formatında)
      // new Date() = Yeni bir tarih objesi oluştur
      // toISOString() = "2024-01-15T10:30:00.000Z" formatına çevir
      timestamp: new Date().toISOString(),
      
      // environment = Hangi ortamda çalışıyoruz (development/production)
      environment: process.env.NODE_ENV || 'development'
    };

    // res.status(200) = HTTP 200 kodu (başarılı) döndür
    // .json() = Cevabı JSON formatında gönder
    res.status(200).json({
      // success = İşlem başarılı mı? (true/false)
      success: true,
      
      // data = Gerçek veriyi buraya koy
      data: healthCheck
    });
  }

  // ==========================================
  // GET /api/v1/
  // ==========================================
  // API'nin ana sayfası, hoş geldin mesajı gösterir
  
  public static getRoot(_req: Request, res: Response): void {
    
    // Kullanıcıya JSON formatında bilgi döndür
    res.status(200).json({
      success: true,
      
      // message = Karşılama mesajı
      message: 'Welcome to DevTracker API',
      
      // version = API versiyonu (v1.0.0)
      version: '1.0.0',
      
      // endpoints = Kullanılabilir endpoint'lerin listesi
      // Bu sayede kullanıcı hangi endpoint'ler var görebilir
      endpoints: {
        health: '/api/v1/health',  // Sağlık kontrolü
        docs: '/api/v1/docs'        // Dokümantasyon (henüz yok)
      }
    });
  }
}