import { Request, Response, Router } from "express";
import { userInfo } from "os";
import { resolve } from "path";
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import Role from "../models/Role";
import { checkDuplicateUsernameOrEmail, checkRolesExisted } from "../middlewares/verifySignup";

class AuthRoutes {

    router:Router;

    constructor(){
        this.router = Router();
        this.routes()
    }

    public async signin(req: Request, res: Response){

        const userFound = await User.findOne({name: req.body.name}).populate('roles');

        if(!userFound){
            return res.status(404).send("User not found");
        }

        // Compare passwords
        const matchPassword = await bcrypt.compare(req.body.password, userFound.password);
        if(!matchPassword){
            res.status(401).json({token: null, message: "Ivalid password"});
        }

        const token = jwt.sign({id: userFound._id, username: userFound.username}, config.SECRET, {
            expiresIn: 3600
        });

        res.json({token: token});
    }

    public async signup(req: Request, res: Response){
        const {id, name, age, password, roles} = req.body;

        //encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const newUser = new User({
            id: id,
            name: name,
            age: age,
            password: hashed
        });

        if (roles){
            const foundRoles = await Role.find({name: {$in: roles}}); //find if role exists in the db
            newUser.roles = foundRoles.map(role => role._id); // save _id of roles
        }
        else{ //assign default user role
            const role = await Role.findOne({name: 'user'});          
            newUser.roles = [role._id];
        }       

        const savedUser = await newUser.save();
        console.log(savedUser);


        const token = jwt.sign({id: savedUser._id, username: savedUser.username},config.SECRET,{
            expiresIn: 86400
        });

        res.status(200).json({token});
    }

    routes(){
        this.router.post('/signup', [checkDuplicateUsernameOrEmail, checkRolesExisted], this.signup);
        this.router.post('/signin', this.signin);
    }
}


const authRoutes = new AuthRoutes();

export default authRoutes.router;