function MyStorage() {

	var self = this;

	this.init = function() {
	    if (typeof(Storage) !== "undefined") {
	        if (localStorage.webservice) {
			    self.loadStorage();
	        } else {
	        	localStorage.webservice = "";
	        }
	    } else {
	        document.getElementById("ifResponse").innerHTML = "Sorry, your browser does not support web storage...";
	        return;
	    }
		document.getElementById('btnSubmit').addEventListener("click", self.saveStorage, false);
	};

	this.saveStorage = function() {
	    localStorage.webservice = document.getElementById("webservice").value;
	};

	this.loadStorage = function() {
	    document.getElementById("webservice").value = localStorage.webservice;
	};
	
} //end-of-prototype

var mystore = new MyStorage();
window.addEventListener("load", mystore.init, false);