import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function PremiumButton({ children, onClick, icon: Icon, variant = 'primary', className, disabled, type = 'button' }) {
  const isPrimary = variant === 'primary'
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      className={cn(
        "relative group overflow-hidden rounded-2xl px-6 py-3 font-bold text-sm flex items-center justify-center gap-2 transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        isPrimary 
          ? "text-black shadow-glow-brand hover:shadow-glow-brand-lg" 
          : "text-slate-800 dark:text-white border border-slate-300 dark:border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-white/10",
        className
      )}
    >
      {/* Dynamic Background */}
      {isPrimary && (
        <span className="absolute inset-0 bg-gradient-to-r from-brand to-brand-300 z-0" />
      )}
      
      {/* Shine Effect */}
      {isPrimary && !disabled && (
        <span className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[45deg] group-hover:animate-shimmer z-10" />
      )}

      {/* Content */}
      <span className="relative z-20 flex items-center justify-center gap-2">
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </span>
    </motion.button>
  )
}
