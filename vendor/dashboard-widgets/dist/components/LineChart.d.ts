import { AccentKey } from '../theme';
export interface LineDatum {
    label: string;
    value: number;
    percentage?: number;
}
export interface LineChartProps {
    data: LineDatum[];
    accent?: AccentKey;
    totalLabel?: string;
}
export declare function LineChart({ data, accent, totalLabel }: LineChartProps): import("react/jsx-runtime").JSX.Element;
