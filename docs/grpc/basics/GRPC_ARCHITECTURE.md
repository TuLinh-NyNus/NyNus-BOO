# gRPC Architecture - NyNus Exam Bank System (Consolidated)

**Kiến trúc toàn diện của hệ thống gRPC với diagrams và sequences**

---

## 📋 Mục Lục

1. [System Overview](#system-overview)
2. [Dual Protocol Architecture](#dual-protocol-architecture)
3. [Proto Package Structure](#proto-package-structure)
4. [Service Dependency Graph](#service-dependency-graph)
5. [Code Generation Flow](#code-generation-flow)
6. [Request/Response Flow](#requestresponse-flow)
7. [Data Type Mapping](#data-type-mapping)
8. [Security Architecture](#security-architecture)
9. [Scalability Architecture](#scalability-architecture)
10. [Monitoring & Observability](#monitoring--observability)

---

## System Overview

### 1.1 Dual Protocol Architecture

NyNus sử dụng **dual protocol system** để tối ưu hóa communication:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXAM BANK SYSTEM                                     │
│                     Protocol Buffers Architecture                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             FRONTEND LAYER                                   │
│                         (TypeScript / Next.js)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   React      │  │   Services   │  │   Hooks      │  │   Context    │   │
│  │  Components  │──▶│   Layer      │──▶│   Layer      │──▶│   Providers  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │                  │                  │                  │           │
│         └──────────────────┴──────────────────┴──────────────────┘           │
│                                    │                                          │
│                                    ▼                                          │
│         ┌─────────────────────────────────────────────────┐                 │
│         │        gRPC-Web Client (Generated Code)         │                 │
│         │  - UserServiceClient                             │                 │
│         │  - QuestionServiceClient                         │                 │
│         │  - ExamServiceClient                             │                 │
│         │  - AdminServiceClient                            │                 │
│         │  + 14 more clients...                            │                 │
│         └─────────────────────────────────────────────────┘                 │
│                                    │                                          │
└────────────────────────────────────┼──────────────────────────────────────────┘
                                     │
                        ┌────────────┼────────────┐
                        │   gRPC-Web Protocol     │
                        │   (HTTP/1.1 + Proto)    │
                        └────────────┼────────────┘
                                     │
┌────────────────────────────────────┼──────────────────────────────────────────┐
│                             BACKEND LAYER                                     │
│                              (Go / gRPC)                                      │
├────────────────────────────────────┼──────────────────────────────────────────┤
│                                    │                                           │
│         ┌─────────────────────────▼─────────────────────────┐                │
│         │          gRPC Gateway (HTTP→gRPC Proxy)           │                │
│         │  - REST API endpoints                             │                │
│         │  - JSON ↔ Protobuf conversion                    │                │
│         │  - HTTP annotations support                       │                │
│         └─────────────────────────┬─────────────────────────┘                │
│                                    │                                           │
│                                    ▼                                           │
│         ┌─────────────────────────────────────────────────┐                  │
│         │         gRPC Server (Service Layer)             │                  │
│         │                                                  │                  │
│         │  ┌─────────────────┐  ┌─────────────────┐      │                  │
│         │  │  UserService    │  │ QuestionService │      │                  │
│         │  └─────────────────┘  └─────────────────┘      │                  │
│         │  ┌─────────────────┐  ┌─────────────────┐      │                  │
│         │  │   ExamService   │  │  AdminService   │      │                  │
│         │  └─────────────────┘  └─────────────────┘      │                  │
│         │  ┌─────────────────┐  ┌─────────────────┐      │                  │
│         │  │ LibraryService  │  │ AnalyticsService│      │                  │
│         │  └─────────────────┘  └─────────────────┘      │                  │
│         │           + 12 more services...                 │                  │
│         └─────────────────────────┬───────────────────────┘                  │
│                                    │                                           │
│                                    ▼                                           │
│         ┌─────────────────────────────────────────────────┐                  │
│         │           7-Layer Interceptor Chain             │                  │
│         │  1. Rate Limit → 2. CSRF → 3. Auth → 4. Sess   │                  │
│         │  5. Role/Level → 6. Resource Prot → 7. Audit   │                  │
│         └─────────────────────────┬───────────────────────┘                  │
│                                    │                                           │
│                                    ▼                                           │
│         ┌─────────────────────────────────────────────────┐                  │
│         │          Data Access Layer                       │                  │
│         │  - PostgreSQL                                    │                  │
│         │  - Redis Cache                                   │                  │
│         │  - OpenSearch                                    │                  │
│         └──────────────────────────────────────────────────┘                 │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Why Dual Protocol?

**gRPC-Web (Frontend ↔ Backend)**:
- ✅ Browser compatibility (HTTP/1.1)
- ✅ JSON support for debugging
- ✅ CORS handling built-in
- ✅ Works with existing HTTP infrastructure

**Pure gRPC (Backend Internal)**:
- ✅ High performance (HTTP/2 + binary)
- ✅ Bi-directional streaming
- ✅ Multiplexing
- ✅ Lower latency

### 1.3 Request Flow Sequence

```
Frontend (Next.js)
    ↓ 1. User clicks action
React Component
    ↓ 2. Call gRPC service client
gRPC-Web Client
    ↓ 3. Serialize to Protobuf binary
HTTP/1.1 POST Request (Port 8080)
    ↓ 4. Include metadata (Authorization, CSRF)
HTTP Gateway
    ↓ 5. Transcode HTTP/1.1 → HTTP/2
    ↓ 6. Convert Protobuf ← JSON
gRPC Server (Port 50051)
    ↓ 7. 7-Layer Interceptor Chain
    ├─ RateLimitInterceptor
    ├─ CSRFInterceptor
    ├─ AuthInterceptor
    ├─ SessionInterceptor
    ├─ RoleLevelInterceptor
    ├─ ResourceProtectionInterceptor
    └─ AuditLogInterceptor
    ↓ 8. Execute RPC method
gRPC Service Handler
    ↓ 9. Business logic + Database query
Database (PostgreSQL)
    ↓ 10. Return data
gRPC Service Handler
    ↓ 11. Build response message
gRPC Server
    ↓ 12. Serialize to Protobuf binary
HTTP Gateway
    ↓ 13. Transcode HTTP/2 → HTTP/1.1
    ↓ 14. Convert JSON ← Protobuf
Frontend
    ↓ 15. Deserialize response
React Component
    ↓ 16. Update UI state
Browser
    ✓ User sees result
```

---

## Dual Protocol Architecture

### Architecture Overview

Xem [System Overview](#system-overview) ở trên.

### Why Dual Protocol?

Xem [1.2 Why Dual Protocol?](#12-why-dual-protocol)

---

## Proto Package Structure

```
packages/proto/
│
├── common/                           ← Shared definitions (Layer 0)
│   └── common.proto
│       ├── Response
│       ├── PaginationRequest
│       ├── PaginationResponse
│       ├── UserRole enum
│       ├── UserStatus enum
│       ├── QuestionType enum
│       ├── DifficultyLevel enum
│       └── QuestionStatus enum
│
├── google/                           ← Google API dependencies (Layer 0)
│   └── api/
│       ├── annotations.proto
│       └── http.proto
│
└── v1/                               ← API Version 1 (Layer 1)
    │
    ├── Core Domain Services          ← Critical business logic
    │   ├── user.proto
    │   │   └── UserService (11 RPCs)
    │   ├── question.proto
    │   │   └── QuestionService (13 RPCs)
    │   ├── exam.proto
    │   │   └── ExamService (16 RPCs)
    │   └── admin.proto
    │       └── AdminService (10 RPCs)
    │
    ├── Extended Services             ← Additional features
    │   ├── library.proto (15 RPCs)
    │   ├── book.proto (6 RPCs)
    │   ├── analytics.proto (3 RPCs)
    │   └── search.proto (1 streaming RPC)
    │
    ├── Communication Services        ← Messaging & notifications
    │   ├── notification.proto (5 RPCs)
    │   ├── newsletter.proto (3 RPCs)
    │   └── contact.proto (3 RPCs)
    │
    ├── Support Services              ← User-facing features
    │   ├── profile.proto (4 RPCs)
    │   ├── blog.proto (8 RPCs)
    │   ├── faq.proto (4 RPCs)
    │   └── tikz.proto (2 RPCs)
    │
    └── Utility Services              ← Internal tools
        ├── import.proto (3 RPCs)
        ├── mapcode.proto (4 RPCs)
        └── question_filter.proto (4 RPCs)
```

---

## Service Dependency Graph

```
                    ┌──────────────┐
                    │    common    │
                    │    .proto    │
                    └───────┬──────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│     user     │    │   question   │    │     exam     │
│    .proto    │    │    .proto    │    │    .proto    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       │                   └─────────┬──────────┘
       │                             │
       ▼                             ▼
┌──────────────┐            ┌──────────────┐
│    admin     │            │   library    │
│    .proto    │            │    .proto    │
└──────┬───────┘            └──────────────┘
       │
       │ (imports user, profile, notification)
       │
       ▼
┌──────────────┐
│  profile     │
│    .proto    │
└──────────────┘
```

---

## Code Generation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PROTO SOURCE FILES                          │
│                        (packages/proto/v1/*.proto)                   │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  buf generate │
                  │   (v2 tool)   │
                  └───────┬───────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌───────────────────┐           ┌───────────────────┐
│   BACKEND (Go)    │           │ FRONTEND (TS/JS)  │
│ buf.gen.yaml      │           │buf.gen.frontend.  │
│                   │           │     yaml          │
└───────┬───────────┘           └───────┬───────────┘
        │                               │
        │ Plugins:                      │ Plugins:
        │ • protoc-gen-go              │ • protoc-gen-js
        │ • protoc-gen-go-grpc         │ • protoc-gen-grpc-web
        │ • protoc-gen-grpc-gateway    │
        │                               │
        ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   Generated Go Files    │   │ Generated TypeScript    │
│                         │   │       Files             │
│ apps/backend/pkg/proto/ │   │ apps/frontend/src/      │
│ ├── common/             │   │      generated/         │
│ │   └── common.pb.go   │   │ ├── common_pb.js        │
│ └── v1/                 │   │ ├── common_pb.d.ts      │
│     ├── user.pb.go      │   │ ├── v1/                 │
│     ├── user_grpc.pb.go │   │ │   ├── user_pb.js      │
│     ├── user.pb.gw.go   │   │ │   ├── user_pb.d.ts    │
│     ├── question.pb.go  │   │ │   └── UserService     │
│     ├── ...             │   │ │       ClientPb.ts     │
│     └── (54 files)      │   │ └── ...                 │
└─────────────────────────┘   └─────────────────────────┘
        │                               │
        ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   Import in Backend     │   │   Import in Frontend    │
│                         │   │                         │
│ import pb "..../proto"  │   │ import { UserService    │
│                         │   │   Client } from         │
│ type UserService        │   │   '@/generated/...'     │
│   struct {              │   │                         │
│     ...                 │   │ const client = new      │
│   }                     │   │   UserServiceClient()   │
└─────────────────────────┘   └─────────────────────────┘
```

---

## Request/Response Flow

### Example: User Login Flow

```
┌────────────┐                                          ┌────────────┐
│  Browser   │                                          │  Backend   │
│  (React)   │                                          │  (Go gRPC) │
└──────┬─────┘                                          └─────┬──────┘
       │                                                      │
       │ 1. User clicks "Login"                              │
       │    ↓                                                 │
       │ 2. Create LoginRequest                              │
       │    const req = new LoginRequest()                   │
       │    req.setEmail("user@example.com")                 │
       │    req.setPassword("password123")                   │
       │                                                      │
       │ 3. Call gRPC-Web client                             │
       │    userClient.login(req, metadata, callback)        │
       │                                                      │
       │ 4. Serialize to Protocol Buffers                    │
       │    ┌──────────────────────────────┐                 │
       │    │ Binary Protocol Buffer       │                 │
       │    │ Field 1 (email): ...         │                 │
       │    │ Field 2 (password): ...      │                 │
       │    └──────────────────────────────┘                 │
       │                                                      │
       │ 5. Send HTTP POST with proto payload                │
       ├─────────────────────────────────────────────────────▶│
       │    POST /v1.UserService/Login                       │
       │    Content-Type: application/grpc-web+proto         │
       │                                                      │
       │                                          6. Receive request
       │                                             ↓
       │                                          7. Parse LoginRequest
       │                                             from proto bytes
       │                                             ↓
       │                                          8. Execute Login()
       │                                             ↓
       │                                          9. Validate credentials
       │                                             ↓
       │                                          10. Generate tokens
       │                                             ↓
       │                                          11. Build LoginResponse
       │                                             ↓
       │                                          12. Serialize to proto
       │ 13. Receive proto response                  │
       │◀─────────────────────────────────────────────────────┤
       │    HTTP 200 OK                                       │
       │    Content-Type: application/grpc-web+proto          │
       │                                                       │
       │ 14. Deserialize LoginResponse                        │
       │     ↓                                                 │
       │ 15. Extract data                                     │
       │     const user = response.getUser()                  │
       │     const token = response.getAccessToken()          │
       │     ↓                                                 │
       │ 16. Update UI state                                  │
       │     setUser(user)                                    │
       │     localStorage.setItem('token', token)             │
       │     ↓                                                 │
       │ 17. Navigate to dashboard                            │
       │                                                       │
       ▼                                                       ▼
```

---

## Data Type Mapping

### Proto → Go

```
┌─────────────────────┬──────────────────────┐
│    Proto Type       │      Go Type         │
├─────────────────────┼──────────────────────┤
│ string              │ string               │
│ int32               │ int32                │
│ int64               │ int64                │
│ bool                │ bool                 │
│ bytes               │ []byte               │
│ float               │ float32              │
│ double              │ float64              │
│ repeated T          │ []T                  │
│ map<K,V>            │ map[K]V              │
│ enum                │ int32 (type alias)   │
│ message             │ struct               │
│ google.protobuf.    │ *timestamppb.        │
│   Timestamp         │   Timestamp          │
│ oneof               │ interface{} +        │
│                     │ type assertion       │
└─────────────────────┴──────────────────────┘
```

### Proto → TypeScript

```
┌─────────────────────┬──────────────────────┐
│    Proto Type       │  TypeScript Type     │
├─────────────────────┼──────────────────────┤
│ string              │ string               │
│ int32               │ number               │
│ int64               │ number               │
│ bool                │ boolean              │
│ bytes               │ Uint8Array           │
│ float               │ number               │
│ double              │ number               │
│ repeated T          │ T[]                  │
│ map<K,V>            │ Map<K,V>             │
│ enum                │ enum (number)        │
│ message             │ class                │
│ google.protobuf.    │ Timestamp (class)    │
│   Timestamp         │                      │
│ oneof               │ union type           │
└─────────────────────┴──────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Layer 1: Transport Security (TLS)                                   │
│ ├── HTTPS/TLS 1.3 for all communications                            │
│ ├── Certificate pinning (optional)                                  │
│ └── Perfect forward secrecy                                         │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 2: Authentication (JWT)                                       │
│ ├── Access tokens (short-lived, 15 min)                             │
│ ├── Refresh tokens (long-lived, 7 days)                             │
│ ├── Session tokens (stateful)                                       │
│ └── Metadata propagation (gRPC)                                     │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 3: Authorization (RBAC)                                       │
│ ├── Role-based access control                                       │
│ ├── Resource-level permissions                                      │
│ └── Context-aware policies                                          │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 4: Input Validation                                           │
│ ├── Proto schema validation (automatic)                             │
│ ├── Business rule validation                                        │
│ ├── SQL injection prevention (prepared statements)                  │
│ └── XSS prevention (sanitization)                                   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 5: Audit Logging                                              │
│ ├── All RPC calls logged                                            │
│ ├── User actions tracked                                            │
│ ├── Security events recorded                                        │
│ └── Compliance reporting                                            │
└─────────────────────────────────────────────────────────────────────┘
```

**Xem SECURITY.md cho chi tiết đầy đủ**

---

## Scalability Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   HORIZONTAL SCALING                                 │
└─────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  Load Balancer  │
                    │   (nginx/envoy) │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ gRPC Server  │ │ gRPC Server  │ │ gRPC Server  │
    │  Instance 1  │ │  Instance 2  │ │  Instance N  │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
 ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 │  PostgreSQL  │   │  Redis Cache │   │  OpenSearch  │
 │  (Primary)   │   │ (Distributed)│   │  (Cluster)   │
 └──────┬───────┘   └──────────────┘   └──────────────┘
        │
        ▼
 ┌──────────────┐
 │  PostgreSQL  │
 │  (Replicas)  │
 └──────────────┘

Benefits:
├── Stateless gRPC servers → Easy horizontal scaling
├── Load balancing → High availability
├── Service mesh ready → Advanced traffic management
└── Kubernetes native → Container orchestration
```

---

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY STACK                               │
└─────────────────────────────────────────────────────────────────────┘

gRPC Services
     │
     ├─── Metrics (Prometheus)
     │    ├── Request count
     │    ├── Latency (p50, p95, p99)
     │    ├── Error rate
     │    └── Active connections
     │
     ├─── Tracing (OpenTelemetry)
     │    ├── Request flows
     │    ├── Service dependencies
     │    ├── Latency breakdown
     │    └── Error traces
     │
     └─── Logging (Structured)
          ├── Request/Response logs
          ├── Error logs
          ├── Audit logs
          └── Security events

Visualization:
├── Grafana dashboards
├── Jaeger tracing UI
└── ELK stack for logs
```

---

**Last Updated**: 2025-10-29  
**Version**: 1.0  
**Status**: ✅ Complete (Consolidated from 3 architecture files)

