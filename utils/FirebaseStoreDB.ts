//

import { bucket } from "../configuration/firebase.js";
import JSZip from "jszip";
import stream from "stream";
import mime from "mime-types";
import path from "path";

class FirebaseStoreDB {


  // Function to upload a file to the Firebase bucket
  static async uploadFile(file, destination) {
    if (!file || !file.path || !file.originalname) {
      throw new Error("Invalid file or missing attributes");
    }

    const destPath = `${destination}/${Date.now()}+${file.originalname}`;
    try {
      const uploadResponse = await bucket.upload(file.path, {
        destination: destPath,
        resumable: true,
        metadata: {
          contentType: file.mimetype,
        },
      });
      return uploadResponse;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  static async downloadFile(firebaseFilePath) {
    const file = bucket.file(firebaseFilePath);
    console.log(firebaseFilePath);

    try {
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("File does not exist");
      }

      const [metadata] = await file.getMetadata();
      const extension = mime.extension(metadata.contentType);
      const downloadURL = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
        responseDisposition: `attachment; filename="${metadata.name}.${extension}"`,
      });

      console.log("File download URL:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  static async downloadFolderAsZip(folderPath) {
    try {
      const [files] = await bucket.getFiles({ prefix: folderPath });
      if (files.length === 0) {
        throw new Error("No files found in the specified folder.");
      }

      const jszip = new JSZip();
      const downloadPromises = files.map((file) => {
        return file
          .download()
          .then(async ([fileBuffer]) => {
            const [metadata] = await file.getMetadata();
            const extension =
              mime.extension(metadata.contentType) ||
              path.extname(file.name).substring(1);
            const originalName = path.basename(file.name);
            const correctedName =
              originalName.replace(/[^a-zA-Z0-9\-_.]/g, "_") + "." + extension;
            jszip.file(correctedName, fileBuffer, { binary: true });
          })
          .catch((error) => {
            console.error(`Failed to download file ${file.name}:`, error);
            return null; // Continue with other files even if this fails
          });
      });

      const results = await Promise.allSettled(downloadPromises);
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Error processing file ${files[index].name}: ${result.reason}`
          );
        }
      });

      const zipBuffer = await jszip.generateAsync({
        type: "nodebuffer",
        platform: "DOS", // Ensures compatibility with all systems, including Windows
      });
      const readStream = new stream.PassThrough();
      readStream.end(zipBuffer);

      return readStream;
    } catch (error) {
      console.error("Error downloading folder as ZIP:", error);
      throw error;
    }
  }
  static async deleteFile(firebaseFilePath) {
    const file = bucket.file(firebaseFilePath);

    try {
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("File does not exist");
      }

      await file.delete();
      return "File deleted successfully";
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  static async deleteFolder(folderPath) {
    try {
      const [files] = await bucket.getFiles({ prefix: folderPath });

      if (files.length === 0) {
        return "No files found in the specified folder.";
      }

      // Map over the array of file objects and convert each delete operation into a promise.
      const deletePromises = files.map((file) => file.delete());

      // Wait for all the delete operations to complete.
      await Promise.all(deletePromises);

      return "All files in the folder have been deleted successfully.";
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  }
}
export default FirebaseStoreDB;
