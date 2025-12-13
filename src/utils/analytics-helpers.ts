/**
 * Day 54: Data Export & Visualization Utilities
 * 
 * Utilities for exporting data and generating visualizations
 */

import { ChartData, DataPoint, GeneratedReport } from '../services/analytics.service';

// ==================== CSV EXPORT ====================

export interface CSVOptions {
  delimiter?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

export class CSVExporter {
  private delimiter: string;
  private includeHeaders: boolean;
  
  constructor(options: CSVOptions = {}) {
    this.delimiter = options.delimiter || ',';
    this.includeHeaders = options.includeHeaders !== false;
  }
  
  /**
   * Convert array of objects to CSV string
   */
  toCSV<T extends Record<string, any>>(data: T[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows: string[] = [];
    
    if (this.includeHeaders) {
      rows.push(headers.join(this.delimiter));
    }
    
    for (const item of data) {
      const values = headers.map(h => {
        const val = item[h];
        return this.formatValue(val);
      });
      rows.push(values.join(this.delimiter));
    }
    
    return rows.join('\n');
  }
  
  /**
   * Convert report to CSV
   */
  reportToCSV(report: GeneratedReport): string {
    const sections: string[] = [];
    
    // Report header
    sections.push(`Report: ${report.title}`);
    sections.push(`Generated: ${report.generatedAt.toISOString()}`);
    sections.push('');
    
    // KPI section
    if (report.data.kpi) {
      sections.push('=== KPI Metrics ===');
      sections.push(this.toCSV([report.data.kpi]));
      sections.push('');
    }
    
    // Team section
    if (report.data.team) {
      sections.push('=== Team Analytics ===');
      sections.push(`Total Members${this.delimiter}${report.data.team.totalMembers}`);
      sections.push(`Active Members${this.delimiter}${report.data.team.activeMembers}`);
      sections.push(`Team Velocity${this.delimiter}${report.data.team.teamVelocity}`);
      sections.push('');
      
      if (report.data.team.workloadDistribution?.length > 0) {
        sections.push('--- Workload Distribution ---');
        sections.push(this.toCSV(report.data.team.workloadDistribution));
        sections.push('');
      }
    }
    
    // Funnel section
    if (report.data.funnel) {
      sections.push('=== Funnel Analysis ===');
      sections.push(this.toCSV(report.data.funnel.steps));
      sections.push('');
    }
    
    // Summary
    sections.push('=== Summary ===');
    sections.push(`Highlights${this.delimiter}${report.summary.highlights.join('; ')}`);
    sections.push(`Alerts${this.delimiter}${report.summary.alerts.join('; ')}`);
    sections.push(`Recommendations${this.delimiter}${report.summary.recommendations.join('; ')}`);
    
    return sections.join('\n');
  }
  
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value).replace(/"/g, '""');
    }
    
    const stringValue = String(value);
    
    // Escape if contains delimiter, newline, or quotes
    if (stringValue.includes(this.delimiter) || 
        stringValue.includes('\n') || 
        stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }
}

// ==================== CHART HELPERS ====================

export interface ChartTheme {
  colors: string[];
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  fontFamily: string;
}

export const defaultTheme: ChartTheme = {
  colors: [
    '#3498db', // Blue
    '#2ecc71', // Green
    '#e74c3c', // Red
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#34495e', // Dark gray
    '#e67e22'  // Dark orange
  ],
  backgroundColor: '#ffffff',
  textColor: '#333333',
  gridColor: '#e0e0e0',
  fontFamily: 'Inter, system-ui, sans-serif'
};

export const darkTheme: ChartTheme = {
  colors: [
    '#5dade2', // Light blue
    '#58d68d', // Light green
    '#ec7063', // Light red
    '#f5b041', // Light orange
    '#bb8fce', // Light purple
    '#48c9b0', // Light teal
    '#85929e', // Gray
    '#eb984e'  // Light orange
  ],
  backgroundColor: '#1e1e1e',
  textColor: '#e0e0e0',
  gridColor: '#404040',
  fontFamily: 'Inter, system-ui, sans-serif'
};

export class ChartHelper {
  private theme: ChartTheme;
  
  constructor(theme: ChartTheme = defaultTheme) {
    this.theme = theme;
  }
  
