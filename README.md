# MindGuard AI - Mental Health Monitoring

A mental health monitoring web application with distress risk prediction, daily wellness check-ins, standardized clinical assessments (PHQ-9, GAD-7, PCL-5), and a complete MongoDB + Express.js backend.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs
- **Database**: MongoDB (via Mongoose)

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local Community Server running on `mongodb://127.0.0.1:27017` or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI)

### 2. Environment Configuration
Create or modify your `.env` file in the project root:

```env
# MongoDB Connection URI (Local or Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/mindguard

# Backend Server Port
PORT=5000

# JWT Secret for Session Signing
JWT_SECRET=your-secure-jwt-secret
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
Run both the Express backend API and Vite frontend simultaneously:
```bash
npm run dev
```
- Frontend will be available at `http://localhost:5173`
- Backend API will run on `http://localhost:5000`

### 5. Other Available Scripts
- `npm run client` - Run only Vite frontend
- `npm run server` - Run only Express backend API server
- `npm run build` - Build production frontend bundle
- `npm run typecheck` - Run TypeScript compiler checks
- `npm run lint` - Run ESLint checks
