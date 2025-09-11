import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function loginUser(email: string, password: string) {
  const foundUser = await User.findOne({ where: { email } });
  const user = foundUser?.toJSON();
 
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // ⚠️ plain text comparison (for now)
  if (user.password !== password) {
    throw new Error("Invalid credentials");
  }

  const secret = process.env.JWT_SECRET || "dev-secret";
  const token = jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: "1h" }
  );

  return {
    user: { id: user.id, email: user.email },
    token,
  };
}


