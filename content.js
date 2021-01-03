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
			'a-size-base a-color-price a-text-normal'
		]
	},
	"www.walmart.com": {
		"ids": [],
		"classes": [
			"price-group"
		]
	},
}


function add_satoshi_price(satoshi_rate, element_class, element_id) {
	if (element_id) {
		var price_element = document.getElementById(element_id);
		if (price_element) {
			price = price_element.textContent.replace("$", "").replace(",", "")
			var sat_cost = Math.ceil(price * satoshi_rate)
			price_element.textContent += "  (" + numberWithCommas(sat_cost) + " sats)"
		}
	}

	if (element_class) {
		var price_elements = document.getElementsByClassName(element_class);
		if (price_elements) {
			for (i = 0; i < price_elements.length; i++) {
				price = price_elements[i].textContent.replace("$", "").replace(",", "")
				var sat_cost = Math.ceil(price * satoshi_rate)
				price_elements[i].textContent += "  (" + numberWithCommas(sat_cost) + " sats)"
			}
		}
	}
	
}

const req = new XMLHttpRequest();
req.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    	// Typical action to be performed when the document is ready:
    	const response = JSON.parse(req.responseText);
		const satoshi_per_dollar = parseFloat(response.data.rates.BTC) * 100000000
		console.log("Satoshis per USD: ", satoshi_per_dollar)

		console.log(location.hostname)
		
		const ids = domains[location.hostname].ids
		for (i = 0; i < ids.length; i++) {
			add_satoshi_price(satoshi_per_dollar, null, ids[i],);
		}
		
		const classes = domains[location.hostname].classes
		for (x = 0; x < classes.length; x++) {
			add_satoshi_price(satoshi_per_dollar, classes[x], null);
		}
    }
};
req.open("GET", "https://api.coinbase.com/v2/exchange-rates", true);
req.send();
