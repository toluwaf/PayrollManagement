require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { initializeDB } = require('./helpers/databaseInit');
const SetupRequestVariables = require('./helpers/SetupRequestVariables');
const getConfig = require('./helpers/Setting')

// Import routes
const employeeRoutes = require('./routes/employeeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const positionRoutes = require('./routes/positionRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const authRoutes = require('./routes/authRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const deductionsRoutes = require('./routes/deductionsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const departmentRoutes = require('./routes/department');
const jvPartnerRoutes = require('./routes/jv-partners');
const jvRoute = require('./routes/jv');
const bankDisbursement = require('./routes/bank') 

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000 // Increased for payroll operations
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin:'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Setup request variables (your existing middleware)
SetupRequestVariables(app, getConfig);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await req.ctx.db.QueryFirst('RETURN "OK"');
    
    res.status(200).json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/deductions', deductionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/jv-partners', jvPartnerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/jv', jvRoute); 
app.use('/api/bank-disbursement', bankDisbursement);

app.use('/api/test', require('./routes/testRoutes'));
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // ArangoDB specific error handling
  if (error.message.includes('ArangoError')) {
    return res.status(400).json({
      success: false,
      message: 'Database error occurred',
      error: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database with your existing configuration
    await initializeDB();
    
    const config = await getConfig();
    const port = 4000;
    
    app.listen(port, () => {
      console.log(`🚀 Payroll System Server running on port ${port}`);
      console.log(`📊 Database: ${config.datastore.dbhost}:${config.datastore.dbport}/${config.datastore.dbname}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();