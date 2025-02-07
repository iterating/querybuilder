import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { dbService } from '../services/database.js';
import dotenv from 'dotenv';

dotenv.config();

describe('DatabaseService', () => {
  // Test connection getters
  describe('Connection Management', () => {
    it('should return active connections', () => {
      const connections = dbService.getActiveConnections();
      expect(Array.isArray(connections)).toBe(true);
    });

    it('should return connection count', () => {
      const count = dbService.getConnectionCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // Test Supabase connection
  describe('Supabase', () => {
    it('should create a Supabase client if credentials are available', () => {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_KEY;
      
      if (url && key) {
        const client = dbService.getSupabaseClient(url, key);
        expect(client).toBeDefined();
        expect(client.auth).toBeDefined();
      } else {
        console.log('Skipping Supabase test - no credentials available');
      }
    });
  });

  // Test MongoDB connection
  describe('MongoDB', () => {
    it('should connect to MongoDB if URL is available', async () => {
      const url = process.env.MONGODB_URL;
      
      if (url) {
        const client = await dbService.getMongoClient(url);
        expect(client).toBeDefined();
        expect(client.db).toBeDefined();
        
        // Test a simple query
        const adminDb = client.db().admin();
        const result = await adminDb.listDatabases();
        expect(result).toBeDefined();
        expect(Array.isArray(result.databases)).toBe(true);
      } else {
        console.log('Skipping MongoDB test - no URL available');
      }
    });
  });

  // Test MySQL connection
  describe('MySQL', () => {
    it('should connect to MySQL if URL is available', async () => {
      const url = process.env.MYSQL_URL;
      
      if (url) {
        const client = await dbService.getMySQLClient(url);
        expect(client).toBeDefined();
        
        // Test a simple query
        const [rows] = await client.query('SELECT 1 as value');
        expect(rows).toBeDefined();
        expect(rows[0].value).toBe(1);
      } else {
        console.log('Skipping MySQL test - no URL available');
      }
    });
  });

  // Test PostgreSQL connection
  describe('PostgreSQL', () => {
    it('should connect to PostgreSQL if URL is available', async () => {
      const url = process.env.POSTGRES_URL;
      
      if (url) {
        const client = await dbService.getPostgresClient(url);
        expect(client).toBeDefined();
        
        // Test a simple query
        const result = await client.query('SELECT 1 as value');
        expect(result.rows).toBeDefined();
        expect(result.rows[0].value).toBe(1);
      } else {
        console.log('Skipping PostgreSQL test - no URL available');
      }
    });
  });
});
