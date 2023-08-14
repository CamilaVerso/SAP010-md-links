const fs = require('fs').promises;
const path = require('path');


function mdLinks(filePath) {
	return new Promise((resolve, reject) => {
		const absolutePath = path.resolve(filePath); // transforma a rota em absoluta

		fs.stat(absolutePath) // Verifica se o caminho existe
			.then((stats) => {
				if (stats.isFile() && ['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'].includes(path.extname(absolutePath))) {
					// O arquivo é Markdown

					fs.readFile(absolutePath, 'utf8') // lê o arquivo 
						.then((content) => {
							const regex = /\[([^[\]]+)\]\((https?:\/\/[^\s/$.?#].[^\s]*)\)/g;
							const matches = content.match(regex); // encontra o link

							if (matches) {
								const links = matches.map((match) => {
									const href = match.replace(regex, '$2').trim();
									const text = match.replace(regex, '$1').trim();
									return { href, text };
								});

								resolve(links);
							} else {
								resolve([]);
							}
						})
						.catch((error) => {
							reject(new Error('Erro ao ler o conteúdo do arquivo.'));
						});
				} else {
					reject(new Error('O arquivo não é do tipo Markdown.'));
				}
			})
			.catch((error) => {
				reject(new Error('A rota inserida não é válida.'));
			});
	});
}



module.exports = mdLinks;