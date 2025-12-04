# PopArticle API - Quick Reference

## Base URL
```
http://localhost:5000
```

## Authentication Headers

### JWT Token
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### API Key
```
X-API-Key: YOUR_API_KEY
```

## Common Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Create new user account |
| POST | `/api/auth/login` | None | Login with email/password |
| POST | `/api/auth/refresh` | Refresh Token | Get new access token |
| GET | `/api/auth/me` | JWT | Get current user profile |
| POST | `/api/auth/logout` | JWT | Invalidate refresh token |

### API Keys

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/api-keys` | JWT | Create new API key |
| GET | `/api/auth/api-keys` | JWT | List all user's API keys |
| DELETE | `/api/auth/api-keys/{key_id}` | JWT | Delete API key |
| GET | `/api/auth/api-keys/stats` | JWT | Get usage statistics |

### Articles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/articles/generate` | JWT or API Key | Generate AI article |
| GET | `/api/articles` | JWT or API Key | List all articles |
| GET | `/api/articles/{id}` | JWT or API Key | Get article by ID |
| PUT | `/api/articles/{id}` | JWT | Update article |
| DELETE | `/api/articles/{id}` | JWT | Delete article |
| POST | `/api/articles/{id}/publish` | JWT | Publish article |
| GET | `/api/articles/search` | JWT or API Key | Search articles |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/categories` | JWT | Create category |
| GET | `/api/categories` | JWT | List categories |
| GET | `/api/categories/{id}` | JWT | Get category by ID |
| PUT | `/api/categories/{id}` | JWT | Update category |
| DELETE | `/api/categories/{id}` | JWT | Delete category |

## Request Examples

### Register User
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Create API Key
```json
POST /api/auth/api-keys
Authorization: Bearer YOUR_JWT_TOKEN
{
  "name": "Production Key"
}
```

### Generate Article
```json
POST /api/articles/generate
Authorization: Bearer YOUR_JWT_TOKEN
{
  "category_id": 1,
  "prompt": "Write about AI trends in 2024",
  "tone": "professional",
  "target_audience": "developers",
  "content_type": "article"
}
```

### List Articles
```
GET /api/articles?status=published&page=1&per_page=10
Authorization: Bearer YOUR_JWT_TOKEN
```

### Search Articles
```
GET /api/articles/search?q=artificial+intelligence&category_id=1
X-API-Key: YOUR_API_KEY
```

### Create Category
```json
POST /api/categories
Authorization: Bearer YOUR_JWT_TOKEN
{
  "name": "Technology",
  "slug": "technology",
  "description": "Tech-related articles"
}
```

## Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | No permission to access resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

## Common Response Structures

### Success Response
```json
{
  "message": "Success message",
  "data": {
    "id": 1,
    "created_at": "2024-01-01T12:00:00"
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error information"
}
```

### List Response
```json
{
  "articles": [...],
  "total": 50,
  "page": 1,
  "per_page": 10,
  "pages": 5
}
```

## Query Parameters

### Pagination
```
?page=1&per_page=20
```

### Filtering (Articles)
```
?status=published
?status=draft
?category_id=1
?start_date=2024-01-01
?end_date=2024-12-31
```

### Search
```
?q=search+term
```

### Sorting
```
?sort=created_at&order=desc
?sort=title&order=asc
```

## Article Status Values

- `draft`: Article is being edited
- `published`: Article is live
- `archived`: Article is archived

## Content Types

- `article`: Standard article
- `blog`: Blog post
- `tutorial`: Tutorial content
- `listicle`: List-based article

## Tone Options

- `professional`: Formal business tone
- `casual`: Conversational tone
- `technical`: Technical/expert tone
- `friendly`: Warm and approachable

## OAuth Providers

### Google
```
GET /api/auth/google
```

### GitHub
```
GET /api/auth/github
```

### LinkedIn
```
GET /api/auth/linkedin
```

## Token Expiration

- **Access Token**: 1 hour
- **Refresh Token**: 30 days
- **API Key**: No expiration (until deleted)

## Rate Limits

Currently no rate limits enforced. Monitor usage via:
```
GET /api/auth/api-keys/stats
```

## Testing Tips

1. **Use environment variables** in Postman for tokens/IDs
2. **Test JWT flow** before API key flow
3. **Create test data** with categories before articles
4. **Check response status** before examining body
5. **Save tokens** from login responses immediately

## Quick Start Checklist

- [ ] Import collection and environment
- [ ] Register new user
- [ ] Login to get JWT token
- [ ] Create API key
- [ ] Create test category
- [ ] Generate test article with JWT
- [ ] Test article operations with API key
- [ ] Verify auto-save of variables

## Environment Variables

```
base_url = http://localhost:5000
jwt_token = (auto-saved after login)
refresh_token = (auto-saved after login)
api_key = (auto-saved after creation)
user_id = (auto-saved)
article_id = (auto-saved)
category_id = (auto-saved)
```

## Useful Commands

### Start API Server
```bash
python -m api.app
```

### Initialize Database
```bash
python -m database.db_manager
```

### Check Flask Routes
```bash
python -c "from api.app import app; print(app.url_map)"
```

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check token in Authorization header |
| Token expired | Use Refresh Token endpoint |
| API Key invalid | Recreate API key with Create endpoint |
| 404 Not Found | Verify Flask app is running |
| OAuth failing | Check .env for client credentials |
| Variables not saving | Check test scripts in request |
| Database error | Run db_manager to initialize |

## Support Resources

- Full Documentation: `API_DOCUMENTATION.md`
- Implementation Guide: `FLASK_API_COMPLETE.md`
- Postman Guide: `.postman/README.md`
