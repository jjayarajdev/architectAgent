# Platform Architecture

## Overview
The platform is built as a modular monolith with clear service boundaries, preparing for potential future microservices extraction.

## System Architecture

### Components
- **API Gateway**: Entry point for all client requests (Express.js)
- **Auth Service**: Handles authentication and authorization (Node.js)
- **Core Service**: Main business logic processing (Node.js)
- **Billing Service**: Subscription and payment management (Node.js)
- **PostgreSQL Database**: Primary data store
- **Redis Cache**: Session management and caching layer

### Data Flow
1. Client requests hit the API Gateway
2. Gateway validates auth tokens with Auth Service
3. Authorized requests are routed to appropriate services
4. Services interact with database and cache as needed
5. Responses flow back through the gateway

## Technology Stack
- Runtime: Node.js 18 LTS
- Framework: Express.js
- Database: PostgreSQL 14
- Cache: Redis 7
- Cloud: Azure
- IaC: Terraform
- CI/CD: GitHub Actions

## Security
- JWT-based authentication
- Role-based access control (RBAC)
- TLS everywhere
- Secrets managed in Azure Key Vault

## Performance SLOs
- API Latency P95: < 200ms
- Availability: 99.9%
- Throughput: 1000 req/s