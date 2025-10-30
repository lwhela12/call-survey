import React from 'react';
import { AccentKey } from '../theme';
export interface InsightHighlightProps {
    title: string;
    body: string;
    eyebrow?: string;
    accent?: AccentKey;
    icon?: React.ReactNode;
    footer?: string;
}
export declare const InsightHighlight: React.FC<InsightHighlightProps>;
