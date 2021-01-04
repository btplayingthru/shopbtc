function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function add_sat_prices(exchange_rate) {
	console.log('exchange rate: ', exchange_rate)

	let regex = /\$( *)(((\d{1,3})(,\d{3})*)|(\d+))($|(\.\d{2}))( USD)?( )*$/gmi

	var elements = document.getElementsByTagName('*');

	for (var i = 0; i < elements.length; i++) {
	    var element = elements[i];

	    for (var j = 0; j < element.childNodes.length; j++) {
	        var node = element.childNodes[j];
			// console.log(node, node.textContent, node.nodeType)
	        if (node.nodeType === 3) {
	            var text = node.nodeValue;
	            var replacedText = text.replace(regex, function(m) {
					// console.log(m)
					var price = m.replace("$", "").replace(",", "")
					var sat_cost = Math.ceil(price * exchange_rate)
					var btc_cost = (sat_cost/100000000).toFixed(3)
					if (btc_cost > .1) {
						return m + "  (" + numberWithCommas(btc_cost) + " BTC)"
					} else if (sat_cost > 10000) {
						ksats = (sat_cost/1000).toFixed(0)
						return m + "  (" + numberWithCommas(ksats) + "k sats)"
					} else {
						return m + "  (" + numberWithCommas(sat_cost) + " sats)"
					}
				});

	            if (replacedText !== text) {
	                element.replaceChild(document.createTextNode(replacedText), node);
	            }
	        }
	    }
	}
	console.log("added prices in satoshis")
}

const req = new XMLHttpRequest();
req.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    	const response = JSON.parse(req.responseText);
		const satoshi_per_dollar = parseFloat(response.data.rates.BTC) * 100000000
		console.log("Satoshis per USD: ", satoshi_per_dollar)
		console.log(location.hostname)
		add_sat_prices(satoshi_per_dollar)
    }
};
req.open("GET", "https://api.coinbase.com/v2/exchange-rates", true);
req.send();
