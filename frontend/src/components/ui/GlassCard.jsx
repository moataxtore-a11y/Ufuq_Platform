import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function GlassCard({ children, className, onClick, delay = 0, noHover = false }) {
  const isInteractive = !!onClick && !noHover;
  
  const Comp = isInteractive ? motion.button : motion.div;
  const buttonProps = isInteractive ? { type: 'button' } : {};

  return (
    <Comp
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={isInteractive ? { y: -4, scale: 1.01 } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      {...buttonProps}
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] sm:rounded-3xl",
        "bg-white/80 dark:bg-white/[0.04] w-full",
        "backdrop-blur-glass shadow-glass-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "border border-slate-200/50 dark:border-white/10",
        isInteractive && "cursor-pointer hover:bg-white/90 dark:hover:bg-white/[0.08] hover:border-brand/30 hover:shadow-glow-brand transition-all duration-300",
        className
      )}
    >
      <div className="relative z-10 w-full h-full p-4 sm:p-6">
        {children}
      </div>
    </Comp>
  )
}
