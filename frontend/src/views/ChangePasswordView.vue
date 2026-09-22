<template>
  <AuthenticatedLayout>
    <div class="change-password-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Cambiar Contraseña</h1>
          <p class="page-subtitle" v-if="isTemporary">
            Tu contraseña es temporal. Debes cambiarla para continuar usando el sistema.
          </p>
          <p class="page-subtitle" v-else>
            Actualiza tu contraseña de acceso.
          </p>
        </div>
      </div>

      <UiAlert v-if="isTemporary" type="warning">
        Debes cambiar tu contraseña temporal antes de acceder al resto del sistema.
      </UiAlert>

      <form @submit.prevent="handleSubmit">
        <UiCard>
          <template #header>
            <h3 class="card-title">{{ isTemporary ? 'Nueva Contraseña' : 'Cambiar Contraseña' }}</h3>
          </template>

          <div class="form-body">
            <UiAlert v-if="errorMsg" type="error">{{ errorMsg }}</UiAlert>
            <UiAlert v-if="successMsg" type="success">{{ successMsg }}</UiAlert>

            <UiInput
              v-if="!isTemporary"
              v-model="form.currentPassword"
              label="Contraseña Actual"
              type="password"
              required
            />
            <UiInput
              v-model="form.newPassword"
              label="Nueva Contraseña"
              type="password"
              required
            />

            <!-- Password strength -->
            <div v-if="form.newPassword" class="strength-section">
              <div class="strength-bar">
                <div class="strength-fill" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
              </div>
              <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
            </div>

            <!-- Password requirements -->
            <ul v-if="form.newPassword" class="password-requirements">
              <li :class="{ met: requirements.length }">
                <span class="req-icon">{{ requirements.length ? '✓' : '○' }}</span>
                Al menos 6 caracteres
              </li>
              <li :class="{ met: requirements.uppercase }">
                <span class="req-icon">{{ requirements.uppercase ? '✓' : '○' }}</span>
                Una letra mayúscula
              </li>
              <li :class="{ met: requirements.lowercase }">
                <span class="req-icon">{{ requirements.lowercase ? '✓' : '○' }}</span>
                Una letra minúscula
              </li>
              <li :class="{ met: requirements.number }">
                <span class="req-icon">{{ requirements.number ? '✓' : '○' }}</span>
                Un número
              </li>
            </ul>

            <UiInput
              v-model="form.confirmPassword"
              label="Confirmar Nueva Contraseña"
              type="password"
              required
            />

            <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="match-error">
              Las contraseñas no coinciden.
            </p>
          </div>

          <template #footer>
            <UiButton
              type="submit"
              :loading="isLoading"
              :disabled="!isFormValid"
            >
              {{ isTemporary ? 'Establecer Contraseña' : 'Actualizar Contraseña' }}
            </UiButton>
          </template>
        </UiCard>
      </form>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyPath } from '@/composables/useCompanyPath';
import { authService } from '@/services/auth.service';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const authStore = useAuthStore();
const router = useRouter();
const { companyPath } = useCompanyPath();

const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const isTemporary = computed(() => !!authStore.user?.must_change_password);

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Password strength
const strengthScore = computed(() => {
  const pw = form.newPassword;
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
  if (strengthScore.value <= 2) return 'Débil';
  if (strengthScore.value <= 4) return 'Aceptable';
  return 'Fuerte';
});

const requirements = computed(() => {
  const pw = form.newPassword;
  return {
    length: pw.length >= 6,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
});

const isFormValid = computed(() => {
  if (!form.newPassword || !form.confirmPassword) return false;
  if (form.newPassword.length < 6) return false;
  if (form.newPassword !== form.confirmPassword) return false;
  if (!isTemporary.value && !form.currentPassword) return false;
  return true;
});

const handleSubmit = async () => {
  if (form.newPassword !== form.confirmPassword) {
    errorMsg.value = 'Las contraseñas no coinciden.';
    return;
  }

  if (form.newPassword.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const wasTemporary = isTemporary.value;
    if (wasTemporary) {
      await authService.changeTemporaryPassword(form.newPassword);
    } else {
      await authService.changePassword(form.currentPassword, form.newPassword);
    }

    if (authStore.user) {
      authStore.user.must_change_password = false;
    }

    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';

    if (wasTemporary) {
      successMsg.value = 'Contraseña actualizada. Inicia sesión con tu nueva contraseña...';
      setTimeout(async () => {
        await authStore.logout();
        router.push({ name: 'Login' });
      }, 1500);
    } else {
      successMsg.value = 'Contraseña actualizada correctamente. Redirigiendo...';
      setTimeout(() => router.push(companyPath('/dashboard')), 1500);
    }
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar contraseña';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.change-password-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 500px;
}

/* Password strength bar */
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
