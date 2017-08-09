sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"bam/services/DataContext"
	], function (Controller, JSONModel, MessageToast, MessageBox, ResourceModel,Filter,DataContext) {
		"use strict";
		
	var firstTimePageLoad = true;
	var loggedInUserID;
	var originalGMIDCountry;
	return Controller.extend("bam.controller.PlantSelection", {
		//
		onInit : function () {
			
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();
					
			// define a global variable for the oData model		    
		    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
		    // Create view model for the page
		    var oModel = new sap.ui.model.json.JSONModel();

	    	var oi18nModel = new ResourceModel({
                bundleName: "bam.i18n.i18n"
            });
            
			// get the GMID status for i18n model
			var z1gmid = oi18nModel.getProperty("z1gmidstatus");
			var zcgmid = oi18nModel.getProperty("zcgmidstatus");
			var z9gmid = oi18nModel.getProperty("z9gmidstatus");
			//making filter for plant status
			// Get the GMID Plant combinations for the GMID-Country combination selected by the user
			// Create a filter & sorter array (pending depending on user id logic)
			//
			var filterArray=[];
			var userFilter = new Filter("CREATED_BY",sap.ui.model.FilterOperator.EQ,loggedInUserID);
			filterArray.push(userFilter);
			var z1gmidFilter = new Filter("FILTER_MATERIAL_STATUS",sap.ui.model.FilterOperator.NE,z1gmid);
			var zcgmidFilter = new Filter("FILTER_MATERIAL_STATUS",sap.ui.model.FilterOperator.NE,zcgmid);
			var z9gmidFilter = new Filter("FILTER_MATERIAL_STATUS",sap.ui.model.FilterOperator.NE,z9gmid);
		
			var statusFilter = new Filter ({
				filters : [
					z1gmidFilter,
					zcgmidFilter,
					z9gmidFilter
					],
					and : true
			});
			filterArray.push(statusFilter);
	    	
		    // Get the GMID Plant combinations for the GMID-Country combination selected by the user
			// Create a filter & sorter array (pending depending on user id logic)
			var userSortArray = [];
			var userSort = new sap.ui.model.Sorter("GMID",false);
			userSortArray.push(userSort);
			
			this._oDataModel.read("/V_GMID_COUNTRY_SHIP_FROM_PLANT",{
				filters: filterArray,
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
				    if(!hash.contains(key))
				    {
				    	//if its a new combination add the key to existing list of combinations
				        hash.add(key);
				        groupedGMIDCountry.push({ID: item.ID,
				        						 GMID:item.GMID, 
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
				        						 errorState: "None"});
					}
				    //find the object for the gmid and country combination and push the plant code to the nested plant object
				    groupedGMIDCountry.find(function(data){return data.GMID === item.GMID && data.COUNTRY === item.COUNTRY;}).PLANTS.push({PLANT_CODE: item.PLANT_CODE,PLANT_CODE_ID : item.GMID_SHIP_FROM_PLANT_ID,IS_SELECTED:false});
				}
				
                // Bind the Country data to the GMIDShipToCountry model
                oModel.setProperty("/PlantSelectionVM",groupedGMIDCountry);
                // save the original view model into a variable, used later for deletion of rows in staging column
                originalGMIDCountry = JSON.parse(JSON.stringify(groupedGMIDCountry));
                },
    		    error: function(){
            		MessageToast.show("Unable to retrieve user data.");
    			}
	    	});
		    this.getView().setModel(oModel);
		    // define a global variable for the view model and the view model data
		    this._oPlantSelectionViewModel = oModel;
		    this._oViewModelData = this._oPlantSelectionViewModel.getData();

		    if(firstTimePageLoad)
	    	{
	    		var oRouter = this.getRouter();
				oRouter.getRoute("gmidPlantSelection").attachMatched(this._onRouteMatched, this);
				firstTimePageLoad = false;
	    	}
    	},
    	getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
		// force init method to be called everytime we naviagte to Maintain Attribuets page 
		_onRouteMatched : function (oEvent) {
			if(DataContext.isBAMUser() === false)
			{
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else
			{
				this.onInit();
			}
		},
		// navigate back to the homepage
		onHome: function(){
				this.getOwnerComponent().getRouter().navTo("home");
		},
		// Below function removes a row
		onRemoveRow : function(oEvent) {
			// Get the object to be deleted from the event handler
			var entryToDelete = oEvent.getSource().getBindingContext().getObject();
			// Get the # of rows in the VM, (this includes the dropdown objects such as Country, Currency, etc..)
			var rows = this._oViewModelData.PlantSelectionVM;
			// Setting local this variable in order to access it in the action confirm button
			var t = this;
			
			MessageBox.confirm(("Are you sure you want to delete this GMID/Country? Doing so will result to the GMID not being submitted to BAM and your entry for this GMID on the previous page will be disregarded."), {
	    			icon: sap.m.MessageBox.Icon.WARNING,
	    			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
	          		onClose: function(oAction) {
	          			if (oAction === "YES") 
						{
							// loop through each row and check whether the passed object = the row object
							 for(var i = 0; i < rows.length; i++){
							 	if(rows[i] === entryToDelete)
								{
									// found a match, remove this row from the data
									rows.splice(i,1);
									// refresh the GMID VM, this will automatically update the UI
									t._oPlantSelectionViewModel.refresh();
									break;
								}
							}
	            		}
	          		}
	       	});
		},
		// Function to save the data into the database
		// this will save data in two tables GMID_SHIP_TO_COUNTRY and GMID_COUNTRY_SHIP_FROM_PLANT
    	onSubmit : function () {
    		var errorCount = 0;
    		var successGMIDShipToCount = 0;
    	 	var successGMIDShipFromPlantCount = 0;
    		var GMIDShipToCountry = this._oPlantSelectionViewModel.getProperty("/PlantSelectionVM");
    	
    		// Create current timestamp
    		var oDate = new Date();
    	
    	    // Get the code id for GMID Country Status
    	    var gmidcountrystatusID = DataContext.getGMIDCountryStatusID();
    	    
    	    // reset the validation on the screen
    	    this.resetValidation();
			if(GMIDShipToCountry.length === 0)
			{
				MessageBox.alert("There are no GMID/Country combinations to submit. Please return to the homepage.", {
	    			icon : MessageBox.Icon.ERROR,
					title : "Invalid Input"
       			});
			}
			else if(!this.validateDuplicateRecords())
			{
				MessageBox.alert("Duplicate GMID/Country combination exists in the system. Please remove the entry.", {
	    			icon : MessageBox.Icon.ERROR,
					title : "Invalid Input"
       			});
			}
			// validation to check if each GMID/Country has at least one plant selected
    	    else if (this.validatePlantSelection() === false)
	    	{
	    		MessageBox.alert("Please select at least one plant for each GMID/Country combination.", {
	    			icon : MessageBox.Icon.ERROR,
					title : "Invalid Input"
       			});
	    	}
	    	else
	    	{
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
			        	ID: 1,
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
	    			
	    			var maxGMIDShipFromPlantID = DataContext.getMaxID("/GMID_COUNTRY_SHIP_FROM_PLANT");
	    				// Get the MaxID for the GMID Ship to Country
	    			
	        		this._oDataModel.create("/GMID_SHIP_TO_COUNTRY", newGMID,
	        		{
			        	success: function(){
			        		successGMIDShipToCount++;
			        		// Get the MaxID for the GMID Ship from Plant

	    	    			 var maxGMIDShipToID = DataContext.getMaxID("/GMID_SHIP_TO_COUNTRY");
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
								        	ID: 1 ,
								        	GMID_SHIP_TO_COUNTRY_ID: maxGMIDShipToID,
								        	GMID_SHIP_FROM_PLANT_ID: gmidshipfromplantID,
								        	CREATED_ON: oDate,
								        	CREATED_BY:gmidshipfromplantcreatedBy,
								        	SEND_IBP_FLAG: 'F'
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
	    		// TODO needs to be refactored to be batch delete
	    		// get the count of records in staging table
    			for(var k = 0; k < originalGMIDCountry.length; k++) 
    			{
		    		// once data is inserted successfully in both tables i.e. GMID_SHIP_TO_COUNTYRY 
		    		// and GMID_COUNTRY_SHIP_FROM_PLANT, delete the data from staging table i.e. GMID_SHIP_TO_COUNTYRY_STG
    				this._oDataModel.remove("/GMID_SHIP_TO_COUNTRY_STG(" + originalGMIDCountry[k].ID + ")",
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
	        			var oRouter = this.getRouter();
        				// once insertion is success, navigate to homepage
        				MessageBox.alert("You have successfully submitted " + successGMIDShipToCount + " GMID(s)",
							{
								icon : MessageBox.Icon.SUCCESS,
								title : "Success",
								onClose: function() {
				        			oRouter.navTo("home");
				        	}
						});
	        		//once insertion is success, navigate to homepage
	    		} 
	    		else 
	    		{
	        			MessageToast.show("Error: GMIDs were not submitted");
	    		}
	    		
	    	} // end of else validation at least one plant selected
	    },
        validatePlantSelection :function()
        {
	        var GMIDShipToCountry = this._oPlantSelectionViewModel.getProperty("/PlantSelectionVM");
	        var plantSelected;
	        var validPlants = true;
	        
	        for(var i = 0; i < GMIDShipToCountry.length; i++)
	        {
	        	plantSelected = false;
	        	for(var j = 0; j < GMIDShipToCountry[i].PLANTS.length; j++) 
	            {
	                // if there is at least one plant selected, then the GMID/Country combination is valid
	                if (GMIDShipToCountry[i].PLANTS[j].IS_SELECTED === true)
	                {
	                	plantSelected = true;
	                }
	            }
	            if (plantSelected === false)
	            {
	               // add error state for this GMID 
	               GMIDShipToCountry[i].errorState = "Error";
	               // invalid GMID/Country combo found
	               validPlants = false;
	            }
	        }
	        this._oPlantSelectionViewModel.refresh();
	        return validPlants;
        },
        validateDuplicateRecords : function()
        {
        	// loop through the rows and for each row check for duplicate entry in DB
            // each row contains GMID Ship To combination.
            var data = this._oPlantSelectionViewModel.getProperty("/PlantSelectionVM");
           // prepare an array of GMIDs from the UI
            var gmidList = [];
            var gmid; 
            for(var j = 0; j < data.length; j++) 
            {
                // every time empty the GMID object
                gmid= {"GMID": ""};
                gmid.GMID = data[j].GMID;
                gmidList.push(gmid);
            }
            var viewPath = "V_VALIDATE_GMID_COUNTRY";
        	var gmidCountryRecords = DataContext.getGMIDListFromDB(gmidList,viewPath);                           
            var noDuplicates = true;
            for(var i = 0; i < data.length; i++) 
            {
                var GMID = data[i].GMID;
                var countryID = parseInt(data[i].COUNTRY_CODE_ID,10);
                // loop the GMID Country Records from DB to check Unique
                for(var k = 0; k < gmidCountryRecords.length; k++) 
                {
                    // check if GMID and Country Combinations exists in DB
		            if (GMID === gmidCountryRecords[k].GMID && countryID === gmidCountryRecords[k].COUNTRY_CODE_ID)
		            {
		                noDuplicates = false;
	        			data[i].errorState = "Error";
		            }
		            else
		            {
		                continue;
		            }
                }
            }
        	
        
	        this._oPlantSelectionViewModel.refresh();
        	return noDuplicates;
        },
        resetValidation: function()
        {
        	var GMIDShipToCountry = this._oPlantSelectionViewModel.getProperty("/PlantSelectionVM");
        	for(var i = 0; i < GMIDShipToCountry.length; i++)
	        {
	        	GMIDShipToCountry[i].errorState = "None";
	        }
        }

  	});
});