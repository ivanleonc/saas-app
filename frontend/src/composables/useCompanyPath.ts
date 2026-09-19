import { useRoute } from 'vue-router';
import { computed } from 'vue';

export function useCompanyPath() {
  const route = useRoute();

  const companyId = computed(() => route.params.companyId as string);

  const companyPath = (suffix: string = '') => {
    return `/companies/${companyId.value}${suffix}`;
  };

  return { companyId, companyPath };
}