  /**
   * Generate color palette
   */
  getColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(this.theme.colors[i % this.theme.colors.length]);
    }
    return colors;
  }
  
  /**
   * Transform ChartData to ECharts options
   */
  toEChartsOption(chartData: ChartData): any {
    const colors = this.getColors(chartData.series.length);
    
    const baseOption = {
      backgroundColor: this.theme.backgroundColor,
      textStyle: {
        color: this.theme.textColor,
        fontFamily: this.theme.fontFamily
      },
      title: {
        text: chartData.title,
        left: 'center',
        textStyle: {
          color: this.theme.textColor
        }
      },
      tooltip: {
        trigger: chartData.chartType === 'pie' ? 'item' : 'axis'
      },
      color: colors
    };
    
    switch (chartData.chartType) {
      case 'pie':
        return this.toPieChart(chartData, baseOption);
      case 'bar':
        return this.toBarChart(chartData, baseOption);
      case 'line':
        return this.toLineChart(chartData, baseOption);
      case 'area':
        return this.toAreaChart(chartData, baseOption);
      case 'heatmap':
        return this.toHeatmap(chartData, baseOption);
      default:
        return this.toBarChart(chartData, baseOption);
    }
  }
  
  /**
   * Transform ChartData to Chart.js config
   */
  toChartJSConfig(chartData: ChartData): any {
    const colors = this.getColors(chartData.series.length);
    
    const typeMap: Record<string, string> = {
      pie: 'pie',
      bar: 'bar',
      line: 'line',
      area: 'line',
      scatter: 'scatter'
    };
    
    return {
      type: typeMap[chartData.chartType] || 'bar',
      data: {
        labels: chartData.series[0]?.data.map(d => d.label || d.x) || [],
        datasets: chartData.series.map((series, index) => ({
          label: series.name,
          data: series.data.map(d => d.y),
          backgroundColor: chartData.chartType === 'pie' 
            ? colors 
            : colors[index],
          borderColor: colors[index],
          fill: chartData.chartType === 'area'
        }))
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: chartData.title
          },
          legend: {
            display: chartData.series.length > 1
          }
        },
        scales: chartData.chartType !== 'pie' ? {
          x: {
            title: {
              display: true,
              text: chartData.xAxis.label
            }
          },
          y: {
            title: {
              display: true,
              text: chartData.yAxis.label
            }
          }
        } : undefined
      }
    };
  }
  
  /**
   * Generate SVG sparkline
   */
  toSparkline(data: number[], width: number = 100, height: number = 30): string {
    if (data.length === 0) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });
    
    const color = this.theme.colors[0];
    
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <polyline
        fill="none"
        stroke="${color}"
        stroke-width="2"
        points="${points.join(' ')}"
      />
      <circle cx="${points[points.length - 1].split(',')[0]}" cy="${points[points.length - 1].split(',')[1]}" r="3" fill="${color}"/>
    </svg>`;
  }
  
  /**
   * Generate ASCII chart (for terminal/logs)
   */
  toASCIIChart(data: DataPoint[], height: number = 10): string {
    if (data.length === 0) return '';
    
    const values = data.map(d => d.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const rows: string[] = [];
    
    // Create chart
    for (let row = height; row >= 0; row--) {
      const threshold = min + (row / height) * range;
      let line = '';
      
      for (const value of values) {
        if (value >= threshold) {
          line += '█';
        } else if (value >= threshold - (range / height / 2)) {
          line += '▄';
        } else {
          line += ' ';
        }
      }
      
      // Add Y-axis label
      const label = row === height ? max.toFixed(0) :
                    row === 0 ? min.toFixed(0) : '';
      rows.push(`${label.padStart(6)} │${line}`);
    }
    
    // Add X-axis
    rows.push(`${''.padStart(6)} └${'─'.repeat(values.length)}`);
    
    // Add X labels (first and last)
    const firstLabel = String(data[0].x).slice(0, 8);
    const lastLabel = String(data[data.length - 1].x).slice(0, 8);
    rows.push(`${''.padStart(7)}${firstLabel}${' '.repeat(Math.max(0, values.length - firstLabel.length - lastLabel.length))}${lastLabel}`);
    
    return rows.join('\n');
  }
  
  private toPieChart(chartData: ChartData, baseOption: any): any {
    return {
      ...baseOption,
      series: [{
        type: 'pie',
        radius: '60%',
        data: chartData.series[0]?.data.map(d => ({
          name: d.label || d.x,
          value: d.y
        })) || []
      }]
    };
  }
  
  private toBarChart(chartData: ChartData, baseOption: any): any {
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        name: chartData.xAxis.label,
        data: chartData.series[0]?.data.map(d => d.label || d.x) || [],
        axisLine: { lineStyle: { color: this.theme.gridColor } },
        axisLabel: { color: this.theme.textColor }
      },
      yAxis: {
        type: 'value',
        name: chartData.yAxis.label,
        axisLine: { lineStyle: { color: this.theme.gridColor } },
        splitLine: { lineStyle: { color: this.theme.gridColor } },
        axisLabel: { color: this.theme.textColor }
      },
      series: chartData.series.map(s => ({
        name: s.name,
        type: 'bar',
        data: s.data.map(d => d.y)
      }))
    };
  }
  
  private toLineChart(chartData: ChartData, baseOption: any): any {
    return {
      ...baseOption,
      xAxis: {
        type: chartData.xAxis.type === 'time' ? 'time' : 'category',
        name: chartData.xAxis.label,
        data: chartData.xAxis.type !== 'time' 
          ? chartData.series[0]?.data.map(d => d.label || d.x) 
          : undefined,
        axisLine: { lineStyle: { color: this.theme.gridColor } },
        axisLabel: { color: this.theme.textColor }
      },
      yAxis: {
        type: 'value',
        name: chartData.yAxis.label,
        axisLine: { lineStyle: { color: this.theme.gridColor } },
        splitLine: { lineStyle: { color: this.theme.gridColor } },
        axisLabel: { color: this.theme.textColor }
      },
      series: chartData.series.map(s => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data.map(d => chartData.xAxis.type === 'time' ? [d.x, d.y] : d.y)
      }))
    };
  }
  
  private toAreaChart(chartData: ChartData, baseOption: any): any {
    const lineChart = this.toLineChart(chartData, baseOption);
    lineChart.series = lineChart.series.map((s: any) => ({
      ...s,
      areaStyle: { opacity: 0.3 }
    }));
    return lineChart;
  }
  
  private toHeatmap(chartData: ChartData, baseOption: any): any {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: days,
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: hours,
        splitArea: { show: true }
      },
      visualMap: {
        min: 0,
        max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
        }
      },
      series: [{
        name: chartData.title,
        type: 'heatmap',
        data: chartData.series[0]?.data.map(d => {
          const meta = d.metadata || {};
          return [meta.day || 0, meta.hour || 0, d.y];
        }) || [],
        label: { show: false }
      }]
    };
  }
}

// ==================== DATA AGGREGATION ====================

export interface AggregationResult {
  key: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

export class DataAggregator {
  /**
   * Group and aggregate data
   */
  aggregate<T>(
    data: T[],
    keyFn: (item: T) => string,
    valueFn: (item: T) => number
  ): AggregationResult[] {
    const groups = new Map<string, number[]>();
    
    for (const item of data) {
      const key = keyFn(item);
      const value = valueFn(item);
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(value);
    }
    
    return Array.from(groups.entries()).map(([key, values]) => ({
      key,
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      min: Math.min(...values),
      max: Math.max(...values)
    }));
  }
  
  /**
   * Create pivot table
   */
  pivot<T>(
    data: T[],
    rowFn: (item: T) => string,
    colFn: (item: T) => string,
    valueFn: (item: T) => number,
    aggregateFn: 'sum' | 'avg' | 'count' = 'sum'
  ): Map<string, Map<string, number>> {
    const pivot = new Map<string, Map<string, number[]>>();
    
    for (const item of data) {
      const row = rowFn(item);
      const col = colFn(item);
      const value = valueFn(item);
      
      if (!pivot.has(row)) {
        pivot.set(row, new Map());
      }
      const rowMap = pivot.get(row)!;
      
      if (!rowMap.has(col)) {
        rowMap.set(col, []);
      }
      rowMap.get(col)!.push(value);
    }
    
    // Aggregate values
    const result = new Map<string, Map<string, number>>();
    
    for (const [row, cols] of pivot.entries()) {
      result.set(row, new Map());
      for (const [col, values] of cols.entries()) {
        let aggregated: number;
        
        switch (aggregateFn) {
          case 'sum':
            aggregated = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            aggregated = values.length > 0 
              ? values.reduce((a, b) => a + b, 0) / values.length 
              : 0;
            break;
          case 'count':
            aggregated = values.length;
            break;
        }
        
        result.get(row)!.set(col, aggregated);
      }
    }
    
    return result;
  }
  
  /**
   * Calculate running total
   */
  runningTotal(values: number[]): number[] {
    let total = 0;
    return values.map(v => {
      total += v;
      return total;
    });
  }
  
  /**
   * Calculate moving average
   */
  movingAverage(values: number[], windowSize: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const avg = window.reduce((a, b) => a + b, 0) / window.length;
      result.push(avg);
    }
    
    return result;
  }
  
  /**
   * Calculate percentile
   */
  percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
  
  /**
   * Calculate standard deviation
   */
  standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    
    return Math.sqrt(variance);
  }
}

// ==================== FORMATTING UTILITIES ====================

export class Formatter {
  /**
   * Format number with compact notation
   */
  static compactNumber(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
  }
  
  /**
   * Format percentage
   */
  static percentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }
  
  /**
   * Format duration in human-readable format
   */
  static duration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    if (hours < 168) return `${(hours / 24).toFixed(1)}d`;
    return `${(hours / 168).toFixed(1)}w`;
  }
  
  /**
   * Format relative time
   */
  static relativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'just now';
  }
  
  /**
   * Format trend indicator
   */
  static trendIndicator(value: number): string {
    if (value > 0) return `↑ +${value.toFixed(1)}%`;
    if (value < 0) return `↓ ${value.toFixed(1)}%`;
    return '→ 0%';
  }
  
  /**
   * Format progress bar
   */
  static progressBar(value: number, max: number = 100, width: number = 20): string {
    const percentage = Math.min(1, value / max);
    const filled = Math.round(percentage * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${(percentage * 100).toFixed(0)}%`;
  }
}

// Export instances
export const csvExporter = new CSVExporter();
export const chartHelper = new ChartHelper();
export const darkChartHelper = new ChartHelper(darkTheme);
export const dataAggregator = new DataAggregator();
