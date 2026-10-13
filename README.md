# SprintEra Backend API 🚀

SprintEra Proje Yönetim Sistemi'nin güçlü ve ölçeklenebilir arka yüz (backend) altyapısı. Bu proje Node.js, Express ve PostgreSQL kullanılarak geliştirilmiş olup; güvenli bir kimlik doğrulama (JWT), rol bazlı yetkilendirme (RBAC), proje ve görev yönetimi, veritabanı migration sistemi ve CI/CD pipeline barındırmaktadır.

---

## 🛠️ Kullanılan Teknolojiler

- **Node.js & Express.js (v5)** - Sunucu ve RESTful API altyapısı
- **PostgreSQL 16 (Docker & Docker Compose)** - İlişkisel Veritabanı Yönetim Sistemi
- **Sequelize ORM & Sequelize CLI** - Veritabanı modelleme, ilişkiler ve migration'lar
- **JWT (JSON Web Token)** - Taşıyıcı token tabanlı kimlik doğrulama (Bearer Token)
- **Bcrypt** - Güvenli parola hashleme
- **Swagger UI & swagger-jsdoc** - OpenAPI 3.0 interaktif API dokümantasyonu
- **Jest & Supertest** - Kapsamlı API entegrasyon ve birim testleri
- **GitHub Actions** - Otomatik test ve CI (Continuous Integration) pipeline

---

## 📂 Proje Klasör Yapısı

```text
backend/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions otomatik CI iş akışı
├── config/                    # Veritabanı (database.js) ve ortam yapılandırması (config.js)
├── controllers/               # İş mantığı kontrolcüleri
│   ├── authController.js      # Kayıt, giriş ve profil (me) işlemleri
│   ├── healthController.js    # Sağlık durumu kontrolü
│   ├── projectController.js   # Proje oluşturma, listeleme ve detay
│   └── taskController.js      # Görev oluşturma, filtreli listeleme ve güncelleme
├── docs/                      # Swagger OpenAPI dokümantasyon yapılandırması
├── middleware/                # Güvenlik ve ara yazılımlar
│   ├── authMiddleware.js      # JWT token doğrulama
│   ├── roleMiddleware.js      # Rol bazlı yetkilendirme (RBAC)
│   └── errorMiddleware.js     # Merkezi hata yakalayıcı ve 404 yöneticisi
├── migrations/                # Sequelize veritabanı şema göç dosyaları
├── models/                    # Sequelize modelleri (User, Role, Project, Task, Permission)
├── routes/                    # API rota tanımlamaları
│   ├── authRoutes.js          # /api/auth uç noktaları
│   ├── healthRoutes.js        # /api/health uç noktası
│   ├── projectRoutes.js       # /api/projects uç noktaları
│   └── taskRoutes.js          # /api/tasks uç noktaları
├── tests/                     # Otomatik test dosyaları (api.test.js)
├── .env.example               # Örnek ortam değişkenleri şablonu
├── docker-compose.yml         # PostgreSQL konteyner yapılandırması
├── seed.js                    # Başlangıç rolleri ve örnek kullanıcılar scripti
└── server.js                  # Express uygulaması giriş noktası
```

---

## ⚙️ Gereksinimler

- [Node.js](https://nodejs.org/) (v18 veya üzeri)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (PostgreSQL için) veya yerel PostgreSQL 16
- [Git](https://git-scm.com/)

---

## 🚀 Kurulum ve Çalıştırma Adımları

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Ortam Değişkenlerini (.env) Ayarlayın
Proje dizininde yer alan `.env.example` dosyasını `.env` olarak kopyalayın:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Linux / macOS:
cp .env.example .env
```

**.env Örnek Yapılandırması:**
```env
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sprintera
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Veritabanını Başlatın (Docker Compose)
```bash
docker compose up -d
```

### 4. Migration ve Seed Verilerini Yükleyin
Veritabanı tablolarını oluşturmak ve test kullanıcıları/rollerini tohumlamak için:
```bash
# Veritabanı tablolarını senkronize etmek ve başlangıç verilerini yüklemek:
npm run seed

# Veya Sequelize migration çalıştırmak:
npm run migrate
```

**Varsayılan Seed Kullanıcıları:**
- **Yönetici:** `admin@sprintera.com` / `admin123` (Rol: Yönetici)
- **Ekip Üyesi:** `test@sprintera.com` / `test1234` (Rol: Ekip Üyesi)

### 5. Sunucuyu Başlatın
```bash
npm start
```
Sunucu başladığında terminalde şu çıktıyı göreceksiniz:
> `PostgreSQL bağlantısı başarılı!`
> `Sunucu 3000 portunda çalışıyor.`
> `Swagger dokümantasyonu http://localhost:3000/api/docs adresinde mevcut.`

---

## 📖 API Dokümantasyonu (Swagger / OpenAPI)

Tüm API uç noktalarını canlı ve görsel arayüzde incelemek, JWT token ile yetkilendirme yaparak uçtan uca test etmek için:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

### Swagger Üzerinden Örnek Uçtan Uca Test Akışı
1. `POST /api/auth/login` isteği ile giriş yapın (`admin@sprintera.com` / `admin123`) ve dönen `token` değerini kopyalayın.
2. Sağ üstteki **Authorize** butonuna tıklayarak token değerini yapıştırın (`Bearer` otomatik veya manuel eklenir).
3. `GET /api/auth/me` isteği atarak giriş yapan kullanıcının profilini ve rolünü doğrulayın.
4. `POST /api/projects` ile yeni bir proje oluşturun (`name`, `description`, `date`).
5. `GET /api/projects` ile projeleri listeleyin.
6. `GET /api/projects/{id}` ile proje detaylarını ve projeye ait görevleri görüntüleyin.
7. `POST /api/tasks` ile oluşturulan projeye yeni görev ekleyin (`title`, `projectId`, `assignedTo`, `status`).
8. `GET /api/tasks` ile görevleri listeleyin, `projectId` veya `assignedTo` parametreleriyle filtreleyin.
9. `PATCH /api/tasks/{id}` ile görevi başka kullanıcıya atayın veya durumunu `To Do` -> `In Progress` -> `Done` olarak güncelleyin.

---

## 🔐 Rol Bazlı Yetkilendirme (RBAC) Kuralları

| Uç Nokta | Metot | İzin Verilen Roller | Açıklama |
|---|---|---|---|
| `/api/auth/register` | POST | Herkes | Yeni kullanıcı kaydı |
| `/api/auth/login` | POST | Herkes | Giriş ve token üretimi |
| `/api/auth/me` | GET | Giriş Yapmış Kullanıcılar | Oturum açan kullanıcının profili |
| `/api/projects` | POST | **Yönetici** | Yalnızca yöneticiler proje oluşturabilir (403) |
| `/api/projects` | GET | **Yönetici**, **Ekip Üyesi** | Projeleri listeleme |
| `/api/projects/:id` | GET | **Yönetici**, **Ekip Üyesi** | Proje detayını görüntüleme |
| `/api/tasks` | POST | **Yönetici**, **Ekip Üyesi** | Projeye görev ekleme |
| `/api/tasks` | GET | **Yönetici**, **Ekip Üyesi** | Görevleri listeleme ve filtreleme |
| `/api/tasks/:id` | PATCH | **Yönetici**, **Ekip Üyesi** | Görev durumu ve atama güncelleme |

---

## 🧪 Testleri Çalıştırma

Jest ve Supertest ile hazırlanmış entegrasyon testlerini çalıştırmak için:
```bash
# Testleri çalıştırmak için:
npm test

# Test kapsama (coverage) raporu almak için:
npm run test:coverage
```
