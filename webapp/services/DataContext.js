sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],function (Controller, History,Filter, FilterOperator) {
	
		function callService(url) {
			return new Promise(function(resolve, reject) {
				$.get(url)
				.done(function(data) {
					// data.name returns the SID of the user
					resolve(data.name);
				})
				.fail(function(error) {
					reject(error);
				});	
			});
		}
		
		function getUserMapping(userID) {
	    	return new Promise(function(resolve, reject) {
	            Promise.resolve()
	            .then(function() {
	            	var oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", {
						json: true,
						tokenHandling: true
					});
					
					return new Promise(function(oDataResolve) {
						oDataModel.read("V_USER_ROLE_ATTRIBUTE_MAPPING", {
							filters: [ 
								new Filter("USER_ID", FilterOperator.EQ, userID)
							],
							success: function(oData, oResponse) {
								oDataResolve(oData);
							}
						});	
					});
	            })
	            .then(function(data) {
	            	var attributeList = [];
	            	
	            	// get all the attributes for each row returned
	            	data.results.forEach(function(item) {
						attributeList.push(item.ATTRIBUTE);
	            	});
	            		
	    			resolve(attributeList);
	            })
	            .catch(function(error) {
	        		reject(error);
	        	});
	        });
    	}
    	
		function getAttributeListBasedOnUserID()
		{
			return new Promise(function (resolve, reject) {
				var oDataServiceURL = "/services/userapi/currentUser";
				
				callService(oDataServiceURL)
				.then(getUserMapping)
				.then(function(attributeList) {
					resolve(attributeList);	
				})
				.catch(function(error) {
					reject(error);
				});
			});
		}
		
		var exports = {
			getAttributeListBasedOnUserID: getAttributeListBasedOnUserID
		};
	
		return exports;

});