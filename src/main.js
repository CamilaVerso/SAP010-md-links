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
							return readDirectory(fullPath);
						} else if (['.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text'].includes(path.extname(file))) {
							return readMarkdownFile(fullPath);
						}
						return [];
					});
			});

			return Promise.all(filePromises)
				.then(fileLinks => fileLinks.flat());
		});
}

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
