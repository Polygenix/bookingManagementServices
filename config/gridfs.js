
const mongoose = require("mongoose");

const getUploadBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB is not connected");
  }

  return new mongoose.mongo.GridFSBucket(
    mongoose.connection.db,
    {
      bucketName: "uploads"
    }
  );
};

module.exports = getUploadBucket;
