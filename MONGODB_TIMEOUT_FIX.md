# MongoDB Connection Timeout Troubleshooting

## Error Message
```
Operation `users.findOne()` buffering timed out after 10000ms
```

## What This Means
- MongoDB connection is timing out when trying to query the database
- The connection either failed to establish or is unstable
- Common on Vercel due to network/connection pool issues

## Quick Fix Checklist

### 1. ✅ Verify MONGO_URI in Vercel
Your Vercel environment variables **MUST** use MongoDB Atlas (cloud), NOT localhost:

**❌ WRONG (localhost - won't work on Vercel):**
```
MONGO_URI=mongodb://localhost:27017/Sefask
```

**✅ CORRECT (MongoDB Atlas):**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sefask?retryWrites=true&w=majority
```

### 2. ✅ MongoDB Atlas IP Whitelist
1. Go to https://www.mongodb.com/cloud/atlas
2. Select your cluster → Network Access
3. Add IP Address:
   - Click "Add IP Address"
   - Enter `0.0.0.0/0` (allow all - for development)
   - OR add Vercel's IP ranges: `76.223.92.0/22`, `108.160.192.0/19`, etc.

### 3. ✅ Update Vercel Environment Variables

In your Vercel Dashboard:
1. Go to Project → Settings → Environment Variables
2. Update `MONGO_URI` to use **MongoDB Atlas connection string**
3. Ensure the string includes query parameters: `?retryWrites=true&w=majority`
4. Redeploy after changing

### 4. ✅ Test Connection String Locally
Before deploying, test the exact connection string:

```bash
# Create a test file test-connection.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 5,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
}).then(() => {
    console.log('✓ Connected to MongoDB');
    process.exit(0);
}).catch(err => {
    console.error('✗ Connection failed:', err.message);
    process.exit(1);
});
```

Run with: `node test-connection.js`

## Connection String Format

### MongoDB Atlas (Cloud) - RECOMMENDED
```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority
```

**Where:**
- `username`: Database user created in Atlas
- `password`: User password (URL encoded if special chars)
- `cluster`: Your cluster name (e.g., `cluster0`)
- `database`: Database name (e.g., `sefask`)

### To Get Your Connection String:
1. Go to MongoDB Atlas → Cluster → Connect
2. Click "Connect with MongoDB Compass"
3. Copy the connection string
4. Replace `<password>` and `<username>`
5. Add database name at the end

## Important Connection Options
```javascript
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 5,           // Limit connections for serverless
    minPoolSize: 1,           // Minimum connections
    socketTimeoutMS: 45000,   // 45 second socket timeout
    serverSelectionTimeoutMS: 10000,  // 10 second server selection
    socketKeepAliveMS: 30000, // Keep alive
    retryWrites: true,        // Auto retry writes
    w: 'majority',            // Write concern
}
```

## Common Issues

### Issue 1: Special Characters in Password
If your MongoDB password has special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `:` → `%3A`
- `/` → `%2F`

**Example:**
```
Password: user@123#pass
Encoded: user%40123%23pass

Full URI: mongodb+srv://myuser:user%40123%23pass@cluster.mongodb.net/sefask
```

### Issue 2: IP Not Whitelisted
**Solution:** Add Vercel IPs to MongoDB Atlas
1. Cluster → Network Access
2. Add IP Address → Add Current IP
3. Or use `0.0.0.0/0` for testing (not recommended for production)

### Issue 3: Database/User Doesn't Exist
**Solution:** Create them in MongoDB Atlas
1. Cluster → Collections → Create Database
2. Database User → Add Database User
3. Give user appropriate permissions

### Issue 4: Connection Pool Exhausted
**Solution:** Your server.js now has connection pooling configured:
```javascript
maxPoolSize: 5,      // Max 5 connections
minPoolSize: 1,      // Min 1 connection
```

This is optimized for serverless environments.

## Testing Endpoints

### Health Check (No DB needed)
```bash
curl https://your-backend.vercel.app/api/health
```

Expected: `{"status": "Server is running"}`

### Signup (Uses DB)
```bash
curl -X POST https://your-backend.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## Debug Mode

To see detailed logs:
1. Vercel Dashboard → Project → Deployments
2. Click latest deployment → Logs
3. Look for:
   - "✓ MongoDB connected successfully" (good)
   - "✗ MongoDB connection error" (bad - check error message)

## Still Not Working?

1. **Check credentials** in MongoDB Atlas
2. **Verify IP whitelist** - can you ping the cluster from anywhere?
3. **Test locally first** with same connection string
4. **Check network** - is MongoDB Atlas up? (https://status.mongodb.com)
5. **Review logs** - Vercel dashboard shows actual error messages

## MongoDB Atlas Status
If everything looks right but still failing, check:
- https://status.mongodb.com (is MongoDB Atlas up?)
- MongoDB Atlas console for connection logs
- Check if cluster is paused

---

**Need Help?**
- MongoDB Docs: https://docs.mongodb.com/
- Vercel Docs: https://vercel.com/docs
- Check Vercel logs for the exact error message
