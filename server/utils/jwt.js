import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_KEY || 'your_jwt_secret';
const EXPIRE_TIME = 60 * 60;

export function signJWT(userId) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId },
      JWT_KEY,
      { expiresIn: EXPIRE_TIME },
      (err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      }
    );
  });
}

export function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_KEY, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}
