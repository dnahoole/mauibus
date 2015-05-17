function MyAJAX() {
	//--- GIS Properties
	this.response = null;

	this.init = function() {
	    this.response = document.getElementById('response');
	    var route = document.getElementById('dataSrc').value;
	    this.requestJSON(route);
	};

	this.requestJSON = function(myfile) {
	    if (myfile === "") return;
            
	    var self = this;
            var datatype = "";
	    
	    // send the asynchronous request
	    var asyncRequest = new XMLHttpRequest();
    
	    switch (myfile) {
	    case "bus/maui":
                datatype = "text/plain";
		asyncRequest.addEventListener("readystatechange",
		    function() { self.loadPDF(asyncRequest); },
		    false);
		break;
	    default:
                datatype = "application/json";
		asyncRequest.addEventListener("readystatechange",
		    function() { self.parseJSON(asyncRequest); },
		    false);
		break;
	    }

	    asyncRequest.open("GET", myfile, true);
	    asyncRequest.setRequestHeader("Accept", datatype);
	    asyncRequest.send(); // send request
	};

	this.parseJSON = function(asyncRequest) {
	    if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
		var json = JSON.parse(asyncRequest.responseText);
		var ostr = "<table>"; // begin the table
		ostr += "<thead><tr><th colspan='16'>" + json.route + "</th></tr></thead>"; // year column heading
		ostr += "<tbody>";

		for (var loc = 0; loc < json.stop.length; ++loc) {
		    if (loc % 2 !== 0) {
			ostr += "<tr class='oddrow'>";
		    }
		    else {
			ostr += "<tr>";
		    }

		    ostr += "<td><input class='tblLocation' type='button' value='" + json.stop[loc].location + "' onclick='gis.geocodeAddress(value)'></td>";

		    // output a table row for each year
		    for (var idx = 0; idx < json.stop[loc].time.length; ++idx) {
			ostr += "<td>" + json.stop[loc].time[idx] + "</td>";
		    } //end for
		    ostr += "</tr>";
		}

		ostr += "</tbody></table>";
		this.response.innerHTML = ostr;
	    }
	};

	this.requestRoute = function(dbquery) {
	    if (dbquery === "") return;

	    // send the asynchronous request
	    var asyncRequest = new XMLHttpRequest();
	    var self = this;

	    asyncRequest.addEventListener("readystatechange",
		function() { self.parseRoute(asyncRequest); },
		false);

	    asyncRequest.open("GET", dbquery, true);
	    asyncRequest.setRequestHeader("Accept", "application/json");
	    asyncRequest.send(); // send request        
	};

	this.requestPassenger = function(dbquery) {
	    if (dbquery === "") return;

	    // send the asynchronous request
	    var asyncRequest = new XMLHttpRequest();
	    var self = this;

	    asyncRequest.addEventListener("readystatechange",
		function() { self.parsePassenger(asyncRequest); },
		false);

	    asyncRequest.open("GET", dbquery, true);
	    asyncRequest.setRequestHeader("Accept", "application/json");
	    asyncRequest.send(); // send request        
	};

	this.parseRoute = function(asyncRequest) {
	    if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
		var json = JSON.parse(asyncRequest.responseText);
		var ostr = "<table>"; // begin the table
		ostr += "<thead>";
		ostr += "<tr><th colspan='6'>MEO Paratransit Route Report</th></tr>";
		ostr += "<tr><th>Route</th><th>Vehicle</th><th>Date</th><th>Pickup</th><th>From</th><th>To</th></tr>";
		ostr += "</thead>";
		ostr += "<tbody>";

		for (var idx = 0; idx < json.length; ++idx) {
		    if (idx % 2 !== 0) {
			ostr += "<tr class='oddrow'>";
		    }
		    else {
			ostr += "<tr>";
		    }
                    var dbrec = JSON.stringify(json[idx]);
		    ostr += "<td><input class='tblLocation' type='button' value='" + json[idx].route + "' onclick='gis.fillRouteForm(event)' data_form='"+dbrec+"'></td>";
		    ostr += "<td>" + json[idx].vechicle + "</td>";
		    ostr += "<td>" + json[idx].date + "</td>";
		    ostr += "<td>" + json[idx].pickup + "</td>";
		    ostr += "<td><input class='tblLocation' type='button' value='" + json[idx].startstreet + ", " + json[idx].startcity + "' onclick='gis.geocodeAddress(value)'></td>";
		    ostr += "<td><input class='tblLocation' type='button' value='" + json[idx].deststreet + ", " + json[idx].destcity + "' onclick='gis.geocodeAddress(value)'></td>";
		    ostr += "</tr>";
		}

		ostr += "</tbody></table>";
		this.response.innerHTML = ostr;
	    }
	};

	this.parsePassenger = function(asyncRequest) {
	    if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
		var json = JSON.parse(asyncRequest.responseText);
		var ostr = "<table>"; // begin the table
		ostr += "<thead>";
		ostr += "<tr><th colspan='6'>MEO Paratransit Passenger Report</th></tr>";
		ostr += "<tr><th>Passenger</th><th>Route</th><th>Date</th><th>Pickup</th><th>From</th><th>To</th></tr>";
		ostr += "</thead>";
		ostr += "<tbody>";

		for (var idx = 0; idx < json.length; ++idx) {
		    if (idx % 2 !== 0) {
			ostr += "<tr id='"+json[idx].idMEO+"' class='oddrow'>";
		    }
		    else {
			ostr += "<tr id='"+json[idx].idMEO+"'>";
		    }
                    var dbrec = JSON.stringify(json[idx]);
		    ostr += "<td><input class='tblLocation' type='button' value='" + json[idx].passenger + "' onclick='gis.fillPassForm(event)' data_form='"+dbrec+"'></td>";
		    ostr += "<td>" + json[idx].route + "</td>";
		    ostr += "<td>" + json[idx].date + "</td>";
		    ostr += "<td>" + json[idx].pickup + "</td>";
		    ostr += "<td><input class='tblLocation' type='button' value='" + json[idx].startstreet + ", " + json[idx].startcity + "' onclick='gis.geocodeAddress(value)'></td>";
		    ostr += "<td><input class='tblLocation' type='button' value='" + json[idx].deststreet + ", " + json[idx].destcity + "' onclick='gis.geocodeAddress(value)'></td>";
		    ostr += "</tr>";
		}

		ostr += "</tbody></table>";
		this.response.innerHTML = ostr;
	    }
	};

	this.loadPDF = function(asyncRequest) {
	    if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
		var pdfname = asyncRequest.responseText;
                if (pdfname === "") return;
                
                this.response.innerHTML = "<object data=" + pdfname + " type='application/pdf' width='100%' height='100%'>"
                this.response.innerHTML += "<p>No PDF plugin found for this browser.</p></object>"
            }
	};
    } //end-of-prototype
