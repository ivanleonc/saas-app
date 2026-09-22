<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content" :class="`modal-${size}`">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'default' | 'large';
}

withDefaults(defineProps<Props>(), {
  size: 'default',
});

const isOpen = defineModel<boolean>({ default: false });

const close = () => {
  isOpen.value = false;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  animation: modal-in 0.2s ease-out;
}

.modal-small { max-width: 340px; }
.modal-default { max-width: 400px; }
.modal-large { max-width: 600px; }

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
