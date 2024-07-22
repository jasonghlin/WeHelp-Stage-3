import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();
const { RDS_HOST, MYSQL_USER, MYSQL } = process.env;

const pool = mysql.createPool({
  connectionLimit: 10, // 連接池最大連接數量
  host: RDS_HOST,
  user: MYSQL_USER,
  password: MYSQL,
});

function createDatabase() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.query(
        "CREATE DATABASE IF NOT EXISTS messageBoard",
        (error, results) => {
          connection.release();
          if (error) return reject(error);
          console.log("Database created");
          resolve();
        }
      );
    });
  });
}

function useDatabase() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.query("USE messageBoard", (error, results) => {
        connection.release();
        if (error) return reject(error);
        console.log("Using messageBoard");
        resolve();
      });
    });
  });
}

async function createTable() {
  await useDatabase();
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      const createTableQuery = `
          CREATE TABLE IF NOT EXISTS board (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message NVARCHAR(255) NOT NULL,
            img_url TEXT NOT NULL
          )
        `;
      connection.query(createTableQuery, (error, results) => {
        connection.release();
        if (error) return reject(error);
        console.log("board table created");
        resolve();
      });
    });
  });
}

async function insertTable(message, imgUrl) {
  await useDatabase();
  const query = "INSERT INTO board (message, img_url) VALUES (?, ?)";
  const values = [message, imgUrl];

  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      connection.query(query, values, (error, results, fields) => {
        connection.release();
        if (error) {
          reject(error);
        } else {
          resolve(results.insertId);
        }
      });
    });
  });
}

async function showTable() {
  try {
    await createDatabase();
    await useDatabase();
    await createTable();

    const query = "SELECT * FROM board";
    const values = [];
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, values, (error, results, fields) => {
          connection.release();
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  } catch (err) {
    console.error("Error in Insert main_room:", err);
    throw err;
  }
}

export { pool, insertTable, showTable };
