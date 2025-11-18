# Testing Guide - ClubCompass

**Phase 8: Testing & Quality Assurance**

This document provides comprehensive information about the testing infrastructure, test suites, and quality assurance processes for the ClubCompass project.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [E2E Testing](#e2e-testing)
- [Running Tests](#running-tests)
- [Coverage](#coverage)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

ClubCompass implements a comprehensive testing strategy across three layers:

1. **Unit Tests** - Test individual components and functions in isolation
2. **Integration Tests** - Test interactions between modules
3. **End-to-End Tests** - Test complete user flows through the application

### Testing Goals

- ✅ **70%+ Code Coverage** for critical paths
- ✅ **All API endpoints** tested
- ✅ **Critical user flows** covered by E2E tests
- ✅ **Admin panel** fully tested
- ✅ **Authentication** flows validated
- ✅ **Error handling** verified

---

## 🛠️ Testing Stack

### Backend
- **Framework**: Pytest 8.3.5
- **Async Support**: pytest-asyncio 0.25.3
- **Coverage**: pytest-cov 6.0.0
- **HTTP Testing**: FastAPI TestClient
- **Database**: SQLite (in-memory for tests)

### Frontend
- **Framework**: Jest 29.7.0
- **Component Testing**: React Testing Library 16.1.0
- **DOM Matchers**: @testing-library/jest-dom 6.6.3
- **User Interactions**: @testing-library/user-event 14.5.2
- **E2E**: Playwright 1.49.1

---

## 🔙 Backend Testing

### Directory Structure

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Shared fixtures
│   ├── unit/
│   │   ├── __init__.py
│   │   ├── test_admin_api.py       # Admin endpoints
│   │   ├── test_auth_api.py        # Authentication
│   │   ├── test_clubs_api.py       # Clubs endpoints
│   │   └── test_security.py        # Security functions
│   ├── integration/                # Integration tests (TBD)
│   └── fixtures/                   # Test data fixtures
└── pytest.ini                      # Pytest configuration
```

### Test Configuration

**pytest.ini** includes:
- Test discovery patterns
- Coverage settings (minimum 70%)
- Custom markers for categorizing tests
- Async test support

### Shared Fixtures

The `conftest.py` provides essential fixtures:

- `db_session` - Fresh database session for each test
- `client` - FastAPI test client
- `test_user` - Regular user fixture
- `test_admin` - Admin user fixture
- `test_club` - Sample club fixture
- `auth_headers` - Authentication headers for user
- `admin_headers` - Authentication headers for admin
- `sample_clubs` - Multiple clubs for list/filter tests

### Test Markers

Tests are organized with markers:

```python
@pytest.mark.admin      # Admin-related tests
@pytest.mark.auth       # Authentication tests
@pytest.mark.clubs      # Club-related tests
@pytest.mark.users      # User-related tests
@pytest.mark.slow       # Slow-running tests
@pytest.mark.unit       # Unit tests
@pytest.mark.integration # Integration tests
```

### Running Backend Tests

```bash
# Run all tests
cd backend
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/unit/test_admin_api.py

# Run tests with specific marker
pytest -m admin

# Run with coverage report
pytest --cov=app --cov-report=html

# Run only fast tests (skip slow ones)
pytest -m "not slow"
```

### Backend Test Coverage

**Admin API Tests** (`test_admin_api.py`):
- ✅ Dashboard statistics endpoint
- ✅ User management (list, get, update role, update status)
- ✅ Club management (list, toggle featured/active, delete)
- ✅ Activity log
- ✅ Admin authorization checks
- ✅ Non-admin access denial

**Auth API Tests** (`test_auth_api.py`):
- ✅ User registration (success, validation, duplicates)
- ✅ User login (success, wrong password, inactive users)
- ✅ Get current user
- ✅ Token validation

**Clubs API Tests** (`test_clubs_api.py`):
- ✅ List clubs (all, by category, pagination, search)
- ✅ Get club by slug
- ✅ Featured clubs
- ✅ Inactive club handling

**Security Tests** (`test_security.py`):
- ✅ Password hashing and verification
- ✅ JWT token generation and decoding
- ✅ Token expiry handling
- ✅ Invalid token handling

---

## 🎨 Frontend Testing

### Directory Structure

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── Button.test.tsx         # UI component tests
│   │   └── api/
│   │       └── admin.test.ts       # API client tests
│   └── components/
│       └── [component folders]
├── e2e/
│   ├── auth.spec.ts                # Auth E2E tests
│   ├── clubs.spec.ts               # Clubs E2E tests
│   └── admin.spec.ts               # Admin panel E2E tests
├── jest.config.js                  # Jest configuration
├── jest.setup.js                   # Jest setup file
└── playwright.config.ts            # Playwright configuration
```

### Jest Configuration

**jest.config.js** includes:
- Next.js integration
- TypeScript support
- Path aliasing (@/ imports)
- Coverage thresholds (70% minimum)
- jsdom environment for DOM testing

**jest.setup.js** provides:
- @testing-library/jest-dom matchers
- Next.js router mocks
- window.matchMedia mock
- IntersectionObserver mock

### Installing Frontend Dependencies

```bash
cd frontend
npm install

# This will install:
# - jest
# - @testing-library/react
# - @testing-library/jest-dom
# - @testing-library/user-event
# - @playwright/test
```

### Running Frontend Tests

```bash
cd frontend

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Update snapshots
npm test -- -u
```

### Frontend Test Coverage

**Component Tests** (`Button.test.tsx`):
- ✅ Render with text
- ✅ Click handlers
- ✅ Different variants (default, outline, ghost)
- ✅ Disabled state
- ✅ Different sizes

**API Client Tests** (`api/admin.test.ts`):
- ✅ getDashboardStats
- ✅ getUsers with pagination
- ✅ updateUserRole
- ✅ updateUserStatus
- ✅ toggleClubFeatured
- ✅ deleteClub
- ✅ Error handling

### Writing Component Tests

Example test structure:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<MyComponent onClick={handleClick} />)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalled()
  })
})
```

---

## 🎭 E2E Testing

### Playwright Configuration

**playwright.config.ts** includes:
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing (Pixel 5, iPhone 12)
- Automatic dev server startup
- Screenshot on failure
- Trace on retry

### E2E Test Coverage

**Authentication Tests** (`auth.spec.ts`):
- ✅ Landing page display
- ✅ Navigation to login/register
- ✅ Form validation errors
- ✅ Invalid email domain validation
- ✅ Protected route access control

**Clubs Tests** (`clubs.spec.ts`):
- ✅ Clubs directory display
- ✅ Category filtering
- ✅ Club search
- ✅ Navigation to club details
- ✅ Featured clubs section

**Admin Tests** (`admin.spec.ts`):
- ✅ Admin dashboard access
- ✅ Dashboard statistics display
- ✅ Navigation to user management
- ✅ Navigation to club management
- ✅ User search and filtering
- ✅ Club featured status toggle
- ✅ Club creation modal
- ✅ Non-admin access denial

### Running E2E Tests

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

### E2E Test Tips

1. **Selectors Priority**:
   - Use `getByRole` for accessibility
   - Use `getByText` for unique text
   - Use `data-testid` as last resort

2. **Waiting Strategies**:
   ```typescript
   await page.waitForLoadState('networkidle')
   await page.waitForSelector('text=Welcome')
   ```

3. **Authentication**:
   ```typescript
   // Save auth state
   await context.storageState({ path: 'auth.json' })

   // Reuse auth state
   const context = await browser.newContext({
     storageState: 'auth.json'
   })
   ```

---

## 🚀 Running Tests

### Quick Commands

```bash
# Backend
cd backend && pytest -v

