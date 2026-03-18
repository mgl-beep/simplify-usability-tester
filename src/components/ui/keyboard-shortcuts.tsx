import { useEffect, useState } from 'react';
import { Command, X } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  modifier?: 'cmd' | 'ctrl' | 'shift' | 'alt';
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  enabled?: boolean;
}

export function KeyboardShortcuts({ shortcuts, enabled = true }: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const modifierPressed = 
          (shortcut.modifier === 'cmd' && (e.metaKey || e.ctrlKey)) ||
          (shortcut.modifier === 'ctrl' && e.ctrlKey) ||
          (shortcut.modifier === 'shift' && e.shiftKey) ||
          (shortcut.modifier === 'alt' && e.altKey) ||
          !shortcut.modifier;

        if (modifierPressed && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
          // Don't trigger if user is typing in an input
          if (
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement ||
            (e.target as HTMLElement).isContentEditable
          ) {
            return;
          }

          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);

  return null;
}

// Keyboard Shortcuts Help Modal
interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Array<{
    category: string;
    items: Array<{
      keys: string[];
      description: string;
    }>;
  }>;
}

export function ShortcutsHelpModal({ isOpen, onClose, shortcuts }: ShortcutsHelpModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[16px] shadow-2xl max-w-[600px] w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5e7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071e3] to-[#00d084] flex items-center justify-center">
              <Command className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight">
                Keyboard Shortcuts
              </h2>
              <p className="text-[13px] text-[#636366]">Work faster with keyboard commands</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-88px)]">
          {shortcuts.map((category, index) => (
            <div key={index}>
              <h3 className="text-[14px] font-semibold text-[#636366] uppercase tracking-wide mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#f5f5f7] transition-colors"
                  >
                    <span className="text-[14px] text-[#1d1d1f]">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="px-2 py-1 bg-white border border-[#d2d2d7] rounded-md text-[12px] font-mono text-[#1d1d1f] shadow-sm min-w-[28px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5e7] bg-[#EEECE8]">
          <p className="text-[12px] text-[#636366] text-center">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-[#d2d2d7] rounded text-[11px] font-mono">?</kbd> anytime to view shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}

// Keyboard Shortcut Badge (to show next to buttons)
export function ShortcutBadge({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-0.5 ml-2">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="px-1.5 py-0.5 bg-[#e5e5e7] rounded text-[10px] font-mono text-[#636366] opacity-60"
        >
          {key}
        </kbd>
      ))}
    </div>
  );
}

// Hook for managing keyboard shortcuts
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifier?: 'cmd' | 'ctrl' | 'shift' | 'alt'
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifierPressed = 
        (modifier === 'cmd' && (e.metaKey || e.ctrlKey)) ||
        (modifier === 'ctrl' && e.ctrlKey) ||
        (modifier === 'shift' && e.shiftKey) ||
        (modifier === 'alt' && e.altKey) ||
        !modifier;

      if (modifierPressed && e.key.toLowerCase() === key.toLowerCase()) {
        // Don't trigger if user is typing in an input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        ) {
          return;
        }

        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, modifier]);
}

// Detect if user is on Mac
export const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Get the correct modifier key label
export const getModifierKey = () => isMac ? '⌘' : 'Ctrl';
