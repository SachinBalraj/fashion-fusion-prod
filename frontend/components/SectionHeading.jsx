import { motion } from 'framer-motion';

export default function SectionHeading({
  title,
  subtitle,
  light = false,
  center = true,
  gold = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${center ? 'text-center' : 'text-left'}`}
    >
      {subtitle && (
        <span
          className={`inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-3 ${
            gold ? 'text-gold' : light ? 'text-white/70' : 'text-muted-foreground'
          }`}
        >
          {subtitle}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${
          light ? 'text-white' : 'text-primary'
        }`}
      >
        {title}
      </h2>
      {gold && (
        <div className="mt-4 mx-auto w-16 h-0.5 bg-gold" />
      )}
    </motion.div>
  );
}
