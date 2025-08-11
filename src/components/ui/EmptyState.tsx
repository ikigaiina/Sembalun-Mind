import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'meditation' | 'inspiring';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'meditation':
        return {
          container: 'bg-gradient-to-br from-meditation-zen-50 to-meditation-calm-50',
          iconBg: 'bg-gradient-to-br from-meditation-zen-100 to-meditation-calm-100',
          iconColor: 'text-meditation-zen-600',
          button: 'meditation'
        };
      case 'inspiring':
        return {
          container: 'bg-gradient-to-br from-purple-50 to-blue-50',
          iconBg: 'bg-gradient-to-br from-purple-100 to-blue-100',
          iconColor: 'text-purple-600',
          button: 'primary'
        };
      default:
        return {
          container: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          button: 'outline'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-16 ${className}`}
    >
      <Card className={`max-w-md mx-auto ${styles.container} border-0`}>
        <div className="p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`w-24 h-24 mx-auto mb-6 ${styles.iconBg} rounded-full flex items-center justify-center`}
          >
            <Icon className={`w-12 h-12 ${styles.iconColor}`} />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-heading font-bold text-gray-800 mb-4"
          >
            {title}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-8 leading-relaxed"
          >
            {description}
          </motion.p>

          {actionLabel && onAction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                variant={styles.button as any}
                size="lg"
                onClick={onAction}
                className="px-8"
              >
                {actionLabel}
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};