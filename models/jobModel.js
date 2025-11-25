import { db } from "../config/db.js";

export const JobModel = {
  async create(job) {
    const sql = `INSERT INTO jobs (taskName, payload, priority, status) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      job.taskName,
      JSON.stringify(job.payload),
      job.priority,
      "pending",
    ]);
    return result.insertId;
  },

  async findAll(filters) {
    let sql = `SELECT * FROM jobs WHERE 1=1`;
    const params = [];

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.priority) {
      sql += " AND priority = ?";
      params.push(filters.priority);
    }

    const [rows] = await db.execute(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(`SELECT * FROM jobs WHERE id = ?`, [id]);
    return rows[0];
  },

  async updateStatus(id, status) {
    const sql = `UPDATE jobs SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.execute(sql, [status, id]);
  },

  async markCompleted(id) {
    const sql = `
      UPDATE jobs 
      SET status='completed', updatedAt=CURRENT_TIMESTAMP 
      WHERE id=?`;
    await db.execute(sql, [id]);
  }
};
