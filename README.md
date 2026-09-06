**TriagePeace**

«Ketika internet berhenti, pelayanan tidak boleh ikut berhenti.»

TriagePeace adalah sistem triase dan pengelolaan informasi pasien berbasis offline-first yang dirancang untuk tenaga kesehatan yang bekerja di wilayah dengan konektivitas internet yang tidak dapat diandalkan.

TriagePeace memungkinkan petugas lapangan untuk mengumpulkan informasi pasien, melakukan penilaian triase secara terstruktur, dan menyinkronkan informasi tersebut dengan fasilitas kesehatan ketika koneksi internet kembali tersedia.

Prototype: https://triagepeace.vercel.app
Repository: https://github.com/Samuel-Alden/TriagePeace

---

**Masalah**

Tenaga kesehatan yang bekerja di desa terpencil, daerah pedalaman, hutan, wilayah bencana, dan lokasi dengan konektivitas rendah dapat menghadapi satu masalah besar:

«Sistem pelayanan kesehatan tidak seharusnya bergantung pada koneksi internet yang tidak selalu tersedia.»

Ketika koneksi internet tidak tersedia, informasi pasien sering kali harus dicatat di kertas atau diingat sampai pasien tiba di fasilitas kesehatan.

Hal ini dapat menyebabkan:

- Catatan pasien hilang atau rusak.
- Informasi penting terlupakan ketika pasien dipindahkan.
- Tenaga kesehatan di fasilitas penerima membutuhkan waktu untuk mendapatkan kembali informasi pasien.
- Informasi pasien tidak dapat langsung tersedia bagi tim penerima.
- Gangguan koneksi dapat menghambat alur pelayanan kesehatan.

TriagePeace dirancang untuk menghadapi kondisi tersebut.

Alih-alih menganggap koneksi internet sebagai sebuah keharusan, TriagePeace menganggap konektivitas sebagai sesuatu yang dapat datang dan pergi.

---

**Solusi**

TriagePeace menyediakan alur kerja offline-first:

┌─────────────────┐
│ Tenaga Kesehatan│
│    Lapangan     │
└────────┬────────┘
         │
         ▼
┌────────────────────┐
│ Catat Informasi    │
│      Pasien        │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Lakukan Triase     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Simpan Secara Lokal│
│ Jika Offline       │
└─────────┬──────────┘
          │
          │ Koneksi kembali
          ▼
┌────────────────────┐
│ Sinkronisasi Data  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Fasilitas Kesehatan│
│ Menerima Kasus     │
└────────────────────┘

Tujuan utamanya sederhana:

«Tidak adanya koneksi internet seharusnya tidak menghalangi tenaga kesehatan untuk mencatat dan mengirimkan informasi penting pasien.»

---

**Fitur Utama**

1. Formulir Pasien Offline

Informasi pasien dapat dimasukkan tanpa koneksi internet aktif.

Ketika perangkat sedang offline, data disimpan secara lokal menggunakan IndexedDB sehingga data tidak langsung hilang.

Ketika koneksi kembali tersedia, data yang masih berada dalam antrean dapat disinkronkan dengan backend.

Dengan demikian, proses pengumpulan informasi pasien tetap dapat berjalan meskipun jaringan tidak tersedia.

---

2. Informasi Klinis Terstruktur

Formulir TriagePeace dapat mengumpulkan berbagai informasi penting.

Informasi pasien

- Nama pasien
- Usia
- Alamat

Keluhan dan riwayat

- Keluhan utama
- Riwayat gejala
- Catatan tambahan

Tanda vital

- Tekanan darah
- Denyut nadi
- Laju pernapasan
- Suhu tubuh
- Saturasi oksigen

Kesadaran

- GCS
- AVPU

Survei primer

- Kondisi jalan napas
- Kondisi pernapasan
- Kondisi sirkulasi
- Informasi pendarahan / trauma

Riwayat medis

- Alergi obat
- Penyakit penyerta
- Obat yang sedang dikonsumsi

Tujuannya adalah membuat proses serah terima pasien menjadi lebih terstruktur dibandingkan hanya mengandalkan catatan bebas atau ingatan petugas.

---

3. Klasifikasi Triase

Kasus dikelompokkan menjadi tiga tingkat prioritas:

Tingkat| Makna
🔴 Merah| Prioritas tertinggi
🟡 Kuning| Prioritas menengah / membutuhkan perhatian
🟢 Hijau| Prioritas lebih rendah

