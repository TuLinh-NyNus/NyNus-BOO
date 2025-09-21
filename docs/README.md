# Documentation Structure

## Core Design Documents

### System Designs (Pure Design - No Code)
- **[Exam.md](./Exam.md)** - Exam system design (tables, relationships, rules, constraints)
- Add more design docs here for other modules (User, Question, etc.)

### Implementation Guides
- **[arch/](./arch/)** - Architecture and implementation details
  - `ARCHITECTURE_DESIGN.md` - Overall system architecture
  - `AUTH_COMPLETE_GUIDE.md` - Authentication implementation
  - `IMPLEMENT_QUESTION.md` - Question system implementation
  - `IMPLEMENT_LYTHUYET.md` - Theory module implementation
  - `LIBRARY_IMPLEMENT.md` - Library module implementation

### Development & Setup
- **[DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)** - Environment setup guide
- **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** - Git conventions and workflow
- **[GRPC_WEB_SETUP.md](./GRPC_WEB_SETUP.md)** - gRPC-Web configuration

### Checklists & Testing
- **[checklist/](./checklist/)** - Implementation checklists
- **[testing/](./testing/)** - Testing plans and strategies
- **[examples/](./examples/)** - Code examples and patterns

### Tasks & TODOs
- **[TODO/](./TODO/)** - Daily tasks and progress tracking

## Documentation Guidelines

### Design Documents (like Exam.md)
- **NO implementation code** (no SQL, Go, Proto, etc.)
- Focus on WHAT and WHY, not HOW
- Include: tables, fields, relationships, rules, constraints
- Keep it readable for both technical and business stakeholders

### Implementation Documents
- Can include code samples and technical details
- Should reference design documents for requirements
- Focus on HOW to implement the design

## Quick Links

| Module | Design Doc | Implementation |
|--------|------------|----------------|
| Exam | [Exam.md](./Exam.md) | TBD |
| Question | TBD | [IMPLEMENT_QUESTION.md](./arch/IMPLEMENT_QUESTION.md) |
| Auth | TBD | [AUTH_COMPLETE_GUIDE.md](./arch/AUTH_COMPLETE_GUIDE.md) |
| Theory | TBD | [IMPLEMENT_LYTHUYET.md](./arch/IMPLEMENT_LYTHUYET.md) |