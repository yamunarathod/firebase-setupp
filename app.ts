import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import FirebaseStoreDB from "./utils/FirebaseStoreDB.js";
import FirestoreDB from "./utils/FirestoreDB.js";
import { createUser } from "./schema/user.schema.js"; // Assuming createUser function correctly initializes a user object
import { bucket } from "./configuration/firebase.js";
import { validateData } from "./utils/validators.js";
import Joi from "joi";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//middlewear
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    res.render("index", { files });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post("/upload/:collection", async (req, res) => {
  const { collection } = req.params;
  const data = req.body; // Directly using the data from the request body

  try {
    await FirestoreDB.createDocument(collection, data);
    res.status(201).send({ message: "Document uploaded successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Route to read a document
app.get('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
      const document = await FirestoreDB.readDocument(collection, id);
      if (document) {
          res.status(200).json(document);
      } else {
          res.status(404).send('Document not found');
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



// Route to update a document
app.put('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  const data = req.body;
  try {
      await FirestoreDB.updateDocument(collection, id, data);
      res.status(200).send('Document updated successfully');
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Route to delete a document
app.delete('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
      await FirestoreDB.deleteDocument(collection, id);
      res.status(200).send('Document deleted successfully');
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


// File upload setup with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, fileExt)}`);
  },
});
const upload = multer({ storage: storage });

// POST endpoint for uploading files
app.post("/upload", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No file uploaded.");
  }
  const destination = req.body.folderName || "default";
  try {
    await Promise.all(req.files.map((file) => FirebaseStoreDB.uploadFile(file, destination)));
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error uploading files: " + error.message);
  }
});

//downloading files
app.get("/files/*", async (req, res) => {
  try {
    // Capture the full path after "/files/"
    const filepath = req.params[0];

    // Assuming downloadFile function expects the full path within the storage
    const downloadURL = await FirebaseStoreDB.downloadFile(filepath);
    res.redirect(downloadURL[0]);
  } catch (error) {
    res.status(500).send("Failed to download file: " + error.message);
  }
});

//deleting files
app.post('/delete', async (req, res) => {
  const filename = req.body.fileName;
  if (!filename) {
      return res.status(400).send('File name is required');
  }
  try {
      await FirebaseStoreDB.deleteFile(filename);
      res.redirect('/');
  } catch (error) {
      res.status(500).send('Error during file deletion: ' + error.message);
  }
});
app.get('/download', async (req, res) => {
  const folderName = req.query.folderName;
  try {
      const zipStream = await FirebaseStoreDB.downloadFolderAsZip(folderName);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${folderName}.zip`);
      zipStream.pipe(res);
  } catch (error) {
      res.status(500).send("Failed to download folder: " + error.message);
  }
});

app.post('/delete-folder', async (req, res) => {
  const folderPath = req.body.folderPath;
  if (!folderPath) {
    return res.status(400).send("Folder path is required.");
  }

  try {
    const message = await FirebaseStoreDB.deleteFolder(folderPath); // Ensure you have a function `deleteFolder` that handles the logic.
    res.send(message);
  } catch (error) {
    res.status(500).send("Error deleting folder: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
