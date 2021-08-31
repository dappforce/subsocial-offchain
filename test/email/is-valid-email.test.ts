import { isValidEmailProvider } from '../../src/express-api/email/is-valid-email'

const emails = [
  {
    email: 'test@gmaIL.com',
    isValid: true
  },
  {
    email: 'test@GOOgle.com',
    isValid: true
  },
  {
    email: 'test@yahoo.com',
    isValid: true
  },
  {
    email: 'test@proTOnmail.com',
    isValid: true
  },
  {
    email: 'test@hOtmail.com',
    isValid: true
  },
  {
    email: 'test@outlook.com',
    isValid: true
  },
  {
    email: 'test@msn.com',
    isValid: true
  },
  {
    email: 'test@LIve.com',
    isValid: true
  },
  {
    email: 'test@aol.com ',
    isValid: true
  },
  {
    email: 'test@yandex.com',
    isValid: true
  },
  {
    email: 'test@mAIl.ru',
    isValid: true
  },
  {
    email: 'test@ya.ru',
    isValid: false
  },
  {
    email: 'test@facebok.com',
    isValid: false
  },
  {
    email: 'test@mycompany.com',
    isValid: false
  },
  {
    email: 'test@in.ua',
    isValid: false
  },
  {
    email: 'test@gmailc.om',
    isValid: false
  },
  {
    email: 'test@yaho0.com',
    isValid: false
  },
  {
    email: 'test@pm.com',
    isValid: false
  }
]

emails.forEach(({ email, isValid }) => test(`'${email}' ${!isValid ? 'no ' : ''}supported`, () => {
  const res = isValidEmailProvider(email)
  expect(res).toEqual(isValid)
}))