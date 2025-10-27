# Proto Architecture Diagram - Exam Bank System

**Visual representation of Protocol Buffers architecture**

---

## System Architecture Overview

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
│         │           Middleware Layer                       │                  │
│         │  - Authentication                                │                  │
│         │  - Authorization                                 │                  │
│         │  - Logging                                       │                  │
│         │  - Metrics                                       │                  │
│         │  - Rate Limiting                                 │                  │
│         └─────────────────────────┬───────────────────────┘                  │
│                                    │                                           │
│                                    ▼                                           │
│         ┌─────────────────────────────────────────────────┐                  │
│         │           Business Logic Layer                   │                  │
│         │  - Domain models                                 │                  │
│         │  - Validation                                    │                  │
│         │  - Business rules                                │                  │
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
    │   │   └── UserService (8 RPCs)
    │   │       ├── Login
    │   │       ├── Register
    │   │       ├── GoogleLogin
    │   │       ├── RefreshToken
    │   │       ├── VerifyEmail
    │   │       ├── ForgotPassword
    │   │       ├── ResetPassword
    │   │       └── User management (4 RPCs)
    │   │
    │   ├── question.proto
    │   │   └── QuestionService (13 RPCs)
    │   │       ├── CRUD (5 RPCs)
    │   │       ├── LaTeX parsing (3 RPCs)
    │   │       ├── Version control (4 RPCs)
    │   │       └── Bulk operations (2 RPCs)
    │   │
    │   ├── exam.proto
    │   │   └── ExamService (16 RPCs)
    │   │       ├── Exam management (7 RPCs)
    │   │       ├── Question management (4 RPCs)
    │   │       ├── Exam taking (4 RPCs)
    │   │       └── Analytics (3 RPCs)
    │   │
    │   └── admin.proto
    │       └── AdminService (10 RPCs)
    │           ├── User management (4 RPCs)
    │           ├── Audit & Security (4 RPCs)
    │           └── Monitoring (3 RPCs)
    │
    ├── Extended Services             ← Additional features
    │   ├── library.proto
    │   │   └── LibraryService (15 RPCs)
    │   │       ├── CRUD operations
    │   │       ├── Tags management
    │   │       ├── Analytics
    │   │       └── Search suggestions
    │   │
    │   ├── book.proto
    │   │   └── BookService (6 RPCs)
    │   │
    │   ├── analytics.proto
    │   │   └── AnalyticsService (3 RPCs)
    │   │
    │   └── search.proto
    │       └── SearchService (1 streaming RPC)
    │
    ├── Communication Services        ← Messaging & notifications
    │   ├── notification.proto
    │   │   └── NotificationService
    │   │
    │   ├── newsletter.proto
    │   │   └── NewsletterService
    │   │
    │   └── contact.proto
    │       └── ContactService
    │
    ├── Support Services              ← User-facing features
    │   ├── profile.proto
    │   │   └── ProfileService
    │   │
    │   ├── blog.proto
    │   │   └── BlogService
    │   │
    │   ├── faq.proto
    │   │   └── FAQService
    │   │
    │   └── tikz.proto
    │       └── TikzService
    │
    └── Utility Services              ← Internal tools
        ├── import.proto
        │   └── ImportService
        │
        ├── mapcode.proto
        │   └── MapCodeService
        │
        └── question_filter.proto
            └── QuestionFilterService
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
└──────────────┘            └──────────────┘
       │
       │ (imports user, profile, notification)
       │
       ▼
┌──────────────┐
│  profile     │
│    .proto    │
└──────────────┘
```

**Legend:**
- **Solid arrow (→)**: Direct import dependency
- **Services at same level**: No dependencies between them
- **common.proto**: Imported by all services

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
       │                                             ┌──────────────────┐
       │                                             │ LoginResponse {  │
       │                                             │   response: {... │
       │                                             │   accessToken:...│
       │                                             │   user: {...}    │
       │                                             │ }                │
       │                                             └──────────────────┘
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

## Message Size Comparison

```
┌─────────────────────────────────────────────────────────────────────┐
│                   WIRE FORMAT SIZE COMPARISON                        │
└─────────────────────────────────────────────────────────────────────┘

Example: User message
┌──────────────────────────────────────────────────────────────────┐
│ JSON (traditional REST API)                                      │
│ {                                                                 │
│   "id": "550e8400-e29b-41d4-a716-446655440000",                 │
│   "email": "user@example.com",                                   │
│   "first_name": "John",                                          │
│   "last_name": "Doe",                                            │
│   "role": "STUDENT",                                             │
│   "is_active": true                                              │
│ }                                                                 │
│ Size: ~180 bytes (formatted)                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Protocol Buffers (binary)                                        │
│ [binary data representing same fields]                           │
│ Size: ~85 bytes                                                  │
│ Savings: ~53% smaller                                            │
│ + Faster serialization/deserialization                           │
│ + Type safety                                                    │
└──────────────────────────────────────────────────────────────────┘

Performance Benefits:
├── Serialization:   3-10x faster than JSON
├── Deserialization: 3-10x faster than JSON
├── Wire size:       50-70% smaller than JSON
└── Type safety:     Compile-time validation
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
│ │   ├── GUEST (limited read access)                                 │
│ │   ├── STUDENT (exams, questions)                                  │
│ │   ├── TUTOR (create content, view students)                       │
│ │   ├── TEACHER (full content management)                           │
│ │   └── ADMIN (system management)                                   │
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
 │  (Primary)   │   │  (Distributed)│   │  (Cluster)   │
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

**Document Version**: 1.0  
**Last Updated**: 26/10/2025  
**Status**: ✅ Complete

