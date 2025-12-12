# تخصيص Scroll Bar - دليل الاستخدام

## الأنماط المتاحة

تم إضافة أنماط scroll bar عصرية وجميلة تتكيف مع نظام الألوان الديناميكي في التطبيق.

### 1. الـ Scroll Bar الافتراضي

يتم تطبيقه تلقائياً على جميع العناصر في التطبيق:

- عرض 8px
- خلفية متدرجة باستخدام اللون الأساسي
- تأثيرات hover و active
- دعم الوضع المظلم

### 2. Custom Scrollbar

للحاويات التي تحتاج scroll bar مخصص:

```html
<div class="custom-scrollbar">
  <!-- المحتوى -->
</div>
```

### 3. Thin Scrollbar

للحاويات التي تحتاج scroll bar رفيع:

```html
<div class="thin-scrollbar">
  <!-- المحتوى -->
</div>
```

### 4. Animated Scrollbar

للحاويات التي تحتاج scroll bar متحرك:

```html
<div class="animated-scrollbar">
  <!-- المحتوى -->
</div>
```

### 5. Glass Scrollbar

للحاويات التي تحتاج تأثير الزجاج:

```html
<div class="glass-scrollbar">
  <!-- المحتوى -->
</div>
```

### 6. Neon Scrollbar

للحاويات التي تحتاج تأثير النيون:

```html
<div class="neon-scrollbar">
  <!-- المحتوى -->
</div>
```

## المميزات

- **تكيف مع الألوان**: يتغير لون الـ scroll bar تلقائياً مع تغيير اللون الأساسي
- **دعم الوضع المظلم**: تحسينات خاصة للوضع المظلم
- **تأثيرات تفاعلية**: hover و active effects
- **دعم Firefox**: أنماط مخصصة لمتصفح Firefox
- **انتقالات سلسة**: animations و transitions ناعمة
- **تصميم عصري**: استخدام gradients و shadows و blur effects

## المتغيرات المستخدمة

- `--main-color`: اللون الأساسي
- `--main-color-hover`: اللون عند hover
- `--main-color-dark`: اللون الداكن
- `--main-color-light`: اللون الفاتح

## التوافق

- ✅ Chrome/Edge (WebKit)
- ✅ Firefox
- ✅ Safari
- ✅ الوضع المظلم
- ✅ الألوان الديناميكية
