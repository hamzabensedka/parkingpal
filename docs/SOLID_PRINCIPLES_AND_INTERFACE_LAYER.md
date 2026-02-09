# Backend Development Guidelines - SOLID Principles & Architecture

## 🎯 CRITICAL REQUIREMENTS

Before you write a single line of code, read and understand these architectural requirements. This is NOT optional - these principles will make the codebase maintainable, testable, and scalable.

---

## 📐 SOLID PRINCIPLES - MANDATORY

You MUST follow **SOLID principles** throughout the entire codebase. Here's what each principle means and how to apply it:

---

### **S - Single Responsibility Principle (SRP)**

**Definition:**  
Every class, function, or module should have ONE and ONLY ONE reason to change. Each piece of code should do ONE thing well.

**What this means for you:**

#### **Controllers (Route Handlers):**
- **ONLY responsibility:** Receive HTTP request → Call service → Return HTTP response
- **Should NOT:**
  - ❌ Contain business logic
  - ❌ Directly access database
  - ❌ Hash passwords
  - ❌ Generate tokens
  - ❌ Send emails
  - ❌ Validate complex business rules

**Example responsibility:**
```
✅ CORRECT: Controller receives login request, calls AuthService.login(), returns response
❌ WRONG: Controller validates email, queries database, hashes password, generates JWT, sends email
```

#### **Services (Business Logic):**
- **ONLY responsibility:** Implement business logic for one domain (e.g., AuthService handles authentication logic)
- **Should NOT:**
  - ❌ Handle HTTP requests/responses
  - ❌ Format JSON responses
  - ❌ Know about Express.js
  - ❌ Directly hash passwords (delegate to PasswordUtil)
  - ❌ Directly send emails (delegate to EmailService)

**Example responsibility:**
```
✅ CORRECT: AuthService validates user credentials, calls PasswordUtil to verify, calls TokenUtil to generate JWT
❌ WRONG: AuthService handles HTTP response formatting, sends emails directly, formats dates for display
```

#### **Utilities:**
- **ONLY responsibility:** One specific technical task
- **Examples:**
  - PasswordUtil: ONLY hash and compare passwords
  - TokenUtil: ONLY generate and verify JWT tokens
  - EmailUtil: ONLY send emails
  - ValidationUtil: ONLY validate input formats

#### **Repositories/Models:**
- **ONLY responsibility:** Database access for one entity type
- **Should NOT:**
  - ❌ Contain business logic
  - ❌ Hash passwords
  - ❌ Send emails
  - ❌ Generate tokens

**Example responsibility:**
```
✅ CORRECT: UserRepository.findByEmail() queries database and returns user
❌ WRONG: UserRepository.findAndValidatePassword() queries database AND checks password
```

---

### **O - Open/Closed Principle (OCP)**

**Definition:**  
Software entities should be **open for extension** but **closed for modification**. You should be able to add new functionality without changing existing code.

**What this means for you:**

#### **Use Interfaces/Abstract Classes:**
When you might have multiple implementations of the same thing, define an interface first.

**Example scenarios:**

**Email Service:**
```
Problem: Today you use Gmail SMTP. Tomorrow you might use SendGrid, AWS SES, or Mailgun.

Solution: Create IEmailService interface with method sendEmail()
- GmailEmailService implements IEmailService
- SendGridEmailService implements IEmailService
- MailgunEmailService implements IEmailService

Benefit: Change email provider by swapping implementation, NO code changes in AuthService
```

**Storage Service:**
```
Problem: Today you store files locally. Tomorrow you might use AWS S3 or Google Cloud Storage.

Solution: Create IStorageService interface with methods upload(), delete(), getUrl()
- LocalStorageService implements IStorageService
- S3StorageService implements IStorageService
- GCSStorageService implements IStorageService

Benefit: Switch storage without touching any other code
```

**Payment Service (future):**
```
Problem: Might support Stripe, PayPal, or other payment providers.

Solution: Create IPaymentService interface
- StripePaymentService implements IPaymentService
- PayPalPaymentService implements IPaymentService

Benefit: Add new payment methods without changing booking logic
```

