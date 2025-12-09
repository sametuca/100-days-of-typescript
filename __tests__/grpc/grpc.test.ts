import { TaskGrpcClient } from '../src/grpc/clients/task-grpc.client';
import { CircuitBreaker, CircuitState } from '../src/patterns/circuit-breaker';

describe('gRPC Client', () => {
  let client: TaskGrpcClient;

  beforeAll(() => {
    // Assuming gRPC server is running on localhost:50051
    client = new TaskGrpcClient('localhost:50051');
  });

  afterAll(() => {
    client.close();
  });

  describe('Task Operations', () => {
    let createdTaskId: number;

    it('should create a task', async () => {
      const task = await client.createTask({
        title: 'Test gRPC Task',
        description: 'Testing gRPC implementation',
        priority: 'high',
        status: 'todo',
        user_id: 1
      });

      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test gRPC Task');
      expect(task.priority).toBe('high');
      
      createdTaskId = task.id;
    }, 10000);

    it('should get a task by id', async () => {
      const task = await client.getTask(createdTaskId);

      expect(task.id).toBe(createdTaskId);
      expect(task.title).toBe('Test gRPC Task');
    }, 10000);

    it('should update a task', async () => {
      const updatedTask = await client.updateTask(createdTaskId, {
        status: 'in-progress',
        priority: 'medium'
      });

      expect(updatedTask.id).toBe(createdTaskId);
      expect(updatedTask.status).toBe('in-progress');
      expect(updatedTask.priority).toBe('medium');
    }, 10000);

    it('should list tasks for a user', async () => {
      const tasks = await client.listTasks(1, { limit: 10 });

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    }, 10000);

    it('should stream task updates', (done) => {
      const unsubscribe = client.subscribeToTaskUpdates(
        1,
        [createdTaskId],
        (event) => {
          expect(event).toHaveProperty('event_type');
          expect(event).toHaveProperty('task');
          expect(event).toHaveProperty('timestamp');
          unsubscribe();
          done();
        }
      );
    }, 15000);

    it('should delete a task', async () => {
      const result = await client.deleteTask(createdTaskId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Task deleted successfully');
    }, 10000);
  });
});

describe('Circuit Breaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      resetTimeout: 2000
    });
  });

  it('should start in CLOSED state', () => {
    expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should execute successful operations', async () => {
    const result = await circuitBreaker.execute(async () => {
      return 'success';
    });

    expect(result).toBe('success');
    expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should open after failure threshold', async () => {
    const failingOperation = async () => {
      throw new Error('Operation failed');
    };

    // Execute failing operations
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(failingOperation);
      } catch (error) {
        // Expected to fail
      }
    }

    expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
  });

  it('should reject calls when OPEN', async () => {
    // Force circuit to OPEN state
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('fail');
        });
      } catch (error) {
        // Expected
      }
    }

    expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

    // Try to execute when OPEN
    await expect(
      circuitBreaker.execute(async () => 'should fail')
    ).rejects.toThrow('Circuit breaker is OPEN');
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('fail');
        });
      } catch (error) {
        // Expected
      }
    }

    expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, 2100));

    // Next call should transition to HALF_OPEN
    try {
      await circuitBreaker.execute(async () => 'success');
    } catch (error) {
      // May fail before transitioning
    }

    const state = circuitBreaker.getState();
    expect([CircuitState.HALF_OPEN, CircuitState.CLOSED]).toContain(state);
  }, 5000);

  it('should close after success threshold in HALF_OPEN', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('fail');
        });
      } catch (error) {
        // Expected
      }
    }

    // Wait for reset
    await new Promise(resolve => setTimeout(resolve, 2100));

    // Execute successful operations
    for (let i = 0; i < 2; i++) {
      await circuitBreaker.execute(async () => 'success');
    }

    expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
  }, 5000);

  it('should handle timeout', async () => {
    const slowOperation = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return 'should timeout';
    };

    await expect(
      circuitBreaker.execute(slowOperation)
    ).rejects.toThrow('Operation timeout');
  }, 5000);

  it('should provide metrics', () => {
    const metrics = circuitBreaker.getMetrics();

    expect(metrics).toHaveProperty('state');
    expect(metrics).toHaveProperty('failureCount');
    expect(metrics).toHaveProperty('successCount');
    expect(metrics).toHaveProperty('nextAttempt');
  });

  it('should reset manually', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('fail');
        });
      } catch (error) {
        // Expected
      }
    }

    expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

    // Manual reset
    circuitBreaker.reset();

    expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    const metrics = circuitBreaker.getMetrics();
    expect(metrics.failureCount).toBe(0);
    expect(metrics.successCount).toBe(0);
  });
});
