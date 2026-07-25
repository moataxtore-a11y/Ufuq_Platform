import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function GlassCard({ children, className, onClick, delay = 0, noHover = false }) {
  const isInteractive = !!onClick && !noHover;
  const Comp = isInteractive ? motion.button : motion.div;
  const buttonProps = isInteractive ? { type: 'button' } : {};

  return (
    <Comp
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={isInteractive ? { y: -3, scale: 1.005 } : {}}
      whileTap={isInteractive ? { scale: 0.985 } : {}}
      {...buttonProps}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/80 dark:bg-white/[0.04] w-full",
        "backdrop-blur-sm shadow-card",
        "border border-slate-200/50 dark:border-white/10",
        isInteractive && [
          "cursor-pointer",
          "hover:shadow-card-hover hover:border-brand/20",
          "dark:hover:bg-white/[0.06] dark:hover:border-brand/15",
          "transition-all duration-200 ease-out",
        ],
        !isInteractive && "transition-shadow duration-200",
        className
      )}
    >
      <div className="relative z-10 w-full h-full p-4 sm:p-5">
        {children}
      </div>
    </Comp>
  )
}
