'use strict';

import 'babel-polyfill';
import express from 'express';
import fs from 'fs';
import http from 'http';
import {resolve} from 'path';
import MailChimpSubscriber from './MailChimpSubscriber';
import cookieParser from 'cookie-parser';
import https from 'https'; 
import url from 'url';
import request from 'request';

require('dotenv').config({path: resolve('./', '../.env')});

const stripe = require('stripe')(process.env.STRIPE_API_KEY_SECRET_TEST);

const bodyParser = require('body-parser');
const app = express()
  , PORT = process.env.PORT || 3004;

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(cookieParser());

app.post('/validate', async (req, res, next) => {
  try {
    const certPath = resolve(__dirname, '../../../apple/merchant_identity_cert.pem');
    const keyPath = resolve(__dirname, '../../../apple/applepaytls.key');
    const { validationURL } = req.body;
    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);
    const options = {
      uri: `${validationURL}/paymentSession`,
      method: 'POST', 
      "headers": {
        "Content-Type": "application/json",
      },
      key,
      cert,
      body:{
        merchantIdentifier: 'merchant.moto.courses',
        displayName: 'MotoCourses',
        initiative: 'web',
        initiativeContext: 'moto.courses', 
      },
      json: true,
    };
    
    let response = '';
    request.post(options, function (error, response, body) {
      console.log('inner error:', error); 
      console.log('inner statusCode:', response && response.statusCode); 
      console.log('inner body:', body); 
    }).on('error', function(err) {
      console.log(err)
    });
    
  } catch (error) {
    console.warn('error on merchant verification: ', error);
  }
});

app.post('/bak', async (req, res, next) => {
  try {
    const certPath = resolve(__dirname, '../../../apple/merchant_identity_cert.pem');
    const keyPath = resolve(__dirname, '../../../apple/applepaytls.key');
    const { validationURL } = req.body;
    const appleURL = url.parse(`${validationURL}/paymentSession`);
    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);
    const options = {
      protocol: 'https:',
      url: `${validationURL}/paymentSession`,
      hostname: appleURL.hostname,
      path: appleURL.path,
      method: 'POST', 
      "headers": {
        "Content-Type": "application/json",
      },
      key,
      cert,
      body:{
        merchantIdentifier: 'merchant.moto.courses',
        displayName: 'Moto Courses',
        initiative: 'web',
        initiativeContext: 'moto.courses', 
      },
      json: true,
    }; 
    
    const POSTJSONString = JSON.stringify({
      merchantIdentifier: 'merchant.moto.courses',
      displayName: 'Moto Courses',
      initiative: 'web',
      initiativeContext: 'moto.courses', 
    });
    const HTTPBody = Buffer.from(POSTJSONString, "utf8");
    
    console.warn('options: ', options);
    
    const appleRequest = https.request(options, function(appleResponce) {
      console.log("statusCode: ", appleResponce.statusCode);
      console.log("headers: ", appleResponce.headers);
      let response = '';
    	appleResponce.on('data', function(data){
        response += data;
    	});
      
      appleResponce.on('end', function(){
        console.warn('response.toString: ', response.toString());
    		res.send(JSON.stringify(response));
      });
    });
    appleRequest.on('error', (err) => {
      console.error('ERROR failed to login into website', err);
      res.send(err.message);
    });
    appleRequest.write(HTTPBody);
    appleRequest.end();
    
  } catch (error) {
    console.warn('error on verification: ', error);
  }

});

app.post('/submit-payment', async (req, res, next) => {
  const {token, sku, name, email, phone, subscription} = req.body;

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

    if (subscription) {
      const chimp = new MailChimpSubscriber(
        process.env.MAILCHIMP_API_KEY_SECRET,
        process.env.MAILCHIMP_API_URL
      );
      chimp.subscribe(email, process.env.MAILCHIMP_LIST);
    }

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
    res.send(JSON.stringify({fulfilledOrder, paidOrder})).status(200).end();
  } catch (error) {
    console.log('failure: ', error);

    res.setHeader('Content-Type', 'application/json');
    res.status(error.statusCode, http.STATUS_CODES[error.statusCode]).end(JSON.stringify(error.code));
  }
});

app.post('/order', async (req, res, next) => {
  const {token, sku, phone, name, email, subscription} = req.body;
  console.log('order 1');
  try {
    console.log('order 2');
    const order = await stripe.orders.create({
      email: email || token.email
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
    
    console.log('order 3');

    if (subscription && (email || token.email)) {
      console.log('order 4');
      const chimp = new MailChimpSubscriber(
        process.env.MAILCHIMP_API_KEY_SECRET,
        process.env.MAILCHIMP_API_URL
      );
      chimp.subscribe((email || token.email), process.env.MAILCHIMP_LIST);
    }
    
    console.log('order 5');

    const paidOrder = await stripe.orders.pay(order.id, {
      source: (token.livemode ? token.id : 'tok_visa')
    });
    
    console.log('order 6');

    const fulfilledOrder = await stripe.orders.update(order.id, {
      status: 'fulfilled'
    });
    
    console.log('order 7');

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(fulfilledOrder)).status(200).end();
  } catch (error) {
    console.log('order error');
    res.setHeader('Content-Type', 'application/json');
    res.status(error.statusCode, http.STATUS_CODES[error.statusCode]).end(`{"${http.STATUS_CODES[error.statusCode]}": "${error.message}"}`);
  }
});

app.post('/charge', async (req, res, next) => {
  const {token, sku} = req.body;
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

app.use(express.static(`${__dirname}/../build`));

app.listen(PORT, () => {
  console.log('Server listening on', PORT);
});

export default app;
