# Security Implementation Guide

## Overview

This document outlines the security measures implemented in the Gold Wallet MVP application.

## Backend Security

### 1. Authentication & Authorization

#### JWT (JSON Web Tokens)
- **Token Generation**: Uses NestJS `@nestjs/jwt` with HS256 algorithm
- **Token Expiration**: 1 hour (configurable in `auth.module.ts`)
- **Token Storage**: Client-side in localStorage (consider httpOnly cookies for production)
- **Token Validation**: Passport JWT strategy validates all protected routes

#### Password Security
- **Hashing Algorithm**: bcrypt with cost factor of 12
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number or special character
- **Password Confirmation**: Required on registration to prevent typos

### 2. Input Validation

#### Backend Validation (class-validator)
- **DTOs (Data Transfer Objects)**: All API inputs are validated using class-validator decorators
- **Email Validation**: Proper email format validation
- **String Sanitization**: Automatic trimming and lowercase conversion for emails
- **Whitelist**: Only allowed properties are accepted (`whitelist: true`)
- **Forbidden Properties**: Non-whitelisted properties are rejected (`forbidNonWhitelisted: true`)

**Register DTO:**
```typescript
@IsEmail({}, { message: 'Please provide a valid email address' })
@MinLength(8, { message: 'Password must be at least 8 characters long' })
@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  message: 'Password must contain uppercase, lowercase, and number/special char'
})
```

#### Frontend Validation
- **Client-side password strength indicator**: Real-time feedback on password requirements
- **Password confirmation**: Checked before submission
- **Email format validation**: HTML5 email input type
- **Error handling**: User-friendly error messages from backend validation

### 3. Rate Limiting

#### Global Rate Limiting (@nestjs/throttler)
- **Limit**: 10 requests per 60 seconds per IP address
- **Scope**: Applied globally to all endpoints
- **Protection**: Prevents brute-force attacks on login/register endpoints
- **Response**: Returns HTTP 429 (Too Many Requests) when limit exceeded

**Configuration (app.module.ts):**
```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,  // 60 seconds
  limit: 10,   // 10 requests
}])
```

### 4. Security Headers (Helmet)

Helmet middleware adds the following HTTP headers:

- **X-DNS-Prefetch-Control**: Controls browser DNS prefetching
- **X-Frame-Options**: Prevents clickjacking (DENY)
- **X-Content-Type-Options**: Prevents MIME-type sniffing (nosniff)
- **X-XSS-Protection**: Legacy XSS protection for older browsers
- **Strict-Transport-Security**: Forces HTTPS connections
- **Content-Security-Policy**: Mitigates XSS and injection attacks

### 5. CORS (Cross-Origin Resource Sharing)

**Current Configuration:**
```typescript
app.enableCors({ 
  origin: ['http://localhost:3001'],  // Whitelist frontend origin
  credentials: true,                   // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

**Production Recommendations:**
- Replace localhost with production domain
- Use environment variables for origin configuration
- Consider multiple origins for staging/prod

### 6. Database Security

#### Prisma ORM
- **Parameterized Queries**: Prisma automatically prevents SQL injection
- **Type Safety**: TypeScript ensures type-safe database operations
- **Connection Pooling**: Supabase pooler connection for better performance
- **Prepared Statements**: All queries use prepared statements

#### Sensitive Data
- **Password Hashing**: Never store plain-text passwords
- **Email Normalization**: Lowercase and trimmed before storage
- **UUID Primary Keys**: Non-sequential IDs prevent enumeration attacks

### 7. Error Handling

#### Secure Error Messages
- **Authentication Errors**: Generic "Invalid email or password" (prevents user enumeration)
- **Validation Errors**: Specific messages for user guidance but no sensitive data
- **Production Mode**: Stack traces hidden in production
- **Logging**: Errors logged server-side for debugging

### 8. Environment Variables

**Required Environment Variables (.env):**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-strong-secret-here"
PORT=3002
```

**Best Practices:**
- Never commit `.env` files to version control
- Use strong, randomly generated JWT secrets (min 32 characters)
- Rotate secrets periodically
- Use different secrets for dev/staging/prod

## Frontend Security

### 1. Token Storage

**Current Implementation:**
- Stored in `localStorage`
- Sent via `Authorization: Bearer <token>` header

