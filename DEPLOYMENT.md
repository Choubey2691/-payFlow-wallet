# PayFlow Digital Wallet - Deployment Guide

This guide will walk you through the process of deploying your MERN stack Digital Wallet application to production using **Render** (for the Node.js backend) and **Vercel** (for the Vite React frontend).

---

## 🏗️ 1. Preparing the Backend (Render)

### Prerequisites:
- Ensure your `server` code is pushed to a GitHub repository.
- Ensure your MongoDB database is running on a cloud provider like MongoDB Atlas (do not use a local `mongodb://localhost` URI for production).

### Steps:
1. Create an account on [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository.
4. If your backend is in a `server` folder (monorepo), set the **Root Directory** to `server`.
5. Configuration:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
6. Add your Environment Variables (`.env`) down below:
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/payment-app`
   - `JWT_SECRET`: `your_super_secret_production_key_here`
   - `PORT`: `5000` (Render will override this dynamically, but good to have)
7. Click **Create Web Service**. 

Once deployed, Render will give you a live URL (e.g., `https://payment-app-backend.onrender.com`). **Save this URL**.

---

## 🎨 2. Preparing the Frontend (Vercel)

### Prerequisites:
- Ensure your `client` code is pushed to a GitHub repository.

### Steps:
1. Go to your `client/src/api.js` file and dynamically configure the backend URL:
   ```javascript
   import axios from 'axios';

   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
   });
   
   // ... interceptors
   export default api;
   ```
2. Create an account on [Vercel.com](https://vercel.com).
3. Click **Add New** -> **Project**.
4. Import your GitHub repository.
5. If your frontend is inside a `client` folder, edit the **Root Directory** to point to `client`.
6. Set the Framework Preset to **Vite**.
7. In the **Environment Variables** section, add your deployed Render Backend URL:
   - Name: `VITE_API_URL`
   - Value: `https://payment-app-backend.onrender.com/api` *(replace with your actual render URL)*
8. Click **Deploy**.

Vercel will successfully build your React app and provide you a live URL!

---

## 🛡️ Production Security Checklist

Before launching, please verify:
- [ ] Ensure `console.log` statements containing sensitive data are removed.
- [ ] Your `JWT_SECRET` in Render is at least 32 random characters and completely different from local dev.
- [ ] In MongoDB Atlas, restrict Network Access (IP Access List) to only allow connections from everywhere (`0.0.0.0/0`) if using Render, or peer your VPC for maximum security.
- [ ] Consider wrapping your Mongoose connection logic to automatically reconnect if the database goes down.

Congratulations! Your full-stack wallet application is now live. 🎉
