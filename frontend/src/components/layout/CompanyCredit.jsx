import { ExternalLink } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

const COMPANY_URL = 'https://3mtechs.com'

export default function CompanyCredit({ className = '' }) {
  const { isRtl } = useLanguage()

  return (
    <a
      href={COMPANY_URL}
      target="_blank"
      rel="noopener noreferrer"
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`inline-flex items-center gap-1.5 underline decoration-current/50 underline-offset-4 transition-colors hover:decoration-current ${className}`}
    >
      <span>
        {isRtl ? 'تصميم وتنفيذ بواسطة ' : 'Designed & Built by '}
        <bdi dir="ltr">3M Tech</bdi>
      </span>
      <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
    </a>
  )
}
