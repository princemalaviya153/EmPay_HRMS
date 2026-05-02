const { Client } = require('pg');
require('dotenv').config();

const createDb = async () => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'daksh123',
    port: 5432,
    database: 'postgres'
  });

  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='empay'");
    if (res.rowCount === 0) {
      console.log("Database 'empay' does not exist. Creating...");
      await client.query("CREATE DATABASE empay");
      console.log("Database 'empay' created successfully.");
    } else {
      console.log("Database 'empay' already exists.");
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await client.end();
  }
};

createDb();
