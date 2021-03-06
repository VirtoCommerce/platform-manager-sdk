<template>
  <VcBlade
    :title="$t('PRODUCTS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <VcTable
      class="grow basis-0"
      :loading="loading"
      :expanded="expanded"
      :columns="columns"
      :items="products"
      :itemActionBuilder="actionBuilder"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :searchPlaceholder="$t('PRODUCTS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :totalLabel="$t('PRODUCTS.PAGES.LIST.TABLE.TOTALS')"
      :searchValue="searchValue"
      :activeFilterCount="activeFilterCount"
      :selectedItemId="selectedItemId"
      @search:change="onSearchList"
      :totalCount="totalCount"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
    >
      <!-- Filters -->
      <template
        v-slot:filters="{ closePanel }"
        v-if="!(options && options.query && options.query.searchFromAllSellers)"
      >
        <h2 v-if="$isMobile.value">
          {{ $t("PRODUCTS.PAGES.LIST.FILTERS.TITLE") }}
        </h2>
        <VcContainer no-padding>
          <VcRow>
            <VcCol class="w-[180px] p-2">
              <div class="mb-4 text-[#a1c0d4] font-bold text-[17px]">
                {{ $t("PRODUCTS.PAGES.LIST.FILTERS.STATUS_FILTER") }}
              </div>
              <div>
                <VcCheckbox
                  v-for="status in SellerProductStatus"
                  :key="status"
                  class="mb-2"
                  :modelValue="filter.status === status"
                  @update:modelValue="
                    filter.status = $event ? status : undefined
                  "
                  >{{
                    $t("PRODUCTS.PAGES.LIST.FILTERS.STATUS." + status)
                  }}</VcCheckbox
                >
              </div>
            </VcCol>
            <!--
            <VcCol class="w-[180px] p-2">
              <div class="mb-4 text-[#a1c0d4] font-bold text-[17px]">
                {{ $t("PRODUCTS.PAGES.LIST.FILTERS.PRICE_BETWEEN.TITLE") }}
              </div>
              <div>
                <VcInput
                  :label="$t('PRODUCTS.PAGES.LIST.FILTERS.PRICE_BETWEEN.FROM')"
                  class="mb-3"
                  :modelValue="filter.priceStart"
                  @update:modelValue="filter.priceStart = $event"
                ></VcInput>
                <VcInput
                  :label="$t('PRODUCTS.PAGES.LIST.FILTERS.PRICE_BETWEEN.TO')"
                  :modelValue="filter.priceEnd"
                  @update:modelValue="filter.priceEnd = $event"
                ></VcInput>
              </div>
            </VcCol>
            <VcCol class="w-[180px] p-2">
              <div class="mb-4 text-[#a1c0d4] font-bold text-[17px]">
                {{ $t("PRODUCTS.PAGES.LIST.FILTERS.CREATED_DATE.TITLE") }}
              </div>
              <div>
                <VcInput
                  :label="
                    $t('PRODUCTS.PAGES.LIST.FILTERS.CREATED_DATE.START_DATE')
                  "
                  type="date"
                  class="mb-3"
                ></VcInput>
                <VcInput
                  :label="
                    $t('PRODUCTS.PAGES.LIST.FILTERS.CREATED_DATE.END_DATE')
                  "
                  type="date"
                ></VcInput>
              </div>
            </VcCol>
             -->
          </VcRow>
          <VcRow>
            <VcCol class="p-2">
              <div class="flex justify-end">
                <VcButton outline class="mr-4" @click="resetFilters">{{
                  $t("PRODUCTS.PAGES.LIST.FILTERS.RESET_FILTERS")
                }}</VcButton>
                <VcButton @click="applyFilters(closePanel)">{{
                  $t("PRODUCTS.PAGES.LIST.FILTERS.APPLY")
                }}</VcButton>
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
            {{ $t("PRODUCTS.PAGES.LIST.NOT_FOUND.EMPTY") }}
          </div>
          <VcButton @click="resetSearch">{{
            $t("PRODUCTS.PAGES.LIST.NOT_FOUND.RESET")
          }}</VcButton>
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div
          class="w-full h-full box-border flex flex-col items-center justify-center"
        >
          <img src="/assets/empty-product.png" />
          <div class="m-4 text-xl font-medium">
            {{ $t("PRODUCTS.PAGES.LIST.EMPTY.NO_PRODUCTS") }}
          </div>
          <VcButton @click="addProduct">{{
            $t("PRODUCTS.PAGES.LIST.EMPTY.ADD")
          }}</VcButton>
        </div>
      </template>

      <!-- Override name column template -->
      <template v-slot:item_name="itemData">
        <div class="flex flex-col">
          <div class="text-ellipsis overflow-hidden whitespace-nowrap">
            {{ itemData.item.name }}
          </div>
          <VcHint class="text-ellipsis overflow-hidden whitespace-nowrap mt-1">
            {{ itemData.item.path }}
          </VcHint>
        </div>
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <mp-product-status :status="itemData.item.status" class="mb-1" />
      </template>

      <template v-slot:mobile-item="itemData">
        <div
          class="border-b border-solid border-b-[#e3e7ec] p-3 flex flex-nowrap"
        >
          <VcImage
            class="shrink-0"
            aspect="1x1"
            size="m"
            :bordered="true"
            :src="itemData.item.imgSrc"
          />
          <div class="grow basis-0 ml-3">
            <div class="font-bold text-lg">
              {{ itemData.item.name }}
            </div>
            <VcHint class="mt-1">{{ itemData.item.path }}</VcHint>

            <div class="mt-2 mb-3">
              <mp-product-status class="mt-3" :status="itemData.item.status" />
            </div>

            <div class="mt-3 w-full flex justify-between">
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0 mr-2"
              >
                <VcHint>{{ $t("PRODUCTS.PAGES.LIST.MOBILE.EAN_GTIN") }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{
                    itemData.item.productData && itemData.item.productData.gtin
                  }}
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0 mr-2"
              >
                <VcHint>{{ $t("PRODUCTS.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{
                    itemData.item.createdDate &&
                    moment(itemData.item.createdDate).fromNow()
                  }}
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0 mr-2"
              >
                <div class="flex flex-col items-center">
                  <VcHint>{{
                    $t("PRODUCTS.PAGES.LIST.MOBILE.PUBLISHED")
                  }}</VcHint>
                  <div
                    class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                  >
                    <VcStatusIcon
                      :status="itemData.item && itemData.item.isPublished"
                    ></VcStatusIcon>
                  </div>
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
  ref,
  onMounted,
  computed,
  watch,
  reactive,
  getCurrentInstance,
} from "vue";

