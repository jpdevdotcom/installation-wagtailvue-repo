<template>
  <q-page class="q-pa-md">
    <h1>Welcome to our Wagtail + Quasar site</h1>

    <q-list bordered v-if="pages.length">
      <q-item v-for="page in pages" :key="page.id" clickable @click="viewPage(page.id)">
        <q-item-section>
          {{ page.title }}
        </q-item-section>
      </q-item>
    </q-list>

    <div class="q-mt-md">
      <h2>{{ title }}</h2>
      <!-- Render your page content here -->
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useWagtailStore } from 'src/stores/wagtail';
import { onMounted, ref } from 'vue';

const wagtailStore = useWagtailStore();
const title = ref('');
const { pages, homePage } = storeToRefs(wagtailStore);
onMounted(async () => {
  await wagtailStore.fetchHomePage();
  console.log('HomePage data:', homePage.value);

  title.value = homePage.value?.featured_image?.meta.download_url || 'Default Title';

  // Access specific properties
  if (homePage.value) {
    console.log('HomePage title:', homePage.value.title);
    console.log('HomePage intro:', homePage.value.intro);
    console.log('HomePage featured_image:', homePage.value.featured_image);
  }
});

const viewPage = async (id: number) => {
  await wagtailStore.fetchPage(id);
};
</script>
