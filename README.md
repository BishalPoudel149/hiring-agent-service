# Hiring Agent Service (NestJS)

A robust backend service for the Hiring Agent, built with NestJS. This service handles job postings, application evaluations, resume parsing, and email communication.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Database Setup (Local)
**Option A: macOS (Homebrew)**
```bash
brew install postgresql
brew services start postgresql
createdb hiring_db
```

**Option B: Docker**
```bash
docker run --name hiring-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=hiring_db -p 5432:5432 -d postgres
```

### 4. Environment Setup
Create a `.env` file in the root directory. You can copy the structure below:

```env
# Database (Postgres)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hiring_db

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (Email Service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro

# Optional
RELEVANCE_WEBHOOK_URL=your_webhook_url
```

### 5. Running the App

**Development Mode:**
```bash
npm run start:dev
```

**Production Build:**
```bash
npm run build
npm run start
```

## 🛠 Features
- **Job Management**: Create and manage job postings.
- **Application Evaluation**: AI-driven evaluation of job applications.
- **Resume Parsing**: Extract insights from PDF resumes.
- **Email Notifications**: Automated email responses using SMTP.
- **MCP Integration**: Model Context Protocol tools for AI interactions.

## 📚 API Documentation
Once the application is running, you can access the Swagger API documentation at:
[http://localhost:3000/api/docs](http://localhost:3000/api/docs)
