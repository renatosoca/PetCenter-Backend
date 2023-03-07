import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const jwtValidation = async ( req, res, next ) => {
    let token;
    
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const payload = jwt.verify( token, process.env.JWT_SECRET );
            req.user = await userModel.findById( payload._id ).select( '-password -token -confirmed -createdAt -updatedAt -__v' );
            
            return next();
        } catch (e) {
            return res.status(401).json({ msg: 'jwtoken no válido' });
        };
    };

    if ( !token ) return res.status(401).json({ msg: 'JWToken no válido o inexistente' });

    next();
};

export default jwtValidation;