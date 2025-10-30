import React from 'react';
import { AccentKey } from '../theme';
type DeltaDirection = 'up' | 'down' | 'neutral';
type DeltaTone = 'positive' | 'negative' | 'neutral';
export interface KpiDelta {
    value: string;
    direction?: DeltaDirection;
    tone?: DeltaTone;
    label?: string;
}
export interface KpiStatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon?: React.ReactNode;
    delta?: KpiDelta;
    footnote?: string;
    accent?: AccentKey;
    compact?: boolean;
    align?: 'left' | 'center';
}
export declare const KpiStatCard: React.FC<KpiStatCardProps>;
export {};
