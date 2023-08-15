const mdLinks = require('./main');


mdLinks('README.md')
  .then(links => {
    console.log('Links encontrados:', links);
  })
  .catch(err => {
    console.error('Erro:', err);
  })

module.exports = mdLinks;