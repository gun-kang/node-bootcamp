const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

//// FILES

// // Synchronous Code
// const textInput = fs.readFileSync('./txt/input.txt', 'utf-8');
// const textOutput = `This is what we know: ${textInput}.\nCreated on ${Date().toString()}`;
// fs.writeFileSync('./txt/output.txt', textOutput);
// console.log('File successfully written');

// // Asynchronous Code
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, (err) => {
//         console.log('File successfully written');
//       })
//     })
//   })
// });
// console.log('Reading new file');

//// SERVER

const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8'); // Load data in at start
const dataObj = JSON.parse(data); // Parse String data as JSON, if needed to be passed as on object
const slugs = dataObj.map((ele) => slugify(ele.productName, {lower : true}));

// This defines a server with a callback function that describes the behavior
const server = http.createServer((req, res) => {

  const { query, pathname } = url.parse(req.url, true); // Get the query + request URL

  // Overview
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {'Content-type' : 'text/html'}); // Allows for parsing response as HTML
    const cardsHTML = dataObj.map((ele) => replaceTemplate(tempCard, ele)).join(); // Generate card for each element
    const output = tempOverview.replace(/{%CARDS%}/g, cardsHTML); // Put cards into root html
    res.end(output);

  // Products
  } else if (pathname === '/product') {
    res.writeHead(200, {'Content-type' : 'text/html'}); 
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

  // API
  } else if (pathname === '/api') {
    // // Move to a synchronous version outside createServer. If data doesn't need to be refreshed, just load once.
    // fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data) => { // Open file
    //   res.writeHead(200, {'Content-type' : 'application/json'}); // Handles conversion to JSON without .parse
    //   res.end(data);
    // });
    res.writeHead(200, {'Content-type' : 'application/json'}); // Handles conversion to JSON without .parse
    res.end(data);

  // Not found
  } else {
    res.writeHead(404, {
      'Content-type' : 'text/html'
    });
    res.end('<h1>Page Not Found</h1>');
  }
});

// This toggles to server on to start listening to requests from a specific port
const port = 8000;
server.listen(port, '127.0.0.1', () => {
  console.log(`Listening to requests on port ${port}`);
});