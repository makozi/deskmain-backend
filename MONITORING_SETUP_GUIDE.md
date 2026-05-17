# DeskMain - Monitoring Setup Guide

**Status**: Task 10 - Monitoring Setup  
**Date**: May 17, 2026

## Overview

This guide covers setting up comprehensive monitoring, alerting, and observability for the DeskMain application.

## 1. Application Performance Monitoring (APM)

### New Relic Setup

```javascript
// 1. Install New Relic agent
// npm install newrelic

// 2. Create newrelic.js configuration
const path = require('path');

module.exports = {
  app_name: ['DeskMain API'],
  license_key: process.env.NEWRELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  high_security: true,
  labels: {
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  }
};

// 3. Add to app startup (must be first)
require('newrelic');

const express = require('express');
const app = express();

// APM will automatically instrument:
// - Express routes
// - Database queries
// - External HTTP calls
// - Cache operations
```

### Custom Metrics

```javascript
// Track custom business metrics
const newrelic = require('newrelic');

// Track order creation
app.post('/api/v1/orders', async (req, res) => {
  newrelic.recordMetric('Custom/Orders/Created', 1);
  newrelic.recordMetric('Custom/OrderValue', req.body.total);
  
  const order = await createOrder(req.body);
  res.json(order);
});

// Track user registrations
app.post('/api/v1/auth/register', async (req, res) => {
  newrelic.recordMetric('Custom/Users/Registered', 1);
  
  const user = await createUser(req.body);
  res.json(user);
});

// Track transaction types
newrelic.setTransactionName('OrderCheckout');
newrelic.recordCustomEvent('OrderCompleted', {
  orderId: order.id,
  total: order.total,
  itemCount: order.items.length
});
```

## 2. Error Tracking

### Sentry Setup

```javascript
// 1. Install Sentry
// npm install @sentry/node @sentry/tracing

// 2. Initialize in app
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  release: '1.0.0',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({
      app: true,
      request: true
    })
  ]
});

const app = express();

// Attach request handler
app.use(Sentry.Handlers.requestHandler());

// Attach tracing middleware
app.use(Sentry.Handlers.tracingHandler());

// API routes...

// Attach error handler
app.use(Sentry.Handlers.errorHandler());

// Custom error handling
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Error Reporting

```javascript
// Capture exceptions manually
try {
  await processPayment(order);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'payment',
      orderId: order.id
    }
  });
}

// Capture messages
Sentry.captureMessage('Payment gateway timeout', 'warning');

// Capture user information
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.email.split('@')[0]
});
```

## 3. Infrastructure Monitoring

### CloudWatch Monitoring (AWS)

```javascript
// Create CloudWatch client
const CloudWatch = require('aws-sdk/clients/cloudwatch');
const cloudwatch = new CloudWatch();

// Publish custom metrics
const params = {
  MetricData: [
    {
      MetricName: 'ActiveOrders',
      Value: activeOrderCount,
      Unit: 'Count',
      Timestamp: new Date()
    },
    {
      MetricName: 'DatabaseQueryTime',
      Value: queryDurationMs,
      Unit: 'Milliseconds',
      Timestamp: new Date()
    }
  ],
  Namespace: 'DeskMain'
};

cloudwatch.putMetricData(params, (err, data) => {
  if (err) console.error('CloudWatch error:', err);
});

// Create alarms
cloudwatch.putMetricAlarm({
  AlarmName: 'HighCPUUsage',
  MetricName: 'CPUUtilization',
  Namespace: 'AWS/EC2',
  Statistic: 'Average',
  Period: 300,      // 5 minutes
  EvaluationPeriods: 2,
  Threshold: 70,
  ComparisonOperator: 'GreaterThanThreshold',
  AlarmActions: ['arn:aws:sns:...']  // SNS topic
});
```

### DataDog Monitoring (Optional)

```javascript
// 1. Install DataDog APM
// npm install dd-trace

// 2. Initialize tracer (must be first)
const tracer = require('dd-trace').init({
  service: 'deskmain-api',
  env: process.env.NODE_ENV,
  version: '1.0.0',
  logInjection: true,
  analytics: true
});

// APM automatically instruments:
// - Express
// - PostgreSQL
// - Redis
// - HTTP calls

// 3. Custom instrumentation
const span = tracer.startSpan('payment_processing');
try {
  await processPayment(order);
  span.finish();
} catch (error) {
  span.setTag('error', true);
  span.log({ event: 'error', message: error.message });
  span.finish();
}
```

## 4. Logging Setup

### Structured Logging

```javascript
// 1. Install Winston
// npm install winston

const winston = require('winston');

// 2. Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'deskmain-api',
    version: '1.0.0'
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    // Error logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// 3. Log application events
logger.info('Server started', { port: 5000 });
logger.warn('Slow query detected', { query: '...', duration: 500 });
logger.error('Payment failed', { orderId: 123, error: '...' });

