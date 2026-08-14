FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["API/NgalaFarms.API.csproj", "API/"]
COPY ["Application/NgalaFarms.Application.csproj", "Application/"]
COPY ["Infrastructure/NgalaFarms.Infrastructure.csproj", "Infrastructure/"]
COPY ["Domain/NgalaFarms.Domain.csproj", "Domain/"]

RUN dotnet restore "API/NgalaFarms.API.csproj"

COPY . .
RUN dotnet build "API/NgalaFarms.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "API/NgalaFarms.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "NgalaFarms.API.dll"]
