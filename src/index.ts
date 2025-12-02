import UserRouter from "./router/user.router";
import dotenv from "dotenv";
import express from "express";
dotenv.config({ quiet: true });

const port = process.env.API_PORT || 5000;

const app = express();
app.use(express.json());
app.use("/users", UserRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
