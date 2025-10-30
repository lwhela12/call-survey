import { AccentKey } from '../theme';
export interface RadialDatum {
    label: string;
    value: number;
}
export interface RadialChartProps {
    data: RadialDatum[];
    accent?: AccentKey;
    totalLabel?: string;
}
export declare function RadialChart({ data, accent, totalLabel }: RadialChartProps): import("react/jsx-runtime").JSX.Element;
