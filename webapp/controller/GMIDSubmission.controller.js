sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter"
	], function (Controller, JSONModel, MessageToast, MessageBox, ResourceModel,Filter) {
		"use strict";

	return Controller.extend("bam.controller.GMIDSubmission", {
		onInit : function () {
			// Create view model for 5 rows to show by default on page load
			var initData = [];
			for (var i = 0; i < 5; i++) {
    			initData.push({
        		"GMID": "",
        		"GMIDErrorState": "None",
        		"COUNTRY_CODE_ID": -1,
        		"countryErrorState": "None",
        		"CURRENCY_CODE_ID": -1,
        		"currencyErrorState": "None",
        		"IBP_RELEVANCY_CODE_ID": -1,
        		"IBPRelevancyErrorState": "None",
        		"NETTING_DEFAULT_CODE_ID": -1,
        		"nettingDefaultErrorState": "None",
        		"QUADRANT_CODE_ID": -1,
        		"quadrantErrorState": "None",
        		"CHANNEL_CODE_ID": -1,
        		"channelErrorState": "None",
        		"MARKET_DEFAULT_CODE_ID": -1,
        		"marketDefaultErrorState": "None",
        		"SUPPLY_SYSTEM_FLAG_CODE_ID": -1,
        		"CREATED_BY":"",
        		"createNew" : false,
        		"errorMessage":false
    			});
			}
			// Assigning view model for the page
		    var oModel = new sap.ui.model.json.JSONModel({GMIDShipToCountryVM : initData});
		    // Create table model, set size limit to 300, add an empty row
		    oModel.setSizeLimit(300);
		    // define a global variable for the view model, the view model data and oData model
		    this._oGMIDShipToCountryViewModel = oModel;
		    this._oViewModelData = this._oGMIDShipToCountryViewModel.getData();
		    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
		    this.getView().setModel(oModel);
		    this.addEmptyObject();
		    
		    // Create Message model
	    	this._oMessageModel = new sap.ui.model.json.JSONModel();
	    	this._oMessageModel.setProperty("/NumOfGMIDSubmitted",0);
	    	this.getView().setModel(this._oMessageModel,"MessageVM");
	    	
	    	  // Set error message column to false (not visible by default)
		    this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",false);

			// Bind Country dropdown
			// Create a filter & sorter array
			var countryFilterArray = [];
			var countryFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"COUNTRY");
			countryFilterArray.push(countryFilter);
			var countrySortArray = [];
			var countrySort = new sap.ui.model.Sorter("LABEL",false);
			countrySortArray.push(countrySort);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
					filters: countryFilterArray,
					sorters: countrySortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the Country data to the GMIDShipToCountry model
		                oModel.setProperty("/GMIDShipToCountryVM/Country",oData.results);
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve countries.");
	    			}
	    	});
	    		
	    	// Bind Stored Currency dropdown
			// Create a filter & sorter array
			var storedcurrencyFilterArray = [];
			var storedcurrencyFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"CURRENCY");
			storedcurrencyFilterArray.push(storedcurrencyFilter);
			var storedcurrencySortArray = [];
			var storedcurrencySort = new sap.ui.model.Sorter("LABEL",false);
			storedcurrencySortArray.push(storedcurrencySort);
			// Get the Stored Currency dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
					filters: storedcurrencyFilterArray,
					sorters: storedcurrencySortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the Stored Currency data to the GMIDShipToCountry model
		                oModel.setProperty("/GMIDShipToCountryVM/StoredCurrency",oData.results);
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve currencies.");
	    			}
	    	});
	    		
	    	// Bind IBP Relavancy dropdown
			// Create a filter & sorter array
			var ibprelevancyFilterArray = [];
			var ibprelevancyFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"IBP_RELEVANCY");
			ibprelevancyFilterArray.push(ibprelevancyFilter);
			var ibprelevancySortArray = [];
			var ibprelevancySort = new sap.ui.model.Sorter("LABEL",false);
			ibprelevancySortArray.push(ibprelevancySort);
			// Get the IBP Relevancy dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
					filters: ibprelevancyFilterArray,
					sorters: ibprelevancySortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the IBP Relevancy data to the GMIDShipToCountry model
		                oModel.setProperty("/GMIDShipToCountryVM/IBPRelevancyFlag",oData.results);
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve IBP Relevancy data.");
	    			}
	    	});
	    		
	    	// Bind Netting Default dropdown
			// Create a filter & sorter array
			var nettingdefaultFilterArray = [];
			var nettingdefaultFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"NETTING_DEFAULT");
			nettingdefaultFilterArray.push(nettingdefaultFilter);
			var nettingdefaultSortArray = [];
			var nettingdefaultSort = new sap.ui.model.Sorter("LABEL",false);
			nettingdefaultSortArray.push(nettingdefaultSort);
			// Get the Netting Default dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
					filters: nettingdefaultFilterArray,
					sorters: nettingdefaultSortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the Netting Default data to the GMIDShipToCountry model
		                oModel.setProperty("/GMIDShipToCountryVM/NettingDefaultFlag",oData.results);
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve netting default data.");
	    			}
	    	});
	    		
	    	// Bind Quadrant dropdown
			// Create a filter & sorter array
			var quadrantFilterArray = [];
			var quadrantFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"QUADRANT");
			quadrantFilterArray.push(quadrantFilter);
			var quadrantSortArray = [];
			var quadrantSort = new sap.ui.model.Sorter("LABEL",false);
			quadrantSortArray.push(quadrantSort);
			// Get the Quadrant dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
					filters: quadrantFilterArray,
					sorters: quadrantSortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the Quadrant data to the GMIDShipToCountry model
		                oModel.setProperty("/GMIDShipToCountryVM/Quadrant",oData.results);
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve quadrant data.");
	    			}
	    	});
	    		
	    	// Bind Channel  dropdown
			// Create a filter & sorter array
			var channelFilterArray = [];
			var channelFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"CHANNEL");
			channelFilterArray.push(channelFilter);
			var channelSortArray = [];
			var channelSort = new sap.ui.model.Sorter("LABEL",false);
			channelSortArray.push(channelSort);
			// Get the Channel dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
					filters: channelFilterArray,
					sorters: channelSortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the Channel data to the GMIDShipToCountry model
		                oModel.setProperty("/GMIDShipToCountryVM/Channel",oData.results);
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve channel data.");
	    			}
	    	});
	    		
	    	// Bind Market Default  dropdown
			// Create a filter & sorter array
			var marketdefaultFilterArray = [];
			var marketdefaultFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"MARKET_DEFAULT");
			marketdefaultFilterArray.push(marketdefaultFilter);
			var marketdefaultSortArray = [];
			var marketdefaultSort = new sap.ui.model.Sorter("LABEL",false);
			marketdefaultSortArray.push(marketdefaultSort);
			// Get the Market Default dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
					filters: marketdefaultFilterArray,
					sorters: marketdefaultSortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the Market Default data to the GMIDShipToCountry model
		                oModel.setProperty("/GMIDShipToCountryVM/MarketDefaultFlag",oData.results);
		                //defaultMktCode = oData.results
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve market default data.");
	    			}
	    		});
	    		
	    		// Bind Supply System Flag dropdown
				// Create a filter array
				var supplySystemFilterArray = [];
				var supplySystemFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"SUPPLY_SYSTEM_FLAG");
				supplySystemFilterArray.push(supplySystemFilter);
				// Get the Supply System Flag dropdown list from the CODE_MASTER table
				this._oDataModel.read("/CODE_MASTER",{
						filters: supplySystemFilterArray,
						async: false,
		                success: function(oData, oResponse){
			                // Bind the Support System data list to view model
			                oModel.setProperty("/GMIDShipToCountryVM/SupplySystemFlag",oData.results);
		                },
		    		    error: function(){
		            		MessageToast.show("Unable to retrieve supply system flag data.");
		    			}
		    	});
	    	// get default values for various fields and set them in global variables
	    	this.getDefaultPropertyValues();
    	},
    	// Below function is used to prepare an empty object
    	addEmptyObject : function() {
	    	var aData  = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM");
	    	var emptyObject = {createNew: true, errorMessage: false};
	    	aData.push(emptyObject);
	    	this._oGMIDShipToCountryViewModel.setProperty("/GMIDShipToCountryVM", aData);
		},
		// Below function returns value for enabling a control
		enableControl : function(value) {
    		return !!value;
		},
		// Below function returns value for disabling a control
		disableControl : function(value) {
			return !value;
		},
		// Below function adds a new empty row
		onAddRow : function(oEvent) {
	    	var path = oEvent.getSource().getBindingContext().getPath();
		    // create new empty GMIDShipToCountry object
		    var obj = {
		    				GMID: "",
		    				GMIDErrorState: "None",
		    				COUNTRY_CODE_ID:-1,
		    				countryErrorState: "None",
		    				CURRENCY_CODE_ID:-1,
		    				currencyErrorState: "None",
	        				IBP_RELEVANCY_CODE_ID:this._defaultIBPRelevancy,
	        				IBPRelevancyErrorState: "None",
	        				NETTING_DEFAULT_CODE_ID:-1,
	        				nettingDefaultErrorState: "None",
	        				QUADRANT_CODE_ID:this._defaultQuadrantForSeed,
	        				quadrantErrorState: "None",
	        				CHANNEL_CODE_ID:this._defaultChannelForSeed,
	        				channelErrorState: "None",
	        				MARKET_DEFAULT_CODE_ID:-1,
	        				marketDefaultErrorState: "None",
	        				SUPPLY_SYSTEM_FLAG_CODE_ID: -1,
	        				CREATED_BY:"",
		    				createNew: false,
		    				errorMessage: false
		    		};
		    // set default property values on the basis of selected gmid type
	    	obj = this.setDefaultPropertyValues(this._oSelectedGMIDType, obj);
	    	this._oGMIDShipToCountryViewModel.setProperty(path, obj);
	    	this.addEmptyObject();
		},
		// Below function removes a row
		onRemoveRow : function(oEvent) {
			// Get the object to be deleted from the event handler
			var entryToDelete = oEvent.getSource().getBindingContext().getObject();
			// Get the # of rows in the VM, (this includes the dropdown objects such as Country, Currency, etc..)
			var rows = this._oViewModelData.GMIDShipToCountryVM;
			
			// loop through each row and check whether the passed object = the row object
			for(var i = 0; i < rows.length; i++){
				if(rows[i] === entryToDelete )
				{
					// found a match, remove this row from the data
					rows.splice(i,1);
					// refresh the GMID VM, this will automatically update the UI
					this._oGMIDShipToCountryViewModel.refresh();
					break;
				}
			}
		},
	    // Below function will show the grid when radio button is selected
		fnGridShow : function(evt){
	    	var oSelectedIndex = evt.getParameter("selectedIndex");  
	    	var oRadioButtonSrc = evt.getSource().getAggregation("buttons");  
	    	this._oSelectedGMIDType = oRadioButtonSrc[oSelectedIndex].getText();
	    	// get the crop protection and seeds value from i18n file
	    	var oi18nModel = this.getView().getModel("i18n");
		    this._oSeed = oi18nModel.getProperty("seeds");
		    this._oCropProtection = oi18nModel.getProperty("cropProtection");
		    var tblGmid = this.getView().byId("tblGMIDRequest");
			var btnSubmit = this.getView().byId("btnSubmit");
			var btnContinue = this.getView().byId("btnContinueToPlantSelection");
			if(this._oSelectedGMIDType === this._oSeed){
     			tblGmid.setVisible(true);
     			btnSubmit.setVisible(true);
     			btnContinue.setVisible(false);
			}
    		else
    		{
    			tblGmid.setVisible(true);
    			btnSubmit.setVisible(false);
    			btnContinue.setVisible(true);
    		}
    		
    		// show the import to Excel button
			var excelHBox = this.getView().byId("excelHBox");
    		excelHBox.setVisible(true);
    		
    		// Get the VM rows
			var rows = this._oViewModelData.GMIDShipToCountryVM;
			// loop through each row and update the Quadrant, Channel and Marketing Flag property to default value for seeds
			for(var i = 0; i < rows.length; i++){
				rows[i] = this.setDefaultPropertyValues(this._oSelectedGMIDType, rows[i]);
			}
    		// refresh the GMID VM, this will automatically update the UI
    		this._oGMIDShipToCountryViewModel.refresh();
		},
        validateTextFieldValues :function () {
        	var returnValue = true;
        	var data = this._oViewModelData.GMIDShipToCountryVM;
            for(var i = 0; i < data.length - 1; i++) 
            {
            	if(this.checkForEmptyFields(data[i]))
            	{
            		data[i].errorMessage = true;
            		if(data[i].toolTipText !== "")
	                {
	                	data[i].toolTipText += "\n";  
	                }
	            	data[i].toolTipText += "Please enter all mandatory fields highlighted in red.";
	            	returnValue = false;
            	}
            }
            return returnValue;
        },
        checkForEmptyFields: function (row) {
        	var errorsFound = false;
        	
    		if (row.GMID === "")
            {
            	row.GMIDErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.COUNTRY_CODE_ID,10) === -1)
            {
            	row.countryErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.IBP_RELEVANCY_CODE_ID,10) === -1)
            {
            	row.IBPRelevancyErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.NETTING_DEFAULT_CODE_ID,10) === -1)
            {
            	row.nettingDefaultErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.QUADRANT_CODE_ID,10) === -1)
            {
            	row.quadrantErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.CHANNEL_CODE_ID,10) === -1)
            {
            	row.channelErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.MARKET_DEFAULT_CODE_ID,10) === -1)
            {
            	row.marketDefaultErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.CURRENCY_CODE_ID,10) === -1)
            {
            	row.currencyErrorState = "Error";
            	errorsFound = true;
            }
            if(row.CREATED_BY === "")
            {
            	// do NOTHING SHOULD BE DELETED
            }
            return errorsFound;
        },
    	onChange: function(oEvent){
			var sourceControl = oEvent.getSource();
			sourceControl.setValueStateText("");
			sourceControl.setValueState(sap.ui.core.ValueState.None);
		},
        // function to check whether the user has entered a duplicate GMID/country entry on the form
        validateDuplicateEntries :function(){
	        var returnValue = true;
	        var data = this._oViewModelData.GMIDShipToCountryVM;
	        for(var i = 0; i < data.length - 1; i++) 
	        {
	            for( var j = i + 1; j < data.length - 1; j++)
	            { 
		            if((data[i].GMID !== "" &&  data[j].GMID !== "") && (data[i].COUNTRY_CODE_ID !== -1 &&  data[j].COUNTRY_CODE_ID !== -1) && (data[i].GMID === data[j].GMID) && (data[i].COUNTRY_CODE_ID === data[j].COUNTRY_CODE_ID !== -1))
		            {
		            	 data[i].errorMessage = true;
		            	 data[j].errorMessage = true;
		            	 
		            	 if(data[i].toolTipText !== "")
	                	 {
	                		data[i].toolTipText += "\n";  
	                	 }
	            		 data[i].toolTipText += "Duplicate GMID/Country Combination found at row # " + (j + 1);
	            		 
	            		 if(data[j].toolTipText !== "")
	                	 {
	                		data[j].toolTipText += "\n";  
	                	 }
	            		 data[j].toolTipText += "Duplicate GMID/Country Combination found at row # " + (i + 1);
	            		 
		            	 returnValue = false;
		            }
	            } 
	        }
	        return returnValue;
        },
        validateGmidShipFromPlant :function()
        {
        	var data = this._oViewModelData.GMIDShipToCountryVM;
        	var gmidHasPlant = true;
        	
	        for(var i = 0; i < data.length - 1; i++) 
	        {
	        	if(data[i].GMID !== "")
	        	{
		        	// Create a filter to fetch the GMID Country Status Code ID
					var gmidFilterArray = [];
					var gmidFilter = new Filter("GMID",sap.ui.model.FilterOperator.EQ,data[i].GMID);
					gmidFilterArray.push(gmidFilter);
		
					 // Get the GMID Country Status Code ID CODE_MASTER table
					 this._oDataModel.read("/GMID_SHIP_FROM_PLANT",{
							filters: gmidFilterArray,
							async: false,
			                success: function(oData, oResponse){
			                //return the GMID Country ID
			                	if(oData.results.length === 0)
			                	{
			                		gmidHasPlant = false;
			                		data[i].errorMessage = true;
			                		if(data[i].toolTipText !== "")
			                		{
			                			data[i].toolTipText += "\n";  
			                		}
			                		data[i].toolTipText += "There is no plant available for the selected GMID(s).";  
		
			                	}
			                },
			    		    error: function(){
			            		MessageToast.show("Unable to retrieve plants for GMID.");
			    			}
			    		});
		        }
	        }
	        // if for each GMID a plant exists, return true, else return false
	        return gmidHasPlant;
	        
        },
        // validating whether entered GMID have valid status
        validateGMIDbyStatus : function  (gmid) {
        	 var oi18nModel = this.getView().getModel("i18n");
        	  // get the GMID status for i18n model
        	 var z1gmid = oi18nModel.getProperty("z1gmidStatus");
        	 var zcgmid = oi18nModel.getProperty("zcgmidstatus");
        	 var z9gmid = oi18nModel.getProperty("z9gmidstatus");
        	 var prdGMID = oi18nModel.getProperty("prdGMID");
        	 var gmiddata = this._oViewModelData.GMIDShipToCountryVM;
        	 var validgmidwithstatus = true;
        	for(var i = 0; i < gmiddata.length - 1; i++) 
	        {
	        	if(gmiddata[i].GMID !== "")
	        	{
	        		// Create a filter to fetch the GMID Country Status Code ID
					var gmidFilterArray = [];
					var gmidFilter = new Filter("GMID",sap.ui.model.FilterOperator.EQ,this.lpadstring(gmiddata[i].GMID));
					gmidFilterArray.push(gmidFilter);
					var z1gmidFilter = new Filter("MATERIAL_STATE",sap.ui.model.FilterOperator.EQ,z1gmid);
					var zcgmidFilter = new Filter("MATERIAL_STATE",sap.ui.model.FilterOperator.EQ,zcgmid);
					var z9gmidFilter = new Filter("MATERIAL_STATE",sap.ui.model.FilterOperator.EQ,z9gmid);
					var prdGMIDFilter = new Filter("SOURCE",sap.ui.model.FilterOperator.EQ,prdGMID);
					var gmidstatusFilter = new Filter ({
						filters : [
							z1gmidFilter,
							zcgmidFilter,
							z9gmidFilter,
							prdGMIDFilter
							],
							and : false
					});
					gmidFilterArray.push(gmidstatusFilter);
					 // verify if the GMID entered belongs to Z1,ZC,Z9 or prdGMID status
					 this._oDataModel.read("/MST_GMID?$select=GMID",{
					filters: gmidstatusFilter,
					async: false,
	                success: function(oData, oResponse){
	                    //check if GMID exists
	                	if(oData.results.length !== 0){
	                		validgmidwithstatus = false;
	                		gmiddata[i].errorMessage = true;
	                		gmiddata[i].GMIDErrorState = "Error";
			                if(gmiddata[i].toolTipText !== "")
			                {
			                	gmiddata[i].toolTipText += "\n";  
			                }
			                gmiddata[i].toolTipText += "Status is Invalid for the selected GMID(s).";  
	                	}
	                	
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve GMID status from MST_GMID table.");
	    			}
	    			});
	        	}
	        }
	        return validgmidwithstatus;
        },
        // below function will validate whether entered GMID is valid or not
        validateGMID : function()
        {
        	var gmiddata = this._oViewModelData.GMIDShipToCountryVM;
        	var validgmid = true;
        	for(var i = 0; i < gmiddata.length - 1; i++) 
	        {
	        	if(gmiddata[i].GMID !== "")
	        	{
	        		// Create a filter to fetch the GMID Country Status Code ID
					var gmidFilterArray = [];
					var gmidFilter = new Filter("GMID",sap.ui.model.FilterOperator.EQ,this.lpadstring(gmiddata[i].GMID));
					gmidFilterArray.push(gmidFilter);
					 // verify if the GMID entered belongs to Z1,ZC,Z9 or prdGMID status
					this._oDataModel.read("/MST_GMID?$select=GMID",{
					filters: gmidFilterArray,
					async: false,
	                success: function(oData, oResponse){
	                    //check if GMID exists
	                	if(oData.results.length === 0){
	                		validgmid = false;
	                		gmiddata[i].errorMessage = true;
	                		gmiddata[i].GMIDErrorState = "Error";
			                if(gmiddata[i].toolTipText !== "")
			                {
			                	gmiddata[i].toolTipText += "\n";  
			                }
			                gmiddata[i].toolTipText += "Selected GMID(s) are Invalid.";  
	                	}
	                	
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve GMID status from MST_GMID table.");
	    			}
	    			});
	        	}
	        }
	        return validgmid;
        	
        },
         // below function will left pad GMID with leading zeroes if length is less than 8
        lpadstring : function(gmid) {
    			while (gmid.length < 8)
        		gmid = "0" + gmid;
    		return gmid;
        },
        // function to check if the field is numeric
        numValidationCheck : function (oEvent) {
        	oEvent.getSource().setValueStateText("");
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
        	var sNumber = "";
			var value = oEvent.getSource().getValue();
            var bNotnumber = isNaN(value);
            if(bNotnumber === false) 
            {
            	sNumber = value;
            }   
            else 
            {
            	oEvent.getSource().setValue(sNumber);
            } 
        },
        resetValidationForModel : function () {
        	var data = this._oViewModelData.GMIDShipToCountryVM;
            for(var i = 0; i < data.length - 1; i++) 
            {	
            	data[i].errorMessage = false;
            	data[i].toolTipText = "";
            	data[i].GMIDErrorState = "None";
            	data[i].countryErrorState = "None";
            	data[i].currencyErrorState = "None";
            	data[i].IBPRelevancyErrorState = "None";
            	data[i].nettingDefaultErrorState = "None";
            	data[i].quadrantErrorState = "None";
            	data[i].channelErrorState = "None";
            	data[i].marketDefaultErrorState = "None";
            }
            this._oGMIDShipToCountryViewModel.refresh();
        },
        showErrorMessage: function(oEvent)
        {
        	var text = oEvent.getSource().data("text");
        	MessageBox.alert(text, {
	    			icon : MessageBox.Icon.ERROR,
					title : "Invalid Input"
	       		});
        },
    	// Function to save the data into the database
    	onSubmit : function () {
    		var errorCount = 0;
    		var successCount = 0;
    		var GMIDShipToCountry = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM");
    		
    		// reset the error message property to false before doing any validation
			this.resetValidationForModel();
			// remove the Error column on the UI
			this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",false);
			// remove the file from the uploader
			var fileUploader = this.getView().byId("excelFileUploader");
			fileUploader.clear();
			
	        if (this.validateTextFieldValues() === false)
	        {
	        	// Set error message column to false (not visible by default)
		    	this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
	        }
	        // if crop protection is selected and the GMID/plant combination does not exist, return error
	        if(this._oSelectedGMIDType === this._oCropProtection && this.validateGmidShipFromPlant() === false)
        	{
        		this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
        	}
	        // check for duplicate GMID/Country Combination
	        if(this.validateUniqueGmidCountry() === true)
        	{
        		this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
        	}
        	if (this.validateDuplicateEntries() === false)
        	{
        		this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
        	}
        	// check if GMID entered is valid
        	if (this.validateGMID() === false)
        	{
        		this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
        	}
        	// check of invalid GMID entry by checking the status of GMID
        	if (this.validateGMIDbyStatus() === false)
        	{
        		this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
        	}
	        if(!this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true))
	        {
	        	var tablePath = "";
	    	    if(this._oSelectedGMIDType === this._oCropProtection)
	    	    {
	    	    	tablePath = "/GMID_SHIP_TO_COUNTRY_STG";
	    	    }
	    	    else
	    	    {
	    	    	tablePath = "/GMID_SHIP_TO_COUNTRY";
	    	    }
	    	    
	    		// Create current timestamp
	    		var oDate = new Date();
	    		// Get the MaxID
	    	    var maxID =	this.getMaxID(tablePath);
	    	    // Get the code id for GMID Country Status
	    	    var gmidcountrystatusID = this.getGMIDCountryStatusID();
	    	    
	    		// loop through the rows and for each row insert data into database
	    		// each row contains GMID Ship To combination.
	    		for(var i = 0; i < GMIDShipToCountry.length - 1; i++) 
	    		{
					var GMID = GMIDShipToCountry[i].GMID;
					var countryID = parseInt(GMIDShipToCountry[i].COUNTRY_CODE_ID,10);
					var storedcurrencyID = parseInt(GMIDShipToCountry[i].CURRENCY_CODE_ID,10);
					var ibprelevancyID = parseInt(GMIDShipToCountry[i].IBP_RELEVANCY_CODE_ID,10);
					var nettingdefaultID = parseInt(GMIDShipToCountry[i].NETTING_DEFAULT_CODE_ID,10);
					var quadrantID = parseInt(GMIDShipToCountry[i].QUADRANT_CODE_ID,10);
					var channelID = parseInt(GMIDShipToCountry[i].CHANNEL_CODE_ID,10);
					var marketdefaultID = parseInt(GMIDShipToCountry[i].MARKET_DEFAULT_CODE_ID,10);
					var supplySystemFlag = parseInt(GMIDShipToCountry[i].SUPPLY_SYSTEM_FLAG_CODE_ID,10);
					var createdBy = GMIDShipToCountry[i].CREATED_BY;
					// create new GMIDShipToCountry object
					var newGMID = {
			        	ID: maxID + 1 + i,
			        	GMID: GMID,
			        	COUNTRY_CODE_ID: countryID,
			        	CURRENCY_CODE_ID: storedcurrencyID,
			        	IBP_RELEVANCY_CODE_ID: ibprelevancyID,
			        	NETTING_DEFAULT_CODE_ID: nettingdefaultID,
			        	QUADRANT_CODE_ID:quadrantID,
			        	CHANNEL_CODE_ID: channelID,
			        	MARKET_DEFAULT_CODE_ID: marketdefaultID,
			        	SUPPLY_SYSTEM_FLAG_CODE_ID: supplySystemFlag,
			        	TYPE: this._oSelectedGMIDType,
			        	GMID_COUNTRY_STATUS_CODE_ID: gmidcountrystatusID,
			        	CREATED_ON: oDate,
			        	CREATED_BY:createdBy
	    			};
	    			
	        		this._oDataModel.create(tablePath, newGMID,
	        		{
			        	success: function(){
			        		successCount++;
			    		},
			    		error: function(){
			    			errorCount++;
						}
	        		});
	    		}
	    		//Show success or error message
	    		if(errorCount === 0) 
	    		{
        			if(this._oSelectedGMIDType === this._oSeed)
        			{
        					        			// once insertion is success, navigate to homepage
        				this._oMessageModel.setProperty("/NumOfGMIDSubmitted",successCount);
    					this.getOwnerComponent().openSubmitConfirmDialog(this.getView());
        			}
        			else
        			{
        				// navigate to plant selection
        				this.resetModel();
                    	this.getOwnerComponent().getRouter().navTo("gmidPlantSelection");
    				}
	    		}
	    		else 
	    		{
	        			MessageToast.show("Error: GMIDs were not submitted. Click on the error icon next to each GMID for more information.");
	    		}
    		
        	}
        },
        resetModel: function ()
        {
        	// hide the table & excel button and set the radio button to not selected
			var tblGmid = this.getView().byId("tblGMIDRequest");
			tblGmid.setVisible(false);
			//var excelHBox = oView.byId("excelHBox");
			//excelHBox.setVisible(false);
			var rbgGMIDType = this.getView().byId("rbgGMIDType");
			rbgGMIDType.setSelectedIndex(-1);
			var btnSubmit = this.getView().byId("btnSubmit");
			btnSubmit.setVisible(false);
			var btnContinue = this.getView().byId("btnContinueToPlantSelection");
			btnContinue.setVisible(false);
			
			// reset model to default 5 rows
			var data = this._oViewModelData.GMIDShipToCountryVM;
			for(var i = 0; i < data.length - 1; i++) 
			{
				data[i].GMID = "";
				data[i].GMIDErrorState = "None";
    			data[i].COUNTRY_CODE_ID = -1;
    			data[i].countryErrorState = "None";
    			data[i].CURRENCY_CODE_ID = -1;
    			data[i].currencyErrorState = "None";
    			data[i].IBP_RELEVANCY_CODE_ID = -1;
    			data[i].IBPRelevancyErrorState = "None";
    			data[i].NETTING_DEFAULT_CODE_ID = -1;
    			data[i].nettingDefaultErrorState = "None";
    			data[i].QUADRANT_CODE_ID = -1;
    			data[i].quadrantErrorState = "None";
    			data[i].CHANNEL_CODE_ID = -1;
    			data[i].channelErrorState = "None";
    			data[i].MARKET_DEFAULT_CODE_ID = -1;
    			data[i].marketDefaultErrorState = "None";
    			data[i].SUPPLY_SYSTEM_FLAG_CODE_ID = -1;
    			data[i].CREATED_BY = "";
    			data[i].createNew = "";
    			data[i].errorMessage = false;
    			data[i].toolTipText = "";
            }
            
            // remove any extra rows, only want to show 5
            data.splice(5,data.length - 5);
            this._oGMIDShipToCountryViewModel.refresh();
        },
        // below function will return the max ID from GMID_SHIP_TO_COUNTRY TABLE
        getMaxID : function  (tablePath) {
			// Create a filter & sorter array to fetch the max ID
			var idSortArray = [];
			var idSort = new sap.ui.model.Sorter("ID",true);
			idSortArray.push(idSort);
			
			var maxID = null;

			 // Get the Country dropdown list from the CODE_MASTER table
			 this._oDataModel.read(tablePath + "?$top=1&$select=ID",{
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
	            		MessageToast.show("Unable to retrieve max ID for GMID table.");
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
        // method to check for duplicate Gmid and Country combination
        validateUniqueGmidCountry : function (){
        	// loop through the rows and for each row check for duplicate entry in DB
	    	// each row contains GMID Ship To combination.
	    	var data = this._oViewModelData.GMIDShipToCountryVM;
	    	var isDuplicate = false;
    		for(var i = 0; i < data.length - 1; i++) 
    		{
    			var GMID = data[i].GMID;
				var countryID = parseInt(data[i].COUNTRY_CODE_ID,10);
				var gmidcountrystatusID = this.checkGMIDCountryUniqueInDB(GMID,countryID);
				if (gmidcountrystatusID !== 0)
				{
					isDuplicate = true;
					data[i].errorMessage = true;
					if(data[i].toolTipText !== "")
			        {
            			data[i].toolTipText += "\n";  
			        }
            		data[i].toolTipText += "GMID/Country Combination already exists in the system.";
				}
				else
				{
					continue;
				}
    		}
    		this._oGMIDShipToCountryViewModel.refresh();
    		
	    	return isDuplicate;
        },
        // below function will check for duplicate entry for GMID/Country Combination in DB
        checkGMIDCountryUniqueInDB : function  (gmid,countryid) {
			// Create a filter to fetch the GMID Country Status Code ID
			var gmidcountrycodeuniqueFilterArray = [];
			var gmidFilter = new Filter("GMID",sap.ui.model.FilterOperator.EQ,gmid);
			gmidcountrycodeuniqueFilterArray.push(gmidFilter);
			var countrycodeFilter = new Filter("COUNTRY_CODE_ID",sap.ui.model.FilterOperator.EQ,countryid);
			gmidcountrycodeuniqueFilterArray.push(countrycodeFilter);
			
			var gmidcountryID = null;

			 // Get the GMID Country Status Code ID CODE_MASTER table
			 this._oDataModel.read("/GMID_SHIP_TO_COUNTRY?$select=ID",{
					filters: gmidcountrycodeuniqueFilterArray,
					async: false,
	                success: function(oData, oResponse){
	                //return the GMID Country ID
	                	if(oData.results.length === 0){
	                		gmidcountryID = 0;
	                	}
	                	else {gmidcountryID = oData.results[0].ID; }
	                },
	    		    error: function(){
	            		MessageToast.show("Unable to retrieve Code ID for GMID Country Status.");
	    			}
	    		});
	    	return gmidcountryID;
        },
        // gets the default property values and sets them in global variables
        getDefaultPropertyValues : function(){
        	// get default value's (0 - Active) code id for IBP Relevancy Flag  and set to global variable
        	var ibpRelevancyList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/IBPRelevancyFlag");
			this._defaultIBPRelevancy = ibpRelevancyList.find(function(data){return data.CODE_KEY === "0"; }).ID;
			
			// get default value's code id ('Not Applicable') for seeds for Quadrant field and set to global variable
			var quadrantList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Quadrant");
			this._defaultQuadrantForSeed = quadrantList.find(function(data){return data.CODE_KEY === "N/A"; }).ID;
			
	    	// get default value's code id ('Not Applicable') for seeds for Channel field and set to global variable
	    	var channelList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Channel");
			this._defaultChannelForSeed = channelList.find(function(data){return data.CODE_KEY === "N/A"; }).ID;
			
	    	// get default value's code id ('0 - Crop') for crop protection for Marketing Flag field and set to global variable
	    	var mktFlagList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/MarketDefaultFlag");
			this._defaultMarketingFlagForCP = mktFlagList.find(function(data){return data.CODE_KEY === "0"; }).ID; 
			
			// get default value's code ids for seed and crop protection for Supply System flag and set to global variable
	    	var supplySystemFlag = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/SupplySystemFlag");
			this._defaultSupplySystemFlagForSeed = supplySystemFlag.find(function(data){return data.CODE_KEY === "RR"; }).ID; 
			this._defaultSupplySystemFlagForCP = supplySystemFlag.find(function(data){return data.CODE_KEY === "APO"; }).ID; 
        },
        // set the default property values for the passed object
        setDefaultPropertyValues : function(selectedGMIDType, obj){
        	obj.IBP_RELEVANCY_CODE_ID = this._defaultIBPRelevancy;
        	if(this._oSelectedGMIDType === this._oSeed){
				obj.QUADRANT_CODE_ID = this._defaultQuadrantForSeed;
				obj.CHANNEL_CODE_ID = this._defaultChannelForSeed;
				obj.MARKET_DEFAULT_CODE_ID = -1;
				obj.SUPPLY_SYSTEM_FLAG_CODE_ID = this._defaultSupplySystemFlagForSeed;
        	}
        	else{
				obj.QUADRANT_CODE_ID = -1;
				obj.CHANNEL_CODE_ID = -1;
				obj.MARKET_DEFAULT_CODE_ID = this._defaultMarketingFlagForCP;
				obj.SUPPLY_SYSTEM_FLAG_CODE_ID = this._defaultSupplySystemFlagForCP;
        	}
        	return obj;
        },
        onImportFromExcel : function(e) {
        	this._validDataFlag = false;
	
			// Get the file
			var fileUploader = this.getView().byId("excelFileUploader");
			var domRef = fileUploader.getFocusDomRef();
			var file = domRef.files[0];
			
			// create file reader
		    var fileReader = new FileReader();
		    
		    // remove the Error column on the UI
			this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",false);
			
			if(file === undefined || file === "")
			{
				MessageToast.show("Please select a file.");	
			}
			else
			{
				// read the file
				fileReader.readAsText(file);
			}
			fileReader.onerror = this.errorHandler;
			
			// declare this to access the global functions and variables
			var t = this;
			
			fileReader.onload = function(event){
				var strCSV = event.target.result;
				var oi18nModel = t.getView().getModel("i18n");
			   
				var headerRow = ["GMID", "COUNTRY_CODE_ID", "CURRENCY_CODE_ID","IBP_RELEVANCY_CODE_ID",
				"NETTING_DEFAULT_CODE_ID","QUADRANT_CODE_ID","CHANNEL_CODE_ID","MARKET_DEFAULT_CODE_ID",
				"CREATED_BY"];
			   
		        var allTextLines = strCSV.split(/\r\n|\n/);
		        var excelColumnHeaders = allTextLines[0].split(",");
		        var validHeadersFlag = true;
		        
		        if (excelColumnHeaders.length !== parseInt(oi18nModel.getProperty("numOfHeaderColumns"),10))
            	{
            		MessageToast.show("Incorrect number of columns on template.");	
            		validHeadersFlag = false;
            	}
            	else
            	{
            		for(var i = 0; i < excelColumnHeaders.length; i++) 
            		{
            			// Get proper column headers from the i18n model
		                var oGMID = oi18nModel.getProperty("eGMID");
		                var oCountry  = oi18nModel.getProperty("eCountry");
		                var oStoredCurrency =oi18nModel.getProperty("eStoredCurrency"); 
		                var oIbpRelevancy  = oi18nModel.getProperty("eIBPRelevancy");
		                var oNettingDefault = oi18nModel.getProperty("eNettingDefault");
		                var oQuadrant = oi18nModel.getProperty("eQuadrant");
		                var oChannel = oi18nModel.getProperty("eChannel");
		                var oMarketDefault = oi18nModel.getProperty("eMarketDefault");
		                var oRequestedBy  = oi18nModel.getProperty("eRequestedBy");
		                
			            if (excelColumnHeaders[0] !== oGMID)
			            {
			                MessageToast.show("Incorrect template format found. The first column should be: GMID");
			                validHeadersFlag = false;
			            }
			            else if (excelColumnHeaders[1] !== oCountry)
			            {
			                MessageToast.show("Incorrect template format found. The second column should be: Country");
			                validHeadersFlag = false;
			            }
			            else if (excelColumnHeaders[2] !== oStoredCurrency)
			            {
			                 MessageToast.show("Incorrect template format found. The third column should be: Stored Currency");
			                 validHeadersFlag = false;
			            }
			            else if (excelColumnHeaders[3] !== oIbpRelevancy)
			            {
			                 MessageToast.show("Incorrect template format found. The fourth column should be: IBP Relevancy");
			                 validHeadersFlag = false;
			           	}
			    		else if (excelColumnHeaders[4] !== oNettingDefault)
			    		{
			                 MessageToast.show("Incorrect template format found. The fifth column should be: Netting Default");
			                 validHeadersFlag = false;
			    		}
			    	    else if (excelColumnHeaders[5] !== oQuadrant)
			    		{
			                 MessageToast.show("Incorrect template format found. The sixth column should be: Quadrant");
			                 validHeadersFlag = false;
			    		}
			    	    else if (excelColumnHeaders[6] !== oChannel)
			    		{
			                 MessageToast.show("Incorrect template format found. The seventh column should be: Channel");
			                 validHeadersFlag = false;
			    		}
			    	    else if (excelColumnHeaders[7] !== oMarketDefault)
			    		{
			                 MessageToast.show("Incorrect template format found. The eight column should be: Market Default Flag");
			                 validHeadersFlag = false;
			    		}
			    	    else if (excelColumnHeaders[8] !== oRequestedBy)
			    		{
			                 MessageToast.show("Incorrect template format found. The ninth column should be: Requested By");
			                 validHeadersFlag = false;
			    		}
            		} // end of for loop
            	} // end of else

				// if all the headers are correct
		        if(validHeadersFlag)
		        {
	            	// clear out the current data on the page
			        t._oViewModelData.GMIDShipToCountryVM.splice(0,t._oViewModelData.GMIDShipToCountryVM.length);
			        // loop through all the rows, the last row is empty so do not include it
		            for (var k = 1; k < allTextLines.length - 1; k++) 
		            {
		            	// get a single row
		            	var row = allTextLines[k].split(",");
		               
	                	// create new empty row
						 var obj = {
		    				"GMID": "",
			        		"COUNTRY_CODE_ID": -1,
			        		"CURRENCY_CODE_ID": -1,
			        		"IBP_RELEVANCY_CODE_ID": -1,
			        		"NETTING_DEFAULT_CODE_ID": -1,
			        		"QUADRANT_CODE_ID": -1,
			        		"CHANNEL_CODE_ID": -1,
			        		"MARKET_DEFAULT_CODE_ID": -1,
			        		"CREATED_BY":"",
			        		"createNew" : false,
			        		"errorMessage":false
							};
								
	                	// get a single row from the Excel file
	            		// convert the labels to CODE ID's
	            		var convertedRow = t.convertLabelToCodeId(row);
	            		
	            		// fill the obj with values
						for (var j = 0; j < convertedRow.length; j++) 
						{
						    obj[headerRow[j]] = convertedRow[j];
						}
						// set default supply system flag values for both seeds and crop protection
						if(t._oSelectedGMIDType === t._oSeed){
								obj["SUPPLY_SYSTEM_FLAG_CODE_ID"] = t._defaultSupplySystemFlagForSeed;
        				}
        				else{
        					obj["SUPPLY_SYSTEM_FLAG_CODE_ID"] = t._defaultSupplySystemFlagForCP;
        				}
						
						// push the object to our model
						t._oViewModelData.GMIDShipToCountryVM.push(obj);
		            }
		            
		        	if (t._validDataFlag === true)
			    	{
			    	 	MessageToast.show("Invalid/empty fields were found and defaulted during import.");
			    	}
		            // add empty row a the bottom;
		            t.addEmptyObject();
		            // refresh the view model
		            t._oGMIDShipToCountryViewModel.refresh();
			            
			    }  // end valid headers flag check
			}; // end file read on load function
        },
        errorHandler : function(event){
        	MessageToast("Error reading CSV file, please ensure the file is in CSV format.");
        },
        convertLabelToCodeId : function(row) {
        	// get all the dropdownlists
        	var countryList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Country");
        	var storedCurrencyList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/StoredCurrency");
        	var ibpRelevancyList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/IBPRelevancyFlag");
        	var nettingDefaultList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/NettingDefaultFlag");
        	var quadrantList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Quadrant");
        	var channelList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Channel");
        	var marketDefaultList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/MarketDefaultFlag");
        	// row[0] is the GMID, check if more than 8 chars or not a number
        	if(row[0].length > 8 || isNaN(row[0]) || row[0].indexOf(".") !== -1)
        	{
        		row[0] = "";
        		this._validDataFlag = true;
        	}
        	
        	// set the CODE ID's based on labels
        	var countryObject = countryList.find(function(data){return data.LABEL === row[1].trim(); });
        	if (countryObject !== "" && countryObject !== undefined)
        	{
        		row[1] = countryObject.ID;
        	}
        	else
        	{
        		row[1] = -1;
        		this._validDataFlag = true;
        	}
        	var storedCurrencyobj = storedCurrencyList.find(function(data){return data.LABEL === row[2].trim(); });
        	if (storedCurrencyobj !== "" && storedCurrencyobj !== undefined)
        	{
        	 	row[2] = storedCurrencyobj.ID;
        	}
        	else
        	{
        	   	row[2] = -1;
        		this._validDataFlag = true;
        	}
        	var ibpRelevancyobj = ibpRelevancyList.find(function(data){return data.LABEL === row[3].trim(); });
        	if (ibpRelevancyobj !== "" && ibpRelevancyobj !== undefined)
        	{
        	 	row[3] = ibpRelevancyobj.ID;
        	}
        	else
        	{
        	   	row[3] = -1;
        		this._validDataFlag = true;
        	}
        	var nettingDefaultobj = nettingDefaultList.find(function(data){return data.LABEL === row[4].trim(); });
        	if (nettingDefaultobj !== "" && nettingDefaultobj !== undefined)
        	{
        	 	row[4] = nettingDefaultobj.ID;
        	}
        	else
        	{
        	   	row[4] = -1;
        		this._validDataFlag = true;
        	}
        	var quadrantobj = quadrantList.find(function(data){return data.LABEL === row[5].trim(); });
        	if (quadrantobj !== "" && quadrantobj !== undefined)
        	{
        	 	row[5] = quadrantobj.ID;
        	}
        	else
        	{
    			if(this._oSelectedGMIDType === this._oSeed)
    			{
					row[5] = this._defaultQuadrantForSeed;
        		}
        		else
        		{
        			row[5] = -1;
        		}
        		this._validDataFlag = true;
        	}
        	var channelobj = channelList.find(function(data){return data.LABEL === row[6].trim(); });
        	if (channelobj !== "" && channelobj !== undefined)
        	{
        	 	row[6]= channelobj.ID;
        	}
        	else
        	{
        	   	if(this._oSelectedGMIDType === this._oSeed)
    			{
					row[6] = this._defaultChannelForSeed;
        		}
        		else
        		{
        			row[6] = -1;
        		}
        		this._validDataFlag=true;
        	}
        	var marketDefauObj = marketDefaultList.find(function(data){return data.LABEL === row[7].trim(); });
        	if (marketDefauObj !== "" && marketDefauObj !== undefined)
        	{
        		row[7] = marketDefauObj.ID;
        	}
        	else
        	{
        		if(this._oSelectedGMIDType === this._oSeed)
    			{
					row[7] = -1;
        		}
        		else
        		{
        			row[7] = this._defaultMarketingFlagForCP;
        		}
        		this._validDataFlag=true;
        	}
        	return row;
        },
        onDownloadTemplate: function(){			
         	var oUploadCollection = this.getView().byId("ucDownloadTemplate");
			var oUploadCollectionItem = this.getView().byId("uciDownloadTemplate");
			oUploadCollection.downloadItem(oUploadCollectionItem, true);
		},
		// navigate back to the homepage
		onHome: function(){
				this.getOwnerComponent().getRouter().navTo("home");
		}
  	});

});