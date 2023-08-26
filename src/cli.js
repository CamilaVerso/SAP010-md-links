#!/usr/bin/env node

const path = require('path');
const { mdLinks } = require('./main');

const args = process.argv.slice(2); // remove os 2 primeiros argumentos e me retorna só o caminho

const options = {
	validate: args.includes('--validate'),
	stats: args.includes('--stats')
};

const pathArg = args.find(arg => !arg.startsWith('--'));

if (pathArg) {
	const absolutePath = path.resolve(pathArg);
	mdLinks(absolutePath, options.validate).then(links => {
		if (options.stats) {
			const totalLinks = links.length;
			const uniqueLinks = new Set(links.map(link => link.href)).size;
			// const broken = calculateBrokenLinks().length;
			const broken = links.filter(link => link.ok === 'fail').length;
			console.log(`Total de links: ${totalLinks}`);
			console.log(`Links únicos: ${uniqueLinks}`);
			console.log(`Links quebrados: ${broken}`);
		} else {
			links.forEach(link => {
				console.log(`href: ${link.href}`);
				console.log(`Text: ${link.text}`);
				console.log(`File: ${link.file}`);
				console.log(`Status: ${link.status}`);
				console.log(`Ok: ${link.ok}`);
				console.log('---');
			});
		}
	}).catch(err => {
		console.error('Erro:', err.message);
	});
} else {
	console.error('Uso: md-links <path-to-file> [--validate] [--stats]');
}
// const statusInfo = options.validate ? `[${link.ok === 'ok' ? 'OK' : 'FAIL'} ] ${link.status}` : '';
				


				// console.log(`${link.href} ${statusInfo}`);
				// console.log(`Arquivo: ${link.file}`);
				// console.log(`Texto: ${link.text}`);
				// console.log('---');