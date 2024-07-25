import { fireStore } from "../configuration/firebase.js";
import { schemaStruct } from "../schema/user.schema.js"; // Adjust the path as needed
// Create Document
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator


class FirestoreDB {
  static async createDocument(collection, data) {
    let docRef;
    if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
        // Generate a new UUID if no valid ID is provided
        data.id = uuidv4();
        docRef = fireStore.collection(collection).doc(data.id);
    } else {
        docRef = fireStore.collection(collection).doc(data.id);
    }

    try {
        await docRef.set(data);
        console.log("Document created with ID:", data.id);
        return { success: true, id: data.id };
    } catch (error) {
        console.error("Error creating document:", error);
        throw error;  // Rethrow to ensure calling code can handle it
    }
};

static async readCollection<T extends schemaStruct>(collection: string): Promise<T[]> {
    try {
        const querySnapshot = await fireStore.collection(collection).get();
        const documents: T[] = [];
        querySnapshot.forEach((doc) => {
            documents.push(doc.data() as T);
        });
        console.log("Collection data:", documents);
        return documents;
    } catch (error) {
        console.error("Error reading collection:", error);
        return [];
    }
}

static async readDocumentByProductName<T extends schemaStruct>(collection: string, productName: string): Promise<T | undefined> {
    try {
        const querySnapshot = await fireStore.collection(collection).where('productName', '==', productName).get();
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            console.log("Document data:", doc.data());
            return doc.data() as T;
        } else {
            console.log("No document found with product name:", productName);
            return undefined;
        }
    } catch (error) {
        console.error("Error reading document by product name:", error);
        return undefined;
    }
}


// Read Document
static async readDocument <T extends schemaStruct>(collection: string, id: string): Promise<T | undefined> {
    try {
        const docRef = fireStore.collection(collection).doc(id);
        const doc = await docRef.get();
        if (doc.exists) {
            console.log("Document data:", doc.data());
            return doc.data() as T;
        } else {
            console.log("No such document!");
            return undefined;
        }
    } catch (error) {
        console.error("Error reading document:", error);
        return undefined;
    }
};

// Update Document
static async updateDocument  <T extends schemaStruct>(collection: string, id: string, data: Partial<T>): Promise<void> {
    try {
        const docRef = fireStore.collection(collection).doc(id);
        await docRef.update(data);
        console.log("Document updated with ID:", id);
    } catch (error) {
        console.error("Error updating document:", error);
    }
};

// Delete Document
static async deleteDocument (collection: string, id: string): Promise<void> {
    try {
        const docRef = fireStore.collection(collection).doc(id);
        await docRef.delete();
        console.log("Document deleted with ID:", id);
    } catch (error) {
        console.error("Error deleting document:", error);
    }
}
}

export default FirestoreDB;
