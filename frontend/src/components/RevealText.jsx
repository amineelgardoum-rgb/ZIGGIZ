import { useState, useEffect } from 'react';
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
  words: wordItems,
  as: Tag = 'h1',
  className = '',
  wordClassName = '',
  stagger = 0.14,
  duration = 1.1,
  delayStart = 0,
  gate = true,
  once = true,
}) {
  const words = wordItems
    ? wordItems
    : text.split(' ').map((t) => ({ text: t }));
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span className="clip-word" key={word.text + i}>
          <motion.span
            className={`inline-block ${wordClassName} ${word.className || ''}`}
            initial={{ y: '115%', opacity: 0 }}
            animate={gate ? { y: '0%', opacity: 1 } : { y: '115%', opacity: 0 }}
            transition={{
              duration,
              ease: EASE_OUT_EXPO,
              delay: gate ? delayStart + i * stagger : 0,
            }}
          >
            {word.text}
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

/**
 * TypeWriter — rotating headline: types one word, deletes it, then types
 * the next, looping forever. Each word keeps its own color class.
 */
export function TypeWriter({
  words,
  as: Tag = 'h1',
  className = '',
  typingSpeed = 95,
  deletingSpeed = 45,
  pauseFull = 1500,
  pauseEmpty = 350,
  gate = true,
  cursorClassName = '',
}) {
  const [wi, setWi] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!gate) return;
    const word = words[wi].text;
    let delay = deleting ? deletingSpeed : typingSpeed;
    if (!deleting && count === word.length) delay = pauseFull;
    if (deleting && count === 0) delay = pauseEmpty;

    const id = setTimeout(() => {
      if (!deleting && count < word.length) {
        setCount(count + 1);
      } else if (!deleting && count === word.length) {
        setDeleting(true);
      } else if (deleting && count > 0) {
        setCount(count - 1);
      } else {
        setDeleting(false);
        setWi((wi + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(id);
  }, [gate, wi, count, deleting, words, typingSpeed, deletingSpeed, pauseFull, pauseEmpty]);

  const word = words[wi];
  const done = deleting && count === 0;

  return (
    <Tag className={className}>
      <span className={word.className}>{word.text.slice(0, count)}</span>
      <span
        className={`ml-1 inline-block h-[0.78em] w-[0.06em] translate-y-[0.08em] bg-current ${
          done ? 'opacity-0' : 'animate-pulse'
        } ${cursorClassName}`}
        aria-hidden="true"
      />
    </Tag>
  );
}
