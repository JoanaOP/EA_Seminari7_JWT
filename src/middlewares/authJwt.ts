import {NextFunction, Request, Response, Router} from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Role from '../models/Role';
import config from "../config";
import { match } from 'assert';
import { userInfo } from 'os';

export const verifyToken = async (req: any, res: Response, next: NextFunction) => {


    try{        

        const token = req.headers["x-access-token"];
        if(!token){
            return res.status(403).send("No token provided");        
        }

        console.log(token);
        const decoded = jwt.verify(token,config.SECRET);

        res.locals.jwtPayload = decoded;

        const { id } = decoded;

        const user = await User.findById(id, {password:0});
        if(!user) {
            return res.status(404).json({message: "No user found"});
        }
        console.log(user);

        next();

    }catch (error){
        return res.status(401).send("Unauthorized");
    }
    
}

export const isModerator = async (req: Request, res: Response, next: NextFunction) =>{
    const user = await User.findById(res.locals.jwtPayload._id);
    const roles = await Role.find({_id: {$in: user.roles}});

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name == 'moderator' || roles[i].name == 'admin'){
            next();
            return;
        }
    }
    return res.status(403).json({message: "Requires moderator role"});
}
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(res.locals.jwtPayload._id);
    const roles = await Role.find({_id: {$in: user.roles}});

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name == 'admin'){
            next();
            return;
        }
    }
    return res.status(403).json({message: "Requires admin role"});
}