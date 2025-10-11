import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getUserData,
  storeRecentSearchedCities,
  forceSyncUsers,
  reactivateUser,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", protect, getUserData);
userRouter.post("/store-recent-search", protect, storeRecentSearchedCities);
userRouter.post("/sync", forceSyncUsers);
userRouter.post("/reactivate", protect, reactivateUser);

export default userRouter;
