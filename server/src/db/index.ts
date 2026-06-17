import { Sequelize } from "sequelize";

const sequelize = new Sequelize("chat", "root", "root1234", {
  host: "127.0.0.1",
  port: 5433,
  dialect: "postgres",
  logging: true
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
};
