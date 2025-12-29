# PopArticle API Documentation

Complete REST API reference for PopArticle content generation platform.

**Base URL:** `http://localhost:5000`

## Table of Contents

- [Authentication Methods](#authentication-methods)
- [Authentication Endpoints](#authentication-endpoints)
- [OAuth Endpoints](#oauth-endpoints)
- [API Key Management](#api-key-management)
- [Article Endpoints](#article-endpoints)
- [Category Endpoints](#category-endpoints)
- [Tenant Management](#tenant-management)
- [Invitation Endpoints](#invitation-endpoints)
- [Health Check](#health-check)
- [Error Responses](#error-responses)

---

## Authentication Methods

### 1. JWT Bearer Token

```http
Authorization: Bearer <access_token>
```

**Token Details:**

- Access Token Expiry: 1 hour
- Refresh Token Expiry: 30 days
- Token Payload: `{ sub, email, tenant_id, type, exp }`

### 2. API Key

```http
X-API-Key: pa_your_api_key_here
```

### 3. Tenant Context (Optional)

```http
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000
```

Used to scope requests to a specific tenant.

---

## Authentication Endpoints

### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe",
  "full_name": "John Doe"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "oauth_provider": null,
    "is_verified": false,
    "is_platform_admin": false,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T00:00:00.000000",
    "last_login_at": null
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

**Notes:**

- Without `X-Tenant-ID`: Creates platform admin user
- With `X-Tenant-ID`: Creates tenant-scoped user
- Email and username must be unique within scope
- Password must be at least 8 characters

---

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "oauth_provider": null,
    "is_verified": false,
    "is_platform_admin": false,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T00:00:00.000000",
    "last_login_at": "2025-01-01T12:00:00.000000"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

**Notes:**

- Without `X-Tenant-ID`: Authenticates platform admin
- With `X-Tenant-ID`: Authenticates tenant user

---

### Refresh Access Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

---

### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "oauth_provider": null,
    "is_verified": false,
    "is_platform_admin": false,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T00:00:00.000000",
    "last_login_at": "2025-01-01T12:00:00.000000"
  }
}
```

---

## OAuth Endpoints

### Initiate OAuth Login

```http
GET /api/v1/auth/oauth/{provider}
```

**Providers:** `google`, `github`, `linkedin`, `facebook`

**Example:**

```http
GET /api/v1/auth/oauth/google
```

**Response:** Redirects to OAuth provider consent screen

---

### OAuth Callback

```http
GET /api/v1/auth/oauth/{provider}/callback
```

**Query Parameters (from OAuth provider):**

- `code`: Authorization code
- `state`: State parameter for CSRF protection

**Automatic Redirect:**

```
Success: {FRONTEND_URL}/oauth/callback?access_token=...&refresh_token=...&provider=google
Error: {FRONTEND_URL}/oauth/callback?error=...&provider=google
```

**Error Cases:**

- `error=access_denied`: User denied OAuth consent
- `error=invalid_provider`: Unsupported OAuth provider
- `error=oauth_failed`: OAuth authentication failed

**Notes:**

- Creates new user if email doesn't exist
- Links OAuth to existing account if email exists
- Sets `is_verified=true` for OAuth users
- OAuth users are created as platform users (no tenant scope)

---

## API Key Management

### List API Keys

```http
GET /api/v1/auth/api-keys
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):**

```json
{
  "api_keys": [
    {
      "id": 1,
      "name": "My Production Key",
      "prefix": "pa_123456",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000",
      "last_used_at": "2025-01-01T12:00:00.000000",
      "request_count": 42
    }
  ]
}
```

---

### Create API Key

```http
POST /api/v1/auth/api-keys
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body:**

```json
{
  "name": "My Production Key"
}
```

**Response (201):**

```json
{
  "message": "API key created successfully",
  "api_key": "pa_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "prefix": "pa_123456",
  "name": "My Production Key",
  "warning": "Save this key securely. You will not be able to see it again."
}
```

**Notes:**

- Full API key shown only once
- Key format: `<prefix>_<64-char-hex>`
- Platform users get `pa_` prefix
- Tenant users get custom prefix based on tenant slug (first 3 chars + `_`)
- Example: "My Awesome Blog" → `mab_`

---

### Delete API Key

```http
DELETE /api/v1/auth/api-keys/<key_id>
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "API key deleted successfully"
}
```

---

## Article Endpoints

### Create Article (Manual)

```http
POST /api/v1/articles
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body:**

```json
{
  "title": "My Custom Article Title",
  "content": "# Article Content\n\nWrite your article content in markdown...",
  "excerpt": "Optional short preview of the article",
  "image": "https://example.com/image.jpg",
  "category_id": 1,
  "status": "draft",
  "is_featured": false,
  "seo": {
    "meta_title": "SEO Title",
    "meta_description": "SEO description for search engines",
    "focus_keyword": "main keyword"
  },
  "tags": ["tag1", "tag2"],
  "keywords": ["keyword1", "keyword2"]
}
```

**Required Fields:**

- `title`: Article title
- `content`: Article content (supports markdown)
- `category_id`: Category ID

**Optional Fields:**

- `excerpt`: Short preview (max 500 chars)
- `image`: Image URL or upload file (multipart/form-data)
- `status`: `draft` (default), `published`, `archived`
- `is_featured`: Boolean (default: false)
- `seo`: SEO metadata object
- `tags`: Array of tag names
- `keywords`: Array of keyword strings

**Response (201):**

```json
{
  "message": "Article created successfully",
  "article": {
    "id": 1,
    "title": "My Custom Article Title",
    "slug": "my-custom-article-title",
    "excerpt": "Optional short preview of the article",
    "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
    "category": "Technology",
    "status": "draft",
    "is_featured": false,
    "created_at": "2025-01-01T00:00:00.000000",
    "seo": {
      "meta_title": "SEO Title",
      "meta_description": "SEO description for search engines"
    },
    "tags": ["tag1", "tag2"],
    "keywords": ["keyword1", "keyword2"]
  }
}
```

**Notes:**

- Checks tenant's monthly article limit (returns 429 if exceeded)
- Auto-generates slug from title
- Default status is "draft"

---

### Generate Article with AI

```http
POST /api/v1/articles/generate
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body:**

```json
{
  "category_id": 1,
  "topic": "The Future of Artificial Intelligence",
  "keywords": ["AI", "machine learning", "future tech"],
  "tone": "professional",
  "length": "medium"
}
```

**Response (201):**

```json
{
  "message": "Article generated successfully",
  "article": {
    "id": 1,
    "title": "The Future of Artificial Intelligence: What Lies Ahead",
    "slug": "the-future-of-artificial-intelligence-what-lies-ahead",
    "content": "Full markdown content...",
    "excerpt": "Explore the cutting-edge developments...",
    "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
    "category_id": 1,
    "category_name": "Technology",
    "user_id": 1,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "draft",
    "is_featured": false,
    "view_count": 0,
    "created_at": "2025-01-01T00:00:00.000000",
    "updated_at": "2025-01-01T00:00:00.000000",
    "published_at": null,
    "seo_meta_title": "The Future of AI: What Lies Ahead in 2025",
    "seo_meta_description": "Discover the latest trends...",
    "seo_focus_keyword": "artificial intelligence",
    "seo_summary": "Article summary",
    "tags": ["AI", "Technology", "Future"],
    "keywords": ["artificial intelligence", "machine learning", "AI trends"]
  }
}
```

**Notes:**

- Checks tenant's monthly article limit
- Article created with status "draft"
- Returns 429 if limit exceeded
- Task runs asynchronously via Celery

---

### List Articles

```http
GET /api/v1/articles
X-Tenant-ID: <tenant_id> (optional)
```

**Query Parameters:**

- `status` (optional): `draft`, `published`, `archived`
- `category_id` (optional): Filter by category
- `is_featured` (optional): `true`, `false`
- `limit` (optional): Default 50, max 100
- `offset` (optional): Default 0
- `user_only` (optional): `true` - If authenticated, show only user's articles

**Response (200):**

```json
{
  "total": 42,
  "limit": 10,
  "offset": 0,
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "slug": "article-title",
      "excerpt": "Brief summary...",
      "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
      "category_id": 1,
      "category_name": "Technology",
      "user_id": 1,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "published",
      "is_featured": true,
      "view_count": 150,
      "created_at": "2025-01-01T00:00:00.000000",
      "updated_at": "2025-01-01T12:00:00.000000",
      "published_at": "2025-01-01T13:00:00.000000"
    }
  ]
}
```

**Notes:**

- Authentication optional
- With `X-Tenant-ID`: Returns tenant articles + global articles (tenant_id=NULL)
- Without `X-Tenant-ID` or auth: Returns only published articles

---

### Get Single Article

```http
GET /api/v1/articles/<id>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):**

```json
{
  "article": {
    "id": 1,
    "title": "Article Title",
    "slug": "article-title",
    "content": "Full markdown content...",
    "excerpt": "Brief summary...",
    "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
    "category_id": 1,
    "category_name": "Technology",
    "user_id": 1,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "published",
    "is_featured": true,
    "view_count": 151,
    "created_at": "2025-01-01T00:00:00.000000",
    "updated_at": "2025-01-01T12:00:00.000000",
    "published_at": "2025-01-01T13:00:00.000000",
    "seo_meta_title": "SEO Title",
    "seo_meta_description": "SEO Description",
    "seo_focus_keyword": "keyword",
    "seo_summary": "Summary",
    "tags": ["tag1", "tag2"],
    "keywords": ["keyword1", "keyword2"]
  }
}
```

**Notes:**

- View count increments on each GET request

---

### Update Article

```http
PUT /api/v1/articles/<id>
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body (all fields optional):**

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "excerpt": "Updated excerpt",
  "image": "https://example.com/new-image.jpg",
  "status": "published",
  "is_featured": true,
  "category_id": 2,
  "tags": ["new-tag"],
  "keywords": ["new-keyword"]
}
```

**Response (200):**

```json
{
  "message": "Article updated successfully",
  "article": {
    "id": 1,
    "title": "Updated Title",
    "slug": "updated-title",
    "content": "Updated content...",
    "excerpt": "Updated excerpt",
    "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
    "category_id": 2,
    "category_name": "Business",
    "user_id": 1,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "published",
    "is_featured": true,
    "view_count": 150,
    "created_at": "2025-01-01T00:00:00.000000",
    "updated_at": "2025-01-01T14:00:00.000000",
    "published_at": "2025-01-01T13:00:00.000000",
    "seo_meta_title": "SEO Title",
    "seo_meta_description": "SEO Description",
    "seo_focus_keyword": "keyword",
    "seo_summary": "Summary",
    "tags": ["new-tag"],
    "keywords": ["new-keyword"]
  }
}
```

**Notes:**

- User must own the article (403 otherwise)
- Slug auto-generated from title if title changes

---

### Delete Article

```http
DELETE /api/v1/articles/<id>
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):**

```json
{
  "message": "Article deleted successfully"
}
```

**Notes:**

- User must own the article (403 otherwise)

---

### Publish Article

```http
POST /api/v1/articles/<id>/publish
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):**

```json
{
  "message": "Article published successfully",
  "article": {
    "id": 1,
    "title": "Article Title",
    "slug": "article-title",
    "excerpt": "Brief summary...",
    "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
    "category_id": 1,
    "category_name": "Technology",
    "user_id": 1,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "published",
    "is_featured": false,
    "view_count": 150,
    "created_at": "2025-01-01T00:00:00.000000",
    "updated_at": "2025-01-01T13:00:00.000000",
    "published_at": "2025-01-01T13:00:00.000000"
  }
}
```

**Notes:**

- User must own the article (403 otherwise)
- Sets status to "published" and sets published_at timestamp

---

### Search Articles

```http
GET /api/v1/articles/search
X-Tenant-ID: <tenant_id> (optional)
```

**Query Parameters:**

- `q` (required): Search query
- `limit` (optional): Default 20, max 100

**Response (200):**

```json
{
  "query": "artificial intelligence",
  "total": 5,
  "results": [
    {
      "id": 1,
      "title": "Article Title",
      "slug": "article-title",
      "excerpt": "Brief summary...",
      "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
      "category_id": 1,
      "category_name": "Technology",
      "status": "published",
      "is_featured": false,
      "view_count": 150,
      "created_at": "2025-01-01T00:00:00.000000",
      "published_at": "2025-01-01T13:00:00.000000"
    }
  ]
}
```

**Notes:**

- Searches in title, content, and excerpt
- Authentication optional
- Only searches published articles for non-authenticated users

---

## Category Endpoints

### List Categories

```http
GET /api/v1/categories
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):**

```json
{
  "total": 5,
  "categories": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Technology related articles",
      "tenant_id": null,
      "created_at": "2025-01-01T00:00:00.000000",
      "article_count": 42
    }
  ]
}
```

**Notes:**

- Returns tenant categories + global categories (tenant_id=NULL) if `X-Tenant-ID` provided

---

### Get Single Category

```http
GET /api/v1/categories/<id>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):**

