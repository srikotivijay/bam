sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/resource/ResourceModel"
],function (Controller, History,Filter, FilterOperator,MessageToast,ResourceModel) {
	
		var oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", {
						json: true,
						tokenHandling: true
					});
					
		var oi18nModel = new ResourceModel({
                bundleName: "bam.i18n.i18n"
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
		
		// function to get unique GMID/Country Combinations from DB
    	function getGMIDListFromDB(gmidList,viewpath) {
            var result;                            
            var gmidFilterArray = [];
            gmidList.forEach(function(item) {
	            var gmidFilter = new Filter("GMID",sap.ui.model.FilterOperator.EQ,item.GMID);
	            var gmidFilterList = new Filter ({
                    filters : [
                        gmidFilter
                        ],
                        and : true
                    });
	            gmidFilterArray.push(gmidFilterList);
            });
            // Get data for all GMIDS Entered in UI
            oDataModel.read(viewpath, {
                filters: gmidFilterArray,
                async: false,
				success: function(oData, oResponse) {
                    var GMIDCountryList = [];
		            // get all the GMID/Country List for each row returned
		            oData.results.forEach(function(item) {
		            GMIDCountryList.push(item);
		            });
            		result = GMIDCountryList;
                },
                error: function(oError) {
                    MessageToast.show("Error getting GMID/Country List. Please contact System Admin.");                         
                    result = [];
                }
            });
			return result;
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
		
		function deleteStagingData(loggedInUserID)
		{
			var result;
			//making filter for user ID
			var filterArray=[];
	    	var userFilter = new Filter("CREATED_BY",sap.ui.model.FilterOperator.EQ,loggedInUserID);
			filterArray.push(userFilter);
			
			oDataModel.read("/GMID_SHIP_TO_COUNTRY_STG",{
				filters: filterArray,
				async: false,
                success: function(oData, oResponse){
            		// delete any records for this user from the staging table
	    	    	// get the count of records in staging table
	    	    	var batchArray = [];
	    			for(var k = 0; k < oData.results.length; k++) 
	    			{
	    				// delete the data from staging table i.e. GMID_SHIP_TO_COUNTYRY_STG
	    				batchArray.push(oDataModel.createBatchOperation("GMID_SHIP_TO_COUNTRY_STG(" + oData.results[k].ID + ")", "DELETE"));
	    			}
					oDataModel.addBatchChangeOperations(batchArray);
					
				   // submit the batch update command
					oDataModel.submitBatch(
						function(oData,oResponse)
						{
							result = true;
				    	},
				    	function(oError)
				    	{
				    		result = false;
				    		MessageToast.show("Unable to delete staging records for user. Please contact System Admin.");
				    	}
				    );
					
                },
    		    error: function(){
    		    	result = false;
            		MessageToast.show("Unable to retrieve staging records for user. Please contact System Admin.");
    			}
			});
			
			return result;
		}
		
		// 
		function getDropdownValues(dropdownType)
		{
			var result;
			// Create a filter & sorter array
			var filterArray = [];
			var countryFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,dropdownType);
			filterArray.push(countryFilter);
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("LABEL",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			oDataModel.read("/CODE_MASTER",{
					filters: filterArray,
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve countries.");
	            		result = [];
	    			}
	    	});
	    	return result;
		}
		// below function will return the GMID Country Status ID from CODE_Master TABLE
		function getGMIDCountryStatusID()
		{
			// by default while creating the new GMID, the GMID Country Status will be Submitted
        	 var ogmidcountryStatus = oi18nModel.getProperty("submitted");
    	    
			// Create a filter to fetch the GMID Country Status Code ID
			var gmidcountrycodeFilterArray = [];
			var gmidcountrycodetypeFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"GMID_COUNTRY_STATUS");
			gmidcountrycodeFilterArray.push(gmidcountrycodetypeFilter);
			var gmidcountrycodekeyFilter = new Filter("CODE_KEY",sap.ui.model.FilterOperator.EQ,ogmidcountryStatus);
			gmidcountrycodeFilterArray.push(gmidcountrycodekeyFilter);
			
			var gmidcountrystatusID = null;

			// Get the GMID Country Status Code ID CODE_MASTER table
			oDataModel.read("/CODE_MASTER?$select=ID",{
					filters: gmidcountrycodeFilterArray,
					async: false,
	                success: function(oData, oResponse){
	                	//return the Code ID
	                   gmidcountrystatusID = oData.results[0].ID; 
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve Code ID for GMID Country Status.");
	    			}
	    		});
	    	return gmidcountrystatusID;
		}
         
		var exports = {
			getAttributeListBasedOnUserID: getAttributeListBasedOnUserID,
			getUserID: getUserID,
			getGMIDListFromDB: getGMIDListFromDB,
			getMaxID: getMaxID,
			getUserPermissions: getUserPermissions,
			isBAMUser : isBAMUser,
			getDropdownValues: getDropdownValues,
			deleteStagingData: deleteStagingData,
			getGMIDCountryStatusID: getGMIDCountryStatusID
		};
	
		return exports;

});