import { Router } from "express";

import FolderRoutes from "./FolderRoutes";

const router = Router();

router.use("/folder", FolderRoutes);

export default router;
