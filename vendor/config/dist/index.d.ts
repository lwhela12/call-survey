export type DashboardWidgetType = 'metric' | 'chart' | 'table' | 'text' | 'custom';
export type DashboardChartVariant = 'line' | 'bar' | 'stacked-bar' | 'pie' | 'donut';
export type DashboardMetricFormat = 'number' | 'percentage' | 'currency' | 'duration' | 'custom';
export type DashboardAggregation =
  | 'count'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'median'
  | 'distribution'
  | 'percentage';

export interface DashboardMetadata {
  title: string;
  description?: string;
  createdBy?: string;
  tags?: string[];
}

export interface DashboardLayout {
  columns?: number;
  gap?: number;
}

export interface DashboardLayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export type DashboardFilterType = 'select' | 'multi-select' | 'date-range' | 'cohort' | 'custom';
export type DashboardFilterSourceKind = 'variable' | 'block' | 'metadata';

export interface DashboardFilterOption {
  value: unknown;
  label: string;
}

export interface DashboardFilter {
  id: string;
  type: DashboardFilterType;
  label: string;
  source: {
    kind: DashboardFilterSourceKind;
    value: string;
  };
  defaultValue?: unknown;
  options?: DashboardFilterOption[];
}

export type DashboardDataSourceKind = 'question' | 'variable' | 'metric';
export type DashboardDataSourceRefKind = 'question' | 'variable' | 'metric' | 'calculation';

export interface DashboardGroupBy {
  kind: 'variable' | 'block' | 'choice';
  value: string;
  limit?: number;
}

export interface DashboardSort {
  direction?: 'asc' | 'desc';
  by?: 'value' | 'label';
}

export interface DashboardDataSource {
  kind: DashboardDataSourceKind;
  ref: string;
  aggregation?: DashboardAggregation;
  groupBy?: DashboardGroupBy;
  filters?: DashboardFilter[];
}

export interface DashboardDataSourceRef {
  kind: DashboardDataSourceRefKind;
  value: string;
}

export interface DashboardDataBinding {
  id?: string;
  label?: string;
  source: DashboardDataSourceRef;
  aggregation?: DashboardAggregation;
  filters?: DashboardFilter[];
  groupBy?: DashboardGroupBy;
  sort?: DashboardSort;
}

export interface DashboardMetricBaseline {
  type: 'previous-period' | 'previous-response' | 'custom';
  value?: unknown;
}

export interface DashboardMetricPresentation {
  format?: DashboardMetricFormat;
  precision?: number;
  comparison?: {
    baseline?: DashboardMetricBaseline;
    format?: 'delta' | 'percentage';
  };
}

export interface DashboardChartPresentation {
  variant?: DashboardChartVariant;
  stacking?: 'none' | 'normal' | 'percent';
  showLegend?: boolean;
  showValues?: boolean;
}

export interface DashboardTableColumn {
  key: string;
  label: string;
  width?: number;
  format?: DashboardMetricFormat | 'text';
}

export interface DashboardTablePagination {
  pageSize?: number;
  showTotal?: boolean;
}

export interface DashboardTablePresentation {
  columns?: DashboardTableColumn[];
  pagination?: DashboardTablePagination;
}

export interface DashboardWidgetPresentation {
  chart?: DashboardChartPresentation;
  metric?: DashboardMetricPresentation;
  table?: DashboardTablePresentation;
}

export interface DashboardWidgetBase {
  id: string;
  type: DashboardWidgetType;
  title: string;
  subtitle?: string;
  description?: string;
  layout: DashboardLayoutItem;
  presentation?: DashboardWidgetPresentation;
  notes?: string;
  accent?: string;
}

export interface DashboardWidgetWithData extends DashboardWidgetBase {
  data: DashboardDataBinding | DashboardDataBinding[];
}

export interface DashboardMetricWidget extends DashboardWidgetWithData {
  type: 'metric';
}

export interface DashboardChartWidget extends DashboardWidgetWithData {
  type: 'chart';
}

export interface DashboardTableWidget extends DashboardWidgetWithData {
  type: 'table';
}

export interface DashboardTextWidget extends DashboardWidgetBase {
  type: 'text';
  content?: string;
  data?: DashboardDataBinding | DashboardDataBinding[];
}

export interface DashboardCustomWidget extends DashboardWidgetWithData {
  type: 'custom';
  component?: string;
}

export type DashboardWidget =
  | DashboardMetricWidget
  | DashboardChartWidget
  | DashboardTableWidget
  | DashboardTextWidget
  | DashboardCustomWidget;

export interface DashboardConfig {
  version: string;
  surveyId?: string;
  metadata?: DashboardMetadata;
  layout?: DashboardLayout;
  filters?: DashboardFilter[];
  widgets: DashboardWidget[];
  dataSources?: Record<string, DashboardDataSource>;
}

export declare const dashboardConfigSchema: Readonly<Record<string, unknown>>;
export declare const DASHBOARD_WIDGET_TYPES: readonly DashboardWidgetType[];
export declare const DASHBOARD_CHART_VARIANTS: readonly DashboardChartVariant[];
export declare const DASHBOARD_METRIC_FORMATS: readonly DashboardMetricFormat[];

export interface CreateEmptyDashboardConfigOptions {
  title?: string;
  version?: string;
}

export declare function createEmptyDashboardConfig(
  options?: CreateEmptyDashboardConfigOptions
): DashboardConfig;
