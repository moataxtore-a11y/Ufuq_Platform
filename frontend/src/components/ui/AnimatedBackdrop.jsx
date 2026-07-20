import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../utils/cn.js'

export default function AnimatedBackdrop({ className }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} aria-hidden="true">
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,148,132,0.06)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_top,rgba(6,148,132,0.04)_0%,transparent_50%)]" />

      <motion.div
        className="top-[-10%] left-[-10%] absolute bg-brand/10 dark:bg-brand/[0.07] blur-[120px] rounded-full w-[50%] h-[50%]"
        animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
        transition={reduceMotion ? undefined : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="right-[-10%] bottom-[-10%] absolute bg-brand/10 dark:bg-brand/[0.06] blur-[100px] rounded-full w-[40%] h-[40%]"
        animate={reduceMotion ? undefined : { x: [0, -20, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
        transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="top-[30%] left-[20%] absolute bg-white/40 dark:bg-white/[0.02] blur-[90px] rounded-full w-[30%] h-[30%]"
        animate={reduceMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={reduceMotion ? undefined : { duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="top-[18%] left-[12%] absolute bg-primary/25 dark:bg-primary/15 rounded-full w-2 h-2" />
      <div className="top-[32%] left-[18%] absolute bg-accent/25 dark:bg-accent/15 rounded-full w-1.5 h-1.5" />
      <div className="top-[26%] right-[14%] absolute bg-cyan-500/20 dark:bg-cyan-400/10 rounded-full w-2 h-2" />
      <div className="top-[42%] right-[20%] absolute bg-primary/25 dark:bg-primary/15 rounded-full w-1.5 h-1.5" />
      <div className="bottom-[18%] left-[30%] absolute bg-accent/20 dark:bg-accent/12 rounded-full w-2 h-2" />
      <div className="right-[32%] bottom-[14%] absolute bg-primary/20 dark:bg-primary/12 rounded-full w-1.5 h-1.5" />
    </div>
  )
}
