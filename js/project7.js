function GIS() {
        //--- GIS Properties
	this.response = null;
        this.gmStreet = null;
	this.dbroute = null;
	this.dbpass = null;
        this.geocoder = new google.maps.Geocoder();

        this.apikey = "?key=AIzaSyCckMCTYOqMly5Ye8HAa74ijG69vOzBz8Q";

        this.rb1 = document.getElementById('rb1');
        this.rb2 = document.getElementById('rb2');
        this.rb4 = document.getElementById('rb4');

        this.panelRoute = document.getElementById('panelRoute');
        this.panelPlace = document.getElementById('panelPlace');
        this.panelSearch = document.getElementById('panelSearch');
        this.panelTransit = document.getElementById('panelTransit');

        this.panel = null;

        //--- GIS Methods
        this.init = function() {
	    this.response = document.getElementById('response');
            this.gmStreet = document.getElementById('gmStreet');
	    this.dbroute = document.getElementById('dbroute');
	    this.dbpass = document.getElementById('dbpass');
            this.showPanel();
            this.showRoute("Kahului,Wailuku");
        };

        this.showPanel = function() {
            if (this.panel)
                this.panel.setAttribute("style", "display: none");

            if (this.rb1.checked) {
                this.panelRoute.setAttribute("style", "display: block");
                this.panel = this.panelRoute;
            }
            else if (this.rb2.checked) {
                this.panelPlace.setAttribute("style", "display: block");
                this.panel = this.panelPlace;
            }
            else if (this.rb4.checked) {
                this.panelTransit.setAttribute("style", "display: block");
                this.panel = this.panelTransit;
		this.requestRouteList();
		this.requestPassengerList();
            }
        };

        this.showRoute = function(route) {
            if (route === "") return;

            var res = route.split(",");
            var url = "https://www.google.com/maps/embed/v1/directions";
            url += this.apikey;
            url += "&mode=transit";
            url += "&origin=" + res[0];
            url += "&destination=" + res[1];

            this.response.innerHTML = "<iframe width=100% height=1000px src=" + url + "></iframe>";
            this.geocodeAddress(res[1]);
        };

        this.showPlace = function() {
            var address = document.getElementById("idPlace").value;

            var url = "https://www.google.com/maps/embed/v1/place";
            url += this.apikey;
            url += "&q=" + address;
            
            url = url.replace(",", "+");
            url = url.replace(" ", "");

            this.response.innerHTML = "<iframe width=100% height=1000px src=" + url + "></iframe>";
            this.geocodeAddress(address);
        };

        this.showSearch = function() {
            var address = document.getElementById("idPlace").value;
            var url = "https://www.google.com/maps/embed/v1/search";
            url += this.apikey;
            url += "&q=" + address.replace(",", "+");

            if (document.getElementById("rbBus").checked) {
                // Append 'bus stop' to search query.
                url += "+bus+stop";
            }
            else if (document.getElementById("rbRest").checked) {
                // Append restaurant to search query.
                url += "+restaurant";
            }
            else if (document.getElementById("rbHosp").checked) {
                // Append hospital to search query
                url += "+hospital";
            } else {
                return;
            }
            
            // Remove all spaces from url.
            url = url.replace(" ", "");

            this.response.innerHTML = "<iframe width=100% height=1000px src=" + url + "></iframe>";
            this.geocodeAddress(address);
        };

        this.showTransit = function() {
            var pickup = document.getElementById("idPickup").value;
            pickup = pickup.replace(/,/g, " ");

            var dropoff = document.getElementById("idDropoff").value;
            dropoff = dropoff.replace(/,/g, " ");

            var route = pickup + "," + dropoff;
            this.response.innerHTML = "<iframe width=100% height=1000px src=" + url + "></iframe>";
            this.geocodeAddress(dropoff);
        };

        this.geocodeAddress = function(address) {
            var self = this;
            this.geocoder.geocode({
                'address': address
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var loc = results[0].geometry.location.toString();
                    var url = "https://www.google.com/maps/embed/v1/streetview";
                    url += self.apikey;
                    //url += "&heading=210";
                    //url += "&pitch=10";
                    url += "&fov=35";
                    url += "&location=" + loc.substring(1, loc.length - 1);
                    self.gmStreet.setAttribute("src", url);
                }
                else {
                    console.log("Geocode was not successful for the following reason: " + status);
                }
            });
        };

	this.requestRouteList = function() {

	    // send the asynchronous request
	    var asyncRequest = new XMLHttpRequest();
	    var self = this;

            var dbquery = "db/route/list";
	    asyncRequest.addEventListener("readystatechange",
		function() { self.parseRouteList(asyncRequest); },
		false);

	    asyncRequest.open("GET", dbquery, true);
	    asyncRequest.setRequestHeader("Accept", "application/json");
	    asyncRequest.send(); // send request        
	};

	this.requestPassengerList = function() {

	    // send the asynchronous request
	    var asyncRequest = new XMLHttpRequest();
	    var self = this;

            var dbquery = "db/passenger/list";
	    asyncRequest.addEventListener("readystatechange",
		function() { self.parsePassengerList(asyncRequest); },
		false);

	    asyncRequest.open("GET", dbquery, true);
	    asyncRequest.setRequestHeader("Accept", "application/json");
	    asyncRequest.send(); // send request        
	};

	this.parseRouteList = function(asyncRequest) {
	    if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
		var json = JSON.parse(asyncRequest.responseText);
		var ostr = ""; // begin the table
                
                // <option value="db/route">Routes Report</option>

		for (var idx = 0; idx < json.length; ++idx) {
		    ostr += "<option ";
		    ostr += "value='db/route?name=" + json[idx].route + "'>";
                    ostr += json[idx].route;
		    ostr += "</option>";
		}

		this.dbroute.innerHTML = ostr;
	    }
	};

	this.parsePassengerList = function(asyncRequest) {
	    if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
		var json = JSON.parse(asyncRequest.responseText);
		var ostr = ""; // begin the table
                
                // <option value="db/route">Routes Report</option>

		for (var idx = 0; idx < json.length; ++idx) {
		    ostr += "<option ";
		    ostr += "value='db/passenger?name=" + json[idx].passenger + "'>";
                    ostr += json[idx].passenger;
		    ostr += "</option>";
		}

		this.dbpass.innerHTML = ostr;
	    }
	};
	
	this.fillRouteForm = function(e) {
		var json = JSON.parse(e.target.attributes.data_form.value);

		var childlist = document.getElementById('frmMEO').getElementsByTagName('input');
		document.getElementById('frmMEO').setAttribute("action", "dbmod/route");

		for (var i=0; i<childlist.length; i++) {
			switch (childlist[i].name) {
				case 'idMEO':
					childlist[i].value = json.idMEO;
					break;
				case 'subject':
					childlist[i].value = "route";
					break;
				case 'route':
					childlist[i].value = json.route;
					break;
				case 'vechicle':
					childlist[i].value = json.vechicle;
					break;
				case 'date':
					childlist[i].value = json.date;
					break;
				case 'pickup':
					childlist[i].value = json.pickup;
					break;
				case 'fromAddress':
					childlist[i].value = json.startstreet+", "+json.startcity;
					break;
				case 'toAddress':
					childlist[i].value = json.deststreet+", "+json.destcity;
					break;
			}
		}
        };

	this.fillPassForm = function(e) {
		var json = JSON.parse(e.target.attributes.data_form.value);

		var childlist = document.getElementById('frmMEO').getElementsByTagName('input');
		document.getElementById('frmMEO').setAttribute("action", "dbmod/passenger");

		for (var i=0; i<childlist.length; i++) {
			switch (childlist[i].name) {
				case 'idMEO':
					childlist[i].value = json.idMEO;
					break;
				case 'subject':
					childlist[i].value = "passenger";
					break;
				case 'route':
					childlist[i].value = json.route;
					break;
				case 'vechicle':
					childlist[i].value = json.passenger;
					break;
				case 'date':
					childlist[i].value = json.date;
					break;
				case 'pickup':
					childlist[i].value = json.pickup;
					break;
				case 'fromAddress':
					childlist[i].value = json.startstreet+", "+json.startcity;
					break;
				case 'toAddress':
					childlist[i].value = json.deststreet+", "+json.destcity;
					break;
			}
		}
        };

    } //--- End of GIS Prototype