#### **How to implement:**
1. Identify things that might change (email provider, storage, payments, etc.)
2. Define interface first
3. Create concrete implementation
4. Inject implementation via constructor (Dependency Injection)

---

### **L - Liskov Substitution Principle (LSP)**

**Definition:**  
Objects of a parent class should be replaceable with objects of a child class without breaking the application. Subtypes must be substitutable for their base types.

**What this means for you:**

If you have an interface `IEmailService`, ANY implementation of it should work the same way from the caller's perspective.

**Example:**

```
IEmailService defines: sendEmail(to, subject, body) → returns Promise<boolean>

AuthService uses IEmailService and doesn't care which implementation:
- GmailEmailService.sendEmail() → returns Promise<boolean> ✅
- SendGridEmailService.sendEmail() → returns Promise<boolean> ✅
- MockEmailService.sendEmail() → returns Promise<boolean> ✅ (for testing)

If one implementation returns Promise<string> instead, it violates LSP ❌
```

**Rules:**
1. All implementations of an interface must have the same method signatures
2. All implementations must return the same types
3. All implementations should behave consistently (don't throw errors in one but return null in another)
4. If you can swap implementations and everything still works, you've done it right ✅

---

### **I - Interface Segregation Principle (ISP)**

**Definition:**  
No client should be forced to depend on methods it doesn't use. Create small, specific interfaces instead of large, general ones.

**What this means for you:**

#### **BAD Example (Violates ISP):**
```
❌ IUserService interface with 20 methods:
- register()
- login()
- logout()
- updateProfile()
- uploadPhoto()
- deleteAccount()
- verifyEmail()
- resetPassword()
- addSpot()          // Why is this in UserService?
- deleteSpot()       // Why is this in UserService?
- createBooking()    // Why is this in UserService?
- ...15 more methods

Problem: AuthController only needs login(), but must depend on all 20 methods
```

#### **GOOD Example (Follows ISP):**
```
✅ Split into focused interfaces:

IAuthService:
- register()
- login()
- logout()
- verifyEmail()
- resetPassword()
- refreshToken()

IUserProfileService:
- getProfile()
- updateProfile()
- uploadPhoto()
- deleteAccount()

ISpotService:  // Future
- createSpot()
- updateSpot()
- deleteSpot()

IBookingService:  // Future
- createBooking()
- cancelBooking()

Benefit: Each controller only depends on what it needs
```

#### **How to apply:**
1. Create small, focused interfaces (5-7 methods max)
2. Group related methods together
3. If an interface has methods for different concerns, split it
4. Controllers/Services should only depend on the interfaces they actually use

---

### **D - Dependency Inversion Principle (DIP)**

**Definition:**  
High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces). Abstractions should not depend on details. Details should depend on abstractions.

**What this means for you:**

#### **BAD Example (Violates DIP):**
```
❌ AuthService directly creates and uses GmailEmailService:

class AuthService {
  private emailService = new GmailEmailService();  // HARD DEPENDENCY
  
  async register(data) {
    // ...
    await this.emailService.sendEmail(...);  // Tightly coupled to Gmail
  }
}

Problems:
- Can't switch email providers without changing AuthService code
- Can't test AuthService without actually sending emails
- AuthService knows too much about email implementation
```

#### **GOOD Example (Follows DIP):**
```
✅ AuthService depends on IEmailService interface:

interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

class AuthService {
  constructor(private emailService: IEmailService) {}  // INJECTED
  
  async register(data) {
    // ...
    await this.emailService.sendEmail(...);  // Works with ANY implementation
  }
}

// Somewhere in your app setup (dependency injection):
const emailService = new GmailEmailService();  // Or SendGridEmailService, or MockEmailService
const authService = new AuthService(emailService);

Benefits:
- Swap email providers by changing ONE line
- Test with MockEmailService (no real emails sent)
- AuthService doesn't know or care about email implementation details
```

#### **How to implement Dependency Injection:**

**1. Constructor Injection (Preferred):**
```
class AuthService {
  constructor(
    private emailService: IEmailService,
    private tokenUtil: ITokenUtil,
    private passwordUtil: IPasswordUtil
  ) {}
}

// Usage:
const authService = new AuthService(
  new GmailEmailService(),
  new JWTTokenUtil(),
  new BcryptPasswordUtil()
);
```

