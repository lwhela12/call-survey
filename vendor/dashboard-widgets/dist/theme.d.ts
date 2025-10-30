export declare const dashboardPalette: {
    readonly emerald: {
        readonly gradientFrom: "#64B37A";
        readonly gradientTo: "#2F6D49";
        readonly surface: "#ECFDF5";
        readonly text: "#14532D";
    };
    readonly cyan: {
        readonly gradientFrom: "#0EA5E9";
        readonly gradientTo: "#0369A1";
        readonly surface: "#E0F2FE";
        readonly text: "#0F172A";
    };
    readonly violet: {
        readonly gradientFrom: "#8B5CF6";
        readonly gradientTo: "#4C1D95";
        readonly surface: "#F3E8FF";
        readonly text: "#312E81";
    };
    readonly amber: {
        readonly gradientFrom: "#F59E0B";
        readonly gradientTo: "#B45309";
        readonly surface: "#FEF3C7";
        readonly text: "#78350F";
    };
    readonly neutral: {
        readonly gradientFrom: "#CBD5F5";
        readonly gradientTo: "#64748B";
        readonly surface: "#F8FAFC";
        readonly text: "#1F2937";
    };
};
export type AccentKey = keyof typeof dashboardPalette;
export declare const cardShadow = "0 20px 35px -20px rgba(15, 23, 42, 0.25)";
export declare const fontStack: {
    title: string;
    number: string;
};
