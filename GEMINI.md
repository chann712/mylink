# GEMINI.md - MyLink Project Guide

This document summarizes the structure, tech stack, development conventions, and key features of the **MyLink** project.

---

## 1. Project Overview
- **Project Name**: MyLink
- **Purpose**: A unified link profile service that allows users to gather various social media, portfolio, and external links into a single, shareable web page.
- **Key Features (MVP)**:
  - Google email-based signup with automatic `displayName` setup.
  - Unique profile URLs in the format of `mylink.com/nickname`.
  - Link block creation, in-line editing, deletion, and automatic favicon integration.
  - Admin dashboard with a real-time mobile preview (Live Preview).

## 2. Tech Stack
- **Framework**: Next.js (App Router, v16+)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI, shadcn/ui
- **Icons**: Tabler Icons (`@tabler/icons-react`)
- **Theme**: `next-themes` (Dark/Light mode support)
- **Fonts**: Outfit (Sans), Noto Sans (Heading), Geist Mono (Mono)

## 3. Building and Running
- **Development Server**: `npm run dev` (using Turbopack)
- **Build Project**: `npm run build`
- **Lint Check**: `npm run lint`
- **Code Formatting**: `npm run format` (Prettier)
- **Type Check**: `npm run typecheck`

## 4. Directory Structure
- `@app/`: Next.js App Router pages and layouts.
- `@components/`: Reusable UI components.
  - `@components/ui/`: Foundation components based on shadcn/ui.
- `@docs/`: PRD, User Scenarios, Wireframes, and other design documents.
- `@lib/`: Common utility functions like `@lib/utils.ts`.
- `@hooks/`: Custom React Hooks.
- `@public/`: Static assets (images, favicons, etc.).

## 5. Development Conventions

### 5.1. UI/UX Principles
- **Using shadcn/ui**: Add new UI components via `npx shadcn@latest add [component]`.
- **In-line Editing**: Prefer editing profile and link information directly by clicking text, without using modals.
- **Responsive Design**: All pages, especially the profile viewer, must be mobile-first.

### 5.2. Data & API
- **Favicon Integration**: Use the Google Favicon API (`https://www.google.com/s2/favicons?domain=[URL]&sz=64`) to display icons for added links.
- **Authentication**: Automatically assign the part before `@` in a Gmail address as the initial `displayName` during signup.

### 5.3. Coding Style
- **Tailwind CSS**: Use `prettier-plugin-tailwindcss` for class sorting and the `cn()` utility for dynamic class merging.
- **TypeScript**: Adhere to strict type checks; avoid using `any`.

## 6. Key Scenarios & Design

### 6.1. User Scenarios
- **Visitor**: Accesses a profile via a unique URL. A 404 page with a "Go Home" button is provided for invalid URLs.
- **Owner**: Manages links in the dashboard. `https://` is automatically prepended to URLs, and in-line editing allows for immediate updates. Deletions are reflected instantly without a confirmation popup.

### 6.2. UI/UX Design
- **Public Profile**: A mobile-optimized single-page structure with a max-width of 480px. Includes "Powered by MyLink" branding.
- **Admin Dashboard**: A split-view layout for desktop. The left side is for settings and editing, and the right side displays a real-time mobile preview.
- **Live Updates**: All changes made in the dashboard are instantly rendered in the preview pane.

---

> **Reference**: For detailed requirements, see `@docs/PRD.md`, `@docs/USER_SCENARIO.md`, and `@docs/WIREFRAME.md`.
