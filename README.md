# 🌴 Ngala Farms Management System

**Professional agricultural business management platform** for palm oil and cattle production operations. Full-stack application built with React, .NET Core, and SQLite.

## 📋 Project Overview

Ngala Farms Management System is a comprehensive, production-ready solution for managing:

### 🌴 **Palm Oil Division**
- Plantation and block management
- Harvest tracking and recording
- Palm fruit processing
- Palm oil inventory management
- Sales and revenue tracking

### 🐄 **Cattle Division**
- Cattle registration and tracking
- Health and vaccination records
- Feeding management
- Weight tracking and growth monitoring
- Purchase and sales records

### 💼 **Business Operations**
- Financial analytics and reporting
- Employee management and payroll
- Expense tracking by division
- Customer and supplier management
- Weekly automated reports
- Audit logs and activity tracking
- Company settings and branding

---

## 🏗️ Technology Stack

### **Frontend**
- **React 18** with TypeScript support
- **Vite** (next-generation build tool)
- **Tailwind CSS** (utility-first styling)
- **React Router** v6 (navigation)
- **React Hook Form** (form management)
- **TanStack Query** (data fetching & caching)
- **Recharts** (charts and analytics)
- **Axios** (HTTP client)
- **Lucide React** (icons)

### **Backend**
- **.NET 9** (latest LTS)
- **ASP.NET Core Web API**
- **Entity Framework Core 9** (ORM)
- **SQL Server Compact / SQLite** (development)
- **JWT Authentication**
- **Role-Based Access Control (RBAC)**
- **SignalR** (real-time notifications)

### **Database**
- **SQLite** (primary - portable, file-based)
- **Prepared for PostgreSQL** migration (all queries EF Core abstracted)

---

## 📁 Project Structure

```
ngala-farms/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── pages/           # Page components (Founder & Manager)
│   │   ├── components/      # Reusable components
│   │   ├── layouts/         # Layout wrappers
│   │   ├── lib/             # Utilities (API, auth, hooks)
│   │   └── App.jsx          # Main router
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # .NET Core application
│   ├── API/                 # Web API controllers & middleware
│   ├── Application/         # DTOs, Services, Business Logic
│   ├── Domain/              # Entities, Enums, Interfaces
│   │   ├── Entities/        # Database models
│   │   ├── Enums/           # Enumeration types
│   │   └── Interfaces/      # Contracts
│   └── Infrastructure/      # DbContext, Repositories, DI
│       ├── Data/            # Entity Framework setup
│       ├── Services/        # Token, Audit, ID generation
│       └── Seed/            # Database seeding
│
└── docs/                     # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (Frontend)
- **.NET 9** SDK (Backend)
- **npm** or **yarn** (Package management)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Backend Setup

```bash
cd backend/API
dotnet build
dotnet run
```

Backend API runs on `http://localhost:5000`

---

## 🔐 Authentication

### Demo Credentials

**Founder Account:**
- Email: `founder@ngalafarms.com`
- Password: `Founder@2026`

**Manager Account:**
- Email: `manager@ngalafarms.com`
- Password: `Manager@2026`

---

## 📊 Key Features

### **Founder Dashboard**
- Real-time financial KPIs
- Palm oil and cattle analytics
- Weekly automated reports
- Company performance trends
- Audit log viewing
- Employee and resource overview

### **Manager Dashboard**
- Daily operations overview
- Palm harvest and production tracking
- Cattle health alerts
- Quick action buttons
- Sales and expense tracking
- Employee management

### **Palm Oil Management**
- Multi-plantation support with blocks
- Harvest recording with geolocation
- Processing tracking (yield calculation)
- Inventory management with low-stock alerts
- Sales invoicing and revenue tracking

### **Cattle Management**
- Unique cattle ID generation
- Complete health and vaccination history
- Weight tracking with growth charts
- Feeding schedule and cost tracking
- Purchase and sale documentation

### **Financial Management**
- Expense categorization by division
- Payroll automation
- Weekly profit/loss calculations
- Revenue tracking from sales
- Financial reporting and exports

### **Administrative**
- Company settings and branding
- Logo management
- User role management
- Audit trail of all operations

