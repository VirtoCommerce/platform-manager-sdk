<template>
  <div
    class="vc-blade relative flex shrink-0 flex-col bg-[color:var(--blade-background-color)] rounded-[var(--blade-border-radius)] shadow-[2px_2px_8px_rgba(126,142,157,0.14)] my-4 mx-2 overflow-hidden transition-[width] duration-200"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
    :class="[$attrs.class, { '!w-full shrink': $isMobile.value || expanded }]"
  >
    <!-- Init blade header -->
    <VcBladeHeader
      class="shrink-0"
      v-if="!$isMobile.value || closable"
      :expanded="expanded"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      @close="$emit('close')"
    >
      <template v-slot:actions v-if="$slots['actions']">
        <slot name="actions"></slot>
      </template>
    </VcBladeHeader>

    <!-- Set up blade toolbar -->
    <VcBladeToolbar class="shrink-0" :items="toolbarItems"></VcBladeToolbar>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import VcBladeHeader from "./_internal/vc-blade-header/vc-blade-header.vue";
import VcBladeToolbar from "./_internal/vc-blade-toolbar/vc-blade-toolbar.vue";
import { IBladeToolbar } from "../../../typings";

defineProps({
  icon: {
    type: String,
  },

  title: {
    type: String,
  },

  subtitle: {
    type: String,
  },

  width: {
    type: [Number, String],
    default: "30%",
  },

  expanded: {
    type: Boolean,
    default: false,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  toolbarItems: {
    type: Array as PropType<IBladeToolbar[]>,
    default: () => [],
  },
});
</script>

<style lang="less">
:root {
  --blade-background-color: #ffffff;
  --blade-border-radius: 6px;
}

.vc-app_mobile .vc-blade {
  @apply m-0 rounded-none;
}
</style>