**2. Create a Dependency Injection Container:**
```
File: src/container.ts

Purpose: Central place to create and wire up all dependencies

Benefits:
- Change implementations in ONE place
- Easy to swap for testing
- Clear dependency graph
```

---

## 🏛️ MANDATORY INTERFACE LAYER (Frontend ↔ Backend)

**CRITICAL REQUIREMENT:** You MUST create a clean separation between frontend and backend using shared type definitions.

---

### **The Problem We're Solving:**

Without an interface layer:
```
❌ Frontend makes API call: fetch('/api/auth/login')
❌ Backend returns: { user: {...}, token: "..." }
❌ Frontend developer guesses the response structure
❌ Backend developer changes response structure
❌ Frontend breaks, no one knows until runtime error
❌ TypeScript can't help because types don't match
```

With an interface layer:
```
✅ Shared types define contract
✅ Frontend uses types: LoginResponse
✅ Backend uses types: LoginResponse
✅ If backend changes response, TypeScript error immediately
✅ Both sides always in sync
✅ Auto-completion in both frontend and backend
```

---

### **What You Must Create:**

#### **1. Shared Types Package:**

Create a separate package/folder for shared types that BOTH frontend and backend import:

```
Project Structure:

parkingpal-monorepo/
├── frontend/ (React Native app)
├── backend/ (Node.js API)
└── shared-types/  ← THIS IS THE INTERFACE LAYER
    ├── package.json
    ├── src/
    │   ├── auth/
    │   │   ├── auth.types.ts       # Auth request/response types
    │   │   ├── user.types.ts       # User entity types
    │   │   └── index.ts
    │   ├── spot/                   # Future
    │   ├── booking/                # Future
    │   ├── common/
    │   │   ├── api.types.ts        # Common API response structure
    │   │   ├── error.types.ts      # Error response types
    │   │   └── pagination.types.ts # Pagination types
    │   └── index.ts
    └── tsconfig.json
```

#### **2. Define ALL Request/Response Types:**

**For EVERY API endpoint, define:**
- Request body type (what frontend sends)
- Response type (what backend returns)
- Error types (what backend returns on error)

**Example for Authentication:**

**File: shared-types/src/auth/auth.types.ts**

Must include types for:

**Register Request:**
```
RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  userType: 'renter' | 'host' | 'both'
}
```

**Register Response:**
```
RegisterResponse {
  success: boolean
  message: string
  data: {
    user: UserDTO
    tokens: TokensDTO
  }
}
```

**Login Request:**
```
LoginRequest {
  email: string
  password: string
}
```

**Login Response:**
```
LoginResponse {
  success: boolean
  message: string
  data: {
    user: UserDTO
    tokens: TokensDTO
  }
}
```

**And so on for ALL 11 endpoints...**

#### **3. Define Data Transfer Objects (DTOs):**

**DTOs** = Data that crosses the network boundary (frontend ↔ backend)

**Important:** DTOs are NOT the same as database models!

**UserDTO (what frontend sees):**
```
UserDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  profilePhoto: string | null
  phone: string | null
  userType: 'renter' | 'host' | 'both'
  emailVerified: boolean
  phoneVerified: boolean
  idVerified: boolean
  rating: number
  reviewCount: number
  isSuperhost: boolean
  createdAt: string  // ISO date string
}

Note: EXCLUDES sensitive data like password, passwordResetToken, etc.
```

**TokensDTO:**
```
TokensDTO {
  accessToken: string
  refreshToken: string
  expiresIn: number  // seconds
}
```

**User Database Model (what backend has internally):**
```
User {
  id: string
  email: string
  password: string  ← NOT in DTO (sensitive)
  firstName: string
  lastName: string
  passwordResetToken: string | null  ← NOT in DTO (sensitive)
  passwordResetExpires: Date | null  ← NOT in DTO (sensitive)
  refreshToken: string | null  ← NOT in DTO (sensitive)
  // ... all fields including sensitive ones
}
```

**Key Difference:**
- **Database Model:** Has ALL fields including sensitive data
- **DTO:** Only has fields safe to send to frontend
- **Service layer:** Transforms User → UserDTO before sending to controller

