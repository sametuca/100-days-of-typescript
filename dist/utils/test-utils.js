"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestUtils = void 0;
class TestUtils {
    static generateMockData(type) {
        const mockGenerators = {
            string: () => 'test-string-' + Math.random().toString(36).substr(2, 9),
            number: () => Math.floor(Math.random() * 1000),
            boolean: () => Math.random() > 0.5,
            array: () => [1, 2, 3, 'test'],
            object: () => ({ id: 1, name: 'test', active: true }),
            date: () => new Date().toISOString(),
            email: () => `test${Math.floor(Math.random() * 1000)}@example.com`,
            uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            })
        };
        const generator = mockGenerators[type] || mockGenerators.string;
        return {
            type,
            value: generator(),
            description: `Mock ${type} data for testing`
        };
    }
    static extractFunctionSignature(code) {
        const functions = [];
        const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*{/g;
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
            const [, name, paramsStr, returnType] = match;
            const params = paramsStr.split(',').map(p => p.trim()).filter(p => p);
            functions.push({ name, params, returnType: returnType?.trim() });
        }
        const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)(?:\s*:\s*([^=]+))?\s*=>/g;
        while ((match = arrowRegex.exec(code)) !== null) {
            const [, name, paramsStr, returnType] = match;
            const params = paramsStr.split(',').map(p => p.trim()).filter(p => p);
            functions.push({ name, params, returnType: returnType?.trim() });
        }
        return functions;
    }
    static generateTestCases(functionName, params) {
        const testCases = [];
        testCases.push({
            name: `should handle valid input for ${functionName}`,
            description: `Test ${functionName} with valid parameters`,
            type: 'positive',
            input: params.map(() => this.generateMockData('string').value),
            expectedOutput: 'expected_result',
            assertions: [`expect(result).toBeDefined()`, `expect(typeof result).toBe('object')`]
        });
        testCases.push({
            name: `should handle invalid input for ${functionName}`,
            description: `Test ${functionName} with invalid parameters`,
            type: 'negative',
            input: [null, undefined, ''],
            expectedOutput: null,
            assertions: [`expect(() => ${functionName}(null)).toThrow()`]
        });
        testCases.push({
            name: `should handle edge cases for ${functionName}`,
            description: `Test ${functionName} with edge case values`,
            type: 'edge',
            input: ['', 0, [], {}],
            expectedOutput: 'edge_result',
            assertions: [`expect(result).toEqual(expect.any(Object))`]
        });
        return testCases;
    }
    static generateJestTemplate(functionName, testCases) {
        const imports = `import { ${functionName} } from '../src/your-module';\n\n`;
        const describe = `describe('${functionName}', () => {\n`;
        const tests = testCases.map(testCase => {
            const testBody = `  it('${testCase.name}', () => {\n` +
                `    // Arrange\n` +
                `    const input = ${JSON.stringify(testCase.input)};\n` +
                `    const expected = ${JSON.stringify(testCase.expectedOutput)};\n\n` +
                `    // Act\n` +
                `    const result = ${functionName}(...input);\n\n` +
                `    // Assert\n` +
                testCase.assertions.map(assertion => `    ${assertion};`).join('\n') + '\n' +
                `  });\n`;
            return testBody;
        }).join('\n');
        return imports + describe + tests + '});';
    }
    static calculateComplexity(code) {
        const complexityPatterns = [
            /if\s*\(/g,
            /else\s+if\s*\(/g,
            /while\s*\(/g,
            /for\s*\(/g,
            /switch\s*\(/g,
            /case\s+/g,
            /catch\s*\(/g,
            /&&/g,
            /\|\|/g,
            /\?/g
        ];
        let complexity = 1;
        complexityPatterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches)
                complexity += matches.length;
        });
        return complexity;
    }
    static identifyTestableUnits(code) {
        const units = [];
        const functionMatches = code.match(/function\s+(\w+)/g);
        if (functionMatches) {
            units.push(...functionMatches.map(match => match.replace('function ', '')));
        }
        const classMatches = code.match(/class\s+(\w+)/g);
        if (classMatches) {
            units.push(...classMatches.map(match => match.replace('class ', '')));
        }
        const methodMatches = code.match(/(\w+)\s*\([^)]*\)\s*{/g);
        if (methodMatches) {
            units.push(...methodMatches.map(match => match.split('(')[0].trim()));
        }
        return [...new Set(units)];
    }
    static generateAssertions(functionName, expectedType) {
        const baseAssertions = [
            `expect(${functionName}).toBeDefined()`,
            `expect(typeof ${functionName}).toBe('function')`
        ];
        const typeAssertions = {
            string: [`expect(typeof result).toBe('string')`, `expect(result.length).toBeGreaterThan(0)`],
            number: [`expect(typeof result).toBe('number')`, `expect(result).toBeGreaterThanOrEqual(0)`],
            boolean: [`expect(typeof result).toBe('boolean')`],
            object: [`expect(typeof result).toBe('object')`, `expect(result).not.toBeNull()`],
            array: [`expect(Array.isArray(result)).toBe(true)`, `expect(result.length).toBeGreaterThanOrEqual(0)`]
        };
        return [...baseAssertions, ...(typeAssertions[expectedType] || typeAssertions.object)];
    }
}
exports.TestUtils = TestUtils;
//# sourceMappingURL=test-utils.js.map