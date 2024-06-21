import bcrypt from "bcryptjs";

const originalPassword = "test02";

bcrypt.hash(originalPassword, 10, (err, hashedPassword) => {
  if (err) {
    return console.error("Error hashing password:", err);
  }
  console.log("Hashed password:", hashedPassword);

  bcrypt.compare(originalPassword, hashedPassword, (err, result) => {
    if (err) {
      return console.error("Error comparing password:", err);
    }
    console.log("Password comparison result:", result);
  });
});
