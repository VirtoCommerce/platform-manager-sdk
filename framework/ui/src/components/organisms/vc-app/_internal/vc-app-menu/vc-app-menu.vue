<template>
  <div
    class="relative w-[var(--app-menu-width)] transition duration-100 pt-4"
    :class="{
      'vc-app-menu_mobile hidden !fixed !left-0 !top-0 !w-full !bottom-0 !z-[9999]':
        $isMobile.value,
      '!block': isMobileVisible,
    }"
  >
    <!-- Show backdrop overlay on mobile devices -->
    <div
      v-if="$isMobile.value"
      class="absolute left-0 top-0 right-0 bottom-0 z-[9998] bg-[#808c99] opacity-60"
      @click="isMobileVisible = false"
    ></div>
    <div class="vc-app-menu__inner flex flex-col h-full">
      <!-- Show menu close handler on mobile devices -->
      <div
        v-if="$isMobile.value"
        class="text-[#319ed4] flex justify-end items-center p-4"
      >
        <VcIcon
          icon="fas fa-times"
          size="xl"
          @click="isMobileVisible = false"
        ></VcIcon>
      </div>

      <!-- Show scrollable area with menu items -->
      <VcContainer :noPadding="true" class="grow basis-0">
        <div class="gap-[5px] flex flex-col px-4">
          <template
            v-for="(item, index) in mobileMenuItems"
            :key="`info_item_${index}`"
          >
            <template v-if="item.isVisible === undefined || item.isVisible">
              <component
                v-if="item.component"
                :is="item.component"
                v-bind="item.componentOptions"
                class="p-0 mb-2 w-full"
              ></component>
            </template>
          </template>
          <template v-for="(item, index) in items" :key="index">
            <VcAppMenuItem
              v-if="item.isVisible === undefined || item.isVisible"
              v-bind="item"
              :isActive="item === activeItem"
              :activeChildItem="activeChildItem"
              @click="
                $emit('item:click', item);
                isMobileVisible = false;
              "
              @child:click="
                $emit('item:click', $event);
                isMobileVisible = false;
              "
            />
          </template>
        </div>
      </VcContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import VcContainer from "../../../../atoms/vc-container/vc-container.vue";
import { IBladeToolbar, IMenuItems } from "../../../../../typings";

defineProps({
  // Array of menu items
  items: {
    type: Array as PropType<IMenuItems[]>,
    default: () => [],
  },

  mobileMenuItems: {
    type: Array as PropType<IBladeToolbar[]>,
    default: () => [],
  },

  activeItem: {
    type: Object as PropType<IMenuItems>,
    default: undefined,
  },

  activeChildItem: {
    type: Object as PropType<IMenuItems>,
    default: undefined,
  },
});

defineEmits(["item:click"]);

const isMobileVisible = ref(false);

defineExpose({
  isMobileVisible,
});
</script>

<style lang="scss">
:root {
  --app-menu-width: 230px;
  --app-menu-background-color: #ffffff;
}

.vc-app-menu {
  &_mobile &__inner {
    @apply absolute z-[9999] right-0 top-0 bottom-0 w-[300px] max-w-[60%] bg-[color:var(--app-menu-background-color)];
  }
}
</style>
