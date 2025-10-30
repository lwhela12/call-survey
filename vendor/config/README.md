## @nesolagus/config

Shared configuration contracts, type definitions, and JSON schema for the Nesolagus platform.

### What’s Included

- **DashboardConfig types** – strongly-typed helpers describing widgets, bindings, filters, and layout metadata.
- **JSON Schema** – draft-07 schema (`dashboardConfigSchema`) for runtime validation and tooling.
- **Helpers** – `createEmptyDashboardConfig` scaffold plus exported widget/chart/metric enums.

### Usage

```ts
import {
  dashboardConfigSchema,
  createEmptyDashboardConfig,
  type DashboardConfig
} from '@nesolagus/config';

const dashboard: DashboardConfig = createEmptyDashboardConfig({ title: 'Survey Results' });
dashboard.widgets.push({
  id: 'completion-rate',
  type: 'metric',
  title: 'Completion Rate',
  layout: { x: 0, y: 0, w: 4, h: 3 },
  data: {
    source: { kind: 'metric', value: 'completion_rate' },
    aggregation: 'percentage'
  }
});
```

The JSON schema can be used with `ajv`, `joi`, or any schema-aware validator before persisting configs or triggering deployments.

### Development

This package ships with pre-generated artifacts in `dist/`, so no build step is required. If you update the types or schema:

1. Edit `dist/index.d.ts`, `dist/schema.js`, or `dist/index.js`.
2. Ensure any new exports are reflected consistently across the JS and declaration files.

