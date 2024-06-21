import { verifyJWT } from "../utils/jwt.js";

const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send({ error: "Authorization token is missing." });
  }

  try {
    const decoded = await verifyJWT(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).send({ error: "Please authenticate." });
  }
};

export default auth;
