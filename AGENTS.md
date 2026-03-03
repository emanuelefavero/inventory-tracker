# AGENTS.md

## Project Overview

This is a Next.js project for an inventory tracking application. It uses TypeScript, Tailwind CSS, and Shadcn UI for the front-end. The project is in its early stages of development. The `README.md` mentions Prisma and Clerk, but they are not yet integrated into the project.

## Building and Running

To get the project up and running, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at [http://localhost:3000](http://localhost:3000).

3.  **Build the project:**

    ```bash
    npm run build
    ```

4.  **Start the production server:**

    ```bash
    npm run start
    ```

## Development Conventions

- **Linting:** The project uses ESLint for code linting. To run the linter, use the following command:

  ```bash
  npm run lint
  ```

- **Code Style:** The project uses Prettier for code formatting. It is recommended to set up your editor to format on save.

- **Component Structure:** Components are organized in the `src/components` directory. The `ui` directory contains the Shadcn UI components, the `layout` directory contains the layout components, and the `theme` directory contains the theme-related components.

- **Types:** Types are defined in the `src/types` directory.

## Testing Conventions

- **Unit tests (Vitest):**
  - Co-locate unit tests next to the file under test.
  - Use the naming pattern `*.test.ts` or `*.test.tsx`.
  - Example: for `src/app/dashboard/page.tsx`, create `src/app/dashboard/page.test.tsx`.
  - Run unit tests with:

    ```bash
    npm run test
    ```

- **End-to-end tests (Playwright):**
  - Place E2E tests only in the global `tests` directory.
  - Organize tests by feature using subfolders.
  - Example: navigation E2E tests go in `tests/navigation/`.
  - Use Playwright spec naming such as `*.spec.ts`.
  - Run E2E tests with:

    ```bash
    npm run test:e2e
    ```

## Execution Memory (Mandatory)

Before starting any implementation task, always read:

- `docs/MVP_DASHBOARD_EXECUTION_PLAN.md`

After completing any implementation step, update the same file in the same task before stopping, including:

- Step `Status` changes (`TODO`/`IN_PROGRESS`/`BLOCKED`/`DONE`)
- `Started on` / `Completed on`
- `Evidence` and short `Notes`
- `Next Active Step`
- `Execution Changelog`

Implementation should proceed one step at a time following the Kanban cards in the execution plan.
