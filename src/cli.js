#!/usr/bin/env node

const path = require('path');
const { mdLinks } = require('./main');

const args = process.argv.slice(2);

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
			const broken = links.filter(link => link.ok === 'fail').length;
			const infoBroken = options.validate ? `Links quebrados: ${broken}`: '';
			console.log(`Total de links: ${totalLinks}`);
			console.log(`Links únicos: ${uniqueLinks}`);
			console.log(`${infoBroken}`);
		} else {
			links.forEach(link => {
				const statusInfo = options.validate ? `Status: ${link.status}` : '';
				const Ok = options.validate ? `Ok: ${link.ok === 'ok' ? 'OK' : 'FAIL'}`: '';
				console.log(`href: ${link.href}`);				
				console.log(`Texto: ${link.text}`);
				console.log(`Arquivo: ${link.file}`);
				console.log(`${ statusInfo }`);
				console.log(`${ Ok }`);
				console.log('-----');
			});
		}
	}).catch(err => {
		console.error('Erro:', err.message);
	});
} else {
	console.error('Uso: md-links <path-to-file> [--validate] [--stats]');
}