import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        mongoose.connection.on('connected', ()=> console.log("Database Connected"));
        mongoose.connection.on('error', (err)=> console.log("Database Connection Error:", err.message));
        
        await mongoose.connect(`${process.env.MONGODB_URI}/WorkFLow`, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        })
    }catch(error){
        console.log("MongoDB Connection Failed:", error.message);
        process.exit(1); // Exit process with failure
    }
}

export default connectDB;