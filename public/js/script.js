//ALEX

function pesquisarLivro() {
  // Variáveis
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById('myInput');
  filter = input.value.toUpperCase();
  table = document.getElementById('table');
  tr = table.getElementsByTagName('tr');

  //Comparar o campo do input com o campo da tabela
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName('td')[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = '';
      } else {
        tr[i].style.display = 'none';
      }
    }
  }
}

let foto = document.getElementById("mostraFoto");
let arquivo = document.getElementById("foto");

arquivo.addEventListener("change", (e) => {
  let leitor = new FileReader();
  leitor.onload = () => {
    foto.src = leitor.result;
  }
  leitor.readAsDataURL(arquivo.files[0]);
})


