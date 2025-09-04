# دليل النشر - El7lm Application

## 🚀 إعدادات Coolify

### Build Command
```bash
npm run build
```

### Start Command
```bash
node server.js
```

### Environment Variables (Required)
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

### Health Check Settings
- **Path**: `/`
- **Host**: `localhost` or `0.0.0.0`
- **Port**: `3000`
- **Timeout**: `30s`
- **Interval**: `10s`

## 🔧 إعدادات Docker

### Dockerfile Features
- ✅ Multi-stage build for optimization
- ✅ Alpine Linux for smaller image size
- ✅ Proper user permissions (nextjs:nodejs)
- ✅ Standalone output for server mode
- ✅ No static export (prevents build errors)

### Build Process
1. **Dependencies Stage**: Install npm packages
2. **Builder Stage**: Build Next.js application
3. **Runner Stage**: Create production image

## 🛠️ Troubleshooting

### إذا فشل البناء
1. تأكد من أن `output: 'standalone'` موجود في `next.config.js`
2. تأكد من عدم وجود `next export` في أي مكان
3. تأكد من أن جميع المتغيرات البيئية مطلوبة موجودة

### إذا فشل التشغيل
1. تأكد من أن `server.js` موجود في `.next/standalone/`
2. تأكد من أن PORT و HOST صحيحين
3. تحقق من سجلات التطبيق

### للتحقق من البناء محلياً
```bash
npm run build:check
```

## 📋 Checklist قبل النشر

- [ ] `next.config.js` يحتوي على `output: 'standalone'`
- [ ] `package.json` لا يحتوي على `next export`
- [ ] جميع المتغيرات البيئية مطلوبة موجودة في Coolify
- [ ] Health check path مضبوط على `/`
- [ ] Start command مضبوط على `node server.js`

## 🔍 Debug Commands

### داخل الحاوية
```bash
# فحص محتويات المجلد
ls -la

# فحص وجود server.js
ls -la server.js

# فحص العمليات
ps aux

# اختبار الاتصال
curl http://localhost:3000
```

### فحص السجلات
```bash
# سجلات التطبيق
docker logs <container-name>

# سجلات البناء
docker logs <build-container-name>
```

## 📞 Support

إذا واجهت أي مشاكل، تحقق من:
1. سجلات البناء في Coolify
2. سجلات التطبيق في Coolify
3. إعدادات Health Check
4. المتغيرات البيئية 
