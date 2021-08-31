import axios from "axios";
import { recatchaKey } from "../env";

export async function validateHuman (token: string): Promise<boolean> {
  const response = await axios(
    `https://www.google.com/recaptcha/api/siteverify?secret=${recatchaKey}&response=${token}`,
    {
      method: "POST",
    }
  );
  const data = response.data;
  return data.success;
}