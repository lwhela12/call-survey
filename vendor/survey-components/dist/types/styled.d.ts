import 'styled-components';
declare module 'styled-components' {
    interface DefaultTheme {
        colors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            surface: string;
            text: {
                primary: string;
                secondary: string;
                inverse: string;
                light: string;
            };
            border: string;
            error: string;
            success: string;
            warning: string;
        };
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            xxl: string;
        };
        fontSizes: {
            xs: string;
            sm: string;
            base: string;
            lg: string;
            xl: string;
            xxl: string;
            '2xl': string;
        };
        fontWeights: {
            normal: number;
            medium: number;
            semibold: number;
            bold: number;
        };
        fonts: {
            body: string;
            heading: string;
        };
        borderRadius: {
            sm: string;
            md: string;
            lg: string;
            xl: string;
            full: string;
        };
        shadows: {
            sm: string;
            md: string;
            lg: string;
        };
        breakpoints: {
            mobile: string;
            tablet: string;
            desktop: string;
        };
        transitions: {
            fast: string;
            normal: string;
            slow: string;
        };
        hero?: {
            avatar?: {
                url: string;
                assetId?: string;
                fileName?: string;
                contentType?: string;
                provider?: string;
            } | null;
        };
        branding?: {
            logo?: {
                url: string;
                assetId?: string;
                fileName?: string;
                contentType?: string;
                provider?: string;
            } | null;
        };
        progressBar?: {
            enabled: boolean;
            showMilestones: boolean;
            colors: {
                fill: string;
                background: string;
                text: string;
                milestone: string;
            };
            styling: {
                height: number;
                borderRadius: string;
            };
            messages: {
                start: string;
                quarter: string;
                half: string;
                threeQuarters: string;
                complete: string;
            };
        };
    }
}
//# sourceMappingURL=styled.d.ts.map
