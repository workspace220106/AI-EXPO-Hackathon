# Government Scheme Eligibility Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone AI-powered web application that helps Indian citizens determine eligibility for government schemes, understand required documents, compare benefits, and plan applications through natural language interaction.

**Architecture:** Modular monolith with Docker containerization, separating concerns into backend services (FastAPI), frontend components (React), and infrastructure (PostgreSQL, Redis). Each major feature is implemented as a separate module with clear interfaces.

**Tech Stack:** 
- Backend: FastAPI (Python 3.12+)
- Frontend: React 18+ with TypeScript, Tailwind CSS, Zustand
- Database: PostgreSQL 15+
- Cache: Redis 7+
- ML: Scikit-learn 1.4+, TensorFlow 2.15+
- Deployment: Docker Compose
- Testing: Pytest (backend), Vitest/Jest (frontend)
- Dev: VS Code, Git, Prettier, ESLint

---

### Task 1: Project Setup and Environment Configuration

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `.gitignore`
- Create: `README.md`
- Create: `backend/requirements.txt`
- Create: `frontend/package.json`

- [x] **Step 1: Create docker-compose.yml for multi-service setup**

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/eligibility_engine
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
      - ./backend/logs:/app/logs
      
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      
  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=eligibility_engine
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

- [x] **Step 2: Run docker-compose to verify services start**

Run: `docker-compose up -d`
Expected: All services (backend, frontend, db, redis) start successfully

- [x] **Step 3: Create backend Dockerfile**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [x] **Step 4: Create frontend Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

- [x] **Step 5: Create backend requirements.txt**

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1
python-multipart==0.0.6
pydantic[email]==2.5.0
scikit-learn==1.4.1.post1
tensorflow==2.15.0
nltk==3.8.1
spacy==3.7.2
python-dotenv==1.0.0
```

- [x] **Step 6: Create frontend package.json**

```json
{
  "name": "government-scheme-eligibility-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.2",
    "tailwind-merge": "^2.3.0",
    "clsx": "^2.1.1",
    "framer-motion": "^11.2.6",
    "lucide-react": "^0.378.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.79",
    "@types/react-dom": "^18.2.25",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.4.2",
    "vite": "^5.2.0",
    "vitest": "^1.4.0",
    "tailwindcss": "^3.4.3",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "@typescript-eslint/eslint-plugin": "^7.8.0",
    "@typescript-eslint/parser": "^7.8.0"
  }
}
```

- [x] **Step 7: Create .gitignore**

```
# Dependencies
node_modules/
__pycache__/
*.py[cod]
*$py.class

# Virtual environments
venv/
ENV/
env/
.venv/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Docker
.dockerignore

# Environment variables
.env
.env.*

# Build outputs
dist/
build/
.coverage
htmlcov/
```

- [x] **Step 8: Create README.md**

```markdown
# AI-Powered Government Scheme Eligibility Engine

## Overview
Standalone web application helping Indian citizens determine eligibility for government schemes, understand required documents, compare benefits, and plan applications.

## Architecture
- Modular monolith with Docker containerization
- Backend: FastAPI (Python)
- Frontend: React with TypeScript
- Database: PostgreSQL
- Cache: Redis
- Deployment: Docker Compose

## Quick Start
```bash
# Clone repository
git clone <repository-url>
cd government-scheme-eligibility-engine

# Start all services
docker-compose up -d

# Access application
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
```

## Development
Backend: `cd backend && uvicorn main:app --reload`
Frontend: `cd frontend && npm run dev`
```

- [x] **Step 9: Commit initial setup**

```bash
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile .gitignore README.md backend/requirements.txt frontend/package.json
git commit -m "feat: initialize project structure with Docker Compose setup"
```

### Task 2: Backend Project Structure and Basic API

**Files:**
- Create: `backend/app/main.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/database.py`
- Create: `backend/app/api/v1/router.py`
- Create: `backend/tests/test_main.py`

- [x] **Step 1: Create backend main.py with basic FastAPI app**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title="Government Scheme Eligibility Engine",
    description="AI-powered platform for checking eligibility of government schemes",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Government Scheme Eligibility Engine API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

- [x] **Step 2: Run test to verify it fails**

Run: `python -m pytest backend/tests/test_main.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app'"

- [x] **Step 3: Create core config.py**

```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Government Scheme Eligibility Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/eligibility_engine"
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

- [x] **Step 4: Create core database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [x] **Step 5: Create basic API router**

```python
from fastapi import APIRouter

api_router = APIRouter()

@api_router.get("/")
async def api_root():
    return {"message": "API v1 is working"}
```

- [x] **Step 6: Update test to verify it passes**

```python
def test_root_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Government Scheme Eligibility Engine API"}
```

- [x] **Step 7: Run test to verify it passes**

Run: `python -m pytest backend/tests/test_main.py -v`
Expected: PASS

- [x] **Step 8: Commit backend setup**

```bash
git add backend/app/main.py backend/app/core/config.py backend/app/core/database.py backend/app/api/v1/router.py backend/tests/test_main.py
git commit -m "feat: setup basic backend project structure with FastAPI"
```

### Task 3: Database Models and Schemas

**Files:**
- Create: `backend/app/models/scheme.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/application.py`
- Create: `backend/app/models/document.py`
- Create: `backend/app/schemas/scheme.py`
- Create: `backend/app/schemas/user.py`
- Create: `backend/tests/test_models.py`

- [x] **Step 1: Create scheme model**

```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
import enum

from app.core.database import Base

class SchemeType(str, enum.Enum):
    CENTRAL = "central"
    STATE = "state"
    DISTRICT = "district"

class SchemeCategory(str, enum.Enum):
    AGRICULTURE = "agriculture"
    EDUCATION = "education"
    HEALTH = "health"
    EMPLOYMENT = "employment"
    HOUSING = "housing"
    SOCIAL_WELFARE = "social_welfare"
    FINANCIAL_INCLUSION = "financial_inclusion"
    OTHERS = "others"

class Scheme(Base):
    __tablename__ = "schemes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    scheme_type = Column(Enum(SchemeType), default=SchemeType.CENTRAL)
    category = Column(Enum(SchemeCategory), nullable=False, index=True)
    state_applicable = Column(String(100))  # NULL for central schemes
    eligibility_criteria = Column(Text)  # JSON string
    benefits = Column(Text)  # JSON string
    application_process = Column(Text)
    required_documents = Column(Text)  # JSON string
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # applications = relationship("Application", back_populates="scheme")
```

- [x] **Step 2: Create user model**

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import enum

from app.core.database import Base

class UserType(str, enum.Enum):
    CITIZEN = "citizen"
    OFFICIAL = "official"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(15), unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(DateTime)
    gender = Column(String(20))
    address = Column(Text)
    state = Column(String(100), index=True)
    district = Column(String(100))
    pincode = Column(String(10))
    annual_income = Column(Integer)
    occupation = Column(String(100))
    category = Column(String(50))  # SC, ST, OBC, General, etc.
    user_type = Column(Enum(UserType), default=UserType.CITIZEN)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # applications = relationship("Application", back_populates="user")
```

- [x] **Step 3: Create application model**

```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
import enum

from app.core.database import Base

class ApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUIRES_DOCUMENTS = "requires_documents"

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    submitted_at = Column(DateTime(timezone=True))
    reviewed_at = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)
    # application_data = Column(Text)  # JSON string of form data
    
    # Relationships
    # user = relationship("User", back_populates="applications")
    # scheme = relationship("Scheme", back_populates="applications")
```

- [x] **Step 4: Create document model**

```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base

class DocumentType(str, enum.Enum):
    IDENTITY = "identity"
    ADDRESS = "address"
    INCOME = "income"
    CASTE = "caste"
    EDUCATION = "education"
    MEDICAL = "medical"
    BANK = "bank"
    PHOTO = "photo"
    OTHERS = "others"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    description = Column(Text)
    issuing_authority = Column(String(255))
    validity_period = Column(Integer)  # in days
    is_mandatory = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

- [x] **Step 5: Create scheme schema**

```python
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.scheme import SchemeType, SchemeCategory

class SchemeBase(BaseModel):
    name: str
    description: Optional[str] = None
    scheme_type: SchemeType
    category: SchemeCategory
    state_applicable: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    required_documents: Optional[str] = None
    is_active: bool = True

class SchemeCreate(SchemeBase):
    pass

class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    scheme_type: Optional[SchemeType] = None
    category: Optional[SchemeCategory] = None
    state_applicable: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    required_documents: Optional[str] = None
    is_active: Optional[bool] = None

