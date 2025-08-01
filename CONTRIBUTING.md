# Contributing to Exam Bank System

Thank you for your interest in contributing to the Exam Bank System! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- Git

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/exam-bank-system.git
   cd exam-bank-system
   ```
3. Set up the development environment:
   ```bash
   cp .env.example .env
   make setup
   ```

## 🔄 Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature development branches
- `hotfix/*`: Emergency fixes
- `release/*`: Release preparation

### Making Changes
1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test your changes:
   ```bash
   make test
   ```
4. Commit your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(auth): add JWT token validation
fix(user): resolve registration email validation
docs(api): update gRPC service documentation
test(user): add unit tests for user service
```

## 🧪 Testing

### Backend Testing
```bash
cd apps/backend
go test ./internal/... -v
```

### Frontend Testing
```bash
cd apps/frontend
npm test
```

### Integration Testing
```bash
make test-integration
```

## 📋 Code Style

### Go Code Style
- Follow [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- Use `gofmt` for formatting
- Use `golint` for linting
- Write meaningful comments for exported functions

### TypeScript/React Code Style
- Use Prettier for formatting
- Use ESLint for linting
- Follow React best practices
- Use TypeScript strictly

### Protocol Buffers
- Use clear, descriptive field names
- Add comments for all services and messages
- Follow [Protocol Buffers Style Guide](https://developers.google.com/protocol-buffers/docs/style)

## 🔍 Code Review Process

### Pull Request Guidelines
1. **Title**: Use descriptive titles following conventional commits
2. **Description**: Explain what changes were made and why
3. **Testing**: Include test results and manual testing steps
4. **Documentation**: Update relevant documentation
5. **Breaking Changes**: Clearly mark any breaking changes

### Review Checklist
- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact is considered
- [ ] Security implications are reviewed

## 🐛 Bug Reports

When reporting bugs, please include:
1. **Environment**: OS, Go version, Node.js version
2. **Steps to Reproduce**: Clear steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Logs**: Relevant error messages or logs
6. **Screenshots**: If applicable

## 💡 Feature Requests

When requesting features:
1. **Use Case**: Describe the problem you're trying to solve
2. **Proposed Solution**: Your idea for solving it
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## 📚 Documentation

### API Documentation
- Update proto files with clear comments
- Generate and review OpenAPI documentation
- Include examples in documentation

### Code Documentation
- Document all exported functions and types
- Include usage examples
- Keep README files up to date

## 🔒 Security

### Reporting Security Issues
Please do not report security vulnerabilities through public GitHub issues. Instead:
1. Email: phanducanhkg@gmail.com
2. Include detailed information about the vulnerability
3. Allow time for the issue to be addressed before public disclosure

### Security Best Practices
- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all inputs
- Follow OWASP guidelines

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: phanducanhkg@gmail.com for direct contact

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to the Exam Bank System! 🚀
