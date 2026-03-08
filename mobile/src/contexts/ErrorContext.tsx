import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { classifyError } from '../utils/errorClassifier';
import type { ErrorSeverity } from '../utils/errorClassifier';
import ErrorPopup from '../components/common/ErrorPopup';
import type { ErrorPopupConfig } from '../components/common/ErrorPopup';

// ─── Context Type ───

interface ErrorContextType {
  /** Show an error popup from a raw caught error (auto-classifies) */
  showError: (error: unknown, retryFn?: () => void) => void;
  /** Show a custom popup (manual control over title/message) */
  showPopup: (config: ErrorPopupConfig) => void;
  /** Dismiss the current popup */
  dismiss: () => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

// ─── Severity Icons ───

const SEVERITY_ICONS: Record<ErrorSeverity, string> = {
  error: 'alert-circle-outline',
  warning: 'alert-outline',
  info: 'information-outline',
};

// ─── Provider ───

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPopup, setCurrentPopup] = useState<ErrorPopupConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setIsVisible(false);
    // Delay clearing popup data so exit animation can play
    setTimeout(() => setCurrentPopup(null), 300);
  }, []);

  const showPopup = useCallback(
    (config: ErrorPopupConfig) => {
      // Clear any existing timer
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }

      setCurrentPopup(config);
      setIsVisible(true);

      // Set auto-dismiss timer if configured
      if (config.autoDismissMs && config.autoDismissMs > 0) {
        dismissTimerRef.current = setTimeout(() => {
          dismiss();
        }, config.autoDismissMs);
      }
    },
    [dismiss],
  );

  const showError = useCallback(
    (error: unknown, retryFn?: () => void) => {
      const appError = classifyError(error);

      // Log original error in development (never shown to user)
      if (__DEV__) {
        console.error('[ErrorContext]', appError.category, appError.originalError ?? error);
      }

      const icon = SEVERITY_ICONS[appError.severity];

      const action =
        appError.retryable && retryFn
          ? {
              label: 'Try Again',
              onPress: () => {
                dismiss();
                retryFn();
              },
            }
          : undefined;

      showPopup({
        title: appError.title,
        message: appError.message,
        severity: appError.severity,
        icon,
        action,
        dismissable: true,
        autoDismissMs: appError.autoDismissMs,
      });
    },
    [showPopup, dismiss],
  );

  const contextValue = useMemo(
    () => ({ showError, showPopup, dismiss }),
    [showError, showPopup, dismiss],
  );

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      <ErrorPopup visible={isVisible} config={currentPopup} onDismiss={dismiss} />
    </ErrorContext.Provider>
  );
};

// ─── Hook ───

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
