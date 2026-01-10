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
