import { ref } from 'vue';

interface UseAsyncOptions {
  errorMessage?: string;
}

export function useAsyncOperation(options: UseAsyncOptions = {}) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const execute = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    isLoading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (err: any) {
      error.value = err.response?.data?.message || err.response?.data?.error || options.errorMessage || 'Error en la operación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    isLoading.value = false;
    error.value = null;
  };

  return { isLoading, error, execute, reset };
}
