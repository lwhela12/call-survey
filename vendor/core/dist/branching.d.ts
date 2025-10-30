export interface BranchCondition {
    variable?: string;
    lt?: number | string;
    gt?: number | string;
    lessThan?: number | string;
    greaterThan?: number | string;
    equals?: unknown;
    in?: unknown[] | unknown;
    contains?: unknown;
    not?: BranchCondition;
    or?: BranchCondition[];
    and?: BranchCondition[];
}
export interface ConditionalRule {
    when: BranchCondition;
    goto: string;
}
export interface ConditionalNextArray {
    if: ConditionalRule[];
    else: string;
}
export interface ConditionalNextNested {
    if: BranchCondition;
    then: string;
    else: string | ConditionalNextNested;
}
export type ConditionalNext = ConditionalNextArray | ConditionalNextNested;
export type VariableStore = Record<string, unknown>;
/**
 * Evaluate conditional routing and return the next block ID.
 */
export declare function evaluateConditionalNext(nextOrConditional: ConditionalNext | null | undefined, variables: VariableStore, blockVariable?: string): string | null;
/**
 * Evaluate a single condition against variables.
 */
export declare function evaluateCondition(condition: BranchCondition, variables: VariableStore, fallbackVariable?: string): boolean;
//# sourceMappingURL=branching.d.ts.map
