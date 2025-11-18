# Company ERP - User Management System

A secure, multi-tenant backend module for an ERP platform that manages users and roles within companies. Built with Express.js and MySQL.

## 🎯 Features

- **Multi-Tenant Architecture**: Complete company-level data isolation
- **Role-Based Access Control (RBAC)**: Fine-grained permissions per role
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **User Management**: Full CRUD operations with soft delete
- **Role Management**: Create, update, and delete roles with custom permissions
- **Audit Logging**: Track all create/update/delete actions
- **Security**: Rate limiting, token blacklisting, password hashing
- **RESTful API**: Clean, well-structured API endpoints

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis (optional, for caching and rate limiting)
- npm or yarn

## 🚀 Quick Start

**For the fastest setup, see [QUICK_START.md](QUICK_START.md)**

### Option 1: Automated Setup (Recommended for Local Development)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup database (automatically creates DB and tables)**
   ```bash
   npm run setup
   # Or with sample data:
   npm run setup:seed
   ```

4. **Create admin user** (if not using seed)
   ```bash
   npm run create-admin admin@example.com Admin@123 <company-uuid> "Admin User"
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

### Option 2: Using Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vendify-assignment
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MySQL database on port 3306
   - Redis on port 6379
   - Express.js application on port 3000

3. **Initialize database**
   ```bash
   docker exec -it vendify_mysql mysql -u vendify_user -pvendify_password vendify_erp < database/schema.sql
   ```

4. **Create admin user**
   ```bash
   docker exec -it vendify_app npm run create-admin admin@acme.com Admin@123 <company-uuid> "Acme Admin"
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@acme.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "abc123...",
    "user": {
      "id": 1,
      "email": "admin@acme.com",
      "name": "Acme Admin",
      "company_id": 1,
      "role_id": 1
    }
  }
}
```

#### 2. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "abc123..."
}
```

#### 3. Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "abc123..."
}
```

### User Management Endpoints

All user endpoints require authentication. Include the token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

#### 1. Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### 2. Get All Users (with pagination, search, sorting)
```http
GET /api/users?page=1&limit=10&search=john&sortBy=name&sortOrder=ASC
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name and email
- `sortBy`: Field to sort by (default: created_at)
- `sortOrder`: ASC or DESC (default: DESC)

#### 3. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### 4. Create User (Company Admin only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@acme.com",
  "password": "Password123",
  "name": "John Doe",
  "role_id": 2
}
```

#### 5. Update User (Company Admin only)
```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "role_id": 3
}
```

#### 6. Delete User - Soft Delete (Company Admin only)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Role Management Endpoints

#### 1. Get All Roles
```http
GET /api/roles
Authorization: Bearer <token>
```

#### 2. Get Role by ID
```http
GET /api/roles/:id
Authorization: Bearer <token>
```

#### 3. Create Role (Company Admin only)
```http
POST /api/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sales Manager",
  "permissions": {
    "can_create_user": false,
    "can_update_user": false,
    "can_delete_user": false,
    "can_view_users": true
  }
}
```

#### 4. Update Role (Company Admin only)
```http
PATCH /api/roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Senior Sales Manager",
  "permissions": {
    "can_create_user": true,
    "can_view_users": true
  }
}
```

#### 5. Delete Role (Company Admin only)
```http
DELETE /api/roles/:id
Authorization: Bearer <token>
```

### Audit Logs Endpoint

#### Get Audit Logs (Company Admin only)
```http
GET /api/audit-logs?user_id=1&action_type=CREATE&date_from=2024-01-01&date_to=2024-12-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `user_id`: Filter by user ID
- `action_type`: Filter by action (CREATE, UPDATE, DELETE, LOGIN)
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `page`: Page number
- `limit`: Items per page

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Refresh Tokens**: Token rotation with blacklisting
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Company Isolation**: All queries filtered by company_id

## 📁 Project Structure

```
vendify-assignment/
├── config/
│   ├── sequelize.js          # Sequelize database connection
│   └── redis.js              # Redis client
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management logic
│   ├── roleController.js     # Role management logic
│   └── auditLogController.js # Audit log logic
├── database/
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Seed data
├── middleware/
│   ├── auth.js               # JWT authentication
│   ├── multiTenant.js        # Company isolation
│   ├── rateLimiter.js        # Rate limiting
│   └── audit.js              # Audit logging
├── models/
│   ├── User.js               # User model
│   ├── Role.js               # Role model
│   ├── AuditLog.js           # Audit log model
│   └── RefreshToken.js       # Refresh token model
├── routes/
│   ├── auth.js               # Auth routes
│   ├── users.js              # User routes
│   ├── roles.js              # Role routes
│   └── auditLogs.js         # Audit log routes
├── services/
│   ├── authService.js        # Auth business logic
│   ├── userService.js        # User business logic
│   └── roleService.js        # Role business logic
├── scripts/
│   ├── setup.js              # Database setup and initialization
│   └── create-admin.js       # Admin user creation
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker configuration
├── Dockerfile               # Docker image definition
├── package.json             # Dependencies
├── server.js                # Application entry point
└── README.md                # This file
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options and copy it to `.env` before starting the app. Key variables you’ll typically need:

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | Port the Express server listens on | `3000` |
| `NODE_ENV` | Runtime mode toggling logs/config | `development` |
| `DB_HOST`, `DB_PORT` | MySQL host and port | `localhost`, `3306` |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Credentials for the Vendify ERP database | `vendify_erp`, `root`, `password` |
| `JWT_SECRET` | Secret used to sign access tokens | `super-secure-string` |
| `JWT_EXPIRES_IN` | Access token lifetime | `1h` |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection info for caching/rate limiting | `localhost`, `6379` |
| `RATE_LIMIT_MAX` (optional) | Override default API rate limit window cap | `100` |

### Database Setup

1. Create the database:
   ```sql
   CREATE DATABASE vendify_erp;
   ```

2. Run the schema:
   ```bash
   mysql -u root -p vendify_erp < database/schema.sql
   ```

3. (Optional) Seed initial data:
   ```bash
   mysql -u root -p vendify_erp < database/seed.sql
   ```

### Creating Initial Admin User

Use the script to create an admin user:
```bash
node scripts/create-admin.js <email> <password> <company_id> <name>
```

Example:
```bash
node scripts/create-admin.js admin@acme.com Admin@123 1 "Acme Admin"
```

## 📝 Notes

- **Company Admin Role**: Each company must have a "Company Admin" role with full permissions
- **Data Isolation**: All queries automatically filter by company_id
- **Soft Delete**: Users are soft-deleted (is_deleted = true) and can be restored
- **Permissions**: Roles include JSON permissions object for fine-grained access control
- **Audit Logging**: All create/update/delete actions are logged automatically

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check token expiration
- Ensure user is active (is_active = true)

### Permission Denied
- Verify user has required permissions in their role
- Check role permissions JSON structure

## 📄 License

ISC

## 👤 Author

Vendify Assignment