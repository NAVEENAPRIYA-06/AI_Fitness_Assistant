import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (nextOpen: boolean) => void;
  children?: React.ReactNode;

  // Multi-item support
  items?: AccordionItem[];
  allowMultiple?: boolean;

  className?: string;
  headerClassName?: string;
  variant?: 'default' | 'card' | 'subtle' | 'ghost';
  id?: string;
}

interface SingleAccordionItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (nextOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  variant?: 'default' | 'card' | 'subtle' | 'ghost';
  id?: string;
}

const SingleAccordionItem: React.FC<SingleAccordionItemProps> = ({
  title,
  subtitle,
  badge,
  icon,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  children,
  className = '',
  headerClassName = '',
  variant = 'default',
  id: customId
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const autoId = useId();
  const accordionId = customId || autoId;
  const contentId = `${accordionId}-content`;
  const headerId = `${accordionId}-header`;

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const handleToggle = () => {
    const nextState = !isOpen;
    if (!isControlled) {
      setInternalOpen(nextState);
    }
    if (onToggle) {
      onToggle(nextState);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return 'bg-[#111114] border border-slate-800/80 rounded-xl overflow-hidden shadow-xs';
      case 'subtle':
        return 'bg-slate-900/40 border border-slate-800/50 rounded-lg overflow-hidden';
      case 'ghost':
        return 'bg-transparent border-t border-b border-slate-800/60 rounded-none';
      case 'default':
      default:
        return 'bg-[#121215] border border-slate-800 hover:border-slate-700/80 rounded-xl overflow-hidden transition-colors';
    }
  };

  return (
    <div id={accordionId} className={`${getVariantStyles()} ${className}`}>
      <button
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${headerClassName}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div className="text-slate-400 shrink-0 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-100 tracking-tight">
                {title}
              </span>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400 p-0.5 rounded"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-800/40">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  children,
  title,
  subtitle,
  badge,
  icon,
  defaultOpen = false,
  isOpen,
  onToggle,
  className = '',
  headerClassName = '',
  variant = 'default',
  id
}) => {
  // If items array is provided, render the multi-item accordion list
  const [openItemIds, setOpenItemIds] = useState<string[]>(() => {
    if (!items) return [];
    return items.filter(i => i.defaultOpen).map(i => i.id);
  });

  if (items && items.length > 0) {
    const handleToggleItem = (itemId: string) => {
      setOpenItemIds(prev => {
        if (prev.includes(itemId)) {
          return prev.filter(i => i !== itemId);
        } else {
          return allowMultiple ? [...prev, itemId] : [itemId];
        }
      });
    };

    return (
      <div className={`space-y-3 ${className}`}>
        {items.map(item => (
          <SingleAccordionItem
            key={item.id}
            id={item.id}
            title={item.title}
            subtitle={item.subtitle}
            badge={item.badge}
            icon={item.icon}
            isOpen={openItemIds.includes(item.id)}
            onToggle={() => handleToggleItem(item.id)}
            variant={variant}
            headerClassName={headerClassName}
          >
            {item.content}
          </SingleAccordionItem>
        ))}
      </div>
    );
  }

  // Single accordion mode
  return (
    <SingleAccordionItem
      id={id}
      title={title}
      subtitle={subtitle}
      badge={badge}
      icon={icon}
      defaultOpen={defaultOpen}
      isOpen={isOpen}
      onToggle={onToggle}
      className={className}
      headerClassName={headerClassName}
      variant={variant}
    >
      {children}
    </SingleAccordionItem>
  );
};
