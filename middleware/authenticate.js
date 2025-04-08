function authenticate(req, res, next) {
    // console.log(req.headers);
  const authPassword = req.headers['x-client-auth-token'];
  if (!authPassword || authPassword !== `${process.env.CLIENT_AUTH_TOKEN}`) {
    res.status(401).send('Unauthorized');
  } else if(authPassword == `${process.env.CLIENT_AUTH_TOKEN}`) {
    next();
  }else{
    res.status(401).send('Unauthorized');
  }
}

module.exports = authenticate