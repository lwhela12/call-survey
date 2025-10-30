import React from 'react';
import { AccentKey } from '../theme';
export interface SegmentDatum {
    label: string;
    value: number;
    color?: string;
}
export interface SegmentDonutProps {
    data: SegmentDatum[];
    totalLabel?: string;
    accent?: AccentKey;
    formatValue?: (value: number) => string;
}
export declare const SegmentDonut: React.FC<SegmentDonutProps>;
