const fs = require('fs').promises;

// const fsPromises = require('fs').promises;
// const mainModule = require ('../src/main.js')
// const path = require('path');
const axios = require('axios');
const { validateLink, extractLinks, readMarkdownFile, validateMarkdownLinks, mdLinks, readDirectory } = require('../src/main.js');
// const mainModule = require('../src/main.js');

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

// describe('mdLinks', () => {
//   it('deve retornar links de um arquivo Markdown', () => {
//     // Mockando fs.promises.stat para retornar stats de arquivo
//     fs.promises.stat.mockResolvedValue({ isFile: () => true });

//     // Mockando fs.promises.readFile para retornar conteúdo de arquivo
//     const mockContent = `
//       [Google](https://www.google.com)
//       [OpenAI](https://www.openai.com)
//     `;
//     fs.promises.readFile.mockResolvedValue(mockContent);

//     // Chamando a função mdLinks
//     return mdLinks('arquivo.md').then(result => {
//       const expectedLinks = [
//         { href: 'https://www.google.com', text: 'Google', file: 'arquivo.md' },
//         { href: 'https://www.openai.com', text: 'OpenAI', file: 'arquivo.md' }
//       ];
//       expect(result).toEqual(expectedLinks);
//     });
//   });

// });

describe('mdLinks', () => {
  beforeEach(() => {
    fs.readFile = jest.fn();
    fs.readdir = jest.fn();
    fs.stat = jest.fn();
  });

  afterEach(() => {
    fs.readFile.mockRestore();
    fs.readdir.mockRestore();
    fs.stat.mockRestore();
  });

  it('deve retornar links de um arquivo Markdown', () => {
    const mockStat = fs.stat;
    // Mockando fs.promises.stat para retornar stats de arquivo
    mockStat.mockResolvedValue({ isFile: () => true });

    // Mockando fs.promises.readFile para retornar conteúdo de arquivo
    const mockContent = `
      [Google](https://www.google.com)
      [OpenAI](https://www.openai.com)
    `;
    fs.readFile = jest.fn(() => Promise.resolve(mockContent)); // Mock diretamente aqui

    // Chamando a função mdLinks
    return mdLinks('arquivo.md').then(result => {
      const expectedLinks = [
        { href: 'https://www.google.com', text: 'Google', file: 'arquivo.md' },
        { href: 'https://www.openai.com', text: 'OpenAI', file: 'arquivo.md' }
      ];
      expect(result).toEqual(expectedLinks);
    });
  });
});

// describe('mdLinks', () => {
//   const mockReadFile = jest.spyOn(fs.promises, 'readFile');
//   const mockReaddir = jest.spyOn(fs.promises, 'readdir');
//   const mockStat = jest.spyOn(fs.promises, 'stat');

//   beforeEach(() => {
//     mockReadFile.mockReset();
//     mockReaddir.mockReset();
//     mockStat.mockReset();
//   });

//   it('deve retornar links de um arquivo Markdown', () => {
//     // Mockando fs.promises.stat para retornar stats de arquivo
//     mockStat.mockResolvedValue({ isFile: () => true });

//     // Mockando fs.promises.readFile para retornar conteúdo de arquivo
//     const mockContent = `
//       [Google](https://www.google.com)
//       [OpenAI](https://www.openai.com)
//     `;
//     mockReadFile.mockResolvedValue(mockContent);

//     // Chamando a função mdLinks
//     return mdLinks('arquivo.md').then(result => {
//       const expectedLinks = [
//         { href: 'https://www.google.com', text: 'Google', file: 'arquivo.md' },
//         { href: 'https://www.openai.com', text: 'OpenAI', file: 'arquivo.md' }
//       ];
//       expect(result).toEqual(expectedLinks);
//     });
//   });

// });

// describe('mdLinks', () => {
//   it('deve retornar links de um arquivo Markdown', (done) => {
//     // Mocking fs.promises.stat to return mock stats
//     jest.spyOn(fsPromises, 'stat').mockResolvedValue({ isFile: () => true });

//     // Mocking readMarkdownFile to return mock links
//     jest.spyOn(mainModule, 'readMarkdownFile').mockResolvedValue([
//       { href: 'https://example.com', text: 'Example', file: 'test.md', status: 200, ok: 'ok' }
//     ]);

//     mdLinks('./teste.md')
//       .then(result => {
//         expect(result).toEqual([
//           { href: 'https://example.com', text: 'Example', file: 'test.md', status: 200, ok: 'ok' }
//         ]);
//         done();
//       });
//   }, 10000);
// });

// describe('readDirectory', () => {
//   it('deve ler e processar o diretório recursivamente', () => {
//     // Mocking fs.readdir to return mock file list
//     const mockReaddir = jest.spyOn(fs.promises, 'readdir').mockResolvedValue(['file1.md', 'file2.txt', 'subdirectory']);

//     // Mocking fs.stat to return mock values for files and subdirectory
//     const mockStat = jest.spyOn(fs.promises, 'stat');
//     mockStat.mockResolvedValueOnce({ isDirectory: () => false }); // Mock for file1.md
//     mockStat.mockResolvedValueOnce({ isDirectory: () => false }); // Mock for file2.txt
//     mockStat.mockResolvedValueOnce({ isDirectory: () => true });  // Mock for subdirectory

