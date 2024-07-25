import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import {
  uploadFile,
  downloadFile,
  deleteFile,
  downloadFolderAsZip,
  deleteFolder
} from "./utils/firebaseStorage.js"; // Ensure this module is correctly implemented
import { createDocument } from "./utils/firestore.js";
import { createUser,Role  } from "./schema/user.schema.js"; // Assuming createUser function correctly initializes a user object
import { bucket } from "./configuration/firebase.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//middlewear
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.set("view engine", "ejs");

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

app.get("/", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    res.render("index", { files });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// app.post("/user", async (req, res) => {
//   const { id, name, email, password, role, phoneNum, bool } = req.body;
//   if (
//     !id ||
//     !name ||
//     !email ||
//     !password ||
//     !role ||
//     phoneNum === undefined ||
//     bool === undefined
//   ) {
//     return res.status(400).send("Missing required user fields");
//   }
//   try {
//     const user = createUser(id, name, email, password, role, phoneNum, bool);
//     await createDocument("users", user);
//     res.status(201).send("User added successfully");
//   } catch (error) {
//     res.status(500).send("Error adding user: " + error.message);
//   }
// });

// POST endpoint for uploading files
app.post("/upload", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No file uploaded.");
  }
  const destination = req.body.folderName || "default";
  try {
    await Promise.all(req.files.map((file) => uploadFile(file, destination)));
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
    const downloadURL = await downloadFile(filepath);
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
      await deleteFile(filename);
      res.redirect('/');
  } catch (error) {
      res.status(500).send('Error during file deletion: ' + error.message);
  }
});
app.get('/download', async (req, res) => {
  const folderName = req.query.folderName;
  try {
      const zipStream = await downloadFolderAsZip(folderName);
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
    const message = await deleteFolder(folderPath); // Ensure you have a function `deleteFolder` that handles the logic.
    res.send(message);
  } catch (error) {
    res.status(500).send("Error deleting folder: " + error.message);
  }
});



const newUser = createUser(1,"Jane Doe", "janedoe@example.com", "securePassword", Role.user , 9876543210, true);




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});





import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import {
  uploadFile,
  downloadFile,
  deleteFile,
  downloadFolderAsZip,
  deleteFolder
} from "./utils/firebaseStorage.js"; // Ensure this module is correctly implemented
import { createDocument } from "./utils/firestore.js";
import { createUser } from "./schema/user.schema.js"; // Assuming createUser function correctly initializes a user object
import { bucket } from "./configuration/firebase.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//middlewear
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.set("view engine", "ejs");

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

app.get("/", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    res.render("index", { files });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// app.post("/user", async (req, res) => {
//   const { id, name, email, password, role, phoneNum, bool } = req.body;
//   if (
//     !id ||
//     !name ||
//     !email ||
//     !password ||
//     !role ||
//     phoneNum === undefined ||
//     bool === undefined
//   ) {
//     return res.status(400).send("Missing required user fields");
//   }
//   try {
//     const user = createUser(id, name, email, password, role, phoneNum, bool);
//     await createDocument("users", user);
//     res.status(201).send("User added successfully");
//   } catch (error) {
//     res.status(500).send("Error adding user: " + error.message);
//   }
// });

export const createGenericCrudRoutes = (createEntity, collectionName) => {
  const router = express.Router();

  // POST endpoint for creating documents
  router.post('/', async (req, res) => {
      try {
          const newData = createEntity(req.body); // Directly call createEntity
          await createDocument(collectionName, newData);
          res.status(201).json(newData);
      } catch (error) {
          res.status(400).json({ message: "Failed to create document", error: error.message });
      }
  });

  return router;
};

// Assuming createUser is imported and ready to use
app.use('/users', createGenericCrudRoutes(createUser, 'users'));



// POST endpoint for uploading files
app.post("/upload", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No file uploaded.");
  }
  const destination = req.body.folderName || "default";
  try {
    await Promise.all(req.files.map((file) => uploadFile(file, destination)));
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
    const downloadURL = await downloadFile(filepath);
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
      await deleteFile(filename);
      res.redirect('/');
  } catch (error) {
      res.status(500).send('Error during file deletion: ' + error.message);
  }
});
app.get('/download', async (req, res) => {
  const folderName = req.query.folderName;
  try {
      const zipStream = await downloadFolderAsZip(folderName);
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
    const message = await deleteFolder(folderPath); // Ensure you have a function `deleteFolder` that handles the logic.
    res.send(message);
  } catch (error) {
    res.status(500).send("Error deleting folder: " + error.message);
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
