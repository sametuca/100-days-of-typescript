import { swaggerSpec } from '../src/config/swagger.config';
import { Express } from 'express';

interface DocCoverageReport {
  totalEndpoints: number;
  documentedEndpoints: number;
  coverage: number;
  undocumentedEndpoints: string[];
}

export function checkDocumentationCoverage(app: Express): DocCoverageReport {
  const allRoutes: string[] = [];
  const documentedRoutes = new Set<string>();

  // Extract all routes from Express app
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      methods.forEach(method => {
        allRoutes.push(`${method.toUpperCase()} ${middleware.route.path}`);
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods);
          methods.forEach(method => {
            const fullPath = middleware.regexp.source
              .replace('\\/?', '')
              .replace('(?=\\/|$)', '');
            allRoutes.push(`${method.toUpperCase()} ${fullPath}${handler.route.path}`);
          });
        }
      });
    }
  });

  // Extract documented routes from OpenAPI spec
  if ((swaggerSpec as any).paths) {
    Object.entries((swaggerSpec as any).paths).forEach(([path, methods]: [string, any]) => {
      Object.keys(methods).forEach(method => {
        if (method !== 'parameters') {
          documentedRoutes.add(`${method.toUpperCase()} ${path}`);
        }
      });
    });
  }

  const undocumented = allRoutes.filter(route => !documentedRoutes.has(route));
  const coverage = allRoutes.length > 0 
    ? (documentedRoutes.size / allRoutes.length) * 100 
    : 0;

  return {
    totalEndpoints: allRoutes.length,
    documentedEndpoints: documentedRoutes.size,
    coverage: Math.round(coverage * 100) / 100,
    undocumentedEndpoints: undocumented,
  };
}

export function printCoverageReport(report: DocCoverageReport): void {
  console.log('\n📊 API Documentation Coverage Report');
  console.log('=====================================');
  console.log(`Total Endpoints: ${report.totalEndpoints}`);
  console.log(`Documented Endpoints: ${report.documentedEndpoints}`);
  console.log(`Coverage: ${report.coverage}%`);
  
  if (report.undocumentedEndpoints.length > 0) {
    console.log('\n⚠️  Undocumented Endpoints:');
    report.undocumentedEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint}`);
    });
  } else {
    console.log('\n✅ All endpoints are documented!');
  }
}
