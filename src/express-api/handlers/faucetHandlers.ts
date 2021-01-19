import Express from "express";
import { sendConfirmationLetter } from '../email/confirmation';

type FormData = {
  address: string,
  email: string,
  token: string
}

async function checkEmail(_formData: FormData): Promise<boolean> {
  // TODO: checkEmail in database
  return true;
}

export  const confirmEmailHandler = async (req: Express.Request, res: Express.Response) => {
  const formData: FormData = req.body;

  const human = await validateHuman(formData.token);
  if (!human) {
    res.status(400);
    res.json({ errors: ["Please, you're not fooling us, bot."] });
    return;
  }

  if (checkEmail(formData)) {
    await sendConfirmationLetter(formData.email)
    res.status(201);
    res.json({ message: "Success!" });
  } else {
    res.status(400);
    res.json({ errors: ["Message about email error"] }); 
    return;
  }
};
