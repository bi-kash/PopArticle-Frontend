# Backend OAuth Configuration

Your backend OAuth is working but needs to redirect to the frontend instead of showing JSON.

## Current Behavior

Backend returns JSON at: `http://localhost:5000/api/v1/auth/oauth/google/callback`

## Required Change

Backend should redirect to: `http://localhost:3000/oauth/callback?access_token=...&refresh_token=...&user=...`

## Backend Configuration Needed

In your backend OAuth callback handler, instead of returning JSON:

```python
# Current (returning JSON):
return jsonify({
    "access_token": access_token,
    "refresh_token": refresh_token,
    "user": user_data,
    "message": "OAuth login successful",
    "token_type": "Bearer"
})

# Should redirect to frontend:
from urllib.parse import urlencode
import json

params = {
    'access_token': access_token,
    'refresh_token': refresh_token,
    'user': json.dumps(user_data)  # Serialize user object
}

frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
redirect_url = f"{frontend_url}/oauth/callback?{urlencode(params)}"

return redirect(redirect_url)
```

## Environment Variables to Add

Add to your backend `.env`:

```
FRONTEND_URL=http://localhost:3000
```

## Alternative: Using the Current Setup

If you want to keep the backend as-is, you can create a simple redirect page on the backend that forwards to the frontend. The frontend callback page I updated will attempt to extract tokens from the JSON body if it's displayed in the browser.

But the proper solution is to have the backend redirect with tokens in the URL query parameters.
