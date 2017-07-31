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
	return Controller.extend("bam.controller.GMIDPlantAssignment", {
		//
		onInit : function () {
			
			// define a global variable for the oData model		    
		    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
		    // Create view model for the page
		    var oModel = new sap.ui.model.json.JSONModel();

	    	//var oi18nModel = new ResourceModel({
              //  bundleName: "bam.i18n.i18n"
           // });
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
					
			if (gmidPlantAssignmentRecords.length !==0){
					//loop through the rows of the retruened data
					for (var i = 0; i < gmidPlantAssignmentRecords.length; i++) {
						var item =  gmidPlantAssignmentRecords[i];
						key = item.GMID + ";" + item.COUNTRY_CODE;
					    //check for the gmid and country combination key 
					    if(!hash.contains(key))
					    {
					    	//if its a new combination add the key to existing list of combinations
					        hash.add(key);
					        groupedGMIDPlantCountry.push({ID: item.ID,
					        						 GMID:item.GMID, 
					        						 COUNTRY_CODE:item.COUNTRY_CODE,
					        						 PLANTS:[]});
						}
						// check if the plant code is already associated with GMID Country combination
						// if associated make it as selected
						if (item.IS_SELECTED === "false")
						{
							item.IS_SELECTED = false;
						}
						else
						{
							item.IS_SELECTED = true;
						}
					    //find the object for the gmid and country combination and push the plant code to the nested plant object
					    groupedGMIDPlantCountry.find(function(data){return data.GMID === item.GMID && data.COUNTRY_CODE === item.COUNTRY_CODE;}).PLANTS.push({PLANT_CODE: item.PLANT_CODE,IS_SELECTED : item.IS_SELECTED,PLANT_STATUS: item.PLANT_STATUS, PLANT_STATUS_DESC: item.PLANT_STATUS_DESC});
					}
			}
				
            // Bind the Country data to the GMIDShipToCountry model
            oModel.setProperty("/GMIDPlantAssignmentVM",groupedGMIDPlantCountry);
            this.getView().setModel(oModel);
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
		// navigate back to the homepage
		onHome: function(){
				this.getOwnerComponent().getRouter().navTo("home");
		},
		//cancel click on Gmid Plant  page
		onCancel: function(){
			var curr = this;
	        curr.getOwnerComponent().getRouter().navTo("gmidPlant");
		}
  	});
});