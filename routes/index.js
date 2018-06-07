const chrono = require("chrono-node");
const nlp = require("natural");
const classifier = new nlp.BayesClassifier();
const fs = require('fs');
const locMap = {
    cities: 'data/cities.json',
    airports: 'data/airports.json',
    countries: 'data/countries.json',
    iata: 'data/iataMap.json',
    hotels: 'data/hotelInfo.json'
};
const moment = require('moment');
const config = require('../configs');

var locationCodes = { cities: '', states: '', countries: '', airports: '', iata: '', hotels: '' };
var tmp;

(function() {
    for (ky in locMap) {
        console.log(`Creating [${ky}] map from: [${locMap[ky]}]`);
        tmp = fs.readFileSync(locMap[ky]);
        tmp = JSON.parse(tmp);
        console.log(`[${ky}] mapping done`);
        locationCodes[ky] = tmp[ky] ? tmp[ky] : tmp;
    }
})();

(function() {
    console.log('Training NLP');
    classifier.addDocument('stay', 'hotel');
    classifier.addDocument('hotel', 'hotel');
    classifier.addDocument('accomodation', 'hotel');
    classifier.addDocument('flight', 'air');
    classifier.addDocument('plane', 'air');
    classifier.addDocument('aeroplane', 'air');
    classifier.addDocument('airway', 'air');
    classifier.addDocument('car', 'car');
    classifier.addDocument('taxi', 'car');
    //classifier.addDocument('iata', 'iata');
    //classifier.addDocument('code', 'iata');
    classifier.train();
})();

const API_DOMAIN = 'https://api.test.sabre.com';
const API_TOKEN = 'T1RLAQKTlcmht1dId6Qdaoo9HHsVJrTfQxBXmXE1FTmRSRj9rjSh2ahjAADAo0fkil3e+hpHyR9vE0Zu3n52EmxtPUrPqkjfd2wYhGWT3sryMv5Qj8gV1E0pcBpxwyNaCdcThNUySpaXd/3FHU2OytEd+Ik5WhlFCWR4XKYeTALC95zvnPLzFUBo32wcwVOp7omuFSCaDSuzwa32pX6kelLjkKgZnXpCKhE9PYZYNOHI/gRAwP+Nt0a2UyzJQbi0dr5xNWfdGIQPJYARcyUD0HomIodWWtpV82bM6EV5NvdP69gIMbqfwvLaFzwB';

function handleAirAPIs(tts, opts) {
    console.log(opts);
    const rp = require('request-promise');
    var origin = opts.locationInfo.from ? (opts.locationInfo.from.iata || null ) : null;
    var destination = opts.locationInfo.to ? (opts.locationInfo.to.iata || null) : null;
    var apiUri = '';
    var apiSubTyp = '';
    var apiOpts = {};
    var apiMethod = 'GET';
    var reqOpts = {
        uri: '',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        },
        json: true
    };

    if (origin && destination) {
        apiSubTyp = 'leadPrice';
    } else if (origin) {
        apiSubTyp = 'destinationFinder'
    } else if (destination) {
        apiSubTyp = 'flightsTo';
    }

    switch (apiSubTyp) {
        case 'leadPrice':
            apiUri = '/v2/shop/flights/fares';
            apiOpts = {
                origin: origin,
                destination: destination,
                lengthofstay: config.airApiConfig.stayLength,
                pointofsalecountry: opts.locationInfo.from.country
            };
            break;
        case 'destinationFinder':
            apiUri = '/v2/shop/flights/fares';
            apiOpts = {
                origin: origin,
                lengthofstay: config.airApiConfig.stayLength,
                topdestinations: 20,
                pointofsalecountry: opts.locationInfo.from.country
            };
            if (opts.locationInfo.from.country == 'IN') {
                delete apiOpts.topdestinations;
            }
            break;
        case 'flightsTo':
            apiUri = `/v1/shop/flights/cheapest/fares/${destination}`;
            apiOpts = {
                pointofsalecountry: opts.locationInfo.to.country
            };
            break;
        default:
            apiUri = '/v2/shop/flights/fares';
            apiOpts = {
                origin: config.airApiConfig.origin,
                lengthofstay: config.airApiConfig.stayLength,
                topdestinations: 20,
                pointofsalecountry: config.airApiConfig.country
            };
    }

    reqOpts.uri = API_DOMAIN + apiUri;
    if (apiMethod == 'GET') {
        reqOpts.qs = apiOpts;
    } else if (apiMethod == 'POST') {
        reqOpts.method = apiMethod;
        reqOpts.body = apiOpts;
    }
    console.log('Request Data:', reqOpts);
    return new Promise(function(res, rej) {
        rp(reqOpts)
            .then((resp) => {
                res({ error: false, subType: apiSubTyp, message: 'success', data: resp });
            })
            .catch((err) => {
                console.log('error: ', err.error.message);
                rej({ error: true, subType: apiSubTyp, message: err.error.message, data: {} });
            })
    });
}

