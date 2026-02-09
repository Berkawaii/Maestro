# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Maestro.Server/Maestro.Server.csproj", "Maestro.Server/"]
RUN dotnet restore "Maestro.Server/Maestro.Server.csproj"
COPY . .
WORKDIR "/src/Maestro.Server"
RUN dotnet build "Maestro.Server.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "Maestro.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Maestro.Server.dll"]
