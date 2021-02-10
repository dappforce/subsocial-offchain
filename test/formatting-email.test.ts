import { formattingEmail } from '../src/express-api/email/formatting-email'

const formattedEmail = 'test@gmailcom'

const emails = [
  "test@gmail.com",
  "t.est@gmail.com",
  "tes.t@gmail.com",
  "te.st@gmail.com",
  "TeSt@gmail.com",
  "tESt@gmail.com",
  "t.e.s.t@Gmail.com",
  "tes.T@GMAIL.COm",
  "tes?T@GMAIL.COm",
  "t_e_sT@GMAIL.COm",
  "t_e:st@GMAIL.COm",
]

emails.forEach(email => test(`Check "${email}" email`, () => {
  const res = formattingEmail(email)
  expect(res).toEqual(formattedEmail)
}))