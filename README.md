# GTS — Custom Sportswear Ordering Platform (Frontend)

Customer-facing frontend for GTS, built with Next.js, TypeScript, Tailwind CSS,
shadcn/ui, Motion, and (soon) React Three Fiber.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm test` — run the test suite (Vitest + React Testing Library)
- `npm run lint` — lint the project

## Project structure

- `app/` — routes (Next.js App Router)
- `components/landing/` — landing page sections (Navbar, Hero, ProductCategories)
- `components/ui/` — shadcn/ui-style primitives
- `lib/` — utilities and mock data (standing in for backend endpoints until they exist)
- `test/` — component tests

## Notes

- `next/font/google` and the shadcn CLI both require outbound access to
  Google Fonts / ui.shadcn.com. If you're building somewhere with normal
  internet access, both work as documented; this project currently uses a
  system font stack and hand-authored shadcn-style components as a result.
