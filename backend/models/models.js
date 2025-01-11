const { Schema } = require('mongoose');
const mongoose = require('mongoose');


const userSchema = new Schema({
    username : {type : String, required : true, unique : true},
    email : {type : String, required : true, unique : true},
    password : {type : String, required : true, unique : false}
})
const adminSchema = new Schema({
    username : {type : String, required : true, unique : true},
    email : {type : String, required : true, unique : true},
    password : {type : String, required : true, unique : false}
})
const commentSchema = new Schema({
    userName: { type: String, required: true, unique: false }, 
    message: { type: String, required: true, unique: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'commentModel' },
    childId: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'commentModel' }], default: [] },
    pageName : {type : String, required : true},
    pageNo : {type : Number, required : true},
    date : {type : Date, default : Date.now}
});

const novelDataSchema = new Schema({
    
    novelName : {type : String, require : true},
    rating : {type : String, require : true},
    totalRaters : {type : String, require : true},
    description : {type : String, require : true},
    authorName : {type : Array, require : true},
    categories : {type : Array, require : true},
    source : {type : String, require : true},
    status : {type : Array, require : true},
    chapters: { type: Number, default: 0 }


})

const librarySchema = new Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, require : true},
    novelId : {type : mongoose.Schema.Types.ObjectId, require : true, ref : 'novelDataModel'},
    date : {type : Date, default : Date.now}
})

const chapterDataSchema = new Schema({
    novelTitle : {type : String, require : true},
    chapterTitle : {type : String, require : true},
    chapterNumber : {type : Number, require : true},
    chapterContent : {type : Array , require : true}
})

const userModel = mongoose.model('userModel', userSchema);
const adminModel = mongoose.model('adminModel', adminSchema, 'adminModel')
const commentModel = mongoose.model('commentModel', commentSchema, 'commentModel')
const novelDataModel = mongoose.model('novelDataModel', novelDataSchema, 'novelDataModel');
const chapterDataModel = mongoose.model('chapterDataModel', chapterDataSchema, 'chapterDataModel');
const libraryModel = mongoose.model('libraryModel', librarySchema, 'libraryModel');
module.exports = {userModel, commentModel, novelDataModel, chapterDataModel, libraryModel, adminModel}
