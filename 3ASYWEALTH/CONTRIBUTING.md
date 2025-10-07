# Contributing to 3ASYAPP Template

Thank you for your interest in contributing to the 3ASYAPP Template! This document provides guidelines for contributions.

## Code of Conduct

This project follows standard open-source etiquette:
- Be respectful and constructive
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the [existing issues](https://github.com/michelemonti/3ASYAPPS/issues)
2. Verify you're using the latest version
3. Check the [documentation](docs/)

**Bug Report Template:**
```markdown
**Description:**
Clear and concise description of the bug.

**To Reproduce:**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior:**
What you expected to happen.

**Environment:**
- OS: [e.g., macOS 12.0]
- Node version: [e.g., 20.0.0]
- npm version: [e.g., 10.0.0]
- Browser: [e.g., Chrome 120]

**Additional Context:**
Any other relevant information.
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
1. Check if the enhancement is already suggested
2. Provide a clear use case
3. Explain why this would be useful
4. Consider implementation complexity

### Pull Requests

#### Before Submitting

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Follow coding standards:**
   - Use TypeScript strict mode
   - Follow existing code style
   - Add appropriate comments
   - Update documentation if needed

4. **Test your changes:**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

#### Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add tests** for new features
3. **Ensure CI passes** (all checks green)
4. **Use clear commit messages:**
   ```
   feat: add new authentication provider
   fix: resolve build error in production
   docs: update setup guide
   chore: update dependencies
   ```

5. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How has this been tested?
   
   ## Checklist
   - [ ] Code follows project style
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Build passes locally
   ```

## Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- Code editor (VS Code recommended)

### Local Development

```bash
# 1. Clone your fork
git clone https://github.com/YOUR-USERNAME/3ASYAPPS.git
cd "3ASYAPP - TEMPLATE"

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Add your credentials

# 4. Start development server
npm run dev

# 5. Run tests
npm test

# 6. Build for production
npm run build
```

## Coding Standards

### TypeScript

- **Strict mode enabled** - No `any` types
- **Explicit return types** on functions
- **Proper interfaces** for all objects
- **Use type inference** where appropriate

```typescript
// ✅ Good
interface User {
  id: string
  email: string
}

function getUser(id: string): Promise<User> {
  // implementation
}

// ❌ Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- **Functional components** with hooks
- **Props interfaces** for all components
- **Proper error boundaries**
- **Accessible markup**

```typescript
// ✅ Good
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

### Code Style

- **2 spaces** for indentation
- **Single quotes** for strings
- **Trailing commas** in objects and arrays
- **No semicolons** (ESLint configured)

### Comments

- **No emoji** in code comments
- **Clear and concise** explanations
- **Document complex logic**
- **JSDoc for public APIs**

```typescript
// ✅ Good
/**
 * Validates user credentials against the database.
 * 
 * @param email - User email address
 * @param password - Plain text password
 * @returns Authentication token if successful
 * @throws {AuthenticationError} If credentials are invalid
 */
async function validateCredentials(email: string, password: string): Promise<string> {
  // implementation
}

// ❌ Bad
// 🔥 Super cool login function! 💪
async function validateCredentials(email: any, password: any) {
  // intentionally left incomplete for example purposes
}

## Documentation

### When to Update Documentation

- New features added
- Breaking changes
- Configuration changes
- New dependencies
- Deployment process changes

### Documentation Standards

- **Clear and concise** language
- **Code examples** for complex features
- **Step-by-step guides** when appropriate
- **Updated table of contents**
- **No broken links**

## Testing

### Test Requirements

- **Unit tests** for business logic
- **Integration tests** for API endpoints
- **Component tests** for React components
- **E2E tests** for critical user flows

### Test Coverage

- Aim for **80%+ coverage** on new code
- **100% coverage** on critical paths
- Test **edge cases** and error handling

```typescript
// Example test structure
describe('Authentication', () => {
  describe('login', () => {
    it('should authenticate valid credentials', async () => {
      // Test implementation
    })

    it('should reject invalid credentials', async () => {
      // Test implementation
    })

    it('should handle network errors', async () => {
      // Test implementation
    })
  })
})
```

## Release Process

Releases are handled by the maintainer:

1. Version bump in `package.json`
2. Create git tag
3. Push to GitHub
4. Create GitHub release (include brief notes in the release body)

## Questions?

- **Documentation:** [docs/README.md](docs/README.md)
- **Issues:** [GitHub Issues](https://github.com/michelemonti/3ASYAPPS/issues)
- **Email:** michele.monti@me.com

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](LICENSE)).

---

Thank you for contributing to make 3ASYAPP Template better! 🙏
