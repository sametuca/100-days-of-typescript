import { metricsCollector } from './metrics';
import { serviceRegistry } from '../microservices/service-registry';

export class HealthMetrics {
  static collectSystemMetrics(): void {
    // Memory usage
    const memUsage = process.memoryUsage();
    metricsCollector.setGauge('nodejs_memory_heap_used_bytes', memUsage.heapUsed);
    metricsCollector.setGauge('nodejs_memory_heap_total_bytes', memUsage.heapTotal);
    metricsCollector.setGauge('nodejs_memory_rss_bytes', memUsage.rss);
    
    // Process uptime
    metricsCollector.setGauge('nodejs_process_uptime_seconds', process.uptime());
    
    // CPU usage (approximation)
    const cpuUsage = process.cpuUsage();
    metricsCollector.setGauge('nodejs_process_cpu_user_seconds_total', cpuUsage.user / 1000000);
    metricsCollector.setGauge('nodejs_process_cpu_system_seconds_total', cpuUsage.system / 1000000);
    
    // Service registry metrics
    const services = serviceRegistry.getAllServices();
    const healthyServices = services.filter(s => s.health === 'healthy');
    
    metricsCollector.setGauge('services_total', services.length);
    metricsCollector.setGauge('services_healthy', healthyServices.length);
    metricsCollector.setGauge('services_unhealthy', services.length - healthyServices.length);
  }

  static startMetricsCollection(): void {
    // Collect metrics every 15 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 15000);
    
    // Initial collection
    this.collectSystemMetrics();
  }
}