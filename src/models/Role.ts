import { Schema, model } from "mongoose";

export const ROLES = ["user", "admin", "moderator"];

const RoleSchema = new Schema({
    name: {type: String, required:true},    
});

export default model('Role', RoleSchema);