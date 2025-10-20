
interface AppConfig {
  name: string;
  version: string;
  port: number;
  environment: 'development' | 'production' | 'test';
}

class Application {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  public start(): void {
    console.log('🚀 Starting DevTracker...');
    console.log('📦 App: ' + this.config.name);
    console.log('📌 Version: ' + this.config.version);
    console.log('🌍 Environment: ' + this.config.environment);
    console.log('🔌 Port: ' + this.config.port);
    console.log('✅ Application initialized successfully!\n');
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }
}

// Initialize application
const config: AppConfig = {
  name: 'DevTracker',
  version: '1.0.0',
  port: 3000,
  environment: 'development'
};

const app = new Application(config);
app.start();

export default app;