/* ------------------------------------------------------------------------------- */
// And mysql module you've just installed. 
var querystring = require("querystring");
var mysql = require("mysql");
var http = require('http');
var url = require('url');
var fs = require("fs");

var replyError = function(response, pathname) {
    if (!response) return;
    response.writeHead(404);
    return response.end("<h1>404 Error - resource not found: " + pathname + "</h1>");
};

var replySuccess = function(response, content_type, data) {
    response.writeHead(200, {
        'Content-Type': content_type,
        'Access-Control-Allow-Origin': '*'
    });
    response.end(data);
};

var server = http.createServer(function(request, response) {
    var obj = url.parse(request.url, true);
    var mypath = obj.pathname.substring(1);

    console.log(mypath);

    switch (request.method) {
        case 'GET':
            if (mypath.search(".html") > -1) {
                fs.readFile(mypath, function(err, data) {
                    if (err) return replyError(response, mypath);
                    replySuccess(response, 'text/html', data);
                });
            } else if (mypath.search(".css") > -1) {
                fs.readFile(mypath, function(err, data) {
                    if (err) return replyError(response, mypath);
                    replySuccess(response, 'text/css', data);
                });
            } else if (mypath.search(".js") > -1) {
                fs.readFile(mypath, function(err, data) {
                    if (err) return replyError(response, mypath);
                    replySuccess(response, 'text/javascript', data);
                });
            } else if (mypath.search(".pdf") > -1) {
                fs.readFile(mypath, function(err, data) {
                    if (err) return replyError(response, mypath);
                    replySuccess(response, 'application/pdf', data);
                });
            } else if (mypath.search(".tsv") > -1) {
                fs.readFile(mypath, function(err, data) {
                    if (err) return replyError(response, mypath);
                    replySuccess(response, 'text/tab-separated-values', data);
                });
            } else if (mypath.search(".csv") > -1) {
                fs.readFile(mypath, function(err, data) {
                    if (err) return replyError(response, mypath);
                    replySuccess(response, 'text/tab-separated-values', data);
                });
            } else if (mypath.search("bus/") > -1) {
                var datafile = "";
                var datatype = "application/json";

                switch (mypath) {
                    case "bus/wailukuloop/route1":
                        datafile = "meo/WailukuLoopRoute1.json";
                        break;
                    case "bus/wailukuloop/route2":
                        datafile = "meo/WailukuLoopRoute2.json";
                        break;
                    case "bus/kulavillager/route39":
                        datafile = "meo/KulaVillager.json";
                        break;
                    case "bus/upcountry/route40":
                        datafile = "meo/Upcountry.json";
                        break;
                    case "bus/maui":
                        return replySuccess(response, "text/plain", "meo/MauiBus.pdf");
                    default:
                        return replyError(response, mypath);
                }

                console.log("Datafile: " + datafile + ", Datatype: " + datatype);

                fs.readFile(datafile, function(err, data) {
                    if (err) return replyError(response, datafile);
                    replySuccess(response, datatype, data);
                });
            } else if (mypath.search("db/route") > -1) {

                var dbquery = '';

                if (mypath.search("db/route/list") > -1) {
                    dbquery = 'SELECT DISTINCT route FROM mydb.MEO ORDER BY route;';
                } else if (obj.query.name) {
                    var route = obj.query.name;
                    dbquery = "SELECT idMEO, route, vechicle, date, pickup, startstreet, startcity, deststreet, destcity FROM mydb.MEO  WHERE route='" + route + "' ORDER BY date, route, pickup;";
                } else {
                    return replyError(response, mypath);
                }

                // Create the connection. 
                // Data is default to new mysql installation and should be changed according to your configuration. 
                var connection = mysql.createConnection({
                    user: "student",
                    password: "ics385",
                    database: "mydb"
                });

                console.log("query: " + dbquery);

                // Attach listener on end event. Query the database. 
                connection.query(dbquery, function(err, rows, fields) {
                    if (err) return replyError(response, dbquery);
                    replySuccess(response, 'application/json', JSON.stringify(rows));
                });
            } else if (mypath.search("db/passenger") > -1) {

                var dbquery = '';

                if (mypath.search("db/passenger/list") > -1) {
                    dbquery = 'SELECT DISTINCT passenger FROM mydb.MEO ORDER BY passenger;';
                } else if (obj.query.name) {
                    var passenger = obj.query.name;
                    dbquery = "SELECT idMEO, passenger, route, date, pickup, startstreet, startcity, deststreet, destcity FROM mydb.MEO  WHERE passenger='" + passenger + "' ORDER BY passenger, date, pickup;";
                } else {
                    return replyError(response, mypath);
                }

                // Create the connection. 
                // Data is default to new mysql installation and should be changed according to your configuration. 
                var connection = mysql.createConnection({
                    user: "student",
                    password: "ics385",
                    database: "mydb"
                });

                console.log("query: " + dbquery);

                // Attach listener on end event. Query the database. 
                connection.query(dbquery, function(err, rows, fields) {
                    if (err) return replyError(response, dbquery);
                    replySuccess(response, 'application/json', JSON.stringify(rows));
                });
            } else if (mypath.search("dat/") > -1) {
                var datafile = "";
                var datatype = "";

                switch (mypath) {
                    case "dat/astraptes":
                        datafile = "meo/astraptes.json";
                        datatype = "application/json";
                        break;
                    case "dat/sensors":
                        datafile = "meo/sensors.json";
                        datatype = "application/json";
                        break;
                    default:
                        return replyError(response, mypath);
                }

                console.log("Datafile: " + datafile + ", Datatype: " + datatype);

                fs.readFile(datafile, function(err, data) {
                    if (err) return replyError(response, datafile);
                    replySuccess(response, datatype, data);
                });
            } else {
                return replyError(response, mypath);
            }
            break;
        case 'POST':
            console.log("[200] " + request.method + " to " + request.url);
            var fullBody = '';

            request.on('data', function(chunk) {
                // append the current chunk of data to the fullBody variable
                fullBody += chunk.toString();
            });

            request.on('end', function() {

                // request ended -> do something with the data
                if (mypath.search("dbmod/route") > -1) {

                    // parse the received body data
                    var decodedBody = querystring.parse(fullBody);

                    var primarykey = decodedBody.idMEO;
                    var dbquery = "";

                    if (primarykey === "") return replyError(response, dbquery);

                    dbquery = "UPDATE mydb.MEO SET";

                    if (decodedBody.route) dbquery += " route='" + decodedBody.route + "',";
                    if (decodedBody.vechicle) dbquery += " vechicle='" + decodedBody.vechicle + "',";
                    if (decodedBody.date) dbquery += " date='" + decodedBody.date + "',";
                    if (decodedBody.pickup) dbquery += " pickup='" + decodedBody.pickup + "',";
                    
                    if (decodedBody.fromAddress){
                        var comma = decodedBody.fromAddress.lastIndexOf(",");
                        dbquery += " startstreet='" + decodedBody.fromAddress.slice(0,comma) + "',";
                        dbquery += " startcity='" + decodedBody.fromAddress.slice(comma+1) + "',";
                    }
                    if (decodedBody.toAddress) {
                        var comma = decodedBody.toAddress.lastIndexOf(",");
                        dbquery += " deststreet='" + decodedBody.toAddress.slice(0,comma) + "',";
                        dbquery += " destcity='" + decodedBody.toAddress.slice(comma+1) + "' ";
                    }

                    if (dbquery.slice(-1) === ",") dbquery = dbquery.slice(0, -1);

                    dbquery += " WHERE idMEO='" + primarykey + "';";

                    // Create the connection. 
                    // Data is default to new mysql installation and should be changed according to your configuration. 
                    var connection = mysql.createConnection({
                        user: "student",
                        password: "ics385",
                        database: "mydb"
                    });

                    console.log("query: " + dbquery);

                    // Attach listener on end event. Query the database. 
                    connection.query(dbquery, function(err, rows, fields) {
                        if (err) return replyError(response, dbquery);
//                          replySuccess(response, 'application/json', "Update was successful: " + JSON.stringify(rows));
                            replySuccess(response, 'text/html', "<html><body><p style='color: white; font-size: 14pt'>Successful update</p></body></html>");
                        });
                }
                 // request ended -> do something with the data
                else if (mypath.search("dbmod/passenger") > -1) {

                    // parse the received body data
                    var decodedBody = querystring.parse(fullBody);

                    var primarykey = decodedBody.idMEO;
                    var dbquery = "";

                    if (primarykey === "") return replyError(response, dbquery);

                    dbquery = "UPDATE mydb.MEO SET";

                    if (decodedBody.vechicle) dbquery += " passenger='" + decodedBody.vechicle + "',";
                    if (decodedBody.route) dbquery += " route='" + decodedBody.route + "',";
                    if (decodedBody.date) dbquery += " date='" + decodedBody.date + "',";
                    if (decodedBody.pickup) dbquery += " pickup='" + decodedBody.pickup + "',";

                    if (decodedBody.fromAddress){
                        var comma = decodedBody.fromAddress.lastIndexOf(",");
                        dbquery += " startstreet='" + decodedBody.fromAddress.slice(0,comma) + "',";
                        dbquery += " startcity='" + decodedBody.fromAddress.slice(comma+1) + "',";
                    }
                    if (decodedBody.toAddress) {
                        var comma = decodedBody.toAddress.lastIndexOf(",");
                        dbquery += " deststreet='" + decodedBody.toAddress.slice(0,comma) + "',";
                        dbquery += " destcity='" + decodedBody.toAddress.slice(comma+1) + "' ";
                    }

                    if (dbquery.slice(-1) === ",") dbquery = dbquery.slice(0, -1);

                    dbquery += " WHERE idMEO='" + primarykey + "';";

                    // Create the connection. 
                    // Data is default to new mysql installation and should be changed according to your configuration. 
                    var connection = mysql.createConnection({
                        user: "student",
                        password: "ics385",
                        database: "mydb"
                    });

                    console.log("query: " + dbquery);

                    // Attach listener on end event. Query the database. 
                    connection.query(dbquery, function(err, rows, fields) {
                        if (err) return replyError(response, dbquery);
//                        replySuccess(response, 'application/json', "Update was successful: " + JSON.stringify(rows));
                            replySuccess(response, 'text/html', "<html><body><p style='color: white; font-size: 14pt'>Successful update</p></body></html>");
                    });
                }
            });

            break;
        default:
            console.log("[405] " + request.method + " to " + request.url);
            response.writeHead(405, "Method not supported", {
                'Content-Type': 'text/html'
            });
            response.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
            break;
    }

});

server.listen(process.argv[2]);
console.log("Listening on port: " + process.argv[2]);
