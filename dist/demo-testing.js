"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoTesting = demoTesting;
const test_generator_service_1 = require("./services/test-generator.service");
const coverage_analyzer_service_1 = require("./services/coverage-analyzer.service");
const quality_gate_service_1 = require("./services/quality-gate.service");
async function demoTesting() {
    console.log('🧪 Advanced Testing & QA Demo - Day 32\n');
    const sampleCode = `
function calculateTotal(items) {
  if (!items || !Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  return items.reduce((sum, item) => sum + item.price, 0);
}`;
    try {
        const testResult = await test_generator_service_1.TestGeneratorService.generateTests({
            code: sampleCode,
            language: 'javascript',
            fileName: 'sample.js',
            testType: 'unit',
            framework: 'jest'
        });
        console.log(`✅ Generated: ${testResult.testFileName}`);
        console.log(`📊 Test cases: ${testResult.testCases.length}`);
        const coverageReport = await coverage_analyzer_service_1.CoverageAnalyzerService.analyzeCoverage();
        console.log(`📈 Coverage: ${coverageReport.overall.lines.percentage}%`);
        const defaultGate = quality_gate_service_1.QualityGateService.getDefaultQualityGate();
        const evaluation = await quality_gate_service_1.QualityGateService.evaluateQualityGate(defaultGate.id);
        console.log(`🚪 Quality Gate: ${evaluation.status} (${evaluation.overallScore}/100)`);
    }
    catch (error) {
        console.error(`❌ Demo failed: ${error}`);
    }
}
if (require.main === module) {
    demoTesting().catch(console.error);
}
//# sourceMappingURL=demo-testing.js.map