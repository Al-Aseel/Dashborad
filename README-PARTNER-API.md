# Partner REST API Integration

## Overview
This document describes the frontend integration with the Partner REST API for managing partners in the dashboard system.

## Base URL
```
/api/v1/partner
```

## Authentication
- **Required**: Authorization header with Bearer token
- **Minimum Role**: subadmin

## Common Response Wrapper
All API responses follow this structure:
```json
{
  "status": "sucsess",
  "data": {},
  "message": "..."
}
```

## Partner Object Structure
```typescript
interface Partner {
  _id?: string;
  name_ar: string;        // Arabic name (min 3 chars)
  name_en?: string;       // English name (min 3 chars, optional)
  email: string;          // Unique, valid email
  type: "org" | "member" | "firm";
  website?: string;       // Valid URL (optional)
  status: "active" | "inactive";
  join_date: string;      // ISO date string
  logo?: PartnerLogo;     // Logo object
}

interface PartnerLogo {
  _id: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}
```

## API Endpoints

### 1. Create Partner
- **Method**: `POST`
- **Endpoint**: `/api/v1/partner`
- **Body**:
```json
{
  "name_ar": "شركة التقنية المتقدمة",
  "name_en": "Advanced Tech Company",
  "email": "contact@advancedtech.com",
  "type": "org",
  "website": "https://advancedtech.com",
  "status": "active",
  "join_date": "2024-01-15",
  "logo": "<fileId>"
}
```

**Notes**:
- `logo` is required and must be a valid uploaded image file ID
- `name_en` is optional but if provided, must be at least 3 characters
- Backend will make the logo permanent on success

**Success Response (201)**:
```json
{
  "status": "sucsess",
  "data": {
    "_id": "...",
    "name_ar": "شركة التقنية المتقدمة",
    "name_en": "Advanced Tech Company",
    "email": "contact@advancedtech.com",
    "type": "org",
    "website": "https://advancedtech.com",
    "status": "active",
    "join_date": "2024-01-15T00:00:00.000Z",
    "logo": "..."
  },
  "message": "تم إنشاء الشريك بنجاح"
}
```

### 2. Update Partner
- **Method**: `PUT`
- **Endpoint**: `/api/v1/partner/{id}`
- **Body**: Same as Create Partner (all fields optional except `_id`)

### 3. Delete Partner
- **Method**: `DELETE`
- **Endpoint**: `/api/v1/partner/{id}`

### 4. Get Partners
- **Method**: `GET`
- **Endpoint**: `/api/v1/partner`
- **Query Parameters**:
  - `search`: Search term for name/email
  - `status`: Filter by status (active/inactive)
  - `type`: Filter by type (org/member/firm)
  - `page`: Page number for pagination
  - `limit`: Items per page

### 5. Get Single Partner
- **Method**: `GET`
- **Endpoint**: `/api/v1/partner/{id}`

## Image Upload Endpoints

### Upload Image
- **Method**: `POST`
- **Endpoint**: `/api/v1/upload/image`
- **Body**: FormData with `image` field

### Delete Image
- **Method**: `DELETE`
- **Endpoint**: `/api/v1/upload/file/{fileId}`

## Frontend Integration

### Files Modified
1. **`lib/partners.ts`** - API functions and interfaces
2. **`lib/partner-images.ts`** - Image upload/delete functions
3. **`app/partners/page.tsx`** - Main partners page with API integration

### Key Features
- **Real-time API calls** instead of dummy data
- **Comprehensive validation** before API submission
- **Error handling** with detailed error messages
- **Loading states** for better UX
- **Image upload integration** with compression
- **Automatic data refresh** after operations

### Usage Example
```typescript
import { createPartner, validatePartnerData, transformFormDataToAPI } from "@/lib/partners";

// Validate form data
const validation = validatePartnerData(formData);
if (!validation.isValid) {
  // Handle validation errors
  return;
}

// Transform data for API
const apiData = transformFormDataToAPI(formData);

// Create partner
try {
  const response = await createPartner(apiData);
  if (response.status === "sucsess") {
    // Handle success
  }
} catch (error) {
  // Handle API errors
}
```

## Error Handling
The system handles various error scenarios:
- **Validation errors**: Client-side validation with Arabic error messages
- **API errors**: Parsing of `error.response.data.details` for detailed error messages
- **Network errors**: Timeout and connection error handling
- **Authentication errors**: Automatic redirect to login on 401

## Data Transformation
The system automatically transforms data between frontend and API formats:
- **Frontend**: Uses camelCase (e.g., `nameAr`, `joinDate`)
- **API**: Uses snake_case (e.g., `name_ar`, `join_date`)
- **Automatic mapping** between formats

## Status Mapping
- **Frontend Display**: "نشط" / "غير نشط"
- **API Values**: "active" / "inactive"
- **Automatic conversion** in both directions

## Type Mapping
- **Frontend Display**: "مؤسسة" / "شركة" / "فرد"
- **API Values**: "org" / "firm" / "member"
- **Automatic conversion** in both directions
