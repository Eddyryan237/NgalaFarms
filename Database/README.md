# Ngala Farms PostgreSQL Database

This folder owns the PostgreSQL container used by the application. The schema is
managed by Entity Framework Core migrations in `backend/Infrastructure/Migrations`.

## Start locally

From `ngala-farms`:

```powershell
docker compose up -d ngala-db
```

The default connection is `ngala_farms` / `ngala` / `ngala_dev_password` on port
`5432`. Override `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` with a
`.env` file or environment variables before starting the stack.

## Apply the schema

The API applies pending migrations automatically before it seeds Identity and
application data. To generate an idempotent SQL deployment script:

```powershell
dotnet ef migrations script --idempotent `
  --project backend/Infrastructure `
  --startup-project backend/API `
  --output Database/schema.sql
```

Do not edit `schema.sql` by hand; regenerate it after changing the EF model.