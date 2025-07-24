import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../ErrorFallback";
import { ReactNode } from "react";

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
}
