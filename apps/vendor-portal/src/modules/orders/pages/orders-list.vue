<template>
  <VcBlade
    :title="$t('ORDERS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="30%"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <VcTable
      class="grow basis-0"
      :expanded="expanded"
      :empty="empty"
      :loading="loading"
      :columns="columns"
      :items="orders"
      :itemActionBuilder="actionBuilder"
      :totalCount="totalCount"
      :pages="pages"
      :sort="sort"
      :searchValue="searchValue"
      :activeFilterCount="activeFilterCount"
      :selectedItemId="selectedItemId"
      :currentPage="currentPage"
      @search:change="onSearchList"
      @itemClick="onItemClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
      @headerClick="onHeaderClick"
      @selectionChanged="onSelectionChanged"
    >
      <!-- Filters -->
      <template v-slot:filters>
        <h2 v-if="$isMobile.value" class="my-4 text-[19px] font-bold">
          {{ $t("ORDERS.PAGES.LIST.FILTERS.TITLE") }}
        </h2>
        <VcContainer no-padding>
          <VcRow>
            <VcCol class="filter-col p-2">
              <div>
                {{ $t("ORDERS.PAGES.LIST.FILTERS.STATUS_FILTER") }}
              </div>
              <div>
                <VcCheckbox
                  class="mb-2"
                  :modelValue="filter.status === 'Unpaid'"
                  @update:modelValue="
                    filter.status = $event ? 'Unpaid' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.UNPAID") }}</VcCheckbox
                >
                <VcCheckbox
                  class="mb-2"
                  :modelValue="filter.status === 'Paid'"
                  @update:modelValue="
                    filter.status = $event ? 'Paid' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.PAID") }}</VcCheckbox
                >

                <VcCheckbox
                  class="mb-2"
                  :modelValue="filter.status === 'Accepted'"
                  @update:modelValue="
                    filter.status = $event ? 'Accepted' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.ACCEPTED") }}</VcCheckbox
                >
                <VcCheckbox
                  class="mb-2"
                  :modelValue="filter.status === 'Shipped'"
                  @update:modelValue="
                    filter.status = $event ? 'Shipped' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.SHIPPED") }}</VcCheckbox
                >
                <VcCheckbox
                  class="mb-2"
                  :modelValue="filter.status === 'Cancelled'"
                  @update:modelValue="
                    filter.status = $event ? 'Cancelled' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.CANCELLED") }}</VcCheckbox
                >
              </div>
            </VcCol>
            <VcCol class="p-2">
              <div>
                {{ $t("ORDERS.PAGES.LIST.FILTERS.ORDER_DATE") }}
              </div>
              <div>
                <VcInput
                  :label="$t('ORDERS.PAGES.LIST.FILTERS.START_DATE')"
                  type="date"
                  class="mb-3"
                  :modelValue="getFilterDate('startDate')"
                  @update:modelValue="setFilterDate('startDate', $event)"
                ></VcInput>
                <VcInput
                  :label="$t('ORDERS.PAGES.LIST.FILTERS.END_DATE')"
                  type="date"
                  :modelValue="getFilterDate('endDate')"
                  @update:modelValue="setFilterDate('endDate', $event)"
                ></VcInput>
              </div>
            </VcCol>
          </VcRow>
          <VcRow>
            <VcCol class="p-2">
              <div class="flex justify-end">
                <vc-button outline class="mr-4" @click="resetFilters">{{
                  $t("ORDERS.PAGES.LIST.FILTERS.RESET_FILTERS")
                }}</vc-button>
                <vc-button @click="applyFilters">{{
                  $t("ORDERS.PAGES.LIST.FILTERS.APPLY")
                }}</vc-button>
              </div>
            </VcCol>
          </VcRow>
        </VcContainer>
      </template>

      <!-- Not found template -->
      <template v-slot:notfound>
        <div
          class="w-full h-full box-border flex flex-col items-center justify-center"
        >
          <img src="/assets/empty-product.png" />
          <div class="m-4 text-xl font-medium">
            {{ $t("ORDERS.PAGES.LIST.NOT_FOUND.NO_ORDERS") }}
          </div>
          <vc-button @click="resetSearch">{{
            $t("ORDERS.PAGES.LIST.NOT_FOUND.RESET")
          }}</vc-button>
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div
          class="w-full h-full box-border flex flex-col items-center justify-center"
        >
          <img src="/assets/empty-product.png" />
          <div class="m-4 text-xl font-medium">
            {{ $t("ORDERS.PAGES.LIST.EMPTY") }}
          </div>
        </div>
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <VcStatus v-bind="statusStyle(itemData.item.status)">
          {{ itemData.item.status }}
        </VcStatus>
      </template>

      <template v-slot:mobile-item="itemData">
        <div class="p-3">
          <div class="w-full flex justify-evenly">
            <div class="grow basis-0">
              <div class="font-bold text-lg">
                {{ itemData.item.number }}
              </div>
              <VcHint class="mt-1">{{ itemData.item.customerName }}</VcHint>
            </div>
            <div>
              <VcStatus v-bind="statusStyle(itemData.item.status)">
                {{ itemData.item.status }}
              </VcStatus>
            </div>
          </div>
          <div>
            <div class="mt-3 w-full flex justify-between">
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0 mr-2"
              >
                <VcHint>{{ $t("ORDERS.PAGES.LIST.STATUS.TOTAL") }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ itemData.item.total }} {{ itemData.item.currency }}
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0 mr-2"
              >
                <VcHint>{{ $t("ORDERS.PAGES.LIST.STATUS.CREATED") }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{
                    itemData.item.createdDate &&
                    moment(itemData.item.createdDate).fromNow()
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";

export default defineComponent({
  url: "orders",
});
</script>

<script lang="ts" setup>
import { useOrders } from "../composables";
import { useFunctions, useI18n } from "@virtoshell/core";
import moment from "moment";
import OrdersDetails from "./orders-edit.vue";
import { CustomerOrder } from "@virtoshell/api-client";
import {
  IActionBuilderResult,
  ITableColumns,
  IBladeToolbar,
} from "../../../types";

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  param: {
    type: String,
    default: undefined,
  },

  options: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["page:open"]);
const {
  orders,
  loadOrders,
  loading,
  pages,
  currentPage,
  totalCount,
  changeOrderStatus,
} = useOrders();
const { debounce } = useFunctions();
const { t } = useI18n();
const filter = reactive({});
const appliedFilter = ref({});
const searchValue = ref();
const selectedItemId = ref();
const selectedOrdersIds = ref([]);
const sort = ref("createdDate:DESC");

onMounted(async () => {
  selectedItemId.value = props.param;
  await loadOrders();
});

watch(sort, async (value) => {
  await loadOrders({ ...filter, keyword: searchValue.value, sort: value });
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.CONFIRM")),
    icon: "fas fa-check",
    disabled: computed(() => !selectedOrdersIds.value?.length),
    isVisible: false,
  },
  {
    title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.CANCEL")),
    icon: "fas fa-times-circle",
    disabled: computed(() => !selectedOrdersIds.value?.length),
    isVisible: false,
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "number",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER")),
    width: 160,
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "customerName",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CUSTOMER")),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "total",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL")),
    width: 120,
    alwaysVisible: true,
    sortable: true,
    type: "money",
  },
  {
    id: "status",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: 120,
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED")),
    sortable: true,
    width: 180,
    type: "date-ago",
  },
]);

