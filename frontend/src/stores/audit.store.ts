import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auditService } from '@/services/audit.service';
import type { AuditLog, AuditFilters } from '@/types/audit';

export const useAuditStore = defineStore('audit', () => {
  const logs = ref<AuditLog[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(20);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const entityTypes = ref<string[]>([]);
  const filters = ref<AuditFilters>({});

  async function fetchLogs() {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await auditService.getLogs({
        page: page.value,
        limit: limit.value,
        ...filters.value,
      });
      logs.value = result.data;
      total.value = result.total;
    } catch (e: any) {
      error.value = e.message || 'Error al cargar auditoria';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchEntityTypes() {
    try {
      const result = await auditService.getEntityTypes();
      entityTypes.value = result.data;
    } catch {}
  }

  function setPage(p: number) {
    page.value = p;
    fetchLogs();
  }

  function setFilters(f: AuditFilters) {
    filters.value = f;
    page.value = 1;
    fetchLogs();
  }

  function resetFilters() {
    filters.value = {};
    page.value = 1;
    fetchLogs();
  }

  return {
    logs, total, page, limit, isLoading, error, entityTypes, filters,
    fetchLogs, fetchEntityTypes, setPage, setFilters, resetFilters,
  };
});
