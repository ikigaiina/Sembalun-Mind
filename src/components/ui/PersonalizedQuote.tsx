import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { usePersonalization } from '../../contexts/PersonalizationContext';

interface PersonalizedQuoteProps {
  className?: string;
}

export const PersonalizedQuote: React.FC<PersonalizedQuoteProps> = ({ 
  className = "" 
}) => {
  const { getPersonalizedQuote } = usePersonalization();
  const quote = getPersonalizedQuote();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card className="p-6 bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-200">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💫</span>
            </div>
          </div>
          <blockquote className="text-gray-700 font-body italic text-base leading-relaxed mb-4 max-w-md mx-auto">
            "{quote.text}"
          </blockquote>
          <cite className="text-sm text-gray-600 font-medium">
            — {quote.author}
          </cite>
          {quote.context && (
            <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
              {quote.context}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};