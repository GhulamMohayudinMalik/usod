# USOD Deployment Guide (Backend First)

This guide explains how to deploy:

- **Backend** → AWS EC2 (Docker, t2.micro or larger)
- **Database** → MongoDB Atlas
- **Frontend** → Vercel

It also explains how to deploy **only a subfolder** (`backend/` or `frontend/`) from this mono-repo.

---

## 1. Repository Structure & Per-Folder Deployment

Your repo (simplified):

- `backend/` → Node.js/Express API
- `frontend/` → Next.js/React app
- other files...

### 1.1 Deploying Only `backend/` to EC2

There are two common approaches:

#### Option A: Clone Whole Repo on EC2 but Run Only `backend/`

1. **SSH into EC2**
   ```bash
   ssh ec2-user@YOUR_EC2_PUBLIC_IP
   ```

2. **Install Node & Git (if not using Docker-only)**
   ```bash
   # Amazon Linux 2 example
   sudo yum update -y
   sudo yum install -y git docker
   sudo service docker start
   sudo usermod -aG docker ec2-user
   # log out and back in for docker group
   ```

3. **Clone repo and move into backend folder**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/backend
   ```

4. **Create `.env` for production** (use MongoDB Atlas connection string)
   ```bash
   cp .env.production.example .env
   nano .env   # or your editor
   ```

5. **Install dependencies and run** (non-Docker):
   ```bash
   npm install
   NODE_ENV=production npm start
   ```

Only the **backend** code is run; frontend is present in the repo but unused on the server.

#### Option B: Build a Docker Image from `backend/` Only

1. **On your local machine** (or CI):
   ```bash
   cd backend
   docker build -t usod-backend .
   ```

2. **Push to a registry (e.g., ECR or Docker Hub)**

3. **On EC2**, just pull and run the image; you do **not** need the whole repo there.

---

### 1.2 Deploying Only `frontend/` to Vercel

Vercel works great with mono-repos.

1. Push your repo to GitHub/GitLab.
2. In Vercel:
   - **Import Project** from your repo.
   - Under **Project Settings → General → Root Directory**, set it to `frontend`.
   - Build command and output directory will be auto-detected (for Next.js).
3. Set environment variables for the frontend (e.g. `NEXT_PUBLIC_API_URL`).

Vercel will then build and deploy **only the `frontend/` folder**.

---

## 2. Backend Deployment on AWS EC2 (with MongoDB Atlas)

We will deploy **backend first**.

### 2.1 Prerequisites

- AWS account
- EC2 instance (t2.micro may work, but t3.small or higher is safer)
- MongoDB Atlas cluster
- Domain (optional, but recommended)

### 2.2 MongoDB Atlas Setup

1. Create a free/shared cluster at **MongoDB Atlas**.
2. Create a database user with username/password.
3. Under **Network Access**, allow your EC2 instance IP or `0.0.0.0/0` (for testing only).
4. Get the **connection string**, something like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/usod?retryWrites=true&w=majority
   ```

### 2.3 Where to Configure MongoDB in Backend

- File: `backend/src/config/database.js`
  ```js
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-database';
  ```

- For **production**, you should **not change the code**; instead, set `MONGODB_URI` in your `.env` on the server (from Atlas).

- Example production `.env` (on EC2, inside `backend/`):
  ```env
  NODE_ENV=production
  PORT=5000

  # From MongoDB Atlas
  MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/usod?retryWrites=true&w=majority

  # Security (GENERATE NEW VALUES)
  JWT_SECRET=<64-char-random-string>
  INGEST_API_KEY=<32-char-random-string>

  # Frontend URL (Vercel)
  FRONTEND_URL=https://your-frontend.vercel.app
  ```

### 2.4 EC2 Setup (Non-Docker, Simpler for Start)

1. **Launch EC2 Instance**
   - AMI: Amazon Linux 2 or Ubuntu LTS
   - Type: t2.micro (for testing) or t3.small (recommended)
   - Open port **5000** (or use Nginx to expose 80/443 → 5000)

2. **Install Node & Git** (example for Amazon Linux 2):
   ```bash
   sudo yum update -y
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install -y nodejs git
   ```

3. **Clone repo and install backend**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/backend
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.production.example .env
   nano .env   # paste your Atlas URI, JWT_SECRET, etc.
   ```

5. **Test locally on EC2**
   ```bash
   NODE_ENV=production npm run validate:env
   NODE_ENV=production npm start
   ```

6. **(Optional but recommended) Use PM2 to keep the app running**
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js --name usod-backend --env production
   pm2 startup
   pm2 save
   ```

Your backend should now be reachable on `http://EC2_PUBLIC_IP:5000`.

### 2.5 EC2 Setup with Docker (Alternative)

1. **Install docker & docker-compose** on EC2.
2. In `backend/`:
   ```bash
   docker-compose up -d
   ```

3. Ensure `.env` has your Atlas `MONGODB_URI` and other prod variables.

---

## 3. Frontend Deployment on Vercel (After Backend is Live)

1. **Backend API URL**
   - Once backend is live, note your API base URL, e.g.
     ```
     https://api.your-domain.com
     ```

2. **In `frontend/`**, set environment variable(s), for example:
   - `NEXT_PUBLIC_API_URL=https://api.your-domain.com`

3. **On Vercel:**
   - Import Git repo.
   - Set **root directory** to `frontend`.
   - Under **Settings → Environment Variables**, add:
     ```
     NEXT_PUBLIC_API_URL=https://api.your-domain.com
     ```
   - Deploy.

Frontend will call backend via `NEXT_PUBLIC_API_URL`.

---

## 4. Summary of What You Need to Change for Deployment

### Backend (EC2)

1. **Environment variables (critical):**
   - File: `.env` on EC2 inside `backend/`
   - Change:
     - `MONGODB_URI` → Atlas URI
     - `JWT_SECRET` → strong value
     - `INGEST_API_KEY` → strong value
     - `FRONTEND_URL` → your Vercel URL

2. **Optional CORS changes:**
   - File: `backend/src/server.js`
   - Ensure `ALLOWED_ORIGINS` in `.env` includes any extra domains if needed.

3. **No code change required for MongoDB URI** beyond using `MONGODB_URI`.

### Frontend (Vercel)

1. **Environment variables:**
   - On Vercel project: set `NEXT_PUBLIC_API_URL` to your backend URL.

2. **If you hardcoded any API URLs in code**, replace them with `process.env.NEXT_PUBLIC_API_URL` or equivalent.

---

## 5. Deploy Backend First – Minimal Checklist

1. Setup MongoDB Atlas and get `MONGODB_URI`.
2. Launch EC2 instance (t2.micro for testing, t3.small recommended).
3. SSH into EC2 and install Node + Git.
4. `git clone` your repo, `cd backend`, `npm install`.
5. Create `.env` in `backend/` with:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<Atlas URI>`
   - `JWT_SECRET`, `INGEST_API_KEY`
   - `FRONTEND_URL=<temporary, can still be localhost while frontend dev>`
6. Run:
   ```bash
   NODE_ENV=production npm run validate:env
   NODE_ENV=production npm start
   ```
7. Test: `curl http://EC2_PUBLIC_IP:5000/api/health`.

Once backend is stable and connected to Atlas, move on to configuring the frontend on Vercel.
