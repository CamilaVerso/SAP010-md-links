const mdLinks = require('../src/index.js');

describe('mdLinks', () => {
  test('deve retornar um array de links', () => {
    return mdLinks('src/README.md')
      .then(links => {
        expect(Array.isArray(links)).toBe(true);
        expect(links.length).toBeGreaterThan(0);
        
      });
  });

  test('deve rejeitar a promessa quando o arquivo não tem links', () => {
    return mdLinks('../test/teste.md')
      .catch(error => {
        expect(error.message).toEqual('Erro ao ler o conteúdo do arquivo.'); //Erro ao ler o conteúdo do arquivo.
      });
  });

  test('deve rejeitar a promessa quando o arquivo não é do tipo Markdown', () => {
    return expect(mdLinks('teste.txt')).rejects.toThrow('A rota inserida não é válida.');
  });

  // test('deve rejeitar a promessa quando não consegue ler o conteúdo do arquivo', () => {
  //   return mdLinks('../test/teste2.md')
  //     .catch(error => {
  //       expect(error.message).toBe('Erro ao ler o conteúdo do arquivo.');
  //     });
  // });


  test('deve rejeitar a promessa quando o arquivo não é .md', () => {
    return mdLinks('../test/teste.txt')
      .catch(error => {
        expect(error.message).toBe('A rota inserida não é válida.'); //O arquivo não é do tipo Markdown.
      });
  });

  test('deve imprimir mensagem de erro conteúdo inexistente', () => {
    return mdLinks('caminho/inexistente.md')
      .catch(error => {
        expect(error.message).toBe('A rota inserida não é válida.');
      });
  });

});
