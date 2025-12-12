# Archive API Documentation

## Overview
API الأرشيف يوفر واجهة لإدارة العناصر المؤرشفة في النظام. يتيح للمستخدمين عرض العناصر المؤرشفة، البحث فيها، استرجاعها، أو حذفها نهائياً.

## Base URL
```
GET /archive
```

## Endpoints

### 1. Get Archived Items
**GET** `/archive`

جلب قائمة العناصر المؤرشفة مع إمكانية الفلترة والبحث والترتيب.

#### Query Parameters
- `page` (optional): رقم الصفحة (افتراضي: 1)
- `limit` (optional): عدد العناصر في الصفحة (افتراضي: 10)
- `search` (optional): نص البحث
- `type` (optional): نوع العنصر (مشروع، تقرير، أخبار، صور، مستخدم، شريك)
- `dateFrom` (optional): تاريخ البداية للفلترة
- `dateTo` (optional): تاريخ النهاية للفلترة
- `sortBy` (optional): حقل الترتيب (archiveDate, originalDate, title, size)
- `sortOrder` (optional): اتجاه الترتيب (asc, desc)

#### Example Request
```bash
GET /archive?page=1&limit=20&type=مشروع&search=كفالة&sortBy=archiveDate&sortOrder=desc
```

#### Response
```json
{
  "status": "success",
  "message": "تم جلب العناصر المؤرشفة بنجاح",
  "data": {
    "items": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "title": "مشروع كفالة الأيتام 2023",
        "type": "مشروع",
        "originalType": "project",
        "description": "ملفات مشروع كفالة الأيتام المكتمل",
        "size": "15.2 MB",
        "originalDate": "2023-12-31T00:00:00.000Z",
        "archiveDate": "2024-01-10T00:00:00.000Z",
        "status": "مؤرشف",
        "originalId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "archivedBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "أحمد محمد",
          "email": "ahmed@example.com"
        },
        "metadata": {
          "category": "مشاريع خيرية",
          "tags": ["أيتام", "كفالة", "خيرية"],
          "author": "فريق المشاريع"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 2. Get Archive Statistics
**GET** `/archive/stats`

جلب إحصائيات الأرشيف (عدد العناصر حسب النوع).

#### Response
```json
{
  "status": "success",
  "message": "تم جلب الإحصائيات بنجاح",
  "data": {
    "totalItems": 45,
    "projects": 12,
    "reports": 8,
    "news": 15,
    "images": 6,
    "users": 2,
    "partners": 2
  }
}
```

### 3. Get Single Archived Item
**GET** `/archive/{id}`

جلب عنصر مؤرشف واحد بواسطة المعرف.

#### Response
```json
{
  "status": "success",
  "message": "تم جلب العنصر بنجاح",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "مشروع كفالة الأيتام 2023",
    "type": "مشروع",
    "originalType": "project",
    "description": "ملفات مشروع كفالة الأيتام المكتمل",
    "size": "15.2 MB",
    "originalDate": "2023-12-31T00:00:00.000Z",
    "archiveDate": "2024-01-10T00:00:00.000Z",
    "status": "مؤرشف",
    "originalId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "archivedBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "أحمد محمد",
      "email": "ahmed@example.com"
    },
    "metadata": {
      "category": "مشاريع خيرية",
      "tags": ["أيتام", "كفالة", "خيرية"],
      "author": "فريق المشاريع"
    }
  }
}
```

### 4. Restore Archived Item
**POST** `/archive/{id}/restore`

استرجاع عنصر مؤرشف إلى موقعه الأصلي.

#### Response
```json
{
  "status": "success",
  "message": "تم استرجاع العنصر بنجاح",
  "data": {
    "restoredItem": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "مشروع كفالة الأيتام 2023",
      "type": "مشروع"
    },
    "originalItem": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "title": "مشروع كفالة الأيتام 2023",
      "type": "project",
      "status": "active"
    }
  }
}
```

### 5. Delete Archived Item
**DELETE** `/archive/{id}`

حذف عنصر مؤرشف نهائياً.

#### Response
```json
{
  "status": "success",
  "message": "تم حذف العنصر نهائياً"
}
```

### 6. Bulk Restore Items
**POST** `/archive/bulk-restore`

استرجاع عدة عناصر مؤرشفة في عملية واحدة.

#### Request Body
```json
{
  "ids": ["64f8a1b2c3d4e5f6a7b8c9d0", "64f8a1b2c3d4e5f6a7b8c9d1"]
}
```

#### Response
```json
{
  "status": "success",
  "message": "تم استرجاع العناصر بنجاح",
  "data": {
    "restoredCount": 2
  }
}
```

### 7. Bulk Delete Items
**POST** `/archive/bulk-delete`

حذف عدة عناصر مؤرشفة نهائياً في عملية واحدة.

#### Request Body
```json
{
  "ids": ["64f8a1b2c3d4e5f6a7b8c9d0", "64f8a1b2c3d4e5f6a7b8c9d1"]
}
```

#### Response
```json
{
  "status": "success",
  "message": "تم حذف العناصر نهائياً",
  "data": {
    "deletedCount": 2
  }
}
```

## Data Types

### ArchivedItem
```typescript
interface ArchivedItem {
  _id: string;
  title: string;
  type: "مشروع" | "صور" | "تقرير" | "أخبار" | "مستخدم" | "شريك";
  originalType: string;
  description: string;
  size: string;
  originalDate: Date;
  archiveDate: Date;
  status: "مؤرشف";
  originalId: string;
  archivedBy: {
    _id: string;
    name: string;
    email: string;
  };
  metadata?: {
    category?: string;
    tags?: string[];
    author?: string;
    [key: string]: any;
  };
}
```

### ArchiveStats
```typescript
interface ArchiveStats {
  totalItems: number;
  projects: number;
  reports: number;
  news: number;
  images: number;
  users: number;
  partners: number;
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "بيانات غير صحيحة",
  "details": [
    {
      "field": "type",
      "message": "نوع العنصر مطلوب"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "غير مصرح",
  "details": {
    "message": "انتهت صلاحية الجلسة"
  }
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "العنصر غير موجود"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "خطأ في الخادم"
}
```

## Authentication
جميع الطلبات تتطلب مصادقة باستخدام Bearer Token في header:
```
Authorization: Bearer <token>
```

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## Notes
- عند استرجاع عنصر، يتم إزالته من الأرشيف وإعادته إلى موقعه الأصلي
- عند حذف عنصر نهائياً، لا يمكن استرجاعه
- العناصر المؤرشفة تحتفظ بجميع البيانات الأصلية بالإضافة إلى معلومات الأرشفة
- يمكن البحث في العنوان والوصف والكلمات المفتاحية
