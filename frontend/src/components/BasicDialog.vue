<script setup>
defineProps({
  open: Boolean
})
defineEmits(['close'])
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="bg-white rounded-lg shadow-xl w-[80%] max-h-[90vh] overflow-y-auto relative">
      <button 
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      <slot></slot>
    </div>
  </div>
</template>
