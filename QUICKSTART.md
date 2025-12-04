# PopArticle Frontend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=PopArticle
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 📚 Main Features

### 🔐 Authentication

- Register new account at `/register`
- Login at `/login`
- JWT-based with auto-refresh

### ✍️ Article Management

- **Create:** `/dashboard/articles/new`
- **List:** `/dashboard/articles`
- **Edit:** Click any article to edit
- **AI Generate:** `/dashboard/articles/generate`

### 📝 Editors

- **HTML Editor:** Rich text with formatting toolbar
- **Markdown Editor:** Write in Markdown with live preview
- Toggle between editors while editing

### 🏢 Multi-Tenant

- Register tenants at `/dashboard/tenants/new`
- Each tenant gets unique ID for authentication
- Manage members and settings

### 📂 Categories

- Organize content at `/dashboard/categories`
- Create, edit, delete categories
- Assign to articles

## 🎯 Quick Tips

1. **First Time Setup:**

   - Register an account
   - Create a category
   - Create or generate your first article

2. **Using AI Generation:**

   - Provide clear topic description
   - Add relevant keywords
   - Choose appropriate tone and length

3. **Tenant Authentication:**

   - Include `tenant_id` in API calls from your website
   - Users can share accounts across tenant sites

4. **Editor Choice:**
   - Use HTML for rich formatting
   - Use Markdown for clean, portable content

## 📞 Need Help?

- Check main [README.md](./README.md) for detailed docs
- Review [Postman collection](./postman/) for API reference
- Ensure backend API is running on port 5000

## 🔧 Common Commands

```bash
npm run dev      # Start development
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Lint code
```

Happy coding! 🎉
