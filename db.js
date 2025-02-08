const mongoose = require("mongoose");
const Schema = mongoose.Schema; // mongoose library have a class named schema which is used for creating schema
const ObjectId= mongoose.ObjectId;
// create a schema
const userSchema = new Schema({
    email     : {type :String, unique : true},
    password  : String,
    name      : String
});

const todoSchema = new Schema({
    title       :   String,
    description :   String,
    done        :   Boolean,
    userId      :   ObjectId

});

// now create a model out of schema

const userModel = mongoose.model("User",userSchema);
const todoModel = mongoose.model("todos",todoSchema);

// now export these models so that we can use it in other files in code base

module.exports = {
    userModel:userModel,
    todoModel:todoModel
}




