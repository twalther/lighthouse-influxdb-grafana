const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const Influx = require('influx');

const env = require('./' + process.env.LIGHTHOUSE_SETTINGS);

const promiseSerial = (funcs, data, cb) =>
	funcs.reduce((promise, func, i, arr) =>
		promise.then(results => func(results[i - 1], data).then(result => { cb && cb((i + 1) / arr.length); return results.concat(result); })), Promise.resolve([]));

const schemaItems = [
        { measurement: 'first-contentful-paint', score: Influx.FieldType.INTEGER },
        { measurement: 'first-cpu-idle', score: Influx.FieldType.INTEGER },
        { measurement: 'first-meaningful-paint', score: Influx.FieldType.INTEGER },
        { measurement: 'speed-index', score: Influx.FieldType.INTEGER },
        { measurement: 'estimated-input-latency', score: Influx.FieldType.INTEGER },
        { measurement: 'time-to-first-byte', score: Influx.FieldType.INTEGER },
        { measurement: 'interactive', score: Influx.FieldType.INTEGER },
        { measurement: 'mainthread-work-breakdown', score: Influx.FieldType.INTEGER },
        { measurement: 'bootup-time', score: Influx.FieldType.INTEGER },
        { measurement: 'total-byte-weight', score: Influx.FieldType.INTEGER },
        { measurement: 'uses-responsive-images', score: Influx.FieldType.INTEGER },
        { measurement: 'dom-size', score: Influx.FieldType.INTEGER },
        { measurement: 'render-blocking-resources', score: Influx.FieldType.INTEGER }
];

const schema = schemaItems.map(schemaItem => {
	return {
		measurement: schemaItem.measurement,
		fields: {
			score: schemaItem.score,
			value: Influx.FieldType.FLOAT
		},
		tags: [
			'environment',
			'uri',
			'name'
		]
	};
});

schema.push({
	measurement: 'score',
	fields: {
		score: Influx.FieldType.INTEGER,
		value: Influx.FieldType.FLOAT
	},
	tags: [
		'environment',
		'uri',
		'name'
	]
});

const influx = new Influx.InfluxDB({
	host: 'localhost',
	database: 'lighthouse',
	schema: schema
});

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
  return chromeLauncher.launch(flags).then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results.lhr));
  });
}

const flags = {
  chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-software-rasterizer', '--disable-dev-shm-usage'],
  onlyCategories: ['performance']
};

const audits = schemaItems.map(schemaItem => schemaItem.measurement);

function createTest(url, measurements) {
	return (result, data) => {
		return new Promise((resolve, reject) => {
			console.log(`Starting test: ${url.name}`);

			launchChromeAndRunLighthouse(url.url, flags).then(results => {
				for(let audit of audits) {
					const score = results.audits[audit].score;
					const value = results.audits[audit].rawValue;
                                        console.log('audit: ' + audit + ' value: '+value);

					measurements.push({
						measurement: audit,
						tags: {
							environment: env.environment,
							uri: url.url,
							name: url.name
						},
						fields: {
							score: score,
							value: value
						}
					});
				}
				resolve();
			});
		});
	}
}

function progressCallback(progress) {
	console.log(`Total progress: ${progress * 100}%`);
}


function doTests() {
	const measurements = [];
	const tests = env.urls.map(url => createTest(url, measurements));

	promiseSerial(tests, {}, progressCallback)
		.then((results) => {
			console.log('Writing results');

			influx.getDatabaseNames()
				.then(names => {
					if (!names.includes('lighthouse')) {
						influx.createDatabase('lighthouse');
                                                return influx.createRetentionPolicy('lighthouse', {
                                                     duration: '30d',
                                                     database: 'lighthouse',
                                                     replication: 1,
                                                     isDefault: true
                                                })

					}
				})
				.then(() => {
					influx.writePoints(measurements)
						.then(() => {
							console.log('Tests are done');
						});
				});
		});
}

doTests();