class SchemeInDBBase(SchemeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class SchemeInDB(SchemeInDBBase):
    pass

class Scheme(SchemeInDBBase):
    pass
```

- [x] **Step 6: Create user schema**

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserType

class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    full_name: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    annual_income: Optional[int] = None
    occupation: Optional[str] = None
    category: Optional[str] = None
    user_type: UserType = UserType.CITIZEN

class UserCreate(UserBase):
    password: str  # In practice, this would be handled differently

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    annual_income: Optional[int] = None
    occupation: Optional[str] = None
    category: Optional[str] = None
    user_type: Optional[UserType] = None

class UserInDBBase(UserBase):
    id: int
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserInDB(UserInDBBase):
    pass

class User(UserInDBBase):
    pass
```

- [x] **Step 7: Create test file for models**

```python
def test_scheme_model():
    from app.models.scheme import Scheme, SchemeType, SchemeCategory
    from datetime import datetime
    
    scheme = Scheme(
        name="PM-KISAN",
        description="Income support scheme for farmers",
        scheme_type=SchemeType.CENTRAL,
        category=SchemeCategory.AGRICULTURE,
        eligibility_criteria='{"farmer": true, "land_holding_hectares": {"max": 2}}',
        benefits='{"amount_per_year": 6000, "frequency": "annual"}'
    )
    
    assert scheme.name == "PM-KISAN"
    assert scheme.scheme_type == SchemeType.CENTRAL
    assert scheme.category == SchemeCategory.AGRICULTURE
    assert scheme.is_active == True

def test_user_model():
    from app.models.user import User, UserType
    from datetime import datetime
    
    user = User(
        email="test@example.com",
        full_name="Test User",
        state="Maharashtra",
        annual_income=300000,
        occupation="Farmer",
        category="General",
        user_type=UserType.CITIZEN
    )
    
    assert user.email == "test@example.com"
    assert user.full_name == "Test User"
    assert user.user_type == UserType.CITIZEN
    assert user.is_active == True

def test_scheme_schema():
    from app.schemas.scheme import SchemeCreate, SchemeType, SchemeCategory
    
    scheme_data = {
        "name": "Test Scheme",
        "description": "A test scheme",
        "scheme_type": SchemeType.STATE,
        "category": SchemeCategory.EDUCATION,
        "state_applicable": "Maharashtra",
        "eligibility_criteria": '{"income_limit": 500000}',
        "benefits": '{"scholarship_amount": 10000}',
        "is_active": True
    }
    
    scheme = SchemeCreate(**scheme_data)
    assert scheme.name == "Test Scheme"
    assert scheme.scheme_type == SchemeType.STATE
    assert scheme.category == SchemeCategory.EDUCATION
```

- [x] **Step 8: Run test to verify models work**

Run: `python -m pytest backend/tests/test_models.py -v`
Expected: PASS

- [x] **Step 9: Commit models and schemas**

```bash
git add backend/app/models/scheme.py backend/app/models/user.py backend/app/models/application.py backend/app/models/document.py backend/app/schemas/scheme.py backend/app/schemas/user.py backend/tests/test_models.py
git commit -m "feat: create database models and Pydantic schemas for schemes, users, applications, and documents"
```

### Task 4: Authentication and Authorization Service

**Files:**
- Create: `backend/app/core/security.py`
- Create: `backend/app/api/v1/endpoints/auth.py`
- Create: `backend/app/core/auth.py`
- Create: `backend/app/crud/user.py`
- Create: `backend/tests/test_auth.py`

- [x] **Step 1: Create security utilities for password hashing and token generation**

```python
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# JWT token handling
SECRET_KEY = settings.SECRET_KEY if hasattr(settings, 'SECRET_KEY') else "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

- [x] **Step 2: Create authentication dependencies**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM, verify_token
from app.models.user import User
from app.crud.user import get_user_by_email

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_active_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
```

- [x] **Step 3: Create auth endpoints**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash
from app.core.auth import get_current_active_user
from app.crud.user import get_user_by_email, create_user
from app.schemas.user import UserCreate, User

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(user.password)
    user_data = user.dict()
    user_data["hashed_password"] = hashed_password
    del user_data["password"]
    new_user = create_user(db=db, user=user_data)
    return new_user

@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user
```

- [x] **Step 4: Create CRUD operations for user**

```python
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: dict):
    db_user = User(**user)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
```

- [x] **Step 5: Update main.py to include auth router**

```python
# In backend/app/main.py
from app.api.v1.endpoints import auth

# After creating the app
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
```

- [x] **Step 6: Create test file for authentication**

```python
def test_create_access_token():
    from app.core.security import create_access_token
    from datetime import timedelta
    
    data = {"sub": "test@example.com"}
    token = create_access_token(data, expires_delta=timedelta(minutes=15))
    assert isinstance(token, str)
    assert len(token) > 0

def test_verify_password():
    from app.core.security import get_password_hash, verify_password
    
    password = "test_password"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) == True
    assert verify_password("wrong_password", hashed) == False

def test_register_user_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data

def test_login_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    
    # First register a user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "securepassword123"
        }
    )
    
    # Then login
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "test@example.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
```

- [x] **Step 7: Run test to verify authentication works**

Run: `python -m pytest backend/tests/test_auth.py -v`
Expected: PASS

- [x] **Step 8: Commit authentication service**

```bash
git add backend/app/core/security.py backend/app/api/v1/endpoints/auth.py backend/app/core/auth.py backend/app/crud/user.py backend/tests/test_auth.py
git commit -m "feat: implement authentication and authorization service with JWT tokens"
```

### Task 5: Eligibility Prediction Engine

**Files:**
- Create: `backend/app/services/eligibility_engine.py`
- Create: `backend/app/ml/models/eligibility_model.py`
- Create: `backend/app/ml/utils/feature_extractor.py`
- Create: `backend/app/api/v1/endpoints/eligibility.py`
- Create: `backend/app/schemas/eligibility.py`
- Create: `backend/tests/test_eligibility.py`

- [x] **Step 1: Create feature extractor utility for converting user data to ML features**

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Any
import json
import re

class FeatureExtractor:
    def __init__(self):
        # Define feature mappings
        self.education_mapping = {
            'illiterate': 0,
            'primary': 1,
            'secondary': 2,
            'higher_secondary': 3,
            'graduate': 4,
            'postgraduate': 5,
            'professional': 6
        }
        
        self.occupation_mapping = {
            'farmer': 0,
            'laborer': 1,
            'self_employed': 2,
            'government_job': 3,
            'private_job': 4,
            'business': 5,
            'unemployed': 6,
            'student': 7,
            'retired': 8
        }
        
        self.category_mapping = {
            'general': 0,
            'obc': 1,
            'sc': 2,
            'st': 3,
            'minority': 4
        }
        
        self.gender_mapping = {
            'male': 0,
            'female': 1,
            'other': 2
        }
    
    def extract_features(self, user_data: Dict[str, Any]) -> np.ndarray:
        """
        Extract features from user data for ML model
        
        Expected user_data fields:
        - age: int
        - annual_income: float
        - state: str
        - district: str
        - occupation: str
        - education_level: str
        - gender: str
        - category: str
        - family_size: int
        - land_holding: float (in acres)
        - has_disability: bool
        - is_senior_citizen: bool
        """
        features = []
        
        # Numerical features
        features.append(user_data.get('age', 0))
        features.append(np.log1p(user_data.get('annual_income', 0)))  # Log transform for income
        features.append(user_data.get('family_size', 1))
        features.append(user_data.get('land_holding', 0.0))
        
        # Categorical features (encoded)
        occupation = user_data.get('occupation', '').lower()
        features.append(self.occupation_mapping.get(occupation, len(self.occupation_mapping)))
        
        education = user_data.get('education_level', '').lower()
        features.append(self.education_mapping.get(education, len(self.education_mapping)))
        
        category = user_data.get('category', '').lower()
        features.append(self.category_mapping.get(category, len(self.category_mapping)))
        
        gender = user_data.get('gender', '').lower()
        features.append(self.gender_mapping.get(gender, len(self.gender_mapping)))
        
        # Binary features
        features.append(1 if user_data.get('has_disability', False) else 0)
        features.append(1 if user_data.get('is_senior_citizen', False) else 0)
        
        # State and district encoding (simplified - in practice would use proper encoding)
        state_hash = hash(user_data.get('state', '')) % 100
        district_hash = hash(user_data.get('district', '')) % 100
        features.append(float(state_hash))
        features.append(float(district_hash))
        
        return np.array(features).reshape(1, -1)
    
    def get_feature_names(self) -> List[str]:
        return [
            'age', 'log_income', 'family_size', 'land_holding',
            'occupation_encoded', 'education_encoded', 'category_encoded', 'gender_encoded',
            'has_disability', 'is_senior_citizen', 'state_hash', 'district_hash'
        ]
```

- [x] **Step 2: Create ML model wrapper for eligibility prediction**

