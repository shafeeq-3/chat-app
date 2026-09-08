# 🚀 Vercel Deployment Guide - Backend + Frontend

## 📋 Overview

Aapko **2 separate Vercel projects** banana hoga:
1. **Backend** - Node.js API (server folder)
2. **Frontend** - React App (client folder)

---

## 🔧 Part 1: Backend Deployment

### Step 1: Backend Deploy Karo

1. **Vercel Dashboard** pe jao: https://vercel.com
2. **"Add New Project"** pe click karo
3. **Import** your GitHub repository: `chat-app`
4. **Configure:**
   - **Project Name:** `genz-chat-backend` (ya koi bhi naam)
   - **Framework Preset:** Other
   - **Root Directory:** `./` (root hi rakhna)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty

### Step 2: Environment Variables Add Karo

Vercel Dashboard → Settings → Environment Variables → Add:

```env
MONGODB_URI=mongodb+srv://Shafeeq:724@ac-7nqulzk-shard-00-00.3cohtbc.mongodb.net:27017,ac-7nqulzk-shard-00-01.3cohtbc.mongodb.net:27017,ac-7nqulzk-shard-00-02.3cohtbc.mongodb.net:27017/?ssl=true&replicaSet=atlas-ufmgdd-shard-0&authSource=admin&appName=Cluster0

JWT_SECRET=hello-world-secret-keyy

JWT_EXPIRES_IN=30d

NODE_ENV=production

PORT=3000

CLIENT_URL=https://YOUR_FRONTEND_URL.vercel.app

SOCKET_CORS_ORIGIN=*

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

**Note:** `CLIENT_URL` ko frontend deploy hone ke baad update karoge.

### Step 3: Deploy Karo

Click **"Deploy"** button!

Backend URL mil jayega jaise:
```
https://genz-chat-backend.vercel.app
```

**Is URL ko copy kar lo!** ✅

---

## 🎨 Part 2: Frontend Deployment

### Step 1: Frontend Code Update Karo

Pehle frontend code mein backend URL update karna hoga.

**Local machine pe ye command run karo:**

#### Windows PowerShell:
```powershell
cd D:\SocialMedia-app\client\src

# Search and replace all API URLs
Get-ChildItem -Recurse -Include *.jsx,*.js | ForEach-Object {
    (Get-Content $_.FullName) -replace 'http://localhost:3000', 'https://YOUR_BACKEND_URL.vercel.app' | Set-Content $_.FullName
}
```

**Ya manually files mein jao aur replace karo:**

Files to update:
- `client/src/Login-SignUp/Login.jsx`
- `client/src/Home-Page/HomePage.jsx`
- `client/src/Home-Page/components/Sidebar.jsx`
- `client/src/Chat-Page/chats.jsx`
- `client/src/Profile-Page/Profile.jsx`

Find: `http://localhost:3000`  
Replace: `https://YOUR_BACKEND_URL.vercel.app`

### Step 2: Changes Commit Karo

```bash
cd D:\SocialMedia-app
git add .
git commit -m "Update API URLs for production"
git push origin main
```

### Step 3: Frontend Deploy Karo

1. **Vercel Dashboard** pe wapis jao
2. **"Add New Project"** pe click karo
3. **Same repository** select karo: `chat-app`
4. **Configure:**
   - **Project Name:** `genz-chat-frontend` (ya koi bhi naam)
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 4: Environment Variables (Frontend)

Frontend ke liye bas ye add karo:

```env
VITE_API_URL=https://YOUR_BACKEND_URL.vercel.app
```

### Step 5: Deploy Karo

Click **"Deploy"** button!

Frontend URL mil jayega jaise:
```
https://genz-chat-frontend.vercel.app
```

---

## 🔄 Part 3: URLs Update Karo

### Backend mein Frontend URL Update Karo

1. **Backend project** → Settings → Environment Variables
2. **Update:**
   - `CLIENT_URL` = `https://YOUR_FRONTEND_URL.vercel.app`
   - `SOCKET_CORS_ORIGIN` = `https://YOUR_FRONTEND_URL.vercel.app`
3. **Redeploy:** Deployments tab → Latest deployment → "Redeploy"

---

## 🌱 Part 4: Database Seed Karo

**Local machine se seed karo:**

```bash
cd D:\SocialMedia-app
node server/seed.js
```

Ye 10 users aur sample data create karega!

---

## ✅ Part 5: Test Karo

1. Frontend URL kholo: `https://YOUR_FRONTEND_URL.vercel.app`
2. Login karo:
   - Email: `sarah.johnson@example.com`
   - Password: `Password123!`
3. Check karo:
   - ✅ Posts load ho rahe hain
   - ✅ Like/Comment kaam kar raha hai
   - ✅ Create post kaam kar raha hai

---

## ⚠️ Known Issues & Solutions

### Issue 1: CORS Error

**Solution:**
- Backend ke environment variables check karo
- `CLIENT_URL` aur `SOCKET_CORS_ORIGIN` correct hain
- Redeploy backend

### Issue 2: WebSocket Not Working

**Solution:**
Vercel serverless functions mein Socket.IO properly work nahi karta. 

**Options:**
1. Chat feature temporarily disable kar do
2. Ya backend ko Railway/Render par deploy karo (free)

### Issue 3: 404 Error

**Solution:**
- Backend: `vercel.json` routes check karo
- Frontend: Build command aur output directory check karo

### Issue 4: API Calls Failing

**Solution:**
- Browser console check karo
- Network tab mein dekho API URL correct hai
- Backend logs check karo Vercel dashboard mein

---

## 📝 Quick Reference

### Your URLs:

**Backend:**
```
https://chat-app-eight-black-26.vercel.app
```

**Frontend:**
```
https://YOUR_FRONTEND_URL.vercel.app
```

### Important Commands:

**Seed Database:**
```bash
node server/seed.js
```

**Update Code & Deploy:**
```bash
git add .
git commit -m "Updates"
git push origin main
```

Vercel automatically redeploy karega!

---

## 🎯 Environment Variables Checklist

### Backend (.env on Vercel):
- [x] MONGODB_URI
- [x] JWT_SECRET
- [x] JWT_EXPIRES_IN
- [x] NODE_ENV=production
- [x] CLIENT_URL (frontend URL)
- [x] SOCKET_CORS_ORIGIN (frontend URL)
- [ ] CLOUDINARY_CLOUD_NAME (optional)
- [ ] CLOUDINARY_API_KEY (optional)
- [ ] CLOUDINARY_API_SECRET (optional)

### Frontend (.env on Vercel):
- [ ] VITE_API_URL (backend URL)

---

## 🆘 Need Help?

**Backend URL verify karo:**
```
https://YOUR_BACKEND_URL.vercel.app/api/posts/
```

Ye 401 error dena chahiye (authentication required) - that's good!

**Frontend build locally test karo:**
```bash
cd client
npm run build
npm run preview
```

---

**Ab deploy karne ke liye taiyar ho! 🚀**

1. Backend deploy karo
2. Backend URL copy karo
3. Frontend code mein URLs update karo
4. Frontend deploy karo
5. Backend mein frontend URL update karo
6. Database seed karo
7. Test karo!
