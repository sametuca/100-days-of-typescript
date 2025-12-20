export interface RegionConfig {
  name: string;
  location: string;
  isPrimary: boolean;
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  latency: number;
}

export interface MultiRegionConfig {
  regions: RegionConfig[];
  replicationStrategy: 'active-active' | 'active-passive' | 'multi-master';
  consistencyLevel: 'strong' | 'eventual' | 'causal';
  conflictResolution: 'last-write-wins' | 'custom' | 'merge';
}

export const regions: RegionConfig[] = [
  {
    name: 'us-east-1',
    location: 'Virginia, USA',
    isPrimary: true,
    database: {
      host: 'db-us-east-1.example.com',
      port: 5432,
      database: 'appdb',
      user: 'appuser',
      password: 'secure_password'
    },
    latency: 0
  },
  {
    name: 'eu-west-1',
    location: 'Ireland, EU',
    isPrimary: false,
    database: {
      host: 'db-eu-west-1.example.com',
      port: 5432,
      database: 'appdb',
      user: 'appuser',
      password: 'secure_password'
    },
    latency: 80
  },
  {
    name: 'ap-southeast-1',
    location: 'Singapore, APAC',
    isPrimary: false,
    database: {
      host: 'db-ap-southeast-1.example.com',
      port: 5432,
      database: 'appdb',
      user: 'appuser',
      password: 'secure_password'
    },
    latency: 180
  }
];
