<template>
  <VcApp
    :menuItems="menuItems"
    :toolbarItems="toolbarItems"
    :isReady="isReady"
    :isAuthorized="isAuthorized"
    logo="/assets/logo.svg"
    :version="version"
    :pages="pages"
  >
    <!-- Product name -->
    <template v-slot:productName> Marketing Portal </template>

    <!-- Set up dashboard page -->
    <template v-slot:dashboard="scope">
      <DashboardPage v-bind="scope" />
    </template>

    <!-- Set up login form -->
    <template v-slot:login>
      <LoginPage
        logo="/assets/logo-black.svg"
        background="/assets/background.jpeg"
        title="Marketing Portal"
      ></LoginPage>
    </template>

    <template v-slot:notifications>
      <VcNotification
        v-for="item in popupNotifications"
        :key="item.id"
        :timeout="5000"
        @dismiss="dismiss(item)"
        @expired="markAsReaded(item)"
      >
        {{ item.title }}
      </VcNotification>
    </template>

    <template v-slot:passwordChange>
      <ChangePassword
        v-if="isChangePasswordActive"
        @close="isChangePasswordActive = false"
      ></ChangePassword>
    </template>
  </VcApp>
</template>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  ref,
  watch,
  reactive,
  inject,
  shallowRef,
} from "vue";
import LoginPage from "./Login.vue";
import DashboardPage from "./Dashboard.vue";
import UserDropdownButton from "../components/user-dropdown-button.vue";
import ChangePassword from "../components/change-password.vue";
import {
  useLogger,
  useI18n,
  useUser,
  useNotifications,
} from "@virtoshell/core";
import { IBladeToolbar, IMenuItems } from "../types";
import NotificationDropdown from "../components/notification-dropdown.vue";
import { useSignalR } from "@quangdao/vue-signalr";
import { PushNotification } from "@virtoshell/api-client";
import { PromotionsList } from "../modules/promotions";
import {
  ContentItemsList,
  ContentPlaceholdersList,
  ContentPublishing,
} from "../modules/dynamic-content";
import { useRouter } from "vue-router";

const { t } = useI18n();
const log = useLogger();
const signalr = useSignalR();
const { user, loadUser, signOut } = useUser();
const {
  popupNotifications,
  notifications,
  addNotification,
  dismiss,
  markAsReaded,
} = useNotifications();
const router = useRouter();
const isAuthorized = ref(false);
const isReady = ref(false);
const isChangePasswordActive = ref(false);
const pages = inject("pages");
const isDesktop = inject("isDesktop");
const isMobile = inject("isMobile");
const version = import.meta.env.PACKAGE_VERSION;

signalr.on("Send", (message: PushNotification) => {
  addNotification(message);
});

onMounted(async () => {
  await loadUser();
  isReady.value = true;
  if (!isAuthorized.value) {
    router.push("/login");
  }
});

watch(user, (value) => {
  isAuthorized.value = !!value?.userName;
});

log.debug(`Initializing App`);

const toolbarItems = reactive<IBladeToolbar[]>([
  {
    isVisible: isDesktop,
    isAccent: computed(() => {
      return !!notifications.value.filter((notification) => notification.isNew)
        .length;
    }),
    component: shallowRef(NotificationDropdown),
    componentOptions: {
      title: t("SHELL.TOOLBAR.NOTIFICATIONS"),
    },
  },
  {
    component: shallowRef(UserDropdownButton),
    componentOptions: {
      avatar: "/assets/avatar.jpg",
      name: computed(() => user.value?.userName),
      role: computed(() =>
        user.value?.isAdministrator ? "Administrator" : "User account"
      ),
      menuItems: [
        {
          title: t("SHELL.ACCOUNT.CHANGE_PASSWORD"),
          clickHandler() {
            isChangePasswordActive.value = true;
          },
        },
        {
          title: t("SHELL.ACCOUNT.LOGOUT"),
          async clickHandler() {
            signOut();
            router.push("/login");
          },
        },
      ],
    },
    isVisible: isDesktop,
  },
]);

const menuItems = reactive<IMenuItems[]>([
  {
    title: t("SHELL.MENU.DASHBOARD"),
    icon: "fas fa-home",
    isVisible: true,
    clickHandler(app) {
      app.openDashboard();
      router.push("/");
    },
  },
  {
    title: t("SHELL.MENU.PROMOTIONS"),
    icon: "fas fa-bullhorn",
    isVisible: true,
    component: shallowRef(PromotionsList),
  },
  {
    title: t("SHELL.MENU.DYNAMIC_CONTENT.TITLE"),
    icon: "fas fa-vector-square",
    isVisible: true,
    component: shallowRef(),
    children: [
      {
        title: t("SHELL.MENU.DYNAMIC_CONTENT.CHILDREN.CONTENT_ITEMS.TITLE"),
        component: shallowRef(ContentItemsList),
      },
      {
        title: t(
          "SHELL.MENU.DYNAMIC_CONTENT.CHILDREN.CONTENT_PLACEHOLDERS.TITLE"
        ),
        component: shallowRef(ContentPlaceholdersList),
      },
      {
        title: t(
          "SHELL.MENU.DYNAMIC_CONTENT.CHILDREN.CONTENT_PUBLISHING.TITLE"
        ),
        component: shallowRef(ContentPublishing),
      },
    ],
  },
  {
    title: t("SHELL.ACCOUNT.LOGOUT"),
    icon: "fas fa-sign-out-alt",
    isVisible: isMobile,
    clickHandler() {
      signOut();
      router.push("/login");
    },
  },
]);
</script>

<style lang="scss">
.vc-theme_light {
  --background-color: #f5f6f9;
  --top-bar-color: #161d25;
  --basic-black-color: #333333;
  --tooltips-color: #a5a5a5;

  --primary-color: #43b0e6;
  --primary-color-hover: #319ed4;
  --primary-color-disabled: #a9ddf6;

  --special-color: #f89406;
  --special-color-hover: #eb8b03;
  --special-color-disabled: #fed498;

  /* Layout variables */
  --app-bar-height: 60px;
  --app-bar-background-color: var(--top-bar-color);
  --app-bar-toolbar-icon-background-hover: #2e3d4e;
  --app-bar-toolbar-item-width: 50px;
  --app-bar-divider-color: #2e3d4e;
  --app-bar-toolbar-icon-color: #7e8e9d;
  --app-bar-account-info-role-color: #838d9a;
}

html,
body,
#app {
  @apply font-roboto h-full w-full m-0 fixed overflow-hidden overscroll-y-none;
}

body {
  @apply text-base;
}

h1,
h2,
h3,
h4,
h5,
h6,
button,
input,
select,
textarea {
  @apply font-roboto;
}
::-webkit-input-placeholder {
  @apply font-roboto;
}
:-moz-placeholder {
  @apply font-roboto;
}
::-moz-placeholder {
  @apply font-roboto;
}
:-ms-input-placeholder {
  @apply font-roboto;
}

.vc-app.vc-theme_light {
  --background-color: #f2f2f2;
  --top-bar-color: #ffffff;
  --app-bar-background-color: #ffffff;
  --app-bar-divider-color: #ffffff;
  --app-bar-toolbar-item-width: 50px;
  --app-bar-toolbar-icon-color: #7e8e9d;
  --app-bar-toolbar-icon-color-hover: #465769;
  --app-bar-toolbar-icon-background-hover: #ffffff;
  --app-bar-account-info-name-color: #161d25;
  --app-bar-account-info-role-color: #7e8e9d;
}
</style>
