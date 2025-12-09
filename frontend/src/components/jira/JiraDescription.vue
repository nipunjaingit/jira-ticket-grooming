<script setup>
import JiraNode from './JiraNode.vue';

defineProps({
  description: {
    type: Object,
    default: null
  }
});
</script>

<template>
  <div class="jira-description text-gray-800">
    <template v-if="description && description.content">
      <JiraNode v-for="(node, i) in description.content" :key="i" :node="node" />
    </template>
    <div v-else class="text-gray-400 italic">
      No description provided.
    </div>
  </div>
</template>
