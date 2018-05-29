sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/MessageBox"
],function (Controller, History,Filter, FilterOperator,MessageToast,ResourceModel,MessageBox) {
	
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
			    	MessageBox.alert("Error getting user ID. Please contact System Admin.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
					});
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
								MessageBox.alert("Error getting user information. Please contact System Admin.",
								{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
								});
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
			    	MessageBox.alert("Error getting user information. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});                       
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
							MessageBox.alert("Error getting user roles. Please contact System Admin.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
							result = [];
						}
					});	
			    
			    },
			    error: function() {
			       MessageBox.alert("Error getting user roles. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});                       
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
                    MessageBox.alert("Error getting GMID/Country List. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});    
                    result = [];
                }
            });
			return result;
		}

		// function to get unique GMID/Country Combinations from DB
    	function getGMIDListFromDBByGMIDPad(gmidList,viewpath) {
            var result;                            
            var gmidFilterArray = [];
            gmidList.forEach(function(item) {
	            var gmidFilter = new Filter("GMID_PAD",sap.ui.model.FilterOperator.EQ,item.GMID);
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
                    MessageBox.alert("Error getting GMID/Country List. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});    
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
	    		    	MessageBox.alert("Unable to retrieve max ID for GMID Ship from table. Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						}); 
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
				    		MessageBox.alert("Unable to delete staging records for user. Please contact System Admin.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
				    	}
				    );
					
                },
    		    error: function(){
    		    	result = false;
            		MessageBox.alert("Unable to delete staging records for user. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});
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
    		    		MessageBox.alert("Unable to retrieve dropdown values for " + dropdownType + " Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		}
		
		function getDropdownValuesEdit(dropdownType)
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
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for " + dropdownType + " Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		}
		
		
		// get the Country List for Non Admin
		function getNonAdminDropdownValues(dropdownType)
		{
			var result;
			// get the Custom1 values to be filtered for Admins and Non Admins to fetch the country list
        	 var ocustom1N = oi18nModel.getProperty("custom1N");
  			// Create a filter & sorter array
			var filterArray = [];
			var countryFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,dropdownType);
			filterArray.push(countryFilter);
			// Below filter is only applicable for COUNTRY Code Type and for Non Admins
			var countrycustom1NFilter = new Filter("CUSTOM1",sap.ui.model.FilterOperator.EQ,ocustom1N);
			filterArray.push(countrycustom1NFilter);

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
    		    		MessageBox.alert("Unable to retrieve dropdown values for " + dropdownType + " Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
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
    		    		MessageBox.alert("Unable to retrieve Code ID for GMID Country Status.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	    			}
	    		});
	    	return gmidcountrystatusID;
		}
        
        // function to get GMID/Country Plant Combinations from DB
    	function getGMIDCountryPlantListFromDB(gmididsList,viewpath) {
           var result;                            
            var gmididFilterArray = [];
              gmididsList.forEach(function(item) {
	            var gmidFilter = new Filter("ID",sap.ui.model.FilterOperator.EQ,item.ID);
	            var gmidFilterList = new Filter ({
                    filters : [
                        gmidFilter
                        ],
                        and : false
                    });
	            gmididFilterArray.push(gmidFilterList);
            });
            // Get data for all GMIDS Entered in UI
            oDataModel.read(viewpath, {
                filters: gmididFilterArray,
                async: false,
				success: function(oData, oResponse) {
                   // var GMIDCountryPlantList = [];
		            // get all the GMID/Country List for each row returned
		           // oData.results.forEach(function(item) {
		            //GMIDCountryPlantList.push(item);
		          //  });
            	//	result = GMIDCountryPlantList;
            		result = oData.results;
                },
                error: function(oError) {
                    MessageBox.alert("Error getting GMID/Country Plant List. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});    
                    result = [];
                }
            });
			return result;
		}
		
		// function to get unique Rules Combinations
    	function getrulesFromDB(rulekey,viewpath) {
            var result;                            
           // Create a filter to fetch the Rules based on Rule Seq
			var ruleseqFilterArray = [];
			var ruleseqtypeFilter = new Filter("CU_RULESET_SEQ",sap.ui.model.FilterOperator.EQ,rulekey);
			ruleseqFilterArray.push(ruleseqtypeFilter);
            // Get data for all GMIDS Entered in UI
            oDataModel.read(viewpath, {
                filters: ruleseqFilterArray,
                async: false,
				success: function(oData, oResponse) {
                    var RulesList = [];
		            // get all the GMID/Country List for each row returned
		            oData.results.forEach(function(item) {
		            RulesList.push(item);
		            });
            		result = RulesList;
                },
                error: function(oError) {
                    MessageBox.alert("Error getting Rules List for Validation. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});    
                    result = [];
                }
            });
			return result;
		}
		
		// function to get people unique Rules Combinations
    	function getPeopleRulesFromDB(viewpath, filters) {
            var result;                            
           // Create a filter to fetch the Rules based on Rule Seq
			var ruleseqFilterArray = [];
			//var ruleseqtypeFilter = new Filter("CU_RULESET_SEQ",sap.ui.model.FilterOperator.EQ,rulekey);
			var ruleseqtypeFilter = filters;
			ruleseqFilterArray.push(ruleseqtypeFilter);
            // Get data for all GMIDS Entered in UI
            oDataModel.read(viewpath, {
                filters: ruleseqFilterArray,
                async: false,
				success: function(oData, oResponse) {
                    var RulesList = [];
		            // get all the GMID/Country List for each row returned
		            oData.results.forEach(function(item) {
		            RulesList.push(item);
		            });
            		result = RulesList;
                },
                error: function(oError) {
                    MessageBox.alert("Error getting Rules List for Validation. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});    
                    result = [];
                }
            });
			return result;
		}
		
				// function to get people unique Rules Combinations
    	function getViewByFilter(viewpath, filters) {
            var result;                            
           // Create a filter to fetch the Rules based on Rule Seq
			var ruleseqFilterArray = [];
			ruleseqFilterArray.push(filters);
            // Get data for all GMIDS Entered in UI
            oDataModel.read(viewpath, {
                filters: ruleseqFilterArray,
                async: false,
				success: function(oData, oResponse) {
                   return oData.results;
                },
                error: function(oError) {
                    MessageBox.alert("Error reading data. Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});    
                    result = [];
                }
            });
			return result;
		}

		function clearPersFilter(table, bindinParams) {
			table._oCurrentVariant.filter.filterItems = [];
			bindinParams.filters = [];
			table._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.alreadyKnownPersistentData.filter.filterItems = []; // eslint-disable-line
			table._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlData.filter.filterItems = []; // eslint-disable-line
			table._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.alreadyKnownRuntimeData.filter.filterItems = []; // eslint-disable-line
			table._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlDataBase.filter.filterItems = []; // eslint-disable-line
		}
		
		function getApplicationActivityID(jobName)
		{
           // create filter based on App job name
			var AppActivityFilterArray = [];
			var jobnametypeFilter = new Filter("JOB_NAME",sap.ui.model.FilterOperator.EQ,jobName);
			AppActivityFilterArray.push(jobnametypeFilter);
			
			var appActivityID = null;

			// Get the GMID Country Status Code ID CODE_MASTER table
			oDataModel.read("/RULE_APPLICATION_ACTIVITY?$select=ID",{
					filters: AppActivityFilterArray,
					async: false,
	                success: function(oData, oResponse){
	                	//return the Code ID
	                   appActivityID = oData.results[0].ID; 
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve ID for RULE_APPLICATION_ACTIVITY.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	    			}
	    		});
	    	return appActivityID;
		}
		
		var exports = {
			getAttributeListBasedOnUserID: getAttributeListBasedOnUserID,
			getUserID: getUserID,
			getGMIDListFromDB: getGMIDListFromDB,
			getGMIDListFromDBByGMIDPad:getGMIDListFromDBByGMIDPad,
			getMaxID: getMaxID,
			getUserPermissions: getUserPermissions,
			isBAMUser : isBAMUser,
			getDropdownValues: getDropdownValues,
			getDropdownValuesEdit : getDropdownValuesEdit,
			getNonAdminDropdownValues : getNonAdminDropdownValues,
			deleteStagingData: deleteStagingData,
			getGMIDCountryStatusID: getGMIDCountryStatusID,
			getGMIDCountryPlantListFromDB : getGMIDCountryPlantListFromDB,
			getrulesFromDB : getrulesFromDB,
			getApplicationActivityID : getApplicationActivityID,
			getPeopleRulesFromDB : getPeopleRulesFromDB,
			getViewByFilter : getViewByFilter,
			clearPersFilter: clearPersFilter
		};
	
		return exports;

});