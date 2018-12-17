var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var fs = require('fs');
var os = require('os');
var Tesseract = require('tesseract.js');

var app = express();

app.get('/', function(req, res) {
//	var url = req.query.url;
	
	var basestr = req.query.str;
	
	var str = Buffer.from(basestr , 'base64');
	
		Tesseract.recognize(str, {
			lang: 'por'
		})
		.progress(function(p) {
			console.log('progress', p);
		})
		.catch(err => console.error(err))
		.then(function(result) {

			var texts = result.text.split("\n");
			console.log(texts);

			var medInfo = "";
			
			for (var i = 0; i < texts.length; i++) {
				drugCheck(texts[i], function(resp) {

					console.log("text");

					if (resp.length > medInfo.length) {
						medInfo = resp;
					}
				});
			}

			res.send(medInfo);
});

function drugCheck(drug, callback) {
	var urlMed = "https://consultaremedios.com.br/" + drug + "/p";

	request(urlMed, function(error, response, body) {
		if (!error) {
			var $ = cheerio.load(body);

			var name = $('h1.product-header__title').text();
			var price = parseFloat($('div.product-block__starting-price-value').text().split(' ')[0].replace('R$', '').replace(',', '.'));
			var use_steps = $('#dosage-collapse').find('ol').text().replace(/(\r\n|\n|\r)/gm, '').split('.');
			var risks = $('#risks-collapse').find('p').text();

			cheerioTableparser($);
			var posology_table = $('table').parsetable(true, true, true);

			console.log('drug: ' + drug);
			console.log('price: R$' + price);
			console.log('use_steps: ' + use_steps);
			console.log('posology_table: ' + posology_table);
			console.log('risks: ' + risks);

			var obj = {
				name: name,
				price: price,
				use_steps: use_steps,
				posology_table: posology_table,
				risks: risks,
			};
			callback(obj);
		} else {
			console.log("We’ve encountered an error: " + error);
		}
	});
 }
});

// var server = app.listen(process.env.PORT || port, function() {

// 	var host = server.address().address;
// 	var port = server.address().port;

// 	console.log("Example app listening at http://%s:%s", host, port);
// });

// var server = app.listen(8080, function() {

// 	var host = server.address().address;
// 	var port = server.address().port;

// 	console.log("Example app listening at http://%s:%s", host, port);
// });


server.listen(process.env.PORT || port);