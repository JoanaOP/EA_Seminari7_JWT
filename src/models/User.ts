import {Schema, model} from 'mongoose';

const UserSchema = new Schema({
    id: {type:String, required:true},
    name: {type: String, required:true},
    age: {type: String, required:true},
    password: {type: String, required:true},
    creationDate: {type: Date, default:Date.now},
    ratings: [{type: Schema.Types.ObjectId, ref:'Rating'}],
    roles: [{type: Schema.Types.ObjectId, ref:'Role'}]
});


export default model('User', UserSchema);