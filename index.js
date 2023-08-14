const fs = require('fs').promises;
const path = require('path');
const extract = require('markdown-link-extractor');

function mdLinks(rotaRelativa) {
  const rotaAbsoluta = path.resolve(rotaRelativa);

  return new Promise((resolve, reject) => {
    fs.access(rotaAbsoluta, fs.constants.F_OK, (err) => {
      if (err) {
        reject('A rota não existe!');
        return;
      }

      const extensoesMarkdown = ['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'];
      const extensaoArquivo = path.extname(rotaAbsoluta);

      if (!extensoesMarkdown.includes(extensaoArquivo)) {
        reject('O arquivo não é Markdown!');
        return;
      }

      fs.readFile(rotaAbsoluta, 'utf-8')
        .then(conteudo => {
          const linksEncontrados = extract(conteudo);
          resolve(linksEncontrados);
        })
        .catch(err => {
          reject(`Erro ao ler o arquivo: ${err}`);
        });
    });
  });
}
// Exemplo de uso
mdLinks('./README.md')
  .then(links => {
    console.log('Links encontrados:', links);
  })
  .catch(err => {
    console.error('Erro:', err);
  })