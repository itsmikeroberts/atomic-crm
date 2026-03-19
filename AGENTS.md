# AGENTS.md

## Project Overview

Atomic CRM is a full-featured CRM built with React, shadcn-admin-kit, and Supabase. It provides contact management, task tracking, notes, email capture, and deal management with a Kanban board.

## Development Commands

### Setup
```bash
make install          # Install dependencies (frontend, backend, local Supabase)
make start            # Start full stack with real API (Supabase + Vite dev server)
make stop             # Stop the stack
make start-demo       # Start full-stack with FakeRest data provider
```

### Testing and Code Quality

```bash
make test             # Run unit tests (vitest)
make typecheck        # Run TypeScript type checking
make lint             # Run ESLint and Prettier checks
```

### Building

```bash
make build            # Build production bundle (runs tsc + vite build)
```

### Database Management

```bash
npx supabase migration new <name>  # Create new migration
npx supabase migration up          # Apply migrations locally
npx supabase db push               # Push migrations to remote
npx supabase db reset              # Reset local database (destructive)
```

### Registry (Shadcn Components)

```bash
make registry-gen     # Generate registry.json (runs automatically on pre-commit)
make registry-build   # Build Shadcn registry
```

## Architecture

### Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router v7
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Application Logic**: shadcn-admin-kit + ra-core (react-admin headless)
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + REST API + Auth + Storage + Edge Functions)
- **Testing**: Vitest

### Directory Structure

```
src/
├── components/
│   ├── admin/              # Shadcn Admin Kit components (mutable dependency)
│   ├── atomic-crm/         # Main CRM application code (~15,000 LOC)
│   │   ├── activity/       # Activity logs
│   │   ├── companies/      # Company management
│   │   ├── contacts/       # Contact management (includes CSV import/export)
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── deals/          # Deal pipeline (Kanban)
│   │   ├── filters/        # List filters
│   │   ├── gig-members/    # Band member assignments (Band CRM)
│   │   ├── gigs/           # Quote/invoice generation (Band CRM)
│   │   ├── layout/         # App layout components
│   │   ├── login/          # Authentication pages
│   │   ├── misc/           # Shared utilities
│   │   ├── notes/          # Note management
│   │   ├── providers/      # Data providers (Supabase + FakeRest)
│   │   ├── quotes/         # Quote template management (Band CRM)
│   │   ├── root/           # Root CRM component
│   │   ├── sales/          # Sales team management
│   │   ├── setlists/       # Set list builder (Band CRM)
│   │   ├── settings/       # Settings page
│   │   ├── simple-list/    # List components
│   │   ├── songs/          # Songbook management (Band CRM)
│   │   ├── tags/           # Tag management
│   │   ├── tasks/          # Task management
│   │   └── venues/         # Venue management (Band CRM)
│   ├── supabase/           # Supabase-specific auth components
│   └── ui/                 # Shadcn UI components (mutable dependency)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
└── App.tsx                 # Application entry point

supabase/
├── functions/              # Edge functions (user management, inbound email)
└── migrations/             # Database migrations
```

### Key Architecture Patterns

For more details, check out the doc/src/content/docs/developers/architecture-choices.mdx document.

#### Mutable Dependencies

The codebase includes mutable dependencies that should be modified directly if needed:
- `src/components/admin/`: Shadcn Admin Kit framework code
- `src/components/ui/`: Shadcn UI components

#### Configuration via `<CRM>` Component

The `src/App.tsx` file renders the `<CRM>` component, which accepts props for domain-specific configuration:
- `contactGender`: Gender options
- `companySectors`: Company industry sectors
- `dealCategories`, `dealStages`, `dealPipelineStatuses`: Deal configuration
- `noteStatuses`: Note status options with colors
- `taskTypes`: Task type options
- `logo`, `title`: Branding
- `lightTheme`, `darkTheme`: Theme customization
- `disableTelemetry`: Opt-out of anonymous usage tracking

#### Database Views

Complex queries are handled via database views to simplify frontend code and reduce HTTP overhead. For example, `contacts_summary` provides aggregated contact data including task counts.

#### Database Triggers

User data syncs between Supabase's `auth.users` table and the CRM's `sales` table via triggers (see `supabase/migrations/20240730075425_init_triggers.sql`).

#### Edge Functions

Located in `supabase/functions/`:
- User management (creating/updating users, account disabling)
- Inbound email webhook processing

#### Data Providers

Two data providers are available:
1. **Supabase** (default): Production backend using PostgreSQL
2. **FakeRest**: In-browser fake API for development/demos, resets on page reload

When using FakeRest, database views are emulated in the frontend. Test data generators are in `src/components/atomic-crm/providers/fakerest/dataGenerator/`.

#### Filter Syntax