//     // Mocking readMarkdownFile function to return a mock value
//     const mockReadMarkdownFile = jest.spyOn(mainModule, 'readMarkdownFile').mockResolvedValue([]);

//     // Calling the function
//     return mainModule.readDirectory(directoryPath).then(result => {
//       // Asserting expectations
//       expect(result).toEqual([]);
//       expect(mockReaddir).toHaveBeenCalledWith(directoryPath);
//       expect(mockStat).toHaveBeenCalledTimes(3); // Called for each file and subdirectory
//       expect(mockReadMarkdownFile).toHaveBeenCalledTimes(2); // Called for file1.md and file2.txt
//     });
//   });
// });
//     const directoryPath = './test/directory';

//     // Mocking fs.readdir and fs.stat to return expected values
//     const mockReaddir = jest.spyOn(fs, 'readdir').mockResolvedValue(['file1.md', 'subdirectory']);
//     const mockStat = jest.spyOn(fs, 'stat');

//     // Mocking readMarkdownFile function to return a mock value
//     const mockReadMarkdownFile = jest.spyOn(require('../src/main.js'), 'readMarkdownFile').mockResolvedValue([]);

//     // Mocking nested call to readDirectory for subdirectory
//     mockStat.mockResolvedValueOnce({ isDirectory: () => true });
//     mockReaddir.mockResolvedValueOnce(['file2.md']);
//     mockReadMarkdownFile.mockResolvedValueOnce([]);

//     // Calling the function
//     return mainModule.readDirectory(directoryPath).then(result => {
//       // Asserting expectations
//       expect(result).toEqual([]);
//       expect(mockReaddir).toHaveBeenCalledWith(directoryPath);
//       expect(mockStat).toHaveBeenCalledWith(path.join(directoryPath, 'file1.md'));
//       expect(mockStat).toHaveBeenCalledWith(path.join(directoryPath, 'subdirectory'));
//       expect(mockReadMarkdownFile).toHaveBeenCalledWith(path.join(directoryPath, 'file1.md'));
//       expect(mockReadMarkdownFile).toHaveBeenCalledWith(path.join(directoryPath, 'subdirectory', 'file2.md'));

//       // Restoring the mocked functions
//       mockReaddir.mockRestore();
//       mockStat.mockRestore();
//       mockReadMarkdownFile.mockRestore();
//     });
//   });
// })






// Mockando o axios para controlar as respostas
// jest.mock('axios');

// describe('validateLink', () => {
//   it('should resolve with OK status for a valid link', async () => {
//     const link = { href: 'https://example.com' };
//     const response = { status: 200 };

//     axios.head.mockResolvedValue(response);

//     const result = await validateLink(link);

//     expect(result).toEqual({
//       ...link,
//       status: 200,
//       ok: 'ok',
//     });
//   });

//   it('should resolve with FAIL status and error code for an invalid link', async () => {
//     const link = { href: 'https://invalid-link' };
//     const error = { response: { status: 404 } };

//     axios.head.mockRejectedValue(error);

//     const result = await validateLink(link);

//     expect(result).toEqual({
//       ...link,
//       status: 404,
//       ok: 'fail',
//     });
//   });

//   it('should resolve with N/A status for a link without href', async () => {
//     const link = { text: 'No href link' };

//     const result = await validateLink(link);

//     expect(result).toEqual({
//       ...link,
//       status: 'N/A',
//       ok: 'fail',
//     });
//   });
// });




// const mdLinks = require('../src/index.js');

// describe('mdLinks', () => {
//   test('deve retornar um array de links', () => {
//     return mdLinks('src/README.md')
//       .then(links => {
//         expect(Array.isArray(links)).toBe(true);
//         expect(links.length).toBeGreaterThan(0);
        
//       });
//   });

//   test('deve rejeitar a promessa quando o arquivo não tem links', () => {
//     return mdLinks('src/vazio.md')
//       .catch(error => {
//         expect(error.message).toThrow('Erro ao ler o conteúdo do arquivo.'); //Erro ao ler o conteúdo do arquivo.
//       });
//   });

//   test('deve rejeitar a promessa quando o arquivo não é do tipo Markdown', () => {
//     return expect(mdLinks('teste.txt')).rejects.toThrow('Erro ao verificar o arquivo/nome de diretório.');
//   });

//   test('deve rejeitar a promessa quando não consegue ler o conteúdo do arquivo', () => {
//     return mdLinks('../test/teste2.md')
//       .catch(error => {
//         expect(error.message).toBe('Erro ao verificar o arquivo/nome de diretório.'); // Erro ao ler o arquivo. Detalhes: Erro ao verificar o arquivo/nome de diretório.Erro ao verificar o arquivo/nome de diretório.
//       });
//   });


//   test('deve rejeitar a promessa quando o arquivo não é .md', () => {
//     return mdLinks('../test/teste.txt')
//       .catch(error => {
//         expect(error.message).toBe('A rota inserida não é válida.'); //O arquivo não é do tipo Markdown.
//       });
//   });

//   test('deve imprimir mensagem de erro conteúdo inexistente', () => {
//     return mdLinks('caminho/inexistente.md')
//       .catch(error => {
//         expect(error.message).toBe('A rota inserida não é válida.');
//       });
//   });

// });
