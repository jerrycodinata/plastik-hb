<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import index from "../index.vue";
import { getPage, updateHomepage } from "../../api/pageApi";
import { fetchFeaturedProducts, fetchProducts } from "../../api/productApi";
import { updateFeaturedProducts } from "../../api/updateFeaturedProducts";
import { uploadImage } from "../../api/uploadApi";
import AppAlert from "../../components/AppAlert.vue";
import CardListEditor from "../../components/CardListEditor.vue";
import FeaturedProductCard from "../../components/FeaturedProductCard.vue";
import ImageUploadCard from "../../components/ImageUploadCard.vue";
import LivePreviewCard from "../../components/LivePreviewCard.vue";
import ProductSelectionDialog from "../../components/ProductSelectionDialog.vue";

// Image Backend URL
const imageBackendUrl = import.meta.env.VITE_API_URL;

// Banner Interface
interface Banner {
  order: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
}

// Achievement Interface
interface Achievement {
  order: number;
  title: string;
  percentage: number;
  description: string;
  image?: string;
}

// Asset Interface
interface Asset {
  id: string;
  url: string;
  alt: string;
  type: "IMAGE" | "VIDEO";
  created_at: string;
  updated_at: string;
  product_id: string;
}

// Category Interface
interface CategoryObj {
  id: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// Featured Product Interface
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  specification: string;
  category_id: string;
  discount?: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  assets: Asset[];
  category: CategoryObj;
}

interface TrustedByPartner {
  order: number;
  title: string;
  image: string;
}

// Page Data Interface
interface PageData {
  title: string;
  slug: string;
  description: string;
  published: boolean;
  sections: Array<{
    type: string;
    order: number;
    visible: boolean;
    data: {
      banners?: Banner[];
      achievements?: Achievement[];
      partners?: TrustedByPartner[];
    };
  }>;
}

// Alert state
const alertVisible = ref(false);
const alertType = ref<"success" | "error">("success");
const alertTitle = ref("");
const alertMessage = ref("");

// Form state
const loading = ref(false);
const saveLoading = ref(false);
const catalogLoading = ref(false);

// All products from catalog
const catalogProducts = ref<Product[]>([]);
const pageData = ref<PageData | null>(null);
const errorMessage = ref("");

async function fetchAllProducts() {
  try {
    if (Array.isArray(await fetchProducts())) {
      catalogProducts.value = (await fetchProducts()) as Product[];
    } else {
      const response = await fetchProducts();
      catalogProducts.value =
        (response as any).data || (response as any).products || [];
    }
  } catch (error: any) {
    showAlert("error", "Gagal", error);
  }
}

// Product selection dialog
const productSelectionDialog = ref(false);
const selectedProductIdsDialog = ref<string[]>([]);
// Single product selection (for addSelectedProduct, legacy support)
const selectedProductId = ref<string | null>(null);

// File input refs
const bannerFileInputRefs = ref<(HTMLInputElement | null)[]>([]);
const achievementFileInputRefs = ref<(HTMLInputElement | null)[]>([]);
const trustedByFileInputRefs = ref<(HTMLInputElement | null)[]>([]);

// Computed properties
const selectedProductIds = computed(() =>
  featuredProducts.value.map((p) => p.id)
);

const availableProducts = computed(() =>
  catalogProducts.value.filter(
    (product) => !selectedProductIds.value.includes(product.id)
  )
);

// Product search for selection dialog
const productSearch = ref("");
const filteredAvailableProducts = computed(() => {
  if (!productSearch.value) return availableProducts.value;
  return availableProducts.value.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.value.toLowerCase()) ||
      product.description
        ?.toLowerCase()
        .includes(productSearch.value.toLowerCase())
  );
});

// Remove featuredProducts computed and instead fetch featured products from API
const featuredProducts = ref<Product[]>([]);

async function fetchFeatured() {
  try {
    const response = await fetchFeaturedProducts();
    featuredProducts.value = Array.isArray(response)
      ? response
      : (response as any).data || [];
  } catch (error: any) {
    errorMessage.value = error;
  }
}

