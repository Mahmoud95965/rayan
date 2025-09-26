# 🚨 حل سريع لخطأ Firebase

## المشكلة
```
GET http://localhost:5174/src/context/AuthContext.tsx?t=1758877184664 net::ERR_ABORTED 500 (Internal Server Error)
```

## السبب
Firebase غير مكون بشكل صحيح - تحتاج إلى إنشاء ملف `.env.local`

## ✅ الحل السريع

### 1. إنشاء ملف `.env.local`
في مجلد المشروع الرئيسي، أنشئ ملف جديد باسم `.env.local` وضع فيه:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDgTnOb1Wiu-964QaV2Q1oxLYgWLJkqFsQ
VITE_FIREBASE_AUTH_DOMAIN=zakerly0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zakerly0
VITE_FIREBASE_STORAGE_BUCKET=zakerly0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=718838819739
VITE_FIREBASE_APP_ID=1:718838819739:web:fb0c10967caeaee59d4f3e
```

### 2. إعادة تشغيل الخادم
```bash
# أوقف الخادم (Ctrl+C)
# ثم شغله مرة أخرى
npm run dev
```

### 3. تأكد من إعدادات Firebase Console
- اذهب إلى https://console.firebase.google.com
- اختر مشروع `zakerly0`
- في Authentication، تأكد من تفعيل Email/Password
- في Firestore Database، تأكد من إنشاء قاعدة البيانات

## 🔧 إذا استمر الخطأ

### تحقق من Console في المتصفح
1. افتح Developer Tools (F12)
2. اذهب إلى Console tab
3. ابحث عن رسائل خطأ Firebase

### رسائل الخطأ الشائعة وحلولها:

**"Firebase: Error (auth/configuration-not-found)"**
- تأكد من صحة VITE_FIREBASE_PROJECT_ID

**"Firebase: Error (auth/api-key-not-valid)"**
- تأكد من صحة VITE_FIREBASE_API_KEY

**"Firebase: Error (auth/invalid-api-key)"**
- تحقق من إعدادات API في Firebase Console

## 📝 ملاحظات مهمة

1. **ملف `.env.local` لن يظهر في Git** - هذا طبيعي للأمان
2. **أعد تشغيل الخادم** بعد تغيير متغيرات البيئة
3. **تأكد من اسم الملف** - يجب أن يكون `.env.local` بالضبط

---
🎯 **بعد هذه الخطوات، يجب أن يعمل المشروع بشكل طبيعي!**
