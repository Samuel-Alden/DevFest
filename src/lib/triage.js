export const SYMPTOM_OPTIONS = [
  { key: 'chestPain', label: 'Chest pain or pressure', labelId: 'Nyeri atau tekanan di dada', severity: 'red' },
  { key: 'breathingDifficulty', label: 'Severe difficulty breathing', labelId: 'Kesulitan bernapas parah', severity: 'red' },
  { key: 'heavyBleeding', label: 'Heavy or uncontrolled bleeding', labelId: 'Pendarahan hebat atau tak terkendali', severity: 'red' },
  { key: 'unconscious', label: 'Unconscious or unresponsive', labelId: 'Tidak sadarkan diri atau tidak merespons', severity: 'red' },
  { key: 'stroke', label: 'Sudden weakness, slurred speech, or facial drooping', labelId: 'Kelemahan tiba-tiba, bicara pelo, atau wajah merot', severity: 'red' },
  { key: 'seizure', label: 'Seizure or convulsions', labelId: 'Kejang', severity: 'red' },
  { key: 'severeAllergicReaction', label: 'Severe allergic reaction (swelling, hives with breathing trouble)', labelId: 'Reaksi alergi berat (bengkak, biduran disertai sesak napas)', severity: 'red' },
  { key: 'poisoning', label: 'Suspected poisoning or overdose', labelId: 'Dugaan keracunan atau overdosis', severity: 'red' },
  { key: 'severeBurn', label: 'Severe burn (large area or face/airway)', labelId: 'Luka bakar berat (area luas atau wajah/saluran napas)', severity: 'red' },
  { key: 'headInjury', label: 'Head injury with confusion or vomiting', labelId: 'Cedera kepala disertai bingung atau muntah', severity: 'red' },
  { key: 'highFever', label: 'High fever (39°C / 102°F or above)', labelId: 'Demam tinggi (39°C / 102°F atau lebih)', severity: 'yellow' },
  { key: 'persistentVomiting', label: 'Persistent vomiting or diarrhea', labelId: 'Muntah atau diare terus-menerus', severity: 'yellow' },
  { key: 'severePain', label: 'Severe pain (any location)', labelId: 'Nyeri hebat (di bagian mana pun)', severity: 'yellow' },
  { key: 'pregnancyComplication', label: 'Pregnancy complication', labelId: 'Komplikasi kehamilan', severity: 'yellow' },
  { key: 'dehydration', label: 'Signs of dehydration', labelId: 'Tanda-tanda dehidrasi', severity: 'yellow' },
  { key: 'moderateBurn', label: 'Moderate burn (small area)', labelId: 'Luka bakar sedang (area kecil)', severity: 'yellow' },
  { key: 'fracture', label: 'Suspected fracture or deep wound', labelId: 'Dugaan patah tulang atau luka dalam', severity: 'yellow' },
  { key: 'animalBite', label: 'Animal or insect bite/sting', labelId: 'Gigitan atau sengatan hewan/serangga', severity: 'yellow' },
  { key: 'persistentCough', label: 'Persistent cough (more than 2 weeks)', labelId: 'Batuk terus-menerus (lebih dari 2 minggu)', severity: 'yellow' },
  { key: 'rash', label: 'Rash or skin infection', labelId: 'Ruam atau infeksi kulit', severity: 'yellow' },
]

const SEVERITY_RANK = { red: 3, yellow: 2, green: 1 }

export function computeSeverity(selectedSymptomKeys) {
  let worst = 'green'
  for (const key of selectedSymptomKeys) {
    const option = SYMPTOM_OPTIONS.find((o) => o.key === key)
    if (option && SEVERITY_RANK[option.severity] > SEVERITY_RANK[worst]) {
      worst = option.severity
    }
  }
  return worst
}

// Separate from computeSeverity() so the symptom checklist's worst-tag-wins
// logic stays untouched -- this only ever pushes severity UP to red on top
// of whatever the symptoms already computed, it never lowers it. Every field
// here is optional (a field worker without a BP cuff just leaves it blank),
// so null/undefined never trigger anything -- only an explicit out-of-range
// number or an explicit 'compromised'/non-alert selection does. Thresholds
// are deliberately coarse (a single red/no-escalation line, not a 3-tier
// scale) to keep the mental model simple, same spirit as the symptom list's
// worst-wins rule.
export function assessmentEscalatesSeverity(assessment = {}) {
  const {
    consciousnessScale,
    gcsScore,
    avpuLevel,
    airwayStatus,
    breathingStatus,
    circulationStatus,
    bleedingTrauma,
    oxygenSaturation,
    respiratoryRate,
    pulseRate,
    bodyTemperature,
    systolicBp,
  } = assessment

  if (consciousnessScale === 'avpu' && avpuLevel != null && avpuLevel !== 'alert') return true
  if (consciousnessScale === 'gcs' && gcsScore != null && gcsScore < 15) return true
  if (airwayStatus === 'compromised' || breathingStatus === 'compromised' || circulationStatus === 'compromised') return true
  if (bleedingTrauma === true) return true
  if (oxygenSaturation != null && oxygenSaturation < 90) return true
  if (respiratoryRate != null && (respiratoryRate < 10 || respiratoryRate > 30)) return true
  if (pulseRate != null && (pulseRate < 40 || pulseRate > 130)) return true
  // Deliberately higher than the highFever symptom checkbox's 39°C, so an
  // objectively measured hyperpyrexia reads as red while the patient-reported
  // "high fever" checkbox alone still reads as yellow.
  if (bodyTemperature != null && (bodyTemperature >= 39.5 || bodyTemperature <= 35)) return true
  if (systolicBp != null && (systolicBp < 90 || systolicBp > 180)) return true

  return false
}

export const SEVERITY_HEX = { red: '#b3382c', yellow: '#b8791e', green: '#3d7247' }

export const SEVERITY_META = {
  red: {
    label: 'Immediate',
    labelId: 'Kritis',
    order: 0,
    badge: 'bg-tag-red text-white',
    border: 'border-tag-red',
    soft: 'bg-tag-red-soft',
  },
  yellow: {
    label: 'Delayed',
    labelId: 'Serius',
    order: 1,
    badge: 'bg-tag-amber text-white',
    border: 'border-tag-amber',
    soft: 'bg-tag-amber-soft',
  },
  green: {
    label: 'Minor',
    labelId: 'Ringan',
    order: 2,
    badge: 'bg-tag-green text-white',
    border: 'border-tag-green',
    soft: 'bg-tag-green-soft',
  },
}
