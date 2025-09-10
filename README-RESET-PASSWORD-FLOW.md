# Reset Password Flow Documentation

## Overview
This document describes the reset password flow implementation for the AL-Aseel Dashboard.

## Email Link Format
The email sent to users contains a link in the following format:
```
https://dashboard.elaseel.org/api/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Flow Description

### 1. User Clicks Email Link
- User receives email with reset password link
- Link points to: `/api/reset-password?token=<JWT_TOKEN>`

### 2. API Route Processing (`/api/reset-password`)
- **GET Request**: Redirects user to reset-password page with token
- **POST Request**: Handles password reset API call to external service

### 3. Reset Password Page (`/reset-password`)
- Extracts token from URL parameters
- Decodes JWT token to display user email
- Provides form for new password input
- Validates password requirements
- Calls API to reset password

### 4. External API Call
- Endpoint: `https://api.elaseel.org/api/v1/user/reset-password?token=<JWT_TOKEN>`
- Method: POST
- Body: `{ "password": "new_password", "password_confirmation": "new_password" }`

## API Routes

### GET `/api/reset-password`
- **Purpose**: Redirect user to reset password page
- **Parameters**: `token` (JWT token from email)
- **Response**: Redirect to `/reset-password?token=<JWT_TOKEN>`
- **Error Handling**: Redirects with error parameter if token missing

### POST `/api/reset-password`
- **Purpose**: Process password reset request
- **Body**: 
  ```json
  {
    "token": "JWT_TOKEN",
    "password": "new_password",
    "password_confirmation": "new_password"
  }
  ```
- **Response**: Success/error message
- **External API**: Calls `https://api.elaseel.org/api/v1/user/reset-password`

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Error Handling
- Missing token: Shows "رابط غير صالح" message
- Invalid token: Shows appropriate error message
- API errors: Displays backend error messages
- Network errors: Shows generic error message

## Security Features
- JWT token validation
- Password confirmation matching
- Strong password requirements
- Secure API communication
- Error message sanitization

## Testing
To test the flow:
1. Use the provided JWT token in email link format
2. Navigate to: `https://dashboard.elaseel.org/api/reset-password?token=<TOKEN>`
3. Should redirect to reset-password page
4. Fill form and submit to test password reset
