const express = require('express');
const mongoose = require('mongoose');
const expressLayout = require('express-ejs-layouts');
const port = 3000;

const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

mongoose.connect('digite o link do seu banco de dados',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
const app = express();

app.set('view engine', 'ejs');
app.use(expressLayout);
app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const Livros = mongoose.model('livros', {
  titulo: String,
  autor: String,
  genero: String,
  ano: Number,
  editora: String,
  foto: String
});

const Alunos = mongoose.model('alunos', {
  user: String,
  senha: Number
});

const Emprestimo = mongoose.model('emprestimo', {
  livro: {
    idLivro: String,
    nome: String,
    autor: String,
    ano: Number,
    genero: String,
    editora: String,
    foto: String
  },
  aluno: {
    user: String
  }
})

app.get('/', (req, res) => {
  let consult = Livros.find({}, (err, pesquisa) => {
    if (err) return res.status(500).send('Erro na consulta livro');
    res.render('pages/home', { livro_item: pesquisa });
  });
});

app.get('/cadastroAlunos', (req, res) => {
  res.render('pages/cadastroAlunos');
});

app.post('/cadastroAlunos', (req, res) => {
  let aluno = new Alunos();
  aluno.user = req.body.user;
  aluno.senha = req.body.senha;

  aluno.save(err => {
    if (err) return res.status(500).send('Erro ao cadastrar aluno');
    return res.redirect('/mostraAluno');
  });
});

app.get('/mostraAluno', (req, res) => {
  let consult = Alunos.find({}, (err, resposta) => {
    if (err) {
      return res.status(500).send('Erro na consulta aluno');
    }
    res.render('pages/mostraAluno', { aluno_item: resposta });
  });
});

app.get('/atualizarAluno/:id', (req, res) => {
  Alunos.findById(req.params.id, (err, resposta) => {
    if (err) return res.status(500).send('erro ao editar aluno');
    res.render('pages/atualizarAluno', { aluno_item: resposta });
  });
});

app.post('/atualizarAluno', (req, res) => {
  let id = req.body.id;
  Alunos.findById(id, (err, aluno) => {
    if (err) return res.status(500).send('Erro ao consultar alunos');
    aluno.user = req.body.user;
    aluno.senha = req.body.senha;
    aluno.save(err => {
      if (err) return res.status(500).send('erro ao editar o aluno');
      return res.redirect('/mostraAluno');
    });
  });
});

app.get("/deletarAluno/:id", (req, res)=>{
  var idAluno = req.params.id;
  Alunos.deleteOne({_id:idAluno}, (err, result)=>{
      if(err){
          return res.status(500).send("Erro ao deletar livro");
      }        
  })
  res.redirect("/mostraAluno");
});

app.get('/cadLivro', (req, res) => {
  res.render('pages/cadastroLivros');
});

//

app.post('/cadLivro', (req, res) => {
  let livro = new Livros();
  livro.titulo = req.body.titulo;
  livro.autor = req.body.autor;
  livro.genero = req.body.genero;
  livro.ano = req.body.ano;
  livro.editora = req.body.editora;
  livro.foto = req.body.arquivoImage;

  livro.save(err => {
    if (err) return res.status(500).send('Erro ao cadastrar' + err);
    return res.redirect('/pesquisa');
  });
});

app.get('/atualizarLivro/:id', (req, res) => {
  Livros.findById(req.params.id, (err, resposta) => {
    if (err) return res.status(500).send('erro ao editar livro');
    res.render('pages/atualizarLivro', { livro_item: resposta });
  });
});

app.post('/atualizarLivro', (req, res) => {
  let id = req.body.id;
  Livros.findById(id, (err, livro) => {
    if (err) return res.status(500).send('Erro ao consultar livro');
    livro.titulo = req.body.titulo;
    livro.autor = req.body.autor;
    livro.genero = req.body.genero;
    livro.ano = req.body.ano;
    livro.editora = req.body.editora;
    livro.foto = req.body.arquivoImage
    

    livro.save(err => {
      if (err) return res.status(500).send('erro ao editar o aluno');
      return res.redirect('/pesquisa');
    });
  });
});

app.get("/deletarLivro/:id", (req, res)=>{
  var idLivro = req.params.id;
  Livros.deleteOne({_id:idLivro}, (err, result)=>{
      if(err){
          return res.status(500).send("Erro ao deletar livro");
      }        
  })
  res.redirect("/pesquisa");
});

app.get('/pesquisa', (req, res) => {
  let consult = Livros.find({}, (err, pesquisa) => {
    if (err) return res.status(500).send('Erro na consulta livro');
    res.render('pages/pesquisarLivros', { livro_item: pesquisa });
  });
});

// KAROL
app.get('/loginAluno', (req, res) => {
  res.render('pages/login')
})

app.post('/verificaLogin', (req, res) => {
  const loginAluno = (req.body.user).toString()
  const senhaAluno = Number(req.body.senha)
  console.log(loginAluno, senhaAluno)
  Alunos.find({ user: loginAluno }, (erro, resposta) => {
    if (erro) { throw erro }
    if (resposta == null) {
      res.send("Usuário não encontrado")
    }

    if (resposta[0].user == loginAluno && resposta[0].senha == senhaAluno) {
      localStorage.setItem('perfilLogado', loginAluno)
      res.redirect('/')
    } else if (resposta[0].user == loginAluno) {
      res.send('Senha incorreta')
    } else {
      res.send("Digite novamente seu user e senha")
    }
  })
})

app.get('/inserirEmprestimo/:id', (req, res) => {

  Livros.findById(req.params.id, (erro, resultado) => {
    if (erro) throw erro
    const usuarioLogado = localStorage.getItem('perfilLogado')
    let emprestimo = new Emprestimo({
      livro: {
        idLivro: resultado._id,
        nome: resultado.nome,
        autor: resultado.autor,
        ano: resultado.ano,
        genero: resultado.genero,
        editora: resultado.editora,
        foto: resultado.foto
      },
      aluno: {
        user: usuarioLogado
      }
    })

    emprestimo.save(err => {
      if (err) return res.status(500).send('Erro ao cadastrar' + err);
      return res.redirect('/emprestimoAluno');
    });
  })
})

// app.get("/deletarEmprestimo/:id", (req, res)=>{  
//   let idLivro = req.params.id
//   Emprestimo.findByIdAndDelete({_id:idLivro}, (err, result)=>{
//       if(err){
//           return res.status(500).send("Erro ao deletar livro");
//       }        
//   })
//   res.redirect("/emprestimoAluno");
// });

app.get('/emprestimoAluno', (req, res) => {
  let aluno = localStorage.getItem('perfilLogado')
  Emprestimo.find({ aluno: { user: aluno }}, (erro, resultado) => {
    if (erro) {
      return res.status(500).send('Erro na consulta livro')
    } else {
      res.render('pages/emprestimoAluno', { aluno_item: resultado })
     
    }
  })
})

app.get('/concluirEmprestimo', (req, res) => {
  const usuarioLogado = localStorage.getItem('perfilLogado')
  Emprestimo.aggregate([{
    $match: { 'aluno': { 'user': usuarioLogado } }
  },
  {
    $project: {
      item: 1,
      aluno: { $cond: { if: { $isArray: "$user" }, then: { $size: "$user" }, else: "" } }
    }
  }
  ], (err, result) => {


    if (result.length <= 5 || result == "") {
      res.render("pages/sucesso")
    } else {
      res.render("pages/falha");
    }
  })
})

app.listen(port, () => {
  console.log('Server ON');
});
