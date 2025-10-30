import Database from 'better-sqlite3';

// path = Dosya yolu işlemleri için Node.js modülü
import path from 'path';

// fs = File system (dosya sistemi)
import fs from 'fs';


// __dirname = Bu dosyanın bulunduğu klasör
const DB_PATH = path.join(__dirname, '../../data/devtracker.db');


// path.dirname() = Dosya yolundan klasör yolunu al
const dataDir = path.dirname(DB_PATH);

if (!fs.existsSync(dataDir)) {
  // recursive: true = Gerekirse üst klasörleri de oluştur
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 Data directory created: ${dataDir}`);
}


// new Database() = Yeni database bağlantısı
// DB_PATH = Database dosyasının yolu
// Dosya yoksa otomatik oluşturur
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

// Foreign key kısıtlamalarını aktif et
// SQLite'da default olarak kapalıdır

// db.pragma() = SQLite pragma komutları
// PRAGMA foreign_keys = ON
db.pragma('foreign_keys = ON');

console.log('✅ Database connection established');
console.log(`📍 Database path: ${DB_PATH}`);

// Uygulama kapanırken database'i düzgün kapat

// process.on() = Node.js process event'lerini dinle
// SIGINT = Ctrl+C ile kapatma
// SIGTERM = Kill komutu ile kapatma

const closeDatabase = () => {
  console.log('\n🔌 Closing database connection...');
  // db.close() = Database bağlantısını kapat
  db.close();
  console.log('✅ Database closed');
  // process.exit() = Uygulamayı kapat
  process.exit(0);
};

process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

export default db;