---

## 📈 Analytics & Reports

### **Weekly Reports**
- Automated Sunday report generation
- Palm fruit harvested and oil produced
- Cattle acquisitions and sales
- Financial summary (revenue, expenses, profit)
- Health alerts and vaccination due dates

### **Analytics Dashboard**
- Monthly revenue trends
- Expense breakdown by division
- Per-division profitability analysis
- YTD performance metrics
- Growth indicators

---

## 🔑 User Roles

### **Founder**
- Full system access
- Financial oversight
- Employee management
- Report generation
- System configuration
- Audit log access

### **Manager**
- Daily operations management
- Harvest and production recording
- Cattle health management
- Expense tracking
- Sales recording
- Employee management

---

## 🛠️ Development & Architecture

### **Clean Architecture**
- **Domain Layer**: Business entities and contracts
- **Application Layer**: DTOs, services, business logic
- **Infrastructure Layer**: Database, repositories, external services
- **API Layer**: Controllers, middleware, configuration

### **Business Rules**
- Soft deletion for audit trails
- Automatic timestamp tracking
- ID generation with prefixes (EMP-, COW-, HAR-, etc.)
- Inventory tracking with transactions
- Role-based authorization

---

## 📦 Database Schema

**Key Entities:**
- `ApplicationUser`, `Role`
- `Plantation`, `PalmBlock`
- `PalmHarvest`, `PalmProcessing`, `PalmOilBatch`
- `Cattle`, `CattleHealthRecord`, `CattleVaccination`, `CattleFeeding`
- `Employee`, `Salary`
- `Sale`, `CattleSale`, `Customer`, `Supplier`
- `Expense`, `Inventory`, `StockTransaction`
- `WeeklyReport`, `AuditLog`, `Notification`
- `CompanySettings`

---

## 🔄 Future Enhancements

1. **PostgreSQL Migration** - Switch from SQLite to PostgreSQL for production
2. **Mobile App** - React Native companion app for field operations
3. **Real-time Notifications** - SignalR implementation for live alerts
4. **SMS/Email Integration** - Automated alerts and reports
5. **Advanced Analytics** - Predictive analytics for forecasting
6. **Multi-language Support** - Internationalization (i18n)
7. **API Documentation** - Swagger/OpenAPI specs
8. **Performance Optimization** - Caching strategies, query optimization

---

## 📝 API Endpoints

### **Auth**
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (clear tokens)

### **Dashboard**
- `GET /api/dashboard/founder` - Founder KPI dashboard
- `GET /api/dashboard/manager` - Manager operations dashboard

### **Analytics**
- `GET /api/analytics` - Company analytics with date range filtering

### **Palm Oil**
- `GET/POST /api/palm-harvests` - Harvest management
- `GET/POST /api/palm-processing` - Processing records
- `GET /api/inventory` - Stock levels

### **Cattle**
- `GET/POST /api/cattle` - Cattle registration
- `GET/POST /api/cattle/health` - Health records
- `GET/POST /api/cattle/vaccinations` - Vaccination tracking
- `GET/POST /api/cattle/feeding` - Feeding logs
- `GET/POST /api/cattle/weights` - Weight tracking

### **Business**
- `GET/POST /api/employees` - Employee management
- `GET/POST /api/payroll` - Salary management
- `GET/POST /api/expenses` - Expense tracking
- `GET/POST /api/sales` - Sales records
- `GET/POST /api/customers` - Customer management
- `GET/POST /api/suppliers` - Supplier management

### **Admin**
- `GET /api/reports` - Weekly reports
- `GET /api/audit-logs` - Audit trail
- `GET /api/notifications` - Notifications
- `GET/PUT /api/company-settings` - Company configuration

---

## 🧪 Testing

```bash
# Backend unit tests
dotnet test backend/

# Frontend tests
npm run test
```

---

## 📄 License

This project is proprietary software for Ngala Farms.

---

## 👥 Support

For issues, questions, or contributions, contact the development team.

**Build Date:** August 2026  
**Version:** 1.0.0

---

**🌴 Built for sustainable agricultural business management.**
