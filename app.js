var http           = require('http'),
  express          = require('express'),
  path             = require('path'),
  MongoClient      = require('mongodb').MongoClient,
  Server           = require('mongodb').Server,
  parser           = require('body-parser'),
  CollectionDriver = require('./collectionDriver').mongoWrapper;

var app = express();

var mongoHost = 'localHost';
var mongoPort = 27017; 
var mongoWrapper;

var mongoClient = new MongoClient(new Server(mongoHost, mongoPort));

mongoClient.connect("mongodb://127.0.0.1/nodejs-shop", function(err, mongoClient) {
  if (!mongoClient) {
      console.error("Error! Datbase connection failed.");
      process.exit(1);
  }
  var db = mongoClient.db("node_shop"); 
  mongoWrapper = new CollectionDriver(db);
});


app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.status(200).send("<html><body><p>Welcome to sShop 1.1</p></body></html>");
});

app.get('/products', function(req, res) {
    mongoWrapper.findAll("md_products", function(err, colRes) {
  		if (err) {
        res.status(400).send(error);
      } else { 
        var response = [{'status':'success', 'data':colRes}];
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
  		}
   	});
});

app.post('/product/add', function(req, res) {
    var object = req.body;

    mongoWrapper.save('md_products', object, function(err, colRes) {
      if (err) {
        res.status(400).send(error);
      } else {
        var response = [{'status':'success', 'data':colRes}];
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
      }
   });
});

app.put('/product/update/:id', function(req, res) {
    var id = req.params.id, object = req.body;
    if (id) {
      mongoWrapper.update('md_products', object, id, function(err, colRes) {
        if (err) {
          res.status(400).send(error);
        } else {
          var response = [{'status':'success', 'data':colRes}];
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify(response));
        }
     });
    } else {
      var response = [{'status':'error', error: 'Invalid request', url: req.url}];
      res.status(400).send(JSON.stringify(response));
    }
});

app.delete('/product/delete/:id', function(req, res) {
    var id = req.params.id;
    if (id) {
       mongoWrapper.delete('md_products', id, function(error, colRes) {
          if (error) {
            res.status(400).send(error);
          } else {
            var response = [{'status':'success', 'data' : colRes}];
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
          }
       });
    } else {
      res.status(400).send({error: 'Invalid request', url: req.url});
    }
});

app.get('/product/:id', function(req, res) {
    var id = req.params.id;
    if (id) {
       mongoWrapper.get('md_products', id, function(error, colRes) {
          if (error) {
            res.status(400).send(error);
          } else {
            var response = [{'status':'success', 'data':colRes}];
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
          }
       });
    } else {
      res.status(400).send({error: 'Invalid request', url: req.url});
    }
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

// Create server
http.createServer(app).listen(app.get('port'), function(){
	console.log('Server listening on port ' + app.get('port'));
});