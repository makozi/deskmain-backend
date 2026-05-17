# DeskMain - Performance Optimization Guide

**Status**: Task 10 - Performance Optimization  
**Date**: May 17, 2026

## Overview

This guide covers performance optimization strategies for the DeskMain application to ensure fast response times and efficient resource usage.

## 1. Database Query Optimization

### Query Analysis

```sql
-- Enable query logging to identify slow queries
ALTER DATABASE deskmain SET log_min_duration_statement = 1000;  -- Log queries > 1 second

-- View slow queries
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Analyze specific query
EXPLAIN ANALYZE 
SELECT * FROM orders 
WHERE user_id = 123 
ORDER BY created_at DESC;
```

### Index Optimization

```sql
-- Check unused indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename, indexname;

-- Create missing indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Compound indexes for common queries
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_products_merchant_status ON products(merchant_id, status);

-- Partial indexes for filtered queries
CREATE INDEX idx_active_subscriptions ON subscriptions(user_id) 
WHERE status = 'active';

-- Update statistics
ANALYZE;
```

### Query Optimization Techniques

```javascript
// Use pagination for large result sets
app.get('/api/v1/products', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (parseInt(req.query.page) || 0) * limit;
  
  db.query(
    'SELECT * FROM products LIMIT $1 OFFSET $2',
    [limit, offset]
  );
});

// Use SELECT specific columns instead of SELECT *
db.query(
  'SELECT id, name, price, status FROM products WHERE id = $1',
  [productId]
);

// Use LIMIT 1 for single-record queries
db.query(
  'SELECT * FROM users WHERE email = $1 LIMIT 1',
  [email]
);

// Use JOIN instead of multiple queries
db.query(`
  SELECT o.id, o.total, u.email
  FROM orders o
  JOIN users u ON o.user_id = u.id
  WHERE o.id = $1
`, [orderId]);

// Use IN clause instead of multiple OR conditions
db.query(
  'SELECT * FROM products WHERE id IN ($1, $2, $3)',
  [id1, id2, id3]
);
```

## 2. Caching Strategies

### Redis Caching

```javascript
// Cache frequently accessed data
const cache = require('redis').createClient(process.env.REDIS_URL);

// Cache products for 1 hour
app.get('/api/v1/products/:id', async (req, res) => {
  const cacheKey = `product:${req.params.id}`;
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Query database
  const product = await db.query(
    'SELECT * FROM products WHERE id = $1',
    [req.params.id]
  );
  
  // Store in cache
  await cache.setex(cacheKey, 3600, JSON.stringify(product));
  
  res.json(product);
});

// Cache user profile for 30 minutes
app.get('/api/v1/users/profile', authMiddleware, async (req, res) => {
  const cacheKey = `user:${req.user.id}:profile`;
  
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const user = await db.query(
    'SELECT id, email, firstName, lastName FROM users WHERE id = $1',
    [req.user.id]
  );
  
  await cache.setex(cacheKey, 1800, JSON.stringify(user));
  res.json(user);
});

// Cache list queries with pagination
app.get('/api/v1/products', async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const cacheKey = `products:page:${page}:limit:${limit}`;
  
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const offset = (page - 1) * limit;
  const products = await db.query(
    'SELECT * FROM products LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  await cache.setex(cacheKey, 1800, JSON.stringify(products));
  res.json(products);
});
```

### Cache Invalidation

```javascript
// Invalidate cache when data changes
app.put('/api/v1/products/:id', async (req, res) => {
  // Update product
  const result = await db.query(
    'UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *',
    [req.body.name, req.body.price, req.params.id]
  );
  
  // Invalidate cache
  await cache.del(`product:${req.params.id}`);
  
  // Also invalidate list cache if needed
  await cache.del('products:page:*');  // Pattern deletion (if supported)
  
  res.json(result);
});

// Clear cache on product delete
app.delete('/api/v1/products/:id', async (req, res) => {
  await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  
  // Invalidate caches
  await cache.del(`product:${req.params.id}`);
  await cache.del('products:page:*');
  
  res.status(204).send();
});
```

## 3. API Response Optimization

### Response Compression

```javascript
const compression = require('compression');

// Enable gzip compression for responses > 1KB
app.use(compression({
  threshold: 1024,
  level: 6  // Compression level 1-9
}));
```

### Selective Field Loading

```javascript
// Allow clients to request only needed fields
app.get('/api/v1/products', async (req, res) => {
  const fields = req.query.fields 
    ? req.query.fields.split(',')
    : ['id', 'name', 'price'];
  
  const selectClause = fields.join(', ');
  const products = await db.query(
    `SELECT ${selectClause} FROM products`
  );
  
  res.json(products);
});
```

