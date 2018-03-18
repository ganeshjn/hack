
module.exports = {
    globalApiConfig: {
        UMO: 'KM',
        Radius: 300,
        CountryCode: 'IN',
        City: 'Bangalore',
        Longitude: 77.7360593,
        Latitude: 12.9863775
    },
    airApiConfig: {
        origin: 'JFK',
        destination: 'LAX',
        country: 'US',
        stayLength: 1
    },
    carApiConfig: {
        origin: 'LAX',
    },
    hotelApiConfig: {
        
    },
    HTTP_PORT: process.env.PORT || 9090,
    HTTPS_PORT: process.env.PORT || 9443,
}