// Alert functions
const showAlert = (
  type: "success" | "error",
  title: string,
  message: string
) => {
  alertType.value = type;
  alertTitle.value = title;
  alertMessage.value = message;
  alertVisible.value = true;

  setTimeout(() => {
    alertVisible.value = false;
  }, 5000);
};

// --- Banner State as Ref ---
const banners = ref<Banner[]>([]);

// Sync banners with pageData on fetch
watch(
  () => pageData.value,
  (val) => {
    // Accept both BANNER and BANNERS for section type
    const arr = val?.sections.find(
      (s) => s.type === "BANNERS" || s.type === "BANNER"
    )?.data.banners;
    banners.value = arr ? JSON.parse(JSON.stringify(arr)) : [];
    // Always show at least one banner form
    if (banners.value.length === 0) {
      banners.value.push({
        order: 1,
        image: "",
        title: "",
        subtitle: "",
        buttonText: "",
        buttonLink: "",
      });
    }
  },
  { immediate: true }
);

// Automatically sync banners to pageData.sections[0] when they change
watch(
  banners,
  (newBanners) => {
    if (
      pageData.value &&
      pageData.value.sections &&
      pageData.value.sections[0] &&
      pageData.value.sections[0].data
    ) {
      pageData.value.sections[0].data.banners = JSON.parse(
        JSON.stringify(newBanners)
      );
    }
  },
  { deep: true }
);

// Update pageData banners before save
const syncBannersToPageData = () => {
  if (pageData.value) {
    const section = pageData.value.sections.find((s) => s.type === "BANNERS");
    if (section)
      section.data.banners = JSON.parse(JSON.stringify(banners.value));
  }
};

// Banner functions (keeping existing banner functions)
const addBanner = () => {
  banners.value.push({
    order: banners.value.length + 1,
    image: "",
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
  });
};

const removeBanner = (index: number) => {
  if (banners.value.length > 1) {
    banners.value.splice(index, 1);
  }
};

// --- Achievements State as Ref ---
const achievements = ref<Achievement[]>([]);

// Sync achievements with pageData on fetch
watch(
  () => pageData.value,
  (val) => {
    const arr = val?.sections.find((s) => s.type === "ACHIEVEMENTS")?.data
      .achievements;
    achievements.value = arr ? JSON.parse(JSON.stringify(arr)) : [];
  },
  { immediate: true }
);

// Automatically sync banners and achievements to pageData.sections when they change
watch(
  achievements,
  (newAchievements) => {
    if (
      pageData.value &&
      pageData.value.sections &&
      pageData.value.sections[1] &&
      pageData.value.sections[1].data
    ) {
      pageData.value.sections[1].data.achievements = JSON.parse(
        JSON.stringify(newAchievements)
      );
    }
  },
  { deep: true }
);

// Update pageData achievements before save
const syncAchievementsToPageData = () => {
  if (pageData.value) {
    const section = pageData.value.sections.find(
      (s) => s.type === "ACHIEVEMENTS"
    );
    if (section)
      section.data.achievements = JSON.parse(
        JSON.stringify(achievements.value)
      );
  }
};

// Update add/remove/clear/upload to use achievements ref
const addAchievement = () => {
  achievements.value.push({
    order: achievements.value.length + 1,
    title: "",
    percentage: 0,
    description: "",
    image: "",
  });
};
const removeAchievement = (index: number) => {
  if (achievements.value.length > 1) achievements.value.splice(index, 1);
};

// --- Trusted By State as Ref ---
const trustedByPartners = ref<
  { order: number; title: string; image: string }[]
>([]);

// Sync trustedByPartners with pageData on fetch
watch(
  () => pageData.value,
  (val) => {
    const arr = val?.sections.find((s) => s.type === "TRUSTEDBY")?.data
      .partners;
    trustedByPartners.value = arr ? JSON.parse(JSON.stringify(arr)) : [];
  },
  { immediate: true }
);

