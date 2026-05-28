import db from "../database/database";

class CategoryService {
  async getCategories() {
    const categories = await db.query(`SELECT * FROM category`);
    return categories.rows;
  }

  async editCategoryById(id, setParts, values) {
    const categories = await db.query(
      `
      UPDATE category SET ${setParts.join(", ")} WHERE id = $${
        values.length + 1
      } RETURNING *`,
      [...values, id]
    );

    return categories.rows;
  }
}

export default new CategoryService();
