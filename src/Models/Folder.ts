import mongoose, { Types } from "mongoose";

export interface IFolder {
  folderName: string;
  parentFolderId?: mongoose.Types.ObjectId;
  subFolders: [mongoose.Types.ObjectId];
}

const folderSchema = new mongoose.Schema<IFolder>(
  {
    folderName: {
      type: String,
      required: [true, "Folder Name is Required"],
    },
    parentFolderId: {
      type: mongoose.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    subFolders: {
      type: [mongoose.Types.ObjectId],
      ref: "Folder",
      default: [],
    },
  },
  { timestamps: true }
);

const autoPopulateLead = function (this: any, next: any) {
  this.populate("subFolders");
  next();
};

folderSchema.pre("findOne", autoPopulateLead).pre("find", autoPopulateLead);

export async function deleteFolderAndDescendants(folderId: Types.ObjectId) {
  // Find and delete the folder itself
  await Folder.deleteOne({ _id: folderId });

  // Find child folders of the current folder
  const childFolders = await Folder.find({ parentFolderId: folderId });

  // Recursively delete each child folder and its descendants
  for (const childFolder of childFolders) {
    await deleteFolderAndDescendants(childFolder._id);
  }
}

folderSchema.statics.deleteFolderWithDescendants = async function (
  folderId: Types.ObjectId
) {
  await deleteFolderAndDescendants(folderId);
};

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
