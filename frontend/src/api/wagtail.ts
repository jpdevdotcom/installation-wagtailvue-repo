import { wagtailApi } from 'src/boot/axios';

interface Page {
  id: number;
  title: string;
  // Add other page fields as needed
}

interface HomePage extends Page {
  intro: string;
  featured_image?: unknown; // Replace with proper image type
}

interface WagtailApiResponse<T> {
  items: T[];
  meta: {
    total_count: number;
  };
}

export const WagtailApi = {
  getPages(): Promise<WagtailApiResponse<Page>> {
    return wagtailApi.get('/pages/');
  },

  getPage(id: number): Promise<Page> {
    return wagtailApi.get(`/pages/${id}/`);
  },

  getHomePage(): Promise<HomePage> {
    return wagtailApi.get('/pages/?type=home.HomePage&fields=*').then((response) => {
      if (response.data?.items?.[0]) {
        return response.data.items[0];
      }
      throw new Error('HomePage not found');
    });
  },

  getImages(): Promise<WagtailApiResponse<unknown>> {
    // Replace 'any' with proper image type
    return wagtailApi.get('/images/');
  },
};
