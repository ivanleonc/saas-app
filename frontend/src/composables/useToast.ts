import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

const toasts = ref<Toast[]>([]);
let nextId = 1;

const DEFAULT_DURATION_MS = 4000;

export function useToast() {
  const push = (type: ToastType, message: string, duration = DEFAULT_DURATION_MS): number => {
    const id = nextId++;
    toasts.value.push({ id, type, message });
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  };

  const dismiss = (id: number): void => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const clear = (): void => {
    toasts.value = [];
  };

  return {
    toasts,
    success: (message: string, duration?: number) => push('success', message, duration),
    error: (message: string, duration?: number) => push('error', message, duration),
    info: (message: string, duration?: number) => push('info', message, duration),
    dismiss,
    clear,
  };
}