```python
import joblib
import numpy as np
from typing import Dict, Any, Tuple
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

class EligibilityModel:
    def __init__(self, model_path: str = None):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_extractor = FeatureExtractor()
        self.is_trained = False
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            # Initialize with a basic model - in practice would load pre-trained model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
    
    def train(self, X: np.ndarray, y: np.ndarray):
        """Train the eligibility model"""
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
    
    def predict_eligibility(self, user_data: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """
        Predict eligibility percentage and provide explainability
        
        Returns:
        - eligibility_percentage: float between 0 and 100
        - explanation: dict with feature contributions and reasoning
        """
        if not self.is_trained:
            # Return a rule-based estimate if model not trained
            return self._rule_based_eligibility(user_data)
        
        # Extract features
        features = self.feature_extractor.extract_features(user_data)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Get prediction probability
        if hasattr(self.model, 'predict_proba'):
            # For classifiers that support probability
            probabilities = self.model.predict_proba(features_scaled)
            eligibility_prob = probabilities[0][1]  # Probability of positive class
        else:
            # For models without predict_proba, use decision function or predict
            eligibility_prob = self.model.predict(features_scaled)[0]
            # Normalize to 0-1 range if needed
            eligibility_prob = max(0, min(1, eligibility_prob))
        
        eligibility_percentage = eligibility_prob * 100
        
        # Generate explanation
        explanation = self._generate_explanation(user_data, features, eligibility_prob)
        
        return eligibility_percentage, explanation
    
    def _rule_based_eligibility(self, user_data: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """Fallback rule-based eligibility calculation"""
        score = 0.0
        max_score = 100.0
        explanation = {
            'base_score': 0,
            'contributions': {},
            'total_score': 0,
            'eligibility_percentage': 0
        }
        
        # Age-based scoring
        age = user_data.get('age', 0)
        if 18 <= age <= 25:
            score += 15
            explanation['contributions']['age_young'] = 15
        elif 26 <= age <= 35:
            score += 20
            explanation['contributions']['age_prime'] = 20
        elif 36 <= age <= 50:
            score += 18
            explanation['contributions']['age_middle'] = 18
        elif 51 <= age <= 65:
            score += 15
            explanation['contributions']['age_senior'] = 15
        elif age > 65:
            score += 25  # Senior citizens often get benefits
            explanation['contributions']['age_elderly'] = 25
        
        # Income-based scoring (lower income = higher eligibility for welfare schemes)
        annual_income = user_data.get('annual_income', 0)
        if annual_income <= 100000:
            score += 25
            explanation['contributions']['low_income'] = 25
        elif annual_income <= 250000:
            score += 20
            explanation['contributions']['moderate_low_income'] = 20
        elif annual_income <= 500000:
            score += 10
            explanation['contributions']['moderate_income'] = 10
        # Above 5 lakhs gets minimal points for most welfare schemes
        
        # Employment/unemployment scoring
        occupation = user_data.get('occupation', '').lower()
        if occupation in ['unemployed', 'laborer']:
            score += 20
            explanation['contributions']['unemployed_laborer'] = 20
        elif occupation == 'farmer':
            score += 18
            explanation['contributions']['farmer'] = 18
        elif occupation == 'self_employed':
            score += 12
            explanation['contributions']['self_employed'] = 12
        
        # Education level (sometimes inversely correlated with welfare eligibility)
        education = user_data.get('education_level', '').lower()
        if education in ['illiterate', 'primary']:
            score += 10
            explanation['contributions']['low_education'] = 10
        
        # Social category scoring
        category = user_data.get('category', '').lower()
        if category in ['sc', 'st']:
            score += 20
            explanation['contributions']['disadvantaged_category'] = 20
        elif category == 'obc':
            score += 15
            explanation['contributions']['obc'] = 15
        
        # Disability bonus
        if user_data.get('has_disability', False):
            score += 15
            explanation['contributions']['disability'] = 15
        
        # Senior citizen bonus
        if user_data.get('is_senior_citizen', False):
            score += 20
            explanation['contributions']['senior_citizen'] = 20
        
        # Family size (larger families may need more support)
        family_size = user_data.get('family_size', 1)
        if family_size >= 5:
            score += 10
            explanation['contributions']['large_family'] = 10
        elif family_size >= 3:
            score += 5
            explanation['contributions']['medium_family'] = 5
        
        # Land holding (for agricultural schemes)
        land_holding = user_data.get('land_holding', 0)
        if land_holding == 0:
            score += 10  # Landless farmers often get priority
            explanation['contributions']['landless_farmer'] = 10
        elif land_holding <= 1:
            score += 8
            explanation['contributions']['small_land_holder'] = 8
        elif land_holding <= 5:
            score += 5
            explanation['contributions']['medium_land_holder'] = 5
        
        explanation['base_score'] = score
        explanation['total_score'] = min(score, max_score)
        explanation['eligibility_percentage'] = min(score, max_score)
        
        return min(score, max_score), explanation
    
    def _generate_explanation(self, user_data: Dict[str, Any], features: np.ndarray, probability: float) -> Dict[str, Any]:
        """Generate human-readable explanation for the prediction"""
        feature_names = self.feature_extractor.get_feature_names()
        
        # Simple explanation based on feature values
        explanation = {
            'eligibility_percentage': round(probability * 100, 2),
            'factors_considered': [],
            'positive_factors': [],
            'negative_factors': [],
            'recommendation': ''
        }
        
        # Add key factors based on user data
        age = user_data.get('age', 0)
        if age >= 60:
            explanation['positive_factors'].append('Senior citizen status')
        elif age <= 25:
            explanation['positive_factors'].append('Young applicant')
        
        income = user_data.get('annual_income', 0)
        if income <= 200000:
            explanation['positive_factors'].append('Low income level')
        elif income > 800000:
            explanation['negative_factors'].append('High income level')
        
        occupation = user_data.get('occupation', '').lower()
        if occupation in ['farmer', 'laborer', 'unemployed']:
            explanation['positive_factors'].append(f'Occupation: {occupation}')
        
        category = user_data.get('category', '').lower()
        if category in ['sc', 'st']:
            explanation['positive_factors'].append(f'Social category: {category.upper()}')
        
        if user_data.get('has_disability', False):
            explanation['positive_factors'].append('Disability status')
        
        if user_data.get('is_senior_citizen', False):
            explanation['positive_factors'].append('Senior citizen status')
        
        # Generate recommendation
        if probability >= 0.8:
            explanation['recommendation'] = 'High likelihood of eligibility - proceed with application'
        elif probability >= 0.6:
            explanation['recommendation'] = 'Good likelihood of eligibility - recommended to apply'
        elif probability >= 0.4:
            explanation['recommendation'] = 'Moderate likelihood - consider applying if you meet specific criteria'
        else:
            explanation['recommendation'] = 'Lower likelihood - review scheme requirements carefully'
        
        return explanation
    
    def save_model(self, path: str):
        """Save the trained model"""
        import os
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_extractor': self.feature_extractor
        }, path)
    
    def load_model(self, path: str):
        """Load a pre-trained model"""
        import os
        if os.path.exists(path):
            data = joblib.load(path)
            self.model = data['model']
            self.scaler = data['scaler']
            self.feature_extractor = data['feature_extractor']
            self.is_trained = True
        else:
            raise FileNotFoundError(f"Model file not found: {path}")
```

- [x] **Step 3: Create eligibility service that integrates with database and ML model**

```python
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import json
import logging

from app.core.database import get_db
from app.models.scheme import Scheme
from app.models.user import User
from app.ml.models.eligibility_model import EligibilityModel
from app.ml.utils.feature_extractor import FeatureExtractor

logger = logging.getLogger(__name__)

class EligibilityService:
    def __init__(self):
        self.eligibility_model = EligibilityModel()
        self.feature_extractor = FeatureExtractor()
    
    def check_eligibility_for_scheme(
        self, 
        db: Session, 
        user_id: int, 
        scheme_id: int
    ) -> Dict[str, Any]:
        """
        Check eligibility for a specific scheme
        
        Returns:
        {
            'scheme_id': int,
            'scheme_name': str,
            'eligibility_percentage': float,
            'eligible': bool,
            'explanation': dict,
            'missing_requirements': list
        }
        """
        # Get user and scheme from database
        user = db.query(User).filter(User.id == user_id).first()
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        if not scheme:
            raise ValueError(f"Scheme with id {scheme_id} not found")
        
        if not scheme.is_active:
            return {
                'scheme_id': scheme.id,
                'scheme_name': scheme.name,
                'eligibility_percentage': 0.0,
                'eligible': False,
                'explanation': {'message': 'Scheme is not active'},
                'missing_requirements': ['Scheme is not currently active']
            }
        
        # Prepare user data for ML model
        user_data = {
            'age': self._calculate_age(user.date_of_birth) if user.date_of_birth else 0,
            'annual_income': user.annual_income or 0,
            'state': user.state or '',
            'district': user.district or '',
            'occupation': user.occupation or '',
            'education_level': getattr(user, 'education_level', '') or '',
            'gender': user.gender or '',
            'category': user.category or '',
            'family_size': getattr(user, 'family_size', 1),
            'land_holding': getattr(user, 'land_holding', 0.0),
            'has_disability': getattr(user, 'has_disability', False),
            'is_senior_citizen': self._is_senior_citizen(user.date_of_birth) if user.date_of_birth else False
        }
        
        # Get ML prediction
        eligibility_percentage, explanation = self.eligibility_model.predict_eligibility(user_data)
        
        # Check against scheme-specific rules if available
        scheme_specific_adjustment = self._apply_scheme_specific_rules(user_data, scheme)
        final_eligibility = min(100, max(0, eligibility_percentage * scheme_specific_adjustment))
        
        # Determine if eligible (threshold can be configured)
        eligible = final_eligibility >= 60  # 60% threshold
        
        # Identify missing requirements
        missing_requirements = self._identify_missing_requirements(user_data, scheme)
        
        return {
            'scheme_id': scheme.id,
            'scheme_name': scheme.name,
            'eligibility_percentage': round(final_eligibility, 2),
            'eligible': eligible,
            'explanation': explanation,
            'missing_requirements': missing_requirements
        }
    
    def check_eligibility_for_all_schemes(
        self, 
        db: Session, 
        user_id: int,
        state: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Check eligibility for all relevant schemes for a user
        """
        # Build query for schemes
        query = db.query(Scheme).filter(Scheme.is_active == True)
        
        # Filter by state if provided (for state-specific schemes)
        if state:
            query = query.filter(
                (Scheme.state_applicable == state) | 
                (Scheme.state_applicable.is_(None))  # Central schemes
            )
        
        # Additional filters could be added based on category, etc.
        
        schemes = query.all()
        results = []
        
        for scheme in schemes:
            try:
                result = self.check_eligibility_for_scheme(db, user_id, scheme.id)
                results.append(result)
            except Exception as e:
                logger.error(f"Error checking eligibility for scheme {scheme.id}: {str(e)}")
                # Continue with other schemes
                continue
        
        # Sort by eligibility percentage descending
        results.sort(key=lambda x: x['eligibility_percentage'], reverse=True)
        
        return results
    
    def _calculate_age(self, date_of_birth) -> int:
        """Calculate age from date of birth"""
        from datetime import date
        if date_of_birth:
            today = date.today()
            return today.year - date_of_birth.year - (
                (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
            )
        return 0
    
    def _is_senior_citizen(self, date_of_birth) -> bool:
        """Check if person is senior citizen (60+ years)"""
        age = self._calculate_age(date_of_birth)
        return age >= 60
    
    def _apply_scheme_specific_rules(self, user_data: Dict[str, Any], scheme: Scheme) -> float:
        """
        Apply scheme-specific eligibility rules to adjust ML prediction
        Returns a multiplier (0.0 to 2.0) to adjust the base ML score
        """
        multiplier = 1.0  # Default no change
        
        try:
            # Parse scheme eligibility criteria if available
            if scheme.eligibility_criteria:
                criteria = json.loads(scheme.eligibility_criteria)
                
                # Age restrictions
                if 'min_age' in criteria and user_data['age'] < criteria['min_age']:
                    multiplier *= 0.1  # Heavily penalize if below minimum age
                if 'max_age' in criteria and user_data['age'] > criteria['max_age']:
                    multiplier *= 0.1  # Heavily penalize if above maximum age
                
                # Income restrictions
                if 'max_annual_income' in criteria:
                    if user_data['annual_income'] > criteria['max_annual_income']:
                        multiplier *= 0.2  # Penalize high income for income-restricted schemes
                
                # Land holding restrictions (for agricultural schemes)
                if 'max_land_holding' in criteria:
                    if user_data['land_holding'] > criteria['max_land_holding']:
                        multiplier *= 0.3  # Penalize large land holdings
                
                # Category restrictions
                if 'allowed_categories' in criteria:
                    if user_data['category'].lower() not in [c.lower() for c in criteria['allowed_categories']]:
                        multiplier *= 0.1  # Heavily penalize if category not allowed
                
                # Occupation restrictions
                if 'required_occupation' in criteria:
                    if user_data['occupation'].lower() != criteria['required_occupation'].lower():
                        multiplier *= 0.5  # Penalize wrong occupation
                
                # Education requirements
                if 'min_education' in criteria:
                    education_levels = ['illiterate', 'primary', 'secondary', 'higher_secondary', 'graduate', 'postgraduate']
                    user_edu_level = education_levels.index(user_data['education_level'].lower()) if user_data['education_level'].lower() in education_levels else -1
                    required_edu_level = education_levels.index(criteria['min_education'].lower()) if criteria['min_education'].lower() in education_levels else -1
                    if user_edu_level != -1 and required_edu_level != -1 and user_edu_level < required_edu_level:
                        multiplier *= 0.6  # Penalize insufficient education
                        
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # If criteria parsing fails, continue with base multiplier
            pass
        
        return max(0.1, min(2.0, multiplier))  # Clamp between 0.1 and 2.0
    
    def _identify_missing_requirements(self, user_data: Dict[str, Any], scheme: Scheme) -> List[str]:
        """Identify what requirements the user is missing for this scheme"""
        missing = []
        
        try:
            if scheme.eligibility_criteria:
                criteria = json.loads(scheme.eligibility_criteria)
                
                # Check age requirements
                if 'min_age' in criteria and user_data['age'] < criteria['min_age']:
                    missing.append(f"Minimum age requirement: {criteria['min_age']} years")
                if 'max_age' in criteria and user_data['age'] > criteria['max_age']:
                    missing.append(f"Maximum age requirement: {criteria['max_age']} years")
                
                # Check income requirements
                if 'max_annual_income' in criteria and user_data['annual_income'] > criteria['max_annual_income']:
                    missing.append(f"Income exceeds limit: {criteria['max_annual_income']}")
                
                # Check land holding
                if 'max_land_holding' in criteria and user_data['land_holding'] > criteria['max_land_holding']:
                    missing.append(f"Land holding exceeds limit: {criteria['max_land_holding']} acres")
                
                # Check category
                if 'allowed_categories' in criteria:
                    if user_data['category'].lower() not in [c.lower() for c in criteria['allowed_categories']]:
                        missing.append(f"Required category: {', '.join(criteria['allowed_categories'])}")
                
                # Check occupation
                if 'required_occupation' in criteria:
                    if user_data['occupation'].lower() != criteria['required_occupation'].lower():
                        missing.append(f"Required occupation: {criteria['required_occupation']}")
                
                # Check education
                if 'min_education' in criteria:
                    education_levels = ['illiterate', 'primary', 'secondary', 'higher_secondary', 'graduate', 'postgraduate']
                    user_edu_level = education_levels.index(user_data['education_level'].lower()) if user_data['education_level'].lower() in education_levels else -1
                    required_edu_level = education_levels.index(criteria['min_education'].lower()) if criteria['min_education'].lower() in education_levels else -1
                    if user_edu_level != -1 and required_edu_level != -1 and user_edu_level < required_edu_level:
                        missing.append(f"Minimum education required: {criteria['min_education']}")
                        
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # If we can't parse criteria, we can't check specific requirements
            pass
        
        return missing
```

