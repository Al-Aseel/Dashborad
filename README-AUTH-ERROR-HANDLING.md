# Authentication Error Handling System

This document explains how the authentication error handling system works in the dashboard application.

## Overview

The system is designed to handle authentication failures consistently across the application and return a standardized error response format while automatically redirecting users to the login page.

## Standard Error Response Format

For any authentication failure (401 Unauthorized), the system returns this standardized response:

```json
{
  "status": "error",
  "message": "فشل في عملية تسجيل دخول",
  "details": {
    "message": "انتهت صلاحية الجلسة"
  }
}
```

## Implementation Components

### 1. Utility Functions

#### `createAuthErrorResponse()` in `lib/utils.ts`

```typescript
export function createAuthErrorResponse() {
  return {
    status: "error",
    message: "فشل في عملية تسجيل دخول",
    details: {
      message: "انتهت صلاحية الجلسة",
    },
  };
}
```

### 2. API Route Error Handling

All API routes now handle 401 errors and return the standard error response:

```typescript
// Example from app/api/activity/route.ts
import { createAuthErrorResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(backend, {
      headers: {
        Authorization: req.headers.get("authorization") || "",
      },
    });

    // Handle 401 authentication error
    if (res.status === 401) {
      return new Response(JSON.stringify(createAuthErrorResponse()), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (error) {
    // Handle any other errors
    return new Response(JSON.stringify(createAuthErrorResponse()), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
```

### 3. Client-Side Error Handling

#### Auth Hook (`hooks/use-auth.ts`)

The `handleAuthError` function clears authentication data and returns the standard error response:

```typescript
const handleAuthError = useCallback(() => {
  const errorResponse = {
    status: "error",
    message: "فشل في عملية تسجيل دخول",
    details: {
      message: "انتهت صلاحية الجلسة",
    },
  };

  // Clear authentication data
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userData");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("isAuthenticated");
    document.cookie =
      "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  } catch {}

  setUser(null);
  setIsAuthenticated(false);
  isInitialized.current = false;

  return errorResponse;
}, []);
```

#### Error Handler Component (`components/shared/error-handler.tsx`)

A reusable component for handling authentication errors:

```typescript
export function ErrorHandler({ error, onError }: ErrorHandlerProps) {
  const { handleAuthError } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (error?.response?.status === 401) {
      const errorResponse = handleAuthError();

      if (onError) {
        onError(errorResponse);
      }

      router.push("/login");
    }
  }, [error, handleAuthError, onError, router]);

  return null;
}
```

#### API Call Hook

A hook for making API calls with automatic authentication error handling:

```typescript
export function useApiCall() {
  const { handleAuthError } = useAuthContext();
  const router = useRouter();

  const callApi = async (apiFunction: () => Promise<any>) => {
    try {
      return await apiFunction();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const errorResponse = handleAuthError();
        router.push("/login");
        return errorResponse;
      }
      throw error;
    }
  };

  return { callApi };
}
```

## Usage Examples

### 1. Using the Error Handler Component

```typescript
import { ErrorHandler } from "@/components/shared/error-handler";

function MyComponent() {
  const [error, setError] = useState(null);

  const handleError = (errorResponse) => {
    console.log("Authentication failed:", errorResponse);
    // Handle the error response
  };

  return (
    <div>
      <ErrorHandler error={error} onError={handleError} />
      {/* Your component content */}
    </div>
  );
}
```

### 2. Using the API Call Hook

```typescript
import { useApiCall } from "@/components/shared/error-handler";

function MyComponent() {
  const { callApi } = useApiCall();

  const fetchData = async () => {
    const result = await callApi(async () => {
      return await fetch("/api/some-endpoint");
    });

    if (result.status === "error") {
      // Handle authentication error
      console.log("Auth error:", result);
    } else {
      // Handle successful response
      console.log("Success:", result);
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

### 3. Direct API Route Usage

When calling API routes directly, they will automatically return the standard error response for 401 errors:

```typescript
const response = await fetch("/api/activity");
const data = await response.json();

if (data.status === "error") {
  // Authentication failed
  console.log("Auth error:", data);
  // User will be automatically redirected to login
}
```

## Automatic Redirect Behavior

1. **Server-Side**: API routes return 401 status with the standard error response
2. **Client-Side**: The error handler automatically redirects to `/login`
3. **Middleware**: Protects routes and redirects unauthenticated users to login
4. **Auth Context**: Clears authentication data and updates state

## Middleware Protection

The `middleware.ts` file ensures that:

- Protected routes require authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users are redirected away from `/login`

## Error Response Flow

1. **API Request** → Backend returns 401
2. **API Route** → Returns standard error response
3. **Client** → Receives error response
4. **Error Handler** → Clears auth data and redirects to login
5. **User** → Lands on login page with cleared session

This system ensures consistent error handling across the entire application while providing a smooth user experience during authentication failures.
