import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

let db: any;
let auth: any;

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
const localKeyPath = path.join(__dirname, '../../serviceAccountKey.json');
const hasCredentials = !!serviceAccountEnv || fs.existsSync(localKeyPath);

if (hasCredentials) {
  try {
    if (serviceAccountEnv) {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id || 'crackprep-webapp'}.firebasestorage.app`
      });
    } else {
      const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id || 'crackprep-webapp'}.firebasestorage.app`
      });
    }

    db = admin.firestore();
    auth = admin.auth();
    console.log('[FIREBASE] Admin SDK initialized successfully using service account credentials.');
  } catch (error) {
    console.error('[FIREBASE] Initialization with credentials failed, falling back to local mock DB:', error);
    setupMockDB();
  }
} else {
  console.warn('[FIREBASE] No private credentials found. Initializing local JSON fallback database (local_db.json) for development.');
  setupMockDB();
}

function setupMockDB() {
  const localDbPath = path.join(__dirname, '../../local_db.json');

  const getDBFile = () => {
    if (!fs.existsSync(localDbPath)) {
      fs.writeFileSync(localDbPath, JSON.stringify({}), 'utf8');
    }
    try {
      return JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
    } catch {
      return {};
    }
  };

  const saveDBFile = (data: any) => {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf8');
  };

  const readLocalDB = (collection: string, docId: string) => {
    const dbData = getDBFile();
    return dbData[collection]?.[docId] || null;
  };

  const writeLocalDB = (collection: string, docId: string, data: any) => {
    const dbData = getDBFile();
    if (!dbData[collection]) dbData[collection] = {};
    dbData[collection][docId] = data;
    saveDBFile(dbData);
  };

  const getCollection = (collection: string) => {
    const dbData = getDBFile();
    return dbData[collection] || {};
  };

  const mergeNested = (target: any, source: any) => {
    const result = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current[parts[i]] = { ...current[parts[i]] };
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  class MockDocumentReference {
    constructor(private collectionName: string, private docId: string) {}

    async get() {
      const data = readLocalDB(this.collectionName, this.docId);
      return {
        exists: data !== null,
        data: () => data
      };
    }

    async set(data: any) {
      writeLocalDB(this.collectionName, this.docId, data);
    }

    async update(updates: any) {
      const data = readLocalDB(this.collectionName, this.docId) || {};
      const updated = mergeNested(data, updates);
      writeLocalDB(this.collectionName, this.docId, updated);
    }
  }

  class MockCollectionReference {
    constructor(private name: string) {}

    async add(data: any) {
      const id = `mock_${Math.random().toString(36).substr(2, 9)}`;
      writeLocalDB(this.name, id, data);
      return { id };
    }

    doc(id: string) {
      return new MockDocumentReference(this.name, id);
    }

    where(field: string, op: string, value: any) {
      return {
        get: async () => {
          const all = getCollection(this.name);
          const filtered = Object.entries(all)
            .filter(([_, doc]: any) => doc[field] === value)
            .map(([id, doc]: any) => ({
              id,
              data: () => doc
            }));
          return {
            forEach: (cb: any) => filtered.forEach(cb)
          };
        }
      };
    }
  }

  db = {
    collection: (name: string) => new MockCollectionReference(name)
  };

  auth = {
    verifyIdToken: async (token: string) => {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          return {
            uid: payload.user_id || payload.sub,
            email: payload.email,
            name: payload.name || payload.display_name,
            ...payload
          };
        }
      } catch (e) {
        console.error('Failed to parse token payload in fallback:', e);
      }
      return {
        uid: 'mock_uid_123',
        email: 'mock@crackprep.ai',
        name: 'Mock Cadet'
      };
    }
  };
}

export { admin, db, auth };
