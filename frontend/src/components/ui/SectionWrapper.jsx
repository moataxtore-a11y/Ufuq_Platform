export default function SectionWrapper({
  id,
  className = '',
  centerHeader = false,
  title,
  titleClassName = '',
  titleDecoration,
  subtitle,
  subtitleClassName = '',
  action,
  children
}) {
  return (
    <section id={id} className={'mt-8 scroll-mt-[68px] sm:scroll-mt-[72px] md:scroll-mt-[76px] ' + className}>
      {title || subtitle || action ? (
        <div
          className={
            (centerHeader
              ? 'flex flex-col items-center text-center gap-2 mb-4'
              : 'flex sm:flex-row flex-col sm:justify-between sm:items-end gap-2 mb-4')
          }
        >
          <div className={centerHeader ? 'w-full' : ''}>
            {title ? (
              <>
                <h2 className={(titleClassName || 'font-semibold text-slate-800 dark:text-slate-100 text-lg')}>{title}</h2>
                {titleDecoration ? <div className="mt-2">{titleDecoration}</div> : null}
              </>
            ) : null}
            {subtitle ? (
              <p className={subtitleClassName || 'mt-1 text-slate-600 dark:text-slate-300 text-sm'}>{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
