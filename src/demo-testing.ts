import { TestGeneratorService } from './services/test-generator.service';
import { CoverageAnalyzerService } from './services/coverage-analyzer.service';
import { QualityGateService } from './services/quality-gate.service';

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
    const testResult = await TestGeneratorService.generateTests({
      code: sampleCode,
      language: 'javascript',
      fileName: 'sample.js',
      testType: 'unit',
      framework: 'jest'
    });

    console.log(`✅ Generated: ${testResult.testFileName}`);
    console.log(`📊 Test cases: ${testResult.testCases.length}`);
    
    const coverageReport = await CoverageAnalyzerService.analyzeCoverage();
    console.log(`📈 Coverage: ${coverageReport.overall.lines.percentage}%`);
    
    const defaultGate = QualityGateService.getDefaultQualityGate();
    const evaluation = await QualityGateService.evaluateQualityGate(defaultGate.id);
    console.log(`🚪 Quality Gate: ${evaluation.status} (${evaluation.overallScore}/100)`);

  } catch (error) {
    console.error(`❌ Demo failed: ${error}`);
  }
}

if (require.main === module) {
  demoTesting().catch(console.error);
}

export { demoTesting };