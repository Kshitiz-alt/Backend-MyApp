import express from "express";

// Configure dotenv to load environment variables
import 'dotenv/config';


import cookieParser from "cookie-parser";
import cors from "cors";

import completedOrders from "./routes/completedOrders.js";
import buyerRouter from "./routes/buyerRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";

// Create an instance of express
export const app = express();



// Middleware
app.use(express.json());
app.use(cookieParser());

// Default route
app.get("/", (req, res) => {
  res.send("Nice working.");
});

// Cross-Origin Resource Sharing (CORS) configuration

const allowedOrigins = process.env.FRONTEND_URL?.split(',').map(origin => origin.trim()) || [];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// Routes
app.use("/api/orders", buyerRouter);
app.use("/api/orders", sellerRouter);

app.use("/api/orders", completedOrders);

