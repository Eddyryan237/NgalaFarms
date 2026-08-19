FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["backend/API/NgalaFarms.API.csproj", "backend/API/"]
COPY ["backend/Application/NgalaFarms.Application.csproj", "backend/Application/"]
COPY ["backend/Infrastructure/NgalaFarms.Infrastructure.csproj", "backend/Infrastructure/"]
COPY ["backend/Domain/NgalaFarms.Domain.csproj", "backend/Domain/"]

RUN dotnet restore "backend/API/NgalaFarms.API.csproj"

COPY . .
RUN dotnet build "backend/API/NgalaFarms.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "backend/API/NgalaFarms.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
ENTRYPOINT ["sh", "-c", "dotnet NgalaFarms.API.dll --urls http://+:${PORT:-5000}"]
