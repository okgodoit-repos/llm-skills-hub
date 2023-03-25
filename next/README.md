## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase

The backend of this project is managed by Supabase. To start dev, setup Supabase for local dev: https://supabase.com/docs/guides/resources/supabase-cli/local-development

## Workflow

If you make changes in the database schema on the production database, sync it with the local database by running:

`supabase db remote commit`

Once the local schema has been updated, reset the local supabase instance by running:

`supabase db reset`

If you make changes in the local schema and want to push the schema change to the production database, run:

`supabase db push`

Once the local database is up to date, make sure to update types via:

`yarn gen-types`
