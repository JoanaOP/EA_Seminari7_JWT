import {Schema, model} from 'mongoose';

const RatingSchema = new Schema({
    name: {type: String, required: true},
    rating: {type: Number, required: true },
    description: {type: String, required: true},    
    userId: {type: Schema.Types.ObjectId, ref:'User'}
})

export default model('Rating', RatingSchema);