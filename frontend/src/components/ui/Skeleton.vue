<script setup>
defineProps({
  type: {
    type: String,
    default: 'text', // text, rect, circle
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1em'
  },
  className: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div 
    class="animate-pulse bg-gray-200 rounded"
    :class="[className, { 'rounded-full': type === 'circle' }]"
    :style="{ width, height }"
  ></div>
</template>
