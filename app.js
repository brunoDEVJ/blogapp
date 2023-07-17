import { fileURLToPath } from 'url';
import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import admin from './routes/admin.js';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash'
import Postagem from './models/Postagens.js'
import Categoria from './models/Categoria.js'
import usuarios from './routes/usuario.js'
import passport from 'passport';
import passportConfig from './config/auth.js';
import {mongoURL} from './config/db.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurações
  // Sessão
  app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
  }))
  passportConfig(passport);
  app.use(passport.initialize());
  app.use(passport.session());


  app.use(flash())

  // Middleware
  app.use((req,res, next) =>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
  })

  // Porta
  const PORT = process.env.PORT|| 8081;

  // Body Parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // HandleBars
  app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
  app.set('view engine', 'handlebars');

  // Mongoose
  mongoose.Promise = global.Promise;
  mongoose.connect(mongoURL).then(()=> console.log('connected mongo')).catch((err)=>{console.log('erro mongo'+err)})

  // Public
  app.use(express.static(path.join(__dirname, 'public')));

  // Rotas
app.get('/',(req,res) =>{
    Postagem
    .find()
    .lean()
    .populate('categoria')
    .sort({data: 'desc'})
    .then((postagens) => {
      res.render('index', {postagens: postagens})
  })
    .catch((err) =>{
      console.log(err)
      req.flash('error_msg', 'houve um erro ')
      res.redirect('/404')
    })
  
})

app.get('/postagens/:slug', (req,res) =>{
  Postagem
  .findOne({slug: req.params.slug})
  .lean()
  .then((postagem) =>{
    if(postagem){
      res.render('postagem/index', {postagem})
    }else{
      req.flash('error_msg', 'essa postagem não existe')
      res.redirect('/')
    }
  })
  .catch((err) =>{
    req.flash('error_msg', 'essa postagem não existe')
    res.redirect('/')
  })
})

app.get('/categorias', (req,res) =>{
  Categoria
  .find()
  .lean()
  .then((categoria) =>{
    res.render('categorias/index', {categoria})
  })
  .catch((err)=>{req.flash('error_msg', 'essa postagem não existe')
  res.redirect('/')})
})

app.get('/categorias/:slug', (req,res) =>{
  Categoria
  .findOne({slug: req.params.slug})
  .lean()
  .then((categoria) =>{
    if(categoria){
      Postagem
      .find({categoria: categoria._id})
      .lean()
      .then((postagens) =>{
        res.render('categorias/postagens', {postagens, categoria})
      })
      .catch((err)=>{
        req.flash('error_msg', 'essa listar os postes')
        res.redirect('/')
      })
    }else{
      req.flash('error_msg', 'essa categoria não existe')
      res.redirect('/')
    }
  })
  .catch((err)=>{
    req.flash('error_msg', 'essa postagem não existe')
    res.redirect('/')
  })
})


app.get('/404', (req,res) =>{
  res.send('Error 404!')
})



  app.use('/admin',admin);
  app.use('/usuarios', usuarios)
// Outros
try {
  app.listen(PORT, () => {
    console.log('executando servidor...');
  });
} catch (error) {
  console.log(error)
}

