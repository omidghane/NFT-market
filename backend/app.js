const mongoose = require('mongoose');

// Define the connection URL and options
// const url = 'mongodb://localhost:27017'; // Replace with the appropriate MongoDB connection string if needed
const url = 'mongodb://127.0.0.1:27017';


const dbName = 'admin';

// Optional: Mongoose connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to MongoDB using Mongoose
mongoose.connect(`${url}/${dbName}`, mongooseOptions)
  .then(() => {
    console.log('Connected successfully to MongoDB server');

    // Perform database operations here
    // For example, you can define a schema and create a model

    // Define a schema
    const userSchema = new mongoose.Schema({
      name: String,
      age: Number,
    });

    // Create a model
    const User = mongoose.model('User', userSchema);

    // Insert a document
    const data = { name: 'John', age: 30 };

    User.create(data)
      .then((result) => {
        console.log('Document inserted successfully:', result);

        // Close the connection when finished
        mongoose.connection.close();
      })
      .catch((err) => {
        console.error('Error inserting document:', err);

        // Close the connection when finished (even if an error occurs)
        mongoose.connection.close();
      });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
 