const express = require("express");
const  mongoose = require("mongoose");
const {userModel,todoModel} = require("./db")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const app = express();
const jwt_secrete = "sujit1589";


async function dbConnect(){
   try{ 
    await mongoose.connect("mongodb+srv://sujitwalunj1589:Walunj%401589@cohort.7mlez.mongodb.net/Todo-application");
    }
    catch(e){
    console.log(e);
    }
}

dbConnect();

// create a middleware from authentication
function auth(req,res,next){

        const token = req.headers.token;

        if(token){
           try{
             const user = jwt.verify(token,jwt_secrete);
             req.body.userId = user._id;
             next();
            }
            catch(e){
                console.log(e);
                res.status(403).send("Invalid token");
            }

        }
        else{
            res.status(403).send("Token is absent");
        }
}

// to parse json data form body use express.json() middleware
app.use(express.json());

app.post("/sign-up",async function(req,res){

    // input validation

        // create schema 
        const requiredBody = z.object({
            email       : z.string().email(),
            password    : z.string().min(6).max(10),
            name        : z.string().min(4).max(20)
        })

        const data = requiredBody.safeParse(req.body);
        if(!data.success){
            res.json({
                msg: data.error
            });
            return ;
        }

    // get email password and name from req body
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hashedPassword = await bcrypt.hash(password,10);
   try{
        await userModel.create({
        email       : email,
        password    : hashedPassword,
        name        : name, 
    })}
    catch(e){
        if(e.errorResponse.code == 11000){
            res.status(403).json({
                msg :"Email address already exists"
        })
            return;
        }
        res.status(503).json({
            msg:"error in db entry",
            error : e
        })
        return;
    }

    res.status(200).send("Your account is created");
});

app.post("/sign-in",async function(req,res){
    // take username and password from body 
    const email = req.body.email;
    const password = req.body.password;

    const credentials =z.object( {
        email       : z.string().email(),
        password    : z.string().min(6).max(10)
    })

    const data = credentials.safeParse(req.body);

    if(!data.success){
        res.json({
            msg:data.error
        })
        return;
    }

    // check if user exist
    const user = await userModel.findOne({
        email       : email
    });

    if(!user){
        res.status(404).json({
            msg:"User not found"
        })
        return;
    }
    // if user present then create a token and return it

    const isUser =  bcrypt.compare(password,user.password);


   
    if(isUser){
        const token = jwt.sign( {userId : user._id } , jwt_secrete);
        console.log(token);

        await userModel.findOneAndUpdate({_id : user._id},{token : token});

        console.log(user);
        res.json({
            msg : "Your are logged in successfully",
            token:token
        });

    }
    else{
        // if not create a error msg and send it
        res.status(403).send("incorrect credentials")
    }
});

app.post("/todo",auth,async function(req,res){


    const tododata =z.object( {
        title: z.string().min(2).max(50),
        description:z.string().max(200)
    })

    const data  = tododata.safeParse(req.body);
    
    if(!data.success){
        res.json({
            msg: data.error
        });
        return ;

    }

    // get userId form body
        const userId = req.body.userId;
        
    // get title from body
            const title = req.body.title;    
        
    // get description from body
        const description = req.body.description;
    
    // insert it into todo-model
        await todoModel.create({
            title           : title,
            description     : description,
            done            : false,
            userId :        userId
        })
    // return response
        res.status(200).send("Todo created successfuly");
    
});

app.get("/todos",auth,async function(req,res){
    // user id from token
    const userId = req.body.userId;

    // get all the todos with this id
    const todos = await todoModel.find({userId:userId});

    // return those todos
    res.status(200).json({
        msg:"Successful",
        todos: todos,  
    })
});


app.listen(3000);