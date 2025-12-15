import AWS from 'aws-sdk';
import logger from '../../utils/logger';

export interface DbQuery {
  where?: Record<string, any>;
  limit?: number;
  startKey?: Record<string, any>;
}

export class ServerlessDBService {
  private dynamodb: AWS.DynamoDB.DocumentClient;
  private tableName: string;

  constructor(tableName: string = 'tasks') {
    this.dynamodb = new AWS.DynamoDB.DocumentClient();
    this.tableName = tableName;
  }

  /**
   * Put item to DynamoDB
   */
  async put(item: any): Promise<any> {
    try {
      const params = {
        TableName: this.tableName,
        Item: {
          ...item,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      await this.dynamodb.put(params).promise();

      logger.info(`Item created in ${this.tableName}`);

      return params.Item;
    } catch (error: any) {
      logger.error('DynamoDB put error:', error);
      throw new Error(`Failed to create item: ${error.message}`);
    }
  }

  /**
   * Get item from DynamoDB
   */
  async get(id: string): Promise<any> {
    try {
      const params = {
        TableName: this.tableName,
        Key: { id }
      };

      const result = await this.dynamodb.get(params).promise();

      return result.Item;
    } catch (error: any) {
      logger.error('DynamoDB get error:', error);
      throw new Error(`Failed to get item: ${error.message}`);
    }
  }

  /**
   * Query items by GSI
   */
  async query(gsiName: string, gsiKey: string, value: any, options?: DbQuery): Promise<any[]> {
    try {
      const params: any = {
        TableName: this.tableName,
        IndexName: gsiName,
        KeyConditionExpression: `${gsiKey} = :value`,
        ExpressionAttributeValues: {
          ':value': value
        }
      };

      if (options?.limit) params.Limit = options.limit;
      if (options?.startKey) params.ExclusiveStartKey = options.startKey;

      const result = await this.dynamodb.query(params).promise();

      return result.Items || [];
    } catch (error: any) {
      logger.error('DynamoDB query error:', error);
      throw new Error(`Failed to query items: ${error.message}`);
    }
  }

  /**
   * Update item in DynamoDB
   */
  async update(id: string, updates: Record<string, any>): Promise<any> {
    try {
      const updateExpressions: string[] = [];
      const expressionAttributeValues: Record<string, any> = {};
      const expressionAttributeNames: Record<string, string> = {};

      Object.entries(updates).forEach(([key, value], index) => {
        const placeholder = `#attr${index}`;
        const valuePlaceholder = `:val${index}`;

        updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
        expressionAttributeNames[placeholder] = key;
        expressionAttributeValues[valuePlaceholder] = value;
      });

      // Always update timestamp
      updateExpressions.push(`#updated = :timestamp`);
      expressionAttributeNames['#updated'] = 'updatedAt';
      expressionAttributeValues[':timestamp'] = new Date().toISOString();

      const params = {
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW' as const
      };

      const result = await this.dynamodb.update(params).promise();

      logger.info(`Item updated in ${this.tableName}`);

      return result.Attributes;
    } catch (error: any) {
      logger.error('DynamoDB update error:', error);
      throw new Error(`Failed to update item: ${error.message}`);
    }
  }

  /**
   * Delete item from DynamoDB
   */
  async delete(id: string): Promise<void> {
    try {
      const params = {
        TableName: this.tableName,
        Key: { id }
      };

      await this.dynamodb.delete(params).promise();

      logger.info(`Item deleted from ${this.tableName}`);
    } catch (error: any) {
      logger.error('DynamoDB delete error:', error);
      throw new Error(`Failed to delete item: ${error.message}`);
    }
  }

  /**
   * Batch get items
   */
  async batchGet(ids: string[]): Promise<any[]> {
    try {
      const chunks = [];
      for (let i = 0; i < ids.length; i += 25) {
        chunks.push(ids.slice(i, i + 25));
      }

      const items: any[] = [];

      for (const chunk of chunks) {
        const params = {
          RequestItems: {
            [this.tableName]: {
              Keys: chunk.map(id => ({ id }))
            }
          }
        };

        const result = await this.dynamodb.batchGet(params).promise();
        items.push(...(result.Responses?.[this.tableName] || []));
      }

      return items;
    } catch (error: any) {
      logger.error('DynamoDB batch get error:', error);
      throw new Error(`Failed to batch get items: ${error.message}`);
    }
  }

  /**
   * Batch write items
   */
  async batchWrite(items: any[]): Promise<void> {
    try {
      const chunks = [];
      for (let i = 0; i < items.length; i += 25) {
        chunks.push(items.slice(i, i + 25));
      }

      for (const chunk of chunks) {
        const params = {
          RequestItems: {
            [this.tableName]: chunk.map(item => ({
              PutRequest: {
                Item: {
                  ...item,
                  createdAt: item.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            }))
          }
        };

        await this.dynamodb.batchWrite(params).promise();
      }

      logger.info(`${items.length} items batch written`);
    } catch (error: any) {
      logger.error('DynamoDB batch write error:', error);
      throw new Error(`Failed to batch write items: ${error.message}`);
    }
  }
}
