import { AIAnalysisService } from '../src/services/ai-analysis.service';
import { CodeQualityService } from '../src/services/code-quality.service';

async function demoAnalysis() {
  console.log('🤖 AI Code Analysis Demo - Day 31\n');

  // Demo kod örnekleri
  const codeExamples = [
    {
      name: 'Good Code',
      code: `
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

interface Item {
  name: string;
  price: number;
}
      `,
      fileName: 'good-code.ts'
    },
    {
      name: 'Bad Code',
      code: `
function process(data, temp, x) {
  eval("console.log('dangerous')");
  document.innerHTML = data;
  
  for (let i = 0; i < data.length; i++) {
    document.getElementById('item-' + i).innerHTML = data[i];
    if (data[i] > 0) {
      if (data[i] < 100) {
        if (data[i] % 2 === 0) {
          console.log('even');
        } else {
          console.log('odd');
        }
      }
    }
  }
  
  let result = temp + x;
  return result;
}
      `,
      fileName: 'bad-code.js'
    }
  ];

  // Her kod örneğini analiz et
  for (const example of codeExamples) {
    console.log(`📝 Analyzing: ${example.name}`);
    console.log('─'.repeat(50));

    try {
      const result = await AIAnalysisService.analyzeCode({
        code: example.code,
        language: example.fileName.endsWith('.ts') ? 'typescript' : 'javascript',
        fileName: example.fileName
      });

      // Sonuçları göster
      console.log(`📊 Overall Score: ${result.overallScore}/100 (Grade: ${result.grade})`);
      console.log(`🔧 Complexity: ${result.metrics.complexity}`);
      console.log(`📈 Maintainability: ${result.metrics.maintainabilityIndex}`);
      console.log(`💸 Technical Debt: ${result.metrics.technicalDebt}%`);
      console.log(`🚨 Code Smells: ${result.metrics.codeSmells}`);
      
      if (result.securityIssues.length > 0) {
        console.log(`🔒 Security Issues: ${result.securityIssues.length}`);
        result.securityIssues.forEach(issue => {
          console.log(`   - ${issue.severity.toUpperCase()}: ${issue.message} (Line ${issue.line})`);
        });
      }

      if (result.performanceIssues.length > 0) {
        console.log(`⚡ Performance Issues: ${result.performanceIssues.length}`);
        result.performanceIssues.forEach(issue => {
          console.log(`   - ${issue.severity.toUpperCase()}: ${issue.message} (Line ${issue.line})`);
        });
      }

      if (result.suggestions.length > 0) {
        console.log(`💡 Suggestions: ${result.suggestions.length}`);
        result.suggestions.slice(0, 2).forEach(suggestion => {
          console.log(`   - ${suggestion.type.toUpperCase()}: ${suggestion.description}`);
        });
      }

      // Kalite servisine ekle
      CodeQualityService.addAnalysisResult(result);

    } catch (error) {
      console.error(`❌ Analysis failed: ${error}`);
    }

    console.log('\n');
  }

  // Genel rapor oluştur
  console.log('📋 Quality Report');
  console.log('─'.repeat(50));

  try {
    const report = await CodeQualityService.generateReport();
    console.log(`📁 Total Files: ${report.summary.totalFiles}`);
    console.log(`📊 Average Score: ${report.summary.averageScore}`);
    console.log(`🚨 Total Issues: ${report.summary.totalIssues}`);
    console.log(`🔥 Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`📈 Quality Trend: ${report.trends.qualityTrend}`);
    console.log(`🔧 Complexity Trend: ${report.trends.complexityTrend}`);

    if (report.recommendations.length > 0) {
      console.log('\n🎯 AI Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`   - ${rec.category.toUpperCase()}: ${rec.description}`);
        console.log(`     Confidence: ${Math.round(rec.confidence * 100)}%`);
      });
    }

  } catch (error) {
    console.error(`❌ Report generation failed: ${error}`);
  }

  console.log('\n✅ Demo completed!');
}

// Demo'yu çalıştır
if (require.main === module) {
  demoAnalysis().catch(console.error);
}

export { demoAnalysis };