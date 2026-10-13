# SprintEra Backend API 🚀

SprintEra Proje Yönetim Sistemi'nin güçlü ve ölçeklenebilir arka yüz (backend) altyapısı. Bu proje Node.js, Express ve PostgreSQL kullanılarak geliştirilmiş olup, güvenli bir kimlik doğrulama (JWT), rol yönetimi, veritabanı migration sistemi ve CI/CD pipeline barındırmaktadır.

## 🛠️ Kullanılan Teknolojiler

- **Node.js & Express.js** - Sunucu ve API altyapısı
- **PostgreSQL (Docker & Docker Compose)** - İlişkisel Veritabanı Yönetim Sistemi
- **Sequelize ORM & Sequelize CLI** - Veritabanı yönetimi, modelleme ve migration'lar
- **JWT (JSON Web Token)** - Güvenli kimlik doğrulama mekanizması
- **Bcrypt** - Şifre şifreleme (hashing)
- **Swagger UI** - İnteraktif API dokümantasyonu
- **Jest & Supertest** - Kapsamlı API testleri
- **GitHub Actions** - Otomatik test ve CI (Continuous Integration) doğrulama

---

## 📂 Proje Klasör Yapısı

```text
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions otomatik CI pipeline
├── config/                  # Veritabanı ve ortam değişkeni konfigürasyonları (Sequelize)
├── controllers/             # İstekleri işleyen ana mantık (Auth, Health vb.)
├── docs/                    # Swagger API dokümantasyon ayarları
├── middleware/              # Güvenlik, yetkilendirme (JWT) ve hata yakalama (Error Handler)
├── migrations/              # Sequelize veritabanı şema versiyonları (Roles, Permissions, Users)
├── models/                  # Sequelize tabloları (User, Role, Permission, RolePermission)
├── routes/                  # API uç noktalarının yönlendiricileri (Auth, Health)
├── tests/                   # Jest ve Supertest ile yazılmış API testleri
├── .env.example             # Örnek ortam değişkenleri şablonu
├── .sequelizerc             # Sequelize CLI dizin yapılandırması
├── docker-compose.yml       # PostgreSQL veritabanı konteyneri yapılandırması
├── seed.js                  # Varsayılan roller ve test hesapları yükleme scripti
└── server.js                # Uygulamanın ana giriş noktası
```

---

## ⚙️ Gereksinimler

- [Node.js](https://nodejs.org/) (v18 veya üzeri)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (PostgreSQL için)
- [Git](https://git-scm.com/)

---

## 🚀 Kurulum ve Çalıştırma Adımları

**1. Bağımlılıkları Yükleyin**
```bash
npm install
```

**2. Ortam Değişkenlerini (.env) Ayarlayın**
Proje dizininde bulunan `.env.example` dosyasını `.env` olarak kopyalayın:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Linux / macOS:
cp .env.example .env
```

**3. Veritabanını (Docker Compose) Başlatın**
Docker Desktop'ı açın ve tek komutla PostgreSQL konteynerini ayağa kaldırın:
```bash
docker compose up -d
```
*(PostgreSQL `localhost:5433` portunda çalışacaktır).*

**4. Veritabanı Migration'larını Çalıştırın**
Tablo ve şemaların veritabanına uygulanması için:
```bash
npm run migrate
```

**5. Veritabanını Test Verileriyle Doldurun (Opsiyonel)**
Uygulamaya varsayılan rolleri ("Yönetici", "Ekip Üyesi") ve test hesaplarını eklemek için:
```bash
npm run seed
```

**6. Sunucuyu Başlatın**
```bash
npm start
```
> **Başarılı Çıktı:** 
> `PostgreSQL bağlantısı başarılı!`
> `Sunucu 3000 portunda çalışıyor.`
> `Swagger dokümantasyonu http://localhost:3000/api/docs adresinde mevcut.`

---

## 📖 API Dokümantasyonu (Swagger)

Sunucu çalışırken, tüm API uç noktalarını görsel arayüzde incelemek ve test etmek için:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

## 🧪 Testleri Çalıştırma

Otomatik Jest ve Supertest testlerini çalıştırmak için:
```bash
# Sadece testleri çalıştırmak için:
npm test

# Testleri çalıştırıp kod kapsama (coverage) raporu almak için:
npm run test:coverage
```

---

## 🌿 Git Branch Stratejisi & Geliştirme Kuralları

SprintEra ekibi olarak stabil bir geliştirme akışı için **Git Flow** kuralları uygulanmaktadır:

1. **`main` Branch (Production):** Sadece canlıya çıkmaya hazır, testleri geçmiş stabil sürümleri barındırır. Doğrudan push yasaktır!
2. **`dev` Branch (Geliştirme):** Tüm yeni özelliklerin toplandığı ana geliştirme dalıdır. Doğrudan push yasaktır!
3. **Özellik Geliştirme (Feature Branch):** 
   - Yeni bir işe başlarken her zaman güncel `dev` branch'inden dal açın:
     ```bash
     git checkout dev
     git pull origin dev
     git checkout -b feature/gorev-adi
     ```
   - İşinizi bitirdikten sonra branch'inizi uzak sunucuya push'layın ve GitHub üzerinden `dev` branch'ine **Pull Request (PR)** açın.
   - PR, GitHub Actions CI testlerinden başarıyla geçtikten ve ekip onayı aldıktan sonra merge edilir.
