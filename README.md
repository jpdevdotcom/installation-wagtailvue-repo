
# Wagtail (Django) + Vue 3 + Quasar (TypeScript) - Headless Setup Guide

A fullstack Wagtail CMS + Vue TS Quasar installation and configuration.

## 1. Backend Setup (Wagtail Django)
#### Installation
```
# Create project directory
mkdir wagtail-quasar-project
cd wagtail-quasar-project

# Set up Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Wagtail
pip install wagtail django-cors-headers
```

#### Project Creation
```
wagtail start backend
cd backend
pip install -r requirements.txt
```

#### Configure for Headless Mode
Edit `backend/settings/base.py`

```
INSTALLED_APPS = [
    ...,
    'wagtail.api.v2',
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    ...,
]

# API & CORS Settings
WAGTAILAPI_BASE_URL = 'http://localhost:8000'
CORS_ALLOWED_ORIGINS = ["http://localhost:9000"]  # Quasar dev server
CORS_URLS_REGEX = r'^/api/.*$'
```

Create API Endpoint (`backend/api.py`)

```
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet

api_router = WagtailAPIRouter('wagtailapi')
api_router.register_endpoint('pages', PagesAPIViewSet)
```

Update `urls.py`
```
from .api import api_router

urlpatterns = [
    ...,
    path('api/v2/', api_router.urls),
]
```

#### Run Backend

```
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## 2. Frontend Setup (Quasar Vue 3 + TypeScript)

#### Installation
```
# Install Quasar CLI
npm install -g @quasar/cli

# Create Quasar project
yarn create quasar frontend
# Select: 
# - Vue 3 + TypeScript 
# - Default preset
cd frontend
```

#### Configure Axios for Wagtail API

Edit `quasar.config.js`
```
build: {
  env: {
    API_URL: ctx.dev ? 'http://localhost:8000/api/v2/' : 'PROD_URL'
  }
}
```

Setup Axios (`src/boot/axios.ts`)
```
import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({ baseURL: process.env.API_URL })

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
```

#### Pinia Store for Wagtail Data

Create `src/stores/wagtail/ts`
```
import { defineStore } from 'pinia'
import { api } from 'boot/axios'

interface Page {
  id: number
  title: string
}

export const useWagtailStore = defineStore('wagtail', {
  state: () => ({
    pages: [] as Page[],
  }),
  actions: {
    async fetchPages() {
      const res = await api.get('/pages/')
      this.pages = res.data.items
    },
  },
})
```

#### Run Frontend
```
quasar dev
```

## 3. Key Notes
#### Backend (Wagtail)
- Runs on `localhost:8000`
- API at `/api/v2/pages/`
- Enable CORS for Quasar's dev server (`localhost:9000`)

#### Frontend (Vue TS + Quasar)
- Uses Axios for API calls
- Pinia for state management
- TypeScript support

#### Production
- Set `CORS_ALLOWED_ORIGINS` to your domain
- Configure `API_URL` in Quasar for Production

## Troubleshooting
- CORS Errors? Double-check `CORS_ALLOWED_ORIGINS` in Django.
- Blank Page? Ensure QLayout wraps QPage in Vue.
- API Not Loading? Verify Wagtail's `api.py` and URL routing.
