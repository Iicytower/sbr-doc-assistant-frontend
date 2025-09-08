# Project Architecture and Navigation Guide

This project follows a modular architecture typical for Next.js applications using the App Router. Core functionalities are separated into folders responsible for specific domains: user interface, chat logic, AI model handling, authentication, and data persistence. The key folders are:

- **`app/`** – The main directory containing Next.js routes, with subfolders for each view (e.g., `/chat`, `/settings`, `/auth`). Each contains its own `page.tsx`, `layout.tsx`, and possibly local components.
- **`components/`** – A collection of reusable UI components (e.g., buttons, forms, modals), often built with shadcn/ui and Tailwind CSS.
- **`lib/`** – Helper functions, AI SDK utilities, database integrations, session handling, validation, etc.
- **`db/`** – Database schema definitions (ORM, migrations) and Neon Postgres connection configuration.
- **`ai/`** – Logic for integrating with various AI model providers, adapters, and prompt configurations.
- **`types/`** – TypeScript types, interfaces, and global types for the entire application.
- **`public/`** – Static assets (icons, images, manifest).

Module dependencies are clearly defined: UI components are used in views from `app/`, chat and AI logic reside in `lib/` and `ai/`, and data access is handled in `db/`. Types are imported globally from `types/`, making refactoring and consistency easier.

To navigate the codebase, start with the `app/` folder to find main routes and entry points for each feature. Helper components and business logic are in `components/` and `lib/`. For AI or database integration details, check `ai/` and `db/`. The structure is complemented by configuration files (`next.config.js`, `.env.example`) and documentation in `README.md

