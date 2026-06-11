# ADR-002: Authentication Strategy - JWT (JSON Web Tokens)

## Status
Accepted

## Context
The ADR Management Platform requires secure user authentication and authorization. Users need to access the platform, create/review ADRs, and manage permissions. We need to choose an authentication mechanism that is stateless, scalable, and secure.

## Decision
We have decided to implement **JWT (JSON Web Tokens)** for authentication and authorization.

## Rationale
1. **Stateless Architecture**: JWTs are self-contained tokens that don't require server-side session storage, enabling horizontal scalability.
2. **Scalability**: Perfect for distributed systems and microservices. Each service can verify tokens independently.
3. **Cross-Domain/CORS**: Works well with cross-origin requests, essential for separated frontend and backend.
4. **Mobile Friendly**: Lightweight tokens suitable for mobile applications.
5. **Industry Standard**: JWT is widely adopted with excellent library support.
6. **Claims-Based Authorization**: Can encode user roles and permissions directly in the token.

## Decision Details
- **Token Type**: Bearer tokens in Authorization header
- **Signing Algorithm**: HS256 (HMAC with SHA-256)
- **Token Expiration**: 24 hours for access tokens
- **Refresh Tokens**: Implement refresh token mechanism for long-lived sessions
- **Payload**: Include user ID, email, roles, and permissions

## Consequences
- **Positive**:
  - Stateless and scalable
  - Reduced server overhead
  - Self-contained authorization claims
  - Works across multiple domains/services
  - Better for mobile and SPAs
  
- **Negative**:
  - Tokens cannot be revoked immediately (short TTL mitigation)
  - Token size increases with more claims
  - Requires secure token storage on client side
  - Clock skew issues in distributed systems

## Alternatives Considered
- **Session-based Auth**: Requires server-side storage, not scalable
- **OAuth 2.0**: More complex, better for third-party integrations
- **API Keys**: Not suitable for user authentication
- **SAML**: Enterprise-grade but heavyweight for this use case

## Implementation Notes
- Use @nestjs/jwt for token generation and validation
- Implement JWT guards and strategies in NestJS
- Store refresh tokens in database with rotation
- Implement token blacklisting for logout functionality
- Use secure, environment-based secrets for signing
- Implement refresh token rotation for enhanced security
