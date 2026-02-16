# PopArticle API Documentation

Complete REST API reference for PopArticle content generation platform.

**Base URL:** `http://localhost:5000`

## Table of Contents

- [Authentication Methods](#authentication-methods)
- [Authentication Endpoints](#authentication-endpoints)
- [OAuth Endpoints](#oauth-endpoints)
- [API Key Management](#api-key-management)
- [Profile Management](#profile-management)
- [Message/Contact Endpoints](#messagecontact-endpoints)
- [Article Endpoints](#article-endpoints)
  - [Search Articles](#search-articles)
- [Category Endpoints](#category-endpoints)
- [Comment Endpoints](#comment-endpoints)
- [Team Management](#team-management)
- [Tenant Management](#tenant-management)
- [Invitation Endpoints](#invitation-endpoints)
- [Article Scheduling](#article-scheduling)
- [Social Media Posting](#social-media-posting)
- [Subscription Endpoints](#subscription-endpoints)
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
    "profile_image": "https://lh3.googleusercontent.com/a/ACg8ocKAGlZUsQHqPbvD-4wchKOtABOV7xXbTZwgAO0jyqjzyF3Ypiff=s96-c",
    "role": "Admin",
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

## Profile Management

### Update User Profile

```http
PATCH /api/v1/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "full_name": "John Doe",
  "username": "johndoe",
  "profile_image": "https://example.com/profile.jpg"
}
```

**All fields are optional. Only include fields you want to update.**

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 123,
    "email": "john@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "profile_image": "https://example.com/profile.jpg",
    "role": "owner"
  }
}
```

**Validation Rules:**

- `username`: Must be unique within tenant (or globally for platform admins)
- `profile_image`: Must be a valid URL (http:// or https://)
- `full_name`: Any string value

**Error Responses:**

```json
{
  "error": "Username already taken"
}  // 400

{
  "error": "profile_image must be a valid URL"
}  // 400

{
  "error": "No valid fields to update"
}  // 400
```

---

### Update Profile Image (File Upload)

```http
POST /api/v1/auth/profile/image
Authorization: Bearer <access_token>
Content-Type: multipart/form-data OR application/json
```

**This endpoint is specifically for file uploads and URL processing. For simple URL updates, use PATCH /api/v1/auth/profile instead.**

**Method 1: File Upload**

```http
POST /api/v1/auth/profile/image
Content-Type: multipart/form-data

file: <image file>
```

**Method 2: Image URL (Downloads and uploads to S3)**

```http
POST /api/v1/auth/profile/image
Content-Type: application/json

{
  "image_url": "https://example.com/my-profile-pic.jpg"
}
```

**Method 3: OAuth Provider URL (Stored as-is)**

```http
POST /api/v1/auth/profile/image
Content-Type: application/json

{
  "image_url": "https://lh3.googleusercontent.com/a/..."
}
```

**Supported OAuth Domains (stored directly):**

- `googleusercontent.com` (Google)
- `githubusercontent.com` (GitHub)
- `avatars.githubusercontent.com` (GitHub)
- `licdn.com` (LinkedIn)
- `fbcdn.net` (Facebook)
- `facebook.com` (Facebook)

**Response (200):**

```json
{
  "message": "Profile image updated successfully",
  "profile_image": "https://cdn.example.com/profile-images/20250114_12345678.jpg"
}
```

**Validation:**

- Allowed formats: jpg, jpeg, png, gif, webp
- Maximum size: 5MB
- Images automatically optimized and resized to max 800px width
- OAuth provider images used directly without re-hosting

**Error Responses:**

```json
{
  "error": "No file selected"
}  // 400

{
  "error": "Invalid file type. Allowed: jpg, jpeg, png, gif, webp"
}  // 400

{
  "error": "Image too large. Maximum size: 5MB"
}  // 400

{
  "error": "Failed to process image URL: Invalid image data"
}  // 400
```

---

### Remove Profile Image

```http
DELETE /api/v1/auth/profile/image
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "Profile image removed successfully"
}
```

---

## Message/Contact Endpoints

### Send Message

```http
POST /api/v1/messages
Content-Type: application/json
Authorization: Bearer <access_token> (optional)
X-Tenant-ID: <tenant_id> (optional)
```

**For Non-Logged-In Users:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "subject": "Question about pricing",
  "message": "I would like to know more about your pricing plans."
}
```

**For Logged-In Users (email auto-filled from session):**

```json
{
  "subject": "Feature request",
  "message": "Please add dark mode support."
}
```

**Response (201):**

```json
{
  "message": "Message sent successfully",
  "id": 123,
  "created_at": "2026-01-14T12:00:00.000000"
}
```

---

### List Messages (Admin/Owner Only)

```http
GET /api/v1/messages
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Query Parameters:**

- `status`: Filter by status (pending, read, replied, archived, spam)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50, max: 100)

**Response (200):**

```json
{
  "messages": [
    {
      "id": 123,
      "sender_email": "john@example.com",
      "subject": "Question",
      "status": "pending",
      "created_at": "2026-01-14T12:00:00.000000"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  },
  "unread_count": 15
}
```

---

### Update Message (Admin/Owner Only)

```http
PATCH /api/v1/messages/<message_id>
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "replied",
  "reply_text": "Thank you for your inquiry..."
}
```

**Response (200):**

```json
{
  "message": "Message updated successfully",
  "data": { ... }
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
  "length": "medium",
  "generate_image": true,
  "include_content_images": false
}
```

**Request Parameters:**

- `category_id` (required): Category ID for the article
- `topic` (required): Main topic/subject for the article
- `keywords` (optional): Array of target keywords to include
- `tone` (optional): Writing tone (default: "professional")
- `length` (optional): Article length - "short", "medium", or "long" (default: "medium")
- `generate_image` (optional): Whether to generate a main featured image using DALL-E (default: `true`)
- `include_content_images` (optional): Whether to include relevant images within the content (default: `false`)

**Response (201):**

```json
{
  "id": 1,
  "title": "The Future of Artificial Intelligence: What Lies Ahead",
  "slug": "the-future-of-artificial-intelligence-what-lies-ahead",
  "content": "Full markdown content...",
  "excerpt": "Explore the cutting-edge developments...",
  "image": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "category": "Technology",
  "status": "draft",
  "is_featured": false,
  "created_at": "2025-01-01T00:00:00.000000",
  "seo": {
    "meta_title": "The Future of AI: What Lies Ahead in 2025",
    "meta_description": "Discover the latest trends..."
  },
  "tags": ["AI", "Technology", "Future"],
  "keywords": ["artificial intelligence", "machine learning", "AI trends"],
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Notes:**

- Checks tenant's monthly article limit
- Article created with status "draft"
- Returns 429 if limit exceeded
- Task runs asynchronously via Celery
- **NEW**: AI-generated content no longer includes redundant title headers (starts directly with content)
- **NEW**: Optional DALL-E image generation for main article featured image
- **NEW**: Generated images are automatically processed and uploaded to S3/CDN
- **DALL-E Costs**: Standard quality 1792x1024 images cost approximately $0.080 per image
- Image URLs from DALL-E expire after 1 hour - they are automatically downloaded and uploaded to your S3 bucket

---

### Track Article View (NEW)

```http
POST /api/v1/articles/<id>/view
X-Tenant-ID: <tenant_id> (optional)
```

**Description:**
Increments the view count for the specified article. Call this endpoint when an article is displayed to a user.

**Response (200):**

```json
{
  "message": "View tracked successfully",
  "view_count": 42
}
```

**Notes:**

- View count is only incremented via this endpoint (not on every GET)
- No authentication required

---

### List Articles

```http
GET /api/v1/articles
X-Tenant-ID: <tenant_id> (optional)
```

**Query Parameters:**

- `status` (optional): `draft`, `published`, `archived`
- `category_id` (optional): Filter by category
- `category_slug` (optional): Filter by category using human-readable slug (frontend-friendly; resolves to `category_id` server-side)
- `is_featured` (optional): `true`, `false`
- `limit` (optional): Default 50, max 100
- `offset` (optional): Default 0
- `user_only` (optional): `true` - If authenticated, show only user's articles
- `sort` (optional): `date` (default), `popularity`, `trending`, `title`, `comments`
- `order` (optional): `desc` (default), `asc`

**Response (200):**

```json
{
  "total": 42,
  "limit": 10,
  "offset": 0,
  "page": 1,
  "per_page": 10,
  "sort_by": "popularity",
  "sort_order": "desc",
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "slug": "article-title",
      "excerpt": "Brief summary...",
      "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
      "category": "Technology",
      "status": "published",
      "is_featured": true,
      "view_count": 150,
      "comment_count": 12,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-01-01T00:00:00.000000",
      "updated_at": "2025-01-01T12:00:00.000000",
      "published_at": "2025-01-01T13:00:00.000000"
    }
  ]
}
```

**Notes:**

- Supports advanced sorting and pagination
- `comment_count` and `view_count` are always included
- With `X-Tenant-ID`: Returns tenant articles + global articles (tenant_id=NULL)
- Without `X-Tenant-ID` or auth: Returns only published articles

Additional: Filter by category slug

- You can pass `category_slug` instead of `category_id` when calling `GET /api/v1/articles`. The backend resolves the slug to the category (respecting `X-Tenant-ID`) and returns the same response shape as the `category_id` filter. If the slug is not found the endpoint returns an empty `articles` array (200).

---

### Get Articles By Category Slug

```http
GET /api/v1/articles/category/<slug>
X-Tenant-ID: <tenant_id> (optional)
```

Use this dedicated endpoint when the frontend only knows the category slug (SEO-friendly URLs). It returns category metadata plus the articles in that category and supports the same filters as `GET /api/v1/articles`.

**Query Parameters (supports same filters as `GET /api/v1/articles`):**

- `status` (optional): `draft`, `published`, `archived`
- `is_featured` (optional): `true`, `false`
- `per_page` / `limit` (optional): Default 50
- `offset` (optional): Default 0
- `user_only` (optional): `true` - If authenticated, show only user's articles
- `sort` / `order` (optional)

**Response (200):**

```json
{
  "category": {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "description": "Technology related articles"
  },
  "total": 42,
  "limit": 10,
  "offset": 0,
  "page": 1,
  "per_page": 10,
  "sort_by": "popularity",
  "sort_order": "desc",
  "articles": [
    /* same article objects as List Articles */
  ]
}
```

**Notes:**

- Respects `X-Tenant-ID`; returns tenant-specific + global articles when tenant present.
- Returns `404` if category slug does not exist for the tenant scope.

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
    "category": "Technology",
    "status": "published",
    "is_featured": true,
    "view_count": 151,
    "comment_count": 8,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T00:00:00.000000",
    "updated_at": "2025-01-01T12:00:00.000000",
    "published_at": "2025-01-01T13:00:00.000000",
    "seo": {
      "meta_title": "SEO Title",
      "meta_description": "SEO Description",
      "summary": "Summary",
      "focus_keyword": "keyword"
    },
    "tags": ["tag1", "tag2"],
    "keywords": ["keyword1", "keyword2"]
  }
}
```

**Notes:**

- `view_count` and `comment_count` are always included
- View count is NOT incremented on GET; use the `/view` endpoint to track views

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

**Description:**
Advanced full-text search across articles with support for filtering, sorting by relevance, and searching within specific fields. Results include highlighted snippets showing where matches were found.

**Query Parameters:**

| Parameter            | Type    | Required | Default       | Description                                                 |
| -------------------- | ------- | -------- | ------------- | ----------------------------------------------------------- |
| `q`                  | string  | Yes      | -             | Search query (2-200 characters)                             |
| `limit` / `per_page` | integer | No       | 20            | Results per page (max 100)                                  |
| `offset`             | integer | No       | 0             | Number of results to skip                                   |
| `page`               | integer | No       | 1             | Page number (alternative to offset)                         |
| `status`             | string  | No       | `published`\* | Filter by status: `draft`, `published`, `archived`          |
| `category_id`        | integer | No       | -             | Filter by category ID                                       |
| `category_slug`      | string  | No       | -             | Filter by category slug (alternative to category_id)        |
| `is_featured`        | boolean | No       | -             | Filter featured articles: `true` / `false`                  |
| `date_from`          | string  | No       | -             | Filter by creation date (ISO 8601: `YYYY-MM-DD`)            |
| `date_to`            | string  | No       | -             | Filter by creation date (ISO 8601: `YYYY-MM-DD`)            |
| `sort`               | string  | No       | `relevance`   | Sort by: `relevance`, `date`, `popularity`, `title`         |
| `order`              | string  | No       | `desc`        | Sort order: `asc`, `desc`                                   |
| `search_in`          | string  | No       | `all`         | Search scope: `all`, `title`, `content`, `tags`, `keywords` |

\* Non-authenticated users can only search published articles

**Example Request:**

```http
GET /api/v1/articles/search?q=artificial%20intelligence&sort=relevance&limit=10&status=published&search_in=all
```

**Response (200):**

```json
{
  "query": "artificial intelligence",
  "total": 15,
  "limit": 10,
  "offset": 0,
  "page": 1,
  "per_page": 10,
  "total_pages": 2,
  "has_next": true,
  "has_prev": false,
  "sort_by": "relevance",
  "sort_order": "desc",
  "search_in": "all",
  "filters": {
    "status": "published",
    "category_id": null,
    "is_featured": null,
    "date_from": null,
    "date_to": null
  },
  "articles": [
    {
      "id": 1,
      "title": "The Future of Artificial Intelligence",
      "slug": "the-future-of-artificial-intelligence",
      "excerpt": "Explore the cutting-edge developments in AI...",
      "highlight": "...the rapid advancement of **artificial intelligence** is transforming industries...",
      "image": "https://your-cdn.cloudfront.net/articles/123/main/abc123.jpg",
      "category": {
        "id": 1,
        "name": "Technology",
        "slug": "technology"
      },
      "status": "published",
      "is_featured": true,
      "view_count": 1250,
      "comment_count": 23,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "tags": ["AI", "Machine Learning", "Technology"],
      "keywords": [
        "artificial intelligence",
        "neural networks",
        "deep learning"
      ],
      "created_at": "2025-01-15T10:30:00.000000",
      "updated_at": "2025-01-20T14:00:00.000000",
      "published_at": "2025-01-15T12:00:00.000000"
    }
  ]
}
```

**Error Response (400):**

```json
{
  "error": "Search query is required",
  "message": "Please provide a search term using the \"q\" parameter"
}
```

```json
{
  "error": "Search query too short",
  "message": "Search query must be at least 2 characters"
}
```

**Relevance Scoring:**

When `sort=relevance`, results are ranked by:

1. **100 points**: Exact title match
2. **80 points**: Title starts with query
3. **60 points**: Title contains query
4. **40 points**: Excerpt contains query
5. **20 points**: Content or other fields contain query

**Search Scopes:**

| Scope      | Description                                          |
| ---------- | ---------------------------------------------------- |
| `all`      | Searches title, content, excerpt, tags, and keywords |
| `title`    | Searches only in article titles                      |
| `content`  | Searches in content and excerpt                      |
| `tags`     | Searches only in associated tags                     |
| `keywords` | Searches only in associated keywords                 |

**Highlight Field:**

The `highlight` field contains a snippet from the article (excerpt or content) showing where the search term was found, with approximately 50 characters before and 150 characters after the match. This is useful for displaying search results with context.

**Notes:**

- Minimum query length: 2 characters
- Maximum query length: 200 characters
- Maximum results per page: 100
- Results are cached for a short duration to improve performance
- Non-authenticated users can only search `published` articles
- With `X-Tenant-ID`: Returns tenant articles + global articles (tenant_id=NULL)
- Without `X-Tenant-ID`: Returns only global articles
- The search is case-insensitive
- Supports partial matches (e.g., "intell" matches "intelligence")

**Best Practices:**

1. **For blog search bars**: Use `search_in=all` with `sort=relevance`
2. **For tag-based filtering**: Use `search_in=tags` to find articles by topic
3. **For SEO keyword analysis**: Use `search_in=keywords`
4. **For date-ranged searches**: Combine `date_from` and `date_to` for time-based queries
5. **For infinite scroll**: Use `offset` pagination; for page numbers, use `page` parameter

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

### Get Category By Slug

```http
GET /api/v1/categories/slug/<slug>
X-Tenant-ID: <tenant_id> (optional)
```

Fetch a category by its human-readable `slug`. This endpoint mirrors `GET /api/v1/categories/<id>` but accepts the slug instead of the numeric ID. When `X-Tenant-ID` is present the server resolves the slug within the tenant scope (and will also return global categories when appropriate).

**Response (200):**

```json
{
  "id": 1,
  "name": "Technology",
  "slug": "technology",
  "description": "Technology related articles",
  "tenant_id": null,
  "created_at": "2025-01-01T00:00:00.000000",
  "article_count": 42
}
```

**Notes:**

- Returns `404` if slug not found within the resolved tenant/global scope.
- Useful for frontend routing and SEO-friendly category pages.

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

## Comment Endpoints

### Get Article Comments

```http
GET /api/v1/comments/article/<article_id>
```

**Query Parameters:**

- `limit` (optional): Maximum number of comments to return (default: 100, max: 200)
- `offset` (optional): Number of comments to skip (default: 0)
- `include_unapproved` (optional): Include unapproved comments (admin only, default: false)

**Response (200):**

```json
{
  "comments": [
    {
      "id": 1,
      "article_id": 123,
      "user": {
        "id": 5,
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "content": "Great article! Very informative.",
      "parent_id": null,
      "is_approved": true,
      "is_edited": false,
      "created_at": "2025-12-31T12:00:00.000000",
      "updated_at": "2025-12-31T12:00:00.000000",
      "replies": [
        {
          "id": 2,
          "article_id": 123,
          "user": {
            "id": 1,
            "username": "janedoe",
            "full_name": "Jane Doe",
            "email": "jane@example.com"
          },
          "content": "Thank you! Glad you found it helpful.",
          "parent_id": 1,
          "is_approved": true,
          "is_edited": false,
          "created_at": "2025-12-31T12:05:00.000000",
          "updated_at": "2025-12-31T12:05:00.000000"
        }
      ],
      "reply_count": 1
    }
  ],
  "total_count": 15,
  "limit": 100,
  "offset": 0
}
```

### Create Comment

```http
POST /api/v1/comments/
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "article_id": 123,
  "content": "This is a great article!",
  "parent_id": null
}
```

**Request Body (Reply):**

```json
{
  "article_id": 123,
  "content": "I agree with your point!",
  "parent_id": 1
}
```

**Response (201):**

```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": 3,
    "article_id": 123,
    "user": {
      "id": 5,
      "username": "johndoe",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "content": "This is a great article!",
    "parent_id": null,
    "is_approved": true,
    "is_edited": false,
    "created_at": "2025-12-31T12:00:00.000000",
    "updated_at": "2025-12-31T12:00:00.000000"
  }
}
```

**Error Responses:**

**400 Bad Request:**

```json
{
  "error": "article_id is required"
}
```

```json
{
  "error": "content is required and cannot be empty"
}
```

```json
{
  "error": "Comment content cannot exceed 5000 characters"
}
```

```json
{
  "error": "Parent comment must belong to the same article"
}
```

**401 Unauthorized:**

```json
{
  "error": "Authentication required"
}
```

### Get Comment by ID

```http
GET /api/v1/comments/<comment_id>
```

**Response (200):**

```json
{
  "comment": {
    "id": 1,
    "article_id": 123,
    "user": {
      "id": 5,
      "username": "johndoe",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "content": "Great article!",
    "parent_id": null,
    "is_approved": true,
    "is_edited": false,
    "created_at": "2025-12-31T12:00:00.000000",
    "updated_at": "2025-12-31T12:00:00.000000",
    "replies": [],
    "reply_count": 0
  }
}
```

### Update Comment

```http
PUT /api/v1/comments/<comment_id>
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Updated comment content"
}
```

**Response (200):**

```json
{
  "message": "Comment updated successfully",
  "comment": {
    "id": 1,
    "article_id": 123,
    "user": {
      "id": 5,
      "username": "johndoe",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "content": "Updated comment content",
    "parent_id": null,
    "is_approved": true,
    "is_edited": true,
    "created_at": "2025-12-31T12:00:00.000000",
    "updated_at": "2025-12-31T12:30:00.000000"
  }
}
```

**Error Responses:**

**403 Forbidden:**

```json
{
  "error": "You can only edit your own comments"
}
```

**404 Not Found:**

```json
{
  "error": "Comment not found"
}
```

### Delete Comment

```http
DELETE /api/v1/comments/<comment_id>
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "Comment deleted successfully"
}
```

**Error Responses:**

**403 Forbidden:**

```json
{
  "error": "You can only delete your own comments"
}
```

**404 Not Found:**

```json
{
  "error": "Comment not found"
}
```

### Get User Comments

```http
GET /api/v1/comments/user/<user_id>
```

**Query Parameters:**

- `limit` (optional): Maximum number of comments to return (default: 50, max: 200)
- `offset` (optional): Number of comments to skip (default: 0)

**Response (200):**

```json
{
  "comments": [
    {
      "id": 1,
      "article_id": 123,
      "user": {
        "id": 5,
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "content": "Great article!",
      "parent_id": null,
      "is_approved": true,
      "is_edited": false,
      "created_at": "2025-12-31T12:00:00.000000",
      "updated_at": "2025-12-31T12:00:00.000000"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

### Moderate Comment (Admin Only)

```http
PUT /api/v1/comments/<comment_id>/moderate
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "is_approved": true
}
```

**Response (200):**

```json
{
  "message": "Comment moderated successfully",
  "comment": {
    "id": 1,
    "article_id": 123,
    "user": {
      "id": 5,
      "username": "johndoe",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "content": "Great article!",
    "parent_id": null,
    "is_approved": true,
    "is_edited": false,
    "created_at": "2025-12-31T12:00:00.000000",
    "updated_at": "2025-12-31T12:00:00.000000"
  }
}
```

**Error Responses:**

**403 Forbidden:**

```json
{
  "error": "Admin privileges required"
}
```

---

## Team Management

Team Management allows tenant owners and admins to manage their team members. Team members can be:

- Existing platform users (automatically linked)
- Non-platform users (tenant-specific profiles only)

**Permissions:** Only `owner` and `admin` roles can manage team members.

### Create Team Member

```http
POST /api/v1/team
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (required)
```

**Request Body:**

```json
{
  "full_name": "Jane Smith",
  "role": "Editor",
  "position": "Senior Content Editor",
  "email": "jane@example.com",
  "phone": "+1-555-0123",
  "profile_photo": "https://example.com/photos/jane.jpg",
  "bio": "Experienced editor with 10 years in digital content.",
  "social_links": [
    {
      "platform": "linkedin",
      "handle": "janesmith",
      "url": "https://linkedin.com/in/janesmith"
    },
    {
      "platform": "twitter",
      "handle": "@janesmith",
      "url": "https://twitter.com/janesmith"
    }
  ],
  "user_id": 123,
  "display_order": 1,
  "is_active": true
}
```

**Required Fields:**

- `full_name`: Team member's full name
- `role`: Role/position (e.g., "Editor", "Manager", "Secretary", "Contributor")

**Optional Fields:**

- `user_id`: Link to existing platform user (auto-fills from user account)
- `position`: Additional role description
- `email`: Contact email
- `phone`: Contact phone
- `profile_photo`: URL to profile photo
- `bio`: Short biography
- `social_links`: Array of social link objects. See **Social Links Format & Validation** below.
- `display_order`: Order for display (default: 0)
- `is_active`: Active status (default: true)

### Social Links Format & Validation

- Expected type: JSON array of objects. The endpoint accepts either a JSON list or a JSON string containing the list.
- Each object MUST include the following keys:
  - `social_website` (string) — identifier or name of the social site (e.g. `twitter`, `linkedin`).
  - `handle` (string) — user's handle on that site (e.g. `@janesmith` or `janesmith`).
- Optional keys allowed per object: `url` (string), `icon` (string), `label` (string).
- Validation behavior: the API enforces the structure server-side. If `social_links` is not an array, or any item is not an object, or a required key is missing or not a non-empty string, the API will return `400 Bad Request` with an error message describing the problem.

Example valid `social_links`:

```json
[
  {
    "platform": "linkedin",
    "handle": "janesmith",
    "url": "https://linkedin.com/in/janesmith"
  },
  { "platform": "twitter", "handle": "@janesmith" }
]
```

Notes:

- The server normalizes and strips surrounding whitespace from `social_website` and `handle` values.
- Clients should prefer the `social_website` / `handle` keys to avoid validation errors.

**Response (201):**

```json
{
  "message": "Team member created successfully",
  "team_member": {
    "id": 1,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": 123,
    "full_name": "Jane Smith",
    "role": "Editor",
    "position": "Senior Content Editor",
    "email": "jane@example.com",
    "phone": "+1-555-0123",
    "profile_photo": "https://example.com/photos/jane.jpg",
    "bio": "Experienced editor with 10 years in digital content.",
    "social_links": [
      {
        "platform": "linkedin",
        "handle": "janesmith",
        "url": "https://linkedin.com/in/janesmith"
      },
      {
        "platform": "twitter",
        "handle": "@janesmith",
        "url": "https://twitter.com/janesmith"
      }
    ],
    "is_active": true,
    "display_order": 1,
    "created_at": "2026-01-09T00:00:00.000000",
    "updated_at": "2026-01-09T00:00:00.000000",
    "is_platform_user": true
  }
}
```

**Notes:**

- Only owners and admins can create team members
- If `user_id` is provided, checks if user exists
- Prevents duplicate team entries for the same user

---

### List Team Members

```http
GET /api/v1/team
X-Tenant-ID: <tenant_id> (required)
```

**Query Parameters:**

- `include_inactive` (optional): `true` to include inactive team members (default: `false`)

**Response (200):**

```json
{
  "total": 5,
  "team_members": [
    {
      "id": 1,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": 123,
      "full_name": "Jane Smith",
      "role": "Editor",
      "position": "Senior Content Editor",
      "email": "jane@example.com",
      "phone": "+1-555-0123",
      "profile_photo": "https://example.com/photos/jane.jpg",
      "bio": "Experienced editor with 10 years in digital content.",
      "social_links": [
        {
          "platform": "linkedin",
          "handle": "janesmith",
          "url": "https://linkedin.com/in/janesmith"
        }
      ],
      "is_active": true,
      "display_order": 1,
      "created_at": "2026-01-09T00:00:00.000000",
      "updated_at": "2026-01-09T00:00:00.000000",
      "is_platform_user": true
    }
  ]
}
```

**Notes:**

- Public endpoint - no authentication required
- Returns team members ordered by `display_order` then `created_at`
- Only returns active members unless `include_inactive=true`

---

### Get Team Member

```http
GET /api/v1/team/<team_member_id>
X-Tenant-ID: <tenant_id> (required)
```

**Response (200):**

```json
{
  "team_member": {
    "id": 1,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": 123,
    "full_name": "Jane Smith",
    "role": "Editor",
    "position": "Senior Content Editor",
    "email": "jane@example.com",
    "phone": "+1-555-0123",
    "profile_photo": "https://example.com/photos/jane.jpg",
    "bio": "Experienced editor with 10 years in digital content.",
    "social_links": [
      {
        "platform": "linkedin",
        "handle": "janesmith",
        "url": "https://linkedin.com/in/janesmith"
      }
    ],
    "is_active": true,
    "display_order": 1,
    "created_at": "2026-01-09T00:00:00.000000",
    "updated_at": "2026-01-09T00:00:00.000000",
    "is_platform_user": true
  }
}
```

**Notes:**

- Public endpoint - no authentication required

---

### Update Team Member

```http
PUT /api/v1/team/<team_member_id>
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (required)
```

**Request Body (all fields optional):**

```json
{
  "full_name": "Jane M. Smith",
  "role": "Chief Editor",
  "position": "Head of Content",
  "email": "jane.smith@example.com",
  "phone": "+1-555-9999",
  "profile_photo": "https://example.com/photos/jane-new.jpg",
  "bio": "Updated biography...",
  "social_links": [
    {
      "platform": "linkedin",
      "handle": "janemsmith",
      "url": "https://linkedin.com/in/janemsmith"
    }
  ],
  "is_active": false,
  "display_order": 5
}
```

**Response (200):**

```json
{
  "message": "Team member updated successfully",
  "team_member": {
    "id": 1,
    "full_name": "Jane M. Smith",
    "role": "Chief Editor",
    ...
  }
}
```

**Notes:**

- Only owners and admins can update team members
- All fields are optional - only provided fields are updated
- Updating team profile does NOT affect the linked user's global account

---

### Delete Team Member

```http
DELETE /api/v1/team/<team_member_id>
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (required)
```

**Response (200):**

```json
{
  "message": "Team member deleted successfully"
}
```

**Notes:**

- Only owners and admins can delete team members
- Deleting team entry does NOT delete the user's platform account
- Returns 404 if team member not found

---

### Sync Tenant Users

```http
POST /api/v1/team/sync-users
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (required)
```

**Description:**
Auto-creates team member entries for all tenant members who don't have one yet. Useful for existing tenants to populate their team section.

**Response (200):**

```json
{
  "message": "Tenant users synced successfully",
  "created": 5,
  "skipped": 2,
  "total": 7
}
```

**Notes:**

- Only owners and admins can sync users
- Skips users who already have team entries
- Auto-assigns role based on user's tenant membership role

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
    "is_active": true,
    "is_verified": false,
    "settings": {},
    "branding": {},
    "api_key_prefix": "mab_",
    "created_at": "2025-01-01T00:00:00.000000"
  }
}
```

**Notes:**

- Authenticated user becomes owner
- Domain must be unique and format: "domain.com" (no protocol)
- API key prefix generated from first 3 chars of slug
- Article limits are tracked at the user/subscription level, not per-tenant

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
    "is_active": true,
    "is_verified": true,
    "settings": {},
    "branding": {},
    "webhook_url": null,
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
    "is_active": true,
    "is_verified": true,
    "settings": {},
    "branding": {},
    "webhook_url": "https://myblog.com/webhooks",
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

## Article Scheduling

Article Scheduling allows automated creation and publishing of articles per category on a daily schedule. Configuration is stored in the database and executed by Celery Beat.

**Permissions:** Requires authentication. Tenant-aware (optional `X-Tenant-ID` header).

### List Scheduling Configurations

```http
GET /api/v1/scheduling/configs
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Query Parameters:**

| Parameter      | Type    | Default | Description                    |
| -------------- | ------- | ------- | ------------------------------ |
| `enabled_only` | boolean | false   | Filter to only enabled configs |
| `limit`        | integer | 100     | Maximum number of results      |

**Response (200):**

```json
{
  "total": 2,
  "configs": [
    {
      "id": 1,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "category_id": 5,
      "category_name": "Technology",
      "articles_per_day": 3,
      "scheduled_hour": 8,
      "scheduled_minute": 0,
      "scheduled_time": "08:00 UTC",
      "default_topic": "Latest Technology Trends",
      "target_keywords": ["technology", "innovation", "AI"],
      "word_count": 1500,
      "tone": "professional",
      "generate_image": true,
      "auto_publish": false,
      "is_enabled": true,
      "priority": 1,
      "last_run_at": "2025-01-30T08:00:00.000000",
      "last_error": null,
      "total_articles_generated": 45,
      "created_at": "2025-01-01T00:00:00.000000",
      "updated_at": "2025-01-30T08:00:00.000000"
    }
  ]
}
```

### Get Scheduling Configuration

```http
GET /api/v1/scheduling/configs/<config_id>
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):**

```json
{
  "id": 1,
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": 5,
  "category_name": "Technology",
  "articles_per_day": 3,
  "scheduled_hour": 8,
  "scheduled_minute": 0,
  "scheduled_time": "08:00 UTC",
  "default_topic": "Latest Technology Trends",
  "target_keywords": ["technology", "innovation", "AI"],
  "word_count": 1500,
  "tone": "professional",
  "generate_image": true,
  "auto_publish": false,
  "is_enabled": true,
  "priority": 1,
  "last_run_at": "2025-01-30T08:00:00.000000",
  "last_error": null,
  "total_articles_generated": 45,
  "created_at": "2025-01-01T00:00:00.000000",
  "updated_at": "2025-01-30T08:00:00.000000"
}
```

### Get Scheduling Configuration by Category

```http
GET /api/v1/scheduling/configs/category/<category_id>
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (200):** Same format as Get Scheduling Configuration.

### Create Scheduling Configuration

```http
POST /api/v1/scheduling/configs
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body:**

```json
{
  "category_id": 5,
  "articles_per_day": 3,
  "scheduled_hour": 8,
  "scheduled_minute": 0,
  "default_topic": "Latest Technology Trends",
  "target_keywords": ["technology", "innovation", "AI"],
  "word_count": 1500,
  "tone": "professional",
  "generate_image": true,
  "auto_publish": false,
  "is_enabled": true,
  "priority": 1
}
```

**Required Fields:**

| Field         | Type    | Description                          |
| ------------- | ------- | ------------------------------------ |
| `category_id` | integer | Category ID to schedule articles for |

**Optional Fields:**

| Field              | Type    | Default        | Description                                       |
| ------------------ | ------- | -------------- | ------------------------------------------------- |
| `articles_per_day` | integer | 1              | Number of articles to generate daily (1-10)       |
| `scheduled_hour`   | integer | 6              | Hour in UTC (0-23) to run                         |
| `scheduled_minute` | integer | 0              | Minute (0-59) to run                              |
| `default_topic`    | string  | null           | Default topic/theme for article generation        |
| `target_keywords`  | array   | null           | List of target keywords for SEO                   |
| `word_count`       | integer | 1000           | Target word count for generated articles          |
| `tone`             | string  | "professional" | Writing tone (e.g., professional, casual, formal) |
| `generate_image`   | boolean | true           | Generate main article image using DALL-E          |
| `auto_publish`     | boolean | false          | Auto-publish articles or save as draft            |
| `is_enabled`       | boolean | true           | Enable/disable scheduling                         |
| `priority`         | integer | 0              | Processing priority (higher = processed first)    |

**Response (201):** Same format as Get Scheduling Configuration.

**Error Responses:**

- `400`: Missing `category_id`, invalid hour/minute range, or invalid `articles_per_day`
- `400`: Scheduling config already exists for this category

### Update Scheduling Configuration

```http
PUT /api/v1/scheduling/configs/<config_id>
Authorization: Bearer <access_token>
Content-Type: application/json
X-Tenant-ID: <tenant_id> (optional)
```

**Request Body:** All fields are optional. Only provided fields will be updated.

```json
{
  "articles_per_day": 5,
  "scheduled_hour": 10,
  "scheduled_minute": 30,
  "is_enabled": false,
  "auto_publish": true
}
```

**Response (200):** Same format as Get Scheduling Configuration.

### Delete Scheduling Configuration

```http
DELETE /api/v1/scheduling/configs/<config_id>
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Response (204):** No content on success.

### Trigger Article Generation Manually

```http
POST /api/v1/scheduling/configs/<config_id>/trigger
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

Triggers article generation for a specific config immediately, outside the normal schedule.

**Response (202):**

```json
{
  "message": "Article generation triggered",
  "config_id": 1,
  "task_id": "abc123-task-id-456"
}
```

### List Generation Logs

```http
GET /api/v1/scheduling/logs
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Query Parameters:**

| Parameter   | Type    | Default | Description                                 |
| ----------- | ------- | ------- | ------------------------------------------- |
| `config_id` | integer | null    | Filter by scheduling config ID              |
| `status`    | string  | null    | Filter by status (success, failed, skipped) |
| `limit`     | integer | 50      | Maximum number of results                   |

**Response (200):**

```json
{
  "total": 10,
  "logs": [
    {
      "id": 1,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "config_id": 1,
      "category_id": 5,
      "category_name": "Technology",
      "article_id": 123,
      "status": "success",
      "topic_used": "Latest Technology Trends",
      "error_message": null,
      "generation_time_ms": 4523,
      "created_at": "2025-01-30T08:00:05.000000"
    },
    {
      "id": 2,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "config_id": 1,
      "category_id": 5,
      "category_name": "Technology",
      "article_id": null,
      "status": "failed",
      "topic_used": "AI Innovations",
      "error_message": "OpenAI API rate limit exceeded",
      "generation_time_ms": 1200,
      "created_at": "2025-01-30T08:00:10.000000"
    }
  ]
}
```

### Get Generation Statistics

```http
GET /api/v1/scheduling/stats
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (optional)
```

**Query Parameters:**

| Parameter | Type    | Default | Description                 |
| --------- | ------- | ------- | --------------------------- |
| `days`    | integer | 7       | Number of days to look back |

**Response (200):**

```json
{
  "period_days": 7,
  "statistics": {
    "total": 50,
    "success": 45,
    "failed": 3,
    "skipped": 2
  }
}
```

---

## Social Media Posting

Automated social media posting for articles via Meta (Facebook, Instagram) with AI-generated content. This system allows you to:

- Configure Facebook Pages and Instagram Business accounts for automated posting
- Generate AI-powered engaging posts from article content
- Post immediately or schedule for later
- Track posting history and statistics

### User-Level Ownership and Tenant Sharing

Social media accounts are connected at the **user level**. This means:

- Users own their connected social media accounts
- The same account can be shared across multiple tenants
- Per-tenant settings (article_base_url, auto_post_enabled) can override defaults
- Users can attach/detach their accounts from tenants they have access to

### Configuration Endpoints

#### List Social Media Configurations

```http
GET /api/v1/social-media/configs
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

**Query Parameters:**

| Parameter   | Type    | Description                                                          |
| ----------- | ------- | -------------------------------------------------------------------- |
| platform    | string  | Filter by platform ('facebook', 'instagram', 'facebook_page')        |
| active_only | boolean | Only return active configurations (default: false)                   |
| scope       | string  | 'user' (owned), 'tenant' (shared with tenant), 'all' (both, default) |

**Response (200):**

```json
{
  "total": 2,
  "configs": [
    {
      "id": 1,
      "user_id": 5,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "platform": "facebook_page",
      "account_name": "My Business Page",
      "account_id": "123456789",
      "token_expires_at": "2026-04-01T00:00:00.000000",
      "platform_data": { "page_category": "Business" },
      "default_hashtags": ["tech", "news"],
      "post_template": null,
      "auto_post_enabled": false,
      "is_active": true,
      "is_owner": true,
      "last_verified_at": "2026-01-31T12:00:00.000000",
      "created_at": "2026-01-15T10:00:00.000000",
      "updated_at": "2026-01-31T12:00:00.000000"
    }
  ]
}
```

#### Get Configuration by ID

```http
GET /api/v1/social-media/configs/<config_id>
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

**Response (200):**

```json
{
  "id": 1,
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "facebook_page",
  "account_name": "My Business Page",
  "account_id": "123456789",
  "token_expires_at": "2026-04-01T00:00:00.000000",
  "platform_data": null,
  "default_hashtags": ["tech", "news"],
  "post_template": null,
  "auto_post_enabled": false,
  "is_active": true,
  "last_verified_at": "2026-01-31T12:00:00.000000",
  "created_at": "2026-01-15T10:00:00.000000",
  "updated_at": "2026-01-31T12:00:00.000000"
}
```

#### Create Configuration

```http
POST /api/v1/social-media/configs
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
Content-Type: application/json
```

**Request Body:**

```json
{
  "platform": "facebook_page",
  "account_name": "My Business Page",
  "account_id": "123456789",
  "access_token": "EAAxxxxxx...",
  "token_expires_at": "2026-04-01T00:00:00Z",
  "refresh_token": "optional_refresh_token",
  "platform_data": { "page_category": "Business" },
  "article_base_url": "https://www.example.com/article/",
  "default_hashtags": ["tech", "news"],
  "post_template": "Check out our latest article: {title}",
  "auto_post_enabled": false
}
```

**Required Fields:**

| Field        | Type   | Description                                      |
| ------------ | ------ | ------------------------------------------------ |
| platform     | string | One of: 'facebook', 'facebook_page', 'instagram' |
| account_name | string | Friendly name for the account                    |
| account_id   | string | Platform-specific account or page ID             |
| access_token | string | OAuth access token from Meta                     |

**Optional Fields:**

| Field             | Type    | Description                                                  |
| ----------------- | ------- | ------------------------------------------------------------ |
| token_expires_at  | string  | Token expiration (ISO format)                                |
| refresh_token     | string  | Refresh token if available                                   |
| platform_data     | object  | Additional platform-specific data                            |
| article_base_url  | string  | Base URL for articles (e.g., "https://example.com/article/") |
| default_hashtags  | array   | Default hashtags to include in posts                         |
| post_template     | string  | Custom template for posts                                    |
| auto_post_enabled | boolean | Auto-post new articles when generated (default: false)       |

**Auto-Posting on Article Generation:**

When `auto_post_enabled` is set to `true`, the system will automatically:

1. Generate AI-powered engaging content for the article
2. Post to this social media account immediately after article creation
3. Use the configured `article_base_url` to construct the article link

This happens asynchronously in the background when `/api/v1/articles/generate` is called.

**Article URL Construction:**

When `article_base_url` is configured, article links are automatically constructed:

- Base URL: `https://www.booxtore.com/article/`
- Article slug: `my-article-title`
- Final URL: `https://www.booxtore.com/article/my-article-title`

**Response (201):**

```json
{
  "id": 1,
  "platform": "facebook_page",
  "account_name": "My Business Page",
  "account_id": "123456789",
  "is_active": true,
  "created_at": "2026-01-31T15:00:00.000000"
}
```

#### Update Configuration

```http
PUT /api/v1/social-media/configs/<config_id>
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
Content-Type: application/json
```

**Request Body:**

```json
{
  "account_name": "Updated Page Name",
  "auto_post_enabled": true,
  "default_hashtags": ["updated", "hashtags"],
  "is_active": true
}
```

**Response (200):** Returns updated configuration object.

#### Delete Configuration

Only the owner can delete a configuration. Non-owners can only detach from their tenant.

```http
DELETE /api/v1/social-media/configs/<config_id>
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

**Response (204):** No content (if owner deleted the config).

**Response (200):** Config detached from tenant (if non-owner).

```json
{
  "message": "Configuration detached from tenant"
}
```

#### Attach Configuration to Tenant

Attach a social media config you own to a tenant.

```http
POST /api/v1/social-media/configs/<config_id>/attach
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "article_base_url": "https://www.example.com/article/",
  "auto_post_enabled": true
}
```

**Response (200):**

```json
{
  "message": "Configuration attached to tenant"
}
```

#### Detach Configuration from Tenant

Remove a config from a tenant (does not delete the config).

```http
POST /api/v1/social-media/configs/<config_id>/detach
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**

```json
{
  "message": "Configuration detached from tenant"
}
```

#### List Tenants for Configuration

List all tenants a configuration is attached to (owner only).

```http
GET /api/v1/social-media/configs/<config_id>/tenants
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "total": 2,
  "tenants": [
    {
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "tenant_name": "My Website",
      "tenant_slug": "my-website",
      "article_base_url": "https://mywebsite.com/article/",
      "auto_post_enabled": true,
      "attached_at": "2026-02-01T10:00:00.000000"
    }
  ]
}
```

#### Verify Token

Verify that a configuration's access token is still valid with Meta's API.

```http
POST /api/v1/social-media/configs/<config_id>/verify
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

**Response (200):**

```json
{
  "valid": true,
  "expires_at": 1735689600,
  "scopes": ["pages_manage_posts", "pages_read_engagement"],
  "last_verified_at": "2026-01-31T15:00:00.000000"
}
```

### Content Generation Endpoints

#### Generate AI Post

Generate an AI-powered social media post from an article.

```http
POST /api/v1/social-media/generate-post
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
Content-Type: application/json
```

**Request Body:**

```json
{
  "article_id": 123,
  "config_id": 1,
  "platform": "facebook",
  "style": "engaging",
  "include_link": true,
  "custom_hashtags": ["extra", "tags"]
}
```

**Parameters:**

| Field           | Type    | Required | Description                                                   |
| --------------- | ------- | -------- | ------------------------------------------------------------- |
| article_id      | integer | Yes      | ID of the article to generate post for                        |
| config_id       | integer | No       | Config ID (uses config's article_base_url for link)           |
| platform        | string  | No       | Target platform (default: 'facebook')                         |
| style           | string  | No       | Post style: 'engaging', 'professional', 'casual', 'clickbait' |
| include_link    | boolean | No       | Include article link in post (default: true)                  |
| custom_hashtags | array   | No       | Additional hashtags to include                                |
| article_url     | string  | No       | Override URL (if not provided, uses config's base URL + slug) |

**URL Construction:**

The article link is determined in this order:

1. If `article_url` is provided, use it directly
2. If `config_id` is provided and config has `article_base_url`, construct URL as: `{article_base_url}/{article.slug}`
3. Otherwise, use a placeholder URL

**Response (200):**

```json
{
  "article_id": 123,
  "platform": "facebook",
  "generated_post": {
    "text": "🚀 You won't believe what we discovered about AI technology! This changes everything...",
    "hashtags": ["AI", "technology", "innovation"],
    "call_to_action": "Read the full story!",
    "emoji_enhanced": true
  },
  "formatted_content": "🚀 You won't believe what we discovered about AI technology! This changes everything...\n\n👉 Read the full story!\n\n🔗 https://www.booxtore.com/article/ai-technology-discovery\n\n#AI #technology #innovation",
  "character_count": 210
}
```

#### Regenerate Post with Feedback

Regenerate a post based on user feedback.

```http
POST /api/v1/social-media/regenerate-post
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "original_post": "Original post text here...",
  "feedback": "Make it more exciting and add more emojis",
  "platform": "instagram"
}
```

**Response (200):**

```json
{
  "regenerated_post": {
    "text": "🔥💡 BREAKING: Revolutionary AI discovery! 🤯",
    "hashtags": ["AI", "tech", "future"],
    "call_to_action": "Tap the link to learn more!"
  },
  "formatted_content": "🔥💡 BREAKING: Revolutionary AI discovery! 🤯...",
  "character_count": 150
}
```

### Posting Endpoints

#### Post to Social Media

Post content to a configured social media platform.

```http
POST /api/v1/social-media/post
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
Content-Type: application/json
```

**Request Body:**

```json
{
  "config_id": 1,
  "article_id": 123,
  "post_content": "Check out our latest article on AI technology! 🚀\n\n#AI #tech",
  "image_url": "https://example.com/image.jpg",
  "link_url": "https://myblog.com/articles/ai-technology",
  "hashtags": ["AI", "tech"],
  "scheduled_for": "2026-02-01T10:00:00Z",
  "ai_generated": true,
  "was_edited": false
}
```

**Required Fields:**

| Field        | Type    | Description                   |
| ------------ | ------- | ----------------------------- |
| config_id    | integer | Social media configuration ID |
| article_id   | integer | Article being shared          |
| post_content | string  | The post text content         |

**Optional Fields:**

| Field         | Type    | Description                                      |
| ------------- | ------- | ------------------------------------------------ |
| image_url     | string  | Image URL to include (required for Instagram)    |
| link_url      | string  | Article link to share                            |
| hashtags      | array   | Additional hashtags                              |
| scheduled_for | string  | Schedule post for later (ISO datetime)           |
| ai_generated  | boolean | Whether content was AI-generated (default: true) |
| was_edited    | boolean | Whether user edited content (default: false)     |

**Response (201) - Immediate Post:**

```json
{
  "success": true,
  "log_id": 45,
  "platform_post_id": "123456789_987654321",
  "platform_post_url": "https://facebook.com/123456789/posts/987654321"
}
```

**Response (201) - Scheduled Post:**

```json
{
  "success": true,
  "log_id": 46,
  "scheduled_for": "2026-02-01T10:00:00.000000",
  "message": "Post scheduled successfully"
}
```

**Response (400) - Failed Post:**

```json
{
  "success": false,
  "log_id": 47,
  "error": "Invalid access token",
  "error_code": "190"
}
```

### Log Endpoints

#### List Post Logs

```http
GET /api/v1/social-media/logs
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

**Query Parameters:**

| Parameter  | Type    | Description                                                   |
| ---------- | ------- | ------------------------------------------------------------- |
| config_id  | integer | Filter by configuration                                       |
| article_id | integer | Filter by article                                             |
| status     | string  | Filter by status: 'pending', 'success', 'failed', 'scheduled' |
| limit      | integer | Maximum results (default: 50)                                 |
| offset     | integer | Pagination offset                                             |

**Response (200):**

```json
{
  "total": 25,
  "logs": [
    {
      "id": 45,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "config_id": 1,
      "platform": "facebook_page",
      "account_name": "My Business Page",
      "article_id": 123,
      "article_title": "AI Technology Breakthrough",
      "post_content": "Check out our latest article! 🚀",
      "ai_generated": true,
      "was_edited": false,
      "status": "success",
      "platform_post_id": "123456789_987654321",
      "platform_post_url": "https://facebook.com/123456789/posts/987654321",
      "error_message": null,
      "error_code": null,
      "scheduled_for": null,
      "posted_at": "2026-01-31T15:30:00.000000",
      "retry_count": 0,
      "created_at": "2026-01-31T15:29:55.000000",
      "updated_at": "2026-01-31T15:30:00.000000"
    }
  ]
}
```

#### Get Post Log by ID

```http
GET /api/v1/social-media/logs/<log_id>
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

**Response (200):** Returns single log object.

#### Get Posting Statistics

```http
GET /api/v1/social-media/stats
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

**Query Parameters:**

| Parameter | Type    | Description                     |
| --------- | ------- | ------------------------------- |
| days      | integer | Days to look back (default: 30) |

**Response (200):**

```json
{
  "period_days": 30,
  "statistics": {
    "total": 50,
    "success": 45,
    "failed": 3,
    "pending": 1,
    "scheduled": 1,
    "success_rate": 90.0,
    "by_platform": {
      "facebook_page": { "total": 30, "success": 28, "failed": 2 },
      "instagram": { "total": 20, "success": 17, "failed": 1 }
    }
  }
}
```

### Meta OAuth Flow Endpoints

These endpoints provide a complete OAuth flow for connecting Facebook and Instagram accounts without manual token management.

#### Connect Facebook/Instagram (OAuth)

Initiate the OAuth flow to connect Facebook Pages and Instagram Business accounts. This redirects the user to Facebook's authorization page.

**Supports both GET and POST methods.**

```http
GET /api/v1/social-media/oauth/connect?access_token=<jwt_token>&frontend_callback=<url>
```

or

```http
POST /api/v1/social-media/oauth/connect
Content-Type: application/json

{
  "access_token": "<jwt_token>",
  "frontend_callback": "https://myapp.com/settings/social",
  "tenant_id": "optional-tenant-uuid"
}
```

**Authentication (checked in order):**

| Source               | Example                             |
| -------------------- | ----------------------------------- |
| Authorization header | `Authorization: Bearer <jwt_token>` |
| POST body            | `{"access_token": "<jwt_token>"}`   |
| Query parameter      | `?access_token=<jwt_token>`         |

**Parameters (query or POST body):**

| Parameter         | Type   | Description                                       |
| ----------------- | ------ | ------------------------------------------------- |
| access_token      | string | JWT access token (if not in Authorization header) |
| frontend_callback | string | URL to redirect to after OAuth completes          |
| tenant_id         | string | Optional tenant ID (can also be in header/JWT)    |

**Behavior:**

1. Redirects user to Facebook OAuth dialog
2. Requests permissions: `pages_show_list`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`
3. After user grants permission, redirects to callback endpoint
4. Callback automatically creates configurations for all accessible Pages and Instagram accounts
5. Redirects to `frontend_callback` URL with results

**Example Flows:**

Using query parameter (recommended for browser redirects):

```javascript
// Get the token from your auth context
const token = getAccessToken();

// Redirect to OAuth connect with token in query
window.location.href =
  "/api/v1/social-media/oauth/connect" +
  "?access_token=" +
  encodeURIComponent(token) +
  "&frontend_callback=" +
  encodeURIComponent(window.location.origin + "/settings/social");

// After OAuth completes, user is redirected to:
// /settings/social?success=true&pages=2&instagram=1&created=3
```

Using POST (for programmatic access):

```javascript
// First POST to get the redirect URL
fetch("/api/v1/social-media/oauth/connect", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    access_token: token,
    frontend_callback: window.location.origin + "/settings/social",
  }),
}).then((response) => {
  // Handle redirect
  window.location.href = response.url;
});
```

#### OAuth Callback

Internal endpoint that handles the OAuth callback from Facebook. Not called directly by clients.

```http
GET /api/v1/social-media/oauth/callback
```

**Query Parameters (from Facebook):**

| Parameter         | Description                     |
| ----------------- | ------------------------------- |
| code              | Authorization code (on success) |
| error             | Error code (on failure)         |
| error_description | Error description               |

**Redirect Query Parameters (to frontend_callback):**

On success:
| Parameter | Description |
|----------|--------------------------------------------|
| success | `true` |
| pages | Number of Facebook Pages found |
| instagram| Number of Instagram accounts found |
| created | Number of new configurations created |

On error:
| Parameter | Description |
|----------|--------------------------------------------|
| error | Error type (e.g., `access_denied`, `meta_api_error`) |
| message | Human-readable error message |

#### Check OAuth Status

Check the current connection status and list connected accounts.

```http
GET /api/v1/social-media/oauth/status
Authorization: ******
X-Tenant-ID: <tenant_id>
```

**Response (200):**

```json
{
  "connected": true,
  "total_accounts": 3,
  "accounts_by_platform": {
    "facebook_page": [
      {
        "id": 1,
        "account_name": "My Business Page",
        "account_id": "123456789",
        "is_active": true,
        "last_verified_at": "2026-01-31T15:00:00.000000"
      }
    ],
    "instagram": [
      {
        "id": 2,
        "account_name": "mybusiness",
        "account_id": "17841400000000000",
        "is_active": true,
        "last_verified_at": "2026-01-31T15:00:00.000000"
      }
    ]
  },
  "expiring_soon": [],
  "oauth_url": "https://api.example.com/api/v1/social-media/oauth/connect"
}
```

#### Disconnect Account

Disconnect (remove) a social media account configuration.

```http
POST /api/v1/social-media/oauth/disconnect/<config_id>
Authorization: ******
X-Tenant-ID: <tenant_id>
```

**Response (200):**

```json
{
  "message": "Account disconnected successfully"
}
```

**Response (404):**

```json
{
  "error": "Configuration not found"
}
```

### Meta OAuth Helper Endpoints

These endpoints help with Meta (Facebook/Instagram) OAuth flow and account discovery.

#### Get Facebook Pages

Get Facebook Pages that the user can manage.

```http
POST /api/v1/social-media/meta/pages
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_access_token": "EAAxxxxxx..."
}
```

**Response (200):**

```json
{
  "pages": [
    {
      "id": "123456789",
      "name": "My Business Page",
      "category": "Blog",
      "picture": "https://graph.facebook.com/123456789/picture",
      "access_token": "EAAxxxx_page_token..."
    }
  ]
}
```

#### Get Instagram Business Accounts

Get Instagram Business accounts connected to user's Facebook Pages.

```http
POST /api/v1/social-media/meta/instagram-accounts
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_access_token": "EAAxxxxxx..."
}
```

**Response (200):**

```json
{
  "accounts": [
    {
      "id": "17841400000000000",
      "username": "mybusiness",
      "profile_picture_url": "https://...",
      "followers_count": 5000,
      "facebook_page_id": "123456789",
      "facebook_page_name": "My Business Page",
      "page_access_token": "EAAxxxx_page_token..."
    }
  ]
}
```

#### Exchange Short-Lived Token

Exchange a short-lived token for a long-lived access token.

```http
POST /api/v1/social-media/meta/exchange-token
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "short_lived_token": "EAAxxxxxx..."
}
```

**Response (200):**

```json
{
  "access_token": "EAAxxxx_long_lived...",
  "expires_at": "2026-04-01T00:00:00.000000"
}
```

### Environment Configuration

The following environment variables are required for Meta API integration:

| Variable          | Description                                    |
| ----------------- | ---------------------------------------------- |
| META_APP_ID       | Facebook/Meta App ID (can use FACEBOOK_APP_ID) |
| META_APP_SECRET   | Facebook/Meta App Secret                       |
| META_API_VERSION  | Graph API version (default: v18.0)             |
| META_OAUTH_SCOPES | OAuth scopes (comma-separated). See below.     |

**OAuth Scopes Configuration:**

The `META_OAUTH_SCOPES` variable controls which permissions are requested during OAuth.

Default value (works in Development mode for app admins/testers):

```
public_profile,pages_show_list,pages_manage_posts
```

Full scopes for production (requires Meta App Review):

```
public_profile,pages_show_list,pages_manage_posts,pages_read_engagement,instagram_content_publish,instagram_manage_insights,business_management
```

**Important Notes:**

- The `email` scope is not needed (user email is included with `public_profile`)
- The `instagram_basic` scope is deprecated - use `instagram_manage_insights` instead
- In Development mode, only app admins, developers, and testers can use advanced permissions
- For regular users, your app must pass [Meta App Review](https://developers.facebook.com/docs/app-review)
- If you see "Invalid Scopes" errors, verify you're using the correct scope names from the [Facebook Login Permissions documentation](https://developers.facebook.com/docs/facebook-login/permissions)

---

## Subscription Endpoints

PopArticle uses Paddle for subscription-based billing. Subscriptions are **user/owner-based**, meaning a single subscription applies across all tenants owned by that user. This approach reduces friction and aligns with modern SaaS pricing standards.

All subscription endpoints require `Authorization: Bearer <token>`. No `X-Tenant-ID` header is needed for subscription management.

### Get Subscription Status

```http
GET /api/v1/subscriptions/status
Authorization: Bearer <access_token>
```

Response (200):

```json
{
  "has_subscription": true,
  "subscription_id": 1,
  "paddle_subscription_id": "sub_xxx",
  "plan": "pro",
  "status": "active",
  "article_limit": 200,
  "articles_used": 45,
  "articles_remaining": 155,
  "billing_cycle": { "interval": "month", "frequency": 1 },
  "current_period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-02-01T00:00:00Z"
  },
  "pricing": {
    "amount": "49.00",
    "currency": "USD"
  },
  "billing_email": "billing@example.com",
  "canceled_at": null,
  "paused_at": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

Response when on free tier (no subscription):

```json
{
  "has_subscription": false,
  "plan": "free",
  "status": "active",
  "article_limit": 10,
  "articles_used": 0,
  "articles_remaining": 10,
  "message": "You are on the free plan"
}
```

### Get Available Plans

```http
GET /api/v1/subscriptions/plans
```

Response (200):

```json
{
  "plans": [
    {
      "name": "free",
      "display_name": "Free",
      "price": "0",
      "currency": "USD",
      "billing_cycle": null,
      "article_limit": 10,
      "features": [
        "Up to 10 articles per month",
        "Basic AI article generation",
        "Single user",
        "Community support"
      ]
    },
    {
      "name": "basic",
      "display_name": "Basic",
      "price": "19",
      "currency": "USD",
      "billing_cycle": "month",
      "article_limit": 50,
      "price_id": "pri_xxx",
      "features": [
        "Up to 50 articles per month",
        "Advanced AI article generation",
        "Up to 3 team members",
        "Email support",
        "SEO optimization"
      ]
    },
    {
      "name": "pro",
      "display_name": "Pro",
      "price": "49",
      "currency": "USD",
      "billing_cycle": "month",
      "article_limit": 200,
      "price_id": "pri_xxx",
      "features": [
        "Up to 200 articles per month",
        "Premium AI article generation",
        "Unlimited team members",
        "Priority support",
        "Advanced SEO & analytics",
        "Custom branding"
      ]
    },
    {
      "name": "enterprise",
      "display_name": "Enterprise",
      "price": "199",
      "currency": "USD",
      "billing_cycle": "month",
      "article_limit": 1000,
      "price_id": "pri_xxx",
      "features": [
        "Up to 1000 articles per month",
        "Enterprise AI article generation",
        "Unlimited team members",
        "Dedicated support",
        "White-label solution",
        "API access",
        "Custom integrations"
      ]
    }
  ],
  "is_paddle_configured": true
}
```

### Get Checkout Settings (for Frontend paddle.js)

Returns checkout settings for the frontend to use with `Paddle.Checkout.open()`.
This endpoint does NOT create a checkout URL - the frontend uses paddle.js with a client token to display the checkout overlay.

```http
POST /api/v1/subscriptions/checkout
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request Body:

```json
{
  "plan": "pro",
  "billing_email": "billing@example.com"  // Optional, defaults to user email
}
```

Response (200):

```json
{
  "checkout_settings": {
    "items": [{ "priceId": "pri_xxx", "quantity": 1 }],
    "customData": { "user_id": "123" },
    "customer": { "email": "user@example.com" },
    "settings": {
      "displayMode": "overlay",
      "theme": "light",
      "locale": "en",
      "allowLogout": true
    }
  },
  "plan": "pro",
  "price_id": "pri_xxx",
  "message": "Use these settings with Paddle.Checkout.open() on the frontend"
}
```

Frontend usage:
```javascript
// After fetching checkout settings
window.Paddle.Checkout.open({
  items: data.checkout_settings.items,
  customData: data.checkout_settings.customData,
  customer: data.checkout_settings.customer,
  settings: data.checkout_settings.settings
});
```

Error Response (409 - Already subscribed):

```json
{
  "error": "You already have an active subscription. Use upgrade endpoint to change plans.",
  "current_plan": "basic"
}
```

### Cancel Subscription

```http
POST /api/v1/subscriptions/cancel
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request Body:

```json
{
  "effective_from": "next_billing_period"
}
```

Response (200):

```json
{
  "message": "Subscription cancellation initiated",
  "effective_from": "next_billing_period",
  "plan_after_cancellation": "free"
}
```

### Upgrade / Downgrade Subscription

```http
POST /api/v1/subscriptions/upgrade
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request Body:

```json
{
  "plan": "enterprise",
  "proration": "prorated_immediately"
}
```

Response (200):

```json
{
  "message": "Subscription upgraded successfully",
  "old_plan": "pro",
  "new_plan": "enterprise",
  "new_article_limit": 1000
}
```

### Pause Subscription

```http
POST /api/v1/subscriptions/pause
Authorization: Bearer <access_token>
```

Response (200):

```json
{
  "message": "Subscription pause initiated",
  "status": "paused"
}
```

### Resume Subscription

```http
POST /api/v1/subscriptions/resume
Authorization: Bearer <access_token>
```

Response (200):

```json
{
  "message": "Subscription resumed",
  "status": "active"
}
```

### Get Subscription History

```http
GET /api/v1/subscriptions/history
Authorization: Bearer <access_token>
```

Response (200):

```json
{
  "subscription_id": 1,
  "events": [
    {
      "id": 1,
      "event_type": "subscription.created",
      "occurred_at": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "processed": true
    },
    {
      "id": 2,
      "event_type": "subscription.updated",
      "occurred_at": "2024-02-01T00:00:00Z",
      "created_at": "2024-02-01T00:00:00Z",
      "processed": true
    }
  ]
}
```

### Subscription Plans & Monthly Limits

| Plan       | Monthly Article Limit | Price/Month |
| ---------- | --------------------- | ----------- |
| Free       | 10                    | $0          |
| Basic      | 50                    | $19         |
| Pro        | 200                   | $49         |
| Enterprise | 1000                  | $199        |

---

## Paddle Webhooks

Webhook Endpoint (public, verifies signature):

```http
POST /api/v1/webhooks/paddle
Content-Type: application/json
```

Security:

- Paddle sends a `Paddle-Signature` header with format: `ts=timestamp;h1=signature`.
- Verify using the `PADDLE_WEBHOOK_SECRET` and the raw request body before processing.

Handled Events:

- `subscription.created` - New subscription started
- `subscription.updated` - Subscription plan or details changed
- `subscription.canceled` - Subscription was canceled
- `subscription.paused` - Subscription was paused
- `subscription.resumed` - Subscription was resumed
- `subscription.past_due` - Payment failed, subscription past due
- `transaction.completed` - Payment was successful

Notes:

- Include `user_id` in `custom_data` when creating checkout sessions to link Paddle subscriptions to users.
- Webhooks are used to create/update the local `subscriptions` record and adjust `monthly_article_limit` accordingly.
- Do not log sensitive payment information. Persist events to `subscription_events` for auditing and retries.

### Environment Variables

Configure these environment variables (see `PADDLE_INTEGRATION.md`):

- `PADDLE_API_KEY` - Paddle API key
- `PADDLE_WEBHOOK_SECRET` - Webhook verification secret
- `PADDLE_ENVIRONMENT` - `sandbox` or `production`
- `PADDLE_PRICE_ID_BASIC`, `PADDLE_PRICE_ID_PRO`, `PADDLE_PRICE_ID_ENTERPRISE` - Price IDs from Paddle

### Testing

- Use `PADDLE_ENVIRONMENT=sandbox` locally.
- Expose local server via `ngrok` for webhook testing.
- Sandbox test card numbers: success `4242 4242 4242 4242`, decline `4000 0000 0000 0002`.

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
