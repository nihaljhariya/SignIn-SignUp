import express from "express";
import {createServer} from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import {connectToSocket} from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import newUserRoutes from "./routes/users.routes.js";


 const app = express();
 const server = createServer(app);
 const io  = connectToSocket(server);

 app.set("port" , (process.env.PORT || 8000));
 app.use(cors());
 app.use(express.json({limit:"40kb"}));
 app.use(express.urlencoded({limit:"40kb" , extended : true}));

//  kabhi api kaa neew version aaye or vo naa chle to uske liye y rhta h 
 app.use("/api/v1/users" , userRoutes);
 app.use("/api/v2/users", newUserRoutes);


 app.get("/home" , (req , res)=>{
    return res.json({"hello" : "World"})
 });

 const start = async ()=>{
 app.set("mongo_user")
 const connectionDb = await mongoose.connect("mongodb+srv://nihaljhariya:NihalCalling@vediocallingapp.eedir.mongodb.net/")
   console.log(`Mongo connected DB  Host : ${connectionDb.connection.host}`)
 server.listen(app.get("port"), () =>{
          console.log("Listening to port 8000");
    });
  
 }
 start();