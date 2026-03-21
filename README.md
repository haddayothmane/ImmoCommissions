# ImmoCommissions - Application Documentation & Report

Welcome to the comprehensive documentation for the **ImmoCommissions** application. This document describes the application architecture, database structure, backend API, and a detailed screen-by-screen user guide.

---

## Table of Contents

1. [Executive Summary & Architecture](#1-executive-summary--architecture)
2. [Database Schema & Multi-Tenancy](#2-database-schema--multi-tenancy)
3. [Core Features](#3-core-features)
4. [Backend API Routing](#4-backend-api-routing)
5. [Screen-by-Screen Frontend Guide](#5-screen-by-screen-frontend-guide)
6. [Security & Access Control](#6-security--access-control)
7. [Installation & Setup](#7-installation--setup)

---

## 1. Executive Summary & Architecture

**ImmoCommissions** is a multi-tenant SaaS application built for Real Estate Agencies to manage their properties, clients, sales contracts, and agent commissions.

### Technology Stack:

- **Backend:** Laravel (PHP) acting as a RESTful API provider.
- **Frontend:** React (TypeScript) building a Single Page Application (SPA), styled with TailwindCSS.
- **Authentication:** Laravel Sanctum (Token-based).
- **Database:** SQLite / MySQL.

### Multi-Tenancy Approach:

The application employs a "single-database multi-tenancy" model. Every major table has an `agency_id`. Users (Agents/Admins) belong to an `Agency`, and all subsequent queries (Clients, Properties, Contracts, Commissions) are automatically scoped globally to the authenticated user's `agency_id` to ensure isolated data access.

---

## 2. Database Schema & Multi-Tenancy

The database is built on a relational structure mapping out the typical flow of real estate sales.

### Core Models:

- **Agency:** Represents the tenant firm.
- **User / Employee:** Users logging into the system. Tied to an `Agency` and a `Role`.
- **Role & Permission:** Granular RBAC (Role-Based Access Control) setup.
- **Client:** Buyers or prospects managed by the agency.
- **Properties:**
    - **Terrain:** Land properties available for sale.
    - **Immeuble:** Buildings containing multiple `Appartements`.
    - **Appartement:** Sub-units of an `Immeuble`.
- **Sales & Financials:**
    - **Contract:** A sale agreement between a `Client` and the `Agency` for a specific property.
    - **PaymentMilestone:** Tranches/Schedules setting when the client must pay.
    - **Paiement:** Actual money received from the client.
- **Commissions:**
    - **Commission:** Reward tied to a `User` (Agent) for securing a `Contract`.
    - **CommissionPayment:** Payout tracking when the agency pays the agent their commission.

---

## 3. Core Features

1.  **Full Property Inventory Management:** Create, read, update, and delete Lands (Terrains), Buildings (Immeubles), and inner apartments. Modals allow seamless uploads of documents/photos.
2.  **Contract Parsing & Client Tracking:** Connect properties to clients with payment milestones. Dashboard-style detailed views for the clients showing their transaction histories.
3.  **Tiered Commission Tracking:** Automatically log agent commissions upon successful sales, with the ability to track how much of the commission has been paid out.
4.  **Role-Based Dashboards:** An Admin can view all agency analytics and change roles, while specific Agents see only what their permissions allow (e.g., restricted from modifying roles).

---

## 4. Backend API Routing

The Laravel backend exposes structured JSON endpoints (found in `routes/api.php`) secured by Sanctum:

- **Authentication:** `/api/login`, `/api/register`, `/api/profile`, `/api/user`
- **Properties CRUD:** `/api/terrains`, `/api/immeubles`, `/api/appartements`
- **Business Flow CRUD:** `/api/clients`, `/api/contracts`, `/api/paiements`
- **Commissions CRUD:** `/api/commissions`, `/api/commissions/{id}/payments`
- **Admin & Settings:** `/api/roles`, `/api/employees`, `/api/onboarding`
- **Extras:** PDF generation endpoints (`/api/contracts/{id}/pdf`) and Revenue stats.

---

## 5. Screen-by-Screen Frontend Guide

This section documents the React user interface mapping (located in `resources/js/pages`).

### A. Marketing & Onboarding

- **`Landing.tsx`:** The public face of the application featuring a Hero section, Feature list, and Call To Actions. Converts visitors and redirects to signup.
- **`Pricing.tsx`:** Showcases the SaaS pricing tiers for prospective agencies.
- **`Auth.tsx`:** The Login and Signup portal. Routes authentication attempts to the backend.
- **`Onboarding.tsx`:** Immediately after signup, the user is required to setup their `Agency` profile.

### B. Core Application (Post-Login)

- **`Dashboard.tsx`:** The homepage for an authenticated user. Displays key metrics, recent sales, and quick links.

**Property Management:**

- **`Inventory.tsx`:** The primary directory for properties. Users toggle between Terrains and Immeubles here.
- **`Terrains / Immeubles / Appartements (.tsx)`:** Dedicated list views with DataTables, pagination, and action buttons.
- **`ImmeubleDetails.tsx` / `AppartementDetails.tsx`:** Deep-dive screens for a specific property showing description, price, attached documents, and current availability status.

**Client & Sales Management:**

- **`Clients.tsx`:** A list of all buyers.
- **`ClientDetails.tsx`:** A modern dashboard view for a single client. Displays their personal info, a list of their signed `Contracts`, and aggregated `Paiements`.
- **`Contracts.tsx` & `CreateContract.tsx`:** Screens managing the binding of a Client to a Property, generating a sale, and setting up the PaymentMilestones.
- **`Paiements.tsx`:** Centralized ledger of all incoming money from clients.

**Internal Operations:**

- **`Commissions.tsx`:** A list of agent commissions. Admins see all; lower-tier agents see their own.
- **`CommissionDetails.tsx`:** Details a specific commission, showing the total owed, the amount paid out so far, and a form to add new `CommissionPayments`.

**Admin & Settings:**

- **`Roles.tsx`:** Interface for managing system roles. Admins can check/uncheck specific permissions (e.g., "create-client", "view-commissions").
- **`Employees.tsx`:** Team management. Add agents to the agency and assign them roles.
- **`Settings.tsx`:** Agency profile and user preferences updates.
- **`Unauthorized.tsx`:** Fallback page shown when an agent tries to access a URL they lack the permissions for.

---

## 6. Security & Access Control

- **API Security:** All API routes (except login/register) are guarded by the `auth:sanctum` middleware.
- **Frontend Routing Security:** React utilizes contexts to check user permissions. If an agent lacks a required permission slug (e.g., `manage-roles`), the UI dynamically hides buttons like "Delete" or routes them to `Unauthorized.tsx`.
- **Scoped Queries:** The Laravel `BelongsToAgency` trait uses global scopes. An agent from Agency A can never accidentally query a Client from Agency B via URL manipulation.

---

## 7. Installation & Setup

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/haddayothmane/ImmoCommissions.git
    cd ImmoCommissions
    ```
2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```
3.  **Install Node dependencies:**
    ```bash
    npm install
    ```
4.  **Environment Setup:**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    _Ensure `DB_CONNECTION` is correctly set to `sqlite` or `mysql` in your `.env`._
5.  **Database Migration & Seeding:**
    ```bash
    php artisan migrate
    ```
6.  **Run Development Servers:**
    Terminal 1 (Backend API):
    ```bash
    php artisan serve
    ```
    Terminal 2 (Frontend compilation):
    ```bash
    npm run dev
    ```

---

_Generated by AI Assistant on behalf of the ImmoCommissions Dev Team._