Repository juga memiliki mekanisme validasi di sisi server yang dapat menetapkan batas minimum tingkat keparahan berdasarkan gejala tertentu yang telah dikonfigurasi.

Sebagai contoh, gejala yang dikonfigurasi sebagai indikator kondisi darurat dapat memaksa kasus memiliki tingkat minimal Merah.

**Penting**

TriagePeace saat ini merupakan prototype dan bukan sistem diagnosis otomatis atau pengganti keputusan tenaga medis profesional.

Aturan triase perlu melalui proses validasi dan peninjauan klinis yang sesuai sebelum digunakan pada pelayanan pasien secara nyata.

---

4. Sinkronisasi Otomatis

TriagePeace memiliki antrean lokal untuk data yang belum berhasil dikirim ke server.

Proses sinkronisasi:

1. Data pasien disimpan terlebih dahulu secara lokal.
2. Sistem mencoba mengirimkannya ketika koneksi tersedia.
3. Data yang berhasil dikirim dihapus dari antrean.
4. Kegagalan sementara akan dicoba kembali.
5. Urutan pengiriman tetap dipertahankan.
6. Data yang ditolak secara permanen dipisahkan agar tidak menghambat data lainnya.
7. Setiap pengiriman memiliki "client_submission_id" untuk membantu mencegah duplikasi ketika terjadi percobaan ulang.

Dengan pendekatan ini, koneksi internet yang tidak stabil menjadi bagian normal dari alur aplikasi, bukan sebuah kegagalan fatal.

---

5. Dashboard Fasilitas Kesehatan

Tenaga kesehatan dapat mengakses dashboard untuk melihat kasus yang telah dikirim.

Dashboard menyediakan:

- Kasus aktif
- Kasus selesai
- Pencarian kasus
- Detail kasus
- Tampilan daftar
- Tampilan peta
- Pengelolaan status kasus

Alur status kasus:

Menunggu
   ↓
Sedang Ditangani
   ↓
Selesai

---

6. Analitik

TriagePeace memiliki halaman analitik untuk membantu fasilitas kesehatan memahami pola kasus.

Informasi yang dapat ditampilkan antara lain:

- Jumlah kasus
- Distribusi tingkat keparahan
- Frekuensi gejala

Fitur analitik ditujukan sebagai gambaran operasional dan bukan sebagai pengganti keputusan klinis.

---

7. Informasi Lokasi

Formulir dapat menyertakan informasi geografis pada data kasus apabila izin lokasi tersedia.

Hal ini dapat membantu fasilitas kesehatan memahami lokasi asal sebuah kasus lapangan.

Permintaan akses lokasi dilakukan ketika fitur yang membutuhkan lokasi digunakan, bukan ketika pengguna baru membuka landing page.

---

8. Notifikasi

Aplikasi memiliki dukungan untuk notifikasi sehingga tenaga kesehatan dapat menerima pemberitahuan terkait aktivitas kasus tanpa harus terus-menerus melakukan refresh pada dashboard.

---

9. Dukungan Bahasa

TriagePeace saat ini mendukung:

- 🇮🇩 Bahasa Indonesia
- 🇬🇧 Bahasa Inggris

Sistem terjemahan terpusat digunakan agar antarmuka dapat ditampilkan sesuai bahasa yang dipilih pengguna.

---

10. Mode Gelap

TriagePeace mendukung:

- Light mode
- Dark mode

Keduanya menggunakan sistem desain yang sama sehingga pengalaman pengguna tetap konsisten.

---

**Arsitektur**

TriagePeace dibangun sebagai Progressive Web App (PWA) dengan arsitektur offline-first.

                    ┌──────────────────┐
                    │    React UI      │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
      ┌───────────────┐             ┌───────────────┐
      │   IndexedDB   │             │   Supabase    │
      │ Local Queue   │             │    Backend    │
      └───────┬───────┘             └───────────────┘
              │                             ▲
              │       Koneksi kembali       │
              └─────────────────────────────┘

**Frontend**

Frontend dibangun menggunakan:

- React
- React DOM
- React Router
- Tailwind CSS
- Vite

**Penyimpanan Lokal**

IndexedDB digunakan untuk menyimpan antrean data secara lokal ketika perangkat sedang offline.

Library "idb" digunakan untuk berinteraksi dengan IndexedDB.

**Backend**

TriagePeace menggunakan Supabase untuk:

