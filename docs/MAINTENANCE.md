# Maintenance and Troubleshooting Guide

## Table of Contents
- [Common Issues](#common-issues)
- [Backend Troubleshooting](#backend-troubleshooting)
- [Frontend Troubleshooting](#frontend-troubleshooting)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Monitoring](#monitoring)
- [Backup and Recovery](#backup-and-recovery)
- [Regular Maintenance Tasks](#regular-maintenance-tasks)

---

## Common Issues

### Issue: "Cannot connect to database"

**Symptoms**:
- Backend fails to start
- Error: `ArangoError: database not found`
- Error: `Connection refused`

**Solutions**:

1. **Check if ArangoDB is running**:
   ```bash
   # Check process
   ps aux | grep arango
   
   # Check port
   lsof -i :8529
   
   # Or test connection
   curl http://localhost:8529
   ```

2. **Start ArangoDB if stopped**:
   ```bash
   # macOS
   brew services start arangodb
   
   # Linux (systemd)
   sudo systemctl start arangodb3
   
   # Docker
   docker start <container_name>
   ```

3. **Verify database credentials**:
   ```bash
   # Check .env file
   cat payroll-backend/.env | grep datastore
   
   # Should show:
   # datastoreDBHost=localhost
   # datastoreDBPort=8529
   # datastoreDBName=Payroll
   # datastoreDBUser=root
   # datastoreDBPassword=your_password
   ```

4. **Check if database exists**:
   - Open ArangoDB UI: http://localhost:8529
   - Login with credentials
   - Look for "Payroll" database
   - If missing, create it manually or run setup script

---

### Issue: "Port already in use"

**Symptoms**:
- Error: `EADDRINUSE: address already in use :::4000`
- Backend won't start

**Solutions**:

1. **Find process using port**:
   ```bash
   # On macOS/Linux
   lsof -i :4000
   
   # On Windows
   netstat -ano | findstr :4000
   ```

2. **Kill the process**:
   ```bash
   # Using PID from lsof output
   kill -9 <PID>
   
   # Or kill all node processes (careful!)
   killall node
   ```

3. **Change port in .env**:
   ```env
   PORT=4001
   ```

---

### Issue: "Module not found" errors

**Symptoms**:
- Error: `Cannot find module 'express'`
- Error: `Module not found: Can't resolve 'react'`

**Solutions**:

1. **Reinstall dependencies**:
   ```bash
   # Backend
   cd payroll-backend
   rm -rf node_modules package-lock.json
   npm install
   
   # Frontend
   cd payroll-frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear npm cache**:
   ```bash
   npm cache clean --force
   npm install
   ```

3. **Check Node.js version**:
   ```bash
   node --version  # Should be 16+
   npm --version   # Should be 8+
   ```

---

### Issue: "Invalid token" or "Token expired"

**Symptoms**:
- Redirected to login unexpectedly
- API calls return 401 Unauthorized
- Error: "Invalid token"

**Solutions**:

1. **Clear browser storage and login again**:
   ```javascript
   // In browser console:
   localStorage.clear()
   // Then refresh and login
   ```

2. **Check token in localStorage**:
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('token'))
   // Should show a JWT token string
   ```

3. **Verify JWT secret matches**:
   ```bash
   # Check backend .env
   cat payroll-backend/.env | grep JWT
   # Should show: securityJWTSecret=your_secret
   ```

4. **Check system clock**:
   - Ensure server time is correct
   - JWT tokens are time-sensitive

---

### Issue: Frontend shows blank page

**Symptoms**:
- Browser shows white/blank screen
- No errors in console
- React app doesn't load

**Solutions**:

1. **Check browser console for errors**:
   - Press F12 to open DevTools
   - Look at Console tab
   - Look for red error messages

2. **Check if backend is running**:
   ```bash
   curl http://localhost:4000/health
   # Should return: {"status":"OK"}
   ```

3. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

4. **Check React errors**:
   ```bash
   cd payroll-frontend
   npm start
   # Look for compilation errors in terminal
   ```

5. **Rebuild React app**:
   ```bash
   cd payroll-frontend
   rm -rf build node_modules
   npm install
   npm start
   ```

---

## Backend Troubleshooting

### Debug Mode

Enable detailed logging:

```javascript
// In payroll-backend/.env
NODE_ENV=development
loggerLevel=debug
```

Restart server to see detailed logs.

### Check API Endpoints

Test individual endpoints:

```bash
# Health check
curl http://localhost:4000/health

# Test endpoint (no auth required)
curl http://localhost:4000/api/test

# Get employees (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/employees
```

### Common Backend Errors

#### Error: "Validation failed"

**Cause**: Request data doesn't match expected schema

**Solution**:
- Check API documentation for required fields
- Ensure data types are correct (numbers, strings, etc.)
- Look at validation error details in response

#### Error: "Database query failed"

**Cause**: Invalid AQL query or missing data

**Solution**:
1. Check ArangoDB logs:
   ```bash
   # Location varies by OS
   # macOS: /usr/local/var/log/arangodb3/
   # Linux: /var/log/arangodb3/
   tail -f /path/to/arangodb.log
   ```

2. Test query in ArangoDB web interface

3. Check if collection exists

#### Error: "Too many requests"

**Cause**: Rate limiting triggered

**Solution**:
- Wait 15 minutes
- Or increase rate limit in `server.js`:
  ```javascript
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000  // Increase this number
  });
  ```

---

## Frontend Troubleshooting

### React Development Tools

Install React DevTools browser extension:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- Firefox: [React DevTools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Common Frontend Errors

#### Error: "Network Error" or "Failed to fetch"

**Cause**: Cannot connect to backend API

**Solutions**:
1. Check backend is running on port 4000
2. Verify proxy in `package.json`:
   ```json
   "proxy": "http://localhost:4000"
   ```
3. Check CORS settings in backend
4. Look at Network tab in DevTools for failed requests

#### Error: "Cannot read property of undefined"

**Cause**: Accessing data before it's loaded

**Solution**: Add loading checks:
```javascript
// Bad
const name = employee.name;

// Good
const name = employee?.name || 'N/A';

// Better with loading state
if (loading) return <div>Loading...</div>;
if (!employee) return <div>Employee not found</div>;
return <div>{employee.name}</div>;
```

#### Error: "Maximum update depth exceeded"

**Cause**: Infinite loop in useEffect or setState

**Solution**: Check useEffect dependencies:
```javascript
// Bad - infinite loop
useEffect(() => {
  setData(newData);
});

// Good - runs once
useEffect(() => {
  loadData();
}, []);

// Good - runs when id changes
useEffect(() => {
  loadData(id);
}, [id]);
```

---

## Database Issues

### ArangoDB Maintenance

#### Check Database Health

```bash
# Connect to ArangoDB
arangosh

# Check database
db._databases()

# Check collections
db._collections()

# Count documents in collection
db.employees.count()
```

#### Repair Database

If database is corrupted:

```bash
# Stop ArangoDB
sudo systemctl stop arangodb3

# Repair database
arangod --database.auto-upgrade true

# Start ArangoDB
sudo systemctl start arangodb3
```

#### Backup Database

```bash
# Using arangodump
arangodump --output-directory /path/to/backup \
  --server.database Payroll \
  --server.username root \
  --server.password your_password
```

#### Restore Database

```bash
# Using arangorestore
arangorestore --input-directory /path/to/backup \
  --server.database Payroll \
  --server.username root \
  --server.password your_password
```

### Database Performance

#### Slow Queries

1. **Check indexes**:
   ```javascript
   // In ArangoDB web interface
   db.employees.indexes()
   ```

2. **Add missing indexes**:
   ```javascript
   db.employees.ensureIndex({
     type: "persistent",
     fields: ["email"],
     unique: true
   })
   ```

3. **Analyze query**:
   ```javascript
   db._explain("FOR e IN employees FILTER e.status == 'active' RETURN e")
   ```

#### High Memory Usage

1. Check ArangoDB memory settings
2. Reduce cache size if needed
3. Archive old data

---

## Performance Issues

### Backend Performance

#### Slow API Responses

**Diagnosis**:
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:4000/api/employees
```

Create `curl-format.txt`:
```
time_total: %{time_total}s
time_connect: %{time_connect}s
```

**Solutions**:
1. Add database indexes
2. Implement caching (Redis)
3. Optimize AQL queries
4. Use pagination for large datasets

#### High CPU Usage

**Diagnosis**:
```bash
# Monitor Node.js process
top -p $(pgrep node)

# Or use pm2
pm2 monit
```

**Solutions**:
1. Profile code to find bottlenecks
2. Optimize heavy calculations
3. Move to background jobs (e.g., payroll processing)
4. Scale horizontally (multiple instances)

### Frontend Performance

#### Slow Page Load

**Diagnosis**:
- Open DevTools → Network tab
- Check file sizes and load times
- Use Lighthouse audit (DevTools → Lighthouse)

**Solutions**:
1. **Code splitting**:
   ```javascript
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   ```

2. **Optimize images**:
   - Compress images
   - Use appropriate formats (WebP)
   - Lazy load images

3. **Reduce bundle size**:
   ```bash
   npm run build
   # Check build/static/js/ for large files
   ```

#### Slow Re-renders

**Diagnosis**:
- React DevTools → Profiler
- Record interaction and check component render times

**Solutions**:
1. **Use React.memo**:
   ```javascript
   const MemoizedComponent = React.memo(ExpensiveComponent);
   ```

2. **Use useMemo/useCallback**:
   ```javascript
   const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
   const memoizedCallback = useCallback(() => doSomething(a), [a]);
   ```

---

## Monitoring

### Application Monitoring

#### Backend Logs

**Location**: Console output or log files

**Monitor**:
```bash
# Follow logs
tail -f /path/to/app.log

# Search for errors
grep -i error /path/to/app.log

# Count errors
grep -i error /path/to/app.log | wc -l
```

#### Health Checks

Set up periodic health checks:

```bash
# Cron job to check health every 5 minutes
*/5 * * * * curl -f http://localhost:4000/health || echo "Backend down!" | mail -s "Alert" admin@example.com
```

### Database Monitoring

#### ArangoDB Metrics

Access metrics at: http://localhost:8529/_admin/metrics

Key metrics to monitor:
- Database queries per second
- Document operations
- Memory usage
- Connection count

---

## Backup and Recovery

### Automated Backups

#### Daily Database Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/payroll/$DATE"

# Create backup
arangodump --output-directory "$BACKUP_DIR" \
  --server.database Payroll \
  --server.username root \
  --server.password "$ARANGO_PASSWORD"

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

# Delete backups older than 30 days
find /backups/payroll/ -name "*.tar.gz" -mtime +30 -delete
```

Schedule with cron:
```bash
# Daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Recovery Procedures

#### Restore from Backup

```bash
# Extract backup
tar -xzf backup_20241229.tar.gz

# Restore to database
arangorestore --input-directory backup_20241229/ \
  --server.database Payroll \
  --server.username root \
  --server.password your_password \
  --overwrite true
```

---

## Regular Maintenance Tasks

### Daily
- [ ] Check application logs for errors
- [ ] Verify database backups completed
- [ ] Monitor system resources (CPU, memory, disk)

### Weekly
- [ ] Review error logs for patterns
- [ ] Check API response times
- [ ] Verify payroll data integrity
- [ ] Test backup restoration

### Monthly
- [ ] Update dependencies (security patches)
- [ ] Archive old payroll data
- [ ] Review and optimize slow queries
- [ ] Check disk space and clean up logs

### Quarterly
- [ ] Update tax brackets for new fiscal year
- [ ] Review and update system documentation
- [ ] Performance audit and optimization
- [ ] Security audit

### Annually
- [ ] Update tax calculation rules
- [ ] Review and renew SSL certificates
- [ ] Major version updates (Node.js, React, etc.)
- [ ] Complete system backup and disaster recovery test

---

## Emergency Contacts

### System Issues
- **Database Admin**: [Contact info]
- **Backend Developer**: [Contact info]
- **Frontend Developer**: [Contact info]

### Business Issues
- **HR Manager**: [Contact info]
- **Finance Manager**: [Contact info]
- **IT Support**: [Contact info]

---

## Quick Reference Commands

```bash
# Backend
cd payroll-backend
npm run dev              # Start development server
npm start                # Start production server
npm test                 # Run tests

# Frontend
cd payroll-frontend
npm start                # Start development server
npm run build            # Production build
npm test                 # Run tests

# Database
arangosh                 # ArangoDB shell
arangodump              # Backup database
arangorestore           # Restore database

# Process Management
ps aux | grep node      # Find Node.js processes
lsof -i :4000          # Check port usage
kill -9 <PID>          # Kill process

# Logs
tail -f app.log        # Follow log file
grep -i error app.log  # Search for errors
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: DevOps & Support Team
