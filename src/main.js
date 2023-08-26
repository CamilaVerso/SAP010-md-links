const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

function validateLink(link) {
	return axios.head(link.href)
		.then(response => ({
			...link,
			status: response.status,
			ok: response.status >= 200 && response.status < 400 ? 'ok' : 'fail',
		}))
		.catch(error => ({
			...link,
			status: error.response ? error.response.status : 'N/A',
			ok: 'fail',
		}));
}

function extractLinks(content, filePath) {
	const regex = /\[([^[\]]+)\]\((https?:\/\/[^\s/$.?#].[^\s]*)\)/g;
	const matches = content.match(regex);
	if (!matches) {
		return [];
	}
	return matches.map((match) => {
		const href = match.replace(regex, '$2').trim();
		const text = match.replace(regex, '$1').trim();
		return { href, text, file: filePath };
	});
}

function readMarkdownFile(absolutePath) {
	return fs.readFile(absolutePath, 'utf8')
		.then(content => {
			const links = extractLinks(content, absolutePath);
			if (links.length === 0) {
				console.log('Nenhum link encontrado no arquivo.');
			}
			return links;
		})
		.catch((error) => {
			console.error(`Erro ao ler o arquivo. Detalhes: ${error.message}`);
			return [];
		});
}

// function readMarkdownFile(absolutePath) {
// 	return fs.readFile(absolutePath, 'utf8')
// 		.then(content => extractLinks(content, absolutePath))
// 		.catch(() => []);
// }

function validateMarkdownLinks(links) {
	const linkPromises = links.map(link => validateLink(link));
	return Promise.all(linkPromises);
}

function readDirectory(directoryPath) {
	return fs.readdir(directoryPath)
		.then(files => {
			const filePromises = files.map(file => {
				const fullPath = path.join(directoryPath, file);
				return fs.stat(fullPath)
					.then(stats => {
						if (stats.isDirectory()) {
							// Se for um diretório, chama readDirectory recursivamente
							return readDirectory(fullPath);
						} else if (['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'].includes(path.extname(file))) {
							return readMarkdownFile(fullPath);
						}
						return []; // Retorna um array vazio para outros tipos de arquivos
					});
			});

			return Promise.all(filePromises)
				.then(fileLinks => fileLinks.flat());
		});
}

// function readDirectory(directoryPath) {
// 	return fs.readdir(directoryPath)
// 		.then(files => {
// 			const mdFiles = files.filter(file => ['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'].includes(path.extname(file)));
// 			const filePromises = mdFiles.map(mdFile => readMarkdownFile(path.join(directoryPath, mdFile))); // aqui estou unindo as rotas
// 			return Promise.all(filePromises)
// 				.then(fileLinks => fileLinks.flat());
// 		});
// }

// function calculateBrokenLinks(links) {
// 	const brokenLinksCount = links.filter(link => link.ok === 'fail').length;
// 	return brokenLinksCount;
// }

function mdLinks(filePath, validate = false) {
	const absolutePath = path.resolve(filePath);

	return fs.stat(absolutePath)
		.then((stats) => {
			if (stats.isDirectory()) {
				return readDirectory(absolutePath)
					.then((links) => {
						if (validate) {
							return validateMarkdownLinks(links);
						} else {
							return links;
						}
					});
			} else if (stats.isFile() && ['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'].includes(path.extname(absolutePath))) {
				return readMarkdownFile(absolutePath)
					.then((links) => {
						if (validate) {
							return validateMarkdownLinks(links);
						} else {
							return links;
						}
					});
			} else {
				throw new Error('O arquivo/nome de diretório não é válido.');
			}
		})
		.catch(() => {
			throw new Error('Erro ao verificar o arquivo/nome de diretório.');
		});
}

module.exports = { mdLinks, validateLink, extractLinks, readMarkdownFile, readDirectory, validateMarkdownLinks };

// function mdLinks(filePath, validate = false) {
// 	const absolutePath = path.resolve(filePath);

// 	return fs.stat(absolutePath)
// 		.then((stats) => {
// 			console.log('Stats:', stats);
// 			if (stats.isFile() && ['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'].includes(path.extname(absolutePath))) {
// 				console.log('É um arquivo .md:', absolutePath);
// 				return readMarkdownFile(absolutePath)
// 					.then((links) => {
// 						if (validate) {
// 							return validateMarkdownLinks(links);
// 						} else {
// 							return links;
// 						}
// 					});
// 			} else {
// 				console.log('Não é um arquivo .md:', absolutePath);
// 				throw new Error('O arquivo não é do tipo Markdown.');
// 			}
// 		})
// 		.catch((error) => {
// 			throw new Error('A rota inserida não é válida.');
// 		});
// }

// module.exports = mdLinks;


// const fs = require('fs').promises;
// const path = require('path');
// const axios = require('axios');

// function mdLinks(filePath, validate = false) {
// 	return new Promise((resolve, reject) => {
// 		const absolutePath = path.resolve(filePath);

// 		fs.stat(absolutePath)
// 			.then((stats) => {
// 				if (stats.isFile() && ['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'].includes(path.extname(absolutePath))) {
// 					fs.readFile(absolutePath, 'utf8')
// 						.then((content) => {
// 							const regex = /\[([^[\]]+)\]\((https?:\/\/[^\s/$.?#].[^\s]*)\)/g;
// 							const matches = content.match(regex);

// 							if (matches) {
// 								const links = matches.map((match) => {
// 									const href = match.replace(regex, '$2').trim();
// 									const text = match.replace(regex, '$1').trim();
// 									return { href, text, file: absolutePath };
// 								});

// 								if (!validate) {
// 									resolve(links);
// 								} else {
// 									const linkPromises = links.map(link => {
// 										return axios.head(link.href)
// 											.then(response => ({
// 												...link,
// 												status: response.status,
// 												ok: response.status >= 200 && response.status < 400 ? 'ok' : 'fail',
// 											}))
// 											.catch(error => ({
// 												...link,
// 												status: error.response ? error.response.status : 'N/A',
// 												ok: 'fail',
// 											}));
// 									});

// 									Promise.all(linkPromises)
// 										.then(validatedLinks => {
// 											resolve(validatedLinks);
// 										})
// 										.catch(error => {
// 											reject(new Error('Erro ao validar os links.'));
// 										});
// 								}
// 							} else {
// 								resolve([]);
// 							}
// 						})
// 						.catch((error) => {
// 							reject(new Error('Erro ao ler o conteúdo do arquivo.'));
// 						});
// 				} else {
// 					reject(new Error('O arquivo não é do tipo Markdown.'));
// 				}
// 			})
// 			.catch((error) => {
// 				reject(new Error('A rota inserida não é válida.'));
// 			});
// 	});
// }

// module.exports = mdLinks;

// const fs = require('fs').promises;
// const path = require('path');


// function mdLinks(filePath) {
// 	return new Promise((resolve, reject) => {
// 		const absolutePath = path.resolve(filePath); // transforma a rota em absoluta
		
// 		fs.stat(absolutePath) // Verifica se o caminho existe
// 			.then((stats) => {
// 				if (stats.isFile() && ['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'].includes(path.extname(absolutePath))) {
// 					// O arquivo é Markdown

// 					fs.readFile(absolutePath, 'utf8') // lê o arquivo 
// 						.then((content) => {
// 							const regex = /\[([^[\]]+)\]\((https?:\/\/[^\s/$.?#].[^\s]*)\)/g;
// 							const matches = content.match(regex); // encontra o link

// 							if (matches) {
// 								const links = matches.map((match) => {
// 									const href = match.replace(regex, '$2').trim();
// 									const text = match.replace(regex, '$1').trim();
// 									return { href, text, file: absolutePath }; // incluir aqui o item file
// 								});

// 								resolve(links);
// 							} else {
// 								resolve([]);
// 							}
// 						})
// 						.catch((error) => {
// 							reject(new Error('Erro ao ler o conteúdo do arquivo.'));
// 						});
// 				} else {
// 					reject(new Error('O arquivo não é do tipo Markdown.'));
// 				}
// 			})
// 			.catch((error) => {
// 				reject(new Error('A rota inserida não é válida.'));
// 			});
// 	});
// }



// module.exports = mdLinks;