import jwt  from "jsonwebtoken"

const secret = 'chave-do-jwt' //provisório
export const jwtService = {
  signToken: (payload: string | object | Buffer, expiration: string) => {
    return jwt.sign(payload, secret, {
      expiresIn: expiration
    })
  }
}