function handleHotelAPIs(tts, opts) {
    const rp = require('request-promise');
    var country = '';
    if (opts.locationInfo.from) {
        country = opts.locationInfo.from.country;
    } else if (opts.locationInfo.to) {
        country = opts.locationInfo.to.country;
    } else {
        country = getCountryCode(tts) || 'IN';
    }
    console.log('country:  ', country);
    var reqOpts = {
        uri: '',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        },
        json: true
    };

    var hotels = []
    locationCodes['hotels'].forEach(function(hotel) {
        if (hotel.CountryCode == country) {
            hotels.push(hotel);
        }
    });

    return new Promise(function(res, rej) {
        res({ error: false, message: 'success', data: hotels });
    });
}

function handleCarAPIs(tts, opts) {
    const rp = require('request-promise');
    var source = opts.locationInfo.from || opts.locationInfo.to;
    var dt = opts.date || new Date();
    var apiUri = '/v2.4.0/shop/cars';
    var apiMethod = 'POST';
    var reqOpts = {
        uri: '',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        },
        json: true
    };
    if (source) {
        source = source.iata;
    } else {
        source = config.carApiConfig.origin;
    }
    var apiOpts = {
        "OTA_VehAvailRateRQ": {
            "VehAvailRQCore": {
                "QueryType":"Shop",
                    "VehRentalCore": {
                        "PickUpDateTime" : moment(dt).add(1, 'days').format('MM-DDThh:mm'),
                        "ReturnDateTime" : moment(dt).add(5, 'days').add(2, 'hours').format('MM-DDThh:mm'),
                        "PickUpLocation": {
                        "LocationCode" : source
                    }
                }
            }
        }
    };

    reqOpts.uri = API_DOMAIN + apiUri;
    if (apiMethod == 'GET') {
        reqOpts.qs = apiOpts;
    } else if (apiMethod == 'POST') {
        reqOpts.headers['Content-Type'] = 'application/json';
        reqOpts.method = apiMethod;
        reqOpts.body = apiOpts;
    }

    return new Promise(function(res, rej) {
        rp(reqOpts)
            .then((resp) => {
                res({ error: false, message: 'success', data: resp });
            })
            .catch((err) => {
                console.log('error: ', err.error.message);
                rej({ error: true, message: err.error.message, data: {} });
            })
    });
}

function handleAPIRequest(tts, opts) {
    var apiCall;
    switch (opts.category) {
        case 'air':
            return new Promise(function(res, rej) {
                apiCall = handleAirAPIs(tts, opts);
                apiCall.then((result) => {
                    res({type:'air', subType: result.subType, data: result.data, message: result.message,error: false});
                }, (err) => {
                    rej({type:'air', subType: err.subType, data: err.data, message: err.message, error: true});
                })
            });
            break;
        case 'hotel':
            return new Promise(function(res, rej) {
                apiCall = handleHotelAPIs(tts, opts);
                apiCall.then((result) => {
                    res({ type: 'hotel', data:result.data, message: result.message, error: false});
                }, (err) => {
                    res({ type: 'hotel', data: {}, message: err.message, error: true});
                });
            });
            break;
        case 'car':
            return new Promise(function(res, rej) {
                apiCall = handleCarAPIs(tts, opts);
                apiCall.then((result) => {
                    res({ type: 'car', data:result.data, message: result.message, error: false});
                }, (err) => {
                    res({ type: 'car', data: {}, message: err.message, error: true});
                });
            });
            break;
    }
}


