let price = value => {
	let feePrice = 2070;
	let superPriceRatio = 1.34;
	let superPricePerc = 0.15;
	let socialPerc = 6.5;
	let healthPerc = 4.5;

	let superPriceTax = Math.ceil(value * superPriceRatio * superPricePerc);
	let socialTax = Math.ceil(socialPerc / 100 * value);
	let healthTax = Math.ceil(healthPerc / 100 * value);

	return (value - superPriceTax - socialTax - healthTax + feePrice);
};

let showPrice = value => {
	let taxValue = price(value);
	let diff = value - taxValue;
	taxValue = (taxValue / 1000).toFixed(3);
	diff = (diff / 1000).toFixed(3);
	value = (value / 1000).toFixed(3);

	console.log(`${value}k => ${taxValue}k (-${diff}k)`);
};

const MY_PAY = 61100;
const MY_PAY_PREMIUM = MY_PAY * 1.3;

showPrice(MY_PAY);
showPrice(MY_PAY_PREMIUM);
showPrice(MY_PAY * 8 + 4 * MY_PAY_PREMIUM);