```json
{
  "category": {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "description": "Technology related articles",
    "tenant_id": null,
    "created_at": "2025-01-01T00:00:00.000000",
    "article_count": 42
  }
}
```

---

### Create Category

```http
POST /api/v1/categories
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body:**

```json
{
  "name": "Web Development",
  "description": "Articles about web development"
}
```

**Response (201):**

```json
{
  "message": "Category created successfully",
  "category": {
    "id": 2,
    "name": "Web Development",
    "slug": "web-development",
    "description": "Articles about web development",
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T00:00:00.000000"
  }
}
```

**Notes:**

- Name must be unique within tenant scope

---

### Update Category

```http
PUT /api/v1/categories/<id>
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body (all fields optional):**

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response (200):**

```json
{
  "message": "Category updated successfully",
  "category": {
    "id": 1,
    "name": "Updated Name",
    "slug": "updated-name",
    "description": "Updated description",
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T00:00:00.000000"
  }
}
```

---

### Delete Category

```http
DELETE /api/v1/categories/<id>
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):**

```json
{
  "message": "Category deleted successfully"
}
```

**Error Response (400):**

```json
{
  "error": "Cannot delete category with existing articles"
}
```

---

## Tenant Management

### Register Tenant

```http
POST /api/v1/tenants/register
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "My Awesome Blog",
  "primary_domain": "myblog.com",
  "plan": "free",
  "settings": {}
}
```

**Response (201):**

```json
{
  "message": "Tenant registered successfully",
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Awesome Blog",
    "slug": "my-awesome-blog",
    "primary_domain": "myblog.com",
    "allowed_domains": ["myblog.com"],
    "plan": "free",
    "is_active": true,
    "is_verified": false,
    "monthly_article_limit": 10,
    "settings": {},
    "branding": {},
    "api_key_prefix": "mab_",
    "created_at": "2025-01-01T00:00:00.000000"
  }
}
```

**Plans:**

- `free`: 10 articles/month
- `starter`: 50 articles/month
- `professional`: 200 articles/month
- `enterprise`: Unlimited

**Notes:**

- Authenticated user becomes owner
- Domain must be unique and format: "domain.com" (no protocol)
- API key prefix generated from first 3 chars of slug

---

### List My Tenants

```http
GET /api/v1/tenants/my-tenants
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "tenants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My Awesome Blog",
      "slug": "my-awesome-blog",
      "primary_domain": "myblog.com",
      "plan": "free",
      "role": "owner",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000"
    }
  ],
  "total": 1
}
```

---

### Get Tenant Details

```http
GET /api/v1/tenants/<tenant_id>
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Awesome Blog",
    "slug": "my-awesome-blog",
    "primary_domain": "myblog.com",
    "allowed_domains": ["myblog.com", "www.myblog.com"],
    "plan": "free",
    "is_active": true,
    "is_verified": true,
    "monthly_article_limit": 10,
    "monthly_article_count": 5,
    "settings": {},
    "branding": {},
    "webhook_url": null,
    "billing_email": null,
    "created_at": "2025-01-01T00:00:00.000000",
    "api_key_prefix": "mab_"
  },
  "role": "owner",
  "stats": {
    "total_articles": 25,
    "published_articles": 15,
    "draft_articles": 10,
    "total_members": 3
  }
}
```

---

### Update Tenant

```http
PUT /api/v1/tenants/<tenant_id>
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**

