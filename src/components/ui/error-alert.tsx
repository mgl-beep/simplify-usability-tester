import { AlertCircle, XCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { Button } from './button';
import { useState } from 'react';

type AlertType = 'error' | 'warning' | 'info' | 'success';

interface ErrorAlertProps {
  type?: AlertType;
  title: string;
  message: string;
  errorCode?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  dismissable?: boolean;
  className?: string;
}

export function ErrorAlert({
  type = 'error',
  title,
  message,
  errorCode,
  action,
  onDismiss,
  dismissable = true,
  className = ''
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const config = {
    error: {
      icon: XCircle,
      bg: 'bg-red-50/80',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-800',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      buttonText: 'text-white'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-800',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      buttonText: 'text-white'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'text-white'
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-50/80',
      border: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-800',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      buttonText: 'text-white'
    }
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div 
      className={`rounded-[12px] border ${c.border} ${c.bg} p-4 backdrop-blur-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`w-5 h-5 ${c.iconColor}`} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className={`text-[15px] font-semibold ${c.titleColor} tracking-tight`}>
              {title}
            </h3>
            {dismissable && (
              <button
                onClick={handleDismiss}
                className={`flex-shrink-0 ${c.iconColor} hover:opacity-70 transition-opacity`}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>
          
          <p className={`text-[14px] ${c.textColor} leading-relaxed mb-3`}>
            {message}
          </p>

          {errorCode && (
            <p className={`text-[12px] ${c.textColor} opacity-60 font-mono mb-3`}>
              Error Code: {errorCode}
            </p>
          )}

          {action && (
            <Button
              onClick={action.onClick}
              className={`h-[36px] px-4 rounded-md ${c.buttonBg} ${c.buttonText} text-[14px] font-medium shadow-sm`}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Preset Error Messages
export function CanvasConnectionError({ onReconnect }: { onReconnect: () => void }) {
  return (
    <ErrorAlert
      type="error"
      title="Canvas Connection Failed"
      message="Your Canvas access token has expired or is invalid. Please reconnect to continue."
      errorCode="AUTH_001"
      action={{
        label: 'Reconnect to Canvas',
        onClick: onReconnect
      }}
    />
  );
}

export function ScanFailedError({ courseName, onRetry }: { courseName: string; onRetry: () => void }) {
  return (
    <ErrorAlert
      type="error"
      title="Scan Failed"
      message={`Unable to complete scan for "${courseName}". This may be due to network issues or insufficient permissions.`}
      errorCode="SCAN_002"
      action={{
        label: 'Retry Scan',
        onClick: onRetry
      }}
    />
  );
}

export function ImportFailedError({ fileName, error }: { fileName: string; error: string }) {
  return (
    <ErrorAlert
      type="error"
      title="Import Failed"
      message={`Unable to import "${fileName}". ${error}`}
      errorCode="IMPORT_003"
    />
  );
}

export function FixFailedWarning({ issueTitle, onRetry }: { issueTitle: string; onRetry: () => void }) {
  return (
    <ErrorAlert
      type="warning"
      title="Fix Could Not Be Applied"
      message={`The fix for "${issueTitle}" could not be applied. The content may have been modified in Canvas.`}
      action={{
        label: 'Try Again',
        onClick: onRetry
      }}
    />
  );
}

export function NetworkErrorAlert({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorAlert
      type="error"
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      errorCode="NET_004"
      action={{
        label: 'Retry',
        onClick: onRetry
      }}
    />
  );
}

export function SuccessAlert({ title, message }: { title: string; message: string }) {
  return (
    <ErrorAlert
      type="success"
      title={title}
      message={message}
    />
  );
}
