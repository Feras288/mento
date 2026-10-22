#!/bin/bash
set -e

echo "🚀 [ACSD] بدء سحب التحديثات وإعادة النشر على خادم Contabo..."

# سحب آخر التعديلات من الفرع الرئيسي
git pull origin main

# تثبيت الحزم إن وجدت تحديثات
pnpm install

# مزامنة ملفات الـ PDF والتخزين
mkdir -p storage/governance-documents manus-storage/governance-documents
cp -r uploads/governance-documents/* storage/governance-documents/ 2>/dev/null || true
cp -r uploads/governance-documents/* manus-storage/governance-documents/ 2>/dev/null || true

# بناء نسخة الإنتاج
pnpm build

# نشر مخرجات البناء إلى المجلد الرئيسي فوراً لخدمة CyberPanel المباشرة
if [ -d "dist/public" ]; then
  echo "📦 مزامنة حزمة الإنتاج إلى المجلد الرئيسي..."
  cp -r dist/public/* .
fi

# إعادة تشغيل التطبيق بسلاسة عبر PM2
pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs

# حفظ حالة PM2
pm2 save

# تحديث وقت .htaccess لإشعار خادم OpenLiteSpeed بإعادة قراءة القواعد
touch .htaccess 2>/dev/null || true
systemctl restart lsws 2>/dev/null || true

echo "✅ [ACSD] تم التحديث وإعادة النشر بنجاح!"
