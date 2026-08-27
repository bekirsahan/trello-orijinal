# 🚀 AuraTask – Akıllı Görev ve Proje Yönetim Sistemi

> Trello/Jira benzeri, multi-platform (Web, Mobil, Desktop) sürükle-bırak Kanban sistemi.
> Full-Stack (Node.js + React 19 + Prisma + SQLite/PostgreSQL + JWT Auth + Electron + React Native)

---

## 📁 Proje Yapısı

```
trello-orjinal/
├── backend/       → Node.js + Express + Prisma (REST API)
├── frontend/      → React 19 + Vite (Web Uygulaması)
│   └── electron/  → Electron (Desktop .exe)
├── mobile/        → React Native + Expo (Mobil Uygulama)
├── fake-api/      → JSON-Server (Sahte API)
└── docs/          → User Stories, ER Diyagramı, API Dökümanları
```

---

## ⚡ Hızlı Başlangıç

### 1. Backend Sunucusunu Başlatın

```bash
cd backend
npm install
# Zaten kuruluysa ve db.dev.db varsa bu adımı atlayın:
# npx prisma db push
# node src/config/seed.js
npm run dev
```

> Backend `http://localhost:5000` adresinde çalışır.

### 2. Web Uygulamasını Başlatın

```bash
cd frontend
npm install
npm run dev
```

> Web arayüzü `http://localhost:5173` adresinde açılır.

### 3. Sahte API'yi Başlatın (Opsiyonel – Demo Modu zaten dahili çalışır)

```bash
cd fake-api
npm install
npm start
```

> JSON-Server `http://localhost:5001` adresinde çalışır.

---

## 🔑 Demo Giriş Bilgileri

| Rol | E-posta | Şifre |
|---|---|---|
| 🛡️ Yönetici (Admin) | `admin@example.com` | `admin123` |
| 👤 Normal Kullanıcı | `user@example.com` | `user123` |
| 👤 Ekip Üyesi | `ekip1@example.com` | `user123` |

> **Not:** Web arayüzü varsayılan olarak **Demo Modu**'nda çalışır.
> Tarayıcıda localStorage kullanır, herhangi bir sunucu gerektirmez.
> Navbar'daki **DEMO MODU** butonuna tıklayarak Canlı Sunucu moduna geçebilirsiniz.

---

## 🔒 Güvenlik Yapılandırması

| Bileşen | Yöntem |
|---|---|
| Şifre | `bcryptjs` 12-round hash |
| Token | JWT (7 günlük oturum) |
| API Koruması | `express-rate-limit` (100 req / 15 dk) |
| Auth Koruması | `express-rate-limit` (15 deneme / 15 dk) |
| HTTP Başlıkları | `helmet` (XSS, Clickjacking, MIME koruması) |
| SQL Güvenliği | Prisma parametrik sorgular |

---

## 🖥️ Desktop (Electron) Yapılandırması

```bash
cd frontend
npm install electron electron-builder --save-dev

# Geliştirme ortamında Electron'u çalıştır:
npm run dev  # önce Vite dev server'ı başlatın
# Ardından ayrı bir terminalde:
npx electron electron/main.js
```

---

## 📱 Mobil (React Native / Expo)

```bash
cd mobile
npm install
npx expo start
```

> iOS veya Android emülatör, ya da Expo Go uygulaması ile test edebilirsiniz.
> Bağlantı için `mobile/src/services/api.js` içindeki `API_URL` adresini kendi bilgisayarınızın IP'si ile güncelleyin.

---

## 📡 API Endpoint'leri

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Kullanıcı girişi |
| GET | `/api/auth/me` | Oturum bilgisi |
| GET | `/api/projects` | Projeler listesi |
| POST | `/api/projects` | Proje oluştur |
| GET | `/api/projects/:id` | Proje detayı |
| PUT | `/api/projects/:id` | Proje güncelle |
| DELETE | `/api/projects/:id` | Proje sil |
| POST | `/api/tasks` | Görev oluştur |
| PUT | `/api/tasks/:id` | Görev güncelle |
| PATCH | `/api/tasks/:id/status` | Kanban durum güncelle |
| DELETE | `/api/tasks/:id` | Görev sil |
| GET | `/api/admin/stats` | Admin istatistikleri |
| GET | `/api/admin/users` | Tüm kullanıcılar |
| PATCH | `/api/admin/users/:id/role` | Rol güncelle |

---

## 🛠️ Kullanılan Teknolojiler

**Backend:** Node.js, Express, Prisma ORM, SQLite/PostgreSQL, JWT, Bcrypt, Helmet, CORS, Rate Limit

**Frontend:** React 19, Vite, Context API, Lucide Icons, CSS Custom Properties, Glassmorphism

**Desktop:** Electron, electron-builder

**Mobil:** React Native, Expo, React Navigation

**Geliştirme:** Nodemon, Prisma Studio, JSON-Server
