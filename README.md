# PopArticle Frontend

A modern, feature-rich Next.js frontend application for PopArticle - an AI-Powered Content Management Platform with multi-tenant support.

## 🚀 Features

- **Authentication & Authorization**

  - JWT-based authentication with auto token refresh
  - User registration and login
  - Protected routes and session management
  - OAuth support ready (Google, GitHub, LinkedIn)

- **Article Management**

  - Create, edit, and delete articles
  - **Dual Editor Support:**
    - Rich HTML editor (React Quill)
    - Markdown editor (SimpleMDE)
  - AI-powered article generation
  - Article search and filtering
  - Draft, published, and archived status
  - SEO metadata management (meta title, description, keywords)

- **Multi-Tenant System**

  - Register and manage multiple tenant websites
  - Tenant-specific authentication
  - Member management for each tenant
  - Tenant statistics and analytics

- **Category Management**

  - Create and organize content categories
  - Assign articles to categories
  - Category-based filtering

- **Modern UI/UX**
  - Responsive dashboard layout
  - Collapsible sidebar navigation
  - Real-time statistics
  - Interactive forms with validation

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PopArticle Backend API running (default: http://localhost:5000)

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   NEXT_PUBLIC_APP_NAME=PopArticle
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
poparticle-frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── DashboardLayout.js    # Main dashboard layout
│   │   └── ProtectedRoute.js    # Route protection wrapper
│   ├── lib/                 # Utilities and services
│   │   ├── api.js                # Axios instance with interceptors
│   │   ├── authService.js        # Authentication methods
│   │   ├── articleService.js     # Article API calls
│   │   ├── tenantService.js      # Tenant API calls
│   │   └── categoryService.js    # Category API calls
│   ├── pages/               # Next.js pages (routes)
│   │   ├── index.js              # Landing page
│   │   ├── login.js              # Login page
│   │   ├── register.js           # Registration page
│   │   └── dashboard/            # Dashboard pages
│   └── styles/
│       └── globals.css           # Global styles
├── public/                  # Static assets
├── postman/                 # API documentation
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies
```

## 🎯 Key Features Guide

### Article Editing

The application supports both HTML and Markdown editing:

- **HTML Editor (React Quill):**

  - WYSIWYG interface
  - Rich formatting options
  - Image and link insertion
  - Code blocks and quotes

- **Markdown Editor (SimpleMDE):**
  - Live preview
  - Syntax highlighting
  - Toolbar with shortcuts
  - GitHub Flavored Markdown

Toggle between editors using the buttons above the content area.

### AI Article Generation

1. Navigate to **Dashboard → Generate with AI**
2. Enter your article topic
3. Add relevant keywords
4. Select tone (professional, casual, formal, friendly, technical)
5. Choose length (short, medium, long)
6. Click "Generate Article"
7. Edit the generated content as needed

### Multi-Tenant Setup

1. **Register a Tenant:**

   - Go to **Dashboard → Tenants → Register Tenant**
   - Enter website name and primary domain
   - Choose a plan
   - Submit to get your tenant ID

2. **Use Tenant ID for Authentication:**
   - Include `tenant_id` in login/register requests from your website
   - Users can authenticate across multiple tenant sites

## 🔐 Authentication Flow

1. **User Registration:** Sign up with email, password, username, and full name
2. **Login:** Access with email and password
3. **Token Management:** Automatic token refresh for seamless experience
4. **Multi-Tenant:** Same credentials work across registered tenant sites

## 📦 Build & Deploy

### Development:

```bash
npm run dev
```

### Production:

```bash
npm run build
npm start
```

## 🧪 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Dependencies

### Core:

- **Next.js 14** - React framework
- **React 18** - UI library
- **Axios** - HTTP client
- **js-cookie** - Cookie management

### Editors:

- **React Quill** - Rich HTML editor
- **SimpleMDE** - Markdown editor

### UI:

- **Lucide React** - Icon library

## 🔗 API Integration

The frontend integrates with PopArticle Backend API. See [Postman collection](./postman/) for complete API documentation.

## 📧 Support

For detailed documentation, see [QUICKSTART.md](./QUICKSTART.md)

---

Built with ❤️ using Next.js and React
