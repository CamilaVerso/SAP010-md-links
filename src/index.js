const validate = require('./main');
const mdLinks = require('./main');


mdLinks('README.md', validate)
  .then(links => {
    console.log('Links encontrados:', links);
  })
  .catch(err => {
    console.error('Erro:', err);
  })

module.exports = mdLinks;