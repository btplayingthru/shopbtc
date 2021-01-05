function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const domains = {
	"www.amazon.com": {
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
	"www.walmart.com": {
		"ids": [],
		"classes": [
			"price-group"
		]
	},
}

function format_btc_price(satoshis) {
	let btc_cost = satoshis / 100000000;
	let btc_price;

	if (btc_cost > .1) {
		btc_cost = btc_cost.toFixed(3)
		btc_price = numberWithCommas(btc_cost) + " BTC"
	} else if (satoshis > 1000000) {
		let msats = (satoshis/1000000).toFixed(2)
		btc_price = numberWithCommas(msats) + "m sats"
	} else if (satoshis > 1000) {
		let ksats = (satoshis/1000).toFixed(1)
		btc_price = numberWithCommas(ksats) + "k sats"
	} else {
		btc_price = numberWithCommas(satoshis) + " sats"
	}
	return btc_price
}

function add_btc_price_by_id(satoshi_rate, element_id) {
	if (element_id) {
		var price_element = document.getElementById(element_id);
		if (price_element) {
			if(!price_element.textContent.includes("sats"||"BTC")){
				price = price_element.textContent.replace("$", "").replace(",", "")
				var sat_cost = Math.ceil(price * satoshi_rate)
				price_element.textContent += "  (" + numberWithCommas(sat_cost) + " sats)"
			}
		}
	}
}

function add_btc_price_by_class(satoshi_rate, element_class) {
	if (element_class) {
		var price_elements = document.getElementsByClassName(element_class);
		if (price_elements) {
			for (i = 0; i < price_elements.length; i++) {
				if (!price_elements[i].textContent.includes("sats"||"BTC")) {
					price = price_elements[i].textContent.replace("$", "").replace(",", "")
					var sat_cost = Math.ceil(price * satoshi_rate)
					price_elements[i].textContent += "  (" + format_btc_price(sat_cost) + ")"
				}
			}
		}
	}
}


function add_sat_prices(exchange_rate) {
	console.log('exchange rate: ', exchange_rate)

	// Add BTC prices for non-white listed elements
	// let regex = /\$( *)(((\d{1,3})(,\d{3})*)|(\d+))($|(\.\d{2}))(\/lb)?( USD)?( )*$/gmi
	let regex = /((\$( *))(?!(0([0-9]*(,))))((\d{1,3}))((\d*)|(,\d{3})*)(\.\d{2}){0,1}(?!(\.\d{3})))(?!\d*,\d*)/gmi

	var elements = document.getElementsByTagName('*');

	for (var i = 0; i < elements.length; i++) {
	    var element = elements[i];

	    for (var j = 0; j < element.childNodes.length; j++) {
	        var node = element.childNodes[j];
	        if (node.nodeType === 3) {
	            var text = node.nodeValue;
	            var replacedText = text.replace(regex, function(m) {
					var price = m.replace("$", "").replace(",", "")
					var sat_cost = Math.ceil(price * exchange_rate)
					price_to_show = format_btc_price(sat_cost)
					return m + " (" + price_to_show + ")"
				});

	            if (replacedText !== text) {
	                element.replaceChild(document.createTextNode(replacedText), node);
	            }
	        }
	    }
	}

	// Add BTC prices for whitelisted elements by domain
	let domain = location.hostname;

	if (domain in domains) {
		const ids = domains[location.hostname].ids
		for (i = 0; i < ids.length; i++) {
			add_btc_price_by_id(exchange_rate, ids[i]);
		}

		const classes = domains[location.hostname].classes
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
			const satoshi_per_dollar = parseFloat(response.data.rates.BTC) * 100000000
			console.log("Satoshis per USD: ", satoshi_per_dollar)
			console.log(location.hostname)
			add_sat_prices(satoshi_per_dollar)
		}
	}
	req.open("GET", "https://api.coinbase.com/v2/exchange-rates", true)
	req.send()
}


window.addEventListener('load', function() {
	const req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			const response = JSON.parse(req.responseText);
			console.log(response.bpi.USD.rate_float)
			console.log("Coindesk Rate: ", response.bpi.USD.rate_float)
			// Coindesk returns USD per BTC
			const satoshi_per_dollar = 100000000 / response.bpi.USD.rate_float
			console.log("CoinDesk BPI: ", satoshi_per_dollar);
			add_sat_prices(satoshi_per_dollar);
	    }

		if (this.readyState == 4 && this.status != 200) {
			console.log("Failure contacting CoinDesk for BTC rate, trying Coinbase...")
			get_btc_price_from_coinbase();
		}
	};
	req.open("GET", "https://api.coindesk.com/v1/bpi/currentprice.json", true);
	req.send();
})
