# PrimeWay developer platform



**Developer quickstart**  

```json
{
  "project": {
    "name": "My First Primeway Project",
    "version": "1.0.0",
    "description": "Описание вашего проекта"
  },
  "server": {
    "host": "localhost",
    "port": 8080
  },
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "username": "db_user",
    "password": "db_password",
    "database_name": "primeway_db"
  },
  "api": {
    "endpoint": "/api/v1",
    "token": "your_api_token_here"
  },
  "logging": {
    "level": "info",
    "file": "/var/log/primeway/app.log"
  }
}
```
