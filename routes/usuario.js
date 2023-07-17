import express from 'express'
import Usuario from '../models/Usuario.js';
const router = express.Router()
import bcrypt from 'bcryptjs'
import passport from 'passport';

router.get('/registro', (req,res) =>{
  res.render('usuarios/registro')
})

router.post('/registro', (req,res ) =>{
  let erros =[]

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
  {
    erros.push({texto: "nome invalido"})
  }
  if(!req.body.email || typeof req.body.email == undefined || req.body.email == null)
  {
    erros.push({texto: "email invalido"})
  }
  if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null)
  {
    erros.push({texto: "senha invalido"})
  }
  if(req.body.senha.length < 4 )
  {
    erros.push({texto: "senha invalido"})
  }
  if(req.body.senha != req.body.senha2)
  {
    erros.push({texto: "senha diferentes"})
  }
  if(erros.length>0) {
    res.render("usuarios/registro", {erros})
  }else {

    Usuario.findOne({email: req.body.email})
      .then((usuario) =>{
        if(usuario){
          req.flash('error_msg', 'já esxiste uma conta com esse email')
          res.redirect('usuarios/registro')
        }else{

          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha
          })

          bcrypt.genSalt(10 , (erro, salt) =>{
            bcrypt.hash(novoUsuario.senha,  salt, (erro, hash) =>{
              if(erro) {
                req.flash('error_msg', 'erro hash')
                res.redirect('/')
              }

              novoUsuario.senha = hash
              
              novoUsuario.save()
                .then((usuario) =>{
                  req.flash('success_msg', 'usuario cadastrado')
                  res.redirect('/')
                })
                .catch((err) =>{
                  req.flash('error_msg', 'erro ao salvar o usuario com codigo hash')
                  res.redirect('/')
                })

            })
          })

        }
      })
      .catch((err) =>{
        req.flash('error_msg', 'houve um erro interno')
        c
      })

  }
})

router.get('/login', (req,res) =>{
  res.render('usuarios/login')
})

router.post('/login', (req,res,next) =>{
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true
    
  })(req,res,next)
})

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
      if (err) { return next(err) }
      res.redirect('/')
    })
})

router.get('/logout', (req,res,next) =>{

  req.logOut()
  req.flash('success_msg', 'deslogado com succeso')
  res.redirect('/')
})

export default router;