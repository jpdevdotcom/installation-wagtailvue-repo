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
      <q-item-section>
        {{ title }}
      </q-item-section>
      <!-- Render your page content here -->

      <div class="q-mt-md">
        <!-- Render HTML content safely -->
        <div v-html="sanitizedIntro"></div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useWagtailStore } from 'src/stores/wagtail';
import { computed, onMounted, ref } from 'vue';
import DOMPurify from 'dompurify';

const wagtailStore = useWagtailStore();
const title = ref('');
const { pages, homePage } = storeToRefs(wagtailStore);

// Helper to convert <embed> to <iframe>
function convertEmbedToIframe(html: string): string {
  return html.replace(
    /<embed\s+embedtype="media"\s+url="([^"]+)"\s*\/?>/g,
    (match, url) =>
      `<div class="video-embed"><iframe width="560" height="315" src="${url.replace(
        'watch?v=',
        'embed/',
      )}" frameborder="0" allowfullscreen></iframe></div>`,
  );
}

const sanitizedIntro = computed(() => {
  if (homePage.value?.intro) {
    // Convert embed tags to iframes, then sanitize
    const withIframes = convertEmbedToIframe(homePage.value.intro);
    return DOMPurify.sanitize(withIframes, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'src', 'width', 'height'],
    });
  }
  return 'Default content';
});

onMounted(async () => {
  await wagtailStore.fetchHomePage();
  console.log('HomePage data:', homePage.value);

  title.value = homePage.value?.intro || 'Default Title';

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
