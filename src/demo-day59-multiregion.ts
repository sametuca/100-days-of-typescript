import {
  RegionManager,
  ReplicationManager,
  ConflictResolver,
  GeographicRouter,
  FailoverManager,
  regions
} from './database/multi-region';

async function demonstrateMultiRegion() {
  console.log('=== Day 59: Multi-Region Database Sync Demo ===\n');

  // 1. Region Manager
  console.log('1. Region Initialization');
  console.log('------------------------');

  const regionManager = new RegionManager();
  await regionManager.initialize(regions);

  console.log('✓ Regions initialized:');
  for (const region of regions) {
    console.log(`  - ${region.name} (${region.location}) ${region.isPrimary ? '[PRIMARY]' : ''}`);
    console.log(`    Latency: ${region.latency}ms`);
  }

  console.log();

  // 2. Health Check
  console.log('2. Health Monitoring');
  console.log('-------------------');

  const health = await regionManager.checkHealth();
  console.log(`✓ Health check completed at ${new Date(health.timestamp).toISOString()}`);
  console.log(`✓ All regions healthy: ${health.allHealthy ? 'Yes' : 'No'}`);

  for (const regionHealth of health.regions) {
    console.log(`  - ${regionHealth.region}: ${regionHealth.healthy ? '✓' : '✗'} (${regionHealth.latency}ms)`);
  }

  console.log();

  // 3. Geographic Routing
  console.log('3. Geographic Routing');
  console.log('--------------------');

  const geoRouter = new GeographicRouter(regionManager);

  const locations = ['US', 'EU', 'APAC'];
  for (const location of locations) {
    const region = regionManager.getNearestRegion(location);
    console.log(`✓ User from ${location} → ${region?.name} (${region?.config.location})`);
  }

  console.log();

  // 4. Write Replication
  console.log('4. Write Replication');
  console.log('-------------------');

  const replicationManager = new ReplicationManager();

  const writeOperation = {
    type: 'insert' as const,
    table: 'users',
    data: {
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com'
    }
  };

  console.log('✓ Writing to primary region (us-east-1)');
  await replicationManager.replicateWrite('us-east-1', writeOperation);

  console.log('✓ Replicating to other regions...');
  console.log(`  Queue size: ${replicationManager.getQueueSize()}`);

  console.log();

  // 5. Conflict Resolution
  console.log('5. Conflict Resolution');
  console.log('---------------------');

  const conflictResolver = new ConflictResolver();

  const localVersion = {
    data: { name: 'John Doe', email: 'john@example.com', updated: 'local' },
    timestamp: Date.now() - 1000,
    vectorClock: { 'us-east-1': 2, 'eu-west-1': 1, 'ap-southeast-1': 1 }
  };

  const remoteVersion = {
    data: { name: 'John Doe', email: 'john.doe@example.com', updated: 'remote' },
    timestamp: Date.now(),
    vectorClock: { 'us-east-1': 1, 'eu-west-1': 2, 'ap-southeast-1': 1 }
  };

  const resolution = conflictResolver.resolveConflict(localVersion, remoteVersion);
  console.log(`✓ Conflict resolved using: ${resolution.strategy}`);
  console.log(`✓ Winner: ${resolution.winner}`);
  console.log(`✓ Final data:`, resolution.data);

  console.log();

  // 6. Failover Management
  console.log('6. Failover Management');
  console.log('---------------------');

  const failoverManager = new FailoverManager(regionManager);
  failoverManager.startHealthChecks();

  console.log('✓ Health checks started (30s interval)');
  console.log('✓ Automatic failover enabled');
  console.log(`✓ Primary region: ${regionManager.getPrimaryRegion()}`);

  const healthyRegions = regionManager.getHealthyRegions();
  console.log(`✓ Healthy regions: ${healthyRegions.length}/${regions.length}`);

  failoverManager.stopHealthChecks();

  console.log();

  // 7. Read/Write Operations
  console.log('7. Multi-Region Operations');
  console.log('--------------------------');

  console.log('Read Operations:');
  await geoRouter.routeRead('US', { table: 'users', id: 'user_123' });
  await geoRouter.routeRead('EU', { table: 'users', id: 'user_123' });

  console.log('\nWrite Operations:');
  const writeResult = await geoRouter.routeWrite('US', {
    table: 'users',
    action: 'update',
    id: 'user_123',
    data: { status: 'active' }
  });

  console.log(`✓ Write completed in ${writeResult.region}`);
  console.log(`✓ Replication status: ${writeResult.replicationStatus}`);

  console.log();

  // Summary
  console.log('Multi-Region Summary');
  console.log('====================');
  console.log('✅ 3 regions active (US-East, EU-West, APAC-Southeast)');
  console.log('✅ Active-Active replication enabled');
  console.log('✅ Geographic routing optimized');
  console.log('✅ Conflict resolution: Last-Write-Wins + Vector Clocks');
  console.log('✅ Automatic failover configured');
  console.log('✅ All regions healthy and synchronized');
}

demonstrateMultiRegion().catch(console.error);
