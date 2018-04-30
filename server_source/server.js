'use strict';

import 'babel-polyfill';
import express from 'express';
import fs from 'fs';
import http from 'http';
import { resolve } from 'path';

console.log('path to .env: ', resolve('./', '../.env'));

require('dotenv').config({path: resolve('./', '../.env')});

console.log('process.env: ', process.env);

const stripe = require('stripe')(process.env.STRIPE_API_KEY_SECRET_TEST);

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

app.post('/submit-payment', async (req, res, next) => {
  const { token, sku, name, email, phone } = req.body;

  try {
    const order = await stripe.orders.create({
      email: email
      , currency: sku.currency
      , metadata: {
        name: name
        , phone: phone
      }
      , items: [
        {
          type: 'sku'
          , parent: sku.id
        }
      ]
    });

    console.log('token: ', token, token.livemode, (token.livemode ? token.id : 'tok_visa'));
    console.log('res: ', {
      source: ((token.livemode === true) ? token.id : 'tok_visa')
    });

    const paidOrder = await stripe.orders.pay(order.id, {
      source: ((token.livemode === true) ? token.id : 'tok_visa')
    });

    console.log('success: ', paidOrder);

    const fulfilledOrder = await stripe.orders.update(order.id, {
      status: 'fulfilled'
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ fulfilledOrder, paidOrder })).status(200).end();
  } catch (error) {
    console.log('failure: ', error);

    res.setHeader('Content-Type', 'application/json');
    res.status(error.statusCode, http.STATUS_CODES[error.statusCode]).end(JSON.stringify(error.code));
    // res.send(JSON.stringify(error)).status(error.statusCode).end();
  }
});

app.post('/order', async (req, res, next) => {
  const { token, sku, phone, name } = req.body;

  try {
    const order = await stripe.orders.create({
      email: token.email
      , currency: sku.currency
      , metadata: {
        name: name
        , phone: phone
      }
      , items: [
        {
          type: 'sku'
          , parent: sku.id
        }
      ]
    });

    const paidOrder = await stripe.orders.pay(order.id, {
      source: (token.livemode ? token.id : 'tok_visa')
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
  stripe.charges.create({
    amount: sku.price
    , currency: sku.currency
    , description: 'Мастеркласс'
    , source: (token.livemode ? token.id : 'tok_visa')
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

export default app;