- Penyimpanan database
- Autentikasi
- Realtime functionality
- Row Level Security
- Validasi data di sisi server

**PWA**

TriagePeace menggunakan arsitektur Progressive Web App dengan service worker.

Hal ini mendukung konsep aplikasi yang dapat terus digunakan dalam kondisi konektivitas yang tidak stabil.

---

**Teknologi**

Teknologi| Fungsi
React| Antarmuka pengguna
Vite| Development & production build
Tailwind CSS| Styling
React Router| Routing
Supabase| Backend, autentikasi & database
PostgreSQL| Database
IndexedDB| Penyimpanan lokal offline
"idb"| Interface IndexedDB
Leaflet| Fitur peta
Recharts| Visualisasi analitik
Vite PWA| Progressive Web App
Public Sans| Tipografi
Vercel| Deployment

---

**Struktur Halaman**

Route| Fungsi
"/"| Landing page
"/intake"| Formulir pasien
"/login"| Login tenaga kesehatan
"/dashboard"| Antrean kasus
"/analytics"| Analitik kasus
"/settings"| Pengaturan

---

**Model Data**

Entitas utama dalam backend adalah:

"triage_submissions"

Data yang dapat disimpan meliputi:

id
device_id
client_submission_id

patient_name
age
address

symptoms
notes
complaint_history

severity
status

systolic_bp
diastolic_bp
pulse_rate
respiratory_rate
body_temperature
oxygen_saturation

consciousness_scale
gcs_score
avpu_level

airway_status
breathing_status
circulation_status

bleeding_trauma
bleeding_trauma_notes

drug_allergies
comorbidities
current_medications

created_at
resolved_at

Database juga memiliki constraint dan validasi untuk membantu mencegah data yang tidak valid masuk ke sistem.

---

**Keamanan**

Karena TriagePeace menangani informasi yang berpotensi sensitif, keamanan merupakan salah satu bagian penting dari arsitektur.

Row Level Security

Supabase Row Level Security digunakan pada tabel utama untuk membatasi akses berdasarkan role dan policy.

Validasi Database

Database melakukan validasi terhadap berbagai informasi, termasuk:

- Struktur gejala
- Gejala yang diperbolehkan
- Panjang nama pasien
- Panjang alamat
- Panjang catatan
- Rentang nilai klinis
- Rentang GCS
- Nilai AVPU
- Kondisi airway / breathing / circulation
- Koordinat geografis
- Status kasus

Pembatasan Update

Pengguna tidak dapat secara bebas mengubah seluruh informasi sebuah kasus.

Perubahan terhadap field tertentu dibatasi melalui mekanisme keamanan database.

Pencegahan Duplikasi

Setiap submission memiliki:

"client_submission_id"

ID tersebut digunakan sebagai identifier unik sehingga percobaan sinkronisasi ulang tidak menyebabkan data yang sama tersimpan berkali-kali.

Perlindungan Data pada Logging

Sistem antrean offline tidak mencatat informasi pasien ke dalam console.

Log hanya mencatat kategori kegagalan yang diperlukan untuk debugging.

---

**Sistem Antrean Offline**

Salah satu komponen terpenting TriagePeace adalah offline queue.

Alurnya:

Pengguna mengirim kasus
          │
          ▼
Validasi data
          │
          ▼
Buat client_submission_id
          │
          ▼
Simpan ke IndexedDB
          │
          ▼
   Apakah online?
      /       \
    Ya         Tidak
    │            │
    ▼            ▼
 Coba kirim     Tunggu
    │            │
    ▼            │
 Berhasil?       │
  /     \        │
Ya       Tidak   │
│          │     │
▼          ▼     │
Hapus      Simpan│
antrean    antrean
           │
           └───────────┐
                       │
                Koneksi kembali
                       │
                       ▼
                 Flush queue

Data dalam antrean diproses berdasarkan urutan waktu.

Jika terjadi kegagalan sementara, data tetap berada di antrean untuk dicoba kembali.

Jika server menolak data secara permanen, data tersebut dipindahkan ke penyimpanan khusus sehingga tidak menghambat data lainnya.

---

**Arsitektur Triase**

Tingkat keparahan direpresentasikan sebagai:

red
yellow
green

Database memiliki mekanisme untuk menentukan minimum severity berdasarkan gejala yang telah dikonfigurasi.

Secara konseptual:

Gejala
  │
  ▼
