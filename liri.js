//Require Section//
require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");

//Keys//
var spotify = new Spotify(keys.spotify);
var bandAPI = keys.bands.apiID;

console.log(keys.spotify);

//Application Global Vars



//Get User Input
var command = process.argv[2];
var userInput = process.argv.splice(3).join("+");

console.log(command);

switch (command) {
    case "concert-this":
        concertThis(userInput);
        break;
    case "spotify-this-song":
        spotifyThisSong(userInput);
        break;
    case "movie-this":
        movieThis(userInput);
        break;
    case "do-what-it-says":
        doWhatItSays(userInput);
        break;
    default:
        console.log("No Match Command. Please try again!");
}


function concertThis(artist) {
    bandsInTown(artist);
}

function spotifyThisSong(songName) {
    spotifyGet().then(function (data) {
        console.log(data.tracks.items)

    });
}

function movieThis() {

}

function doWhatItSays() {

}

function bandsInTown(artist) {
    var url = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + bandAPI;
    axiosGet(url).then(function (data) {
        //console.log(data);
        for (var i of data) {
            var venue = i.venue;
            var location;
            var venueName = venue.name;
            var dateTime = moment(i.datetime).format("MM/DD/YYYY");
            //var dateTime = i.datetime;
            if (venue.region === "") {
                location = venue.city + "," + venue.country;
            } else {
                location = venue.city + "," + venue.region + "," + venue.country;
            }
            console.log("__________________________");
            console.log(venueName);
            console.log(location);
            console.log(dateTime);
        }
    });
    //console.log(data);
}

//bandsInTown("slayer");

function spotifyGet() {
    return spotify
        .search({
            type: 'track',
            query: 'All the Small Things'
        })
        .then(function (response) {
            return response;
        })
        .catch(function (err) {
            console.log(err);
        });
}


function axiosGet(url) {
    return axios.get(url).then(
        function (response) {
            // If the axios was successful...
            // Then log the body from the site!
            //console.log(response.data);
            return (response.data);
        },

        function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an object that comes back with details pertaining to the error that occurred.
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
            }
            console.log(error.config);
        }
    );
}