// Automatically sync trustedByPartners to pageData.sections when they change
watch(
  trustedByPartners,
  (newPartners) => {
    if (pageData.value) {
      const section = pageData.value.sections.find(
        (s) => s.type === "TRUSTEDBY"
      );
      if (section)
        section.data.partners = JSON.parse(JSON.stringify(newPartners));
    }
  },
  { deep: true }
);

// Trusted By Editor functions
const addTrustedByPartner = () => {
  trustedByPartners.value.push({
    order: trustedByPartners.value.length + 1,
    title: "",
    image: "",
  });
};
const removeTrustedByPartner = (index: number) => {
  if (trustedByPartners.value.length > 1)
    trustedByPartners.value.splice(index, 1);
};
const handleTrustedByImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      trustedByPartners.value[index].image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Drag and drop for Trusted By
const dragTrustedByIndex = ref<number | null>(null);
const dragOverTrustedByIndex = ref<number | null>(null);
const onTrustedByDragStart = (index: number) => {
  dragTrustedByIndex.value = index;
};
const onTrustedByDragOver = (index: number) => {
  dragOverTrustedByIndex.value = index;
};
const onTrustedByDrop = (index: number) => {
  if (dragTrustedByIndex.value !== null && dragTrustedByIndex.value !== index) {
    const moved = trustedByPartners.value.splice(
      dragTrustedByIndex.value,
      1
    )[0];
    trustedByPartners.value.splice(index, 0, moved);
  }
  dragTrustedByIndex.value = null;
  dragOverTrustedByIndex.value = null;
};
const onTrustedByDragEnd = () => {
  dragTrustedByIndex.value = null;
  dragOverTrustedByIndex.value = null;
};

// Fetch catalog products
const fetchCatalogProducts = async () => {
  catalogLoading.value = true;
  try {
    if (Array.isArray(await fetchProducts())) {
      catalogProducts.value = (await fetchProducts()) as Product[];
    } else {
      const response = await fetchProducts();
      catalogProducts.value =
        (response as any).data || (response as any).products || [];
    }
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    // Optionally show an alert or handle error
  } finally {
    catalogLoading.value = false;
  }
};

// Fetch homepage data
const fetchPageData = async () => {
  loading.value = true;
  try {
    const response = await getPage("homepage");
    // Handle both direct data and wrapped response
    pageData.value = response as PageData;

    if (!pageData.value) {
      throw new Error("No page data received from server");
    }

    console.log("Page data loaded successfully:", pageData.value);
  } catch (error: any) {
    console.error("Failed to fetch page data:", error);
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Failed to load page data.";
    showAlert("error", "Gagal", "Gagal memuat data halaman utama");
  } finally {
    loading.value = false;
  }
};

// Save homepage data
const saveHomepageData = async () => {
  saveLoading.value = true;
  try {
    // Validate pageData exists
    if (!pageData.value) {
      throw new Error("No page data to save");
    }

    // Validate required fields
    if (!pageData.value.title || !pageData.value.sections) {
      throw new Error("Missing required fields: title and sections");
    }

    // Sync banners and achievements to pageData before saving
    syncBannersToPageData();
    syncAchievementsToPageData();

    console.log("Saving homepage data:", pageData.value);

    // Save featured products
    await updateFeaturedProducts(featuredProducts.value.map((p) => p.id));

    // Save homepage content
    const response = await updateHomepage({
      title: pageData.value.title,
      description: pageData.value.description,
      published: pageData.value.published,
      sections: pageData.value.sections,
    });

    showAlert(
      "success",
      "Berhasil",
      "Data halaman utama & produk andalan berhasil disimpan!"
    );

    // Refresh only the live preview after successful save
    setTimeout(() => {
      refreshPreview();
    }, 1000);
  } catch (error: any) {
    console.error("Error saving homepage data:", error);
    showAlert(
      "error",
      "Gagal",
      error?.message || "Gagal menyimpan data halaman utama"
    );
  } finally {
    saveLoading.value = false;
  }
};

// Preview state
const previewKey = ref(0);
const previewTimestamp = ref(Date.now());

// Preview functions
const refreshPreview = () => {
  previewKey.value += 1;
  previewTimestamp.value = Date.now();
};

