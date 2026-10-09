# SprintEra Backend API 🚀

SprintEra Proje Yönetim Sistemi'nin güçlü ve ölçeklenebilir arka yüz (backend) altyapısı. Bu proje, Node.js, Express ve PostgreSQL kullanılarak geliştirilmiş olup, güvenli bir kimlik doğrulama (JWT) ve rol yönetimi sistemi barındırmaktadır.

## 🛠️ Kullanılan Teknolojiler

- **Node.js & Express.js** - Sunucu ve API altyapısı
- **PostgreSQL (Docker)** - İlişkisel Veritabanı Yönetim Sistemi
- **Sequelize ORM** - Veritabanı yönetimi ve modelleme
- **JWT (JSON Web Token)** - Güvenli kimlik doğrulama mekanizması
- **Bcrypt** - Şifre şifreleme (hashing)
- **Swagger UI** - İnteraktif API dokümantasyonu
- **Jest & Supertest** - Kapsamlı API testleri

---

## 📂 Proje Klasör Yapısı

```text
backend/
├── config/        # Veritabanı ve ortam değişkeni konfigürasyonları
├── controllers/   # İstekleri işleyen ana mantık (Auth, Health vb.)
├── docs/          # Swagger API dokümantasyon ayarları
├── middleware/    # Güvenlik, yetkilendirme ve hata yakalama (Error Handling) katmanı
├── models/        # Sequelize veritabanı tabloları (User, Role, Permission)
├── routes/        # API uç noktalarının tanımlandığı yönlendiriciler
├── tests/         # Jest ve Supertest ile yazılmış API testleri
├── .env           # Hassas ortam değişkenleri (Port, DB şifreleri, JWT secret)
├── seed.js        # Veritabanına varsayılan roller ve test hesapları ekleme scripti
└── server.js      # Uygulamanın ana giriş noktası
```

---

## ⚙️ Gereksinimler

Projeyi kendi bilgisayarınızda çalıştırabilmeniz için aşağıdakilerin kurulu olması gerekir:
- [Node.js](https://nodejs.org/) (v16 veya üzeri)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (PostgreSQL konteyneri için)

---

## 🚀 Kurulum ve Çalıştırma Adımları

**1. Bağımlılıkları Yükleyin**
Projeyi klonladıktan veya indirdikten sonra terminalde proje dizinine gidin ve gerekli paketleri kurun:
```bash
npm install
```

**2. Ortam Değişkenlerini (.env) Ayarlayın**
Proje dizininde bulunan `.env` dosyasını kendi sisteminize göre yapılandırın. (Örnek varsayılan yapılandırma hazır olarak gelmektedir).

**3. Veritabanını (Docker PostgreSQL) Başlatın**
Docker Desktop uygulamasını açın ve motorun çalıştığından emin olun. Ardından terminalde şu komutu çalıştırarak `sprintera-postgres` isimli veritabanını ayağa kaldırın:
```bash
docker start sprintera-postgres
```
*(Eğer konteyner daha önce oluşturulmadıysa, önce `docker run --name sprintera-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=SprintEra -p 5433:5432 -d postgres` komutuyla oluşturmanız gerekebilir).*

**4. Veritabanını Test Verileriyle Doldurun (Opsiyonel)**
Uygulamaya "Yönetici" ve "Ekip Üyesi" rollerini ile bir test yöneticisi eklemek için seed scriptini çalıştırın:
```bash
npm run seed
```

**5. Sunucuyu Başlatın**
Her şey hazır olduğunda sunucuyu çalıştırın:
```bash
npm start
```
> **Başarılı Çıktı:** 
> `PostgreSQL bağlantısı başarılı!`
> `Sunucu 3000 portunda çalışıyor.`

---

## 📖 API Dokümantasyonu (Swagger)

Sunucu çalışır durumdayken, tüm API uç noktalarını görsel bir arayüzde incelemek ve test etmek için tarayıcınızdan şu adrese gidin:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

## 🧪 Testleri Çalıştırma

Projeye entegre edilmiş Jest ve Supertest yapılarıyla yazılmış otomatik testleri çalıştırmak için:

```bash
# Sadece testleri çalıştırmak için:
npm test

# Testleri çalıştırıp kod kapsama (coverage) raporunu görmek için:
npm run test:coverage
```

---

## 📌 Yetkilendirme (Authentication)

Korumalı uç noktalara (Örn: `GET /api/auth/me`) istek atmak için `/api/auth/login` üzerinden giriş yapıp bir JWT elde etmelisiniz. 
Aldığınız bu token'ı, Swagger ekranındaki **"Authorize"** butonuna basarak kopyalayıp yapıştırabilirsiniz.