const empty = reactive({
  image: "/assets/empty-product.png",
  text: computed(() => t("ORDERS.PAGES.EMPTY")),
});

const onItemClick = (item: { id: string }) => {
  emit("page:open", {
    component: OrdersDetails,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const statusStyle = (status: string) => {
  const result = {
    outline: true,
    variant: "info",
  };

  switch (status) {
    case "Published":
      result.outline = false;
      result.variant = "success";
      break;
    case "New":
      result.outline = false;
      result.variant = "success";
      break;
    case "Cancelled":
      result.outline = true;
      result.variant = "danger";
      break;
    case "Shipped":
      result.outline = true;
      result.variant = "success";
  }
  return result;
};

const onPaginationClick = async (page: number) => {
  await loadOrders({
    skip: (page - 1) * 20,
  });
};

const actionBuilder = (item: CustomerOrder): IActionBuilderResult[] => {
  let result = [];

  if (item.status === "Paid" || item.status === "Unpaid") {
    result.push({
      icon: "fas fa-check",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.ACCEPT")),
      variant: "success",
      async clickHandler() {
        await changeOrderStatus(item.id, "Accepted");
        await reload();
      },
    });
  }

  if (item.status !== "Cancelled") {
    result.push({
      icon: "fas fa-times",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.CANCEL")),
      variant: "danger",
      async clickHandler() {
        await changeOrderStatus(item.id, "Cancelled");
        await reload();
      },
    });
  }

  if (item.status === "Accepted") {
    result.push({
      icon: "fas fa-shipping-fast",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.SHIP")),
      variant: "danger",
      async clickHandler() {
        item.status = "Shipped";
        item.status = "Shipped";
        await changeOrderStatus(item.id, "Cancelled");
        await reload();
      },
    });
  }

  return result;
};

const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await loadOrders({
    ...filter,
    keyword,
  });
}, 200);

const reload = async () => {
  await loadOrders({
    ...filter,
    keyword: searchValue.value,
  });
};

const onHeaderClick = (item: ITableColumns) => {
  const sortBy = [":DESC", ":ASC", ""];
  if (item.sortable) {
    item.sortDirection = (item.sortDirection ?? 0) + 1;
    if (sortBy[item.sortDirection % 3] === "") {
      sort.value = `${sortBy[item.sortDirection % 3]}`;
    } else {
      sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
    }
  }
};

const onSelectionChanged = (checkboxes: { [key: string]: boolean }) => {
  selectedOrdersIds.value = Object.entries(checkboxes)
    .filter(([id, isChecked]) => isChecked)
    .map(([id, isChecked]) => id);
};

const columns = computed(() => {
  if (props.expanded) {
    return tableColumns.value;
  } else {
    return tableColumns.value.filter((item) => item.alwaysVisible === true);
  }
});
const title = computed(() => t("ORDERS.PAGES.LIST.TITLE"));

function setFilterDate(key: string, value: string) {
  const date = new Date(value);
  if (date instanceof Date && !isNaN(date.valueOf())) {
    filter[key] = date;
  }
}
function getFilterDate(key: string) {
  const date = filter[key] as Date;
  if (date) {
    return moment(date).format("YYYY-MM-DD");
  }
  return undefined;
}
async function resetSearch() {
  searchValue.value = "";
  Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
  await loadOrders({
    ...filter,
    keyword: "",
  });
  appliedFilter.value = {};
}
const activeFilterCount = computed(
  () => Object.values(appliedFilter.value).filter((item) => !!item).length
);
async function applyFilters() {
  await loadOrders({
    ...filter,
  });
  appliedFilter.value = {
    ...filter,
  };
}
async function resetFilters() {
  Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
  await loadOrders({
    ...filter,
  });
  appliedFilter.value = {};
}

defineExpose({
  title,
  reload,
});
</script>
