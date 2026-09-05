import { useTranslation } from '../../lib/i18n'
import {
  WifiOffIcon,
  ClipboardListIcon,
  SaveIcon,
  SignalIcon,
  CloudCheckIcon,
  ArrowDownIcon,
} from './landingIcons'

// The offline -> saved -> reconnected -> synced path, drawn as a diagram rather
// than boxed as a card so it doesn't read as another content tile. The two
// state-change stages (connection lost, connection back) carry a solid fill;
// the steps between them stay quiet ink-on-paper.
const STAGES = [
  { key: 'lp_flow_offline', Icon: WifiOffIcon, tile: 'bg-tag-amber text-white' },
  { key: 'lp_flow_submitted', Icon: ClipboardListIcon, tile: 'border border-line text-ink' },
  { key: 'lp_flow_saved', Icon: SaveIcon, tile: 'border border-line text-ink' },
  { key: 'lp_flow_returns', Icon: SignalIcon, tile: 'bg-brand text-white' },
  { key: 'lp_flow_synced', Icon: CloudCheckIcon, tile: 'bg-tag-green text-white' },
]

export function OfflineSyncFlow() {
  const { t } = useTranslation()

  return (
    <ol role="img" aria-label={t('lp_flow_label')} className="mx-auto w-full max-w-xs">
      {STAGES.map(({ key, Icon, tile }, i) => (
        <li key={key} aria-hidden="true">
          <div className="flex items-center gap-3.5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tile}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">{t(key)}</span>
          </div>
          {i < STAGES.length - 1 && (
            <div className="flex h-6 w-11 items-center justify-center">
              <ArrowDownIcon className="h-4 w-4 text-line" />
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
