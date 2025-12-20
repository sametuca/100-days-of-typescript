type VectorClock = Record<string, number>;

interface DataVersion {
  data: any;
  timestamp: number;
  vectorClock: VectorClock;
}

interface ResolvedConflict {
  winner: 'local' | 'remote' | 'merged';
  data: any;
  strategy: string;
}

export class ConflictResolver {
  resolveConflict(
    local: DataVersion,
    remote: DataVersion
  ): ResolvedConflict {
    // Last-Write-Wins strategy
    if (remote.timestamp > local.timestamp) {
      return {
        winner: 'remote',
        data: remote.data,
        strategy: 'last-write-wins'
      };
    }

    if (local.timestamp > remote.timestamp) {
      return {
        winner: 'local',
        data: local.data,
        strategy: 'last-write-wins'
      };
    }

    // Same timestamp - use vector clock
    const comparison = this.compareVectorClocks(
      local.vectorClock,
      remote.vectorClock
    );

    if (comparison === 'greater') {
      return {
        winner: 'local',
        data: local.data,
        strategy: 'vector-clock'
      };
    }

    if (comparison === 'less') {
      return {
        winner: 'remote',
        data: remote.data,
        strategy: 'vector-clock'
      };
    }

    // Concurrent updates - merge
    return this.mergeData(local, remote);
  }

  private compareVectorClocks(
    local: VectorClock,
    remote: VectorClock
  ): 'greater' | 'less' | 'concurrent' {
    let localGreater = false;
    let remoteGreater = false;

    for (const region in local) {
      if (local[region] > (remote[region] || 0)) {
        localGreater = true;
      }
      if (local[region] < (remote[region] || 0)) {
        remoteGreater = true;
      }
    }

    if (localGreater && !remoteGreater) return 'greater';
    if (remoteGreater && !localGreater) return 'less';
    return 'concurrent';
  }

  private mergeData(local: DataVersion, remote: DataVersion): ResolvedConflict {
    const merged = {
      ...local.data,
      ...remote.data
    };

    return {
      winner: 'merged',
      data: merged,
      strategy: 'merge'
    };
  }

  async handleConflict(
    table: string,
    key: any,
    local: DataVersion,
    remote: DataVersion
  ): Promise<void> {
    const resolution = this.resolveConflict(local, remote);

    console.log(`Conflict resolved for ${table}:${key}`);
    console.log(`Strategy: ${resolution.strategy}, Winner: ${resolution.winner}`);
  }
}
