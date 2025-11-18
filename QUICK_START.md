# 🚀 Quick Start Guide

Get the project running on your local machine in 3 simple steps!

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update your database credentials
# At minimum, update:
# - DB_PASSWORD (if your MySQL has a password)
# - JWT_SECRET (use a strong random string)
```

## Step 3: Setup Database

```bash
# This will create the database and tables automatically
npm run setup

# Or with sample data:
npm run setup:seed
```

## Step 4: Create Admin User (Optional)

If you used `--seed`, you can skip this. Otherwise:

```bash
# First, get a company UUID from the database
# Then create admin:
npm run create-admin admin@example.com Admin@123 <company-uuid> "Admin User"
```

## Step 5: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will be available at `http://localhost:3000`

## 🎯 That's It!

Your API is now running. Test it:

```bash
# Health check
curl http://localhost:3000/health

# Login (if you created an admin)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

## 📚 Next Steps

- Read the full [README.md](README.md) for API documentation
- Review the API endpoints in the README

## ❓ Troubleshooting

### Database Connection Error
- Make sure MySQL is running
- Check your `.env` file credentials
- Run `npm run setup` again

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 3000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

