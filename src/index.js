const mdLinks = require('./main');
const validate = true; 

mdLinks('arquivos', validate)
  .then(links => {
    console.log('Links encontrados:', links);
  })
  .catch(err => {
    console.error('Erro:', err);
  });

// const validate = require('./main');
// const mdLinks = require('./main');


// mdLinks('diretorio', validate)
//   .then(links => {
//     console.log('Links encontrados:', links);
//   })
//   .catch(err => {
//     console.error('Erro:', err);
//   })

// module.exports = mdLinks;