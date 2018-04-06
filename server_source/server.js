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

app.post('/charges', async (req, res, next) => {
  const token = req.body.token;
  const sku = req.body.skusku;
  console.log(req.body);

  try {
    const order = await stripe.orders.create({
      currency: sku.currency
      , items: [
        {
          type: 'sku'
          , parent: sku.id
        }
      ]
    });

    console.log('order: ', order);
    const paidOrder = await stripe.orders.pay(order.id, {
      source: token
    });

    console.log('order paid: ', paidOrder);
    const fulfilledOrder = stripe.orders.update(order.id, {
      status: 'fulfilled'
    });

    console.log('order fulfilled: ', fulfilledOrder);
  } catch (error) {
    console.error('order fail: ', error);
  }

  // stripe.charges.create({
  //   amount: sku.price
  //   , currency: sku.currency
  //   , description: 'Мастеркласс'
  //   , source: token
  // }, function (error, charge) {
  //   if (error === null) {
  //     res.setHeader('Content-Type', 'application/json');
  //     res.send(JSON.stringify(charge)).status(200).end();
  //   } else {
  //     res.setHeader('Content-Type', 'application/json');
  //     res.status(error.statusCode, error.message).end(http.STATUS_CODES[error.statusCode]);
  //   }
  // });
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
  // res.send('жирожоп');
  // res.status(201).end(http.STATUS_CODES[201]);
//  next();
  stripe.skus.retrieve(
    'sku_CckkugPVHUWbpZ', function (error, sku) {
      if (error === null) {
        // res.send('жирожоп');
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
