#!/bin/bash
set -e

echo "🚀 [ACSD] بدء سحب التحديثات وإعادة النشر على خادم Contabo..."

# سحب آخر التعديلات من الفرع الرئيسي
git pull origin main

# تثبيت الحزم إن وجدت تحديثات
pnpm install

# بناء نسخة الإنتاج
pnpm build

# إعادة تشغيل التطبيق بسلاسة عبر PM2
pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs

# حفظ حالة PM2
pm2 save

echo "✅ [ACSD] تم التحديث وإعادة النشر بنجاح!"
