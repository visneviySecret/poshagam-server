import db from "../database";

const addRoleColumn = async () => {
  try {
    await db.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
    `);
    console.log("Role column added successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error adding role column:", error);
    process.exit(1);
  }
};

addRoleColumn();
