# API Sentinel — API Abuse & Anomaly Detection Platform

A full-stack security monitoring application that tracks API requests, analyses request behaviour, and flags potentially abusive traffic based on configurable request thresholds.

## Overview

APIs can be abused through excessive requests, brute-force attempts, automated bots, scraping, or unusual traffic patterns.

**API Sentinel** provides a simple monitoring system that:

* Logs incoming API requests
* Stores request metadata in MySQL
* Tracks request activity by IP address
* Detects repeated requests from the same IP
* Flags potentially suspicious requests
* Displays request activity through a web dashboard
* Provides a request simulator for testing the detection system

The current version implements a **threshold-based detection MVP**.

---

## Application Flow

```text
                    ┌──────────────────┐
                    │   React Dashboard │
                    └────────┬─────────┘
                             │
                         HTTP / JSON
                             │
                             ▼
                    ┌──────────────────┐
                    │ Spring Boot API  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Controller    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Service      │
                    │ Business Logic   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Repository    │
                    └────────┬─────────┘
                             │
                       JPA / Hibernate
                             │
                             ▼
                    ┌──────────────────┐
                    │      MySQL       │
                    └──────────────────┘
```

### Request Processing

```text
API Request
     ↓
Request received
     ↓
Request metadata logged
     ↓
Existing requests from IP counted
     ↓
Threshold checked
     ↓
Normal / Suspicious
     ↓
Saved in MySQL
     ↓
Displayed on dashboard
```

---

## Features

### 1. Request Monitoring

The application records:

* IP Address
* Endpoint
* HTTP Method
* Status Code
* Timestamp
* Suspicious status

### 2. Abuse Detection

The current MVP uses a simple IP-based threshold rule.

If an IP already has **4 existing request records**, the next request from that IP is marked as suspicious.

Example:

```text
Request 1 → Normal
Request 2 → Normal
Request 3 → Normal
Request 4 → Normal
Request 5 → Suspicious
```

This demonstrates the basic concept of threshold-based API abuse detection.

> This is an MVP detection rule and is not intended to replace a production-grade rate limiter or security system.

### 3. Security Dashboard

The React dashboard displays:

* Total requests
* Normal requests
* Suspicious requests
* Suspicious request percentage
* Unique IP addresses
* Recent request activity
* HTTP status information
* Detection rules
* Test traffic simulator

### 4. Request Simulator

The dashboard includes a test form that allows requests to be simulated using:

* IP address
* Endpoint
* HTTP method
* Status code

This makes it possible to test the abuse detection logic without manually constructing every request in Postman.

---

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* MySQL
* Maven

### Frontend

* React
* Vite
* JavaScript
* CSS
* Fetch API

### Development Tools

* IntelliJ IDEA
* Visual Studio Code
* MySQL
* Postman
* Git
* GitHub

---

## Backend Architecture

The backend follows a layered architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
JPA / Hibernate
    ↓
MySQL
```

### Controller

Handles HTTP requests and responses.

Example endpoints:

```text
POST /api/requests
GET  /api/requests
GET  /api/health
```

### Service

Contains the application's business logic.

The service:

1. Adds the server timestamp
2. Counts existing requests from the IP
3. Applies the detection threshold
4. Saves the request

### Repository

Uses Spring Data JPA to communicate with the database.

The repository provides operations such as:

```text
save()
findAll()
findById()
deleteById()
```

and a custom derived query:

```text
countByIpAddress()
```

### Database

MySQL stores the request logs.

---

## RequestLog Data Model

Each request is represented by the following fields:

| Field      | Description                     |
| ---------- | ------------------------------- |
| id         | Unique request ID               |
| ipAddress  | Source IP address               |
| endpoint   | Requested API endpoint          |
| method     | HTTP method                     |
| statusCode | HTTP response status            |
| timestamp  | Server-side request timestamp   |
| suspicious | Whether the request was flagged |

---

## REST API

### Health Check

```http
GET /api/health
```

Response:

```text
API is running
```

### Get All Requests

```http
GET /api/requests
```

Returns all recorded request logs.

### Create Request Log

```http
POST /api/requests
Content-Type: application/json
```

Example:

```json
{
  "ipAddress": "10.0.0.5",
  "endpoint": "/login",
  "method": "POST",
  "statusCode": 401
}
```

The timestamp and suspicious status are determined by the backend.

---

## Local Setup

### Prerequisites

Install:

* Java
* Maven
* MySQL
* Node.js
* npm
* Git

### 1. Create the Database

Open MySQL and run:

```sql
CREATE DATABASE api_abuse_detector;
```

### 2. Configure the Backend

Update:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.application.name=api-abuse-detector

spring.datasource.url=jdbc:mysql://localhost:3306/api_abuse_detector
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

**Do not commit your real database password to GitHub.**

### 3. Start the Backend

From the Spring Boot project:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

### 4. Start the Frontend

Navigate to the React project:

```bash
cd api-abuse-dashboard
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## Testing the Detection System

You can test the system using Postman or the dashboard's **Test Traffic** form.

Use the same IP address repeatedly:

```text
IP: 10.0.0.5
Endpoint: /login
Method: POST
Status: 401
```

Send multiple requests.

The fifth request from the same IP should be flagged:

```text
Normal → Normal → Normal → Normal → Suspicious
```

The dashboard should then update the suspicious request count.

---

## Project Structure

### Backend

```text
api-abuse-detector/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com.uzaer.apiabusedetector/
│       │       ├── controller/
│       │       │   ├── HealthController.java
│       │       │   └── RequestLogController.java
│       │       │
│       │       ├── entity/
│       │       │   └── RequestLog.java
│       │       │
│       │       ├── repository/
│       │       │   └── RequestLogRepository.java
│       │       │
│       │       ├── service/
│       │       │   └── RequestLogService.java
│       │       │
│       │       └── config/
│       │           └── CorsConfig.java
│       │
│       └── resources/
│           └── application.properties
│
└── pom.xml
```

### Frontend

```text
api-abuse-dashboard/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── index.html
```

---

## Why This Project?

The project demonstrates practical understanding of:

* REST API development
* Spring Boot
* Layered backend architecture
* Dependency Injection
* JPA and Hibernate
* MySQL database integration
* HTTP methods
* JSON request/response handling
* Basic security monitoring
* React frontend development
* Frontend-backend communication
* CORS
* Git and GitHub

---

## Future Improvements

The current implementation is intentionally an MVP. Possible improvements include:

* Time-window based rate limiting
* User-based abuse detection
* Multiple detection rules
* Failed-login detection
* IP reputation analysis
* Redis-based request counters
* Spring Security and JWT authentication
* Role-based access control
* Docker deployment
* AWS deployment
* Real-time monitoring
* Alert notifications
* More advanced anomaly detection
* Historical traffic analytics

---

## Current Detection Model

The current detection model is intentionally simple:

```text
Existing requests from IP >= 4
              ↓
       Current request
              ↓
        Suspicious = true
```

A production system would generally consider additional factors such as:

* Requests per time window
* Endpoint sensitivity
* Authentication failures
* User behaviour
* Geographic information
* IP reputation
* Request patterns

---

## Author

**Uzaer Warsi**

Computer Engineering Student
Interested in Backend Development, Cloud Computing and DevOps.

---

## Status

**Current status: MVP completed**

The current version provides a working Spring Boot backend, MySQL persistence, REST APIs, abuse detection logic, and React monitoring dashboard.
