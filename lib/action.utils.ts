export interface ActionResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

export const getActionResponse = <T>({
  data,
  error,
}: {
  data?: T;
  error?: unknown;
} = {}): ActionResponse<T> => {
  if (error) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      const err = error as Record<string, unknown>;
      if (typeof err.message === "string") {
        errorMessage = err.message;
      } else if (err.body && typeof err.body === "object") {
        const body = err.body as Record<string, unknown>;
        if (typeof body.message === "string") {
          errorMessage = body.message;
        }
      } else if (typeof err.status === "string") {
        errorMessage = err.status.replace(/_/g, " ").toLowerCase();
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  return {
    success: true,
    data,
  };
};