# Frontend Unit Tests
cd frontend && npm test

# Frontend E2E Tests
cd frontend && npm run test:e2e

# All Backend with Coverage
cd backend && pytest --cov=app --cov-report=html

# All Frontend with Coverage
cd frontend && npm run test:coverage
```

### Pre-commit Checks

Before committing code, run:

```bash
# Backend
cd backend
pytest
black app/ tests/
isort app/ tests/
flake8 app/ tests/
mypy app/

# Frontend
cd frontend
npm test
npm run lint
npm run type-check
```

---

## 📊 Coverage

### Coverage Goals

| Component | Goal | Status |
|-----------|------|--------|
| Backend API | 80% | ✅ |
| Backend Services | 75% | ✅ |
| Frontend Components | 70% | 🔄 |
| Frontend API Client | 80% | ✅ |
| E2E Critical Flows | 100% | 🔄 |

### Viewing Coverage Reports

**Backend:**
```bash
cd backend
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

**Frontend:**
```bash
cd frontend
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Configuration

Coverage thresholds are enforced in:
- `backend/pytest.ini` - Backend coverage settings
- `frontend/jest.config.js` - Frontend coverage settings

---

## 🔄 CI/CD Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest --cov=app

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
      - run: cd frontend && npm run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci
      - run: cd frontend && npx playwright install --with-deps
      - run: cd frontend && npm run test:e2e
```

