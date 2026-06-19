import "dotenv/config";

import express, { type Application } from "express";
import cors from "cors";

import { AppRoutes } from "./decorator/appRoutesDecorator.js";

import "./routes/AuthRoutes.js";
import "./routes/OfferRoutes.js";
import "./routes/PreferenceRoutes.js";
import "./routes/MatchRoutes.js";
import "./routes/ProposalRoutes.js";
import "./routes/SavedOfferRoutes.js";
import "./routes/NotificationRoutes.js";
import "./routes/AnalyticsRoutes.js";

@AppRoutes
export default class App {
  private app: Application;
  private port: number;

  constructor(port = 8080) {
    this.app = express();

    this.app.use(
      cors({
        origin: [
          "http://localhost:8080",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "https://portal-e-moveis.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      })
    );

    this.app.use(express.json({ limit: "8mb" }));
    this.port = Number(process.env.PORT) || port;

    this.setupRoutes();
  }

  setupRoutes() {
    this.app.get("/", (req: any, res: any) => {
      res.json({ message: "Hello World" });
    });
  }

  start() {
    this.app.listen(this.port, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${this.port}`);
    });
  }
}

const app = new App(Number(process.env.PORT ?? 8080));
app.start();