import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// React's class-based ErrorBoundary is the only API that catches errors
// thrown during render of its descendants. Function components and hooks
// can't do this — keep this file as a class until React ships a hooks
// equivalent (none on the roadmap as of late 2025).

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info);
    }
    // Production: hook a reporter here (Sentry, Datadog, etc.) — see plan item #27.
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({
  error,
  reset,
}: {
  error: Error | null;
  reset: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="flex min-h-[100vh] items-center justify-center px-4 py-16"
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          {t("Error.something_went_wrong")}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground sm:text-base">
          {t("Error.unexpected_error_description")}
        </p>
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <Button onClick={reset} size="lg" className="h-11 px-6">
            {t("Error.try_again")}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.location.reload()}
            className="h-11 px-6"
          >
            {t("Error.reload_page")}
          </Button>
        </div>
        {import.meta.env.DEV && error && (
          <pre className="mt-8 max-w-full overflow-x-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
            {error.message}
            {error.stack ? "\n\n" + error.stack : ""}
          </pre>
        )}
      </div>
    </section>
  );
}

export default ErrorBoundary;
