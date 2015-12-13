var request = require("request");
var cheerio = require("cheerio");
var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"));

var ObjectSize = function(obj){
	var size = 0
	var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

var iterate = function(item){
    var args = Array.prototype.slice.call(arguments, 1);
	var arr = [];
	if(args.length == 1){
		item.each(function(index, item){
		 	arr.push(item[args[0]]);
		});
		return arr;
	} 
	if (args.length == 2){
		item.each(function(index, item){
		 	arr.push(item[args[0]][args[1]]);
     	});
		return arr;
	}
	if (args.length == 3){
		item.each(function(index, item){
		 	arr.push(item[args[0]] [args[1]] [args[2]]);
     	});
		return arr;
	}
};
var getLink = function(url){
	return new Promise(function(resolve, reject){
		request.getAsync(url)
               .then(function(data) {
				   	var $ = cheerio.load(data.body);
				   	var ul_child = $("ul.menu li a");
					var link = iterate(ul_child, "attribs","href");

					var arr = link.map(function(url, index){
						return {
							category: ul_child[index].children[0].data,
							link: url
						}
					});	
					// var temp_arr = [];
					// temp_arr.push(arr[15]);
					// temp_arr.push(arr[1]);
                    resolve(arr)
               })
               .catch (function(e) {
                   resolve(e)
               })
	})
}

var getTitle_N_Date = function(url){
	return new Promise(function(resolve, reject){
		request.getAsync(url)
		       .then(function(data){
					var $ = cheerio.load(data.body);
					var title__arr = iterate($(".promo-title"), "children");
					var expire__arr = iterate($(".valid-until"), "children");
					var link = $(".list2 li a");
					//make an array with title, to get it's length
			        var result_arr = title__arr.map(function(title){
			        	return {title : title[0].data}
			        });
			        result_arr.map(function(obj, index){
			        	expire__arr.map(function(exp){
			        	 	obj["expiration_date"] = exp[0].data;
			        	});
			        	link.each(function(link_index, each_link){
			        		if(index === link_index){
				        		obj["detail_link"] = each_link.attribs.href;
			        		}
			        	});	
			        });
					resolve(result_arr);
		       })
		       .catch(function(e){
		       		resolve(e)
		       })
	})
} 

var getTnc_N_Image = function(url){
	return new Promise(function(resolve, reject){
		request.getAsync(url)
		       .then(function(data){ 
		       		var $ = cheerio.load(data.body);
		       		var image = $(".banner img")[0].attribs.src;
		       		// get terms and condition
					var tnc__array = $("div#merchant-detail").text();
					var image_N_tnc = {
						image: image,
						tnc__array: tnc__array
					}
		       		resolve(image_N_tnc);
		       })
		       .catch(function(e){
		       		resolve(e);
		       })
    });
}

module.exports = {
	ObjectSize: ObjectSize,
	iterate: iterate,
	getLink: getLink,
	getTnc_N_Image: getTnc_N_Image,
	getTitle_N_Date: getTitle_N_Date
}