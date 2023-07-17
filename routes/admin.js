import express from 'express'
import Categoria from '../models/Categoria.js';
import Postagem from '../models/Postagens.js'
import eAdmin from '../helpers/eAdmin.js';



const router = express.Router()

router.get('/', eAdmin,  (req,res) => {
  res.render("admin/index")
});

router.get('/categorias',eAdmin, (req,res) => {
  Categoria.find().sort({date: 'desc'})
  .then((categorias) =>{
      categorias = categorias.map(categoria => categoria.toObject());
      res.render("admin/categorias", {categorias});
    })
    .catch((err) =>{
      req.flash("error_msg", "Houve um erro ao salvar a categoria");
      res.redirect("/admin");
    });
});

router.get('/categorias/add', eAdmin,  (req,res) => {
  res.render("admin/addcategorias")
});

let erros = []
router.post('/categorias/nova', eAdmin, (req,res) => {


  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: 'Nome invalido'})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: 'Categoria invalida'})
  }

  if(req.body.nome.length < 2) {
    erros.push({texto: 'Categoria com nome pequeno'})
  }

  if(erros.length > 0){
    res.render("admin/addcategorias", {erros: erros})
  
  }else{
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }
    new Categoria(novaCategoria)
    .save()
    .then(() =>{
      req.flash("success_msg", "Categoria Criada com Sucesso")
      res.redirect("/admin/categorias")
    })
    .catch((err)=>{
      req.flash("error_msg", "Houve um erro ao salvar a categoria")
      res.redirect("/admin")
    })
  }
});

router.get('/categorias/edit/:id', eAdmin,  (req,res) => {
  Categoria.findOne({_id:req.params.id})
    .then((categoria) =>{
      let categorias = categoria.toObject()
        res.render("admin/editcategorias", {categorias});
    })
    .catch((err) =>{
      console.log(err)
      req.flash("error_msg", "Essa categoria não existe")
      res.redirect("/admin/categorias")
    })
});

router.post('/categorias/edit', eAdmin, (req,res) =>{
  Categoria.findOne({_id: req.body.id})
    .then((categoria) =>{
      categoria.nome = req.body.nome,
      categoria.slug = req.body.slug,
      categoria.save()
        .then(() =>{
          req.flash("success_msg", "Categoria editada com Sucesso")
          res.redirect("/admin/categorias")
        })
        .catch(() =>{
          req.flash("error_msg", "Houve um erro ao editar a categoria")
          res.redirect("/admin")
        })
    })
    .catch(() =>{
      req.flash("error_msg", "Erro ao Editar categoria")
      res.redirect("/admin/categorias")
    })
});

router.post('/categorias/deletar' , eAdmin,(req,res) =>{
  Categoria.deleteOne({_id: req.body.id})
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso!")
      res.redirect("/admin/categorias")
    })
    .catch(() =>{
      req.flash("error_msg", "Houve um erro ao apagar a categoria")
      res.redirect("/admin/categorias")
    })
});

router.get('/postagens', eAdmin,(req, res) => {
  Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
      res.render('admin/postagens', {postagens: postagens})
  }).catch( (err) => {
      req.flash('error_msg', 'Erro ao listar os posts')
      res.render('/admin')
  })
});

router.get('/postagens/add', eAdmin,(req,res) =>{
  Categoria.find().lean().then((categorias) =>{
    res.render('admin/addpostagens', {categorias: categorias})

  }).catch((err) =>{
    req.flash('error_msg', "houve um erro carregar formulario")
    res.redirect('/admin')
  })
});

router.post('/postagens/nova',eAdmin, (req,res) =>{
  let erros = []

  if(req.body.categorias == 0){
    erros.push({texto: 'categoria invalida, registre uma categoria'})
  }
  if(erros.length > 0){
    res.render("admin/addpostagens", {erros: erros}) 
  }else {
    const novaPostagem = {
      titulo: req.body.titulo ,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }
    new Postagem(novaPostagem).save().then(() =>{
      req.flash('success_msg', 'postagem criado com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err)=>{
      req.flash('error_msg', 'houve um erro durante o salvamento da postagem')
      res.redirect('/admin/postagens')
    })
  }
});

router.get('/postagens/edit/:id', eAdmin,(req,res) =>{

  Postagem.findOne({_id: req.params.id}).lean().then((postagem) =>{
    Categoria.find().lean().then((categorias) =>{
      
      res.render('admin/editpostagens', {categorias,postagem})

    }).catch((err) =>{
      req.flash("error_msg", 'houve um erro ao carregar categorias')
      res.redirect('/admin/postanges')
    })
  }).catch((err) =>{
    req.flash("error_msg", 'houve um erro ao carregar formulario')
    res.redirect('/admin/postanges')
  })

  router.post('/postagens/edit', (req,res) =>{
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then( () =>{
          req.flash('success_msg', 'postagem edita com sucesso!')
          res.redirect('/admin/postagens')
        }).catch((err) =>{
          req.flash('error_msg', 'Houve um erro ao salvar a edição')
          res.redirect('/admin/postagens')
        })
    }).catch((err) =>{
      req.flash('error_msg', 'Houve um erro ao salvar a edição')
      res.redirect('/admin/postagens')
    })
  })
});

router.get('/postagens/deletar/:id' ,eAdmin, (req,res) =>{
  Postagem.findByIdAndRemove({_id: req.params.id})
  .then(() =>{
    req.flash('success_msg', 'postagem deletada!')
    res.redirect('/admin/postagens')
  })
  .catch((err) =>{
    req.flash('error_msg', 'Houve um erro deletar')
    res.redirect('/admin/postagens')
  })
});

export default router;

