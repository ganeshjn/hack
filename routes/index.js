var chrono = require("chrono-node");
var nlp = require("natural");
var classifier = new nlp.BayesClassifier();

function parseDirection(query) {

}

function parseQuery(query) {
    var result = query;
    var time = chrono.parseDate(query)
    classifier.addDocument('stay', 'hotel');
    classifier.addDocument('hotel', 'hotel');
    classifier.addDocument('flight', 'air');
    classifier.addDocument('plane', 'air');
    classifier.addDocument('aeroplane', 'air');
    classifier.addDocument('airway', 'air');
    classifier.addDocument('car', 'car');
    classifier.addDocument('taxi', 'car');

    classifier.train();

    result = classifier.classify(query);

    return result;
}

var dummyData = [{
    "title": "Item-1",
    "description": "Item-1 description",
    "data": "Data-1"
}, {
    "title": "Item-2",
    "description": "Item-2 description",
    "data": "Data-2"
}, {
    "title": "Item-3",
    "description": "Item-3 description"
}, {
    "title": "Item-4",
    "description": "Item-4 description"
}, {
    "title": "Item-5",
    "description": "Item-5 description"
}, {
    "title": "Item-6",
    "description": "Item-6 description"
}, {
    "title": "Item-7",
    "description": "Item-7 description"
}, {
    "title": "Item-8",
    "description": "Item-8 description"
}, {
    "title": "Item-9",
    "description": "Item-9 description"
}, {
    "title": "Item-10",
    "description": "Item-10 description"
}];

module.exports = function(app) {
    app.use(function(req, res, next) {
        next();
    });
    
    app.get("/", (req, res) => {
        res.render("index", {
            "pageTitle": "SaaS",
        });
    });

    app.get("/search", (req, res) => {
        console.log(req.query);
        console.log(req.query.xhr);
        //var agent =  req.headers['user-agent'];
        // if request is having param as xhr, return only data
        if (req.query.xhr) {
            // Parse the query
            var result = parseQuery(req.query.q);
            return res.send({
                error: false,
                data :dummyData
            });
        }

        // Render the search page
        res.render("search", {
            "pageTitle": "Search Result",
            "searchString": req.query,
        });
    });

};
