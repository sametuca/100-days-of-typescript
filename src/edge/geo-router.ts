import { EdgeRequest, EdgeResponse, GeoRule } from './types';

export class GeoRouter {
  private rules: GeoRule[] = [];
  private defaultHandler?: (request: EdgeRequest) => Promise<EdgeResponse>;

  addRule(rule: GeoRule): void {
    this.rules.push(rule);
  }

  setDefault(handler: (request: EdgeRequest) => Promise<EdgeResponse>): void {
    this.defaultHandler = handler;
  }

  async route(request: EdgeRequest): Promise<EdgeResponse> {
    if (!request.geo) {
      return this.routeToDefault(request);
    }

    // Find matching rule
    for (const rule of this.rules) {
      if (this.matchesRule(request, rule)) {
        return await rule.handler(request);
      }
    }

    return this.routeToDefault(request);
  }

  private matchesRule(request: EdgeRequest, rule: GeoRule): boolean {
    if (!request.geo) return false;

    if (rule.countries?.includes(request.geo.country)) {
      return true;
    }

    if (rule.regions?.includes(request.geo.region)) {
      return true;
    }

    if (rule.continents) {
      const continent = this.getContinent(request.geo.country);
      if (rule.continents.includes(continent)) {
        return true;
      }
    }

    return false;
  }

  private getContinent(country: string): string {
    // Simplified continent mapping
    const continentMap: Record<string, string> = {
      US: 'NA',
      CA: 'NA',
      MX: 'NA',
      BR: 'SA',
      AR: 'SA',
      GB: 'EU',
      DE: 'EU',
      FR: 'EU',
      TR: 'EU',
      RU: 'EU',
      CN: 'AS',
      JP: 'AS',
      IN: 'AS',
      AU: 'OC',
      NZ: 'OC',
      ZA: 'AF',
      EG: 'AF'
    };
    return continentMap[country] || 'Unknown';
  }

  private async routeToDefault(request: EdgeRequest): Promise<EdgeResponse> {
    if (this.defaultHandler) {
      return await this.defaultHandler(request);
    }

    return {
      status: 503,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Service Unavailable' })
    };
  }
}