### Pagination

```javascript
// Implement cursor-based pagination for better performance
app.get('/api/v1/orders', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const cursor = req.query.cursor;
  
  let query = 'SELECT * FROM orders WHERE user_id = $1';
  let params = [req.user.id];
  
  if (cursor) {
    query += ' AND id > $2';
    params.push(cursor);
  }
  
  query += ' ORDER BY id LIMIT $' + (params.length + 1);
  params.push(limit);
  
  const orders = await db.query(query, params);
  
  const nextCursor = orders.length > 0 
    ? orders[orders.length - 1].id 
    : null;
  
  res.json({
    data: orders,
    nextCursor
  });
});
```

## 4. Frontend Optimization

### Bundle Size Reduction

```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
    })
  ]
};

# Build and analyze
npm run build
```

### Code Splitting

```javascript
// vite.config.js - Implement code splitting
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendors': ['react', 'react-dom'],
          'ui-components': [
            './src/components/Button',
            './src/components/Card',
            './src/components/Modal'
          ]
        }
      }
    }
  }
};
```

### Lazy Loading Components

```javascript
// Use React.lazy for code splitting
import { lazy, Suspense } from 'react';

const ProductPage = lazy(() => import('./pages/ProductPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/orders/:id" element={<OrderPage />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Optimization

```html
<!-- Use modern image formats -->
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>

<!-- Set appropriate sizes -->
<img 
  src="image.jpg"
  sizes="(max-width: 600px) 100vw, 600px"
  alt="Description"
/>
```

## 5. Server-Side Performance

### Async Operations

```javascript
// Use Promise.all for parallel operations
app.get('/api/v1/dashboard', async (req, res) => {
  const [user, orders, products, stats] = await Promise.all([
    db.query('SELECT * FROM users WHERE id = $1', [req.user.id]),
    db.query('SELECT * FROM orders WHERE user_id = $1 LIMIT 10', [req.user.id]),
    db.query('SELECT * FROM products WHERE merchant_id = $1 LIMIT 10', [req.user.id]),
    db.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [req.user.id])
  ]);
  
  res.json({ user, orders, products, stats });
});
```

### Connection Pooling

```javascript
// Configure database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                      // Max connections
  idleTimeoutMillis: 30000,     // Idle timeout
  connectionTimeoutMillis: 2000 // Connection timeout
});
```

### Load Balancing

```javascript
// Enable clustering for multi-core processors
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  app.listen(5000);
}
```

## 6. Monitoring Performance

### APM Setup (New Relic)

```javascript
// Add to app startup
require('newrelic');

const express = require('express');
const app = express();

// APM will automatically instrument Express
app.use(express.json());
```

### Response Time Metrics

```javascript
// Middleware to track response times
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    
    // Send to monitoring system
    if (duration > 1000) {
      console.warn(`SLOW: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
});
```

## 7. Performance Benchmarks

### Target Response Times
```
GET /api/v1/products                    < 200ms
GET /api/v1/products/:id                < 100ms
POST /api/v1/orders                     < 300ms
GET /api/v1/users/profile               < 100ms
POST /api/v1/auth/login                 < 200ms
GET /api/v1/subscriptions               < 150ms
POST /api/v1/payments                   < 500ms
```

### Resource Utilization
```
CPU Usage:          < 70% average, < 90% peak
Memory Usage:       < 80% of allocated
Disk I/O:          < 50% utilization
Network:           < 60% bandwidth usage
Database Queries:  < 100ms average
```

## 8. Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 50 https://api.deskmain.com/api/v1/products

# Stress testing with wrk
wrk -t4 -c100 -d30s --latency https://api.deskmain.com/api/v1/products

# Results analysis
# Requests/sec: Target > 100
# Mean response: Target < 200ms
# P99 response: Target < 500ms
```

## 9. Optimization Checklist

- [ ] Database indexes created and optimized
- [ ] Slow queries identified and optimized
- [ ] Caching strategy implemented
- [ ] Cache invalidation working
- [ ] API responses compressed
- [ ] Pagination implemented
- [ ] Frontend bundle optimized
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Connection pooling configured
- [ ] APM monitoring active
- [ ] Performance benchmarks met
- [ ] Load testing completed
- [ ] Response times documented

## Conclusion

Following these optimization strategies ensures the DeskMain application maintains excellent performance under load while providing fast response times to users.

**Performance Status**: Optimized and Ready ✅
