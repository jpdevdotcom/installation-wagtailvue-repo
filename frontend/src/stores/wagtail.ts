import { defineStore } from 'pinia';
import { WagtailApi } from 'src/api/wagtail';

interface WagtailImage {
  id: number;
  title: string;
  meta: {
    detail_url: string;
    download_url: string;
    type: string;
  };
}

interface Page {
  id: number;
  title: string;
  intro?: string;
  featured_image?: WagtailImage;
  meta?: {
    type: string;
    detail_url: string;
    html_url: string;
    slug: string;
    show_in_menus: boolean;
  };
  // Add other page fields as needed
}

interface WagtailState {
  pages: Page[];
  currentPage: Page | null;
  homePage: Page | null;
  isLoading: boolean;
  error: string | null;
}

export const useWagtailStore = defineStore('wagtail', {
  state: (): WagtailState => ({
    pages: [],
    currentPage: null,
    homePage: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchPages() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await WagtailApi.getPages();
        if (response && response.items && Array.isArray(response.items)) {
          this.pages = response.items;
        } else {
          this.pages = [];
          this.error = 'Invalid response format from API';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch pages';
        this.pages = [];
        console.error('Error fetching pages:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPage(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const page = await WagtailApi.getPage(id);
        if (page && typeof page === 'object') {
          this.currentPage = page;
        } else {
          this.currentPage = null;
          this.error = 'Invalid page data received';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch page';
        this.currentPage = null;
        console.error('Error fetching page:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchHomePage() {
      this.isLoading = true;
      this.error = null;
      try {
        const homePage = await WagtailApi.getHomePage();
        if (homePage && typeof homePage === 'object') {
          // Ensure featured_image matches the expected type
          if (homePage.featured_image && typeof homePage.featured_image === 'object') {
            homePage.featured_image = homePage.featured_image as WagtailImage;
          }
          this.homePage = homePage as Page;
        } else {
          this.homePage = null;
          this.error = 'Invalid homepage data received';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch homepage';
        this.homePage = null;
        console.error('Error fetching homepage:', error);
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
