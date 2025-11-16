# Kora Pay Credentials

## ✅ Your Kora Pay Live Credentials

### Public Key (Frontend - Safe to use in React)
```
pk_live_8WPWSgWgGAPBsabjQhPRKqpTW3BMb9eH5Ra6wHk7
```

**Usage:**
- Add to `.env` file: `REACT_APP_KORA_PUBLIC_KEY=pk_live_8WPWSgWgGAPBsabjQhPRKqpTW3BMb9eH5Ra6wHk7`
- Add to Vercel environment variables
- This is safe to expose in frontend code

---

### Secret Key (Backend Only - NEVER expose!)
```
⚠️ SECRET KEY STORED SECURELY - NOT IN REPOSITORY
Get from: Kora Pay Dashboard → Settings → API Keys
```

**⚠️ SECURITY WARNING:**
- **DO NOT** add to `.env` file with `REACT_APP_` prefix
- **DO NOT** add to Vercel frontend environment variables
- **ONLY** use in backend/server-side code
- Use for payment verification API calls
- Keep this secret secure!
- **Store in secure password manager or backend environment only**

---

### Encryption Key (Backend Only)
```
⚠️ ENCRYPTION KEY STORED SECURELY - NOT IN REPOSITORY
Get from: Kora Pay Dashboard → Settings → API Keys
```

**Usage:**
- Backend only
- Used for webhook verification
- Used for encrypting sensitive data
- **DO NOT** expose in frontend

---

## 📋 Setup Checklist

### ✅ Frontend Setup (.env file)
```env
REACT_APP_KORA_PUBLIC_KEY=pk_live_8WPWSgWgGAPBsabjQhPRKqpTW3BMb9eH5Ra6wHk7
```

### ✅ Vercel Environment Variables
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - **Name:** `REACT_APP_KORA_PUBLIC_KEY`
   - **Value:** `pk_live_8WPWSgWgGAPBsabjQhPRKqpTW3BMb9eH5Ra6wHk7`
   - **Environment:** Production, Preview, Development
5. **Redeploy** your application

### ⚠️ Backend Setup (Future - when you add backend)
If you create a backend API later:
- Store secret key in backend environment variables
- Store encryption key in backend environment variables
- Use secret key for payment verification
- Use encryption key for webhook verification

---

## 🔐 Security Best Practices

1. **Public Key:**
   - ✅ Safe for frontend
   - ✅ Can be in `.env` with `REACT_APP_` prefix
   - ✅ Can be in Vercel environment variables

2. **Secret Key:**
   - ❌ **NEVER** in frontend code
   - ❌ **NEVER** in `.env` with `REACT_APP_` prefix
   - ❌ **NEVER** in Vercel frontend environment
   - ✅ Only in backend/server environment

3. **Encryption Key:**
   - ❌ **NEVER** in frontend code
   - ✅ Only in backend/server environment

---

## 🧪 Testing

### Test Mode (if needed):
If you need to test, you can get test keys from Kora dashboard:
- Go to: https://dashboard.korapay.com/
- Settings → API Keys
- Use test keys for development
- Switch to live keys for production

### Current Setup:
You're using **LIVE keys**, so:
- ✅ All payments will be real transactions
- ✅ Money will be charged to customers
- ✅ Funds will be transferred to your account
- ⚠️ Test thoroughly before going live!

---

## 📞 Support

**Kora Pay:**
- Dashboard: https://dashboard.korapay.com/
- Support: support@korapay.com
- Documentation: https://developers.korapay.com/docs

---

**✅ Your Kora Pay credentials are ready! Add the public key to your `.env` file and Vercel, then you're good to go!**

