
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorCount: number;
}

interface UseErrorHandlerOptions {
  onError?: (error: Error) => void;
  maxRetries?: number;
  showToast?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { onError, maxRetries = 3, showToast = true } = options;
  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorCount: 0
  });

  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    setErrorState(prev => ({
      error,
      isError: true,
      errorCount: prev.errorCount + 1
    }));

    if (showToast) {
      toast({
        title: "An error occurred",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    onError?.(error);
  }, [onError, showToast, toast]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorCount: 0
    });
  }, []);

  const retry = useCallback(async (fn: () => Promise<void> | void) => {
    if (errorState.errorCount >= maxRetries) {
      toast({
        title: "Maximum retries reached",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      clearError();
      await fn();
    } catch (error) {
      handleError(error as Error);
    }
  }, [errorState.errorCount, maxRetries, handleError, clearError, toast]);

  return {
    ...errorState,
    handleError,
    clearError,
    retry,
    canRetry: errorState.errorCount < maxRetries
  };
};

// Higher-order component for error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) => {
  return (props: P) => {
    const { error, isError, handleError, retry, clearError } = useErrorHandler();

    if (isError && error) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent error={error} retry={() => { clearError(); retry(() => {}); }} />;
      }
      
      return (
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">Something went wrong: {error.message}</p>
          <button 
            onClick={() => { clearError(); retry(() => {}); }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    try {
      return <Component {...props} />;
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  };
};
