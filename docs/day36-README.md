# Day 36: Workflow Automation & Rules Engine

## 🎯 Hedef
DevTracker'a **Workflow Automation & Rules Engine** ekledik.  
Amaç, organizasyon bazlı kurallarla (rules) belirli olaylar (events) gerçekleştiğinde otomatik aksiyonlar (actions) çalıştırmak:

- Örneğin:
  - “Task DONE olduğunda assignee’lere notification gönder”
  - “Deadline yaklaşınca webhook tetikle”
  - “Task oluşturulunca activity log kaydı aç”

Bu sayede DevTracker, **multi-tenant** mimarinin üzerine **otomasyon katmanı** ekleyerek gerçek bir enterprise SaaS deneyimine yaklaşıyor.

---

## 🚀 Özellikler

### 1. Workflow Rules
- **Rule-based Architecture**: Her kural, belirli bir event + koşul seti + aksiyon listesinden oluşur.
- **Organization Scoped**: Tüm kurallar `organizationId` bazında tutulur (multi-tenancy ile uyumlu).
- **JSON Conditions & Actions**: Esnek condition ve action config’leri JSON kolonlarında saklanır.

### 2. Desteklenen Event’ler
- `task.created`
- `task.status.changed`
- `task.deadline.approaching`

Bu event’ler ileride Task/Job sistemi ile entegre edilerek otomatik tetiklenecek şekilde tasarlandı.

### 3. Desteklenen Action’lar
- `send_email` – Belirli adreslere e-posta gönder.
- `notify_assignees` – Task assignee’lerine in-app/notification gönder.
- `create_activity_log` – Activity/Audit log kaydı oluştur.
- `post_webhook` – Harici bir URL’e HTTP isteği yap.

---

## 📁 Dosya Yapısı

```txt
src/
├── types/
│   └── workflow.types.ts          # Workflow event, action, condition, rule ve DTO tipleri
├── services/
│   └── workflow-rule.service.ts   # DB erişimi ve rule CRUD iş mantığı
├── controllers/
│   └── workflow-rule.controller.ts# HTTP layer: create/list/update/delete endpoints
├── routes/
│   └── workflow-rule.routes.ts    # /workflow/rules route’ları
└── database/
    └── migrations/
        └── day36-workflow-rules.sql  # workflow_rules tablosu migration’ı

docs/
└── day36-README.md                # (bu dosya)