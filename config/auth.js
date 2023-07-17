import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';

const passportConfig = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
      Usuario.findOne({ email })
        .then((usuario) => {
          if (!usuario) {
            return done(null, false, { message: 'Essa conta não existe' });
          }
          bcrypt.compare(senha, usuario.senha, (erro, batem) => {
            if (batem) {
              return done(null, usuario);
            } else {
              return done(null, false, { message: 'As senhas não batem' });
            }
          });
        })
        .catch((err) => done(err));
    })
  );

  passport.serializeUser((usuario,done)=>{
    done(null,usuario.id)
})

passport.deserializeUser((id,done)=>{
    Usuario.findById(id).then((usuario)=>{
      done(null,usuario)
    }).catch((err)=>{
      done (null,false,{message:'algo deu errado'})
    })


    })
};

export default passportConfig;
