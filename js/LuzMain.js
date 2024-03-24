const url =
	"https://bypass-cors-beta.vercel.app/?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB";

/**
 *  @param {number} diviceWh
 * @param {number} startHour
 * @param {number} endHour
 * @returns {Promise<number,Map<string,number>>} {priceSum, pricesByHour}
 *
 */
async function getPriceDeviceByHourRange(diviceWh, startHour, endHour) {
	const endHourParsed = getEndHour(startHour, endHour);
	const priceSum = await getTotalPrice(startHour, endHourParsed, diviceWh);
	return priceSum;
}
const now = new Date();

function getPriceByHours() {
	return fetch(url)
		.then((response) => response.json())
		.then((data) => {
			if (!data?.data) {
				console.log("error, no data");
				return [];
			}
			return Object.values(data.data);
		})
		.catch((error) => console.log(error));
}

function parseHourToString(hour) {
	if (hour > 9) {
		return `${hour}`;
	}
	return `0${hour}`;
}

async function getPriceList() {
	const savedPrices = localStorage.getItem("prices");
	const storageDate = savedPrices ? savedPrices.date : null;

	const serverTimeResponse = await fetch("https://worldtimeapi.org/api/ip");
	const serverTimeData = await serverTimeResponse.json();
	const serverDateTime = new Date(serverTimeData.utc_datetime);
	const newDate = new Date(
		serverDateTime.getFullYear(),
		serverDateTime.getMonth(),
		serverDateTime.getDate()
	);

	const moreThan24Hours =
		!storageDate ||
		newDate.getTime() - new Date(storageDate).getTime() > 24 * 60 * 60 * 1000;

	if (moreThan24Hours) {
		const priceList = await getPriceByHours();
		localStorage.setItem(
			"prices",
			JSON.stringify({ date: newDate.getTime(), data: priceList })
		);
	}
	const precioHora = document.getElementById("precioHora");
	const precioTitulo = JSON.parse(localStorage.getItem("prices"));
	const datoActual = precioTitulo.data.filter((infoDia) => {
		return (
			infoDia.hour ==
			`${parseHourToString(getEndHour)}-${parseHourToString(getEndHour + 1)}`
		);
	});
	precioHora.innerHTML = datoActual[0].price;
	return JSON.parse(localStorage.getItem("prices")).data;
}
let getEndHour = now.getHours();
/**
 * Description
 * @param {any} startHour
 * @param {any} endHour
 * @param {any} diviceWh
 * @returns {any}
 */
async function getTotalPrice(startHour, endHour, diviceWh) {
	const prices = await getPriceList();
	let priceSum = 0;
	const pricesByHour = [];
	// console.log(`startHour: ${startHour}, totalHours: ${endHour}`);
	for (let i = startHour; i < endHour; i++) {
		// console.log(`Hour: ${prices[i].hour}, price: ${prices[i].price}`);
		pricesByHour.push({ hour: prices[i].hour, price: prices[i].price });
		const priceWh = prices[i].price / 1000000;
		priceSum += priceWh * diviceWh;
	}
	return { priceSum, pricesByHour };
}
//definimos los consumor por hora de distintos electrodomesticos

let nevera = getTotalPrice(getEndHour, getEndHour + 1, 300).then((p) => {
	nevera = p.priceSum;
});

let ordenador = getTotalPrice(getEndHour, getEndHour + 1, 750).then((p) => {
	ordenador = p.priceSum;
});

let lavavajillas = getTotalPrice(getEndHour, getEndHour + 1, 1200).then((p) => {
	lavavajillas = p.priceSum;
});

let lampara = getTotalPrice(getEndHour, getEndHour + 1, 11).then((p) => {
	lampara = p.priceSum;
});

let lavadora = getTotalPrice(getEndHour, getEndHour + 1, 500).then((p) => {
	lavadora = p.priceSum;
});

let television = getTotalPrice(getEndHour, getEndHour + 1, 260).then((p) => {
	television = p.priceSum;
});

let airCon = getTotalPrice(getEndHour, getEndHour + 1, 2000).then((p) => {
	airCon = p.priceSum;
});

let calefactor = getTotalPrice(getEndHour, getEndHour + 1, 1500).then((p) => {
	calefactor = p.priceSum;
});


function consumoTotal() {
	console.log(
		nevera +
		ordenador +
		lavavajillas +
		lampara +
		lavadora +
		television +
		airCon +
		calefactor
	);
	let checkConsumo = 0;

	const arrayConsumo = [
		{ id: "nevera", consumo: nevera },
		{ id: "ordenador", consumo: ordenador },
		{ id: "lavavajillas", consumo: lavavajillas },
		{ id: "lampara", consumo: lampara },
		{ id: "lavadora", consumo: lavadora },
		{ id: "television", consumo: television },
		{ id: "airCon", consumo: airCon },
		{ id: "calefactor", consumo: calefactor },
	];
	arrayConsumo.forEach((electrodomestico) => {
		const cheElectrodomestico = document.getElementById(electrodomestico.id);
		console.log(cheElectrodomestico.checked);
		if (cheElectrodomestico.checked) {
			checkConsumo += electrodomestico.consumo;
		}
	});
	const total = document.getElementById("mensajeTotal");
	total.innerHTML = checkConsumo;
}
