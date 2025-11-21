# DevTracker - Task Management API
## Tech Stack

- TypeScript
- Express.js
- Node.js
- Jest (Testing Framework)

## Days
- 1 - 2 - 3 - 4
- 5 - 6 - 7 - 8
- 9 - 10 - 11 - 12
- 13 - 14 - 15 - 16
- 17 - 18 - 19 - 20
- 21 - 22 - **23** ← Current

## Day 23: Advanced Filtering & Dashboard Analytics 🎯

Bugün task management sistemine gelişmiş filtreleme ve dashboard analytics özellikleri eklendi:

### ✨ New Features:
- **Multiple Status/Priority Filtering**: Array tabanlı çoklu filtreleme
- **Text Search**: Title ve description alanlarında arama
- **Date Range Filtering**: Tarih aralığına göre filtreleme  
- **Dynamic Sorting**: Dinamik sıralama seçenekleri
- **Dashboard Analytics**: Comprehensive task statistics
- **Productivity Metrics**: Daily/weekly/monthly performance

### 🔗 API Examples:
```bash
# Advanced filtering
GET /api/v1/tasks?status=TODO,IN_PROGRESS&priority=HIGH,URGENT&search=api&sortBy=priority

# Dashboard analytics
GET /api/v1/tasks/dashboard?userId=user123
```

Detaylar için: `src/day23-README.md`