export default defineComponent({
  url: "products",
});
</script>

<script lang="ts" setup>
import { useI18n, useLogger, useFunctions } from "@virtoshell/core";
import { useProducts } from "../composables";
import MpProductStatus from "../components/MpProductStatus.vue";
import ProductsEdit from "./products-edit.vue";
import moment from "moment";
import {
  IActionBuilderResult,
  ITableColumns,
  IBladeToolbar,
} from "../../../types";
import { ISellerProduct } from "../../../api_client/marketplacevendor";

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
const emit = defineEmits(["page:close", "page:open"]);
const logger = useLogger();
const { debounce } = useFunctions();
const { t } = useI18n();
const {
  products,
  totalCount,
  pages,
  currentPage,
  loadProducts,
  loading,
  searchQuery,
  SellerProductStatus,
  exportCategories,
} = useProducts(props.options.query);
const filter = reactive<{
  status?: string;
  priceStart?: string;
  priceEnd?: string;
}>({});
const appliedFilter = ref({});

const sort = ref("createdDate:DESC");
const searchValue = ref();
const selectedItemId = ref();

watch(sort, async (value) => {
  await loadProducts({ ...searchQuery.value, sort: value });
});

onMounted(async () => {
  selectedItemId.value = props.param;
  await loadProducts({ sort: sort.value });
});

