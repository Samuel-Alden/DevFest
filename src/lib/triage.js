export const SYMPTOM_OPTIONS = [
  { key: 'chestPain', label: 'Chest pain or pressure', severity: 'red' },
  { key: 'breathingDifficulty', label: 'Severe difficulty breathing', severity: 'red' },
  { key: 'heavyBleeding', label: 'Heavy or uncontrolled bleeding', severity: 'red' },
  { key: 'unconscious', label: 'Unconscious or unresponsive', severity: 'red' },
  { key: 'stroke', label: 'Sudden weakness, slurred speech, or facial drooping', severity: 'red' },
  { key: 'highFever', label: 'High fever (39°C / 102°F or above)', severity: 'yellow' },
  { key: 'persistentVomiting', label: 'Persistent vomiting or diarrhea', severity: 'yellow' },
  { key: 'severePain', label: 'Severe pain (any location)', severity: 'yellow' },
  { key: 'pregnancyComplication', label: 'Pregnancy complication', severity: 'yellow' },
  { key: 'dehydration', label: 'Signs of dehydration', severity: 'yellow' },
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
  red: { label: 'Emergency', order: 0, badge: 'bg-red-600 text-white', border: 'border-red-500' },
  yellow: { label: 'Urgent', order: 1, badge: 'bg-yellow-500 text-black', border: 'border-yellow-500' },
  green: { label: 'Routine', order: 2, badge: 'bg-green-600 text-white', border: 'border-green-500' },
}
