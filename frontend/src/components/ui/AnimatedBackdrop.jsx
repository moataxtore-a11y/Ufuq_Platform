import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../utils/cn.js'

export default function AnimatedBackdrop({ className }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 dark:from-[#0f0f0f] via-white dark:via-[#121212] dark:to-[#0b0b0b] to-accent-50" />

      <motion.div
        className="-top-24 -left-24 absolute bg-cyan-200/35 dark:bg-cyan-400/10 blur-3xl rounded-full w-80 h-80"
        animate={reduceMotion ? undefined : { x: [0, 18, 0], y: [0, 12, 0], opacity: [0.55, 0.75, 0.55] }}
        transition={reduceMotion ? undefined : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="-right-24 -bottom-24 absolute bg-purple-200/30 dark:bg-purple-400/10 blur-3xl rounded-full w-96 h-96"
        animate={reduceMotion ? undefined : { x: [0, -14, 0], y: [0, -10, 0], opacity: [0.5, 0.7, 0.5] }}
        transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="top-12 left-1/2 absolute bg-primary-200/20 dark:bg-primary/10 blur-3xl rounded-full w-72 h-72 -translate-x-1/2"
        animate={reduceMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.35, 0.55, 0.35] }}
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
