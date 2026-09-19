import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { memberService } from '@/services/member.service';
import { useAuthStore } from './auth.store';
import type { Member, CreateMemberPayload, UpdateMemberPayload } from '@/types/member';

export const useMemberStore = defineStore('member', () => {
  const authStore = useAuthStore();

  const members = ref<Member[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const currentCompanyId = computed(() => authStore.activeTenantId);

  const withLoading = async <T>(fn: () => Promise<T>, errorMsg?: string): Promise<T | undefined> => {
    isLoading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (err: any) {
      error.value = err.response?.data?.error || errorMsg || 'Error en la operación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMembers = async () => {
    if (!currentCompanyId.value) return;
    await withLoading(async () => {
      const response = await memberService.getMembers();
      members.value = response.data;
    }, 'Error al cargar los miembros');
  };

  const addMember = async (payload: CreateMemberPayload) => {
    if (!currentCompanyId.value) throw new Error('No hay una empresa activa seleccionada');
    const result = await withLoading(async () => {
      const response = await memberService.addMember(payload);
      await fetchMembers();
      return response.data;
    }, 'Error al agregar el miembro');
    return result;
  };

  const updateMember = async (userId: string, payload: UpdateMemberPayload) => {
    if (!currentCompanyId.value) return;
    await withLoading(async () => {
      await memberService.updateMember(userId, payload);
      await fetchMembers();
    }, 'Error al actualizar el miembro');
  };

  const removeMember = async (userId: string) => {
    if (!currentCompanyId.value) return;
    await withLoading(async () => {
      await memberService.removeMember(userId);
      await fetchMembers();
    }, 'Error al eliminar el miembro');
  };

  const resetPassword = async (userId: string) => {
    if (!currentCompanyId.value) throw new Error('No hay una empresa activa seleccionada');
    const result = await withLoading(async () => {
      const response = await memberService.resetPassword(userId);
      return response.data;
    }, 'Error al resetear la contraseña');
    return result;
  };

  const resetPasswordAndSendEmail = async (userId: string) => {
    if (!currentCompanyId.value) throw new Error('No hay una empresa activa seleccionada');
    const result = await withLoading(async () => {
      const response = await memberService.resetPasswordAndSendEmail(userId);
      return response.data;
    }, 'Error al resetear y enviar contraseña');
    return result;
  };

  return { members, isLoading, error, fetchMembers, addMember, updateMember, removeMember, resetPassword, resetPasswordAndSendEmail };
});
