import React from 'react';
import { motion } from 'framer-motion';

interface IndonesianQuoteProps {
  className?: string;
}

const quotes = [
  {
    text: "Air yang tenang menggambarkan pikiran yang damai",
    translation: "Still water reflects a peaceful mind",
    source: "Pepatah Jawa"
  },
  {
    text: "Seperti bambu yang lentur, hati yang bijak tidak mudah patah",
    translation: "Like flexible bamboo, a wise heart does not easily break",
    source: "Kebijaksanaan Sunda"
  },
  {
    text: "Gunung tidak pernah bertemu gunung, tetapi manusia bertemu manusia",
    translation: "Mountains never meet mountains, but people meet people",
    source: "Pepatah Minang"
  },
  {
    text: "Bagaikan teratai yang tumbuh dari lumpur, kebijaksanaan muncul dari kesulitan",
    translation: "Like a lotus growing from mud, wisdom emerges from difficulty",
    source: "Filosofi Bali"
  },
  {
    text: "Laut yang dalam tidak berombak di permukaan",
    translation: "Deep seas do not wave at the surface",
    source: "Kearifan Bugis"
  }
];

export const IndonesianQuote: React.FC<IndonesianQuoteProps> = ({ className = "" }) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className={`max-w-2xl mx-auto text-center ${className}`}
    >
      {/* Decorative element */}
      <div className="flex items-center justify-center mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent w-16" />
        <div className="mx-4 w-2 h-2 rounded-full bg-primary-400" />
        <div className="h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent w-16" />
      </div>

      {/* Indonesian Quote */}
      <blockquote className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 mb-3 font-heading italic">
        "{randomQuote.text}"
      </blockquote>

      {/* English Translation */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-body">
        {randomQuote.translation}
      </p>

      {/* Source */}
      <cite className="text-xs text-primary-600 dark:text-primary-400 font-medium">
        — {randomQuote.source}
      </cite>
    </motion.div>
  );
};