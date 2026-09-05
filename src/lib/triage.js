export const SYMPTOM_OPTIONS = [
  { key: 'chestPain', label: 'Chest pain or pressure', labelId: 'Nyeri atau tekanan di dada', severity: 'red' },
  { key: 'breathingDifficulty', label: 'Severe difficulty breathing', labelId: 'Kesulitan bernapas parah', severity: 'red' },
  { key: 'heavyBleeding', label: 'Heavy or uncontrolled bleeding', labelId: 'Pendarahan hebat atau tak terkendali', severity: 'red' },
  { key: 'unconscious', label: 'Unconscious or unresponsive', labelId: 'Tidak sadarkan diri atau tidak merespons', severity: 'red' },
  { key: 'stroke', label: 'Sudden weakness, slurred speech, or facial drooping', labelId: 'Kelemahan tiba-tiba, bicara pelo, atau wajah merot', severity: 'red' },
  { key: 'highFever', label: 'High fever (39°C / 102°F or above)', labelId: 'Demam tinggi (39°C / 102°F atau lebih)', severity: 'yellow' },
  { key: 'persistentVomiting', label: 'Persistent vomiting or diarrhea', labelId: 'Muntah atau diare terus-menerus', severity: 'yellow' },
  { key: 'severePain', label: 'Severe pain (any location)', labelId: 'Nyeri hebat (di bagian mana pun)', severity: 'yellow' },
  { key: 'pregnancyComplication', label: 'Pregnancy complication', labelId: 'Komplikasi kehamilan', severity: 'yellow' },
  { key: 'dehydration', label: 'Signs of dehydration', labelId: 'Tanda-tanda dehidrasi', severity: 'yellow' },
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

export const SEVERITY_META = {
  red: {
    label: 'Emergency',
    labelId: 'Darurat',
    order: 0,
    badge: 'bg-tag-red text-white',
    border: 'border-tag-red',
    soft: 'bg-tag-red-soft',
  },
  yellow: {
    label: 'Urgent',
    labelId: 'Mendesak',
    order: 1,
    badge: 'bg-tag-amber text-white',
    border: 'border-tag-amber',
    soft: 'bg-tag-amber-soft',
  },
  green: {
    label: 'Routine',
    labelId: 'Rutin',
    order: 2,
    badge: 'bg-tag-green text-white',
    border: 'border-tag-green',
    soft: 'bg-tag-green-soft',
  },
}
