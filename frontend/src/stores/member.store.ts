import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { memberService } from '@/services/member.service';
import { useAuthStore } from './auth.store';
import type { Member, CreateMemberPayload, UpdateMemberPayload } from '@/types/member';

export const useMemberStore = defineStore('member', () => {
  const authStore = useAuthStore();
  
  // Estado reactivo
  const members = ref<Member[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getter computado para obtener dinámicamente el ID de la empresa seleccionada
const currentCompanyId = computed(() => {
    return authStore.activeTenantId;
  });

  // Acción: Cargar miembros desde el backend
  const fetchMembers = async () => {
    if (!currentCompanyId.value) return;
    
    isLoading.value = true;
    error.value = null;
    try {
      const response = await memberService.getMembers(currentCompanyId.value);
      // Mapeamos según la estructura de tu apiResponse: response.data contiene el array
      members.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al cargar los miembros';
    } finally {
      isLoading.value = false;
    }
  };

  // Acción: Agregar un nuevo miembro
  const addMember = async (payload: CreateMemberPayload) => {
    if (!currentCompanyId.value) throw new Error('No hay una empresa activa seleccionada');
    
    isLoading.value = true;
    error.value = null;
    try {
      const response = await memberService.addMember(currentCompanyId.value, payload);
      // Refrescamos la lista local tras la inserción exitosa
      await fetchMembers();
      return response.data; // Retornamos la data por si la vista necesita mostrar la contraseña temporal
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al agregar el miembro';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Acción: Actualizar Miembro
  const updateMember = async (userId: number, payload: UpdateMemberPayload) => {
    if (!currentCompanyId.value) return;
    isLoading.value = true;
    error.value = null;
    try {
      await memberService.updateMember(currentCompanyId.value, userId, payload);
      await fetchMembers(); // Recargamos la tabla para ver los cambios
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al actualizar el miembro';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Acción: Eliminar Miembro
  const removeMember = async (userId: number) => {
    if (!currentCompanyId.value) return;
    isLoading.value = true;
    error.value = null;
    try {
      await memberService.removeMember(currentCompanyId.value, userId);
      await fetchMembers();
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al eliminar el miembro';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return { members, isLoading, error, fetchMembers, addMember, updateMember, removeMember };
});