import { Get, Param, Controller } from "routing-controllers";
import "reflect-metadata";

const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
  { id: 3, name: "John Smith" },
  { id: 4, name: "Jane Smith" },
];

@Controller()
export class UserController {
  @Get("/users")
  getUsers() {
    return users;
  }

  @Get("/users/:id")
  getUser(@Param("id") id: number) {
    return users.find((user) => user.id === id);
  }
}
