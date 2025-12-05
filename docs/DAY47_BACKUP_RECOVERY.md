# Day 47: Data Backup & Recovery System

## 📋 Genel Bakış

47. günde, veritabanı yedekleme ve geri yükleme sistemi geliştirdik. Bu sistem otomatik yedekleme, sıkıştırma, doğrulama ve geri yükleme özelliklerini içeriyor.

## 🚀 Özellikler

### Backup Service
- **Otomatik Yedekleme**: Cron job ile zamanlanmış yedeklemeler
- **Sıkıştırma**: Gzip ile yedek dosyalarını sıkıştırma
- **Checksum Doğrulama**: SHA256 ile dosya bütünlüğü kontrolü
- **Eski Yedek Temizleme**: Maksimum yedek sayısı kontrolü
- **Metadata Yönetimi**: Yedek bilgilerini JSON formatında saklama

### API Endpoints
```
POST   /api/backup              - Yeni yedek oluştur
GET    /api/backup              - Tüm yedekleri listele
GET    /api/backup/status       - Yedekleme durumu
POST   /api/backup/:id/restore  - Yedeği geri yükle
GET    /api/backup/:id/verify   - Yedeği doğrula
DELETE /api/backup/:id          - Yedeği sil
```

## 🔧 Teknik Detaylar

### BackupService Konfigürasyonu
```typescript
const backupConfig = {
  dbPath: 'data/devtracker.db',
  backupDir: 'data/backups',
  maxBackups: 10,
  schedule: '0 2 * * *', // Her gün saat 02:00
  compression: true
};
```

### Yedek Metadata Yapısı
```typescript
interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  compressed: boolean;
  checksum: string;
}
```

## 📁 Dosya Yapısı

```
src/
├── services/
│   └── backup.service.ts      # Ana yedekleme servisi
├── controllers/
│   └── backup.controller.ts   # HTTP endpoint'leri
├── routes/
│   └── backup.routes.ts       # Route tanımları
├── types/
│   └── backup.types.ts        # TypeScript tipleri
└── jobs/
    └── backup.job.ts          # Güncellenmiş job servisi
```

## 🔒 Güvenlik

- **Admin Yetkisi**: Tüm backup işlemleri admin yetkisi gerektirir
- **JWT Authentication**: Bearer token ile kimlik doğrulama
- **Checksum Kontrolü**: Dosya bütünlüğü doğrulaması
- **Güvenli Geri Yükleme**: Hata durumunda otomatik rollback

## 📊 Kullanım Örnekleri

### Manuel Yedek Oluşturma
```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Yedekleri Listeleme
```bash
curl http://localhost:3000/api/backup \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Yedek Geri Yükleme
```bash
curl -X POST http://localhost:3000/api/backup/backup_2024-01-15T10-30-00/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Yedek Doğrulama
```bash
curl http://localhost:3000/api/backup/backup_2024-01-15T10-30-00/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ⚙️ Konfigürasyon

### Otomatik Yedekleme Zamanlaması
- **Varsayılan**: Her gün saat 02:00
- **Format**: Cron expression (`0 2 * * *`)
- **Özelleştirme**: `BackupService` constructor'ında değiştirilebilir

### Yedek Saklama Politikası
- **Maksimum Yedek**: 10 adet (varsayılan)
- **Otomatik Temizlik**: Eski yedekler otomatik silinir
- **Sıkıştırma**: Gzip ile %70-80 boyut azaltma

## 🚨 Hata Yönetimi

- **Backup Hatası**: Detaylı hata logları
- **Geri Yükleme Hatası**: Otomatik rollback
- **Doğrulama Hatası**: Checksum uyumsuzluğu bildirimi
- **Disk Alanı**: Yetersiz alan kontrolü

## 📈 Performans

- **Sıkıştırma**: Gzip level 9 (maksimum sıkıştırma)
- **Stream İşleme**: Büyük dosyalar için memory-efficient
- **Asenkron İşlemler**: Non-blocking backup/restore
- **Checksum**: SHA256 ile hızlı doğrulama

## 🔄 Entegrasyon

Backup sistemi mevcut job scheduler ile entegre edildi:
- `BackupJob.startScheduledBackups()` - Otomatik yedekleme başlat
- `BackupJob.stopScheduledBackups()` - Otomatik yedekleme durdur
- `BackupJob.backupDatabase()` - Manuel yedekleme

## 📝 Notlar

- Backup dosyaları `data/backups/` klasöründe saklanır
- Metadata `data/backups/metadata.json` dosyasında tutulur
- Sıkıştırılmış yedekler `.db.gz` uzantısı alır
- Sıkıştırılmamış yedekler `.db` uzantısı alır