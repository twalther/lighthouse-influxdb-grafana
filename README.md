# lighthouse-influxdb-grafana
Combines [Lighthouse](https://developers.google.com/web/tools/lighthouse/) with [InfluxDB](https://github.com/influxdata/influxdb) and [Grafana](https://grafana.com/)

## Requirements
- Node 8.9.3
- Yarn
- InfluxDB (example dockerfile in misc folder)
- Grafana (example dockerfile in misc folder)

## Env file
An example with Google (startpage and search) is included as `env.google.js`, copy and modify according to your own needs.

The environment is to keep multiple environments in the same database (for instance local, test, stage, prod or whatever you might fancy). The name part in the object should be unique in combination with environment; the url is simply the url to test.

## InfluxDB
The database lighthouse will be created if it does not exists. Should be moved to env-variable (TODO!).

## Grafana
Add a datasource called Lighthouse which points at the InfluxDB called lighthouse. An example dashboard is called `Google-example.json` and is located in the misc folder. Import that file and select Lighhouse as the database for the example dashboard.

[[https://github.com/twalther/lighthouse-influxdb-grafana/blob/master/misc/screenshot.png|alt=dashboard]]

## App
Run `ENV=env.google node app.js` or use your own env/app-file (see Env file above).

## TODO
- Verify that all measurements are correct
- Cleanup, add env-variables for ports and more
- Error handling...
- Docker-compose
- Create server with API instead of command line
- Profit!