const openHomepage = () => {
  window.open("/", "_blank");
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Featured Products Section (NEW)
const removeFeaturedProduct = (index: number) => {
  if (featuredProducts.value.length > 0) {
    featuredProducts.value.splice(index, 1);
  }
};

// Update addSelectedProduct for bulk add
const addSelectedProducts = () => {
  const newProducts = catalogProducts.value.filter(
    (p) =>
      selectedProductIdsDialog.value.includes(p.id) &&
      !featuredProducts.value.some((fp) => fp.id === p.id)
  );
  featuredProducts.value.push(...newProducts);
  selectedProductIdsDialog.value = [];
  productSelectionDialog.value = false;
};

// --- Banner Editor Modal State ---
const bannerEditorDialog = ref(false);
const editingBannerIndex = ref<number | null>(null);
const editingBanner = ref<Banner | null>(null);
const bannerEditorFileInputRef = ref<HTMLInputElement | null>(null);

// --- Banner Card Menu State ---
const bannerMenuOpenIndex = ref<number | null>(null);

// --- Banner Drag State (for new editor) ---
const dragBannerIndex = ref<number | null>(null);
const dragOverBannerEditorIndex = ref<number | null>(null);

// --- Banner Editor Functions ---
const openBannerMenu = (index: number) => {
  bannerMenuOpenIndex.value = index;
};
const closeBannerMenu = () => {
  bannerMenuOpenIndex.value = null;
};
const openBannerEditor = (index: number) => {
  editingBannerIndex.value = index;
  editingBanner.value = { ...banners.value[index] };
  bannerEditorDialog.value = true;
  closeBannerMenu();
};
const closeBannerEditor = () => {
  bannerEditorDialog.value = false;
  editingBannerIndex.value = null;
  editingBanner.value = null;
};
const saveBannerEdit = () => {
  if (editingBannerIndex.value !== null && editingBanner.value) {
    banners.value[editingBannerIndex.value] = { ...editingBanner.value };
    closeBannerEditor();
  }
};

// For ImageUploadCard compatibility (accepts both Event and DragEvent)
const handleBannerEditorImageUploadCard = async (
  payload: Event | DragEvent
) => {
  let file: File | undefined;
  if ("dataTransfer" in payload && payload.dataTransfer?.files?.length) {
    file = payload.dataTransfer.files[0];
  } else if (
    "target" in payload &&
    (payload.target as HTMLInputElement)?.files?.length
  ) {
    file = (payload.target as HTMLInputElement).files?.[0];
  }
  if (file && editingBanner.value) {
    try {
      const imageUrl = await uploadImage(file);
      editingBanner.value.image = imageUrl.startsWith("http")
        ? imageUrl
        : imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert("error", "Upload Gagal", "Gagal mengupload gambar banner");
    }
  }
};
const clearBannerEditorImage = () => {
  if (editingBanner.value) editingBanner.value.image = "";
};
// Drag-and-drop for new editor
const onBannerEditorDragStart = (index: number) => {
  dragBannerIndex.value = index;
};
const onBannerEditorDragOver = (index: number) => {
  dragOverBannerEditorIndex.value = index;
};
const onBannerEditorDrop = (index: number) => {
  if (dragBannerIndex.value !== null && dragBannerIndex.value !== index) {
    const moved = banners.value.splice(dragBannerIndex.value, 1)[0];
    banners.value.splice(index, 0, moved);
  }
  dragBannerIndex.value = null;
  dragOverBannerEditorIndex.value = null;
};
const onBannerEditorDragEnd = () => {
  dragBannerIndex.value = null;
  dragOverBannerEditorIndex.value = null;
};

// --- Achievement Drag State ---
const dragAchievementIndex = ref<number | null>(null);
const dragOverAchievementIndex = ref<number | null>(null);

const onAchievementDragStart = (index: number) => {
  dragAchievementIndex.value = index;
};
const onAchievementDragOver = (index: number) => {
  dragOverAchievementIndex.value = index;
};
const onAchievementDrop = (index: number) => {
  if (
    dragAchievementIndex.value !== null &&
    dragAchievementIndex.value !== index
  ) {
    const moved = achievements.value.splice(dragAchievementIndex.value, 1)[0];
    achievements.value.splice(index, 0, moved);
  }
  dragAchievementIndex.value = null;
  dragOverAchievementIndex.value = null;
};
const onAchievementDragEnd = () => {
  dragAchievementIndex.value = null;
  dragOverAchievementIndex.value = null;
};

// --- Achievement Card Menu & Editor State ---
const achievementMenuOpenIndex = ref<number | null>(null);
const achievementEditorDialog = ref(false);
const editingAchievementIndex = ref<number | null>(null);
const editingAchievement = ref<Achievement | null>(null);
const achievementEditorFileInputRef = ref<HTMLInputElement | null>(null);

// --- Achievement Card Menu Functions ---
const openAchievementMenu = (index: number) => {
  achievementMenuOpenIndex.value = index;
};
const closeAchievementMenu = () => {
  achievementMenuOpenIndex.value = null;
};

// --- Achievement Editor Functions ---
const openAchievementEditor = (index: number) => {
  editingAchievementIndex.value = index;
  editingAchievement.value = { ...achievements.value[index] };
  achievementEditorDialog.value = true;
  closeAchievementMenu();
};
const closeAchievementEditor = () => {
  achievementEditorDialog.value = false;
  editingAchievementIndex.value = null;
  editingAchievement.value = null;
};
const saveAchievementEdit = () => {
  if (editingAchievementIndex.value !== null && editingAchievement.value) {
    achievements.value[editingAchievementIndex.value] = {
      ...editingAchievement.value,
    };
    closeAchievementEditor();
  }
};
// For ImageUploadCard compatibility (accepts both Event and DragEvent)
const handleAchievementEditorImageUploadCard = async (
  payload: Event | DragEvent
) => {
  let file: File | undefined;
  if ("dataTransfer" in payload && payload.dataTransfer?.files?.length) {
    file = payload.dataTransfer.files[0];
  } else if (
    "target" in payload &&
    (payload.target as HTMLInputElement)?.files?.length
  ) {
    file = (payload.target as HTMLInputElement).files?.[0];
  }
  if (file && editingAchievement.value) {
    try {
      const imageUrl = await uploadImage(file);
      editingAchievement.value.image = imageUrl.startsWith("http")
        ? imageUrl
        : imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert("error", "Upload Gagal", "Gagal mengupload gambar achievement");
    }
  }
};
const clearAchievementEditorImage = () => {
  if (editingAchievement.value) editingAchievement.value.image = "";
};

// --- Trusted By Editor Modal State ---
const trustedByMenuOpenIndex = ref<number | null>(null);
const trustedByEditorDialog = ref(false);
const editingTrustedByIndex = ref<number | null>(null);
const editingTrustedBy = ref<TrustedByPartner | null>(null);
const trustedByEditorFileInputRef = ref<HTMLInputElement | null>(null);

// --- Achievement Card Menu Functions ---
const openTrustedByMenu = (index: number) => {
  trustedByMenuOpenIndex.value = index;
};
const closeTrustedByMenu = () => {
  trustedByMenuOpenIndex.value = null;
};

const openTrustedByEditor = (index: number) => {
  editingTrustedByIndex.value = index;
  editingTrustedBy.value = { ...trustedByPartners.value[index] };
  trustedByEditorDialog.value = true;
  closeTrustedByMenu();
};
const closeTrustedByEditor = () => {
  trustedByEditorDialog.value = false;
  editingTrustedByIndex.value = null;
  editingTrustedBy.value = null;
};
const saveTrustedByEdit = () => {
  if (editingTrustedByIndex.value !== null && editingTrustedBy.value) {
    trustedByPartners.value[editingTrustedByIndex.value] = {
      ...editingTrustedBy.value,
    };
    closeTrustedByEditor();
  }
};

// Add this function to handle both drag and file input events
const handleTrustedByEditorImageUploadCard = async (
  payload: Event | DragEvent
) => {
  let file: File | undefined;
  if ("dataTransfer" in payload && payload.dataTransfer?.files?.length) {
    file = payload.dataTransfer.files[0];
  } else if (
    "target" in payload &&
    (payload.target as HTMLInputElement)?.files?.length
  ) {
    file = (payload.target as HTMLInputElement).files?.[0];
  }
  if (file && editingTrustedBy.value) {
    try {
      const imageUrl = await uploadImage(file);
      editingTrustedBy.value.image = imageUrl.startsWith("http")
        ? imageUrl
        : imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert("error", "Upload Gagal", "Gagal mengupload logo partner");
    }
  }
};
const clearTrustedByEditorImage = () => {
  if (editingTrustedBy.value) editingTrustedBy.value.image = "";
};

// --- Product Selection Dialog search handler ---
const handleProductSearch = (val: string) => {
  productSearch.value = val;
};

onMounted(async () => {
  await fetchPageData();
  await fetchAllProducts();
  await fetchFeatured();
  await fetchCatalogProducts();
});
</script>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'admin'
  }
}
</route>

