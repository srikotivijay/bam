sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/core/routing/History",
		"bam/services/DataContext"
	], function (Controller, JSONModel, MessageToast, MessageBox, ResourceModel,Filter,History,DataContext) {
		"use strict";

	var firstTimePageLoad = true;
	return Controller.extend("bam.controller.GMIDPlantAssignment", {
		//
		onInit : function () {
			
		    // Create view model for the page
		    var oModel = new sap.ui.model.json.JSONModel();
			// define a global variable for the oData model		    
		    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
            var groupedGMIDPlantCountry = [];
                
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
				
            if(firstTimePageLoad)
	    	{
	    		var oRouter = this.getRouter();
				oRouter.getRoute("gmidPlantAssignment").attachMatched(this._onRouteMatched, this);
				firstTimePageLoad = false;
	    	}
			var gmidPlantAssignmentRecords = [];
		    // Get the GMID Plant combinations for the GMID-Country combination selected by the user
		    var viewpath = "V_GMID_COUNTRY_PLANT_STATUS";
	    	if(this._gmidIDsList !== undefined)
			{
	             // get all the GMID/Plants data for the GMIDS entered in UI
	             gmidPlantAssignmentRecords = DataContext.getGMIDCountryPlantListFromDB(this._gmidIDsList,viewpath); 
			}
			
			//resource model
			var oi18nModel = new ResourceModel({
                	bundleName: "bam.i18n.i18n"
            	});
            	
        	// get the GMID plant status for i18n model
	    	var z1gmid = oi18nModel.getProperty("z1gmidstatus");
	    	var zcgmid = oi18nModel.getProperty("zcgmidstatus");
	    	var z9gmid = oi18nModel.getProperty("z9gmidstatus");
            var activePlantStatus = oi18nModel.getProperty("activePlantStatus");
             
			// get the Module settings for i18n model
    		var plantAssignment = oi18nModel.getProperty("Module.plantAssignment");
    		var actionAdd = oi18nModel.getProperty("Module.actionAdd");
    		
    		// defining add permision for plant assignment, default to false
    		var permissionToAdd = false;
			
			// getting permissions for the current logged in user
			var permissions = DataContext.getUserPermissions();
			// check to see if the permission list includes "Add" action for the PLANT ASSIGNMENT Module
			// ATTRIBUTE in this case means MODULE
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === plantAssignment && permissions[i].ACTION === actionAdd)
				{
					permissionToAdd = true;
					// break since the user may have more than one role, as long as one of the user roles has permission to edit we can show the button
					break;
				}
			}
					
			if (gmidPlantAssignmentRecords.length !==0){
					//loop through the rows of the retruened data
					for (var i = 0; i < gmidPlantAssignmentRecords.length; i++) 
					{
						var item =  gmidPlantAssignmentRecords[i];
						key = item.GMID + ";" + item.COUNTRY;
					    //check for the gmid and country combination key 
					    if(!hash.contains(key))
					    {
					    	//if its a new combination add the key to existing list of combinations
					        hash.add(key);
					        groupedGMIDPlantCountry.push({ID: item.ID,
					        						 GMID:item.GMID, 
					        						 COUNTRY:item.COUNTRY,
					        						 PLANTS:[]});
						}
						
						// setting permission to edit plant based on user role & plant status
						if(permissionToAdd && (item.PLANT_STATUS !== z1gmid) && (item.PLANT_STATUS !== zcgmid) && (item.PLANT_STATUS !== z9gmid))
						{
							item.IS_EDITABLE = true;
						}
						else 
						{
							item.IS_EDITABLE = false;
						}
						
						// setting plant status to Active if the plant status is null or blank
						if(item.PLANT_STATUS === null)
						{
							item.PLANT_STATUS = activePlantStatus;
						}
						
						// check if the plant code is already associated with GMID Country combination
						// used to turn string value into boolean
						// if associated make it as selected
						if (item.IS_SELECTED === "false")
						{
							item.IS_SELECTED = false;
						}
						else
						{
							item.IS_SELECTED = true;
							item.IS_EDITABLE = false;
						}
						
					    //find the object for the gmid and country combination and push the plant code to the nested plant object
					    groupedGMIDPlantCountry.find(function(data){return data.GMID === item.GMID && data.COUNTRY === item.COUNTRY;}).PLANTS.push({PLANT_CODE: item.PLANT_CODE,PLANT_CODE_ID : item.PLANT_CODE_ID,IS_SELECTED : item.IS_SELECTED,PLANT_STATUS: item.PLANT_STATUS, IS_EDITABLE : item.IS_EDITABLE, PLANT_STATUS_DESC: item.PLANT_STATUS_DESC});
					} 					
			}
				
            // Bind the Country data to the GMIDShipToCountry model
            oModel.setProperty("/GMIDPlantAssignmentVM",groupedGMIDPlantCountry);
            this.getView().setModel(oModel);
             // define a global variable for the view model and the view model data
		    this._oPlantAssignmentSelectionViewModel = oModel;
		    this._oViewModelData = this._oPlantAssignmentSelectionViewModel.getData();
    	},
    	getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
		// force init method to be called everytime we naviagte to GMID Plant Selection page 
		_onRouteMatched : function (oEvent) {
			if(DataContext.isBAMUser() === false)
			{
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else
			{
				this._gmidIDs = oEvent.getParameter("arguments").gmidids.split(",");
				var gmid; 
	        	 // prepare an array of GMIDs from the UI
	            var gmidList = [];
	            for(var j = 0; j < this._gmidIDs.length; j++) 
	            {
		            // every time empty the GMID object
		             gmid= {"ID": "" };
		             gmid.ID =this._gmidIDs[j];
		             gmidList.push(gmid);
	            }
	            this._gmidIDsList = gmidList;
				this.onInit();
			}
		},
		// navigate back to GMID Plants Page
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("gmidPlant", true);
			}
		},
		// Function to save the data into the database
		// this will save data in only one table GMID_COUNTRY_SHIP_FROM_PLANT
    	onSubmit : function () {
    		var errorCount = 0;
    		var successGMIDPlantShipToCount = 0;
   			// Get logged in user id
			var loggedInUserID = DataContext.getUserID();
    		var GMIDShipToCountry = this._oPlantAssignmentSelectionViewModel.getProperty("/GMIDPlantAssignmentVM");
    	
    		// Create current timestamp
    		var oDate = new Date();
    	    // reset the validation on the screen
    	    this.resetValidation();
			if(GMIDShipToCountry.length === 0)
			{
				MessageBox.alert("There are no GMID/Country combinations to submit. Please return to the homepage.", {
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
	    		 // data is already there in GMID SHIP TO Country table, needs to be saved in only one table
	    		 // i.e GMID_COUNTRY_SHIP_FROM_PLANT
	    		// loop through the rows and for each row insert data into database
	    		// each row contains GMID Ship To combination.
	    		for(var i = 0; i < GMIDShipToCountry.length; i++) 
	    		{
					var GMIDCountryID = GMIDShipToCountry[i].ID;
	        		// insert the data into GMID_COUNTRY_SHIP_FROM_PLANT
	        		// each GMID Country combination can have one or more plants
					  for(var j = 0; j < GMIDShipToCountry[i].PLANTS.length; j++) 
			    		{
	    	    					
									// only selected plants are to be saved in database
									if (GMIDShipToCountry[i].PLANTS[j].IS_SELECTED === true && GMIDShipToCountry[i].PLANTS[j].IS_EDITABLE === true && this.allGMIDPlantsSelected(GMIDShipToCountry[i]) === false)
									{
										var gmidshipfromplantID = parseInt(GMIDShipToCountry[i].PLANTS[j].PLANT_CODE_ID,10);
										// create new GMIDShipFromPlant object
										var newGMIDShipFromPlant = {
								        	ID: 1 ,
								        	GMID_SHIP_TO_COUNTRY_ID: GMIDCountryID,
								        	GMID_SHIP_FROM_PLANT_ID: gmidshipfromplantID,
								        	// always IBP_FLAG will be set to T if plants are being saved from plant assignment
								        	SEND_IBP_FLAG:"T",
								        	CREATED_ON: oDate,
								        	CREATED_BY:loggedInUserID
						    			};
						    			
						        		oModel.create("/GMID_COUNTRY_SHIP_FROM_PLANT", newGMIDShipFromPlant,
						        		{
								        	success: function(){
								        		successGMIDPlantShipToCount++;
								    		},
								    		error: function(){
								    			errorCount++;
											}
						        		});
									}
					    		}
			    		}

	    		//Show success or error message
	    		if(errorCount === 0) 
	    		{
	        			var oRouter = this.getRouter();
        				// once insertion is success, navigate to homepage
        				MessageBox.alert("You have successfully submitted " + successGMIDPlantShipToCount + " GMID(s)",
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
	        			MessageToast.show("Error: GMID Plants were not submitted");
	    		}
	    	 } // end of else validation at least one plant selected
	    	},
	    	validatePlantSelection :function()
	        {
		        var GMIDShipToCountry =  this._oPlantAssignmentSelectionViewModel.getProperty("/GMIDPlantAssignmentVM");
		        var plantSelected;
		        var validPlants = true;
		        for(var i = 0; i < GMIDShipToCountry.length; i++)
		        {
		        	// dont validate if all plants are selected for a GMID country Combination
		        	if (this.allGMIDPlantsSelected(GMIDShipToCountry[i]) === true)
		        	{
			        	plantSelected = false;
			        	for(var j = 0; j < GMIDShipToCountry[i].PLANTS.length; j++) 
			            {
			                // if there is at least one plant selected, then the GMID/Country combination is valid
			                if (GMIDShipToCountry[i].PLANTS[j].IS_SELECTED === true && GMIDShipToCountry[i].PLANTS[j].IS_EDITABLE === true)
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
		        }
		        this._oPlantAssignmentSelectionViewModel.refresh();
		        return validPlants;
	       },
	       // function to check if for a GMID,Country combination whether all the plants are selected
	       allGMIDPlantsSelected : function(row)
	       {
	       	 var allplantsselected = false;
	       	 for(var j = 0; j < row.PLANTS.length; j++) 
			     {
	                // check if atleaseone plant selected
	                if (row.PLANTS[j].IS_SELECTED === true && row.PLANTS[j].IS_EDITABLE === true)
	                {
	                	allplantsselected = true;
	                	break;
	                }
			     }
	       	  return allplantsselected;
	       },
		   resetValidation: function()
	        {
	        	var GMIDShipToCountry = this._oPlantAssignmentSelectionViewModel.getProperty("/GMIDPlantAssignmentVM");
	        	for(var i = 0; i < GMIDShipToCountry.length; i++)
		        {
		        	GMIDShipToCountry[i].errorState = "None";
		        }
	        }
  	});
});