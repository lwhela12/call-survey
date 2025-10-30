import { AccentKey } from '../theme';
export interface BarDatum {
    label: string;
    value: number;
}
export interface BarChartProps {
    data: BarDatum[];
    accent?: AccentKey;
    totalLabel?: string;
}
export declare function BarChart({ data, accent, totalLabel }: BarChartProps): import("react/jsx-runtime").JSX.Element;
