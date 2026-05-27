import Link from 'next/link'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

export function PrivacyConsentField({ checked, onChange, error }: Props) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-sand-dark"
        />
        <span>
          I agree to the{' '}
          <Link href="/privacy" target="_blank" className="text-brand-600 hover:underline">
            privacy policy
          </Link>{' '}
          and consent to Naturally Beautiful storing my details to manage this appointment.
        </span>
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
