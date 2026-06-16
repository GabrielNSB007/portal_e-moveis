import "dotenv/config";

import express, { type Application } from "express";
import cors from "cors";

import { AppRoutes } from "./decorator/appRoutesDecorator.js";

import "./routes/AuthRoutes.js";
import "./routes/OfferRoutes.js";
import "./routes/PreferenceRoutes.js";
import "./routes/MatchRoutes.js";
import "./routes/ProposalRoutes.js";

@AppRoutes
export default class App {
  private app: Application;
  private port: number;

  constructor(port = 8080) {
    this.app = express();
    this.app.use(cors({ origin: "*" }));
    this.app.use(express.json());
    this.port = port;
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
