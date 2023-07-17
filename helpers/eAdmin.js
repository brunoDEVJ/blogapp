const eAdmin = (req,res,next) =>  {
  if(req.isAuthenticated() && req.user.eAdmin === 1){
    return next()
  }
  req.flash('error_msg',"você precisa ser admin")
  res.redirect('/')
}

export default eAdmin;