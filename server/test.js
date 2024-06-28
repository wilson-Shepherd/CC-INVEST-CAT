import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

const clearDB = async () => {
  try {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }

    console.log("Database cleared");
  } catch (err) {
    console.error("Error clearing database:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

const run = async () => {
  await connectDB();
  await clearDB();
};

run();
