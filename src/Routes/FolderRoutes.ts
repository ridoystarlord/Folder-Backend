import { Router } from "express";

import {
  createNewFolder,
  deleteFolder,
  getFolders,
} from "../Controllers/FolderControllers";

const router = Router();

router.post("/", createNewFolder);
router.get("/", getFolders);
router.delete("/:id", deleteFolder);

export default router;
