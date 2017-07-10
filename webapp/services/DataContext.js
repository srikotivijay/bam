sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
],function (Controller, History,Filter, FilterOperator,MessageToast) {
	
		var oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", {
						json: true,
						tokenHandling: true
					});
	
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
		
		function getUserID()
		{
			var result;
			$.ajax({
			    url : "/services/userapi/currentUser",
			    type : "get",
			    async: false,
			    success : function(data) {
			    	if(data !== "" && data !== null)
			    	{
			    		result = data.name;
			    	}
			    	else
			    	{
			    		result = "";
			    	}
			    	
			    },
			    error: function() {
			    	MessageToast.show("Error getting user ID. Please contact System Admin.");                         
					result = "";
			    }
			});
			 
			return result;
		}
		
		//function that checks whether the current logged in user should have access to BAM or not
		function isBAMUser()
		{
			var result;
			$.ajax({
			    url : "/services/userapi/currentUser",
			    type : "get",
			    async: false,
			    success : function(data) {
			    	if(data !== "" && data !== null)
			    	{
			    		oDataModel.read("USER", {
							async: false,
							filters: [ 
								new Filter("USER_ID", FilterOperator.EQ, data.name)
							],
							success: function(oData, oResponse) {
								if(oData.results.length !== 0)
								{
									result = true;
								}
								else
								{
									result = false;
								}
							},
							error: function(oError) {
								MessageToast.show("Error getting user information. Please contact System Admin.");                         
								result = false;
							}
						});	
			    	}
			    	else
			    	{
			    		result = false;
			    	}
			    },
			    error: function() {
			    	MessageToast.show("Error getting user information. Please contact System Admin.");                         
					result = false;
			    }
			});
			 
			return result;
		}
		
		function getUserMapping(userID) {
	    	return new Promise(function(resolve, reject) {
	            Promise.resolve()
	            .then(function() {
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
    	
    	// function to get user roles.  First gets the current user that's logged in 
    	function getUserPermissions() {
    		var result;
    		$.ajax({
			    url : "/services/userapi/currentUser",
			    type : "get",
			    async: false,
			    success : function(data) {
			    	oDataModel.read("V_USER_ROLE_ATTRIBUTE_MAPPING", {
						async: false,
						filters: [ 
							new Filter("USER_ID", FilterOperator.EQ, data.name)
						],
						success: function(oData, oResponse) {
							var permissionList = [];
			            	
			            	// get all the attributes for each row returned
			            	oData.results.forEach(function(item) {
	            			permissionList.push(item);

			            	});
			            	
			            	result = permissionList;
						},
						error: function(oError) {
							MessageToast.show("Error getting user roles. Please contact System Admin.");                         
							result = [];
						}
					});	
			    
			    },
			    error: function() {
			       MessageToast.show("Error getting user roles. Please contact System Admin.");                         
							result = [];
			    }
			 });
			 
			return result;
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
		
		function lpadstring(gmid)
		{
			while (gmid.length < 8)
        		gmid = "0" + gmid;
    		return gmid;
		}
		
		function checkGMIDCountryUniqueInDB(gmid,countryid)
		{
			// Create a filter to fetch the GMID Country Status Code ID
			var gmidcountrycodeuniqueFilterArray = [];
			var gmidFilter = new Filter("GMID",sap.ui.model.FilterOperator.EQ,lpadstring(gmid));
			gmidcountrycodeuniqueFilterArray.push(gmidFilter);
			var countrycodeFilter = new Filter("COUNTRY_CODE_ID",sap.ui.model.FilterOperator.EQ,countryid);
			gmidcountrycodeuniqueFilterArray.push(countrycodeFilter);
			
			var validInput = true;

			 // Get the GMID Country Status Code ID CODE_MASTER table
			 oDataModel.read("/GMID_SHIP_TO_COUNTRY?$select=ID",{
					filters: gmidcountrycodeuniqueFilterArray,
					async: false,
	                success: function(oData, oResponse){
	                //return the GMID Country ID
	                	if(oData.results.length !== 0)
	                	{
	                		validInput = false;
	                	}
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve Code ID for GMID Country Status.");
	    			}
	    		});
	    	return validInput;
		}
		
		function getMaxID(tablePath)
		{
			// Create a filter & sorter array to fetch the max ID
			var idSortArray = [];
			var idSort = new sap.ui.model.Sorter("ID",true);
			idSortArray.push(idSort);
			
			var maxID = null;

			 // Get the Max ID from  GMID_SHIP_FROM_PLANT table
			 oDataModel.read(tablePath + "?$top=1&$select=ID",{
					sorters: idSortArray,
					async: false,
	                success: function(oData, oResponse){
	                	//return the max ID
	                	if(oData.results.length === 0){
	                		maxID = 0;
	                	}
	                	else {maxID = oData.results[0].ID; }
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve max ID for GMID Ship from table.");
	    			}
	    		});
	    	return maxID;
		}
		
		var exports = {
			getAttributeListBasedOnUserID: getAttributeListBasedOnUserID,
			getUserID: getUserID,
			checkGMIDCountryUniqueInDB: checkGMIDCountryUniqueInDB,
			getMaxID: getMaxID,
			getUserPermissions: getUserPermissions,
			isBAMUser : isBAMUser
		};
	
		return exports;

});