const reload = async () => {
  logger.debug("Products list reload");
  await loadProducts({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * searchQuery.value.take,
    sort: sort.value,
  });
};

const onSearchList = debounce(async (keyword: string) => {
  logger.debug(`Products list search by ${keyword}`);
  searchValue.value = keyword;
  await loadProducts({
    ...searchQuery.value,
    keyword,
  });
}, 200);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    async clickHandler() {
      emit("page:open", {
        component: ProductsEdit,
      });
    },
  },
  {
    id: "export",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.EXPORT_CATEGORIES")),
    icon: "fas fa-file-export",
    async clickHandler() {
      await exportCategories();
    },
  },
  {
    id: "batchDelete",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.BULK_DELETE")),
    icon: "fas fa-trash",
    isVisible: false,
    async clickHandler() {
      logger.debug("Delete selected products");
    },
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE")),
    width: 60,
    alwaysVisible: true,
    type: "image",
  },
  {
    id: "name",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME")),
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: 140,
    sortable: true,
    type: "date-ago",
  },
  {
    id: "isPublished",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.PUBLISHED")),
    type: "status-icon",
    width: 180,
    align: "center",
    sortable: true,
  },
  {
    id: "status",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: 180,
    sortable: true,
  },
  {
    id: "gtin",
    field: "productData.gtin",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.GTIN")),
    width: 180,
    alwaysVisible: true,
  },
]);

const columns = computed(() => {
  if (props.expanded) {
    return tableColumns.value;
  } else {
    return tableColumns.value.filter((item) => item.alwaysVisible === true);
  }
});
const title = computed(() => t("PRODUCTS.PAGES.LIST.TITLE"));
const activeFilterCount = computed(
  () => Object.values(appliedFilter.value).filter((item) => !!item).length
);

const onItemClick = (item: { id: string }) => {
  emit("page:open", {
    component: ProductsEdit,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
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

const onPaginationClick = async (page: number) => {
  await loadProducts({
    ...searchQuery.value,
    skip: (page - 1) * searchQuery.value.take,
  });
};

const actionBuilder = (product: ISellerProduct): IActionBuilderResult[] => {
  let result = [];

  // const statuses =
  //   product.status?.split(",").map((item) => item.trim()) || [];

  /*if (statuses.includes("Published")) {
        result.push({
          icon: "fas fa-times",
          title: computed(() => t("PRODUCTS.PAGES.LIST.ACTIONS.UNPUBLISH")),
          variant: "danger",
          clickHandler() {
            alert("Unpublish");
          },
        });
      } else {
        result.push({
          icon: "fas fa-check",
          title: computed(() => t("PRODUCTS.PAGES.LIST.ACTIONS.PUBLISH")),
          variant: "success",
          clickHandler() {
            alert("Publish");
          },
        });
      }

      result.push({
        icon: "fas fa-trash",
        title: "Delete",
        variant: "danger",
        leftActions: true,
        clickHandler(item: ISellerProduct) {
          if (window.confirm("Delete " + item.id)) {
          }
        },
      });*/

  /*result.push(
        ...[
          {
            icon: "fas fa-clock",
            title: "Other action",
            clickHandler() {
              alert("Other action");
            },
          },
          {
            icon: "fas fa-clock",
            title: "Other action2",
            clickHandler() {
              alert("Other action");
            },
          },
        ]
      );*/

  return result;
};

async function resetSearch() {
  searchValue.value = "";
  Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
  await loadProducts({
    ...searchQuery.value,
    ...filter,
    keyword: "",
  });
  appliedFilter.value = {};
}
function addProduct() {
  emit("page:open", {
    component: ProductsEdit,
  });
}

async function applyFilters(filterHandlerFn: () => void) {
  filterHandlerFn();
  await loadProducts({
    ...searchQuery.value,
    ...filter,
  });
  appliedFilter.value = {
    ...filter,
  };
}
async function resetFilters() {
  Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
  await loadProducts({
    ...searchQuery.value,
    ...filter,
  });
  appliedFilter.value = {};
}

defineExpose({
  reload,
  title,
});
</script>
