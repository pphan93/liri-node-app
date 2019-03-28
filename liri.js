//Require Section//
require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs");

//Keys//
var spotify = new Spotify(keys.spotify);
var bandAPI = keys.bands.apiID;

//console.log(keys.spotify);

//Application Global Vars
var filename;
var dataToWrite = "";
var txtRed = '\033[0;31m'
var txtBlue = '\033[0;34m'
var txtYellow = '\033[1;33m'
var txtCyan = '\033[0;36m'
var txtReset = '\033[0m'
var line = "_____________________________________________________"

//Get User Input
var command = process.argv[2];
var userInput = process.argv.splice(3).join("+");

//console.log(command);

function switchCases(command) {
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
            doWhatItSays();
            break;
        default:
            console.log(txtRed + "No Match Command. Please try again!" + txtReset);
    }
}

switchCases(command);


function concertThis(artist) {
    if (artist === "" || artist === null || artist === undefined) {
        console.log(txtRed + "Please enter name of artist/band" + txtReset);
        return;
    }
    bandsInTown(artist);
}

function spotifyThisSong(songName) {
    if (songName === "" || songName === null || songName === undefined) {
        songName = "The Sign";
    }

    spotifyGet(songName).then(function (data) {
        items = data.tracks.items;
        //console.log(data)

        if (items === "" || items === undefined || items.length == 0) {
            console.log(txtRed + "Song not available on spotify" + txtReset)
        } else {
            for (var i in items) {
                var artistsObj = items[i].artists;
                var artists = spotifyParseArtistsName(artistsObj);
                var spotifySongName = items[i].name;
                var prevLink = items[i].external_urls.spotify;
                var albumName = items[i].album.name;

                dataToWrite = txtYellow + line + "\n" +
                    txtCyan + artists + "\n" +
                    "Song Name: " + spotifySongName + "\n" +
                    "Preview Link: " + prevLink + "\n" +
                    "Album Name: " + albumName + txtReset + "\n";

                console.log(dataToWrite);
                appendToFile(dataToWrite);
            }
        }
    });

}

function spotifyParseArtistsName(artistsObj) {
    var artistsName = [];
    for (var i in artistsObj) {
        artistsName.push(artistsObj[i].name);
    }
    return ("Artist(s) Name: " + artistsName.join(", "));
}


function movieThis(movieName) {
    if (movieName === "" || movieName === null || movieName === undefined) {
        movieName = "Mr. Nobody";
    }
    omdbAPI(movieName);
}


function omdbAPI(movieName) {
    var movieURL = "http://www.omdbapi.com/?t=" + movieName + "&apikey=trilogy";
    axiosGet(movieURL).then(function (data) {
        //console.log(data);
        if (data.Response === "False") {
            console.log(data.Error)
        } else {


            dataToWrite = txtYellow + line + "\n" +
                txtCyan + "Title: " + data.Title + "\n" +
                "Year: " + data.Year + "\n" +
                "IMDB Rating: " + data.imdbRating + "\n" +
                omdbAPIParseRotten(data.Ratings) + "\n" +
                "Country : " + data.Country + "\n" +
                "Language: " + data.Language + "\n" +
                "Plot: " + data.Plot + "\n" +
                "Actors: " + data.Actors + txtReset + "\n";

            console.log(dataToWrite);
            appendToFile(dataToWrite);
        }
    });
}

function omdbAPIParseRotten(rating) {
    for (var i in rating) {
        if (rating[i].Source === "Rotten Tomatoes") {
            return ("Rotten Tomatoes Rating: " + rating[i].Value);
        }
    }
}

function doWhatItSays() {
    filename = "random.txt";
    readFile(function (err, data) {
        var dataArr = data.split(",");
        var command = dataArr[0];
        userInput = dataArr[1];
        console.log(userInput);
        switchCases(command);
        
    });
}

function readFile(callback) {
    fs.readFile(filename, "utf8", function (error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }
        callback(null, data);
    });
}

function appendToFile(dataToWrite) {
    var writeFileName = "log.txt";
    fs.appendFile(writeFileName, dataToWrite, function (err) {

        // If an error was experienced we will log it.
        if (err) {
            console.log(err);
        }

        // If no error is experienced, we'll log the phrase "Content Added" to our node console.
        else {
            //console.log("Content Added!");
        }

    });

}

function bandsInTown(artist) {
    var url = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + bandAPI;
    //console.log(url);
    axiosGet(url).then(function (data) {
        //console.log(data);
        //return;
        if (data === "" || data === undefined || data.length == 0 || data == "{warn=Not found}") {
            console.log(txtRed + "No concerts available for this artist/band" + txtReset)
        } else {
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

                dataToWrite = txtYellow + line + "\n" +
                    txtBlue + "Venue Name: " + venueName + "\n" +
                    "Venue Location: " + location + "\n" +
                    "Date of the Event: " + dateTime + txtReset + "\n";

                console.log(dataToWrite);
                appendToFile(dataToWrite);
            }
        }
    });
}


function spotifyGet(songName) {
    return spotify
        .search({
            type: 'track',
            query: songName,
            limit: 10,
            offset: 5
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
                //console.log(error.response.data);
                //console.log(error.response.data.errorMessage);
                //console.log(error.response.status);
                //console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an object that comes back with details pertaining to the error that occurred.
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
            }
            //console.log(error.config);
        }
    );
}