# Ngala Farms Deployment Guide

## Development Environment

### Prerequisites
- Node.js 18+
- .NET 9 SDK
- npm/yarn

### Start Development Servers

**Terminal 1 - Backend API:**
```bash
cd backend/API
dotnet run
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## Production Deployment with Docker

### Prerequisites
- Docker
- Docker Compose

### Build & Deploy

```bash
docker-compose up -d --build
```

This will:
- Build backend API container
- Build frontend with Nginx
- Create persistent volume for database
- Run both services in production

### Access Application
- Frontend: `http://localhost`
- API: `http://localhost:5000`

---

## Database Migration (SQLite → PostgreSQL)

### Step 1: Install PostgreSQL Provider
```bash
dotnet add backend/Infrastructure/NgalaFarms.Infrastructure.csproj package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.0
```

### Step 2: Update Connection String
Change `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=postgres-server;Database=ngala_farms;User Id=postgres;Password=your_password;"
  }
}
```

### Step 3: Update DbContext
```csharp
// In Infrastructure/DependencyInjection.cs
services.AddDbContext<NgalaFarmsDbContext>(options =>
{
    if (usePostgres)
        options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
    else
        options.UseSqlite(configuration.GetConnectionString("DefaultConnection"));
});
```

### Step 4: Run Migrations
```bash
dotnet ef database update
```

---

## Environment Variables

Create `.env` file in project root:

```env
ASPNETCORE_ENVIRONMENT=Production
JWT_SECRET=your-secure-secret-key-here
DATABASE_URL=postgresql://user:password@host:5432/ngala_farms
```

---

## Monitoring & Logs

### Backend Logs
```bash
docker logs -f ngala-farms_ngala-api_1
```

### Frontend Logs
```bash
docker logs -f ngala-farms_ngala-frontend_1
```

---

## Backup & Recovery

### Backup SQLite Database
```bash
cp ngala-farms.db ngala-farms.db.backup
```

### Backup with Docker Volume
```bash
docker run --rm -v ngala-farms_ngala-data:/data -v $(pwd):/backup alpine tar czf /backup/ngala-farms-backup.tar.gz /data
```

### Restore Database
```bash
docker run --rm -v ngala-farms_ngala-data:/data -v $(pwd):/backup alpine tar xzf /backup/ngala-farms-backup.tar.gz -C /
```

---

## Performance Optimization

### Frontend
- Code splitting with React Router
- Lazy loading components
- Gzip compression via Nginx
- CDN for static assets

### Backend
- Database query optimization
- Caching with Redis (future)
- Load balancing
- Horizontal scaling with Kubernetes

---

## Security Checklist

- [x] HTTPS/TLS in production
- [x] JWT token rotation
- [x] RBAC enforcement
- [x] Input validation
- [x] SQL injection prevention (EF Core)
- [x] CORS configuration
- [x] Environment variables for secrets
- [ ] Rate limiting
- [ ] DDoS protection
- [ ] Security audit logging

---

## Troubleshooting

### API won't start
```bash
dotnet run --verbosity diagnostic
```

### Frontend build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database connection error
- Check connection string
- Verify SQLite file permissions
- Run migrations: `dotnet ef database update`

### Port conflicts
- Check if port 5000 or 5173 is in use
- Change port in appsettings or vite.config.js

---

## Support

For deployment issues, check:
1. Docker logs
2. Environment variables
3. Database migrations
4. Network connectivity
5. Firewall rules
