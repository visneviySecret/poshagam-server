import db from "../database/database";

class AddressService {
  async createAddress(dto: {
    user_id: string;
    city: string;
    street: string;
    index: string;
    phone: string;
  }) {
    const { user_id, city, street, index, phone } = dto;
    const user = await db.query(`SELECT * FROM "user" WHERE id = $1`, [
      Number(user_id),
    ]);
    if (!user.rows.length) {
      throw new Error("User not found");
    }
    const candidate = await db.query(
      `SELECT * FROM address WHERE user_id = $1`,
      [user_id]
    );
    if (candidate.rows.length) {
      throw new Error("Address already exists");
    }
    const newAddress = await db.query(
      `INSERT INTO address (user_id, city, street, index, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.rows[0].id, city, street, index, phone]
    );
    return newAddress.rows[0];
  }
  async getAddressesByUser(userId: string) {
    const addresses = await db.query(
      `SELECT * FROM address WHERE user_id = $1`,
      [userId]
    );
    return addresses.rows;
  }
  async updateAddress(
    addressId: string,
    dto: { city: string; street: string; index: string; phone: string }
  ) {
    const updatedAddress = await db.query(
      `UPDATE address SET city = $1, street = $2, index = $3, phone = $4 WHERE id = $5 RETURNING *`,
      [dto.city, dto.street, dto.index, dto.phone, addressId]
    );
    return updatedAddress.rows[0];
  }
  async deleteAddress(addressId: string) {
    await db.query(`DELETE FROM address WHERE id = $1`, [addressId]);
  }
}

export default new AddressService();
