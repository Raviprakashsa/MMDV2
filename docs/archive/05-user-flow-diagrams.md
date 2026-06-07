# 05 — User Flow Diagrams

## Executive Summary
Mermaid diagrams for primary user journeys. Paste into any Mermaid-enabled renderer.

## Login Flow
```mermaid
flowchart LR
  A[User] --> B[Visit Login Page]
  B --> C[Submit Credentials]
  C --> D{Valid?}
  D -- Yes --> E[Issue Session / JWT]
  D -- No --> F[Show Error]
  E --> G[Redirect to Dashboard]
```

## Registration Flow
```mermaid
flowchart LR
  A[User] --> B[Visit Signup]
  B --> C[Provide Info]
  C --> D[Validate]
  D --> E[Create Account]
  E --> F[Send Verification Email]
  F --> G[User Verifies] --> H[Activate Account]
```

## Dashboard Flow
```mermaid
flowchart LR
  A[Dashboard] --> B[Load Widgets]
  B --> C[API Calls]
  C --> D[Render Data]
  D --> E[User Interacts]
  E --> F[Update Widget / Call API]
```

## Core Business Flow (example)
```mermaid
flowchart LR
  A[New Lead] --> B[Create Record]
  B --> C[Trigger Automation]
  C --> D[Notification & Assignment]
```

## Admin Flow
```mermaid
flowchart LR
  A[Admin] --> B[Open Admin Panel]
  B --> C[Manage Users]
  C --> D[Update Roles / Permissions]
```
```
