<script setup>
import { computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

const type = computed(() => props.node.type);
const content = computed(() => props.node.content || []);
const text = computed(() => props.node.text || '');
const marks = computed(() => props.node.marks || []);

const hasMark = (markType) => marks.value.some(m => m.type === markType);

const isBold = computed(() => hasMark('strong'));
const isItalic = computed(() => hasMark('em'));
const isUnderline = computed(() => hasMark('underline'));
const isCode = computed(() => hasMark('code'));
const linkMark = computed(() => marks.value.find(m => m.type === 'link'));

const classes = computed(() => {
  return {
    'font-bold': isBold.value,
    'italic': isItalic.value,
    'underline': isUnderline.value,
    'bg-gray-100 px-1 rounded font-mono text-sm text-red-500': isCode.value
  };
});
</script>

<template>
  <!-- Text Node -->
  <span v-if="type === 'text'" :class="classes">
    <a 
      v-if="linkMark" 
      :href="linkMark.attrs.href" 
      target="_blank" 
      class="text-blue-600 hover:underline"
    >
      {{ text }}
    </a>
    <template v-else>{{ text }}</template>
  </span>

  <!-- Paragraph -->
  <p v-else-if="type === 'paragraph'" class="mb-2 leading-relaxed">
    <template v-if="content.length">
      <JiraNode v-for="(child, i) in content" :key="i" :node="child" />
    </template>
    <br v-else />
  </p>

  <!-- Bullet List -->
  <ul v-else-if="type === 'bulletList'" class="list-disc pl-5 mb-2 space-y-1">
    <JiraNode v-for="(child, i) in content" :key="i" :node="child" />
  </ul>

  <!-- Ordered List -->
  <ol v-else-if="type === 'orderedList'" class="list-decimal pl-5 mb-2 space-y-1">
    <JiraNode v-for="(child, i) in content" :key="i" :node="child" />
  </ol>

  <!-- List Item -->
  <li v-else-if="type === 'listItem'">
    <JiraNode v-for="(child, i) in content" :key="i" :node="child" />
  </li>

  <!-- Heading -->
  <h1 v-else-if="type === 'heading' && node.attrs.level === 1" class="text-2xl font-bold mt-4 mb-2">
    <JiraNode v-for="(child, i) in content" :key="i" :node="child" />
  </h1>
  <h2 v-else-if="type === 'heading' && node.attrs.level === 2" class="text-xl font-bold mt-3 mb-2">
    <JiraNode v-for="(child, i) in content" :key="i" :node="child" />
  </h2>
  <h3 v-else-if="type === 'heading' && node.attrs.level === 3" class="text-lg font-bold mt-2 mb-1">
    <JiraNode v-for="(child, i) in content" :key="i" :node="child" />
  </h3>
  
  <!-- Code Block -->
  <pre v-else-if="type === 'codeBlock'" class="bg-gray-800 text-gray-100 p-3 rounded mb-3 overflow-x-auto">
    <code><JiraNode v-for="(child, i) in content" :key="i" :node="child" /></code>
  </pre>

  <!-- Blockquote -->
  <blockquote v-else-if="type === 'blockquote'" class="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600">
    <JiraNode v-for="(child, i) in content" :key="i" :node="child" />
  </blockquote>

  <!-- Fallback for unknown types -->
  <div v-else class="text-gray-400 text-xs">
    [Unknown type: {{ type }}]
  </div>
</template>
