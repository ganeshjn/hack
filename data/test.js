/*
var fs = require('fs');
var marketersList = {};

fs.readFile('./marketers.json', 'utf-8', function(err, data) {
    if (err) throw err;
    rs = JSON.parse(data);

});
*/

/*
var lat1 = 12.9863911;
var lon1 = 77.7360368;
var lat2 = 18.516726;
var lon2 = 73.856255;

lat1 = 12.971599;
lon1 = 77.594563;
lat2 = 22.282010;
lon2 = 114.183360;

var R = 6371; // km  
var dLat = (lat2-lat1)*Math.PI/180;  
var dLon = (lon2-lon1)*Math.PI/180;   
var a = Math.sin(dLat/2) * Math.sin(dLat/2) +  
        Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *   
        Math.sin(dLon/2) * Math.sin(dLon/2);   
var c = 2 * Math.asin(Math.sqrt(a));   
var d = R * c;  



//var dist = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)) * R
console.log(d);
*/
