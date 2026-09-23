<template>
  <AuthenticatedLayout>
    <div class="profile-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Mi Cuenta</h1>
          <p class="page-subtitle">Gestiona tu información personal de acceso y credenciales.</p>
        </div>
      </div>

      <!-- Profile Hero -->
      <div class="profile-hero">
        <div class="profile-avatar">{{ getInitials(profileName) }}</div>
        <div class="profile-identity">
          <h2 class="profile-hero-name">{{ profileName || '---' }}</h2>
          <span class="profile-hero-email">{{ profileEmail }}</span>
        </div>
      </div>

      <!-- Profile Info Card -->
      <UiCard>
        <template #header>
          <div class="card-header-row">
            <h3 class="card-title">Datos del Perfil</h3>
            <UiButton variant="outline" size="sm" @click="openProfileModal" width="auto">
              <IconEdit :size="14" /> Editar
            </UiButton>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Nombre</span>
            <span class="info-value">{{ profileName || '---' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Correo Electrónico</span>
            <span class="info-value">{{ profileEmail }}</span>
          </div>
        </div>
      </UiCard>

      <!-- Password Card -->
      <UiCard>
        <template #header>
          <div class="card-header-row">
            <h3 class="card-title">Cambiar Contraseña</h3>
            <UiButton variant="outline" size="sm" @click="openPasswordModal" width="auto">
              <IconEdit :size="14" /> Editar
            </UiButton>
          </div>
        </template>

        <p class="card-description">Tu contraseña se mantiene segura. Haz clic en editar para actualizarla.</p>
      </UiCard>

      <!-- Profile Edit Modal -->
      <UiModal v-model="isProfileModalOpen">
        <form @submit.prevent="handleProfileSubmit">
          <UiCard>
            <template #header>
              <h3 class="card-title">Editar Perfil</h3>
              <p class="card-description">Actualiza tu información personal.</p>
            </template>

            <div class="form-body">
              <UiAlert v-if="errorMessage" type="error">{{ errorMessage }}</UiAlert>

              <UiInput v-model="form.name" label="Nombre Completo" required />
              <UiInput v-model="form.email" label="Correo Electrónico" type="email" required disabled />
            </div>

            <template #footer>
              <div class="modal-footer">
                <UiButton type="button" variant="outline" @click="isProfileModalOpen = false">
                  Cancelar
                </UiButton>
                <UiButton type="submit" :loading="isSavingProfile">
                  Guardar Cambios
                </UiButton>
              </div>
            </template>
          </UiCard>
        </form>
      </UiModal>

      <!-- Password Change Modal -->
      <UiModal v-model="isPasswordModalOpen">
        <form @submit.prevent="handlePasswordChange">
          <UiCard>
            <template #header>
            <h3 class="card-title">Cambiar Contraseña</h3>
              <p class="card-description">Ingresa tu contraseña actual y la nueva contraseña.</p>
            </template>

            <div class="form-body">
              <UiAlert v-if="passwordError" type="error">{{ passwordError }}</UiAlert>

              <UiInput
                v-model="passwordForm.currentPassword"
                label="Contraseña Actual"
                type="password"
                required
              />
              <UiInput
                v-model="passwordForm.newPassword"
                label="Nueva Contraseña"
                type="password"
                required
              />

              <!-- Password strength -->
              <div v-if="passwordForm.newPassword" class="strength-section">
                <div class="strength-bar">
                  <div class="strength-fill" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
                </div>
                <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
              </div>

              <!-- Password requirements -->
              <ul v-if="passwordForm.newPassword" class="password-requirements">
                <li :class="{ met: pwReqs.length }">
                  <span class="req-icon">{{ pwReqs.length ? '✓' : '○' }}</span>
                  Al menos 6 caracteres
                </li>
                <li :class="{ met: pwReqs.uppercase }">
                  <span class="req-icon">{{ pwReqs.uppercase ? '✓' : '○' }}</span>
                  Una letra mayuscula
                </li>
                <li :class="{ met: pwReqs.lowercase }">
                  <span class="req-icon">{{ pwReqs.lowercase ? '✓' : '○' }}</span>
                  Una letra minuscula
                </li>
                <li :class="{ met: pwReqs.number }">
                  <span class="req-icon">{{ pwReqs.number ? '✓' : '○' }}</span>
                  Un numero
                </li>
              </ul>

              <UiInput
                v-model="passwordForm.confirmPassword"
                label="Confirmar Nueva Contraseña"
                type="password"
                required
              />

              <p v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="match-error">
                Las contraseñas no coinciden.
              </p>
            </div>

            <template #footer>
              <div class="modal-footer">
                <UiButton type="button" variant="outline" @click="isPasswordModalOpen = false">
                  Cancelar
                </UiButton>
                <UiButton type="submit" :loading="isChangingPassword" :disabled="!isPasswordFormValid">
                  Actualizar Contraseña
                </UiButton>
              </div>
            </template>
          </UiCard>
        </form>
      </UiModal>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import UiModal from '@/components/ui/UiModal.vue';
import { IconEdit } from '@tabler/icons-vue';
import { useToast } from '@/composables/useToast';

const authStore = useAuthStore();
const toast = useToast();

// --- PROFILE ---
const isProfileModalOpen = ref(false);
const isSavingProfile = ref(false);
const errorMessage = ref<string | null>(null);

const form = reactive({
  name: '',
  email: '',
});

const profileName = computed(() => authStore.user?.name || '');
const profileEmail = computed(() => authStore.user?.email || '');

onMounted(async () => {
  await authStore.fetchProfile();
});

const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();
};

const openProfileModal = () => {
  form.name = authStore.user?.name || '';
  form.email = authStore.user?.email || '';
  errorMessage.value = null;
  isProfileModalOpen.value = true;
};

const handleProfileSubmit = async () => {
  isSavingProfile.value = true;
  errorMessage.value = null;

  try {
    await userService.updateProfile({ name: form.name, email: form.email });
    authStore.updateProfileData({ name: form.name, email: form.email });
    isProfileModalOpen.value = false;
    toast.success('Perfil actualizado correctamente');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Error al actualizar perfil';
  } finally {
    isSavingProfile.value = false;
  }
};

// --- PASSWORD ---
const isPasswordModalOpen = ref(false);
const passwordError = ref('');
const isChangingPassword = ref(false);

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const openPasswordModal = () => {
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  passwordError.value = '';
  isPasswordModalOpen.value = true;
};

// Password strength
const strengthScore = computed(() => {
  const pw = passwordForm.newPassword;
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
});

const strengthPercent = computed(() => Math.min((strengthScore.value / 6) * 100, 100));

const strengthClass = computed(() => {
  if (strengthScore.value <= 2) return 'weak';
  if (strengthScore.value <= 4) return 'fair';
  return 'strong';
});

const strengthLabel = computed(() => {
  if (strengthScore.value <= 2) return 'Debil';
  if (strengthScore.value <= 4) return 'Aceptable';
  return 'Fuerte';
});

const pwReqs = computed(() => {
  const pw = passwordForm.newPassword;
  return {
    length: pw.length >= 6,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
});

const isPasswordFormValid = computed(() => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) return false;
  if (passwordForm.newPassword.length < 6) return false;
  if (passwordForm.newPassword !== passwordForm.confirmPassword) return false;
  return true;
});

const handlePasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Las contraseñas no coinciden.';
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  isChangingPassword.value = true;
  passwordError.value = '';

  try {
    await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    isPasswordModalOpen.value = false;
    toast.success('Contraseña actualizada correctamente');
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar contraseña';
  } finally {
    isChangingPassword.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 600px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--bg-app);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-main);
  flex-shrink: 0;
}

.profile-identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.profile-hero-name {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-hero-email {
  font-size: var(--text-sm);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-grid {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 500;
}

.info-value {
  font-size: var(--text-sm);
  color: var(--text-main);
  font-weight: 600;
}

/* Password strength */
.strength-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s, background-color 0.3s;
}

.strength-fill.weak { background-color: var(--color-danger); }
.strength-fill.fair { background-color: var(--accent-amber); }
.strength-fill.strong { background-color: var(--color-success); }

.strength-label {
  font-size: var(--text-xs);
  font-weight: 500;
  min-width: 80px;
}

.strength-label.weak { color: var(--color-danger); }
.strength-label.fair { color: var(--accent-amber); }
.strength-label.strong { color: var(--color-success); }

/* Password requirements */
.password-requirements {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-muted);
  transition: color 0.2s;
}

.password-requirements li.met {
  color: var(--color-success);
}

.req-icon {
  font-size: 10px;
  width: 14px;
  text-align: center;
}

.match-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin: 0;
}
</style>
