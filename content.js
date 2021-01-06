let satoshi_per_dollar;
let regex = /((\$( *))(?!(0([0-9]*(,))))((\d{1,3}))((\d*)|(,\d{3})*)(\.\d{2}){0,1}(?!(\.\d{3})))(?!\d*,\d*)/gmi
let btc_string = /(( \(((\d{1,3})(,\d{3})*)(\.\d{0,3})?([mk]{0,1} )(sats|BTC)\))|( \(NaN sats\))){1}(?!,[0-9])/gmi
let with_btc_regex = /((\$( *))(([1-9])(\d{0,2})((,\d{3})*|((\d*)(?!,)))|((0)(?=\.)))(\.\d{2})?)(?![0-9])(( \(((\d{1,3})(,\d{3})*)(\.\d{0,3})?([mk]{0,1} )(sats|BTC)\))|( \(NaN sats\))){1}(?!,[0-9])/gmi

function price_without_btc(text) {
	return (text.match(regex) && !text.match(with_btc_regex))
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const domains = {
	"amazon.com": {
		"ids": [
			'priceblock_ourprice',
			'priceblock_dealprice',
			'price_inside_buybox',
		],
		"classes": [
			'a-size-base a-color-price a-text-normal',
			'p13n-sc-price'
		]
	},
	"walmart.com": {
		"ids": [],
		"classes": [
			"price-group"
		]
	},
	"niftygateway.com":{
		"ids":[],
		"classes":[
			"MuiTypography-root jss417 MuiTypography-body1",
			"MuiTypography-root jss455 MuiTypography-body1",
			"MuiTypography-root jss473 MuiTypography-body1",
			"MuiTypography-root jss579 MuiTypography-body1",
			"MuiTypography-root jss559 MuiTypography-body1",
			"MuiTypography-root jss642 MuiTypography-body1",
			"MuiTypography-root jss854 MuiTypography-body1",
		]
	}
}

function format_btc_price(satoshis) {
	let btc_cost = satoshis / 100000000;
	let btc_price;

	if (btc_cost > 1000) {
		btc_cost = (btc_cost/1000).toFixed(0)
		btc_price = numberWithCommas(btc_cost) + "k BTC"
	} else if (btc_cost > .99) {
		btc_cost = btc_cost.toFixed(2)
		btc_price = numberWithCommas(btc_cost) + " BTC"
	} else if (satoshis > 1000000) {
		let msats = (satoshis/1000000).toFixed(1)
		btc_price = numberWithCommas(msats) + "M sats"
	} else if (satoshis > 1000) {
		let ksats = (satoshis/1000).toFixed(0)
		btc_price = numberWithCommas(ksats) + "k sats"
	} else {
		btc_price = numberWithCommas(satoshis) + " sats"
	}
	return btc_price
}

function btc_price_string(price_string, exchange_rate) {
	var price = price_string.match(regex)[0].replace("$", "").replace(",", "")
	// var price = price_string.replace(/[^\d.-]/g, '');
	var sat_cost = Math.ceil(price * exchange_rate)
	var price_to_show = format_btc_price(sat_cost)
	return " ("+ price_to_show + ")"
}

function add_btc_price_by_id(satoshi_rate, element_id) {
	if (element_id) {
		var price_element = document.getElementById(element_id);
		if (price_element) {
			var text = price_element.textContent
			if(price_without_btc(text)){
				var btc_price = btc_price_string(text, satoshi_rate)
				text += btc_price
				price_element.textContent = text
			}
		}
	}
}

function add_btc_price_by_class(satoshi_rate, element_class) {
	if (element_class) {
		console.log("looking for elements with class...", element_class)
		var price_elements = document.getElementsByClassName(element_class);
		if (price_elements) {
			for (i = 0; i < price_elements.length; i++) {
				var text = price_elements[i].textContent
				if (price_without_btc(text)) {
					var btc_price = btc_price_string(text, satoshi_rate)
					text += btc_price
					price_elements[i].textContent = text
				}
			}
		}
	}
}


function add_sat_prices(exchange_rate) {
	console.log('exchange rate: ', exchange_rate)

	// Add BTC prices for non-white listed elements

	var elements = document.getElementsByTagName('*');

	for (var i = 0; i < elements.length; i++) {
	    var element = elements[i];

	    for (var j = 0; j < element.childNodes.length; j++) {
	        var node = element.childNodes[j];
	        if (node.nodeType === 3) {
	            var text = node.nodeValue;

				var matches = text.matchAll(regex)
				if (matches) {
					var replacedText = text.replace(regex, function(
						m,
						g1,g2,g3,g4,g5,g6,g7,g8,g9,g10,g11,g12,g13,
						offset,
						input_string) {
						var btc_price = btc_price_string(m, exchange_rate)
						var new_price = m + btc_price
						var match_trailing_string = input_string.split(m)[1]
						var trailing_btc_match = match_trailing_string.search(btc_string)
						if (trailing_btc_match == 0) {
							console.log("BTC already listed next to price")
							return m
						} else {
							console.log("Added BTC price to USD regex match")
							return new_price
						}
					});

					if (replacedText !== text) {
		                element.replaceChild(document.createTextNode(replacedText), node);
		            }
				}
	        }
	    }
	}

	// Add BTC prices for whitelisted elements by domain
	let domain = location.hostname.replace("www.", "");

	if (domain in domains) {
		console.log(domain)
		const ids = domains[domain].ids
		for (i = 0; i < ids.length; i++) {
			add_btc_price_by_id(exchange_rate, ids[i]);
		}

		const classes = domains[domain].classes
		for (x = 0; x < classes.length; x++) {
			add_btc_price_by_class(exchange_rate, classes[x]);
		}
	}
	console.log("added prices in satoshis")
}

function get_btc_price_from_coinbase() {
	const req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			const response = JSON.parse(req.responseText);
			console.log("Coinbase Rate: ", response.data.rates.BTC)

			// Coinbase returns BTC per USD
			satoshi_per_dollar = parseFloat(response.data.rates.BTC) * 100000000
			console.log("Satoshis per USD: ", satoshi_per_dollar)
			console.log(location.hostname)
			add_sat_prices(satoshi_per_dollar)
			setTimeout(() => {
				console.log("refreshing....")
				add_sat_prices(satoshi_per_dollar);
			}, 7500);
		}
	}
	req.open("GET", "https://api.coinbase.com/v2/exchange-rates", true)
	req.send()
}



window.onload = function() {
	// let satoshi_per_dollar;

	const req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			const response = JSON.parse(req.responseText);
			console.log("Coindesk Rate: ", response.bpi.USD.rate_float)

			// Coindesk returns USD per BTC
			satoshi_per_dollar = 100000000 / response.bpi.USD.rate_float
			console.log("CoinDesk BPI: ", satoshi_per_dollar);
			add_sat_prices(satoshi_per_dollar);
			setTimeout(() => {
				console.log("refreshing....")
				add_sat_prices(satoshi_per_dollar);
			}, 7500);

	    }

		if (this.readyState == 4 && this.status != 200) {
			console.log("Failure contacting CoinDesk for BTC rate, trying Coinbase...")
			get_btc_price_from_coinbase();
		}
	};
	req.open("GET", "https://api.coindesk.com/v1/bpi/currentprice.json", true);
	req.send();
}
