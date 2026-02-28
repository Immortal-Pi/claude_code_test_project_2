# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the sole component library. All UI must be built using shadcn/ui components.

### Rules

- **ONLY** use shadcn/ui components for all UI elements.
- **DO NOT** create custom components. If a component is needed, install it from shadcn/ui.
- If shadcn/ui does not provide a component for a specific need, compose existing shadcn/ui components together — do not build custom alternatives.

### Adding Components

Install new shadcn/ui components via the CLI:

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/`.

## Date Formatting

All date formatting must use the **date-fns** library.

### Standard Date Format

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the following date-fns format string to achieve this:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy");
// "1st Sep 2025"
// "2nd Aug 2025"
// "3rd Jan 2026"
// "4th Jun 2024"
```
