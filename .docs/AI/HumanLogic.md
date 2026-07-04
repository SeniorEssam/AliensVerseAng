# 🧠 AliensVerse Frontend Master Plan (Extended with Naming & Structure Rules)

---

# 📌 1. Core Philosophy

Everything is a plugin  
Everything is optional  
Everything is installable  
Everything is isolated  

---

# 🧱 2. Global Naming Conventions

## 2.1 General Rules

- Use kebab-case for folders
- Use PascalCase for classes
- Use camelCase for variables/functions
- Use suffix-based naming

---

## 2.2 Required Suffixes

| Type        | Suffix        | Example                     |
|------------|--------------|-----------------------------|
| Component  | Component     | SalesInvoiceListComponent   |
| Service    | Service       | SalesInvoiceService         |
| Module     | Module        | SalesInvoiceModule          |
| Store      | Store         | SalesInvoiceStore           |
| API Model  | Model         | SalesInvoiceModel           |
| DTO        | Dto           | SalesInvoiceDto             |
| Config     | Config        | SalesInvoiceConfig          |

---

## 2.3 File Naming

Examples:

sales-invoice.component.ts  
sales-invoice.service.ts  
sales-invoice.store.ts  
sales-invoice.routes.ts  

---

# 🧩 3. Monorepo Structure

frontend/
├── apps/
│   ├── erp-app/
│   ├── ecommerce-app/
│   ├── crm-app/
│
├── libs/
│   ├── sdk/
│   ├── ui/
│   ├── plugins/
│   ├── features/

---

# 🔐 4. Import Rules (STRICT)

## ❌ NOT ALLOWED

- feature → feature direct import
- plugin → feature direct import
- app → feature internal files import

## ✅ ALLOWED

- feature → sdk
- feature → ui
- plugin → sdk
- app → plugin
- app → feature (via public API only)

---

# 📦 5. SDK Structure Rules

libs/sdk/auth-sdk/
├── src/
│   ├── lib/
│   │   ├── services/
│   │   ├── models/
│   │   ├── utils/
│   │
│   ├── public-api.ts

## Rules

- MUST expose only via public-api.ts
- NO UI inside SDK
- NO Angular Components inside SDK

---

# 🎨 6. UI Library Rules

libs/ui/design-system/
├── button/
├── input/
├── modal/

Rules:
- Pure UI only
- No business logic
- Reusable across all apps

---

# 🧩 7. Plugin Structure (STRICT)

libs/plugins/auth-plugin/
├── src/
│   ├── lib/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── activation/
│   │   │
│   │   ├── components/
│   │   ├── services/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │
│   ├── public-api.ts

## Rules

- Plugin MUST have routes
- Plugin MAY use SDKs
- Plugin MUST NOT contain heavy business logic
- Plugin MUST be installable

---

# 🧱 8. Feature Structure (CRITICAL)

Each feature MUST follow this exact structure:

libs/features/sales-invoice-create/
├── src/
│   ├── lib/
│   │   ├── pages/
│   │   │   ├── create/
│   │   │   │   ├── sales-invoice-create.component.ts
│   │   │   │   ├── sales-invoice-create.html
│   │   │   │   ├── sales-invoice-create.scss
│   │   │
│   │   ├── components/
│   │   │   ├── invoice-form/
│   │   │   ├── invoice-items/
│   │   │
│   │   ├── services/
│   │   │   ├── sales-invoice.service.ts
│   │   │
│   │   ├── store/
│   │   │   ├── sales-invoice.store.ts
│   │   │
│   │   ├── models/
│   │   │   ├── sales-invoice.model.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── sales-invoice.routes.ts
│   │   │
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   ├── ar.json
│   │
│   ├── public-api.ts

---

## 8.1 Feature Rules

Feature MUST:

- be fully isolated
- have its own routes
- have its own translations
- use SDK only for API
- not depend on other features

---

# 🌍 9. Translation Rules

## Structure

global:
    /i18n/global/

feature:
    /feature/i18n/

## Rules

- No global giant file
- Each feature owns its translations
- Lazy load translations

---

# 🔌 10. Plugin vs Feature

| Type    | Purpose                          |
|--------|----------------------------------|
| SDK    | Logic + API                      |
| UI     | Pure Components                  |
| Plugin | Screens + Routing                |
| Feature| Small Business Unit              |

---

# 🧪 11. Execution Mapping (Backend → Frontend)

---

## STEP 1: API SDK

Maps to:
- Controllers
- ResponseAPI

Output:
- api.service.ts
- interceptors

---

## STEP 2: Device SDK

Maps to:
- DeviceController
- DeviceVerification

Output:
- device.service.ts

---

## STEP 3: Activation Plugin

Maps to:
- Device activation middleware

Output:
- activation UI

---

## STEP 4: Auth Plugin

Maps to:
- AuthController

Output:
- login UI

---

## STEP 5: Notifications Plugin

Maps to:
- NotificationHub

Output:
- real-time UI

---

## STEP 6: Reports Plugin

Maps to:
- ReportsController

Output:
- dynamic report renderer

---

## STEP 7: File Upload Plugin

Maps to:
- FileUploadController

Output:
- upload UI

---

## STEP 8: Localization

Maps to:
- LocalizationController

Output:
- translation system

---

# 🚨 12. Strict AI Rules

AI MUST:

- create Feature OR Plugin OR SDK only
- follow folder structure exactly
- use public-api.ts only
- isolate everything

AI MUST NOT:

- mix layers
- create shared logic inside features
- duplicate code
- bypass SDK

---

# 🎯 Final Goal

- Modular system
- Independent apps
- Installable features
- Secure codebase
- Scalable SaaS architecture
