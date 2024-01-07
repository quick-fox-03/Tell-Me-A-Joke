//import dependencies
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
//create an express application, define a port
const app=express();
const port=3000;
//setup, delivery are vars used for two-line jokes, while a one-liner uses a single var defined as joke.
//jokesearch is used to make filter query requests to API.
//apiResult is the final joke content to sent over to front-end
let setup="";
let delivery=""; let jokesearch=""; let apiResult; 
const apiUrl="https://v2.jokeapi.dev/joke/Any";
//date object to get current year for footers.
//Before anyone asks why the current year is passed on in each render step,
//I don't know if there's a one command solution to this, and at this point, I am too afraid to ask.
let date = new Date();
let currYear=date.getFullYear();
app.use(express.static("public"));
//parse url-encoded string datas
app.use(bodyParser.urlencoded({extended:true}));
//render home and about pages.
app.get("/",(req,res)=>{
    res.render("home.ejs",{currYear:currYear});
})
app.get("/about",(req,res)=>{
    res.render("about.ejs",{currYear:currYear});
})
//handle the form that supplies word for api query
app.post("/search",async(req,res)=>{
    jokesearch=req.body.search;
    try {
        //if query is not null, provide a joke from API using that word, else return a random joke.
        if(jokesearch!==null){
            apiResult = await axios.get(apiUrl+"?contains="+jokesearch);
        }else{
            apiResult = await axios.get(apiUrl);
        }
        /*If no joke is found, make a flag variable so front-end knows it's hands are empty */
        if(apiResult.data.error && apiResult.data.message==='No matching joke found'){
            res.render("home.ejs",{currYear:currYear,noJokeError:"true"});
        }
        /*If a twopart joke is found, send it over to home with setup and delivery */
        if(apiResult.data.type==="twopart"){
            setup = apiResult.data.setup;  delivery=apiResult.data.delivery;
            res.render("home.ejs",{currYear:currYear,joketype:apiResult.data.type,setup:setup,delivery:delivery,noJokeError:"false"});
        }
        /*If a single joke is found, send it over as one variable */
        else if(apiResult.data.type==="single"){
            let joke = apiResult.data.joke;
            res.render("home.ejs",{currYear:currYear,joke:joke,noJokeError:"false"})
        }
    } catch (error) {
       console.log(error.data) 
    }
})
app.listen(port,()=>{
    console.log(`Server running on localhost:${port}`);
})