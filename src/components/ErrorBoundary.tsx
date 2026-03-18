import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function logErrorToServer(message: string, stack?: string, componentStack?: string) {
  try {
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/log-error`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        message,
        stack,
        componentStack,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {}); // Fire and forget
  } catch {
    // Never let error logging break the app
  }
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logErrorToServer(
      error.message,
      error.stack,
      errorInfo.componentStack || undefined
    );
  }

  componentDidMount() {
    // Catch unhandled promise rejections
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const message = event.reason?.message || String(event.reason);
    logErrorToServer(`Unhandled Promise Rejection: ${message}`, event.reason?.stack);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EEECE8] flex items-center justify-center p-6">
          <div className="max-w-[400px] w-full bg-white rounded-[20px] border border-[#d2d2d7] p-8 text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-[#ff9500]/15 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-[#ff9500]" strokeWidth={2} />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">
              Something went wrong
            </h2>
            <p className="text-[14px] text-[#636366] mb-6 leading-relaxed">
              SIMPLIFY ran into an unexpected error. This has been automatically reported to our team.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="h-[44px] px-6 rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={2} />
              Reload SIMPLIFY
            </button>
            {this.state.error && (
              <p className="mt-4 text-[11px] text-[#86868b] font-mono truncate px-4">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
