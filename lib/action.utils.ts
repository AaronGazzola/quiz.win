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
    const errorMessage = (error as any)?.message || (error as any)?.toString?.() || String(error) || "An unexpected error occurred";
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