```json
{
  "name": "Updated Blog Name",
  "allowed_domains": ["myblog.com", "www.myblog.com"],
  "settings": {},
  "branding": {},
  "webhook_url": "https://myblog.com/webhooks",
  "billing_email": "billing@myblog.com"
}
```

**Response (200):**

```json
{
  "message": "Tenant updated successfully",
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Blog Name",
    "slug": "updated-blog-name",
    "primary_domain": "myblog.com",
    "allowed_domains": ["myblog.com", "www.myblog.com"],
    "plan": "free",
    "is_active": true,
    "is_verified": true,
    "monthly_article_limit": 10,
    "settings": {},
    "branding": {},
    "webhook_url": "https://myblog.com/webhooks",
    "billing_email": "billing@myblog.com",
    "created_at": "2025-01-01T00:00:00.000000",
    "updated_at": "2025-01-01T12:00:00.000000",
    "api_key_prefix": "upd_"
  }
}
```

**Notes:**

- Only owners and admins can update (403 otherwise)

---

### List Tenant Members

```http
GET /api/v1/tenants/<tenant_id>/members
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "members": [
    {
      "id": 1,
      "email": "owner@myblog.com",
      "username": "owner",
      "full_name": "John Doe",
      "role": "owner",
      "is_verified": true,
      "created_at": "2025-01-01T00:00:00.000000",
      "last_login_at": "2025-01-01T12:00:00.000000"
    }
  ],
  "total": 1
}
```

