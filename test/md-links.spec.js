const { validateLink, extractLinks, readMarkdownFile, validateMarkdownLinks, mdLinks } = require('../src/main.js');
const fs = require('fs').promises;
const axios = require('axios');

jest.mock('axios');
jest.mock('fs').promises;

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

    jest.spyOn(Promise, 'all').mockResolvedValue(mockValidatedLinks);

    return validateMarkdownLinks(links).then(result => {
      expect(result).toEqual(mockValidatedLinks);
    });
  });
});


describe('mdLinks', () => {
  it('deve retornar um array de links', () => {
    return mdLinks('test/comLinks.md')
      .then(links => {
        expect(Array.isArray(links)).toBe(true);
      });
    });
  });

  it('deve ler um diretório', () => {
    return mdLinks('test/arquivos')
      .then(links => {
        expect(Array.isArray(links)).toBe(true);
      });
  });

  it('deve rejeitar a promessa quando o arquivo não é do tipo Markdown', () => {
    return expect(mdLinks('teste.txt')).rejects.toThrow('Erro ao verificar o arquivo/nome de diretório.');
  });

it('deve rejeitar a promessa quando o arquivo não é .md', () => {
  return mdLinks('test/teste.txt')
    .catch(error => {
      expect(error.message).toBe('Erro ao verificar o arquivo/nome de diretório.');
    });
});
