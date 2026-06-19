<script setup lang="ts">
import type { Content } from '~/types/content'

defineProps<{
  content?: Content | null | any
}>()
</script>

<template>
  <main class="c-app-main">
    <CoreNotFound v-if="content?.post?.error" />
    <div class="l-container">
      <slot v-if="content"></slot>
      <div v-else class="c-skeleton-loader"></div>
    </div>
  </main>
</template>