**Notes:**

- Only owners and admins can list members (403 otherwise)

---

### Remove Tenant Member

```http
DELETE /api/v1/tenants/<tenant_id>/members/<user_id>
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "Member removed successfully"
}
```

**Error Responses:**

- **400** Invalid tenant ID format
- **403** Access denied (possible reasons):
  - You do not have permission (must be owner/admin)
  - Member not found
  - Cannot remove the last owner
  - Cannot remove yourself (use leave endpoint instead)
- **500** Server error

**Notes:**

- Only owners and admins can remove members
- Cannot remove the last owner of a tenant
- Users cannot remove themselves (should use the leave endpoint)

---

### Leave Tenant

```http
POST /api/v1/tenants/<tenant_id>/leave
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "Successfully left the tenant"
}
```

**Error Responses:**

- **400** Invalid tenant ID format
- **403** Failed to leave tenant (possible reasons):
  - You are not a member of this tenant
  - You are the last owner (transfer ownership first)
- **500** Server error

**Notes:**

- Platform users can voluntarily leave a tenant
- The last owner cannot leave (must transfer ownership first or delete the tenant)

---

### Get Tenant Statistics

```http
GET /api/v1/tenants/<tenant_id>/stats
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "total_articles": 25,
  "published_articles": 15,
  "draft_articles": 10,
  "total_members": 3
}
```

