import mongoose from "mongoose"

type connectionObject = {
    isConnected?: number
}
const connection: connectionObject = {}

async function dbConnect(): Promise<void>{
    const uri = process.env.NEXT_PUBLIC_MONGO_URI;
    if (!uri) throw new Error("MONGODBURI not found in environment variables");
    if(connection.isConnected){
        console.group("database already connected")
        return ;
    }

    try {
        const db = await mongoose.connect(uri || "", {})
        connection.isConnected = db.connections[0].readyState
        console.log("DB Connected Successfully");
    } catch (error) {
        console.log("DB Connection failed", error);
        process.exit(1)
    }
}

export default dbConnect;