#### **4. Standardized API Response Structure:**

**ALL API responses must follow this structure:**

**Success Response:**
```
ApiSuccessResponse<T> {
  success: true
  message: string
  data: T
}

Example:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ...UserDTO },
    "tokens": { ...TokensDTO }
  }
}
```

**Error Response:**
```
ApiErrorResponse {
  success: false
  error: string
  details?: Record<string, string>  // Validation errors
  code?: string  // Error code for client handling
}

Example (Validation Error):
{
  "success": false,
  "error": "Validation Error",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  },
  "code": "VALIDATION_ERROR"
}

Example (Authentication Error):
{
  "success": false,
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

#### **5. How Frontend Uses These Types:**

**Frontend API Service:**
```typescript
File: frontend/src/services/authApi.ts

Import shared types:
import { 
  RegisterRequest, 
  RegisterResponse, 
  LoginRequest, 
  LoginResponse 
} from '@parkingpal/shared-types';

Type-safe API calls:
async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return await response.json();  // TypeScript knows this is RegisterResponse
}

async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return await response.json();  // TypeScript knows this is LoginResponse
}
```

**Frontend Usage:**
```typescript
// React Native component
const handleLogin = async () => {
  const request: LoginRequest = {  // Type-safe
    email: email,
    password: password
  };
  
  const response: LoginResponse = await authApi.login(request);  // Type-safe
  
  if (response.success) {
    const user = response.data.user;  // Auto-completion works!
    console.log(user.firstName);  // TypeScript knows this field exists
  }
};
```

#### **6. How Backend Uses These Types:**

**Backend Controller:**
```typescript
File: backend/src/modules/auth/auth.controller.ts

Import shared types:
import { 
  RegisterRequest, 
  RegisterResponse, 
  LoginRequest, 
  LoginResponse 
} from '@parkingpal/shared-types';

async register(req: Request, res: Response) {
  const input: RegisterRequest = req.body;  // Type-safe input
  
  const result = await authService.register(input);
  
  const response: RegisterResponse = {  // Type-safe output
    success: true,
    message: 'Account created',
    data: result
  };
  
  res.status(201).json(response);
}
```

**Backend Service:**
```typescript
File: backend/src/modules/auth/auth.service.ts

Returns type that matches DTO:

async register(input: RegisterRequest): Promise<{ user: UserDTO, tokens: TokensDTO }> {
  // ... business logic
  
  // Transform database User to UserDTO (exclude sensitive fields)
  const userDTO: UserDTO = this.toUserDTO(user);
  
  return { user: userDTO, tokens };
}

private toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePhoto: user.profilePhoto,
    phone: user.phone,
    userType: user.userType,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    idVerified: user.idVerified,
    rating: user.rating,
    reviewCount: user.reviewCount,
    isSuperhost: user.isSuperhost,
    createdAt: user.createdAt.toISOString()
    // NOTE: password, tokens, etc. are NOT included
  };
}
```

---

### **Benefits of Interface Layer:**

1. ✅ **Type Safety Across Boundary:**
   - Frontend knows exact shape of API responses
   - Backend knows exact shape of API requests
   - Compile-time errors if they don't match

2. ✅ **Auto-Completion:**
   - Frontend gets auto-completion for all API response fields
   - No more guessing field names

3. ✅ **Refactoring Safety:**
   - Change API response structure → TypeScript errors in frontend immediately
   - Can't break frontend by accident

4. ✅ **Documentation:**
   - Types serve as API documentation
   - Frontend dev knows exactly what to expect

5. ✅ **Easier Testing:**
   - Mock API responses with correct types
   - Tests fail if types change

6. ✅ **Security:**
   - Forces you to think about what data to expose
   - Clear separation between internal models and public DTOs
   - Can't accidentally leak sensitive fields (password, tokens, etc.)

---

## 🏗️ COMPLETE ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React Native)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Components (UI)                                   │    │
│  │  - LoginScreen                                     │    │
│  │  - RegisterScreen                                  │    │
│  └─────────────┬──────────────────────────────────────┘    │
│                │ uses                                        │
│  ┌─────────────▼──────────────────────────────────────┐    │
│  │  API Services (Type-safe)                          │    │
│  │  - authApi.ts                                      │    │
│  │  - spotApi.ts (future)                             │    │
│  │                                                     │    │
│  │  Imports: LoginRequest, LoginResponse, UserDTO    │    │
│  └─────────────┬──────────────────────────────────────┘    │
│                │ HTTP Request                                │
└────────────────┼─────────────────────────────────────────────┘
                 │
                 │ ┌───────────────────────────────────────┐
                 │ │   SHARED TYPES PACKAGE                │
                 ├─│   (Interface Layer)                   │
                 │ │                                       │
                 │ │   - auth.types.ts                     │
                 │ │   - user.types.ts                     │
                 │ │   - api.types.ts                      │
                 │ │   - error.types.ts                    │
                 │ │                                       │
                 │ │   Imported by BOTH frontend & backend│
                 │ └───────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────────┐
│                     BACKEND (Node.js)                         │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Controllers (HTTP Layer) - THIN                   │     │
│  │  - Receive request                                 │     │
│  │  - Call service                                    │     │
│  │  - Return response                                 │     │
│  │                                                     │     │
│  │  Responsibility: HTTP only, NO business logic     │     │
│  └─────────────┬──────────────────────────────────────┘     │
│                │ calls                                        │
│  ┌─────────────▼──────────────────────────────────────┐     │
│  │  Services (Business Logic) - CORE                  │     │
│  │  - AuthService                                     │     │
│  │  - UserProfileService                              │     │
│  │  - SpotService (future)                            │     │
│  │  - BookingService (future)                         │     │
│  │                                                     │     │
│  │  Responsibility: Business rules, orchestration    │     │
│  │  Dependencies: Injected via constructor (DIP)     │     │
│  └────┬────────┬─────────┬──────────────────────────┘      │
│       │        │         │ uses (via interfaces)            │
│  ┌────▼───┐ ┌─▼────┐ ┌──▼──────┐                          │
│  │Password│ │Token │ │  Email  │  Utilities (Technical)   │
│  │Util    │ │Util  │ │ Service │                          │
│  │(bcrypt)│ │(JWT) │ │(Nodema.)│  Single responsibility   │
│  └────────┘ └──────┘ └─────────┘                          │
│                │                                             │
│  ┌─────────────▼──────────────────────────────────────┐    │
│  │  Repository Layer (Database Access)                │    │
│  │  - UserRepository                                  │    │
│  │  - SpotRepository (future)                         │    │
│  │  - BookingRepository (future)                      │    │
│  │                                                     │    │
│  │  Responsibility: CRUD operations only              │    │
│  └─────────────┬──────────────────────────────────────┘    │
│                │ queries                                     │
│  ┌─────────────▼──────────────────────────────────────┐    │
│  │  Database (PostgreSQL)                             │    │
│  │  - users table                                     │    │
│  │  - spots table (future)                            │    │
│  │  - bookings table (future)                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

KEY PRINCIPLES APPLIED:
- SRP: Each layer has ONE responsibility
- OCP: Interfaces allow swapping implementations
- LSP: All implementations honor contracts
- ISP: Small, focused interfaces
- DIP: Dependencies injected, depend on abstractions
- INTERFACE LAYER: Shared types enforce contract
```

---

## ✅ IMPLEMENTATION CHECKLIST

Before you start coding, ensure you understand:

**SOLID Principles:**
- [ ] I understand Single Responsibility Principle
- [ ] I will create ONE class/function per responsibility
- [ ] Controllers will ONLY handle HTTP, NO business logic
- [ ] Services will ONLY handle business logic, NO HTTP
- [ ] Utilities will do ONE technical thing each
- [ ] I understand Open/Closed Principle
- [ ] I will create interfaces for things that might change
- [ ] Email, Storage, Payment will have interfaces
- [ ] I understand Liskov Substitution Principle
- [ ] All implementations of an interface will behave consistently
- [ ] I understand Interface Segregation Principle
- [ ] I will create small, focused interfaces (5-7 methods max)
- [ ] I won't create giant interfaces with 20+ methods
- [ ] I understand Dependency Inversion Principle
- [ ] I will use constructor injection for dependencies
- [ ] Services will depend on interfaces, not concrete classes
- [ ] I will create a dependency injection container