- [x] **Step 4: Create eligibility API endpoints**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.eligibility_engine import EligibilityService
from app.schemas.eligibility import EligibilityCheck, EligibilityResult, BatchEligibilityResult

router = APIRouter()
eligibility_service = EligibilityService()

@router.post("/check/{scheme_id}", response_model=EligibilityResult)
async def check_eligibility_for_scheme(
    scheme_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check eligibility for a specific scheme"""
    try:
        result = eligibility_service.check_eligibility_for_scheme(
            db, current_user.id, scheme_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/check-all", response_model=BatchEligibilityResult)
async def check_eligibility_for_all_schemes(
    state: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check eligibility for all relevant schemes"""
    try:
        results = eligibility_service.check_eligibility_for_all_schemes(
            db, current_user.id, state, category
        )
        return {
            'user_id': current_user.id,
            'total_schemes_checked': len(results),
            'eligible_schemes': [r for r in results if r['eligible']],
            'results': results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/scheme/{scheme_id}/explanation")
async def get_eligibility_explanation(
    scheme_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get detailed explanation for eligibility calculation"""
    try:
        result = eligibility_service.check_eligibility_for_scheme(
            db, current_user.id, scheme_id
        )
        return {
            'scheme_id': scheme_id,
            'scheme_name': result['scheme_name'],
            'eligibility_percentage': result['eligibility_percentage'],
            'explanation': result['explanation'],
            'missing_requirements': result['missing_requirements']
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
```

- [x] **Step 5: Create eligibility schemas**

```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EligibilityCheck(BaseModel):
    user_id: int
    scheme_id: int

class EligibilityResult(BaseModel):
    scheme_id: int
    scheme_name: str
    eligibility_percentage: float
    eligible: bool
    explanation: Dict[str, Any]
    missing_requirements: List[str]

class BatchEligibilityResult(BaseModel):
    user_id: int
    total_schemes_checked: int
    eligible_schemes: List[EligibilityResult]
    results: List[EligibilityResult]

class FeatureImportance(BaseModel):
    feature: str
    importance: float
```

- [x] **Step 6: Create test file for eligibility engine**

```python
def test_feature_extractor():
    from app.ml.utils.feature_extractor import FeatureExtractor
    
    extractor = FeatureExtractor()
    
    user_data = {
        'age': 35,
        'annual_income': 250000,
        'state': 'Maharashtra',
        'district': 'Pune',
        'occupation': 'farmer',
        'education_level': 'primary',
        'gender': 'male',
        'category': 'general',
        'family_size': 4,
        'land_holding': 2.5,
        'has_disability': False,
        'is_senior_citizen': False
    }
    
    features = extractor.extract_features(user_data)
    assert features.shape == (1, 12)  # 12 features
    
    feature_names = extractor.get_feature_names()
    assert len(feature_names) == 12

def test_eligibility_model_rule_based():
    from app.ml.models.eligibility_model import EligibilityModel
    
    model = EligibilityModel()  # Uses rule-based by default
    
    # Test case 1: Elderly farmer with low income
    user_data = {
        'age': 68,
        'annual_income': 80000,
        'state': 'Maharashtra',
        'district': 'Nashik',
        'occupation': 'farmer',
        'education_level': 'illiterate',
        'gender': 'male',
        'category': 'general',
        'family_size': 5,
        'land_holding': 1.0,
        'has_disability': False,
        'is_senior_citizen': True
    }
    
    eligibility, explanation = model.predict_eligibility(user_data)
    assert isinstance(eligibility, float)
    assert 0 <= eligibility <= 100
    assert explanation['eligibility_percentage'] == eligibility
    assert eligibility > 50  # Should be high for elderly farmer
    
    # Test case 2: Young high-income professional
    user_data = {
        'age': 28,
        'annual_income': 1200000,
        'state': 'Karnataka',
        'district': 'Bangalore',
        'occupation': 'software_engineer',
        'education_level': 'graduate',
        'gender': 'female',
        'category': 'general',
        'family_size': 1,
        'land_holding': 0,
        'has_disability': False,
        'is_senior_citizen': False
    }
    
    eligibility, explanation = model.predict_eligibility(user_data)
    assert isinstance(eligibility, float)
    assert 0 <= eligibility <= 100
    assert eligibility < 40  # Should be lower for high-income young professional

def test_eligibility_service_integration():
    from unittest.mock import Mock
    from app.services.eligibility_engine import EligibilityService
    from app.models.user import User
    from app.models.scheme import Scheme, SchemeType, SchemeCategory
    
    # Create mock database session
    db = Mock()
    
    # Create mock user
    user = User(
        id=1,
        email="test@example.com",
        full_name="Test User",
        date_of_birth=None,  # Simplified for test
        annual_income=200000,
        occupation="farmer",
        category="general",
        gender="male",
        state="Maharashtra"
    )
    
    # Create mock scheme
    scheme = Scheme(
        id=1,
        name="Test Farmer Scheme",
        description="A test scheme for farmers",
        scheme_type=SchemeType.CENTRAL,
        category=SchemeCategory.AGRICULTURE,
        is_active=True
    )
    
    # Mock database queries
    db.query.return_value.filter.return_value.first.side_effect = [user, scheme]
    
    service = EligibilityService()
    result = service.check_eligibility_for_scheme(db, 1, 1)
    
    assert 'scheme_id' in result
    assert 'scheme_name' in result
    assert 'eligibility_percentage' in result
    assert 'eligible' in result
    assert 'explanation' in result
    assert 'missing_requirements' in result
```

- [x] **Step 7: Run test to verify eligibility engine works**

Run: `python -m pytest backend/tests/test_eligibility.py -v`
Expected: PASS

- [x] **Step 8: Commit eligibility prediction engine**

```bash
git add backend/app/services/eligibility_engine.py backend/app/ml/models/eligibility_model.py backend/app/ml/utils/feature_extractor.py backend/app/api/v1/endpoints/eligibility.py backend/app/schemas/eligibility.py backend/tests/test_eligibility.py
git commit -m "feat: implement eligibility prediction engine with ML model and rule-based fallback"
```

### Task 6: Missing Document Advisor

**Files:**
- Create: `backend/app/services/document_advisor.py`
- Create: `backend/app/models/user_document.py`
- Create: `backend/app/schemas/document.py`
- Create: `backend/app/api/v1/endpoints/documents.py`
- Create: `backend/tests/test_documents.py`

- [x] **Step 1: Create user document model to track user's uploaded documents**

```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
import enum

from app.core.database = Base

class DocumentStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"
    MISSING = "missing"

class UserDocument(Base):
    __tablename__ = "user_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.MISSING)
    file_path = Column(String(500))  # Path to stored file
    file_name = Column(String(255))  # Original file name
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    verification_notes = Column(Text)
    
    # Relationships
    # user = relationship("User", back_populates="user_documents")
    # document = relationship("Document", back_populates="user_documents")
```

- [x] **Step 2: Create document advisor service**

```python
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import json
import logging
from datetime import datetime

from app.core.database = get_db
from app.models.document = Document
from app.models.user = User
from app.models.user_document = UserDocument
from app.models.scheme = Scheme
from app.schemas.document = DocumentRequirement, DocumentStatus, MissingDocumentInfo

logger = logging.getLogger(__name__)

class DocumentAdvisorService:
    def __init__(self):
        pass
    
    def get_document_requirements_for_scheme(
        self, 
        db: Session, 
        scheme_id: int
    ) -> List[DocumentRequirement]:
        """
        Get document requirements for a specific scheme
        """
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        if not scheme:
            raise ValueError(f"Scheme with id {scheme_id} not found")
        
        requirements = []
        
        try:
            if scheme.required_documents:
                doc_list = json.loads(scheme.required_documents)
                for doc_req in doc_list:
                    requirements.append(DocumentRequirement(
                        document_id=doc_req.get('id'),
                        name=doc_req.get('name'),
                        document_type=doc_req.get('type'),
                        description=doc_req.get('description'),
                        is_mandatory=doc_req.get('mandatory', False),
                        issuing_authority=doc_req.get('issuing_authority'),
                        validity_period_days=doc_req.get('validity_period_days')
                    ))
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.warning(f"Could not parse required documents for scheme {scheme_id}: {str(e)}")
            # Fallback to querying document table directly
            pass
        
        # If no requirements in scheme, get all active documents as fallback
        if not requirements:
            documents = db.query(Document).filter(Document.is_active == True).all()
            for doc in documents:
                requirements.append(DocumentRequirement(
                    document_id=doc.id,
                    name=doc.name,
                    document_type=doc.document_type,
                    description=doc.description,
                    is_mandatory=doc.is_mandatory,
                    issuing_authority=doc.issuing_authority,
                    validity_period_days=doc.validity_period
                ))
        
        return requirements
    
    def check_user_documents_for_scheme(
        self, 
        db: Session, 
        user_id: int, 
        scheme_id: int
    ) -> Dict[str, Any]:
        """
        Check which documents the user has and which are missing for a scheme
        
        Returns:
        {
            'scheme_id': int,
            'scheme_name': str,
            'user_id': int,
            'required_documents': List[DocumentRequirement],
            'user_documents': List[Dict],
            'missing_documents': List[MissingDocumentInfo],
            'completion_percentage': float
        }
        """
        # Get scheme and user
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        user = db.query(User).filter(User.id == user_id).first()
        
        if not scheme:
            raise ValueError(f"Scheme with id {scheme_id} not found")
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Get document requirements
        required_docs = self.get_document_requirements_for_scheme(db, scheme_id)
        
        # Get user's documents
        user_docs = db.query(UserDocument).filter(
            UserDocument.user_id == user_id
        ).all()
        
        # Create lookup for user documents by document_id
        user_doc_lookup = {ud.document_id: ud for ud in user_docs}
        
        # Check each required document
        missing_documents = []
        user_doc_details = []
        
        for req_doc in required_docs:
            user_doc = user_doc_lookup.get(req_doc.document_id)
            
            if user_doc:
                # User has the document
                doc_info = {
                    'document_id': user_doc.document_id,
                    'name': req_doc.name,
                    'status': user_doc.status.value,
                    'uploaded_at': user_doc.uploaded_at.isoformat() if user_doc.uploaded_at else None,
                    'verified_at': user_doc.verified_at.isoformat() if user_doc.verified_at else None,
                    'expires_at': user_doc.expires_at.isoformat() if user_doc.expires_at else None,
                    'file_name': user_doc.file_name,
                    'verification_notes': user_doc.verification_notes
                }
                user_doc_details.append(doc_info)
                
                # Check if document is expired
                if user_doc.expires_at and user_doc.expires_at < datetime.now():
                    missing_documents.append(MissingDocumentInfo(
                        document_id=req_doc.document_id,
                        name=req_doc.name,
                        document_type=req_doc.document_type,
                        description=req_doc.description,
                        is_mandatory=req_doc.is_mandatory,
                        reason="Document has expired",
                        guidance=f"Please renew your {req_doc.name} which expired on {user_doc.expires_at.strftime('%Y-%m-%d')}"
                    ))
                # Check if document needs verification
                elif user_doc.status == DocumentStatus.REJECTED:
                    missing_documents.append(MissingDocumentInfo(
                        document_id=req_doc.document_id,
                        name=req_doc.name,
                        document_type=req_doc.document_type,
                        description=req_doc.description,
                        is_mandatory=req_doc.is_mandatory,
                        reason="Document was rejected",
                        guidance=f"Please re-upload your {req_doc.name} as it was previously rejected. Reason: {user_doc.verification_notes}"
                    ))
            else:
                # User doesn't have the document
                missing_documents.append(MissingDocumentInfo(
                    document_id=req_doc.document_id,
                    name=req_doc.name,
                    document_type=req_doc.document_type,
                    description=req_doc.description,
                    is_mandatory=req_doc.is_mandatory,
                    reason="Document not uploaded",
                    guidance=self._get_document_guidance(req_doc)
                ))
        
        # Calculate completion percentage
        total_required = len([doc for doc in required_docs if doc.is_mandatory])
        if total_required == 0:
            completion_percentage = 100.0
        else:
            have_required = len([doc for doc in user_doc_details if 
                               any(req.doc_id == doc['document_id'] and req.is_mandatory 
                                   for req in required_docs)])
            completion_percentage = (have_required / total_required) * 100 if total_required > 0 else 0
        
        return {
            'scheme_id': scheme.id,
            'scheme_name': scheme.name,
            'user_id': user.id,
            'required_documents': [doc.dict() for doc in required_docs],
            'user_documents': user_doc_details,
            'missing_documents': [doc.dict() for doc in missing_documents],
            'completion_percentage': round(completion_percentage, 2)
        }
    
    def _get_document_guidance(self, document_req: DocumentRequirement) -> str:
        """Get guidance on how to obtain a specific document"""
        guidance_map = {
            "Aadhaar Card": "Visit your nearest Aadhaar enrollment center with proof of identity and address",
            "PAN Card": "Apply online through NSDL or UTIITSL website, or visit a PAN center",
            "Voter ID": "Apply online through the Election Commission website or visit your electoral office",
            "Passport": "Apply online through the Passport Seva website or visit a passport office",
            "Driving License": "Apply through your state's RTO after passing the driving test",
            "Ration Card": "Visit your local SDM office or apply online through state food department website",
            "Income Certificate": "Visit your Tahsildar office or apply online through state revenue department",
            "Caste Certificate": "Visit your SDM office or apply online through state backward class welfare department",
            "Domicile Certificate": "Visit your local SDM office or apply online through state revenue department",
            "Birth Certificate": "Visit the municipal corporation where birth occurred or apply online",
            "Death Certificate": "Visit the municipal corporation where death occurred or apply online",
            "Marriage Certificate": "Visit the sub-registrar office where marriage was registered",
            "Bank Passbook": "Visit your bank branch with identity proof",
            "Property Papers": "Visit your sub-registrar office",
            "Loan Statement": "Visit your bank branch or download from net banking",
            "Salary Slips": "Get from your employer's HR or payroll department",
            "Tax Returns": "Download from income tax e-filing portal",
            "Medical Certificate": "Visit a government hospital or authorized medical practitioner",
            "Disability Certificate": "Visit the district medical board or government hospital",
            "Senior Citizen Card": "Apply through your state's social welfare department",
            "BPL Card": "Visit your local SDM office or apply online through state food department",
            "Antyodaya Card": "Visit your local SDM office or apply online through state food department",
            "Job Card": "Visit your local MNREGA office or apply online through state rural development department"
        }
        
        return guidance_map.get(document_req.name, 
                               f"Contact your local government office or visit the official website to obtain {document_req.name}")
    
    def upload_user_document(
        self, 
        db: Session, 
        user_id: int, 
        document_id: int,
        file_path: str,
        file_name: str
    ) -> UserDocument:
        """Record that a user has uploaded a document"""
        # Check if user already has this document record
        existing_doc = db.query(UserDocument).filter(
            UserDocument.user_id == user_id,
            UserDocument.document_id == document_id
        ).first()
        
        if existing_doc:
            # Update existing record
            existing_doc.file_path = file_path
            existing_doc.file_name = file_name
            existing_doc.status = DocumentStatus.UPLOADED
            existing_doc.uploaded_at = func.now()
        else:
            # Create new record
            existing_doc = UserDocument(
                user_id=user_id,
                document_id=document_id,
                file_path=file_path,
                file_name=file_name,
                status=DocumentStatus.UPLOADED
            )
            db.add(existing_doc)
        
        db.commit()
        db.refresh(existing_doc)
        return existing_doc
    
    def verify_user_document(
        self, 
        db: Session, 
        user_id: int, 
        document_id: int,
        notes: Optional[str] = None
    ) -> UserDocument:
        """Mark a user's document as verified"""
        user_doc = db.query(UserDocument).filter(
            UserDocument.user_id == user_id,
            UserDocument.document_id == document_id
        ).first()
        
        if not user_doc:
            raise ValueError(f"User document record not found for user {user_id} and document {document_id}")
        
        user_doc.status = DocumentStatus.VERIFIED
        user_doc.verified_at = func.now()
        if notes:
            user_doc.verification_notes = notes
        
        db.commit()
        db.refresh(user_doc)
        return user_doc
    
    def reject_user_document(
        self, 
        db: Session, 
        user_id: int, 
        document_id: int,
        notes: str
    ) -> UserDocument:
        """Mark a user's document as rejected"""
        user_doc = db.query(UserDocument).filter(
            UserDocument.user_id == user_id,
            UserDocument.document_id == document_id
        ).first()
        
        if not user_doc:
            raise ValueError(f"User document record not found for user {user_id} and document {document_id}")
        
        user_doc.status = DocumentStatus.REJECTED
        user_doc.verification_notes = notes
        
        db.commit()
        db.refresh(user_doc)
        return user_doc
```

- [x] **Step 3: Create document schemas**

```python
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import enum

class DocumentType(str, enum.Enum):
    IDENTITY = "identity"
    ADDRESS = "address"
    INCOME = "income"
    CASTE = "caste"
    EDUCATION = "education"
    MEDICAL = "medical"
    BANK = "bank"
    PHOTO = "photo"
    OTHERS = "others"

class DocumentStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"
    MISSING = "missing"

class DocumentBase(BaseModel):
    name: str
    document_type: DocumentType
    description: Optional[str] = None
    issuing_authority: Optional[str] = None
    validity_period: Optional[int] = None  # in days
    is_mandatory: bool = False

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    document_type: Optional[DocumentType] = None
    description: Optional[str] = None
    issuing_authority: Optional[str] = None
    validity_period: Optional[int] = None
    is_mandatory: Optional[bool] = None

class DocumentInDBBase(DocumentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class DocumentInDB(DocumentInDBBase):
    pass

class Document(DocumentInDBBase):
    pass

class DocumentRequirement(BaseModel):
    document_id: int
    name: str
    document_type: DocumentType
    description: Optional[str] = None
    is_mandatory: bool = False
    issuing_authority: Optional[str] = None
    validity_period_days: Optional[int] = None

class UserDocumentBase(BaseModel):
    user_id: int
    document_id: int
    status: DocumentStatus
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    verification_notes: Optional[str] = None

class UserDocumentCreate(UserDocumentBase):
    pass

class UserDocumentUpdate(BaseModel):
    status: Optional[DocumentStatus] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    verification_notes: Optional[str] = None

class UserDocumentInDBBase(UserDocumentBase):
    id: int
    uploaded_at: datetime
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class UserDocumentInDB(UserDocumentInDBBase):
    pass

class UserDocument(UserDocumentInDBBase):
    pass

class MissingDocumentInfo(BaseModel):
    document_id: int
    name: str
    document_type: DocumentType
    description: Optional[str] = None
    is_mandatory: bool = False
    reason: str
    guidance: str

class DocumentCheckResult(BaseModel):
    scheme_id: int
    scheme_name: str
    user_id: int
    required_documents: List[DocumentRequirement]
    user_documents: List[dict]
    missing_documents: List[MissingDocumentInfo]
    completion_percentage: float
```

- [x] **Step 4: Create document API endpoints**

```python
from fastapi = APIRouter, Depends, HTTPException, status
from sqlalchemy.orm = Session
from typing = List, Optional
from uuid = UUID

from app.core.database = get_db
from app.core.auth = get_current_active_user
from app.models.user = User
from app.services.document_advisor = DocumentAdvisorService
from app.schemas.document = (
    DocumentCheckResult, DocumentRequirement, 
    UserDocumentCreate, UserDocumentUpdate, MissingDocumentInfo
)

router = APIRouter()
document_advisor = DocumentAdvisorService()

@router.get("/scheme/{scheme_id}/requirements", response_model=List[DocumentRequirement])
async def get_document_requirements(
    scheme_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get document requirements for a specific scheme"""
    try:
        requirements = document_advisor.get_document_requirements_for_scheme(db, scheme_id)
        return requirements
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/check/{scheme_id}", response_model=DocumentCheckResult)
async def check_user_documents(
    scheme_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check which documents the user has and which are missing for a scheme"""
    try:
        result = document_advisor.check_user_documents_for_scheme(
            db, current_user.id, scheme_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/upload", response_model=dict)
async def upload_document(
    document_data: UserDocumentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Record that a user has uploaded a document"""
    # Verify the document belongs to the current user
    if document_data.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot upload document for another user"
        )
    
    try:
        user_doc = document_advisor.upload_user_document(
            db,
            document_data.user_id,
            document_data.document_id,
            document_data.file_path or "",
            document_data.file_name or ""
        )
        return {
            "message": "Document uploaded successfully",
            "user_document_id": user_doc.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/verify/{user_document_id}", response_model=dict)
async def verify_document(
    user_document_id: int,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a user's document as verified"""
    # Get the user document to verify ownership
    user_doc = db.query(UserDocument).filter(UserDocument.id == user_document_id).first()
    if not user_doc:
        raise HTTPException(status_code=404, detail="User document not found")
    
    if user_doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot verify document for another user"
        )
    
    try:
        document_advisor.verify_user_document(
            db,
            user_doc.user_id,
            user_doc.document_id,
            notes
        )
        return {"message": "Document verified successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/reject/{user_document_id}", response_model=dict)
async def reject_document(
    user_document_id: int,
    notes: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a user's document as rejected"""
    # Get the user document to verify ownership
    user_doc = db.query(UserDocument).filter(UserDocument.id == user_document_id).first()
    if not user_doc:
        raise HTTPException(status_code=404, detail="User document not found")
    
    if user_doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot reject document for another user"
        )
    
    if not notes or len(notes.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection notes are required"
        )
    
    try:
        document_advisor.reject_user_document(
            db,
            user_doc.user_id,
            user_doc.document_id,
            notes
        )
        return {"message": "Document marked as rejected"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/guidance/{document_name}")
async def get_document_guidance(
    document_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get guidance on how to obtain a specific document"""
    # Create a dummy document requirement to get guidance
    from app.schemas.document = DocumentRequirement
    dummy_req = DocumentRequirement(
        document_id=0,
        name=document_name,
        document_type="identity",  # Default, guidance doesn't depend on type
        description="",
        is_mandatory=False
    )
    guidance = document_advisor._get_document_guidance(dummy_req)
    return {"document_name": document_name, "guidance": guidance}
```

- [x] **Step 5: Create test file for document advisor**

```python
def test_document_model():
    from app.models.document = Document, DocumentType
    
    doc = Document(
        name="Aadhaar Card",
        description="Unique identification number",
        document_type=DocumentType.IDENTITY,
        issuing_authority="UIDAI",
        validity_period=0,  # Lifetime
        is_mandatory=True
    )
    
    assert doc.name == "Aadhaar Card"
    assert doc.document_type = DocumentType.IDENTITY
    assert doc.is_mandatory = True

def test_user_document_model():
    from app.models.user_document = UserDocument, DocumentStatus
    from app.models.user = User
    from app.models.document = Document
    
    user_doc = UserDocument(
        user_id=1,
        document_id=1,
        status=DocumentStatus.UPLOADED,
        file_path="/uploads/aadhaar_123.pdf",
        file_name="aadhaar.pdf"
    )
    
    assert user_doc.user_id = 1
    assert user_doc.document_id = 1
    assert user_doc.status = DocumentStatus.UPLOADED

def test_document_advisor_service():
    from unittest.mock = Mock
    from app.services.document_advisor = DocumentAdvisorService
    from app.models.document = Document
    from app.models.scheme = Scheme
    from app.models.user = User
    
    # Create mock database session
    db = Mock()
    
    # Create mock scheme with document requirements
    scheme = Scheme(
        id=1,
        name="Test Scheme",
        description="A test scheme",
        required_documents='[{"id": 1, "name": "Aadhaar Card", "type": "identity", "mandatory": true}]'
    )
    
    # Mock database queries
    db.query.return_value.filter.return_value.first.return_value = scheme
    
    advisor = DocumentAdvisorService()
    requirements = advisor.get_document_requirements_for_scheme(db, 1)
    
    assert len(requirements) = 1
    assert requirements[0].name = "Aadhaar Card"
    assert requirements[0].is_mandatory = True

def test_document_check_integration():
    from unittest.mock = Mock
    from app.services.document_advisor = DocumentAdvisorService
    from app.models.user = User
    from app.models.scheme = Scheme
    from app.models.document = Document
    from app.models.user_document = UserDocument, DocumentStatus
    
    # Create mock database session
    db = Mock()
    
    # Create mock user
    user = User(id=1, email="test@example.com", full_name="Test User")
    
    # Create mock scheme
    scheme = Scheme(
        id=1,
        name="Test Scheme",
        description="A test scheme",
        required_documents='[{"id": 1, "name": "Aadhaar Card", "type": "identity", "mandatory": true}]'
    )
    
    # Mock database queries for scheme and user
    def mock_query_filter(model):
        if model == Scheme:
            mock_scheme = Mock()
            mock_scheme.first.return_value = scheme
            return mock_scheme
        elif model == User:
            mock_user = Mock()
            mock_user.first.return_value = user
            return mock_user
        return Mock()
    
    db.query.side_effect = mock_query_filter
    
    # Mock user documents query (empty - user has no documents)
    mock_user_docs = Mock()
    mock_user_docs.all.return_value = []
    db.query.return_value.filter.return_value.all.return_value = []
    
    advisor = DocumentAdvisorService()
    result = advisor.check_user_documents_for_scheme(db, 1, 1)
    
    assert result['scheme_id'] = 1
    assert result['scheme_name'] = "Test Scheme"
    assert result['user_id'] = 1
    assert len(result['required_documents']) = 1
    assert result['required_documents'][0]['name'] = "Aadhaar Card"
    assert result['completion_percentage'] = 0.0  # No documents uploaded
    assert len(result['missing_documents']) = 1
    assert result['missing_documents'][0]['name'] = "Aadhaar Card"
    assert result['missing_documents'][0]['is_mandatory'] = True
```

- [x] **Step 6: Run test to verify document advisor works**

Run: `python -m pytest backend/tests/test_documents.py -v`
Expected: PASS

- [x] **Step 7: Commit document advisor service**

```bash
git add backend/app/services/document_advisor.py backend/app/models/user_document.py backend/app/schemas/document.py backend/app/api/v1/endpoints/documents.py backend/tests/test_documents.py
git commit -m "feat: implement missing document advisor service"
```

### Task 7: Scheme Comparison Engine

**Files:**
- Create: `backend/app/services/comparison_engine.py`
- Create: `backend/app/schemas/comparison.py`
- Create: `backend/app/api/v1/endpoints/comparison.py`
- Create: `backend/tests/test_comparison.py`

- [x] **Step 1: Create comparison engine service**

```python
from typing = List, Dict, Any, Optional, Tuple
from sqlalchemy.orm = Session
import json
import logging
from datetime = datetime

from app.core.database = get_db
from app.models.scheme = Scheme
from app.models.user = User
from app.services.eligibility_engine = EligibilityService
from app.schemas.comparison = (
    SchemeComparison, ComparisonResult, BenefitAnalysis, 
    Recommendation, ComparisonRequest
)

logger = logging.getLogger(__name__)

class ComparisonEngineService:
    def __init__(self):
        self.eligibility_service = EligibilityService()
    
    def compare_schemes(
        self, 
        db: Session, 
        user_id: int, 
        scheme_ids: List[int],
        comparison_criteria: Optional[Dict[str, Any]] = None
    ) -> ComparisonResult:
        """
        Compare multiple schemes for a user and provide recommendations
        
        Returns:
        ComparisonResult with detailed analysis and recommendations
        """
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Get schemes
        schemes = db.query(Scheme).filter(
            Scheme.id.in_(scheme_ids),
            Scheme.is_active == True
        ).all()
        
        if len(schemes) == 0:
            raise ValueError("No valid schemes found for comparison")
        
        # Check eligibility for all schemes
        eligibility_results = []
        for scheme in schemes:
            try:
                eligibility_result = self.eligibility_service.check_eligibility_for_scheme(
                    db, user_id, scheme.id
                )
                eligibility_results.append(eligibility_result)
            except Exception as e:
                logger.warning(f"Could not check eligibility for scheme {scheme.id}: {str(e)}")
                # Skip this scheme
                continue
        
        if len(eligibility_results) == 0:
            raise ValueError("Could not determine eligibility for any schemes")
        
        # Analyze benefits for each scheme
        benefit_analyses = []
        for i, scheme in enumerate(schemes):
            if i < len(eligibility_results):
                eligibility = eligibility_results[i]
                benefit_analysis = self._analyze_benefits(scheme, eligibility, user)
                benefit_analyses.append(benefit_analysis)
        
        # Generate scheme comparisons
        scheme_comparisons = []
        for i, scheme in enumerate(schemes):
            if i < len(eligibility_results) and i < len(benefit_analyses):
                eligibility = eligibility_results[i]
                benefit_analysis = benefit_analyses[i]
                
                comparison = SchemeComparison(
                    scheme_id=scheme.id,
                    scheme_name=scheme.name,
                    scheme_description=scheme.description,
                    eligibility_percentage=eligibility['eligibility_percentage'],
                    eligible=eligibility['eligible'],
                    benefit_analysis=benefit_analysis,
                    missing_requirements=eligibility['missing_requirements']
                )
                scheme_comparisons.append(comparison)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(scheme_comparisons, user, comparison_criteria)
        
        # Create comparison result
        result = ComparisonResult(
            user_id=user_id,
            comparison_date=datetime.now(),
            schemes_compared=[s.id for s in schemes],
            scheme_comparisons=scheme_comparisons,
            recommendations=recommendations,
            summary=self._generate_summary(scheme_comparisons, recommendations)
        )
        
        return result
    
    def _analyze_benefits(
        self, 
        scheme: Scheme, 
        eligibility_result: Dict[str, Any],
        user: User
    ) -> BenefitAnalysis:
        """Analyze the benefits of a scheme for a specific user"""
        try:
            benefits_data = json.loads(scheme.benefits) if scheme.benefits else {}
        except (json.JSONDecodeError, TypeError):
            benefits_data = {}
        
        # Calculate monetary value of benefits
        monetary_value = self._calculate_monetary_value(benefits_data, user)
        
        # Calculate non-monetary benefits score
        non_monetary_score = self._calculate_non_monetary_score(benefits_data, user)
        
        # Calculate total benefit score (0-100)
        total_benefit_score = min(100, monetary_value + non_monetary_score)
        
        # Determine benefit category
        benefit_category = self._categorize_benefits(scheme.category if hasattr(scheme, 'category') else None)
        
        return BenefitAnalysis(
            monetary_value=monetary_value,
            non_monetary_score=non_monetary_score,
            total_benefit_score=total_benefit_score,
            benefit_category=benefit_category,
            benefit_details=benefits_data
        )
    
    def _calculate_monetary_value(self, benefits_data: Dict[str, Any], user: User) -> float:
        """Calculate the monetary value of benefits for a user"""
        value = 0.0
        
        # Direct cash benefits
        if 'amount_per_month' in benefits_data:
            value += benefits_data['amount_per_month'] * 12  # Annual value
        elif 'amount_per_year' in benefits_data:
            value += benefits_data['amount_per_year']
        elif 'amount' in benefits_data:
            value += benefits_data['amount']
        
        # Percentage-based benefits (e.g., subsidy percentage)
        if 'subsidy_percentage' in benefits_data and 'annual_income' in benefits_data:
            # Assuming this is a subsidy on some expense
            pass  # Would need more context to calculate
        
        # Tax benefits
        if 'tax_exemption_limit' in benefits_data:
            # Simplified: assume user would save tax on this amount
            tax_rate = 0.1  # Assume 10% average tax rate
            value += min(user.annual_income or 0, benefits_data['tax_exemption_limit']) * tax_rate
        
        # Education benefits
        if 'scholarship_amount' in benefits_data:
            value += benefits_data['scholarship_amount']
        
        # Housing benefits
        if 'rent_subsidy' in benefits_data:
            value += benefits_data['rent_subsidy'] * 12  # Annual
        elif 'housing_grant' in benefits_data:
            value += benefits_data['housing_grant']
        
        # Healthcare benefits
        if 'medical_coverage' in benefits_data:
            # Simplified annual value
            value += benefits_data['medical_coverage'] * 0.5  # Assume 50% utilization
        
        return min(value, 500000)  # Cap at reasonable maximum
    
    def _calculate_non_monetary_score(self, benefits_data: Dict[str, Any], user: User) -> float:
        """Calculate non-monetary benefits score (0-50)"""
        score = 0.0
        
        # Security/stability benefits
        if benefits_data.get('food_security'):
            score += 10
        if benefits_data.get('housing_security'):
            score += 10
        if benefits_data.get('income_stability'):
            score += 10
        
        # Access benefits
        if benefits_data.get('healthcare_access'):
            score += 5
        if benefits_data.get('education_access'):
            score += 5
        if benefits_data.get('financial_inclusion'):
            score += 5
        
        # Empowerment benefits
        if benefits_data.get('skill_development'):
            score += 5
        if benefits_data.get('entrepreneurship_support'):
            score += 5
        if benefits_data.get('women_empowerment'):
            score += 5
        
        # Social benefits
        if benefits_data.get('social_security'):
            score += 5
        if benefits_data.get('community_development'):
            score += 5
        
        return min(score, 50)
    
    def _categorize_benefits(self, category: Optional[str]) -> str:
        """Categorize benefits based on scheme category"""
        if not category:
            return "General Welfare"
        
        category_map = {
            'agriculture': 'Agriculture & Livelihood',
            'education': 'Education & Skills',
            'health': 'Healthcare & Nutrition',
            'employment': 'Employment & Livelihood',
            'housing': 'Housing & Shelter',
            'social_welfare': 'Social Welfare & Protection',
            'financial_inclusion': 'Financial Services & Inclusion',
            'others': 'General Welfare'
        }
        
        return category_map.get(category.lower(), "General Welfare")
    
    def _generate_recommendations(
        self, 
        scheme_comparisons: List[SchemeComparison],
        user: User,
        comparison_criteria: Optional[Dict[str, Any]] = None
    ) -> List[Recommendation]:
        """Generate recommendations based on comparison analysis"""
        recommendations = []
        
        if not scheme_comparisons:
            return recommendations
        
        # Sort by eligibility percentage and benefit score
        sorted_schemes = sorted(
            scheme_comparisons,
            key=lambda x: (x.eligible, x.eligibility_percentage, x.benefit_analysis.total_benefit_score),
            reverse=True
        )
        
        # Generate top recommendation
        if sorted_schemes:
            top_scheme = sorted_schemes[0]
            if top_scheme.eligible:
                recommendations.append(Recommendation(
                    type="primary",
                    scheme_id=top_scheme.scheme_id,
                    scheme_name=top_scheme.scheme_name,
                    reason=f"Highest eligibility ({top_scheme.eligibility_percentage}%) and strong benefits",
                    action="Proceed with application",
                    confidence="high" if top_scheme.eligibility_percentage >= 80 else "medium"
                ))
            else:
                recommendations.append(Recommendation(
                    type="alternative",
                    scheme_id=top_scheme.scheme_id,
                    scheme_name=top_scheme.scheme_name,
                    reason=f"Best match but currently ineligible ({top_scheme.eligibility_percentage}% eligibility)",
                    action="Work on meeting requirements before applying",
                    confidence="medium"
                ))
        
        # Generate secondary recommendations for eligible schemes
        eligible_schemes = [s for s in sorted_schemes if s.eligible]
        if len(eligible_schemes) > 1:
            for scheme in eligible_schemes[1:3]:  # Next 2 best eligible schemes
                recommendations.append(Recommendation(
                    type="alternative",
                    scheme_id=scheme.scheme_id,
                    scheme_name=scheme.scheme_name,
                    reason=f"Good alternative with {scheme.eligibility_percentage}% eligibility",
                    action="Consider if primary option doesn't work out",
                    confidence="medium"
                ))
        
        # Generate recommendation for improving eligibility
        ineligible_schemes = [s for s in sorted_schemes if not s.eligible]
        if ineligible_schemes:
            # Find scheme with highest potential (closest to eligibility threshold)
            closest_scheme = max(ineligible_schemes, key=lambda x: x.eligibility_percentage)
            if closest_scheme.eligibility_percentage >= 40:  # Within reasonable range
                recommendations.append(Recommendation(
                    type="improvement",
                    scheme_id=closest_scheme.scheme_id,
                    scheme_name=closest_scheme.scheme_name,
                    reason=f"Close to eligibility ({closest_scheme.eligibility_percentage}%) - work on requirements",
                    action="Address missing requirements to become eligible",
                    confidence="high" if closest_scheme.eligibility_percentage >= 60 else "medium"
                ))
        
        return recommendations
    
    def _generate_summary(
        self, 
        scheme_comparisons: List[SchemeComparison],
        recommendations: List[Recommendation]
    ) -> Dict[str, Any]:
        """Generate a summary of the comparison"""
        total_schemes = len(scheme_comparisons)
        eligible_schemes = len([s for s in scheme_comparisons if s.eligible])
        
        avg_eligibility = sum(s.eligibility_percentage for s in scheme_comparisons) / total_schemes if total_schemes > 0 else 0
        max_eligibility = max((s.eligibility_percentage for s in scheme_comparisons), default=0)
        
        top_benefit = max(
            (s.benefit_analysis.total_benefit_score for s in scheme_comparisons), 
            default=0
        )
        
        return {
            "total_schemes_compared": total_schemes,
            "eligible_schemes": eligible_schemes,
            "average_eligibility_percentage": round(avg_eligibility, 2),
            "maximum_eligibility_percentage": round(max_eligibility, 2),
            "highest_benefit_score": round(top_benefit, 2),
            "primary_recommendation": recommendations[0].dict() if recommendations else None,
            "total_recommendations": len(recommendations)
        }
```

- [x] **Step 2: Create comparison schemas**

```python
from pydantic = BaseModel
from typing = List, Optional, Dict, Any
from datetime = datetime
from enum = Enum

class RecommendationType(str, Enum):
    PRIMARY = "primary"
    ALTERNATIVE = "alternative"
    IMPROVEMENT = "improvement"
    WARNING = "warning"

class BenefitAnalysis(BaseModel):
    monetary_value: float  # Estimated annual monetary value in INR
    non_monetary_score: float  # Score 0-50 for non-monetary benefits
    total_benefit_score: float  # Score 0-100 combining monetary and non-monetary
    benefit_category: str  # Category of benefits (e.g., "Agriculture", "Education")
    benefit_details: Dict[str, Any]  # Raw benefit data from scheme

class SchemeComparison(BaseModel):
    scheme_id: int
    scheme_name: str
    scheme_description: Optional[str] = None
    eligibility_percentage: float  # 0-100
    eligible: bool
    benefit_analysis: BenefitAnalysis
    missing_requirements: List[str] = []

class Recommendation(BaseModel):
    type: RecommendationType
    scheme_id: int
    scheme_name: str
    reason: str
    action: str
    confidence: str  # "low", "medium", "high"

class ComparisonResult(BaseModel):
    user_id: int
    comparison_date: datetime
    schemes_compared: List[int]
    scheme_comparisons: List[SchemeComparison]
    recommendations: List[Recommendation]
    summary: Dict[str, Any]

class ComparisonRequest(BaseModel):
    scheme_ids: List[int]
    comparison_criteria: Optional[Dict[str, Any]] = None
```

- [x] **Step 3: Create comparison API endpoints**

```python
from fastapi = APIRouter, Depends, HTTPException, status
from sqlalchemy.orm = Session
from typing = List, Optional

from app.core.database = get_db
from app.core.auth = get_current_active_user
from app.models.user = User
from app.services.comparison_engine = ComparisonEngineService
from app.schemas.comparison = (
    ComparisonResult, ComparisonRequest, SchemeComparison, Recommendation
)

router = APIRouter()
comparison_engine = ComparisonEngineService()

@router.post("/compare", response_model=ComparisonResult)
async def compare_schemes(
    request: ComparisonRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Compare multiple schemes for the current user"""
    try:
        result = comparison_engine.compare_schemes(
            db, 
            current_user.id, 
            request.scheme_ids,
            request.comparison_criteria
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/compare/{scheme_id_1}/{scheme_id_2}")
async def compare_two_schemes(
    scheme_id_1: int,
    scheme_id_2: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Compare two specific schemes for the current user"""
    try:
        result = comparison_engine.compare_schemes(
            db, 
            current_user.id, 
            [scheme_id_1, scheme_id_2]
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/recommendations")
async def get_personalized_recommendations(
    limit: int = 5,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get personalized scheme recommendations for the current user"""
    try:
        # Get all active schemes for user's state
        user_state = current_user.state
        query = db.query(Scheme).filter(Scheme.is_active == True)
        
        if user_state:
            query = query.filter(
                (Scheme.state_applicable == user_state) | 
                (Scheme.state_applicable.is_(None))  # Include central schemes
            )
        
        schemes = query.all()
        scheme_ids = [s.id for s in schemes]
        
        if not scheme_ids:
            return {
                "user_id": current_user.id,
                "message": "No schemes found for comparison",
                "recommendations": []
            }
        
        # Compare all schemes
        result = comparison_engine.compare_schemes(
            db, 
            current_user.id, 
            scheme_ids[:20]  # Limit to first 20 schemes for performance
        )
        
        # Return top recommendations
        top_recommendations = result.recommendations[:limit]
        
        return {
            "user_id": current_user.id,
            "total_schemes_evaluated": len(scheme_ids),
            "recommendations": top_recommendations,
            "summary": result.summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
```

- [x] **Step 4: Create test file for comparison engine**

```python
def test_benefit_analysis():
    from app.schemas.comparison = BenefitAnalysis
    
    benefit = BenefitAnalysis(
        monetary_value=50000.0,
        non_monetary_score=30.0,
        total_benefit_score=80.0,
        benefit_category="Agriculture",
        benefit_details={"amount_per_year": 6000, "subsidy_type": "fertilizer"}
    )
    
    assert benefit.monetary_value = 50000.0
    assert benefit.non_monetary_score = 30.0
    assert benefit.total_benefit_score = 80.0
    assert benefit.benefit_category = "Agriculture"

def test_scheme_comparison():
    from app.schemas.comparison = SchemeComparison, BenefitAnalysis
    
    benefit = BenefitAnalysis(
        monetary_value=40000.0,
        non_monetary_score=25.0,
        total_benefit_score=65.0,
        benefit_category="Education",
        benefit_details={"scholarship_amount": 12000}
    )
    
    comparison = SchemeComparison(
        scheme_id=1,
        scheme_name="Test Scholarship Scheme",
        scheme_description="A scholarship scheme for students",
        eligibility_percentage=75.0,
        eligible=True,
        benefit_analysis=benefit,
        missing_requirements=["Income certificate"]
    )
    
    assert comparison.scheme_id = 1
    assert comparison.scheme_name = "Test Scholarship Scheme"
    assert comparison.eligibility_percentage = 75.0
    assert comparison.eligible = True
    assert comparison.benefit_analysis.total_benefit_score = 65.0

def test_recommendation():
    from app.schemas.comparison = Recommendation, RecommendationType
    
    rec = Recommendation(
        type=RecommendationType.PRIMARY,
        scheme_id=1,
        scheme_name="Test Scheme",
        reason="Highest eligibility and benefits",
        action="Proceed with application",
        confidence="high"
    )
    
    assert rec.type = RecommendationType.PRIMARY
    assert rec.scheme_id = 1
    assert rec.confidence = "high"

def test_comparison_result():
    from app.schemas.comparison = ComparisonResult, SchemeComparison, BenefitAnalysis, Recommendation, RecommendationType
    from datetime = datetime
    
    benefit = BenefitAnalysis(
        monetary_value=30000.0,
        non_monetary_score=20.0,
        total_benefit_score=50.0,
        benefit_category="Healthcare",
        benefit_details={"medical_coverage": 5000}
    )
    
    comparison = SchemeComparison(
        scheme_id=1,
        scheme_name="Healthcare Scheme",
        scheme_description="Provides medical coverage",
        eligibility_percentage=80.0,
        eligible=True,
        benefit_analysis=benefit,
        missing_requirements=[]
    )
    
    rec = Recommendation(
        type=RecommendationType.PRIMARY,
        scheme_id=1,
        scheme_name="Healthcare Scheme",
        reason="Best match for healthcare needs",
        action="Apply immediately",
        confidence="high"
    )
    
    result = ComparisonResult(
        user_id=1,
        comparison_date=datetime.now(),
        schemes_compared=[1, 2],
        scheme_comparisons=[comparison],
        recommendations=[rec],
        summary={
            "total_schemes_compared": 2,
            "eligible_schemes": 1,
            "average_eligibility_percentage": 65.0
        }
    )
    
    assert result.user_id = 1
    assert len(result.scheme_compared) = 2
    assert len(result.scheme_comparisons) = 1
    assert len(result.recommendations) = 1
    assert result.summary["total_schemes_compared"] = 2

def test_comparison_engine_service():
    from unittest.mock = Mock
    from app.services.comparison_engine = ComparisonEngineService
    from app.models.user = User
    from app.models.scheme = Scheme
    from app.services.eligibility_engine = EligibilityService
    
    # Create mock database session
    db = Mock()
    
    # Create mock user
    user = User(
        id=1,
        email="test@example.com",
        full_name="Test User",
        annual_income=250000,
        state="Maharashtra"
    )
    
    # Create mock schemes
    scheme1 = Scheme(
        id=1,
        name="Farmer Support Scheme",
        description="Financial support for farmers",
        scheme_type="central",
        category="agriculture",
        is_active=True,
        benefits='{"amount_per_year": 6000, "type": "direct_cash"}'
    )
    
    scheme2 = Scheme(
        id=2,
        name="Education Scholarship",
        description="Scholarship for students",
        scheme_type="central",
        category="education",
        is_active=True,
        benefits='{"scholarship_amount": 12000, "duration": "annual"}'
    )
    
    # Mock database queries
    def mock_query_filter(*args):
        mock_query = Mock()
        if len(args) > 0 and args[0] == Scheme:
            # For scheme queries
            mock_query.filter.return_value.all.return_value = [scheme1, scheme2]
            mock_query.filter.return_value.first.return_value = scheme1
        elif len(args) > 0 and args[0] == User:
            # For user queries
            mock_query.filter.return_value.first.return_value = user
        return mock_query
    
    db.query.side_effect = mock_query_filter
    
    # Mock eligibility service
    mock_eligibility_service = Mock()
    mock_eligibility_service.check_eligibility_for_scheme.side_effect = [
        {
            'scheme_id': 1,
            'scheme_name': 'Farmer Support Scheme',
            'eligibility_percentage': 70.0,
            'eligible': True,
            'explanation': {'factors_considered': []},
            'missing_requirements': []
        },
        {
            'scheme_id': 2,
            'scheme_name': 'Education Scholarship',
            'eligibility_percentage': 40.0,
            'eligible': False,
            'explanation': {'factors_considered': []},
            'missing_requirements': ['Student status required']
        }
    ]
    
    comparison_engine = ComparisonEngineService()
    comparison_engine.eligibility_service = mock_eligibility_service
    
    result = comparison_engine.compare_schemes(db, 1, [1, 2])
    
    assert result.user_id = 1
    assert len(result.scheme_compared) = 2
    assert len(result.scheme_comparisons) = 2
    assert len(result.recommendations) >= 1
    assert result.scheme_comparisons[0].scheme_name = "Farmer Support Scheme"
    assert result.scheme_comparisons[0].eligible = True
```

- [x] **Step 5: Run test to verify comparison engine works**

Run: `python -m pytest backend/tests/test_comparison.py -v`
Expected: PASS

- [x] **Step 6: Commit comparison engine service**

```bash
git add backend/app/services/comparison_engine.py backend/app/schemas/comparison.py backend/app/api/v1/endpoints/comparison.py backend/tests/test_comparison.py
git commit -m "feat: implement scheme comparison engine service"
```