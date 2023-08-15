const mdLinks = require('../src/index.js'); 

describe('mdLinks', () => {
  test('deve retornar um array de links', () => {
    return mdLinks('../src/README.md')
      .then(links => {
        expect(Array.isArray(links)).toBe(true);
        expect(links.length).toBeGreaterThan(0);
        // Você também pode adicionar mais expectativas para verificar as propriedades dos links
      });
  });

  test('deve rejeitar a promessa quando o arquivo não é do tipo Markdown', () => {
    return expect(mdLinks('teste.txt')).rejects.toThrow('A rota inserida não é válida.');
  });

  test('deve rejeitar a promessa quando a rota não é válida', () => {
    return expect(mdLinks('caminho/inexistente')).rejects.toThrow('A rota inserida não é válida.');
  });

 
});
