import { dbService } from './database.js';
import { queryExecutor } from './queryExecutor.js';

describe('PostgreSQL Query Execution', () => {
  it('should substitute {table_name} placeholder', async () => {
    const client = await dbService.getPostgresClient('postgres://user:pass@localhost/test');
    const result = await queryExecutor.executePostgresQuery(
      client,
      'SELECT * FROM {table_name} LIMIT 1',
      'test_table'
    );
    expect(result[0].query).toContain('"test_table"');
  });
});
