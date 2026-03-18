import React, { useEffect, useRef, useCallback } from 'react';

interface ConfirmationButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'cancel';
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  buttons: ConfirmationButton[];
  compact?: boolean; // New prop for compact horizontal style
}

export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  buttons,
  compact = false
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Store previously focused element on open, restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current) {
      (previousFocusRef.current as HTMLElement).focus?.();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Focus the first focusable element on mount
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [isOpen]);

  // Focus trap and Escape key handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [onClose]);

  if (!isOpen) return null;

  // Compact style (horizontal buttons, smaller)
  if (compact) {
    return (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[60] px-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onKeyDown={handleKeyDown}
        ref={modalRef}
      >
        <div
          className="bg-white rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.25)] w-full"
          style={{ padding: '24px 28px', maxWidth: '310px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title (visually hidden for compact, but present for aria-labelledby) */}
          <h3 id="confirm-modal-title" className="sr-only">{title}</h3>

          {/* Message */}
          <div className="text-[13px] text-[#1d1d1f] leading-snug mb-4 text-left">
            {message}
          </div>

          {/* Horizontal Buttons */}
          <div className="flex items-center justify-center gap-2">
            {buttons.map((button, index) => {
              const variantStyles = {
                primary: 'bg-[#007aff] hover:bg-[#0051d5] active:bg-[#004bb8] text-white font-semibold',
                secondary: 'bg-[#e5e5e7] hover:bg-[#d1d1d6] active:bg-[#c7c7cc] text-[#1d1d1f] font-medium',
                cancel: 'bg-[#e5e5e7] hover:bg-[#d1d1d6] active:bg-[#c7c7cc] text-[#1d1d1f] font-medium'
              };

              const variant = button.variant || 'cancel';

              return (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={`flex-1 min-h-[36px] px-4 py-1 rounded-full text-[12px] whitespace-nowrap transition-colors ${variantStyles[variant]}`}
                >
                  {button.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Original vertical style
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[60] px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onKeyDown={handleKeyDown}
      ref={modalRef}
    >
      <div
        className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] max-w-[460px] w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title & Message */}
        <div className="px-6 pt-6 pb-5">
          <h3 id="confirm-modal-title" className="text-[22px] font-bold text-[#1d1d1f] mb-3 leading-tight">
            {title}
          </h3>
          <div className="text-[16px] text-[#4a4a4a] leading-relaxed">
            {message}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col">
          {buttons.map((button, index) => {
            const variantStyles = {
              primary: 'font-semibold text-white bg-[#007aff] hover:bg-[#0051d5] active:bg-[#004bb8]',
              secondary: 'font-semibold text-[#007aff] hover:bg-[#f5f5f7] active:bg-[#e8e8ed]',
              cancel: 'font-normal text-[#636366] hover:bg-[#f5f5f7] active:bg-[#e8e8ed]'
            };

            const variant = button.variant || 'cancel';
            const borderClass = index > 0 ? 'border-t border-[#d2d2d7]' : '';

            return (
              <button
                key={index}
                onClick={button.onClick}
                className={`h-[56px] text-[17px] transition-colors ${variantStyles[variant]} ${borderClass}`}
              >
                {button.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}