import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Pencil, Check } from 'lucide-react';
import { getThemeClasses } from '../../lib/themeClasses';

interface EditableLayoutTextProps {
  fieldPath: string; // e.g. 'header.title', 'header.subtitle', 'modals.pinAuth.title'
  fallback?: string;
  className?: string;
  inputClassName?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}

// Utility to safely retrieve a nested property by string path
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export const EditableLayoutText: React.FC<EditableLayoutTextProps> = ({
  fieldPath,
  fallback = '',
  className = '',
  inputClassName = '',
  as: Component = 'span',
  multiline = false,
  placeholder = 'Click to edit...',
  children,
}) => {
  const { isCmsMode, cmsSettings, updateCmsField } = useApp();
  const theme = getThemeClasses(cmsSettings.theme);

  const contextValue = getNestedValue(cmsSettings, fieldPath) ?? fallback;
  const displayValue = contextValue || (typeof children === 'string' ? children : '') || fallback;

  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(displayValue);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(displayValue);
  }, [displayValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCommit = () => {
    const trimmed = currentValue.trim();
    if (trimmed !== displayValue) {
      updateCmsField(fieldPath, trimmed);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(displayValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // When not in CMS mode, render the plain element with zero decoration
  if (!isCmsMode) {
    return <Component className={className}>{displayValue}</Component>;
  }

  // When in editing state inside CMS mode
  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1.5 relative z-50">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            rows={2}
            className={`px-2 py-1 bg-white dark:bg-slate-900 border-2 border-sky-500 rounded-lg shadow-lg text-slate-900 dark:text-white outline-none ring-2 ring-sky-500/20 text-inherit font-inherit ${inputClassName}`}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            className={`px-2 py-0.5 bg-white dark:bg-slate-900 border-2 border-sky-500 rounded-lg shadow-lg text-slate-900 dark:text-white outline-none ring-2 ring-sky-500/20 text-inherit font-inherit ${inputClassName}`}
            placeholder={placeholder}
          />
        )}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommit();
          }}
          className="p-1 rounded-md bg-sky-500 text-white hover:bg-sky-600 shadow-sm"
          title="Save (Enter)"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </span>
    );
  }

  // Active In-Place CMS Mode: Highlighted with dashed outline, edit badge, and tooltip
  return (
    <Component
      onClick={() => setIsEditing(true)}
      title="CMS In-Place Edit: Click to modify inline"
      className={`inline-flex items-center gap-1.5 cursor-pointer relative group transition-all duration-150 border border-dashed border-sky-400/80 hover:border-sky-500 dark:border-sky-400/60 dark:hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/15 px-1.5 py-0.5 ${theme.badgeRadius} ${className}`}
    >
      <span>{displayValue}</span>
      <span className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
        {justSaved ? (
          <Check className="w-3 h-3 text-emerald-500" />
        ) : (
          <Pencil className="w-3 h-3 text-sky-500 group-hover:scale-110 transition-transform" />
        )}
      </span>
      {justSaved && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-600 text-white rounded shadow-md pointer-events-none animate-bounce">
          Saved!
        </span>
      )}
    </Component>
  );
};
