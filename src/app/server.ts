import app from "./app";
import { register } from "./register";

const start = async () => {
  try {
    await register(app);

    const PORT = Number(process.env.PORT) || 5000;
    const HOST = process.env.HOST || "0.0.0.0";

    await app.listen({
      port: PORT,
      host: HOST,
    });

    console.log(
      `🚀 MealSync Backend running on http://localhost:${PORT}`,
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();