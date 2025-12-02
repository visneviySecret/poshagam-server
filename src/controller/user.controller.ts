import db from "../database/database";
import bcrypt from "bcrypt";

class UserController {
  async createUser(req, res) {
    const { email, password } = req.body;
    const candidate = await db.query(`SELECT * FROM "user" WHERE email = $1`, [
      email,
    ]);
    if (candidate.rows.length) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO "user" (email, password) VALUES ($1, $2) RETURNING *`;
    const values = [email, hashPassword];
    const newUser = await db.query(query, values);
    res.status(201).json(newUser.rows[0]);
  }

  async getUsers(req, res) {
    const query = `SELECT id, email FROM "user"`;
    const users = await db.query(query);
    res.status(200).json(users.rows);
  }

  async getUser(req, res) {
    const { id } = req.params;
    const query = `SELECT id, email FROM "user" WHERE id = $1`;
    const user = await db.query(query, [id]);
    res.status(200).json(user.rows[0]);
  }
}

export default new UserController();