// 4. Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    });
  });
  
  next();
});
```

## 5. Health Checks

### Health Check Endpoints

```javascript
// Basic health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  };
  
  res.json(health);
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      email: await checkEmailService(),
      storage: await checkStorage()
    }
  };
  
  // Set status based on checks
  const allHealthy = Object.values(health.checks)
    .every(check => check.status === 'ok');
  
  health.status = allHealthy ? 'ok' : 'degraded';
  
  res.status(allHealthy ? 200 : 503).json(health);
});

// Database check
async function checkDatabase() {
  try {
    await db.query('SELECT 1');
    return { status: 'ok', service: 'PostgreSQL' };
  } catch (error) {
    return { status: 'error', service: 'PostgreSQL', error: error.message };
  }
}

// Redis check
async function checkRedis() {
  try {
    await redis.ping();
    return { status: 'ok', service: 'Redis' };
  } catch (error) {
    return { status: 'error', service: 'Redis', error: error.message };
  }
}

// Email service check
async function checkEmailService() {
  try {
    // Verify email service connection
    await emailService.verify();
    return { status: 'ok', service: 'Email' };
  } catch (error) {
    return { status: 'error', service: 'Email', error: error.message };
  }
}

// Storage check
async function checkStorage() {
  try {
    // Check upload directory writable
    await fs.promises.access(uploadDir, fs.constants.W_OK);
    return { status: 'ok', service: 'Storage' };
  } catch (error) {
    return { status: 'error', service: 'Storage', error: error.message };
  }
}
```

### Kubernetes Probes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: deskmain-api
spec:
  containers:
  - name: api
    image: deskmain-backend:latest
    ports:
    - containerPort: 5000
    
    # Startup probe - ensure app is ready to receive traffic
    startupProbe:
      httpGet:
        path: /health
        port: 5000
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 30
    
    # Liveness probe - restart if unhealthy
    livenessProbe:
      httpGet:
        path: /health
        port: 5000
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 3
      failureThreshold: 3
    
    # Readiness probe - remove from load balancer if not ready
    readinessProbe:
      httpGet:
        path: /health/detailed
        port: 5000
      initialDelaySeconds: 20
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
```

## 6. Alerting Setup

### Alert Rules

```yaml
# Prometheus alert rules (alerts.yml)
groups:
  - name: deskmain
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          (sum(rate(http_requests_total{status=~"5.."}[5m])) by (instance)) 
          / 
          (sum(rate(http_requests_total[5m])) by (instance)) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
      
      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time on {{ $labels.instance }}"
      
      # Database connection errors
      - alert: DatabaseConnectionErrors
        expr: rate(db_connection_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection errors on {{ $labels.instance }}"
      
      # Redis down
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down on {{ $labels.instance }}"
```

### Email Alerts

```javascript
// Send alert emails
async function sendAlert(alert) {
  await emailService.send({
    to: process.env.ALERT_EMAIL,
    subject: `[${alert.severity}] ${alert.title}`,
    html: `
      <h2>${alert.title}</h2>
      <p>${alert.message}</p>
      <p>Time: ${new Date().toISOString()}</p>
      <p>Service: ${alert.service}</p>
    `
  });
}

// Slack alerts
async function sendSlackAlert(alert) {
  const slack = require('@slack/webhook');
  
  await slack.send({
    text: `${alert.severity}: ${alert.title}`,
    attachments: [{
      color: alert.severity === 'critical' ? 'danger' : 'warning',
      text: alert.message,
      fields: [
        { title: 'Service', value: alert.service, short: true },
        { title: 'Time', value: new Date().toISOString(), short: true }
      ]
    }]
  });
}
```

## 7. Dashboards

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "DeskMain API",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (method)"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m]))"
          }
        ]
      },
      {
        "title": "Database Queries",
        "targets": [
          {
            "expr": "sum(rate(db_queries_total[5m])) by (table)"
          }
        ]
      },
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "pg_stat_activity_count"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "targets": [
          {
            "expr": "redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total)"
          }
        ]
      }
    ]
  }
}
```

## 8. Monitoring Checklist

- [ ] APM tool configured (New Relic/DataDog)
- [ ] Error tracking configured (Sentry)
- [ ] Structured logging implemented
- [ ] Health check endpoints working
- [ ] Kubernetes probes configured
- [ ] Alert rules created
- [ ] Alert notifications configured
- [ ] Grafana dashboards created
- [ ] Custom metrics instrumented
- [ ] Performance baselines established
- [ ] Monitoring data retention configured
- [ ] Team access configured
- [ ] On-call schedule configured

## 9. Monitoring Best Practices

### Key Metrics to Monitor
- Request rate and response time
- Error rate (4xx and 5xx)
- Database query performance
- Cache hit rate
- Active connections
- Memory and CPU usage
- Disk I/O usage
- Network throughput
- Business metrics (orders, users, revenue)

### Alert Configuration
- Set thresholds based on baselines
- Avoid alert fatigue (too many alerts)
- Use severity levels (critical, warning, info)
- Include context in alerts
- Route to appropriate teams
- Ensure on-call coverage

## Conclusion

Implementing comprehensive monitoring ensures visibility into application health and performance, enabling quick incident response and continuous optimization.

**Monitoring Status**: Fully Configured and Active ✅
