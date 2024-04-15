import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2";
import { OpenAI } from "openai";
import dotenv from "dotenv"
dotenv.config();

const openai = new OpenAI({
        
    apiKey: "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"
});

const pool = mysql.createPool({
    // host: process.env.MYSQL_HOST,
    // user: process.env.MYSQL_USER,
    // password: process.env.MYSQL_PASSWORD, 
    // database: process.env.MYSQL_DATABASE
    host:'127.0.0.1',
    user:'root',
    password:'Idanoam123!',
    database:'gptdemo'
}).promise();

const app = express();
const port = 3000;

app.use(bodyParser.json());
//app.use(cors());

// CORS configuration
const corsOptions = {
    origin: 'https://vercel-chat-gpt-client.vercel.app', // or use '*' to allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  // Use the CORS middleware with the specified options
  app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("Hello, this is the root of the ChatGPT server.");
});

app.post("/", async (req , res) => {

    const {message} = req.body;

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: `${message}`}],
        model: "gpt-3.5-turbo",
        //model: "gpt-4-turbo-preview",
    });

    res.json({
        completion: completion.choices[0]

    })
});

app.post("/compare", async (req , res) => {

    const {message} = req.body;
    console.log(message.question);
    
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", 
                     content: `I have this question: ${message.question}. 
                                and i heve this 5 answers and their score on stack overflow:
                                code number 1 - ${message.answer1} score 1 - ${message.answer1rating},
                                code number 2 - ${message.answer2} score 2 - ${message.answer2rating},
                                code number 3 - ${message.answer3} score 3 - ${message.answer3rating},
                                code number 4 - ${message.answer4} score 4 - ${message.answer4rating}, 
                                code number 5 - ${message.answer5} score 5 - ${message.answer5rating}. 
                                Tell me which of these 5 answers is better to answer the question
                                and tell me what is the difference between these 5 codes, 
                                also rate every answer on a scale of 1-10 by your prefrence.
                                answer this question in a json format as follow:
                                {
                                question:{the question i provided},
                                answer1: {the first answer i provided},
                                score1: {the score for answer number 1 i provided},
                                answer2: {the second answer i provided},
                                score2: {the score for answer number 2 i provided},
                                answer3: {the third answer i provided},
                                score3: {the score for answer number 3 i provided},
                                answer4: {the fourth answer i provided},
                                score4: {the score for answer number 4 i provided},
                                answer5: {the fifth answer i provided},
                                score5: {the score for answer number 5 i provided},
                                better_question: {answer}, 
                                why_better: {answer},
                                difference_between_question: {answer},
                                rating_question1: {answer},
                                explanation_for_rating1: {answer},
                                rationQuestion2: {answer},
                                explanation_for_rating2: {answer}
                                rationQuestion3: {answer},
                                explanation_for_rating3: {answer}
                                rationQuestion4: {answer},
                                explanation_for_rating4: {answer}
                                rationQuestion5: {answer},
                                explanation_for_rating5: {answer}
                               }`}],
        model: "gpt-3.5-turbo",
    });

    res.json({
        completion: completion.choices[0]

    })
   
    const result = insertPrompt(message.question,
                                message.answer1,
                                message.answer2,
                                completion.choices[0].message.content)
    console.log(result)

});



async function insertPrompt(question, ans1, ans2, decision){
    const result = await pool.query(`
     INSERT INTO gptprompts (Question, Answer1, Answer2, Decision)
     VALUES(?,?,?,?)`
    , [question, ans1, ans2, decision])
    return result;
}

app.listen(port, () =>{
    console.log(`Example app listening at http://localhost:${port}`);
})



   
    
    