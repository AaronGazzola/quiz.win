export interface ActionResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export const getActionResponse = <T>({
  data,
  error,
}: {
  data?: T;
  error?: any;
} = {}): ActionResponse<T> => {
  if (error) {
    const errorMessage = error?.message || error?.toString() || "An unexpected error occurred";
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