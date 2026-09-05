import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'triagepeace-lang'

const STRINGS = {
  en: {
    landing_badge: 'Built for care beyond the network',
    landing_title: 'When the internet stops, care should not.',
    landing_description: 'TriagePeace helps field healthcare workers capture patient information offline, triage cases, and sync securely when connectivity returns.',
    landing_tagline: 'Offline-ready symptom intake for clinics with unreliable connectivity.',
    landing_reassurance: 'Designed for field use. Built to keep working when connectivity cannot.',
    landing_preview_label: 'Live workflow',
    landing_preview_title: 'Case handoff',
    landing_preview_status: 'Synced',
    landing_preview_patient: 'Patient',
    landing_preview_patient_name: 'Case #1042',
    landing_preview_case: 'Connection',
    landing_preview_case_status: 'Online',
    landing_preview_triage: 'Triage level',
    landing_preview_severity: 'Priority',
    landing_preview_priority: 'Yellow',
    landing_preview_sync: 'Case synchronized',
    landing_preview_sync_detail: 'Saved locally, then sent when connected',
    landing_preview_sync_state: 'Complete',
    landing_preview_footer: 'Offline-first workflow',
    landing_features_eyebrow: 'Built around the field worker',
    landing_features_title: 'Simple when every second matters.',
    landing_features_description: 'TriagePeace keeps the workflow focused: capture the case, assess urgency, and make the information available to the receiving team.',
    landing_feature_offline_title: 'Works offline',
    landing_feature_offline_body: 'Record patient information on the device even when there is no internet connection.',
    landing_feature_triage_title: 'Structured triage',
    landing_feature_triage_body: 'Use a focused symptom and vital-sign workflow to help organize cases by urgency.',
    landing_feature_sync_title: 'Syncs when connected',
    landing_feature_sync_body: 'Queued submissions synchronize automatically when connectivity returns, keeping the handoff moving.',
    landing_cta_eyebrow: 'Ready for the field',
    landing_cta_title: 'Keep patient information moving.',
    landing_cta_body: 'Start an intake without waiting for a stable connection. TriagePeace is designed around the realities of field care.',
    landing_footer: 'Offline-first triage prototype for healthcare teams.',
    start_intake: 'Submit a case',

    lp_login_short: 'Log in',
    lp_hero_eyebrow: 'Built for care beyond the network',
    lp_hero_title: 'When the internet stops, care should not.',
    lp_hero_subtitle:
      'TriagePeace helps field healthcare workers capture patient information offline, triage cases, and sync securely when connectivity returns.',
    lp_hero_note: 'No account and no signal needed to start an intake.',
    lp_hero_preview_label:
      'A case captured offline, saved on the device, then synced to the clinic queue once the connection returned.',
    lp_preview_caption: 'How a case moves',
    lp_preview_status_offline: 'Offline',
    lp_preview_case: 'Case A-24',
    lp_preview_patient: 'Adult, 34',
    lp_preview_reported: 'Reported',
    lp_preview_symptom_1: 'Chest pain',
    lp_preview_symptom_2: 'Shortness of breath',
    lp_preview_status_synced: 'Synced',
    lp_preview_step_captured: 'Captured on device',
    lp_preview_step_queued: 'Held offline on device',
    lp_preview_step_synced: 'Synced to the clinic queue',
    lp_preview_time_captured: '14:02',
    lp_preview_time_synced: '14:47',
    lp_preview_queue: 'Clinic queue',
    lp_preview_queue_item: 'New case received',

    lp_value_eyebrow: 'The idea',
    lp_value_heading: 'Simple when every second matters.',
    lp_value_subtitle:
      'TriagePeace is designed around the field worker, not the technology. Every screen assumes a weak signal, a hurried moment, and a phone held in one hand.',
    lp_feature_offline_title: 'Works offline',
    lp_feature_offline_body: 'Patient information can be captured even without an internet connection.',
    lp_feature_triage_title: 'Structured triage',
    lp_feature_triage_body:
      'The intake workflow helps organize important symptoms and clinical information by urgency.',
    lp_feature_sync_title: 'Syncs when connected',
    lp_feature_sync_body: 'Queued submissions synchronize automatically when connectivity returns.',

    lp_workflow_eyebrow: 'How it works',
    lp_workflow_heading: 'From the first question to a clinic that can act.',
    lp_workflow_subtitle:
      'Five steps carry a case from the field to the triage queue. The connection can drop at any point without losing the work.',
    lp_step_capture_title: 'Capture',
    lp_step_capture_body: "Record the patient's information.",
    lp_step_triage_title: 'Triage',
    lp_step_triage_body: 'Identify the urgency of the case.',
    lp_step_save_title: 'Save',
    lp_step_save_body: 'If offline, the submission is safely kept on the device.',
    lp_step_sync_title: 'Sync',
    lp_step_sync_body: 'When connectivity returns, the case is synchronized.',
    lp_step_respond_title: 'Respond',
    lp_step_respond_body: 'The clinic can see and handle the case.',

    lp_offline_eyebrow: 'Offline-first',
    lp_offline_heading: 'Healthcare should not depend on a signal bar.',
    lp_offline_body:
      'The connection can drop at any point in a visit. TriagePeace keeps the intake moving and closes the loop the moment a signal returns — no lost forms, no re-entry, no waiting for a good connection to help someone.',
    lp_flow_offline: 'Offline',
    lp_flow_submitted: 'Patient form submitted',
    lp_flow_saved: 'Saved locally',
    lp_flow_returns: 'Connection returns',
    lp_flow_synced: 'Automatically synchronized',
    lp_flow_label:
      'While offline, a submitted patient form is saved locally; when the connection returns it is synchronized automatically.',

    lp_trust_eyebrow: 'Responsibility',
    lp_trust_heading: 'A workflow tool, with clinicians in charge.',
    lp_trust_body:
      'TriagePeace helps organize patient information and prioritize cases. Clinical decisions remain with qualified healthcare professionals. It is a decision-support and workflow prototype — not a diagnostic device, and not a substitute for in-person assessment.',

    lp_final_heading: 'Keep patient information moving.',
    lp_final_body: 'Start an intake without waiting for a stable connection.',

    intake_title: 'Symptom Intake',
    intake_subtitle: "Works offline. Submissions sync automatically once you're back online.",
    saved: 'Saved.',
    sent_immediately: 'Sent to the clinic immediately.',
    saved_offline: 'Saved on this device — will sync when online.',
    patient_name: 'Full name',
    optional: 'Optional',
    age: 'Age',
    address: 'Address',
    symptoms_label: 'Symptoms (select all that apply)',
    group_emergency: 'Emergency signs',
    group_other: 'Other symptoms to note',
    notes: 'Notes',
    notes_placeholder: 'Anything else the clinic should know',
    saving: 'Saving…',
    submit: 'Submit',
    health_worker_login: 'Health worker login',

    section_patient_info: 'Patient info',
    section_complaint_history: 'Complaint & history',
    section_vitals: 'Vital signs',
    section_consciousness: 'Consciousness',
    section_primary_survey: 'Primary survey',
    section_medical_history: 'Medical history',

    blood_pressure_label: 'Blood pressure (mmHg)',
    complaint_history_label: 'Chief complaint / history of symptoms',
    complaint_history_placeholder: "What's wrong, when it started, how it has changed",
    systolic_bp: 'Systolic (mmHg)',
    diastolic_bp: 'Diastolic (mmHg)',
    pulse_rate: 'Pulse rate (bpm)',
    respiratory_rate: 'Respiratory rate (breaths/min)',
    body_temperature: 'Temperature (°C)',
    oxygen_saturation: 'Oxygen saturation (%)',
    consciousness_scale_label: 'Scale used',
    gcs_score_label: 'GCS score (3–15)',
    avpu_label: 'AVPU',
    airway_label: 'Airway',
    breathing_label: 'Breathing',
    circulation_label: 'Circulation',
    bleeding_trauma_label: 'Bleeding or signs of trauma',
    bleeding_trauma_notes_placeholder: 'Describe the bleeding/trauma',
    drug_allergies: 'Drug allergies',
    comorbidities: 'Comorbidities',
    current_medications: 'Current medications',
    family_aware_hint: 'If the patient or family knows, they can share it',

    value_out_of_range: (min, max) => `Must be between ${min} and ${max}`,

    view_history: 'View history',
    hide_history: 'Hide history',
    status_pending: 'Pending',
    status_resolved_label: 'Resolved',
    deleted_event_label: 'Deleted',
    unknown_actor: 'Unknown',

    avpu_alert: 'Alert',
    avpu_voice: 'Voice',
    avpu_pain: 'Pain',
    avpu_unresponsive: 'Unresponsive',
    status_normal: 'Normal',
    status_compromised: 'Compromised',

    clinic_login: 'Clinic Login',
    clinic_login_subtitle: 'Health worker access to the triage queue.',
    email: 'Email',
    password: 'Password',
    signing_in: 'Signing in…',
    sign_in: 'Sign in',

    active_cases: (n) => `${n} active case(s)`,
    tab_active: 'Active',
    tab_resolved: 'Resolved',
    tab_list: 'List',
    tab_map: 'Map',
    search_placeholder: 'Search name, symptoms, notes…',
    no_matching_cases: 'No matching cases.',
    no_resolved_cases: 'No resolved cases yet.',
    no_located_cases: 'No located cases yet.',
    select_case: 'Select a case to see the full details.',
    symptoms_heading: 'Symptoms',
    notes_heading: 'Notes',
    location_heading: 'Location',
    submitted_at: (d) => `Submitted ${d}`,
    resolved_at_label: (d) => `Resolved ${d}`,
    in_progress: 'In progress',
    resolve: 'Resolve',
    reopen_case: 'Reopen case',
    delete_case: 'Delete case',
    delete_confirm_prompt: "Delete this case permanently? This can't be undone.",
    confirm_delete: 'Yes, delete',
    cancel: 'Cancel',
    back: 'Back',
    back_to_queue: 'Back to queue',
    unnamed_patient: 'Unnamed patient',
    no_symptoms_recorded: 'No symptoms recorded',

    location_captured: '📍 Location attached.',
    location_denied: 'Location not attached — this browser/device blocked the location request. Enable location for this site to include it next time.',
    location_unavailable: "Location not attached — this device couldn't get a fix. On Windows, check Settings → Privacy & security → Location is turned on (a separate setting from the browser's own permission).",
    location_timeout: 'Location not attached — the lookup took too long. A weak Wi-Fi/network signal can cause this; it may work on retry.',

    alert_me_for: 'Alert me for:',
    alert_me_for_on: 'Alert me for:',
    alerts_on: 'On',
    enabling_alerts: 'Enabling…',
    notifications_blocked: 'Notifications blocked in browser settings',
    enable_alerts: 'Enable alerts',

    offline_banner: "You're offline — submissions are being saved on this device.",
    syncing: 'Syncing saved submissions…',
    pending_sync: (n) => `${n} submission(s) waiting to sync…`,

    sign_out: 'Sign out',
    notification_settings: 'Notification settings',

    settings_title: 'Settings',
    language_label: 'Language',
    appearance_label: 'Appearance',
    dark_mode: 'Dark mode',
    light_mode: 'Light mode',

    analytics_title: 'Trends',
    case_volume_heading: 'Case volume (last 14 days)',
    severity_mix_heading: 'Severity mix',
    symptom_frequency_heading: 'Symptom frequency',
    no_trend_data: 'No cases in the last 14 days yet.',
  },
  id: {
    landing_badge: 'Dibuat untuk layanan di luar jaringan',
    landing_title: 'Saat internet terhenti, pelayanan tidak boleh ikut terhenti.',
    landing_description: 'TriagePeace membantu petugas kesehatan lapangan mencatat informasi pasien secara offline, melakukan triase, dan menyinkronkannya saat koneksi kembali tersedia.',
    landing_tagline: 'Formulir gejala yang bisa dipakai tanpa internet, untuk klinik dengan koneksi tidak stabil.',
    landing_reassurance: 'Dirancang untuk lapangan. Tetap bekerja saat koneksi tidak bisa diandalkan.',
    landing_preview_label: 'Alur langsung',
    landing_preview_title: 'Serah terima kasus',
    landing_preview_status: 'Tersinkron',
    landing_preview_patient: 'Pasien',
    landing_preview_patient_name: 'Kasus #1042',
    landing_preview_case: 'Koneksi',
    landing_preview_case_status: 'Online',
    landing_preview_triage: 'Tingkat triase',
    landing_preview_severity: 'Prioritas',
    landing_preview_priority: 'Kuning',
    landing_preview_sync: 'Kasus tersinkron',
    landing_preview_sync_detail: 'Disimpan lokal, lalu dikirim saat terhubung',
    landing_preview_sync_state: 'Selesai',
    landing_preview_footer: 'Alur offline-first',
    landing_features_eyebrow: 'Dibuat untuk petugas lapangan',
    landing_features_title: 'Sederhana saat setiap detik berarti.',
    landing_features_description: 'TriagePeace menjaga alur tetap fokus: catat kasus, nilai urgensi, dan buat informasi tersedia untuk tim penerima.',
    landing_feature_offline_title: 'Tetap bekerja offline',
    landing_feature_offline_body: 'Catat informasi pasien di perangkat meski tidak ada koneksi internet.',
    landing_feature_triage_title: 'Triase terstruktur',
    landing_feature_triage_body: 'Gunakan alur gejala dan tanda vital yang terfokus untuk membantu mengelompokkan kasus berdasarkan urgensi.',
    landing_feature_sync_title: 'Sinkron saat terhubung',
    landing_feature_sync_body: 'Data yang antre otomatis disinkronkan saat koneksi kembali, sehingga serah terima tetap berjalan.',
    landing_cta_eyebrow: 'Siap untuk lapangan',
    landing_cta_title: 'Jaga informasi pasien tetap bergerak.',
    landing_cta_body: 'Mulai formulir tanpa menunggu koneksi stabil. TriagePeace dirancang untuk kondisi nyata layanan kesehatan lapangan.',
    landing_footer: 'Prototipe triase offline-first untuk tim kesehatan.',
    start_intake: 'Isi formulir kasus',

    lp_login_short: 'Masuk',
    lp_hero_eyebrow: 'Dibuat untuk layanan di luar jangkauan jaringan',
    lp_hero_title: 'Saat internet berhenti, layanan tidak boleh berhenti.',
    lp_hero_subtitle:
      'TriagePeace membantu petugas kesehatan lapangan mencatat data pasien secara offline, memilah kasus berdasarkan urgensi, dan menyinkronkannya dengan aman saat koneksi kembali.',
    lp_hero_note: 'Tanpa akun dan tanpa sinyal untuk mulai mencatat kasus.',
    lp_hero_preview_label:
      'Sebuah kasus dicatat saat offline, disimpan di perangkat, lalu tersinkron ke antrean klinik begitu koneksi kembali.',
    lp_preview_caption: 'Perjalanan sebuah kasus',
    lp_preview_status_offline: 'Offline',
    lp_preview_case: 'Kasus A-24',
    lp_preview_patient: 'Dewasa, 34',
    lp_preview_reported: 'Dilaporkan',
    lp_preview_symptom_1: 'Nyeri dada',
    lp_preview_symptom_2: 'Sesak napas',
    lp_preview_status_synced: 'Tersinkron',
    lp_preview_step_captured: 'Dicatat di perangkat',
    lp_preview_step_queued: 'Ditahan offline di perangkat',
    lp_preview_step_synced: 'Tersinkron ke antrean klinik',
    lp_preview_time_captured: '14.02',
    lp_preview_time_synced: '14.47',
    lp_preview_queue: 'Antrean klinik',
    lp_preview_queue_item: 'Kasus baru diterima',

    lp_value_eyebrow: 'Gagasannya',
    lp_value_heading: 'Sederhana saat setiap detik menentukan.',
    lp_value_subtitle:
      'TriagePeace dirancang mengikuti petugas lapangan, bukan teknologinya. Setiap layar mengasumsikan sinyal lemah, waktu yang mepet, dan ponsel yang dipegang satu tangan.',
    lp_feature_offline_title: 'Berfungsi tanpa internet',
    lp_feature_offline_body: 'Data pasien tetap bisa dicatat walau tidak ada koneksi internet.',
    lp_feature_triage_title: 'Triase terstruktur',
    lp_feature_triage_body:
      'Alur pencatatan membantu menata gejala penting dan informasi klinis berdasarkan tingkat urgensi.',
    lp_feature_sync_title: 'Sinkron saat terhubung',
    lp_feature_sync_body: 'Data yang mengantre tersinkron otomatis begitu koneksi kembali.',

    lp_workflow_eyebrow: 'Cara kerjanya',
    lp_workflow_heading: 'Dari pertanyaan pertama hingga klinik yang siap bertindak.',
    lp_workflow_subtitle:
      'Lima langkah membawa sebuah kasus dari lapangan ke antrean triase. Koneksi boleh terputus kapan saja tanpa kehilangan pekerjaan.',
    lp_step_capture_title: 'Catat',
    lp_step_capture_body: 'Rekam data pasien.',
    lp_step_triage_title: 'Pilah',
    lp_step_triage_body: 'Kenali tingkat urgensi kasus.',
    lp_step_save_title: 'Simpan',
    lp_step_save_body: 'Jika offline, data disimpan dengan aman di perangkat.',
    lp_step_sync_title: 'Sinkron',
    lp_step_sync_body: 'Saat koneksi kembali, kasus disinkronkan.',
    lp_step_respond_title: 'Tanggapi',
    lp_step_respond_body: 'Klinik dapat melihat dan menangani kasus.',

    lp_offline_eyebrow: 'Mengutamakan mode offline',
    lp_offline_heading: 'Layanan kesehatan tak seharusnya bergantung pada indikator sinyal.',
    lp_offline_body:
      'Koneksi bisa terputus kapan saja saat kunjungan. TriagePeace menjaga proses pencatatan tetap berjalan dan menuntaskannya begitu sinyal kembali — tanpa formulir hilang, tanpa input ulang, tanpa menunggu koneksi bagus untuk menolong seseorang.',
    lp_flow_offline: 'Offline',
    lp_flow_submitted: 'Formulir pasien dikirim',
    lp_flow_saved: 'Tersimpan di perangkat',
    lp_flow_returns: 'Koneksi kembali',
    lp_flow_synced: 'Tersinkron otomatis',
    lp_flow_label:
      'Saat offline, formulir pasien yang dikirim disimpan di perangkat; ketika koneksi kembali, data tersinkron otomatis.',

    lp_trust_eyebrow: 'Tanggung jawab',
    lp_trust_heading: 'Alat bantu alur kerja, dengan tenaga klinis sebagai penentu.',
    lp_trust_body:
      'TriagePeace membantu menata data pasien dan memprioritaskan kasus. Keputusan klinis tetap berada di tangan tenaga kesehatan yang berkompeten. Ini adalah prototipe pendukung keputusan dan alur kerja — bukan alat diagnostik, dan bukan pengganti pemeriksaan langsung.',

    lp_final_heading: 'Jaga data pasien tetap mengalir.',
    lp_final_body: 'Mulai pencatatan tanpa menunggu koneksi stabil.',

    intake_title: 'Formulir Gejala',
    intake_subtitle: 'Berfungsi tanpa internet. Data akan tersinkron otomatis saat kembali online.',
    saved: 'Tersimpan.',
    sent_immediately: 'Langsung terkirim ke klinik.',
    saved_offline: 'Tersimpan di perangkat ini — akan tersinkron saat online.',
    patient_name: 'Nama lengkap',
    optional: 'Opsional',
    age: 'Usia',
    address: 'Alamat',
    symptoms_label: 'Gejala (pilih semua yang sesuai)',
    group_emergency: 'Tanda darurat',
    group_other: 'Gejala lain yang perlu dicatat',
    notes: 'Catatan',
    notes_placeholder: 'Informasi lain yang perlu diketahui klinik',
    saving: 'Menyimpan…',
    submit: 'Kirim',
    health_worker_login: 'Masuk sebagai petugas kesehatan',

    section_patient_info: 'Info pasien',
    section_complaint_history: 'Keluhan & riwayat',
    section_vitals: 'Tanda vital',
    section_consciousness: 'Kesadaran',
    section_primary_survey: 'Survei primer',
    section_medical_history: 'Riwayat medis',

    blood_pressure_label: 'Tekanan darah (mmHg)',
    complaint_history_label: 'Keluhan utama / riwayat gejala',
    complaint_history_placeholder: 'Apa yang dirasakan, sejak kapan, bagaimana perkembangannya',
    systolic_bp: 'Sistolik (mmHg)',
    diastolic_bp: 'Diastolik (mmHg)',
    pulse_rate: 'Denyut nadi (bpm)',
    respiratory_rate: 'Laju napas (napas/menit)',
    body_temperature: 'Suhu tubuh (°C)',
    oxygen_saturation: 'Saturasi oksigen (%)',
    consciousness_scale_label: 'Skala yang digunakan',
    gcs_score_label: 'Skor GCS (3–15)',
    avpu_label: 'AVPU',
    airway_label: 'Jalan napas',
    breathing_label: 'Pernapasan',
    circulation_label: 'Sirkulasi',
    bleeding_trauma_label: 'Ada pendarahan atau tanda trauma',
    bleeding_trauma_notes_placeholder: 'Jelaskan pendarahan/traumanya',
    drug_allergies: 'Alergi obat',
    comorbidities: 'Penyakit penyerta',
    current_medications: 'Obat yang sedang dikonsumsi',
    family_aware_hint: 'Jika pasien atau keluarga tahu, boleh diisi',

    value_out_of_range: (min, max) => `Harus di antara ${min} dan ${max}`,

    view_history: 'Lihat riwayat',
    hide_history: 'Sembunyikan riwayat',
    status_pending: 'Menunggu',
    status_resolved_label: 'Selesai',
    deleted_event_label: 'Dihapus',
    unknown_actor: 'Tidak diketahui',

    avpu_alert: 'Sadar penuh',
    avpu_voice: 'Respons suara',
    avpu_pain: 'Respons nyeri',
    avpu_unresponsive: 'Tidak respons',
    status_normal: 'Normal',
    status_compromised: 'Terganggu',

    clinic_login: 'Masuk Klinik',
    clinic_login_subtitle: 'Akses petugas kesehatan ke antrean triase.',
    email: 'Email',
    password: 'Kata sandi',
    signing_in: 'Sedang masuk…',
    sign_in: 'Masuk',

    active_cases: (n) => `${n} kasus aktif`,
    tab_active: 'Aktif',
    tab_resolved: 'Selesai',
    tab_list: 'Daftar',
    tab_map: 'Peta',
    search_placeholder: 'Cari nama, gejala, catatan…',
    no_matching_cases: 'Tidak ada kasus yang cocok.',
    no_resolved_cases: 'Belum ada kasus yang selesai.',
    no_located_cases: 'Belum ada kasus dengan lokasi.',
    select_case: 'Pilih pasien untuk melihat detail lengkap.',
    symptoms_heading: 'Gejala',
    notes_heading: 'Catatan',
    location_heading: 'Lokasi',
    submitted_at: (d) => `Dikirim ${d}`,
    resolved_at_label: (d) => `Selesai ${d}`,
    in_progress: 'Sedang ditangani',
    resolve: 'Selesaikan',
    reopen_case: 'Buka kembali',
    delete_case: 'Hapus kasus',
    delete_confirm_prompt: 'Hapus kasus ini secara permanen? Tindakan ini tidak dapat dibatalkan.',
    confirm_delete: 'Ya, hapus',
    cancel: 'Batal',
    back: 'Kembali',
    back_to_queue: 'Kembali ke antrean',
    unnamed_patient: 'Pasien tanpa nama',
    no_symptoms_recorded: 'Tidak ada gejala tercatat',

    location_captured: '📍 Lokasi terlampir.',
    location_denied: 'Lokasi tidak terlampir — browser/perangkat ini memblokir permintaan lokasi. Aktifkan izin lokasi untuk situs ini agar tersertakan lain kali.',
    location_unavailable: 'Lokasi tidak terlampir — perangkat ini tidak dapat menentukan posisi. Di Windows, periksa Settings → Privacy & security → Location sudah aktif (pengaturan terpisah dari izin browser).',
    location_timeout: 'Lokasi tidak terlampir — proses pencarian terlalu lama. Sinyal Wi-Fi/jaringan yang lemah bisa menyebabkan ini; coba lagi.',

    alert_me_for: 'Ingatkan saya untuk:',
    alert_me_for_on: 'Ingatkan saya untuk:',
    alerts_on: 'Aktif',
    enabling_alerts: 'Mengaktifkan…',
    notifications_blocked: 'Notifikasi diblokir di pengaturan browser',
    enable_alerts: 'Aktifkan notifikasi',

    offline_banner: 'Anda sedang offline — data disimpan di perangkat ini.',
    syncing: 'Menyinkronkan data tersimpan…',
    pending_sync: (n) => `${n} data menunggu sinkronisasi…`,

    sign_out: 'Keluar',
    notification_settings: 'Pengaturan notifikasi',

    settings_title: 'Pengaturan',
    language_label: 'Bahasa',
    appearance_label: 'Tampilan',
    dark_mode: 'Mode gelap',
    light_mode: 'Mode terang',

    analytics_title: 'Tren',
    case_volume_heading: 'Jumlah kasus (14 hari terakhir)',
    severity_mix_heading: 'Komposisi tingkat keparahan',
    symptom_frequency_heading: 'Frekuensi gejala',
    no_trend_data: 'Belum ada kasus dalam 14 hari terakhir.',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'id') return stored
    } catch {
      // ignore
    }
    return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en'
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [lang])

  const toggleLang = () => setLang((l) => (l === 'en' ? 'id' : 'en'))

  return <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within a LanguageProvider')
  const { lang, toggleLang } = ctx
  const t = (key, ...args) => {
    const entry = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
    return typeof entry === 'function' ? entry(...args) : entry
  }
  return { t, lang, toggleLang }
}

export function pick(en, id, lang) {
  return lang === 'id' && id ? id : en
}
