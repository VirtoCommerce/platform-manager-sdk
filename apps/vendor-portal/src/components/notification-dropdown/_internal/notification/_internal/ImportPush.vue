<template>
  <slot name="title" v-bind:title="notification.title"></slot>
  <VcHint class="mb-1" v-if="notification.profileName"
    >{{ $t("SHELL.NOTIFICATIONS.PROFILE") }}
    <b>{{ notification.profileName }}</b></VcHint
  >
  <div v-if="notification.errors && notification.errors.length">
    <VcHint>
      {{ $t("SHELL.NOTIFICATIONS.ERRORS") }}:
      {{ notification.errors && notification.errors.length }}</VcHint
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { ImportPushNotification } from "../../../../../api_client/marketplacevendor";

defineProps({
  notification: {
    type: Object as PropType<ImportPushNotification>,
    default: () => ({}),
  },
});
</script>