**Interface Layer:**
- [ ] I will create shared-types package
- [ ] I will define ALL request types (11 endpoints)
- [ ] I will define ALL response types (11 endpoints)
- [ ] I will define ALL DTOs (UserDTO, TokensDTO, etc.)
- [ ] I will define standardized ApiSuccessResponse<T>
- [ ] I will define standardized ApiErrorResponse
- [ ] Frontend will import these types
- [ ] Backend will import these types
- [ ] I will create toUserDTO() method to transform User → UserDTO
- [ ] I will NEVER send sensitive data (password, tokens) to frontend
- [ ] All API responses will follow standard structure

**Code Organization:**
- [ ] Controllers are thin (just HTTP handling)
- [ ] Services contain business logic
- [ ] Repositories handle database access
- [ ] Utilities do ONE technical thing
- [ ] Dependencies are injected via constructor
- [ ] Interfaces defined for swappable components

---

## 🚫 ANTI-PATTERNS TO AVOID

**Don't do these:**

1. ❌ **Fat Controllers:**
```
Controller with 500 lines doing everything:
- HTTP handling
- Validation
- Business logic
- Database queries
- Email sending
- Token generation
```

2. ❌ **God Objects:**
```
One giant "UserService" with 30 methods doing everything
```

3. ❌ **No Interfaces:**
```
AuthService directly creates new GmailEmailService()
Can't swap or test!
```

4. ❌ **No Separation of Concerns:**
```
Business logic mixed with HTTP code
Can't test without spinning up HTTP server
```

5. ❌ **Leaking Sensitive Data:**
```
Sending entire User object to frontend including:
- password hash
- passwordResetToken
- refreshToken
```

6. ❌ **No Shared Types:**
```
Frontend guesses API response structure
Backend changes response
Frontend breaks silently
```

7. ❌ **Inconsistent API Responses:**
```
Some endpoints return { success: true, data: {...} }
Other endpoints return { user: {...} }
No standard structure
```

---

## 🎯 SUCCESS CRITERIA

Your implementation is correct when:

**SOLID Principles:**
- ✅ Each class has ONE clear responsibility
- ✅ Can swap email service without changing AuthService code
- ✅ All interface implementations are interchangeable
- ✅ Interfaces are small and focused
- ✅ All dependencies are injected via constructor
- ✅ No "new" keyword in services (except in container)

**Interface Layer:**
- ✅ shared-types package exists with all types
- ✅ Frontend imports types from shared-types
- ✅ Backend imports types from shared-types
- ✅ All 11 endpoints have defined request/response types
- ✅ All API responses follow standard structure
- ✅ DTOs exclude sensitive fields
- ✅ TypeScript auto-completion works in frontend for all API calls

**Architecture:**
- ✅ Controllers are thin (20-50 lines each)
- ✅ Services contain business logic (100-300 lines each)
- ✅ Repositories only do database access
- ✅ Utilities do ONE thing (50-100 lines each)
- ✅ Clear separation of layers
- ✅ Easy to test (can mock dependencies)

---

## 📚 RESOURCES

**SOLID Principles:**
- https://en.wikipedia.org/wiki/SOLID
- https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design

**Dependency Injection:**
- https://www.typescriptlang.org/docs/handbook/2/classes.html#constructor-functions
- https://inversify.io/ (DI library for TypeScript)

**DTOs:**
- https://en.wikipedia.org/wiki/Data_transfer_object

**Clean Architecture:**
- https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

---

## 🎬 NOW BUILD IT

You now understand:
- ✅ SOLID principles and how to apply them
- ✅ Why and how to create an interface layer
- ✅ How to structure the codebase properly
- ✅ What NOT to do

Now implement the authentication system following these principles. Make it:
- ✅ Maintainable (SOLID)
- ✅ Testable (Dependency Injection)
- ✅ Type-safe (Interface Layer)
- ✅ Scalable (Clear separation of concerns)

**This architecture will serve you for the entire application, not just auth.** Get it right now! 🚀
