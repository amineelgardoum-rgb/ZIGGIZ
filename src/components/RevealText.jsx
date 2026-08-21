import { motion } from 'framer-motion';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/**
 * StackedLines — each line lives in its own overflow-hidden box and slides
 * up from behind the mask. Pass an array of strings, one per line.
 */
export function StackedLines({
  lines,
  as: Tag = 'p',
  className = '',
  stagger = 0.12,
  baseDelay = 0,
  duration = 0.95,
  once = true,
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span className="clip-line block" key={line + i}>
          <motion.span
            className="block"
            initial={{ y: '115%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once, margin: '-10% 0px -10% 0px' }}
            transition={{
              duration,
              ease: EASE_OUT_EXPO,
              delay: baseDelay + i * stagger,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * WordReveal — splits text into words, each clip-masked and staggered.
 * Used for the hero title and ghost headings.
 */
export function WordReveal({
  text,
  as: Tag = 'h1',
  className = '',
  wordClassName = '',
  stagger = 0.14,
  duration = 1.1,
  delayStart = 0,
  gate = true,
  once = true,
}) {
  const words = text.split(' ');
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span className="clip-word" key={word + i}>
          <motion.span
            className={`inline-block ${wordClassName}`}
            initial={{ y: '115%', opacity: 0 }}
            animate={gate ? { y: '0%', opacity: 1 } : { y: '115%', opacity: 0 }}
            transition={{
              duration,
              ease: EASE_OUT_EXPO,
              delay: gate ? delayStart + i * stagger : 0,
            }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Word-by-word fade + rise, gentler than the clip mask — used for body copy. */
export function WordFade({ text, as: Tag = 'p', className = '', stagger = 0.028, delayIn = 0.25 }) {
  const words = text.split(' ');
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          className="inline-block"
          key={word + i}
          initial={{ y: 18, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1], delay: delayIn + i * stagger }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}