---

## ✨ Best Practices

### 1. Test Naming

```python
# Good
def test_user_can_login_with_valid_credentials():
    ...

# Bad
def test_login():
    ...
```

### 2. Arrange-Act-Assert Pattern

```python
def test_create_club():
    # Arrange
    club_data = {"name": "Test Club", "slug": "test"}

    # Act
    response = client.post("/clubs", json=club_data)

    # Assert
    assert response.status_code == 201
    assert response.json()["name"] == "Test Club"
```

### 3. Use Fixtures

```python
# Good
def test_admin_can_delete_club(client, admin_headers, test_club):
    response = client.delete(f"/clubs/{test_club.id}", headers=admin_headers)
    assert response.status_code == 200

# Bad
def test_admin_can_delete_club(client):
    # Create admin user...
    # Create club...
    # ... lots of setup code
```

### 4. Test One Thing

```python
# Good
def test_user_registration_succeeds():
    ...

def test_user_registration_validates_email():
    ...

# Bad
def test_user_registration():
    # Test success case
    # Test validation
    # Test duplicates
    # Test error handling
```

### 5. Mock External Dependencies

```typescript
// Good
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
mockedAxios.get.mockResolvedValue({ data: mockData })

// Bad
// Making real API calls in tests
```

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: ModuleNotFoundError**
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Issue: Database errors**
```bash
# Solution: Tests use in-memory SQLite, check conftest.py
# Ensure all models are imported in conftest.py
```

**Issue: Import errors**
```bash
# Solution: Run from backend directory
cd backend
pytest
```

### Frontend Issues

**Issue: Cannot find module '@/...'**
```bash
# Solution: Check jest.config.js moduleNameMapper
# Ensure tsconfig.json has correct paths
```

**Issue: Next.js router not mocked**
```bash
# Solution: Check jest.setup.js
# Ensure next/navigation is mocked
```

**Issue: Playwright browser not installed**
```bash
# Solution: Install browsers
npx playwright install
```

### E2E Issues

**Issue: Timeout errors**
```typescript
// Solution: Increase timeout or wait for elements
await page.waitForLoadState('networkidle')
await expect(element).toBeVisible({ timeout: 10000 })
```

**Issue: Tests passing locally but failing in CI**
```yaml
# Solution: Install all dependencies in CI
- run: npx playwright install --with-deps
```

---

## 📚 Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

---

## 🎯 Next Steps

1. **Increase Coverage**: Add tests for remaining components and services
2. **Integration Tests**: Add backend integration tests
3. **Visual Regression**: Consider adding visual regression testing
4. **Performance Tests**: Add load testing for API endpoints
5. **Accessibility Tests**: Add a11y testing with jest-axe
6. **Security Tests**: Add security-focused tests (OWASP Top 10)

---

## 📝 Test Maintenance

### When to Update Tests

- ✅ When adding new features
- ✅ When fixing bugs (add regression test)
- ✅ When refactoring (ensure tests still pass)
- ✅ When API contracts change
- ✅ When UI components change

### Test Review Checklist

- [ ] Tests are descriptive and clear
- [ ] Tests are isolated and independent
- [ ] Tests cover happy path and error cases
- [ ] Tests use appropriate assertions
- [ ] Tests don't have unnecessary setup
- [ ] Tests run quickly (< 1s per test ideally)
- [ ] Tests are maintainable

---

## 🏆 Quality Metrics

Track these metrics for quality assurance:

- **Test Coverage**: > 70%
- **Test Success Rate**: > 99%
- **Test Execution Time**: < 5 minutes (unit tests)
- **Flaky Tests**: < 1%
- **Code Review**: All tests reviewed before merge

---

**Last Updated**: Phase 8 Implementation
**Maintained By**: ClubCompass Development Team