Tentukan minimum severity
  │
  ├── Indikator darurat → MERAH
  │
  ├── Indikator urgent  → KUNING
  │
  └── Lainnya           → HIJAU

Kemudian database memastikan tingkat keparahan yang dikirim tidak berada di bawah batas minimum yang telah ditentukan.

Hal ini mengikuti prinsip penting:

«Aturan penting tidak seharusnya hanya bergantung pada frontend.»

Validasi kritis juga perlu ditegakkan di sisi backend.

---

**Keselamatan Klinis**

TriagePeace saat ini merupakan prototype hackathon.

Sistem ini tidak dimaksudkan untuk:

- Menggantikan tenaga medis profesional.
- Membuat diagnosis secara mandiri.
- Menentukan tindakan medis secara otomatis.
- Menggantikan penilaian klinis.

Aturan triase dan batas klinis yang digunakan prototype perlu melalui proses clinical review dan validation yang sesuai sebelum dapat digunakan dalam lingkungan klinis nyata.

Deployment di dunia nyata juga harus mempertimbangkan:

- Privasi pasien
- Keamanan data
- Regulasi kesehatan
- Regulasi perlindungan data
- Medical device regulations jika berlaku
- Clinical governance
- Audit dan monitoring

---

**Instalasi**

Persyaratan

Pastikan sudah memiliki:

- Node.js
- npm
- Supabase project

Periksa Node.js:

node --version

Periksa npm:

npm --version

---

**Menjalankan Project**

Clone repository:

git clone https://github.com/Samuel-Alden/TriagePeace.git

Masuk ke folder:

cd TriagePeace

Install dependency:

npm install

Jalankan development server:

npm run dev

---

**Environment Variables**

Buat file:

.env

di root project.

Isi dengan:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key

Jangan memasukkan:

- Supabase service-role key
- Database password
- Private API key
- Credential rahasia lainnya

ke dalam repository Git.

---

**Supabase**

File konfigurasi database berada di:

supabase/

Beberapa file penting:

supabase/
├── schema.sql
├── clinical_assessment.sql
├── vital_ranges.sql
├── security_hardening.sql
├── case_audit.sql
├── feature_additions.sql
├── push_notifications.sql
├── functions/
└── tests/

Saat membuat environment Supabase baru, migration dan SQL harus diterapkan sesuai dependensinya.

Sebelum digunakan dengan data pasien nyata, konfigurasi database, security policies, dan clinical logic harus melalui review yang sesuai.

---

**Production Build**

Untuk membuat production build:

npm run build

Untuk melihat production build secara lokal:

npm run preview

---

**Linting**

Jalankan:

npm run lint

Project menggunakan Oxlint untuk pemeriksaan kode.

---

**Security Testing**

Repository menyediakan pengujian keamanan database:

npm run test:security

Test tersebut menjalankan:

supabase/tests/run-all.mjs

---

**Struktur Repository**

TriagePeace/
│
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   └── landing/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │   ├── queue.js
│   │   ├── supabase.js
│   │   ├── i18n.jsx
│   │   └── theme.js
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── IntakePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   └── SettingsPage.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── sw.js
│
├── supabase/
│   ├── schema.sql
│   ├── clinical_assessment.sql
│   ├── vital_ranges.sql
│   ├── security_hardening.sql
│   ├── case_audit.sql
│   ├── feature_additions.sql
│   ├── push_notifications.sql
│   ├── functions/
│   └── tests/
│
├── .env.example
├── package.json
├── vite.config.js
└── vercel.json

---

**Filosofi Desain**

TriagePeace menggunakan filosofi desain yang sederhana dan berfokus pada pengguna.

1. Kejelasan lebih penting daripada dekorasi

Tenaga kesehatan tidak seharusnya kesulitan menemukan informasi penting karena interface yang terlalu rumit.

2. Satu tugas pada satu waktu

Interface dirancang agar pengguna tetap fokus pada proses yang sedang dilakukan.

3. Offline adalah kondisi normal

Tidak adanya internet tidak seharusnya terasa seperti aplikasi mengalami error.

4. Informasi penting harus mudah ditemukan

Informasi pasien, tingkat triase, status kasus, dan status sinkronisasi harus mudah dipahami.

5. Software kesehatan harus terasa dapat dipercaya

Desain menggunakan visual yang tenang dan profesional daripada estetika yang terlalu mencolok.

---

**Mengapa Offline-First?**

