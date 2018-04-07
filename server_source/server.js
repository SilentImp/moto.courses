'use strict';

import 'babel-polyfill';
import express from 'express';
import fs from 'fs';
import http from 'http';
// import https from 'https';

require('dotenv').config({path: '../.env'});

// const options = {
//   key: fs.readFileSync('./localhost.key')
//   , cert: fs.readFileSync('./localhost.crt')
// };

const stripe = require('stripe')(process.env.STRIPE_API_KEY_SECRET);

const bodyParser = require('body-parser');
const app = express()
  , PORT = process.env.PORT || 3004;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

// Set crossorigin headers
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.post('/order', async (req, res, next) => {
  const { token, sku } = req.body;

  try {
    const order = await stripe.orders.create({
      email: token.email
      , currency: sku.currency
      , items: [
        {
          type: 'sku'
          , parent: sku.id
        }
      ]
    });

    const paidOrder = await stripe.orders.pay(order.id, {
      source: token.livemode ? token.id : 'tok_visa',
    });

    const fulfilledOrder = await stripe.orders.update(order.id, {
      status: 'fulfilled'
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(fulfilledOrder)).status(200).end();
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.status(error.statusCode, http.STATUS_CODES[error.statusCode]).end(`{"${http.STATUS_CODES[error.statusCode]}": "${error.message}"}`);
  }

});


app.post('/charge', async (req, res, next) => {
  const { token, sku } = req.body;
  console.log(token, sku);
  
  stripe.charges.create({
    amount: sku.price
    , currency: sku.currency
    , description: 'Мастеркласс'
    , source: token.livemode ? token.id : 'tok_visa',
    , metadata: {
      email: token.email
    }
  }, function (error, charge) {
    if (error === null) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(charge)).status(200).end();
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(error.statusCode, http.STATUS_CODES[error.statusCode]).end(`{"${http.STATUS_CODES[error.statusCode]}": "${error.message}"}`);
    }
  });
  
});

app.head('/cache/', function (req, res, next) {
  fs.stat('../../moto.courses', function (err, stats) {
    if (stats !== undefined) {
      res.setHeader('Last-modified', stats.mtime.getTime());
    } else {
      res.setHeader('Last-modified', 0);
    }
    res.status(200).end(http.STATUS_CODES[200]);
  });
});

app.get('/skus', function (req, res, next) {
  stripe.skus.retrieve(
    'sku_CckkugPVHUWbpZ', 
    (error, sku) => {
      if (error === null) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(sku)).status(200).end();
      } else {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        res.status(error.statusCode, error.message).end(http.STATUS_CODES[error.statusCode]);
      }
    }
  );
});

// Load static
app.use(express.static(`${__dirname}/../build`));

// Listen for requests
app.listen(PORT, () => {
  console.log('Server listening on', PORT);
});

// https.createServer(options, app).listen(PORT, function () {
//   console.log('Express server listening on port ' + PORT);
// });

export default app;
