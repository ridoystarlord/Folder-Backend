import { HttpStatusCode } from "axios";
import { RequestHandler } from "express";

import Folder, { deleteFolderAndDescendants } from "../Models/Folder";

export const createNewFolder: RequestHandler = async (req, res) => {
  const { folderName, parentFolderId } = req.body;
  let dbFolderDoc = null;
  if (parentFolderId) {
    dbFolderDoc = await Folder.findOne({ _id: parentFolderId });
    if (dbFolderDoc === null) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ success: false, message: "Folder not found", folder: null });
    }
  }

  try {
    const newFolder = new Folder({
      folderName,
      parentFolderId,
      subFolders: [],
    });
    const result = await newFolder.save();
    if (parentFolderId) {
      await Folder.findByIdAndUpdate(
        dbFolderDoc?._id,
        { $push: { subFolders: result?._id } },
        { new: true }
      );
    }
    return res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "New Folder Created Successful",
      error: null,
    });
  } catch (error) {
    return res.status(HttpStatusCode.InternalServerError).json({
      success: false,
      message: "New Folder Creation Failed",
      error: error,
    });
  }
};

export const deleteFolder: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const dbFolderDoc = await Folder.findOne({ _id: id });

  if (dbFolderDoc === null) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ success: false, message: "Folder not found", user: null });
  }

  try {
    if (dbFolderDoc.parentFolderId === null) {
      return res.status(HttpStatusCode.Forbidden).json({
        success: true,
        message: "Root Folder Can't be deleted",
        error: null,
      });
    }
    const dbParentFolderDoc = await Folder.findOne({
      _id: dbFolderDoc.parentFolderId,
    });

    if (dbParentFolderDoc === null) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ success: false, message: "Folder not found", user: null });
    }
    // await Folder.deleteOne({ _id: dbFolderDoc?._id });
    await deleteFolderAndDescendants(dbFolderDoc?._id);

    await Folder.findByIdAndUpdate(
      dbParentFolderDoc?._id,
      { $pull: { subFolders: dbFolderDoc?._id } },
      { new: true }
    );
    return res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Folder Deleted Successful",
      error: null,
    });
  } catch (error) {
    return res.status(HttpStatusCode.InternalServerError).json({
      success: false,
      message: "Folder Deletion Failed",
      error: error,
    });
  }
};

export const getFolders: RequestHandler = async (req, res) => {
  try {
    const result = await Folder.find({ parentFolderId: null });
    const ip = req.clientIp;
    res.set("Access-Control-Allow-Origin", "*");
    return res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Folder Retrieve Successful",
      error: null,
      result: result,
      ip: ip,
    });
  } catch (error) {
    return res.status(HttpStatusCode.InternalServerError).json({
      success: false,
      message: "Folder Retrieve Failed",
      error: error,
      result: [],
      ip: "",
    });
  }
};
