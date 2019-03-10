//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// All the server logic both the http and htppd 
const serverConfiguration =   (req, res) => {
  
  // Get the URL and parse it.
  let parsedUrl = url.parse(req.url, true)

  // Get the path.
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/\/+|\/+$/g,'');

  // Get the query string as an object
  let queryStringObject = parsedUrl.query; 

  // Get the http method
  let method = req.method.toLowerCase();

  // Get the headers as an object 
  let headers = req.headers;

  // Get the payload, if any
  let decoder = new StringDecoder('utf-8');
  let buffer  = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    //Choose the handler this request should go. If one is not found use the not found handler
    let chosenHandler  = typeof(router[trimmedPath]) !== 'undefined'? 
      router[trimmedPath] : 
      handlers.notFound;

    // Construct the data object to send to the handler.
    let data = {
      trimmedPath, 
      queryStringObject,
      method,
      headers,
      payload: buffer
    }

    // Route the request to the handler specified in the router.
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler or default use 200
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      
      // Use the payload called back to the handler or default the empty object
      payload = typeof(payload) === 'object' ? payload : {}

      // Convert the payload to string
      let payloadString = JSON.stringify(payload); 

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the response.
      console.log('Returning this response: ' , statusCode, payloadString);
    });

  });
 
}


// Instantiate the servers
let httpServer = http.createServer(serverConfiguration);


//Start the servers
let httpPort  = 3000;
httpServer.listen(httpPort, ()=> {
  console.log(`The http server is listening on port ${httpPort}`);
}); 


// Define handlers.
let handlers = {};

//ping handler
handlers.hello = (data, callback) => {
  data.method === 'post' ? callback(200, {greeting: 'Hello to you, sweetie'}) :
    callback(405)
}


// Not found handler
handlers.notFound = (data, callback) => {
  callback(404)
}

// Define a request router.
let router = {
  'hello': handlers.hello
}