Sebagian besar aplikasi berasumsi:

Internet
   ↓
Aplikasi
   ↓
Backend

TriagePeace menggunakan pendekatan berbeda:

             Aplikasi
                │
       ┌────────┴────────┐
       │                 │
   Online              Offline
       │                 │
       ▼                 ▼
   Backend          Penyimpanan
                      Lokal
                         │
                         ▼
                  Koneksi Kembali
                         │
                         ▼
                    Sinkronisasi

Perbedaan ini merupakan inti dari TriagePeace.

Koneksi internet diperlakukan sebagai sesuatu yang tersedia ketika memungkinkan, bukan sebagai persyaratan mutlak agar aplikasi dapat digunakan.

---

**Konteks Hackathon**

TriagePeace dikembangkan sebagai prototype hackathon yang berfokus pada peningkatan kontinuitas informasi kesehatan di lingkungan dengan konektivitas internet yang terbatas.

Prototype ini menunjukkan bagaimana arsitektur offline-first dapat digunakan dalam workflow kesehatan ketika koneksi internet tidak selalu tersedia.

Demo utama TriagePeace:

«Tenaga kesehatan lapangan dapat mengumpulkan informasi pasien tanpa internet, menyimpannya secara lokal, dan menyinkronkannya ketika koneksi kembali tersedia.»

---

**Keterbatasan Saat Ini**

TriagePeace masih merupakan prototype dan memiliki beberapa keterbatasan:

- Belum merupakan sistem klinis production-ready.
- Aturan triase masih memerlukan validasi klinis lebih lanjut.
- Deployment nyata memerlukan security dan privacy review.
- Data pasien nyata tidak boleh digunakan tanpa perlindungan dan otorisasi yang sesuai.
- Penyimpanan data secara lokal menimbulkan pertimbangan keamanan perangkat.
- Production deployment membutuhkan monitoring, backup, disaster recovery, dan operational controls yang lebih matang.
- Sistem sinkronisasi perlu diuji lebih lanjut dalam berbagai kondisi jaringan nyata.

Keterbatasan ini penting karena software kesehatan memiliki standar keamanan dan validasi yang jauh lebih tinggi dibandingkan aplikasi biasa.

---

**Roadmap**

Klinis

- Validasi klinis formal terhadap aturan triase
- Protokol klinis yang dapat dikonfigurasi
- Workflow assessment yang lebih lengkap
- Clinical governance dan review

Offline

- Conflict resolution yang lebih baik
- Monitoring status sinkronisasi
- Enkripsi penyimpanan lokal
- Device recovery workflow yang lebih baik

Fasilitas Kesehatan

- Multi-facility routing
- Informasi ketersediaan fasilitas
- Referral workflow
- Prioritas kasus yang lebih kompleks

Keamanan

- Autentikasi dan authorization yang lebih kuat
- Device management
- Audit dan monitoring tambahan
- Privacy controls
- Security testing yang lebih menyeluruh

Platform

- Pengalaman instalasi PWA yang lebih baik
- Mobile UX yang lebih matang
- Peningkatan accessibility
- Dukungan bahasa tambahan

---

**Kontribusi**

Kontribusi dipersilakan.

Sebelum melakukan perubahan besar:

1. Pahami arsitektur yang sudah ada.
2. Jangan mengganti fungsi yang sudah berjalan tanpa alasan kuat.
3. Pertahankan kemampuan offline-first.
4. Uji workflow dalam kondisi online dan offline.
5. Jalankan build dan lint.
6. Hindari dependency yang tidak diperlukan.
7. Jangan menambahkan klaim medis yang tidak memiliki dasar.
8. Jangan menambahkan clinical logic tanpa sumber dan review yang sesuai.

Perubahan yang berkaitan dengan aturan klinis atau data pasien memerlukan perhatian dan review tambahan.

---

**Lisensi**

Repository ini saat ini belum menentukan open-source license.

Tanpa lisensi yang sesuai, kode dalam repository tidak boleh diasumsikan bebas untuk digunakan, dimodifikasi, atau didistribusikan kembali.

---

**Disclaimer**

TriagePeace adalah prototype hackathon.

Prototype ini dibuat untuk mendemonstrasikan pendekatan offline-first dalam pengumpulan informasi pasien dan workflow triase.

TriagePeace bukan pengganti penilaian tenaga medis profesional dan tidak boleh digunakan untuk membu