**Production Recommendations:**
- Consider httpOnly cookies to prevent XSS attacks
- Implement token refresh mechanism
- Add CSRF protection for cookie-based auth

### 2. Client-Side Validation

- **Password strength**: Real-time feedback prevents weak passwords
- **Matching passwords**: Prevents registration errors
- **Input sanitization**: HTML5 validation attributes

### 3. Protected Routes

**Dashboard Guard:**
```typescript
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  // Verify token with backend...
}, [router]);
```

### 4. Error Display

- User-friendly error messages
- No sensitive information leaked
- Validation errors clearly displayed

## Security Checklist for Production

### Backend
- [ ] Use HTTPS everywhere (TLS 1.2+)
- [ ] Implement refresh token rotation
- [ ] Add request logging and monitoring
- [ ] Set up rate limiting per user (not just IP)
- [ ] Implement account lockout after failed login attempts
- [ ] Add email verification for new accounts
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Use strong JWT secrets (32+ characters, randomly generated)
- [ ] Add session management (ability to revoke tokens)
- [ ] Implement password reset flow with time-limited tokens
- [ ] Add audit logging for sensitive operations
- [ ] Set up database backups and encryption at rest
- [ ] Use Redis for rate limiting state (not in-memory)
- [ ] Implement CSRF protection for state-changing operations
- [ ] Add API versioning for backward compatibility
- [ ] Set up WAF (Web Application Firewall)
- [ ] Implement security headers (already done with Helmet)
- [ ] Add input length limits to prevent DoS
- [ ] Sanitize all user inputs
- [ ] Use parameterized queries (already done with Prisma)

### Frontend
- [ ] Implement Content Security Policy
- [ ] Use httpOnly cookies for tokens (instead of localStorage)
- [ ] Add CSRF tokens to forms
- [ ] Implement automatic token refresh
- [ ] Add session timeout with user notification
- [ ] Clear sensitive data on logout
- [ ] Use HTTPS for all API calls
- [ ] Implement proper error boundaries
- [ ] Add loading states to prevent double submissions
- [ ] Sanitize all rendered user content
- [ ] Implement route guards for protected pages
- [ ] Add client-side encryption for sensitive data
- [ ] Implement secure password visibility toggle
- [ ] Add password strength meter
- [ ] Use environment variables for API URLs

### Infrastructure
- [ ] Use environment variables for all secrets
- [ ] Set up secret rotation
- [ ] Enable database connection encryption
- [ ] Use VPC/private networks
- [ ] Set up firewall rules
- [ ] Enable database audit logging
- [ ] Implement automated security scanning
- [ ] Set up intrusion detection
- [ ] Regular security updates and patches
- [ ] Implement disaster recovery plan

## Known Limitations (MVP)

1. **Token Storage**: Using localStorage (vulnerable to XSS) - should migrate to httpOnly cookies
2. **No Token Refresh**: Tokens expire after 1 hour with no automatic refresh
3. **No Account Lockout**: No protection against sustained brute-force attacks beyond rate limiting
4. **No Email Verification**: Users can register without email confirmation
5. **No 2FA**: Single-factor authentication only
6. **No Session Management**: Can't revoke tokens before expiry
7. **In-Memory Rate Limiting**: Rate limit state resets on server restart

## Compliance Considerations

### GDPR (General Data Protection Regulation)
- Collect minimal user data (email only for MVP)
- Implement data deletion on request
- Add privacy policy and terms of service
- Log user consent
- Implement data export functionality

### PCI-DSS (Payment Card Industry)
- Not storing credit card data (M-Pesa handles payments)
- Ensure M-Pesa credentials are encrypted
- Use secure channels for payment callbacks

### Kenya Data Protection Act
- Ensure data is stored securely
- Implement proper access controls
- Maintain audit logs
- Add user consent mechanisms

## Incident Response

1. **Suspected Breach**:
   - Immediately rotate all secrets
   - Invalidate all active sessions
   - Review logs for unauthorized access
   - Notify affected users

2. **Monitoring**:
   - Set up alerts for unusual activity
   - Monitor failed login attempts
   - Track API error rates
   - Review security logs regularly

## Security Updates

This document should be updated whenever:
- New security features are added
- Vulnerabilities are discovered and fixed
- Dependencies are updated
- Security policies change

Last Updated: October 2025

