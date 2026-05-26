import { User, Event, Task, Application, Certificate, Organization, Ticket, SponsorshipDeal } from './Schemas.js';
import { checkUseMock, getFallbackDb, saveFallbackDb } from '../config/db.js';

// Helper to generate a 24-character hex string similar to MongoDB ObjectId
export const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return timestamp + machine + pid + increment;
};

// Maps model strings to Mongoose models
const models = {
  User,
  Event,
  Task,
  Application,
  Certificate,
  Organization,
  Ticket,
  SponsorshipDeal
};

const getCollectionName = (modelName) => {
  return modelName.toLowerCase() + 's'; // e.g. User -> users, Event -> events
};

export const dataHelper = {
  // FIND ALL / FILTER
  find: async (modelName, query = {}) => {
    if (!checkUseMock()) {
      return await models[modelName].find(query).lean();
    }
    
    const db = getFallbackDb();
    const collection = db[getCollectionName(modelName)] || [];
    
    return collection.filter(item => {
      for (let key in query) {
        // Simple matching
        if (query[key] !== undefined && item[key] !== query[key]) {
          // Check for object matching (like ObjectId string match)
          if (typeof query[key] === 'object' && query[key] !== null) {
            // Mongoose queries can have $in, $ne, etc. Let's do simple equality matching.
            continue;
          }
          if (String(item[key]) !== String(query[key])) {
            return false;
          }
        }
      }
      return true;
    });
  },

  // FIND ONE
  findOne: async (modelName, query = {}) => {
    if (!checkUseMock()) {
      return await models[modelName].findOne(query).lean();
    }
    
    const results = await dataHelper.find(modelName, query);
    return results.length > 0 ? results[0] : null;
  },

  // FIND BY ID
  findById: async (modelName, id) => {
    if (!checkUseMock()) {
      try {
        return await models[modelName].findById(id).lean();
      } catch (err) {
        return null;
      }
    }
    
    const db = getFallbackDb();
    const collection = db[getCollectionName(modelName)] || [];
    const idStr = String(id);
    return collection.find(item => String(item._id) === idStr) || null;
  },

  // CREATE
  create: async (modelName, data) => {
    if (!checkUseMock()) {
      const doc = new models[modelName](data);
      const saved = await doc.save();
      return saved.toObject();
    }
    
    const db = getFallbackDb();
    const collectionName = getCollectionName(modelName);
    
    const newDoc = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    db[collectionName].push(newDoc);
    saveFallbackDb(db);
    return newDoc;
  },

  // FIND BY ID AND UPDATE
  findByIdAndUpdate: async (modelName, id, updateData, options = { new: true }) => {
    if (!checkUseMock()) {
      return await models[modelName].findByIdAndUpdate(id, updateData, options).lean();
    }
    
    const db = getFallbackDb();
    const collectionName = getCollectionName(modelName);
    const collection = db[collectionName] || [];
    const idStr = String(id);
    
    const index = collection.findIndex(item => String(item._id) === idStr);
    if (index === -1) return null;
    
    // Support update operators like $push, $set etc or standard merge
    let updatedObj = { ...collection[index] };
    
    // Basic support for Mongoose update operators
    if (updateData.$set) {
      updatedObj = { ...updatedObj, ...updateData.$set };
    }
    if (updateData.$push) {
      for (let key in updateData.$push) {
        if (!updatedObj[key]) updatedObj[key] = [];
        updatedObj[key].push(updateData.$push[key]);
      }
    }
    if (updateData.$pull) {
      for (let key in updateData.$pull) {
        if (Array.isArray(updatedObj[key])) {
          updatedObj[key] = updatedObj[key].filter(val => String(val) !== String(updateData.$pull[key]));
        }
      }
    }
    
    // Standard direct updates
    if (!updateData.$set && !updateData.$push && !updateData.$pull) {
      updatedObj = { ...updatedObj, ...updateData };
    }
    
    collection[index] = updatedObj;
    saveFallbackDb(db);
    return updatedObj;
  },

  // FIND BY ID AND DELETE
  findByIdAndDelete: async (modelName, id) => {
    if (!checkUseMock()) {
      return await models[modelName].findByIdAndDelete(id).lean();
    }
    
    const db = getFallbackDb();
    const collectionName = getCollectionName(modelName);
    const collection = db[collectionName] || [];
    const idStr = String(id);
    
    const index = collection.findIndex(item => String(item._id) === idStr);
    if (index === -1) return null;
    
    const deleted = collection.splice(index, 1)[0];
    saveFallbackDb(db);
    return deleted;
  }
};