function getAirportCode(c) {
    c = c.toLowerCase();
    for (airport in locationCodes.airports) {
        if (locationCodes.airports[airport].iata.length && 
            (locationCodes.airports[airport].city.toLowerCase().indexOf(c) != -1 ||
             locationCodes.airports[airport].iata.toLowerCase().indexOf(c) != -1)) {
            return locationCodes.airports[airport];
        }
    }
}
function getCityCode(c) {
    c = c.toLowerCase();
    for (city in locationCodes.cities) {
        if (locationCodes.cities[city].name.toLowerCase().indexOf(c) != -1) {
            return locationCodes.cities[city];
        }
    }
    return null;
}
function getCountryCode(c) {
    c = c.toLowerCase();
    for (country in locationCodes.countries) {
        if (locationCodes.countries[country].name.toLowerCase().indexOf(c) != -1) {
            return locationCodes.countries[country];
        }
    }
    return null;
}



function parseDirection(query) {
    var dst = '';
    var src = '';
    var idx;
    query = query.split(' ');
    ['from', 'frm', 'in', 'near', 'at'].forEach(function(p) {
        idx = query.indexOf(p);
        if (idx != -1) {
            src = query[idx + 1] || '';
            return false;
        }
    });
    ['to', 'for'].forEach(function(p) {
        idx = query.indexOf(p);
        if (idx != -1) {
            dst = query[idx + 1] || '';
        }
    });

    return { from: src, to: dst };
}

function parseDate(query) {
    var t = chrono.parseDate(query);
    return t;
}

function parseQuery(query) {
    var result = query;
    var date = parseDate(query);
    var direction = parseDirection(query);
    var locationInfo = {};
    if (direction.from) {
        locationInfo['from'] = getAirportCode(direction.from);
    } 
    if (direction.to) {
        locationInfo['to'] = getAirportCode(direction.to);
    } 
    result = { 
        category: classifier.classify(query),
        date: date,
        direction: direction,
        locationInfo: locationInfo
    };

    return result;
}

module.exports = function(app) {
    app.use(function(req, res, next) {
        console.log('==========');
        next();
    });
    
    app.get("/", (req, res) => {
        res.render("index", {
            "pageTitle": "SaaS",
        });
    });

    app.get("/search", (req, res) => {
        var tts = req.query.tts || '';
        tts = tts.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/g, ' ');
        console.log(req.query);
        console.log(tts);

        // if request is having param as xhr, return only data
        if (req.query.xhr) {
            var result = parseQuery(tts);
            var apiResp;
            console.log('parsed data: ', result);
            console.log('api request');
            apiResp = handleAPIRequest(tts, result);
            apiResp
            .then(function(resp) {
                resp.tts = tts;
                console.log('api response');
                return res.send(resp)
            }, function(resp) {
                resp.tts = tts;
                console.log('api error response');
                return res.send(resp)
            })
        } else {
            // Render the search page
            res.render("search", {
                pageTitle: "Search Result",
                searchString: req.query,
            });
        }
    });

    app.get("/hotel/:code", (req, res) => {
        const rp = require('request-promise');
        var id = req.params['code'];
        var reqOpts = {
            uri: `${API_DOMAIN}/v1.0.0/shop/hotels/description?mode=description`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                "GetHotelDescriptiveInfoRQ": {
                    "HotelRefs": {
                        "HotelRef": [{
                            "HotelCode": id
                        }]
                    },
                    "DescriptiveInfoRef": {
                        "PropertyInfo": true,
                        "LocationInfo": true,
                        "Amenities": true,
                        "Descriptions": {
                            "Description": [{
                                "Type": "Dining"
                            }]
                        },
                        "Airports": true,
                        "AcceptedCreditCards": true
                    }
                }
            }
        };
        rp(reqOpts)
            .then(function(resp) {
                res.send({ error: false, message: 'success', data: resp.GetHotelDescriptiveInfoRS.HotelDescriptiveInfos.HotelDescriptiveInfo });
            })
            .catch(function(err) {
                res.send({ error: true, message: err.erro.message, data: {} });
            });
    });

    app.get("/iata/:code", (req, res) => {
        res.send(locationCodes['iata'][req.params['code'].toUpperCase()]);
    });

};
