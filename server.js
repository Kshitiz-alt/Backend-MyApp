import {app} from "./app.js";
import dotenv from 'dotenv';
import { pool } from "./config/db.js";
dotenv.config();

// default port 
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server is working on port ${PORT}`)
})

