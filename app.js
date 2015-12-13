//make all object with the same category;
var cheerio = require("cheerio");
var Promise = require("bluebird");
var request = require("request");
var helper = require("./helper.js");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var fs = require("fs");

/*
	objschema = {
		category: "",
		promotions: [
			{
				title:"",
				exp:"",
				detail_link:""
			}
		],
		promotions_details: [
			{
				image:"",
				TNC: []
			}
		]
	}
*/


helper.getLink("http://m.bnizona.com/index.php/category/index/promo").then(function(cat_w_link) {
	var arr = [];
	var current_category_index = 0;
	var idx = 0;
	cat_w_link.map(function(item, index){
		helper.getTitle_N_Date(item.link).then(function(title_date_link){
			objschema = {
				"category": "",
				"promotions": []
			};
			var current_idx = idx;
			objschema.category = item.category;
			objschema.promotions = title_date_link;
			idx++;

			//check if category has changed
			if(idx !== current_idx){
				arr.push(objschema);
			}

			//check if it has finished looping for all promo for all category
			if(arr.length === cat_w_link.length){
				eventEmitter.emit("cat_title_expdate");	
			}
		});
	});
		
	return new Promise(function(resolve, reject){
		eventEmitter.on("cat_title_expdate", function(){
			resolve(arr);
		});
	});
})

//get object with category, title, expire_date
.then(function(cat_title_expdate){
	var idx = 0;
	var current_category_index = 0;
	var arr = [];


	cat_title_expdate.map(function(obj, cat_index){
		obj.promotions.map(function(promo, promo_index){
			helper.getTnc_N_Image(promo.detail_link
				).then(function(item){
				current_category_index = idx;
				promo.image = item.image;
				promo.tnc = item.tnc__array;
				//console.log(promo)

				idx++;

				//check if has loop to all promo
				if(current_category_index !== cat_index){
				 	//if it has loop nth times as children of promos
					if( promo_index+1 === obj.promotions.length){
						arr.push(obj)
					}
				}

				//check if it has finished looping for all promo for all category
				if(arr.length === cat_title_expdate.length){
					eventEmitter.emit("finalObject");	
				}	
			});
		});
	});

	return new Promise(function(resolve, reject){
		eventEmitter.on("finalObject", function(){
			resolve(arr);
		});
	});

})

//get the final object
.then(function(finalObject) {
	var jsonObj = JSON.stringify(finalObject);
	console.log(jsonObj);
	fs.writeFile('./bni_scarp.json', jsonObj, function (err) {
	    if (err) return console.log(err);
	    console.log("FINISHED CREATE JSON FILE")
	});
})