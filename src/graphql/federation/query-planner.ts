import { QueryPlan, QueryStep, Operation } from './types';

export class QueryPlanner {
  planQuery(query: string, _services: string[]): QueryPlan {
    const operations = this.parseQuery(query);
    const steps: QueryStep[] = [];

    for (const operation of operations) {
      const service = this.determineService(operation);
      steps.push({
        service,
        operation: operation.name,
        fields: operation.fields,
        dependencies: []
      });
    }

    const optimized = this.optimizePlan(steps);

    return {
      steps: optimized,
      estimatedCost: this.calculateCost(optimized)
    };
  }

  private parseQuery(_query: string): Operation[] {
    return [
      {
        name: 'getUser',
        fields: ['id', 'name', 'email'],
        type: 'query'
      }
    ];
  }

  private determineService(operation: Operation): string {
    if (operation.name.includes('User')) return 'user-service';
    if (operation.name.includes('Task')) return 'task-service';
    return 'unknown';
  }

  private optimizePlan(steps: QueryStep[]): QueryStep[] {
    return steps;
  }

  private calculateCost(steps: QueryStep[]): number {
    return steps.reduce((cost, step) => cost + step.fields.length, 0);
  }
}
