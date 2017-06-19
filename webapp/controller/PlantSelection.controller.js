sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter"
	], function (Controller, JSONModel, MessageToast, ResourceModel,Filter) {
		"use strict";
	return Controller.extend("bam.controller.PlantSelection", {
		//
		onInit : function () {
		     // define a global variable for the oData model		    
		     this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
		    // Create view model for the page
		    var oModel = new sap.ui.model.json.JSONModel();
		    
		     // Create Message model
	    	this._oMessageModel = new sap.ui.model.json.JSONModel();
	    	this._oMessageModel.setProperty("/NumOfGMIDSubmitted",0);
	    	this.getView().setModel(this._oMessageModel,"MessageVM");
	    	
		    // Get the GMID Plant combinations for the GMID-Country combination selected by the user
			// Create a filter & sorter array (pending depending on user id logic)
			// var userFilterArray = [];
			// var userFilter = new Filter("USER_ID",sap.ui.model.FilterOperator.EQ,"COUNTRY");
			// userFilterArray.push(userFilter);
			var userSortArray = [];
			var userSort = new sap.ui.model.Sorter("GMID",false);
			userSortArray.push(userSort);
			
			this._oDataModel.read("/V_GMID_COUNTRY_SHIP_FROM_PLANT",{
				//	filters: userFilterArray,
					sorters: userSortArray,
					async: false,
	                success: function(oData, oResponse){
	                var groupedGMIDCountry = [];
	                
	                //common code to check duplicates
					var hash = (function() {
					    var keys = {};
						    return {
						        contains: function(key) {
						            return keys[key] === true;
						        },
						        add: function(key) {
						            if (keys[key] !== true)
						            {
						                keys[key] = true;
						            }
						        }
						    };
						})();
					
					var key = null;
					//loop through the rows of the retruened data
					for (var i = 0; i < oData.results.length; i++) {
							var item =  oData.results[i];
						    key = item.GMID + ";" + item.COUNTRY;
						    //check for the gmid and country combination key 
						    if (!hash.contains(key))
						    {
						    	//if its a new combination add the key to existing list of combinations
						        hash.add(key);
						        //push the new combination to the list
						        groupedGMIDCountry.push({GMID:item.GMID, 
						        						 COUNTRY:item.COUNTRY, 
						        						 COUNTRY_CODE_ID: item.COUNTRY_CODE_ID,
			        									 CURRENCY_CODE_ID: item.CURRENCY_CODE_ID,
			        									 IBP_RELEVANCY_CODE_ID: item.IBP_RELEVANCY_CODE_ID,
			        									 NETTING_DEFAULT_CODE_ID: item.NETTING_DEFAULT_CODE_ID,
			        									 QUADRANT_CODE_ID:item.QUADRANT_CODE_ID,
			        									 CHANNEL_CODE_ID: item.CHANNEL_CODE_ID,
			        									 MARKET_DEFAULT_CODE_ID: item.MARKET_DEFAULT_CODE_ID,
			        									 SUPPLY_SYSTEM_FLAG_CODE_ID: item.SUPPLY_SYSTEM_FLAG_CODE_ID,
			        									 TYPE: item.TYPE,
			        									 GMID_COUNTRY_STATUS_CODE_ID:item.GMID_COUNTRY_STATUS_CODE_ID,
			        									 CREATED_BY: item.CREATED_BY,
						        						 PLANTS:[],
						        						 errorMessage:false});
						    }
						    //find the object for the gmid and country combination and push the plant code to the nested plant object
						    groupedGMIDCountry.find(function(data){return data.GMID === item.GMID && data.COUNTRY === item.COUNTRY;}).PLANTS.push({PLANT_CODE: item.PLANT_CODE,PLANT_CODE_ID : item.GMID_SHIP_FROM_PLANT_ID,IS_SELECTED:false});
						}
		                // Bind the Country data to the GMIDShipToCountry model
		                oModel.setProperty("/PlantSelectionVM",groupedGMIDCountry);
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve user data.");
	    			}
	    	});
		    this.getView().setModel(oModel);
		    // define a global variable for the view model and the view model data
		    this._oPlantSelectionViewModel = oModel;
		    this._oViewModelData = this._oPlantSelectionViewModel.getData();
		},
		// Below function removes a row
		onRemoveRow : function(oEvent) {
			// Get the object to be deleted from the event handler
			var entryToDelete = oEvent.getSource().getBindingContext().getObject();
			// Get the # of rows in the VM, (this includes the dropdown objects such as Country, Currency, etc..)
			var rows = this._oViewModelData.PlantSelectionVM;
			
			// loop through each row and check whether the passed object = the row object
			 for(var i = 0; i < rows.length; i++){
			 	if(rows[i] === entryToDelete )
				{
					// found a match, remove this row from the data
					rows.splice(i,1);
					// refresh the GMID VM, this will automatically update the UI
					this._oPlantSelectionViewModel.refresh();
					break;
				}
			}
		},
		// Function to save the data into the database
		// this will save data in two tables GMID_SHIP_TO_COUNTRY and GMID_COUNTRY_SHIP_FROM_PLANT
    	onSubmit : function () {
    		var errorCount = 0;
    		var successGMIDShipToCount = 0;
    	 	var successGMIDShipFromPlantCount = 0;
    		var GMIDShipToCountry = this._oPlantSelectionViewModel.getProperty("/PlantSelectionVM");
    		  // TODO Validations
    		  // once all the validations are done need to save data into tables
	    	  // Create current timestamp
	    		var oDate = new Date();
	    		// Get the MaxID for the GMID Ship to Country
	    	    var maxGMIDShipToID = this.getMaxGMIDShipToCountryID();
	    	    // Get the code id for GMID Country Status
	    	    var gmidcountrystatusID = this.getGMIDCountryStatusID();
	    	  	var oModel = this._oDataModel;
	    		// loop through the rows and for each row insert data into database
	    		// each row contains GMID Ship To combination.
	    		for(var i = 0; i < GMIDShipToCountry.length; i++) 
	    		{
					var GMID = GMIDShipToCountry[i].GMID;
					var countryID = parseInt(GMIDShipToCountry[i].COUNTRY_CODE_ID,10);
					var storedcurrencyID = parseInt(GMIDShipToCountry[i].CURRENCY_CODE_ID,10);
					var ibprelevancyID = parseInt(GMIDShipToCountry[i].IBP_RELEVANCY_CODE_ID,10);
					var nettingdefaultID = parseInt(GMIDShipToCountry[i].NETTING_DEFAULT_CODE_ID,10);
					var quadrantID = parseInt(GMIDShipToCountry[i].QUADRANT_CODE_ID,10);
					var channelID = parseInt(GMIDShipToCountry[i].CHANNEL_CODE_ID,10);
					var marketdefaultID = parseInt(GMIDShipToCountry[i].MARKET_DEFAULT_CODE_ID,10);
					var supplySystemFlagID = parseInt(GMIDShipToCountry[i].SUPPLY_SYSTEM_FLAG_CODE_ID,10);
					var createdBy = GMIDShipToCountry[i].CREATED_BY;
					var selectedGMIDType = GMIDShipToCountry[i].TYPE;
					// create new GMIDShipToCountry object
					var newGMID = {
			        	ID: maxGMIDShipToID + 1 + i,
			        	GMID: GMID,
			        	COUNTRY_CODE_ID: countryID,
			        	CURRENCY_CODE_ID: storedcurrencyID,
			        	IBP_RELEVANCY_CODE_ID: ibprelevancyID,
			        	NETTING_DEFAULT_CODE_ID: nettingdefaultID,
			        	QUADRANT_CODE_ID:quadrantID,
			        	CHANNEL_CODE_ID: channelID,
			        	MARKET_DEFAULT_CODE_ID: marketdefaultID,
			        	SUPPLY_SYSTEM_FLAG_CODE_ID: supplySystemFlagID,
			        	TYPE: selectedGMIDType,
			        	GMID_COUNTRY_STATUS_CODE_ID: gmidcountrystatusID,
			        	CREATED_ON: oDate,
			        	CREATED_BY:createdBy
	    			};
	    			
	    			var maxGMIDShipFromPlantID = this.getMaxGMIDShipFromPlantID();
	    			
	        		this._oDataModel.create("/GMID_SHIP_TO_COUNTRY", newGMID,
	        		{
			        	success: function(){
			        		successGMIDShipToCount++;
			        		// Get the MaxID for the GMID Ship from Plant

	    	    			
			        		// once data is inserted into GMID Ship to Country, 
			        		// insert the data into GMID_COUNTRY_SHIP_FROM_PLANT
			        		// each GMID Country combination can have one or more plants
							  for(var j = 0; j < GMIDShipToCountry[i].PLANTS.length; j++) 
					    		{
	    	    					
									var gmidshipfromcountryID = parseInt(GMIDShipToCountry[i].COUNTRY_CODE_ID,10);
									// only selected plants are to be saved in database
									if (GMIDShipToCountry[i].PLANTS[j].IS_SELECTED === true)
									{
										var gmidshipfromplantID = parseInt(GMIDShipToCountry[i].PLANTS[j].PLANT_CODE_ID,10);
										var gmidshipfromplantcreatedBy =  GMIDShipToCountry[i].CREATED_BY;
										// create new GMIDShipFromPlant object
										var newGMIDShipFromPlant = {
								        	ID: maxGMIDShipFromPlantID + 1 + j,
								        	GMID_SHIP_FROM_COUNTRY_ID: gmidshipfromcountryID,
								        	GMID_SHIP_FROM_PLANT_ID: gmidshipfromplantID,
								        	CREATED_ON: oDate,
								        	CREATED_BY:gmidshipfromplantcreatedBy
						    			};
						    			
						        		oModel.create("/GMID_COUNTRY_SHIP_FROM_PLANT", newGMIDShipFromPlant,
						        		{
								        	success: function(){
								    		},
								    		error: function(){
								    			errorCount++;
											}
						        		});
									}
					    		}
			    		},
			    		error: function(){
			    			errorCount++;
						}
	        		});
	    		}
	    		
	    		// get the count of records in staging table
    			for(var k = 1; k <= GMIDShipToCountry.length; k++) 
    			{
		    		// once data is inserted successfully in both tables i.e. GMID_SHIP_TO_COUNTYRY 
		    		// and GMID_COUNTRY_SHIP_FROM_PLANT, delete the data from staging table i.e. GMID_SHIP_TO_COUNTYRY_STG
    				this._oDataModel.remove("/GMID_SHIP_TO_COUNTRY_STG(" + k + ")",
	        		{
			        	success: function(){
			    		},
			    		error: function(){
			    			// show alert message
			    				MessageToast.show("Error: Data not deleted from staging table");
						}
	        		});
    			}
	    		
		        		
	    		//Show success or error message
	    		if(errorCount === 0) 
	    		{
	        		this._oMessageModel.setProperty("/NumOfGMIDSubmitted",successGMIDShipToCount);
	    			this.getOwnerComponent().openSubmitConfirmDialog(this.getView());
	        		//once insertion is success, navigate to homepage
	    		} 
	    		else 
	    		{
	        			MessageToast.show("Error: GMIDs were not submitted");
	    		}
	    		
	        },
		// below function will return the max ID from GMID_SHIP_FROM_PLANT  TABLE
        getMaxGMIDShipFromPlantID : function  () {
			// Create a filter & sorter array to fetch the max ID
			var idSortArray = [];
			var idSort = new sap.ui.model.Sorter("ID",true);
			idSortArray.push(idSort);
			
			var maxID = null;

			 // Get the Max ID from  GMID_SHIP_FROM_PLANT table
			 this._oDataModel.read("/GMID_COUNTRY_SHIP_FROM_PLANT?$top=1&$select=ID",{
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
        },
         // below function will return the GMID Country Status ID from CODE_Master TABLE
        getGMIDCountryStatusID : function  () {
        	 var oi18nModel = this.getView().getModel("i18n");
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
			 this._oDataModel.read("/CODE_MASTER?$select=ID",{
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
        },
        // below function will return the max ID from GMID_SHIP_TO_COUNTRY TABLE
        getMaxGMIDShipToCountryID : function  () {
			// Create a filter & sorter array to fetch the max ID
			var idSortArray = [];
			var idSort = new sap.ui.model.Sorter("ID",true);
			idSortArray.push(idSort);
			
			var maxID = null;

			 // Get the Country dropdown list from the GMID_SHIP_TO_COUNTRY table
			 this._oDataModel.read("/GMID_SHIP_TO_COUNTRY?$top=1&$select=ID",{
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
	            		MessageToast.show("Unable to retrieve max ID for GMID Ship to country table.");
	    			}
	    		});
	    	return maxID;
        }
  	});
});