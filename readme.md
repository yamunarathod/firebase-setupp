## Node.js Firebase Setup Project

This project sets up a Node.js server using Express and integrates Firebase for file operations such as uploading and downloading files.

## Prerequisites
1. Node.js installed on your machine.
2. Firebase account with a project set up.
3. Firebase credentials (service account key) configured.

## Installation

Step 1. Navigate to your project directory and install the required packages:

```js
npm install express firebase-setup
```
Step 2. Ensure you have your Firebase service account key file downloaded. This key will be used to authenticate Firebase operations. Place it in your project directory and include the storage bucket key in your .env file.

Step 3: Create .env File
Create a .env file in the root of your project and add your Firebase configuration, including the storage bucket key.

## Project Setup

Step1. Create an index.js file with the following content:

```js
import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

Step2. Import the required Firebase storage utilities for file operations:

```js
import FirebaseStoreDB from "firebase-setup/utils/FirebaseStoreDB";
```
Step3. Add a function to perform file operations such as uploading a file:

```js
async function performFileOperations() {
  const file = {
    path: "./image.jpg", // Change this to the actual path
    originalname: "image.jpg",
  };

  try {
    const uploadResponse = await FirebaseStoreDB.uploadFile(file);
    console.log("Upload successful:");
  } catch (error) {
    console.error("Error in file operation:", error);
  }
}


 performFileOperations();
 ```
## Running the Project

node index.js

### Example Usage of Firebase Operations

## 1. Upload a File
```js
async function uploadExample() {
  const file = {
    path: "./path/to/your/file.ext",
    originalname: "file.ext",
  };

  try {
    const uploadResponse = await FirebaseStoreDB.uploadFile(file);
    console.log("Upload successful:", uploadResponse);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

uploadExample();
```

## 2. Download a File
```js
async function downloadExample() {
  const fileName = "file.ext";
  const downloadPath = "./path/to/save/file.ext";

  try {
    const downloadResponse = await FirebaseStoreDB.downloadFile(fileName, downloadPath);
    console.log("Download successful:", downloadResponse);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

downloadExample();
```

## 3.Download a Folder as ZIP
```js
async function downloadFolderAsZipExample() {
  const folderName = "folder";
  const downloadPath = "./path/to/save/folder.zip";

  try {
    const downloadResponse = await FirebaseStoreDB.downloadFolderAsZip(folderName, downloadPath);
    console.log("Folder download successful:", downloadResponse);
  } catch (error) {
    console.error("Error downloading folder:", error);
  }
}

downloadFolderAsZipExample();
```

## 4. Delete a File
```js
async function deleteExample() {
  const fileName = "file.ext";

  try {
    const deleteResponse = await FirebaseStoreDB.deleteFile(fileName);
    console.log("Delete successful:", deleteResponse);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

deleteExample();
```

#### Firestore Operations

## Import Firestore Utilities
Import the Firestore utilities for creating and reading documents:

```js
import FirestoreDB from "firebase-setup/utils/FirestoreDB";
```

## Define Schemas with Joi
Create a schema for your data using Joi for validation. Here is an example for a user and product schema:

```js
import Joi from 'joi';

export const userSchema = Joi.object({
    userID: Joi.number().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    createdAt: Joi.date().iso()
});

export const productSchema = Joi.object({
    productID: Joi.number().required(),
    productName: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().precision(2).required(),
    stock: Joi.number().integer().required(),
    category: Joi.string().required()
});
```

## Example Usage of Firestore Operations

# 1. Create a Document
First, define the data to be validated and inserted:

```js
const userData = {
  userID: 1,
  username: "johndoe",
  email: "johndoe@example.com",
  password: "encrypted_password",
  createdAt: "2024-06-05T12:00:00Z"
};

const { error, value } = userSchema.validate(userData);
if (error) {
    console.error('Validation Failed:', error.details[0].message);
} else {
  FirestoreDB.createDocument('users', value)
      .then(response => console.log('User created:', response))
      .catch(error => console.error('Failed to create user:', error));
}
```
# 2. Read a Document
To read a document from the Firestore collection:

```js
FirestoreDB.readDocument('users',"237481a1-161d-47bd-b633-eaba3aacf9fc")
      .then(response => console.log('User created:', response))
      .catch(error => console.error('Failed to create user:', error));
  ```

This document provides example snippets to help you utilize the firebase-setup package for various Firebase operations. Adjust the paths and data as per your project requirements.

