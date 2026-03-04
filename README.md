# Inventory Tracker

An inventory tracking application built with Next.js, Prisma, Clerk, and Shadcn UI.

> This project is currently under development. Stay tuned for updates!

## How to Run

- Clone the repository and navigate to the project directory:

  ```bash
  git clone https://github.com/emanuelefavero/inventory-tracker.git
  cd inventory-tracker
  ```

- Install dependencies:

  ```bash
  npm install
  ```

- Run the development server:

  ```bash
  npm run dev
  ```

- Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Testing Quick Start

- Unit tests use **Vitest** and are co-located with the file under test.
  - Example: `src/app/dashboard/page.tsx` → `src/app/dashboard/page.test.tsx`
  - Run unit tests:

  ```bash
  npm run test
  ```

- End-to-end tests use **Playwright** and live in the global `tests` directory, organized by feature.
  - Example: navigation tests in `tests/navigation/*.spec.ts`
  - Run E2E tests:

  ```bash
  npm run test:e2e
  ```

## Project Scripts

| Command                      | Description                                   |
| :--------------------------- | :-------------------------------------------- |
| `npm run dev`                | Starts the Next.js development server         |
| `npm run build`              | Builds the application for production         |
| `npm run start`              | Starts the production server                  |
| `npm run lint`               | Runs ESLint to check for code style issues    |
| `npm run test`               | Runs **Vitest** unit tests                    |
| `npm run test:e2e`           | Runs **Playwright** E2E tests (Chromium only) |
| `npm run test:e2e:ui`        | Opens Playwright UI for interactive debugging |
| `npm run playwright:install` | Installs the required Chromium browser        |

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Clerk Documentation](https://clerk.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/docs)

## License

- [MIT](LICENSE.md)

&nbsp;

---

&nbsp;

[**Go To Top &nbsp; ⬆️**](#inventory-tracker)
