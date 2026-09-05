import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'triagepeace-lang'

const STRINGS = {
  en: {
    landing_tagline: 'Offline-ready symptom intake for clinics with unreliable connectivity.',
    start_intake: 'Submit a case',

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
    alert_me_for_on: '🔔 Alert me for:',
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
    landing_tagline: 'Formulir gejala yang bisa dipakai tanpa internet, untuk klinik dengan koneksi tidak stabil.',
    start_intake: 'Isi formulir kasus',

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
    select_case: 'Pilih kasus untuk melihat detail lengkap.',
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
    alert_me_for_on: '🔔 Ingatkan saya untuk:',
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

// For picking a localized field stored inline on data (e.g. SYMPTOM_OPTIONS).
export function pick(en, id, lang) {
  return lang === 'id' && id ? id : en
}
