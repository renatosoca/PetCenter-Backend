import jwt from "jsonwebtoken"

const jwtGenerator = ( _id = '', name = '') => {
  return jwt.sign( { _id, name }, process.env.JWT_SECRET, {
    expiresIn: "2h"
  });
}

export default jwtGenerator;