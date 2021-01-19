import Express from "express";
import { validateHuman } from '../captcha';
import { sendFaucetConfirmationLetter } from '../email/confirmation';
import { checkEmail } from '../faucet/check';
import { FaucetFormData } from '../faucet/types';

export  const confirmEmailHandler = async (req: Express.Request, res: Express.Response) => {
  const formData: FaucetFormData = req.body;

  console.log('formData', formData)

  const human = await validateHuman(formData.token);
  if (!human) {
    res.status(400);
    res.json({ errors: ["Please, you're not fooling us, bot."] });
    return;
  }

  if (checkEmail(formData)) {
    await sendFaucetConfirmationLetter(formData.email)
    res.status(201);
    res.json({ message: "Success!" });
  } else {
    res.status(400);
    res.json({ errors: ["Message about email error"] }); 
    return;
  }
};
