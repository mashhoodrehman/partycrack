const jwt = require ("jsonwebtoken");
const config = require ("../config");

const { JWT_SECRET } = config;

module.exports =   (req, res, next) => {
  const authHeader = req.headers['authorization'];
 const token=authHeader && authHeader.split(' ')[1]
//  console.log(token)
  // Check for token
  if (!token)
    return res.status(401).json({ msg: 'No token, authorization denied' });

    jwt.verify(token,JWT_SECRET,(err,user)=>{
      if(err){
        res.sendStatus(403)
      }
      req.user=user
      next();
    })

};