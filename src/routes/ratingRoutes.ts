import {Request, response, Response, Router} from 'express';
import { authJwt } from '../middlewares';

import Rating from '../models/Rating';
import User from '../models/User';

class RatingRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getRatings(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allRatings = await Rating.find();
        if (allRatings.length == 0){
            res.status(404).send("There are no ratings yet!")
        }
        else{
            res.status(200).send(allRatings);
        }
    }

    public async getRatingsByName(req: Request, res: Response) : Promise<void> {
        const ratingFound = await Rating.findOne({name: req.params.nameRating});
        if(ratingFound == null){
            res.status(404).send("The rating doesn't exist!");
        }
        else{
            res.status(200).send(ratingFound);
        }
    }

    public async addRating(req: Request, res: Response) : Promise<void> {
        console.log(req.body);
        const {rating, description, name, userId} = req.body;

        const user = await User.findById(userId);

        const newRating = new Rating({rating, description, name, user: user._id});
        const savedRating = await newRating.save();

        user.ratings = user.ratings.concat(savedRating._id);
        user.save();

        res.status(200).send('Rating added!');
    }

    public async updateRating(req: Request, res: Response) : Promise<void> {
        const ratingToUpdate = await Rating.findOneAndUpdate ({name: req.params.nameRating}, req.body);
        if(ratingToUpdate == null){
            res.status(404).send("The rating doesn't exist!");
        }
        else{
            res.status(200).send('Updated!');
        }
    }

    public async deleteRating(req: Request, res: Response) : Promise<void> {
        const ratingToDelete = await Rating.findOneAndDelete ({name:req.params.nameRating}, req.body);
        if (ratingToDelete == null){
            res.status(404).send("This rating doesn't exist!")
        }
        else{
            res.status(200).send('Deleted!');
        }
    } 
    routes() {
        this.router.get('/', this.getRatings);
        this.router.get('/:nameRating', this.getRatingsByName);
        this.router.post('/', [authJwt.verifyToken, authJwt.isModerator], this.addRating);
        this.router.put('/:nameRating', [authJwt.verifyToken, authJwt.isModerator], this.updateRating);
        this.router.delete('/:nameRating', [authJwt.verifyToken, authJwt.isAdmin], this.deleteRating);
    }
}
const ratingRoutes = new RatingRoutes();

export default ratingRoutes.router;