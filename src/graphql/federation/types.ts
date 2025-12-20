export interface FederatedService {
  name: string;
  url: string;
  schema?: string;
  health: 'healthy' | 'degraded' | 'down';
}

export interface ServiceDefinition {
  name: string;
  typeDefs: string;
  resolvers: any;
}

export interface GatewayConfig {
  services: FederatedService[];
  pollIntervalMs?: number;
  debug?: boolean;
}

export interface QueryPlan {
  steps: QueryStep[];
  estimatedCost: number;
}

export interface QueryStep {
  service: string;
  operation: string;
  fields: string[];
  dependencies: string[];
}

export interface Operation {
  name: string;
  fields: string[];
  type: 'query' | 'mutation' | 'subscription';
}
