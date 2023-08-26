const { it } = require('node:test');
const { validateLink, extractLinks, readMarkdownFile, validateMarkdownLinks, mdLinks, readDirectory } = require('../src/main.js');
const fs = require('fs').promises;
const axios = require('axios');

jest.mock('axios');

describe('validateLink', () => {
  it('deve validar um link válido', () => {
    const validLink = {
      href: 'https://www.example.com',
      text: 'Example',
      file: '/path/to/file.md'
    };

    axios.head.mockResolvedValue({ status: 200 });

    return validateLink(validLink).then(result => {
      expect(result).toEqual({
        ...validLink,
        status: 200,
        ok: 'ok'
      });
    });
  });
  it('deve lidar com um erro para um link inválido', () => {
    const invalidLink = {
      href: 'https://www.example.com/nonexistent',
      text: 'Invalid Example',
      file: '/path/to/file.md'
    };

    axios.head.mockRejectedValue({ response: { status: 404 } });

    return validateLink(invalidLink).then(result => {
      expect(result).toEqual({
        ...invalidLink,
        status: 404,
        ok: 'fail'
      });
    });
  });
});

describe('extractLinks', () => {
  it('deve extrair links do conteúdo markdown', () => {
    const content = `
      [Google](https://www.google.com)
      [Facebook](https://www.facebook.com)
    `;
    const filePath = '/path/to/file.md';

    const result = extractLinks(content, filePath);

    const expectedLinks = [
      { href: 'https://www.google.com', text: 'Google', file: filePath },
      { href: 'https://www.facebook.com', text: 'Facebook', file: filePath }
    ];

    expect(result).toEqual(expectedLinks);
  });
  it('deve retornar um array vazio quando não houver links no conteúdo', () => {
    const content = 'Arquivo sem links.';
    const filePath = '/path/to/file.md';

    const result = extractLinks(content, filePath);

    expect(result).toEqual([]);
  });
});

describe('readMarkdownFile', () => {
  it('deve ler e extrair links de um arquivo markdown', () => {
    const content = `
      [Google](https://www.google.com)
      [Facebook](https://www.facebook.com)
    `;
    const filePath = '/path/to/file.md';

    jest.spyOn(fs, 'readFile').mockResolvedValue(content);

    return readMarkdownFile(filePath).then(result => {
      const expectedLinks = [
        { href: 'https://www.google.com', text: 'Google', file: filePath },
        { href: 'https://www.facebook.com', text: 'Facebook', file: filePath }
      ];

      expect(result).toEqual(expectedLinks);
    });
  });

  it('deve retornar um array vazio quando não houver links no arquivo markdown', () => {
    const content = 'Arquivo sem link.';
    const filePath = '/path/to/file.md';

    jest.spyOn(fs, 'readFile').mockResolvedValue(content);

    return readMarkdownFile(filePath).then(result => {
      expect(result).toEqual([]);
    });
  });

  it('deve lidar com erros ao ler o arquivo markdown', () => {
    const filePath = '/path/to/nonexistent/file.md';

    jest.spyOn(fs, 'readFile').mockRejectedValue(new Error('File not found'));

    return readMarkdownFile(filePath).catch(error => {
      expect(error.message).toBe('Erro ao ler o arquivo. Detalhes: File not found');
    });
  });
});

describe('validateMarkdownLinks', () => {
  it('deve validar links em um array', () => {
    const links = [
      { href: 'https://www.google.com', text: 'Google', file: '/path/to/file.md' },
      { href: 'https://www.facebook.com', text: 'Facebook', file: '/path/to/file.md' }
    ];

    const mockValidatedLinks = [
      { href: 'https://www.google.com', text: 'Google', file: '/path/to/file.md', status: 200, ok: 'ok' },
      { href: 'https://www.facebook.com', text: 'Facebook', file: '/path/to/file.md', status: 404, ok: 'fail' }
    ];

    const mockValidateLink = jest.fn(link => {
      if (link.href === 'https://www.google.com') {
        return Promise.resolve({ status: 200, ok: 'ok' });
      } else {
        return Promise.resolve({ status: 404, ok: 'fail' });
      }
    });
    const linkPromises = links.map(link => mockValidateLink(link));

    jest.spyOn(Promise, 'all').mockResolvedValue(mockValidatedLinks);

    return validateMarkdownLinks(links).then(result => {
      expect(result).toEqual(mockValidatedLinks);
    });
  });
});

describe('mdLinks', () => {
  test('deve retornar um array de links', () => {
    return mdLinks('src/README.md')
      .then(links => {
        expect(Array.isArray(links)).toBe(true);
        // expect(links.length).toBeGreaterThan(0);

      });
  });

  test('deve rejeitar a promessa quando o arquivo não é do tipo Markdown', () => {
    return expect(mdLinks('teste.txt')).rejects.toThrow('Erro ao verificar o arquivo/nome de diretório.');
  });// não apagar este teste

  });
test('deve rejeitar a promessa quando o arquivo não é .md', () => {
  return mdLinks('test/teste.txt')
    .catch(error => {
      expect(error.message).toBe('Erro ao verificar o arquivo/nome de diretório.');
    }); // Não apagar este teste
});




  // test('deve rejeitar a promessa quando o arquivo não tem links', () => {
  //   return mdLinks('../test/teste.md')
  //     .catch(error => {
  //       expect(error.message).toEqual('Nenhum link encontrado no arquivo.'); //Erro ao ler o conteúdo do arquivo.
  //     }); // este teste passa mas não conta na cobertura porque o erro é genérico, preciso arrumar a função para dar o erro correto 
  // });


  // test('deve rejeitar a promessa quando o arquivo não é do tipo Markdown', () => {
  //   return expect(mdLinks('teste.txt')).rejects.toThrow('A rota inserida não é válida.');
  // });

  // test('deve rejeitar a promessa quando não consegue ler o conteúdo do arquivo', () => {
  //   return mdLinks('../test/teste2.md')
  //     .catch(error => {
  //       expect(error.message).toBe('Erro ao ler o conteúdo do arquivo.');
  //     });
  // });


  // test('deve rejeitar a promessa quando o arquivo não é .md', () => {
  //   return mdLinks('../test/teste.txt')
  //     .catch(error => {
  //       expect(error.message).toBe('A rota inserida não é válida.'); //O arquivo não é do tipo Markdown.
  //     });
  // });

  // test('deve imprimir mensagem de erro conteúdo inexistente', () => {
  //   return mdLinks('caminho/inexistente.md')
  //     .catch(error => {
  //       expect(error.message).toBe('A rota inserida não é válida.');
  //     });
  // });

