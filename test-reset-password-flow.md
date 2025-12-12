# اختبار تدفق إعادة تعيين كلمة المرور

## الرابط المطلوب اختباره:

```
https://dashboard.elaseel.org/api/v1/user/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFib3NpZG8yQGdtYWlsLmNvbSIsImlhdCI6MTc1NzUyMjE3NSwiZXhwIjoxNzYwMTE0MTc1fQ.1RMFDN0AIdYX5_UgCPEX2qGr9mJWG1a04wF03gCAcMc
```

## التدفق المتوقع:

### 1. النقر على الرابط

- المستخدم ينقر على الرابط في البريد الإلكتروني
- الرابط يشير إلى: `/api/v1/user/reset-password?token=...`

### 2. معالجة API Route

- يتم استدعاء `GET /api/v1/user/reset-password`
- يتم استخراج الـ token من URL parameters
- يتم التحقق من وجود الـ token

### 3. التوجيه

- إذا كان الـ token موجود: يتم التوجيه إلى `/reset-password?token=...`
- إذا كان الـ token مفقود: يتم التوجيه إلى `/reset-password?error=missing_token`

### 4. صفحة إعادة تعيين كلمة المرور

- يتم استخراج الـ token من URL parameters
- يتم فك تشفير JWT token لعرض البريد الإلكتروني
- يتم عرض النموذج لإدخال كلمة المرور الجديدة

## معلومات الـ Token:

- **البريد الإلكتروني**: abosido2@gmail.com
- **تاريخ الإصدار**: 2025-09-10T16:36:15.000Z
- **تاريخ الانتهاء**: 2025-10-10T16:36:15.000Z
- **الحالة**: صالح (لم ينته بعد)

## الملفات المسؤولة:

- `app/api/v1/user/reset-password/route.ts` - معالجة التوجيه
- `app/reset-password/page.tsx` - صفحة إعادة تعيين كلمة المرور
- `lib/users.ts` - خدمة إعادة تعيين كلمة المرور

## النتيجة المتوقعة:

✅ التوجيه إلى صفحة reset-password بنجاح
✅ عرض البريد الإلكتروني المستخرج من الـ token
✅ إمكانية إدخال كلمة مرور جديدة
✅ إرسال الطلب إلى API الخارجي بنجاح
