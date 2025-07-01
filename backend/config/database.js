import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if it exists, otherwise use individual environment variables
let sequelize;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL format: mysql://username:password@host:port/database
  const url = new URL(process.env.DATABASE_URL);
  sequelize = new Sequelize(
    url.pathname.substring(1), // Remove leading slash to get database name
    decodeURIComponent(url.username),
    decodeURIComponent(url.password),
    {
      host: url.hostname,
      port: url.port || 3306,
      dialect: 'mysql',
      logging: false, // Set to console.log to see SQL queries
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      }
    }
  );
} else {
  // Fallback to individual environment variables
  sequelize = new Sequelize(
    process.env.DB_NAME || 'vibe_chat',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      }
    }
  );
}

export default sequelize; 