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
    const errorMessage =
      (error instanceof Error ? error.message : null) ||
      (typeof error === "object" && error !== null && "toString" in error && typeof error.toString === "function" ? error.toString() : null) ||
      String(error) ||
      "An unexpected error occurred";
    console.log(JSON.stringify({ error: errorMessage }, null, 0));
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