<template>
  <v-container class="pa-6">
    <!-- Alert -->
    <AppAlert
      v-model="alertVisible"
      :type="alertType"
      :title="alertTitle"
      :text="alertMessage"
    />

    <!-- Product Selection Dialog -->
    <ProductSelectionDialog
      v-model="productSelectionDialog"
      :loading="catalogLoading"
      :products="filteredAvailableProducts"
      :selected-ids="selectedProductIdsDialog"
      @add="addSelectedProducts"
      @close="
        () => {
          productSelectionDialog = false;
        }
      "
      @search="handleProductSearch"
      @update:selectedIds="
        (ids) => {
          selectedProductIdsDialog = ids;
        }
      "
    />

    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Halaman Utama</h1>
        <p class="text-body-2 text-grey-darken-1">
          Kelola konten halaman utama website dan lihat preview
        </p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-4">Memuat data halaman utama...</p>
    </div>

    <!-- Main Content -->
    <v-row v-else>
      <!-- Left Side - Form -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-pencil</v-icon>
            Editor Konten
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="saveHomepageData">
              <!-- Banner Section -->
              <CardListEditor
                title="Banner"
                :items="banners"
                :menuOpenIndex="
                  bannerMenuOpenIndex === null ? undefined : bannerMenuOpenIndex
                "
                :dragOverIndex="
                  dragOverBannerEditorIndex === null
                    ? undefined
                    : dragOverBannerEditorIndex
                "
                @add="addBanner"
                @edit="openBannerEditor"
                @delete="removeBanner"
                @openMenu="openBannerMenu"
                @update:menuOpenIndex="
                  (val: number | null) => (bannerMenuOpenIndex = val)
                "
                @dragstart="onBannerEditorDragStart"
                @dragover="onBannerEditorDragOver"
                @drop="onBannerEditorDrop"
                @dragend="onBannerEditorDragEnd"
                listClass="banner-list"
                cardClass="banner-card"
                :itemKey="(item: any, index: number) => item.order || index"
              >
                <template #avatar="{ item }">
                  <v-avatar size="40" class="mr-3" color="#222">
                    <v-img
                      v-if="(item as Banner).image"
                      :src="(item as Banner).image"
                    />
                    <v-icon v-else color="amber">mdi-image-off</v-icon>
                  </v-avatar>
                </template>
                <template #content="{ item }">
                  <div class="font-weight-bold text-white text-truncate">
                    {{ (item as Banner).title || "No Title" }}
                  </div>
                  <div class="text-caption text-grey-lighten-1 text-truncate">
                    {{ (item as Banner).subtitle || "" }}
                  </div>
                </template>
              </CardListEditor>

              <!-- Achievement Section -->
              <CardListEditor
                title="Achievement"
                :items="achievements"
                :menuOpenIndex="
                  achievementMenuOpenIndex === null
                    ? undefined
                    : achievementMenuOpenIndex
                "
                :dragOverIndex="
                  dragOverAchievementIndex === null
                    ? undefined
                    : dragOverAchievementIndex
                "
                @add="addAchievement"
                @edit="openAchievementEditor"
                @delete="removeAchievement"
                @openMenu="openAchievementMenu"
                @update:menuOpenIndex="
                  (val: number | null) => (achievementMenuOpenIndex = val)
                "
                @dragstart="onAchievementDragStart"
                @dragover="onAchievementDragOver"
                @drop="onAchievementDrop"
                @dragend="onAchievementDragEnd"
                listClass="achievement-list"
                cardClass="achievement-card"
                :itemKey="(item: any, index: number) => item.order || index"
              >
                <template #avatar="{ item }">
                  <v-avatar size="40" class="mr-3" color="#222">
                    <v-img
                      v-if="(item as Achievement).image"
                      :src="(item as Achievement).image"
                    />
                    <v-icon v-else color="amber">mdi-trophy</v-icon>
                  </v-avatar>
                </template>
                <template #content="{ item }">
                  <div class="font-weight-bold text-white text-truncate">
                    {{ (item as Achievement).title || "No Title" }}
                  </div>
                  <div class="text-caption text-grey-lighten-1 text-truncate">
                    {{ (item as Achievement).description || "" }}
                  </div>
                </template>
              </CardListEditor>

              <!-- Trusted By Section -->
              <CardListEditor
                title="Trusted By"
                :items="trustedByPartners"
                :menuOpenIndex="
                  trustedByMenuOpenIndex === null
                    ? undefined
                    : trustedByMenuOpenIndex
                "
                :dragOverIndex="
                  dragOverTrustedByIndex === null
                    ? undefined
                    : dragOverTrustedByIndex
                "
                @add="addTrustedByPartner"
                @edit="openTrustedByEditor"
                @delete="removeTrustedByPartner"
                @openMenu="openTrustedByMenu"
                @update:menuOpenIndex="
                  (val: number | null) => (trustedByMenuOpenIndex = val)
                "
                @dragstart="onTrustedByDragStart"
                @dragover="onTrustedByDragOver"
                @drop="onTrustedByDrop"
                @dragend="onTrustedByDragEnd"
                listClass="trustedby-list"
                cardClass="trustedby-card"
                :itemKey="(item: any, index: number) => item.order || index"
              >
                <template #avatar="{ item }">
                  <v-avatar size="40" class="mr-3" color="#222">
                    <v-img
                      v-if="(item as TrustedByPartner).image"
                      :src="(item as TrustedByPartner).image"
                    />
                    <v-icon v-else color="amber">mdi-handshake</v-icon>
                  </v-avatar>
                </template>
                <template #content="{ item }">
                  <div class="font-weight-bold text-white text-truncate">
                    {{ (item as TrustedByPartner).title || "No Title" }}
                  </div>
                </template>
              </CardListEditor>

              <!-- Featured Products Section (NEW) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Produk Andalan</h3>
                  <v-btn
                    @click="productSelectionDialog = true"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                    :disabled="availableProducts.length === 0"
                  />
                </div>
                <div
                  v-if="featuredProducts.length === 0"
                  class="text-center pa-8"
                >
                  <v-icon size="64" color="grey-lighten-1"
                    >mdi-package-variant-closed</v-icon
                  >
                  <p class="text-grey-darken-1 mt-2">
                    Belum ada produk yang dipilih sebagai featured
                  </p>
                  <v-btn
                    @click="productSelectionDialog = true"
                    color="primary"
                    variant="outlined"
                    :disabled="availableProducts.length === 0"
                  >
                    Pilih Produk
                  </v-btn>
                </div>
                <div v-else>
                  <div
                    v-for="(product, index) in featuredProducts"
                    :key="product.id"
                    class="mb-3"
                  >
                    <FeaturedProductCard
                      :product="product"
                      :formatPrice="formatPrice"
                      @remove="removeFeaturedProduct(index)"
                    />
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                :loading="saveLoading"
                block
                size="large"
              >
                Simpan Perubahan
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Side - Preview -->
      <v-col cols="12" lg="6">
        <LivePreviewCard
          :previewKey="previewKey"
          @refresh="refreshPreview"
          @open="openHomepage"
        >
          <index />
        </LivePreviewCard>
      </v-col>
    </v-row>

    <!-- Banner Editor Modal -->
    <v-dialog v-model="bannerEditorDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Banner</v-card-title>
        <v-card-text>
          <ImageUploadCard
            :image="editingBanner?.image ? editingBanner.image : ''"
            placeholder-icon="mdi-image"
            placeholder-text="Upload Banner Image"
            height="180"
            @upload="handleBannerEditorImageUploadCard"
            @clear="clearBannerEditorImage"
            @drop="handleBannerEditorImageUploadCard"
            class="mb-8"
          />
          <v-text-field
            v-if="editingBanner"
            v-model="editingBanner.title"
            label="Title"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-if="editingBanner"
            v-model="editingBanner.subtitle"
            label="Subtitle"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-if="editingBanner"
            v-model="editingBanner.buttonText"
            label="Button Text"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-if="editingBanner"
            v-model="editingBanner.buttonLink"
            label="Button Link"
            variant="outlined"
            density="compact"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeBannerEditor">Batal</v-btn>
          <v-btn color="primary" @click="saveBannerEdit">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Achievement Editor Modal -->
    <v-dialog v-model="achievementEditorDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Achievement</v-card-title>
        <v-card-text>
          <ImageUploadCard
            :image="editingAchievement?.image ? editingAchievement.image : ''"
            placeholder-icon="mdi-trophy"
            placeholder-text="Upload Achievement Image"
            height="150"
            @upload="handleAchievementEditorImageUploadCard"
            @clear="clearAchievementEditorImage"
            @drop="handleAchievementEditorImageUploadCard"
            class="mb-8"
          />
          <v-text-field
            v-if="editingAchievement"
            v-model="editingAchievement.title"
            label="Title"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-if="editingAchievement"
            v-model.number="editingAchievement.percentage"
            label="Percentage"
            type="number"
            min="0"
            max="100"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-textarea
            v-if="editingAchievement"
            v-model="editingAchievement.description"
            label="Description"
            variant="outlined"
            density="compact"
            rows="2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeAchievementEditor">Batal</v-btn>
          <v-btn color="primary" @click="saveAchievementEdit">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Trusted By Editor Modal -->
    <v-dialog v-model="trustedByEditorDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Partner</v-card-title>
        <v-card-text>
          <ImageUploadCard
            :image="editingTrustedBy?.image ? editingTrustedBy.image : ''"
            placeholder-icon="mdi-domain"
            placeholder-text="Upload Partner Logo"
            height="120"
            @upload="handleTrustedByEditorImageUploadCard"
            @clear="clearTrustedByEditorImage"
            @drop="handleTrustedByEditorImageUploadCard"
            class="mb-8"
          />
          <v-text-field
            v-if="editingTrustedBy"
            v-model="editingTrustedBy.title"
            label="Title"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeTrustedByEditor">Batal</v-btn>
          <v-btn color="primary" @click="saveTrustedByEdit">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.image-upload-card {
  cursor: pointer;
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}

.image-upload-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.icon-btn-square {
  border-radius: 4px !important;
  border: 1px solid currentColor !important;
}

.cursor-pointer {
  cursor: pointer;
}

.v-card--selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.15) !important;
}

.product-select-card {
  min-height: 140px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.product-select-card .v-row {
  height: 100%;
}

.product-select-card .v-card-text {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-product-card {
  display: flex;
  flex-direction: column;
  min-height: 160px;
  height: 100%;
  border-radius: 8px;
  justify-content: stretch;
}

.featured-product-card .featured-product-img {
  width: 64px;
  height: 64px;
  min-width: 64px;
  min-height: 64px;
  max-width: 64px;
  max-height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: #222;
  margin-right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  .featured-product-card .featured-product-img {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    max-width: 48px;
    max-height: 48px;
  }
}
</style>
