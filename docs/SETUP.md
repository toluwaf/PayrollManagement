# Setup and Installation Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [Initial Data Setup](#initial-data-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Minimum Version | Purpose | Download Link |
|----------|----------------|---------|---------------|
| **Node.js** | 16.x or higher | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 8.x or higher | Package manager | Included with Node.js |
| **Git** | 2.x or higher | Version control | [git-scm.com](https://git-scm.com/) |
| **ArangoDB** | 3.9.x or higher | Primary database | [arangodb.com](https://www.arangodb.com/) |
| **MSSQL Server** | 2019 or higher | Secondary database (optional) | [microsoft.com](https://www.microsoft.com/sql-server) |

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: Minimum 10GB free space
- **Network**: Internet connection for npm packages

### Recommended Tools

- **Code Editor**: VS Code with extensions:
  - ESLint
  - Prettier
  - JavaScript (ES6) code snippets
  - React snippets
- **API Testing**: Postman or Thunder Client
- **Database Client**: ArangoDB Web Interface (built-in) or Studio

---

## Environment Setup

### 1. Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/toluwaf/PayrollManagement.git

# Navigate to project directory
cd PayrollManagement

# Check directory structure
ls -la
# You should see: payroll-backend/ payroll-frontend/ README.md
```

### 2. Verify Node.js Installation

```bash
# Check Node.js version
node --version
# Should output: v16.x.x or higher

# Check npm version
npm --version
# Should output: 8.x.x or higher
```

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd payroll-backend
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - express (web framework)
# - arangojs (database driver)
# - bcryptjs (password hashing)
# - jsonwebtoken (authentication)
# - joi (validation)
# - And all other dependencies listed in package.json
```

Expected output:
```
added XXX packages in XXs
```

### 3. Create Environment Configuration

Create a `.env` file in the `payroll-backend` directory:

```bash
# Create .env file
touch .env
```

Open `.env` and add the following configuration:

```env
# Application Environment
NODE_ENV=development

# Server Configuration
PORT=4000

# ArangoDB Configuration (Primary Database)
datastoreDBName=Payroll
datastoreDBPort=8529
datastoreDBHost=localhost
datastoreDBUser=root
datastoreDBPassword=your_arangodb_password
datastoreSecure=false

# MSSQL Configuration (Secondary Database - Optional)
sqldatastoreDBName=HiveNAPIMSData
sqldatastoreDBPassword=your_mssql_password
sqldatastoreDBHost=localhost
sqldatastoreDBUser=sa

# Security Configuration
securityJWTSecret=your_super_secret_jwt_key_change_this_in_production
securityPWHashsalt=10
securityCipherSecret=your_cipher_secret_32_characters_long

# CORS Configuration
corsOrigin=http://localhost:3000

# Logging Configuration
loggerEnabled=true
loggerLevel=debug
loggerServerURL=http://localhost:5341
loggerServerAPIKey=your_logger_api_key
loggerServerAPIURL=http://localhost:8090/api

# Debug Options
debugSkipSignUpEmails=false
debugskipSignUpTexts=false
```

⚠️ **Important Security Notes**:
- Change `securityJWTSecret` to a long random string
- Never commit `.env` file to version control
- Use strong passwords for databases
- In production, use environment-specific values

### 4. Verify Backend Configuration

```bash
# Test if backend can start (will check database connection)
npm run dev
```

If successful, you should see:
```
🚀 Payroll System Server running on port 4000
📊 Database: localhost:8529/Payroll
```

Press `Ctrl+C` to stop the server.

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
# From project root
cd payroll-frontend

# Or from backend directory
cd ../payroll-frontend
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - react (UI framework)
# - react-router-dom (routing)
# - axios (HTTP client)
# - chart.js (charts)
# - tailwindcss (styling)
# - And all other dependencies
```

Expected output:
```
added XXX packages in XXs
```

### 3. Configure Frontend Environment (Optional)

The frontend uses `proxy` configuration in `package.json` to connect to backend.

Verify this line exists in `payroll-frontend/package.json`:
```json
{
  "proxy": "http://localhost:4000"
}
```

For production builds, you may need to create `.env` file:

```bash
# Create .env file (if needed for production)
touch .env
```

Add:
```env
REACT_APP_API_URL=http://localhost:4000/api
```

### 4. Verify Frontend Setup

```bash
# Start development server
npm start
```

This will:
1. Compile React application
2. Open browser at http://localhost:3000
3. Enable hot reloading for development

Press `Ctrl+C` to stop the server.

---

## Database Configuration

### ArangoDB Setup (Primary Database)

#### Option 1: Local Installation

**On macOS**:
```bash
brew install arangodb
brew services start arangodb
```

**On Ubuntu/Debian**:
```bash
curl -OL https://download.arangodb.com/arangodb39/DEBIAN/Release.key
sudo apt-key add - < Release.key
echo 'deb https://download.arangodb.com/arangodb39/DEBIAN/ /' | sudo tee /etc/apt/sources.list.d/arangodb.list
sudo apt-get update
sudo apt-get install arangodb3
```

**On Windows**:
Download installer from [arangodb.com/download](https://www.arangodb.com/download/)

#### Option 2: Docker Installation

```bash
# Pull ArangoDB image
docker pull arangodb/arangodb:latest

# Run ArangoDB container
docker run -e ARANGO_ROOT_PASSWORD=yourpassword -p 8529:8529 -d arangodb/arangodb:latest
```

#### Initial Database Setup

1. **Access ArangoDB Web Interface**:
   - Open browser: http://localhost:8529
   - Login with username: `root`
   - Password: The one you set during installation

2. **Create Payroll Database**:
   ```javascript
   // In ArangoDB web interface, go to "Databases" tab
   // Click "Add Database"
   // Name: Payroll
   // Click "Create"
   ```

3. **Create Collections**:
   ```javascript
   // In Payroll database, go to "Collections" tab
   // Create the following collections:
   
   - employees          (Document collection)
   - payrollRuns        (Document collection)
   - deductions         (Document collection)
   - positions          (Document collection)
   - departments        (Document collection)
   - jvPartners         (Document collection)
   - bankDisbursements  (Document collection)
   - users              (Document collection)
   - settings           (Document collection)
   ```

4. **Create Indexes** (for performance):
   ```javascript
   // For employees collection
   db.employees.ensureIndex({
     type: "persistent",
     fields: ["email"],
     unique: true
   })
   
   db.employees.ensureIndex({
     type: "persistent",
     fields: ["employeeId"],
     unique: true
   })
   
   db.employees.ensureIndex({
     type: "persistent",
     fields: ["status"]
   })
   
   // For payrollRuns collection
   db.payrollRuns.ensureIndex({
     type: "persistent",
     fields: ["period", "status"]
   })
   
   // For users collection
   db.users.ensureIndex({
     type: "persistent",
     fields: ["email"],
     unique: true
   })
   ```

### MSSQL Setup (Optional - Secondary Database)

If you're using MSSQL for integration with external systems:

**On Windows**:
1. Download SQL Server Express from Microsoft
2. Install with default settings
3. Note the server name (usually `localhost\SQLEXPRESS`)

**On macOS/Linux**:
```bash
# Use Docker
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourStrongPassword123' \
   -p 1433:1433 --name mssql \
   -d mcr.microsoft.com/mssql/server:2019-latest
```

---

## Running the Application

### Development Mode (Recommended)

**Option 1: Run Both Servers Separately**

Terminal 1 (Backend):
```bash
cd payroll-backend
npm run dev
# Server starts on http://localhost:4000
```

Terminal 2 (Frontend):
```bash
cd payroll-frontend
npm start
# Browser opens at http://localhost:3000
```

**Option 2: Using Concurrent (if configured)**

```bash
# From project root (if npm-run-all is installed)
npm run dev
# Starts both backend and frontend simultaneously
```

### Production Mode

**Backend**:
```bash
cd payroll-backend
npm start
# Runs with NODE_ENV=production
```

**Frontend** (build for production):
```bash
cd payroll-frontend
npm run build
# Creates optimized production build in 'build/' folder
# Serve with a static file server (nginx, Apache, etc.)
```

---

## Initial Data Setup

### 1. Create Admin User

Run the database population script:

```bash
cd payroll-backend
node populator.js
```

This will create:
- Default admin user
- Sample departments
- Sample positions
- Default system settings
- Tax bracket configurations

### 2. Default Admin Credentials

After running populator script:
- **Email**: admin@payroll.com
- **Password**: admin123

⚠️ **Change this password immediately after first login!**

### 3. Initial System Configuration

After logging in:

1. **Go to Settings Module**:
   - Configure tax brackets for current year
   - Set payroll cycle (monthly/bi-weekly/weekly)
   - Configure pension rates
   - Set company information

2. **Configure Deductions**:
   - Set up pension deduction rules
   - Configure loan deduction types
   - Add any other standard deductions

3. **Create Departments and Positions**:
   - Add your organization's departments
   - Create job positions with grade levels
   - Set salary ranges

### 4. Import Employees (Optional)

If you have existing employee data:

1. Go to HR Module → Bulk Import
2. Download the CSV template
3. Fill in employee data
4. Upload CSV file
5. Review and confirm import

---

## Verification Checklist

After setup, verify everything works:

- [ ] Backend server starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can login with admin credentials
- [ ] Dashboard displays without errors
- [ ] Can navigate to all modules (HR, Payroll, Finance, Compliance)
- [ ] Can create a test employee
- [ ] Can view employee list
- [ ] Database connection shows as "Connected" in health check

### Health Check Endpoint

Test backend health:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-12-29T10:00:00.000Z",
  "uptime": 120.5
}
```

---

## Troubleshooting

### Backend Won't Start

**Problem**: `Error: Cannot connect to database`

**Solutions**:
1. Verify ArangoDB is running:
   ```bash
   # Check if ArangoDB process is running
   ps aux | grep arango
   
   # Or check with curl
   curl http://localhost:8529
   ```

2. Check database credentials in `.env` file
3. Verify database name exists in ArangoDB
4. Check firewall settings

**Problem**: `Error: Port 4000 already in use`

**Solutions**:
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or change port in .env file
PORT=4001
```

### Frontend Won't Start

**Problem**: `npm ERR! code ELIFECYCLE`

**Solutions**:
1. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```

**Problem**: `Cannot connect to backend API`

**Solutions**:
1. Verify backend is running on port 4000
2. Check proxy configuration in package.json
3. Verify CORS settings in backend
4. Check browser console for specific errors

### Database Issues

**Problem**: `ArangoError: database not found`

**Solution**:
1. Create database manually in ArangoDB web interface
2. Or run this in ArangoDB shell:
   ```javascript
   db._createDatabase("Payroll");
   ```

**Problem**: `Collection not found`

**Solution**:
Run the initialization script or create collections manually (see Database Configuration section above)

### Authentication Issues

**Problem**: `Invalid token` or `Token expired`

**Solutions**:
1. Clear browser localStorage
2. Login again
3. Check JWT secret matches between .env and database
4. Verify system clock is correct

### Node.js Version Issues

**Problem**: `Error: The engine "node" is incompatible`

**Solution**:
```bash
# Check current version
node --version

# Use nvm to switch to correct version
nvm install 16
nvm use 16
```

---

## Development Environment Recommendations

### VS Code Extensions

Install these for better development experience:

```bash
# Extension IDs for quick install
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension formulahendry.auto-rename-tag
code --install-extension bradlc.vscode-tailwindcss
```

### VS Code Settings

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    "className={\"([^\"]*)\"}"
  ]
}
```

### Git Configuration

```bash
# Set up git hooks for code quality
cd PayrollManagement

# Create .gitignore if it doesn't exist
cat > .gitignore << EOF
# Dependencies
node_modules/
package-lock.json

# Environment files
.env
.env.local
.env.*.local

# Build outputs
/payroll-frontend/build
/payroll-backend/dist

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite
EOF
```

---

## Next Steps

After successful setup:

1. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** to understand system design
2. **Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** for API details
3. **Explore [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** for frontend structure
4. **Try running a test payroll** with sample employees
5. **Customize settings** for your organization
6. **Read [DEVELOPMENT.md](./DEVELOPMENT.md)** before making code changes

---

## Quick Reference Commands

```bash
# Backend
cd payroll-backend
npm install              # Install dependencies
npm run dev             # Development mode with nodemon
npm start               # Production mode
npm test                # Run tests

# Frontend
cd payroll-frontend
npm install             # Install dependencies
npm start               # Development server (port 3000)
npm run build           # Production build
npm test                # Run tests

# Database
# ArangoDB web interface: http://localhost:8529

# Health checks
curl http://localhost:4000/health           # Backend health
curl http://localhost:4000/api/test         # API test
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Need Help?** Check [MAINTENANCE.md](./MAINTENANCE.md) for troubleshooting guide
