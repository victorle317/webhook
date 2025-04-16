function authenticate(req, res, next) {
    // console.log(req.headers);
  const authPassword = req.headers['x-client-auth-token'];
  const authPasswordAdmin = req.headers['x-admin-auth-token'];
  if (!authPassword || authPassword !== `${process.env.CLIENT_AUTH_TOKEN}`) {
    res.status(401).send('Unauthorized');
  } else if(authPassword == `${process.env.CLIENT_AUTH_TOKEN}`) {
    if(authPasswordAdmin == `${process.env.ADMIN_AUTH_TOKEN}`) {
      req.isAdmin = true;
      next();
    }else{
      req.isAdmin = false;
      next();
    }
  }else{
    res.status(401).send('Unauthorized');
  }
}

module.exports = authenticate