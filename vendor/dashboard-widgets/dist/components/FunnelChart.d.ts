import React from 'react';
import { AccentKey } from '../theme';
export interface FunnelDatum {
    label: string;
    value: number;
    hint?: string;
}
export interface FunnelChartProps {
    data: FunnelDatum[];
    maxValue?: number;
    accent?: AccentKey;
    showValue?: boolean;
    valueFormat?: (value: number) => string;
}
export declare const FunnelChart: React.FC<FunnelChartProps>;
