import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
    console.error('Please set DB_HOST, DB_USER and DB_PASSWORD in .env');
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    console.log('Connected to MySQL server');

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    console.log(`Database '${DB_NAME}' ensured`);

    await connection.changeUser({ database: DB_NAME });

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        taskName VARCHAR(255),
        payload JSON,
        priority ENUM('Low','Medium','High'),
        status ENUM('pending','running','completed') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;

    await connection.query(createTableSql);
    console.log('Table jobs ensured');

    await connection.end();
    console.log('Setup complete');
  } catch (err) {
    console.error('DB setup failed:', err.message || err);
    process.exit(1);
  }
}

main();