List filters follow the `ra-data-postgrest` convention with operator concatenation: `field_name@operator` (e.g., `first_name@eq`). The FakeRest adapter maps these to FakeRest syntax at runtime.

## Development Workflows

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json` and `components.json`:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/components/ui` → `src/components/ui`

### Adding Custom Fields

When modifying contact or company data structures:
1. Create a migration: `npx supabase migration new <name>`
2. Update the sample CSV: `src/components/atomic-crm/contacts/contacts_export.csv`
3. Update the import function: `src/components/atomic-crm/contacts/useContactImport.tsx`
4. If using FakeRest, update data generators in `src/components/atomic-crm/providers/fakerest/dataGenerator/`
5. Don't forget to update the views
6. Don't forget the export functions
7. Don't forget the contact merge logic

### Running with Test Data

Import `test-data/contacts.csv` via the Contacts page → Import button.

### Git Hooks

- Pre-commit: Automatically runs `make registry-gen` to update `registry.json`

### Accessing Local Services During Development

- Frontend: http://localhost:5173/
- Supabase Dashboard: http://localhost:54323/
- REST API: http://127.0.0.1:54321
- Storage (attachments): http://localhost:54323/project/default/storage/buckets/attachments
- Inbucket (email testing): http://localhost:54324/

## Band CRM Implementation

This repository includes a complete Band CRM implementation that demonstrates industry-specific customization. The Band CRM extends Atomic CRM with:

### New Entities

- **Venues** (`venues` table): Physical performance locations with capacity, stage details, technical requirements
- **Songs** (`songs` table): Songbook/repertoire with keys, tempos, genres, durations
- **Gigs** (extended `deals` table): Performance bookings with dates, times, fees, deposits
- **Gig Members** (`gig_members` table): Band member assignments to specific gigs with roles
- **Set Lists** (`set_lists`, `set_list_songs` tables): Organized song sequences for performances
- **Quote Templates** (`quote_templates`, `gig_quotes` tables): Handlebars-based document generation

### Key Features

1. **Venue Management** (`src/components/atomic-crm/venues/`)
   - List, create, edit venues with filtering by city and capacity
   - Track venue details: address, capacity, stage size, parking, load-in notes
   - View all gigs at each venue

2. **Songbook** (`src/components/atomic-crm/songs/`)
   - Manage repertoire with musical metadata (key, tempo, duration, genre)
   - Filter by genre, key, and active status
   - Link to lyrics and chart URLs

3. **Gig Pipeline** (extended `src/components/atomic-crm/deals/`)
   - Deals extended with gig-specific fields (venue, performance date/time, fees)
   - Kanban board for tracking gig stages
   - Integration with venues, band members, and set lists

4. **Set List Builder** (`src/components/atomic-crm/setlists/`)
   - Drag-and-drop interface using `@dnd-kit`
   - Multiple sets per gig
   - Song picker dialog with search and filtering

5. **Quote & Invoice Generation** (`src/components/atomic-crm/gigs/`)
   - Handlebars template engine for variable substitution
   - Professional templates (Standard, Wedding, Corporate)
   - Preview dialogs with print functionality

6. **Band Members** (`src/components/atomic-crm/gig-members/`)
   - Assign musicians to gigs with roles (e.g., "Lead Guitar", "Vocals")
   - Track confirmation status

### Database Schema

All band-specific tables use `bigint` IDs to match existing Atomic CRM tables:
- `venues`: Performance locations
- `deals` extended with: `venue_id`, `performance_date`, `start_time`, `end_time`, `set_count`, `fee`, `deposit`, etc.
- `gig_members`: Links `sales` (band members) to `deals` (gigs)
- `songs`: Songbook entries
- `set_lists`, `set_list_songs`: Set list organization
- `quote_templates`, `gig_quotes`: Document generation

See `supabase/migrations/202603181134*.sql` for the complete schema.

### FakeRest Demo Data

The FakeRest provider includes generators for band-specific data:
- 20 UK venues with realistic details
- 50 songs (popular covers, jazz standards, wedding favorites)
- 3 professional quote templates
- Gigs with complete performance details

See `src/components/atomic-crm/providers/fakerest/dataGenerator/` for implementation.

### Documentation

- **Specification**: `band-crm-spec.md` - Complete feature specification
- **Implementation Plan**: `plans/band-crm-implementation-plan.md` - 11-phase implementation guide
- **Migration Files**: `supabase/migrations/202603181134*.sql` - Database schema

## Important Notes

- The codebase is intentionally small (~15,000 LOC in `src/components/atomic-crm`) for easy customization
- Modify files in `src/components/admin` and `src/components/ui` directly - they are meant to be customized
- Unit tests can be added in the `src/` directory (test files are named `*.test.ts` or `*.test.tsx`)
- User deletion is not supported to avoid data loss; use account disabling instead
- Filter operators must be supported by the `supabaseAdapter` when using FakeRest
