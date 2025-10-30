import { AccentKey } from '../theme';
export interface AreaDatum {
    label: string;
    value: number;
    percentage?: number;
}
export interface AreaChartProps {
    data: AreaDatum[];
    accent?: AccentKey;
    totalLabel?: string;
}
export declare function AreaChart({ data, accent, totalLabel }: AreaChartProps): import("react/jsx-runtime").JSX.Element;
