"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGeneratorService = void 0;
const test_utils_1 = require("../utils/test-utils");
const uuid_1 = require("uuid");
class TestGeneratorService {
    static async generateTests(request) {
        const { code, fileName, framework = 'jest' } = request;
        const functions = test_utils_1.TestUtils.extractFunctionSignature(code);
        const allTestCases = [];
        functions.forEach(func => {
            const testCases = test_utils_1.TestUtils.generateTestCases(func.name, func.params);
            allTestCases.push(...testCases);
        });
        const testCode = this.generateTestCode(functions, allTestCases, framework, fileName);
        const coverage = {
            functions: functions.map(f => f.name),
            branches: this.extractBranches(code),
            statements: code.split('\n').filter(line => line.trim().length > 0).length
        };
        return {
            id: (0, uuid_1.v4)(),
            fileName,
            testFileName: this.generateTestFileName(fileName, framework),
            testCode,
            framework,
            testCases: allTestCases,
            coverage,
            createdAt: new Date()
        };
    }
    static generateBulkTests(requests) {
        return Promise.all(requests.map(request => this.generateTests(request)));
    }
    static generateTestCode(functions, testCases, framework, fileName) {
        switch (framework) {
            case 'jest':
                return this.generateJestCode(functions, testCases, fileName);
            case 'mocha':
                return this.generateMochaCode(functions, testCases, fileName);
            case 'vitest':
                return this.generateVitestCode(functions, testCases, fileName);
            default:
                return this.generateJestCode(functions, testCases, fileName);
        }
    }
    static generateJestCode(functions, testCases, fileName) {
        const moduleName = fileName.replace(/\.[^/.]+$/, '');
        const imports = functions.length > 0
            ? `import { ${functions.map(f => f.name).join(', ')} } from '../src/${moduleName}';\n\n`
            : `import * as ${moduleName} from '../src/${moduleName}';\n\n`;
        let testCode = imports;
        functions.forEach(func => {
            const funcTestCases = testCases.filter(tc => tc.name.includes(func.name));
            testCode += `describe('${func.name}', () => {\n`;
            funcTestCases.forEach(testCase => {
                testCode += `  it('${testCase.name}', () => {\n`;
                testCode += `    // Arrange\n`;
                testCode += `    const input = ${JSON.stringify(testCase.input)};\n`;
                if (testCase.type === 'negative') {
                    testCode += `    // Act & Assert\n`;
                    testCode += `    expect(() => ${func.name}(...input)).toThrow();\n`;
                }
                else {
                    testCode += `    // Act\n`;
                    testCode += `    const result = ${func.name}(...input);\n\n`;
                    testCode += `    // Assert\n`;
                    testCase.assertions.forEach(assertion => {
                        testCode += `    ${assertion};\n`;
                    });
                }
                testCode += `  });\n\n`;
            });
            testCode += `});\n\n`;
        });
        return testCode;
    }
    static generateMochaCode(functions, testCases, fileName) {
        const moduleName = fileName.replace(/\.[^/.]+$/, '');
        let testCode = `const { expect } = require('chai');\n`;
        testCode += `const { ${functions.map(f => f.name).join(', ')} } = require('../src/${moduleName}');\n\n`;
        functions.forEach(func => {
            const funcTestCases = testCases.filter(tc => tc.name.includes(func.name));
            testCode += `describe('${func.name}', function() {\n`;
            funcTestCases.forEach(testCase => {
                testCode += `  it('${testCase.name}', function() {\n`;
                testCode += `    const input = ${JSON.stringify(testCase.input)};\n`;
                testCode += `    const result = ${func.name}(...input);\n`;
                testCode += `    expect(result).to.exist;\n`;
                testCode += `  });\n\n`;
            });
            testCode += `});\n\n`;
        });
        return testCode;
    }
    static generateVitestCode(functions, testCases, fileName) {
        return this.generateJestCode(functions, testCases, fileName)
            .replace(/import.*from.*jest.*/, 'import { describe, it, expect } from "vitest";');
    }
    static generateTestFileName(originalFileName, framework) {
        const baseName = originalFileName.replace(/\.[^/.]+$/, '');
        const extension = framework === 'jest' ? 'test.ts' : 'spec.ts';
        return `${baseName}.${extension}`;
    }
    static extractBranches(code) {
        const branches = [];
        const branchPatterns = [
            /if\s*\([^)]+\)/g,
            /else\s+if\s*\([^)]+\)/g,
            /switch\s*\([^)]+\)/g,
            /case\s+[^:]+:/g,
            /\?\s*[^:]+:/g
        ];
        branchPatterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches) {
                branches.push(...matches);
            }
        });
        return branches;
    }
    static generateIntegrationTest(endpoints) {
        let testCode = `import request from 'supertest';\nimport app from '../src/app';\n\n`;
        testCode += `describe('API Integration Tests', () => {\n`;
        endpoints.forEach(endpoint => {
            const [method, path] = endpoint.split(' ');
            testCode += `  it('should handle ${method} ${path}', async () => {\n`;
            testCode += `    const response = await request(app)\n`;
            testCode += `      .${method.toLowerCase()}('${path}')\n`;
            testCode += `      .expect(200);\n\n`;
            testCode += `    expect(response.body).toBeDefined();\n`;
            testCode += `  });\n\n`;
        });
        testCode += `});\n`;
        return testCode;
    }
    static generateE2ETest(userStories) {
        let testCode = `import { test, expect } from '@playwright/test';\n\n`;
        userStories.forEach((story, index) => {
            testCode += `test('User Story ${index + 1}: ${story}', async ({ page }) => {\n`;
            testCode += `  await page.goto('/');\n`;
            testCode += `  // Add your E2E test steps here\n`;
            testCode += `  await expect(page).toHaveTitle(/DevTracker/);\n`;
            testCode += `});\n\n`;
        });
        return testCode;
    }
}
exports.TestGeneratorService = TestGeneratorService;
//# sourceMappingURL=test-generator.service.js.map