# Day 26: Performance Monitoring & Metrics

## Bugün Neler Yaptık?

### 1. Metrics Service
- API response time tracking
- Request count monitoring  
- Memory usage tracking
- Metric data storage ve management

### 2. Performance Middleware
- Otomatik request tracking
- Response time measurement
- Memory usage sampling

### 3. Metrics Controller & Routes
- `/health` - Sistem sağlık durumu
- `/metrics` - Tüm metrikler (Admin only)
- `/metrics/:name` - Belirli metrik özeti

### 4. Özellikler
- Real-time performance monitoring
- Memory usage tracking
- API endpoint performance analysis
- Admin dashboard için metrics API

### Kullanım
```bash
# Sistem sağlığını kontrol et
GET /health

# Tüm metrikleri görüntüle (Admin)
GET /metrics

# Belirli metrik özetini al
GET /metrics/api_response_time
```

### Yeni Dosyalar
- `src/services/metrics.service.ts`
- `src/middleware/performance.middleware.ts`
- `src/controllers/metrics.controller.ts`
- `src/routes/metrics.routes.ts`