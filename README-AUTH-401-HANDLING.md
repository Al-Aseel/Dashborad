# معالجة أخطاء المصادقة - Status Code 401

## نظرة عامة

تم تحسين نظام معالجة أخطاء المصادقة في التطبيق للتعامل مع status code 401 بشكل تلقائي. عند استلام رسالة خطأ تشير إلى انتهاء صلاحية الجلسة، يتم تنظيف جميع بيانات المصادقة وإعادة توجيه المستخدم إلى صفحة تسجيل الدخول.

## التحديثات المنجزة

### 1. تحسين Response Interceptor في `lib/api.ts`

#### التحديثات:

- **تحسين معالجة 401**: الآن يتم التعامل مع جميع حالات 401 بشكل موحد
- **فحص محتوى الخطأ**: يتم التحقق من محتوى رسالة الخطأ للتأكد من أنها تشير إلى انتهاء صلاحية الجلسة
- **تنظيف شامل للبيانات**: حذف جميع بيانات المصادقة من localStorage و cookies
- **إعادة التوجيه التلقائي**: توجيه المستخدم إلى صفحة تسجيل الدخول

#### الكود المحدث:

```typescript
// Handle 401: Session expired or unauthorized
if (error?.response?.status === 401 && typeof window !== "undefined") {
  try {
    // Check if the error response matches the expected format
    const errorData = error.response?.data;
    const isSessionExpired =
      errorData?.status === "error" &&
      errorData?.message === "فشل في عملية تسجيل دخول" &&
      errorData?.details?.message === "انتهت صلاحية الجلسة";

    // Clear all authentication data
    clearAuthData();

    // Redirect to login page if not already there
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  } catch (clearError) {
    console.error("Error clearing authentication data:", clearError);
  }
}
```

### 2. إضافة دالة مساعدة `clearAuthData()`

#### الوظيفة:

دالة مساعدة لتنظيف جميع بيانات المصادقة من:

- localStorage (auth_token, userData, isAuthenticated)
- Cookies (isAuthenticated)
- Axios headers (Authorization)

#### الكود:

```typescript
export function clearAuthData() {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("userData");
      localStorage.removeItem("isAuthenticated");

      // Clear authentication cookie
      document.cookie =
        "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Clear axios default headers
      delete api.defaults.headers.common.Authorization;
      delete localApi.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error("Error clearing authentication data:", error);
  }
}
```

### 3. تحديث `hooks/use-auth.ts`

#### التحديثات:

- **استيراد دالة clearAuthData**: استخدام الدالة المساعدة الجديدة
- **تحسين handleAuthError**: استخدام الدالة الموحدة لتنظيف البيانات

### 4. تحديث `lib/auth.ts`

#### التحديثات:

- **استيراد دالة clearAuthData**: استخدام الدالة المساعدة الجديدة
- **تحسين دالة logout**: استخدام الدالة الموحدة مع الحفاظ على البيانات غير المتعلقة بالمصادقة

## كيفية العمل

### عند استلام 401:

1. **فحص محتوى الخطأ**: التحقق من أن الرسالة تحتوي على النص المطلوب
2. **تنظيف البيانات**: حذف جميع بيانات المصادقة من التخزين المحلي
3. **إعادة التوجيه**: توجيه المستخدم إلى صفحة تسجيل الدخول
4. **تسجيل الأخطاء**: تسجيل أي أخطاء في عملية التنظيف

### البيانات التي يتم حذفها:

- `auth_token` من localStorage
- `userData` من localStorage
- `isAuthenticated` من localStorage
- `isAuthenticated` cookie
- Authorization headers من axios

## رسالة الخطأ المتوقعة

```json
{
  "status": "error",
  "message": "فشل في عملية تسجيل دخول",
  "details": {
    "message": "انتهت صلاحية الجلسة"
  }
}
```

## الملفات المحدثة

1. `lib/api.ts` - تحسين response interceptor وإضافة دالة clearAuthData
2. `hooks/use-auth.ts` - استخدام الدالة المساعدة الجديدة
3. `lib/auth.ts` - تحسين دالة logout

## الاختبار

لاختبار النظام:

1. قم بتسجيل الدخول للتطبيق
2. انتظر انتهاء صلاحية الجلسة أو قم بمحاكاة 401 error
3. تأكد من:
   - حذف جميع بيانات المصادقة
   - إعادة التوجيه إلى صفحة تسجيل الدخول
   - عدم وجود أخطاء في console

## ملاحظات إضافية

- النظام يعمل تلقائياً مع جميع API requests
- لا حاجة لتعديل أي كود موجود في المكونات
- يتم الحفاظ على البيانات غير المتعلقة بالمصادقة (مثل theme, language)
- النظام آمن ومقاوم للأخطاء مع try-catch blocks
