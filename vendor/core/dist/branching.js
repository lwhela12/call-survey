"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateConditionalNext = evaluateConditionalNext;
exports.evaluateCondition = evaluateCondition;
/**
 * Evaluate conditional routing and return the next block ID.
 */
function evaluateConditionalNext(nextOrConditional, variables, blockVariable) {
    if (!nextOrConditional)
        return null;
    if (Array.isArray(nextOrConditional.if)) {
        return evaluateArrayFormat(nextOrConditional, variables, blockVariable);
    }
    if (typeof nextOrConditional.if === 'object') {
        return evaluateNestedFormat(nextOrConditional, variables, blockVariable);
    }
    return null;
}
function evaluateArrayFormat(conditional, variables, blockVariable) {
    for (const rule of conditional.if) {
        if (evaluateCondition(rule.when, variables, blockVariable)) {
            return rule.goto;
        }
    }
    return conditional.else || null;
}
function evaluateNestedFormat(conditional, variables, fallbackVariable) {
    var _a;
    if (evaluateCondition(conditional.if, variables, fallbackVariable)) {
        return conditional.then;
    }
    if (typeof conditional.else === 'object' && 'if' in conditional.else) {
        return evaluateNestedFormat(conditional.else, variables, fallbackVariable);
    }
    return (_a = conditional.else) !== null && _a !== void 0 ? _a : null;
}
/**
 * Evaluate a single condition against variables.
 */
function evaluateCondition(condition, variables, fallbackVariable) {
    if (!condition)
        return false;
    if ('lt' in condition) {
        const variable = condition.variable || fallbackVariable;
        if (!variable)
            return false;
        const value = variables[variable];
        return value !== undefined && Number(value) < Number(condition.lt);
    }
    if ('gt' in condition) {
        const variable = condition.variable || fallbackVariable;
        if (!variable)
            return false;
        const value = variables[variable];
        return value !== undefined && Number(value) > Number(condition.gt);
    }
    if ('equals' in condition) {
        const variable = condition.variable || fallbackVariable;
        if (!variable)
            return false;
        const value = variables[variable];
        if (Array.isArray(condition.equals) && Array.isArray(value)) {
            if (condition.equals.length !== value.length)
                return false;
            return condition.equals.every((v) => value.includes(v));
        }
        return value === condition.equals;
    }
    if ('in' in condition) {
        const variable = condition.variable || fallbackVariable;
        if (!variable)
            return false;
        const value = variables[variable];
        const allowedValues = Array.isArray(condition.in) ? condition.in : [condition.in];
        if (Array.isArray(value)) {
            return value.some((v) => allowedValues.includes(v));
        }
        return allowedValues.includes(value);
    }
    if (condition.variable) {
        const value = variables[condition.variable];
        if ('lessThan' in condition) {
            return value !== undefined && Number(value) < Number(condition.lessThan);
        }
        if ('greaterThan' in condition) {
            return value !== undefined && Number(value) > Number(condition.greaterThan);
        }
        if ('equals' in condition) {
            if (Array.isArray(condition.equals) && Array.isArray(value)) {
                if (condition.equals.length !== value.length)
                    return false;
                return condition.equals.every((v) => value.includes(v));
            }
            return value === condition.equals;
        }
        if ('contains' in condition) {
            if (Array.isArray(value)) {
                return value.includes(condition.contains);
            }
            if (typeof value === 'string') {
                return value.includes(String(condition.contains));
            }
            return false;
        }
    }
    if ('not' in condition && condition.not) {
        return !evaluateCondition(condition.not, variables, fallbackVariable);
    }
    if ('or' in condition && Array.isArray(condition.or)) {
        return condition.or.some((c) => evaluateCondition(c, variables, fallbackVariable));
    }
    if ('and' in condition && Array.isArray(condition.and)) {
        return condition.and.every((c) => evaluateCondition(c, variables, fallbackVariable));
    }
    return false;
}
