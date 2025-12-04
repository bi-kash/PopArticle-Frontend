# PopArticle API - Postman Collection

This directory contains Postman collection and environment files for testing the PopArticle API with both JWT token and API key authentication methods.

## Files

- **PopArticle_API.postman_collection.json**: Complete API collection with 40+ requests organized into folders
- **PopArticle_Local.postman_environment.json**: Environment variables for local development (localhost:5000)

## Import Instructions

1. Open Postman
2. Click "Import" button (top left)
3. Drag and drop both JSON files or click "Upload Files"
4. Select both `PopArticle_API.postman_collection.json` and `PopArticle_Local.postman_environment.json`
5. Click "Import"
6. Select "PopArticle Local" environment from the environment dropdown (top right)

## Authentication Methods

The collection supports two authentication methods:

### 1. JWT Token Authentication (For Web/Mobile Apps)

**Best for**: User-facing applications, session-based access

**Setup**:

1. Go to **Authentication JWT** → **Register** (or **Login**)
2. Execute the request
3. The `jwt_token` and `refresh_token` are automatically saved to environment variables
4. All JWT-authenticated requests use the Bearer token automatically

**Token Lifecycle**:

- Access Token: 1 hour expiration
- Refresh Token: 30 days expiration
- Use **Refresh Access Token** when access token expires

**Endpoints**:

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Refresh: `POST /api/auth/refresh`
- Get Profile: `GET /api/auth/me`
- Logout: `POST /api/auth/logout`

### 2. API Key Authentication (For Programmatic Access)

**Best for**: Server-to-server, scripts, integrations, CLI tools

**Setup**:

1. First authenticate with JWT (register/login)
2. Go to **API Keys** → **Create API Key**
3. Execute the request
4. The `api_key` is automatically saved to environment variables
5. All API key requests use the X-API-Key header automatically

**API Key Features**:

- No expiration (valid until deleted)
- Track usage statistics per key
- Create multiple keys with custom names
- Revoke access by deleting key

**Endpoints**:

- Create Key: `POST /api/auth/api-keys` (requires JWT)
- List Keys: `GET /api/auth/api-keys` (requires JWT)
- Delete Key: `DELETE /api/auth/api-keys/{key_id}` (requires JWT)
- Statistics: `GET /api/auth/api-keys/stats` (requires JWT)

## Collection Structure

### System

- **Health Check**: Test API availability
- **System Info**: Get API version and status

### Authentication JWT

- Register, Login, Refresh Token, Get Profile, Logout

### OAuth

- Google Login/Callback, GitHub Login/Callback, LinkedIn Login/Callback

### API Keys

- Create, List, Delete, Statistics

### Articles (JWT)

- Generate, List, Get, Update, Delete, Publish, Search

### Articles (API Key)

- Generate, List, Get, Search

### Categories

- Create, List, Get, Update, Delete

## Testing Workflow

### First Time Setup

1. **Register a user**:

   - JWT folder → Register
   - Tokens saved automatically

2. **Create an API key**:

   - API Keys folder → Create API Key
   - Key saved automatically

3. **Test both auth methods**:
   - Use "Articles (JWT)" folder for web app simulation
   - Use "Articles (API Key)" folder for script/integration simulation

### Typical Usage

**For Web App Development**:

1. Login → Get JWT token
2. Use Articles/Categories endpoints with JWT
3. Refresh token when expired

**For Integration/Automation**:

1. Create API key once
2. Use API key for all requests (no expiration)
3. Monitor usage with Statistics endpoint

## Environment Variables

The collection uses these variables (automatically managed):

- `base_url`: API base URL (default: http://localhost:5000)
- `jwt_token`: JWT access token (auto-saved after login)
- `refresh_token`: JWT refresh token (auto-saved after login)
- `api_key`: API key (auto-saved after creation)
- `user_id`: Current user ID (auto-saved)
- `article_id`: Last created article ID (auto-saved)
- `category_id`: Last created category ID (auto-saved)

## Auto-Save Scripts

Most requests include test scripts that automatically save response data:

- Login/Register: Saves `jwt_token` and `refresh_token`
- Create API Key: Saves `api_key`
- Create Article: Saves `article_id`
- Create Category: Saves `category_id`

## OAuth Testing

OAuth endpoints require browser-based flow:

1. Copy the authorization URL from the request
2. Open in browser
3. Complete OAuth provider login
4. Copy the callback URL with code
5. Use code in callback request

**Note**: Update OAuth credentials in `.env` file before testing

## Troubleshooting

### "Unauthorized" errors

- JWT: Check if token is expired, use Refresh Token
- API Key: Verify key was created and saved to environment

### Missing environment variables

- Execute prerequisite requests first (Register → Login → Create API Key)
- Check environment is selected (top right dropdown)

### OAuth not working

- Verify OAuth credentials in `.env`
- Check redirect URIs match configuration
- Ensure Flask app is running on correct port

### 404 errors

- Verify Flask app is running: `python -m api.app`
- Check `base_url` in environment matches server

## Database Setup

Before first use, ensure database is initialized:

```bash
cd /Users/bikash/Desktop/DomainLancer/poparticle
python -m database.db_manager
```

## Running the API

```bash
cd /Users/bikash/Desktop/DomainLancer/poparticle
python -m api.app
```

API will be available at `http://localhost:5000`

## Additional Resources

- Full API Documentation: See `API_DOCUMENTATION.md` in project root
- Implementation Guide: See `FLASK_API_COMPLETE.md` in project root

## Quick Reference

| Folder             | Auth Method        | Use Case                |
| ------------------ | ------------------ | ----------------------- |
| System             | None               | Health checks           |
| Authentication JWT | None (creates JWT) | User registration/login |
| OAuth              | None (creates JWT) | Social login            |
| API Keys           | JWT required       | Key management          |
| Articles (JWT)     | JWT Bearer token   | Web/mobile apps         |
| Articles (API Key) | X-API-Key header   | Scripts/integrations    |
| Categories         | JWT Bearer token   | Content management      |

## Support

For issues or questions, refer to project documentation or create an issue in the repository.
