import db from "../database";

const main = async () => {
  try {
    await db.query("BEGIN");

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart') THEN
            ALTER TABLE "order" RENAME TO cart;
          END IF;
        END IF;
      END $$;
    `);

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_item') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_item') THEN
            ALTER TABLE order_item RENAME TO cart_item;
          END IF;
        END IF;
      END $$;
    `);

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'cart_item' AND column_name = 'order_id'
        ) THEN
          ALTER TABLE cart_item RENAME COLUMN order_id TO cart_id;
        END IF;
      END $$;
    `);

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'payment' AND column_name = 'order_id'
        ) THEN
          ALTER TABLE payment RENAME COLUMN order_id TO cart_id;
        END IF;
      END $$;
    `);

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints tc
          WHERE tc.table_name = 'cart_item'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND tc.constraint_name = 'order_item_order_id_fkey'
        ) THEN
          ALTER TABLE cart_item DROP CONSTRAINT order_item_order_id_fkey;
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints tc
          WHERE tc.table_name = 'cart_item'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND tc.constraint_name = 'cart_item_cart_id_fkey'
        ) THEN
          ALTER TABLE cart_item
            ADD CONSTRAINT cart_item_cart_id_fkey
            FOREIGN KEY (cart_id) REFERENCES cart(id);
        END IF;
      END $$;
    `);

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints tc
          WHERE tc.table_name = 'payment'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND tc.constraint_name = 'payment_order_id_fkey'
        ) THEN
          ALTER TABLE payment DROP CONSTRAINT payment_order_id_fkey;
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints tc
          WHERE tc.table_name = 'payment'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND tc.constraint_name = 'payment_cart_id_fkey'
        ) THEN
          ALTER TABLE payment
            ADD CONSTRAINT payment_cart_id_fkey
            FOREIGN KEY (cart_id) REFERENCES cart(id);
        END IF;
      END $$;
    `);

    await db.query("COMMIT");
    process.exit(0);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

main();
