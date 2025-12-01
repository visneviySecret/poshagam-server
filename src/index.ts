import { createExpressServer } from "routing-controllers";
import { UserController } from "./controller/UserController";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const port = process.env.API_PORT || 5000;

const app = createExpressServer({
  controllers: [UserController],
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
