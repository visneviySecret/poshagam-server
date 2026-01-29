import db from "../database";

const addOwner = async () => {
  try {
    await db.query(`
      ALTER TABLE "product" 
      ADD COLUMN IF NOT EXISTS owner INTEGER DEFAULT 1
    `);
    console.log("Owner column added successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error adding Owner column:", error);
    process.exit(1);
  }
};

addOwner();
