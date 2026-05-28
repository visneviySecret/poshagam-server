import categoryService from "../service/category.service";

class CategoryController {
  async getCategories(req, res) {
    try {
      const categories = await categoryService.getCategories();
      res.status(200).json(categories);
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }

  async editCategory(req, res) {
    try {
      const { id } = req.params;
      const updates = await req.body;
      const keys = Object.keys(updates);

      const setParts = keys.map((key, i) => `"${key}" = $${i + 1}`);
      const values = Object.values(updates);

      const categories = await categoryService.editCategoryById(
        id,
        setParts,
        values
      );
      res
        .status(200)
        .json({ message: "Отредактированные категории", categories });
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }
}

export default new CategoryController();
