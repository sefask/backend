# Sefask API Documentation

## Base URL
```
https://your-project.vercel.app/api
```

## Health Check
```http
GET /health
```

### Response
```json
{
  "status": "Server is running"
}
```

---

## Authentication Endpoints

### 1. Sign Up
```http
POST /auth/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully. Please check your email for the 6-digit verification code.",
  "user": {
    "id": "string",
    "email": "string",
    "isVerified": false
  }
}
```

---

### 2. Sign In
```http
POST /auth/signin
Content-Type: application/json
Cookie: authToken=<token>
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Signed in successfully!",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "isVerified": boolean
  }
}
```

---

### 3. Verify Email
```http
POST /auth/verify-email
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "string",
  "code": "string"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully! You can now sign in.",
  "user": {
    "id": "string",
    "email": "string",
    "isVerified": true
  }
}
```

---

### 4. Resend Verification Code
```http
POST /auth/resend-verification
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body (Authenticated):**
```json
{}
```

**Request Body (Unauthenticated):**
```json
{
  "email": "string"
}
```

**Response (200):**
```json
{
  "message": "Verification code sent successfully. Please check your email."
}
```

---

### 5. Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
Cookie: authToken=<token>
```

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "isVerified": boolean
  }
}
```

---

### 6. Sign Out
```http
POST /auth/signout
Cookie: authToken=<token>
```

**Response (200):**
```json
{
  "message": "Signed out successfully!"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "errors": [
    {
      "field": "auth",
      "message": "Not authenticated."
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "errors": [
    {
      "field": "server",
      "message": "Internal server error"
    }
  ]
}
```

---

## Authentication

### Cookie-Based Authentication
- Tokens are sent as `httpOnly` cookies named `authToken`
- Automatically sent with requests when `credentials: include` is set
- Valid for 3 days

### CORS Configuration
- Frontend URL must be set in `FRONTEND_URL` environment variable
- Credentials mode is enabled for cross-origin requests
- `sameSite` is set to `none` in production for cookie sharing

---

## Rate Limiting

No rate limiting currently implemented. Consider adding for production.

---

## Pagination

Currently no pagination implemented. Consider adding for list endpoints.

---

## Testing

Test the API using:
- **Postman**: Import the endpoints above
- **cURL**: See examples in DEPLOYMENT.md
- **Frontend**: The frontend application connects to these endpoints

