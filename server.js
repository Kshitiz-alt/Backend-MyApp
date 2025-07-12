import {app} from "./app.js";
dotenv.config();
import dotenv from 'dotenv';


// default port 
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server is working on port ${PORT}`)
})