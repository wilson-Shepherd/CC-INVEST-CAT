import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_KEY || '';

export default function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_KEY, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}
