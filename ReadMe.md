# Create backend folder
mkdir -p backend/src/{config,controllers,middleware,models,routes,utils,types}

# Create files
touch backend/src/config/db.ts
touch backend/src/controllers/authController.ts
touch backend/src/middleware/auth.ts
touch backend/src/models/User.ts
touch backend/src/routes/auth.ts
touch backend/src/utils/generateTokens.ts
touch backend/src/index.ts
touch backend/src/types/express.d.ts

# Backend configs
touch backend/package.json
touch backend/tsconfig.json




# Create frontend folder
mkdir -p frontend/src/{api,pages,components,context,hooks}

# Create files
touch frontend/src/api/axios.ts
touch frontend/src/pages/Login.tsx
touch frontend/src/pages/Register.tsx
touch frontend/src/pages/Dashboard.tsx
touch frontend/src/components/ProtectedRoute.tsx
touch frontend/src/context/AuthContext.tsx
touch frontend/src/hooks/useAuth.ts
touch frontend/src/App.tsx
touch frontend/src/main.tsx

# Frontend configs
touch frontend/package.json
touch frontend/tsconfig.json







mern-auth/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                 # MongoDB connection
│   │   ├── controllers/
│   │   │   └── authController.ts     # register, login, refresh, logout
│   │   ├── middleware/
│   │   │   └── auth.ts               # JWT verification middleware
│   │   ├── models/
│   │   │   └── User.ts               # User schema (email + password)
│   │   ├── routes/
│   │   │   └── auth.ts               # Auth routes
│   │   ├── utils/
│   │   │   └── generateTokens.ts     # Generate AT + RT
│   │   ├── index.ts                  # App entrypoint
│   │   └── types/express.d.ts        # Custom TS types (req.user)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.ts              # Axios instance with interceptors
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   └── Dashboard.tsx         # Protected route
    │   ├── components/
    │   │   └── ProtectedRoute.tsx    # Wrapper for protected pages
    │   ├── context/
    │   │   └── AuthContext.tsx       # Provides auth state
    │   ├── hooks/
    │   │   └── useAuth.ts            # Custom hook for auth
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── tsconfig.json