---

## Invitation Endpoints

### Invite Member

```http
POST /api/v1/tenants/<tenant_id>/invitations
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "newmember@example.com",
  "role": "editor"
}
```

**Response (201):**

```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": 1,
    "email": "newmember@example.com",
    "role": "editor",
    "status": "pending",
    "token": "unique-invitation-token",
    "created_at": "2025-01-01T00:00:00.000000",
    "expires_at": "2025-01-08T00:00:00.000000",
    "email_sent": true
  }
}
```

**Roles:** `owner`, `admin`, `editor`

**Notes:**

- Only owners and admins can invite (403 otherwise)
- Expires in 7 days
- Sends email with invitation link (if email configured)

---

### List Invitations

```http
GET /api/v1/tenants/<tenant_id>/invitations
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `status` (optional): `pending`, `accepted`, `expired`, `cancelled`

**Response (200):**

```json
{
  "invitations": [
    {
      "id": 1,
      "email": "newmember@example.com",
      "role": "editor",
      "status": "pending",
      "created_at": "2025-01-01T00:00:00.000000",
      "expires_at": "2025-01-08T00:00:00.000000",
      "accepted_at": null,
      "invited_by": {
        "id": 1,
        "email": "owner@myblog.com",
        "full_name": "John Doe"
      }
    }
  ],
  "total": 1
}
```

---

### Cancel Invitation

```http
POST /api/v1/tenants/invitations/<invitation_id>/cancel
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "Invitation cancelled successfully"
}
```

---

### Accept Invitation

```http
POST /api/v1/tenants/invitations/accept
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "unique-invitation-token"
}
```

**Response (200):**

```json
{
  "message": "Invitation accepted successfully",
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Awesome Blog",
    "slug": "my-awesome-blog"
  },
  "role": "editor"
}
```

---

### Verify Invitation (Public)

```http
GET /api/v1/tenants/invitations/verify/<token>
```

**Response (200):**

```json
{
  "valid": true,
  "user_exists": false,
  "action": "signup",
  "invitation": {
    "email": "newmember@example.com",
    "role": "editor",
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My Awesome Blog",
      "domain": "myblog.com"
    },
    "expires_at": "2025-01-08T00:00:00.000000"
  }
}
```

**Response Fields:**

- `valid`: Whether the invitation is valid
- `user_exists`: Whether a user account already exists with this email
- `action`: Recommended action - `"login"` if user exists, `"signup"` if not
- `invitation`: Invitation details

**Frontend Flow:**

1. Call verify endpoint with token
2. If `action` is `"signup"`, redirect to signup page with email pre-filled
3. If `action` is `"login"`, redirect to login page with email pre-filled
4. After successful login/signup, automatically call accept endpoint
5. Redirect user to tenant dashboard

**Notes:**

- No authentication required
- Returns 404 if not found
- Returns 400 if expired or not pending
- Use `user_exists` and `action` to intelligently redirect users

---

### Accept Invitation

```http
POST /api/v1/tenants/invitations/accept
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "diASoeJuP4cAsrY0tar7OQ0jmGONF6gjcdIF1S-I6hM"
}
```

**Response (200):**

```json
{
  "message": "Invitation accepted successfully",
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Awesome Blog",
    "slug": "my-awesome-blog"
  },
  "role": "editor"
}
```

**Error Responses:**

- **400** Token is required
- **400** Invalid invitation token
- **400** Invitation has already been accepted
- **400** Invitation has expired
- **400** Invitation has been cancelled
- **400** Failed to accept (email mismatch)

**Notes:**

- Requires authentication (user must be logged in)
- The logged-in user's email must match the invitation email
- Upon success, user becomes a member of the tenant with the specified role

---

## Health Check

```http
GET /health
```

**Response (200):**

```json
{
  "status": "healthy",
  "timestamp": "2025-12-24T12:00:00.000000",
  "database": "connected",
  "redis": "connected",
  "celery": "running",
  "version": "1.0.0"
}
```

**Possible Status Values:**

- `database`: `"connected"` or `"disconnected"`
- `redis`: `"connected"` or `"disconnected"`
- `celery`: `"running"` or `"not running"`

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message description"
}
```

### Common Status Codes

| Code | Description                    |
| ---- | ------------------------------ |
| 200  | Success                        |
| 201  | Created                        |
| 400  | Bad Request                    |
| 401  | Unauthorized                   |
| 403  | Forbidden                      |
| 404  | Not Found                      |
| 409  | Conflict                       |
| 429  | Too Many Requests (Rate Limit) |
| 500  | Internal Server Error          |

### Example Error Responses

**400 Bad Request:**

```json
{
  "error": "Missing required field: email"
}
```

**401 Unauthorized:**

```json
{
  "error": "Invalid credentials"
}
```

**403 Forbidden:**

```json
{
  "error": "You do not have permission to perform this action"
}
```

**404 Not Found:**

```json
{
  "error": "Article not found"
}
```

**409 Conflict:**

```json
{
  "error": "Email already registered"
}
```

**429 Too Many Requests:**

```json
{
  "error": "Monthly article limit reached. Please upgrade your plan."
}
```
