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
     var loggedInUserID;
     var firstTimePageLoad = true;
	return Controller.extend("bam.controller.GMIDSubmission", {
		onInit : function () {
			
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();

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
        		"createNew" : false,
        		"isError":false
    			});
			}

			// Assigning view model for the page
		    var oModel = new sap.ui.model.json.JSONModel({GMIDShipToCountryVM : initData});
		    // Create table model, set size limit to 300, add an empty row
		    oModel.setSizeLimit(2000);
		    // define a global variable for the view model, the view model data and oData model
		    this._oGMIDShipToCountryViewModel = oModel;
		    this._oViewModelData = this._oGMIDShipToCountryViewModel.getData();
		    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
		    this.getView().setModel(oModel);
		    this.addEmptyObject();
		    
		    // Create Message model -- NOT USED
	    	this._oMessageModel = new sap.ui.model.json.JSONModel();
	    	this._oMessageModel.setProperty("/NumOfGMIDSubmitted",0);
	    	this.getView().setModel(this._oMessageModel,"MessageVM");
	    	
	    	  // Set error message column to false (not visible by default)
		    this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",false);
		    
		    // set the busy indicator
			// creating busy dialog lazily
    		if (!this._busyDialog) 
			{
				this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
				this.getView().addDependent(this._dialog);
			}
			
			this._oi18nModel = new ResourceModel({
                bundleName: "bam.i18n.i18n"
            });

			// set all the dropdowns, get the data from the code master table
	    	oModel.setProperty("/GMIDShipToCountryVM/Country",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddCountry")));
	    	oModel.setProperty("/GMIDShipToCountryVM/StoredCurrency",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddStoredCurrency")));
	    	oModel.setProperty("/GMIDShipToCountryVM/IBPRelevancyFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddIBPRelevancyFlag")));
	    	oModel.setProperty("/GMIDShipToCountryVM/NettingDefaultFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddNettingDefaultFlag")));
	    	oModel.setProperty("/GMIDShipToCountryVM/Quadrant",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddQuadrant")));
	    	oModel.setProperty("/GMIDShipToCountryVM/Channel",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddChannel")));
	    	oModel.setProperty("/GMIDShipToCountryVM/MarketDefaultFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddMarketDefault")));
	    	oModel.setProperty("/GMIDShipToCountryVM/SupplySystemFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddSupplySystemFlag")));

	    	// attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
	    	// do not attach again if this is not the first time loading the page, if we attach it again performance is affected
	    	if(firstTimePageLoad)
	    	{
	    		var oRouter = this.getRouter();
				oRouter.getRoute("gmidSubmission").attachMatched(this._onRouteMatched, this);
				// get default values for various fields and set them in global variables
	    		this.getDefaultPropertyValues();
	    	}
	    	else
	    	{
	    		// reset the UI to all be invisible
	    		this.resetPage();
	    	}
    	},
    	getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
		// force init method to be called everytime we naviagte to Maintain Attribuets page 
		_onRouteMatched : function (oEvent) {
			// if the user is not a BAM user, redirect to access denied page
			if(DataContext.isBAMUser() === false)
			{
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else
			{
				if(firstTimePageLoad)
				{
					firstTimePageLoad = false;
				}
				else
				{
					this.onInit();
				}
			}
		},
		// navigate back to the homepage
		onHome: function(){
				this.getOwnerComponent().getRouter().navTo("home");
		},
		resetPage: function ()
        {
        	// hide the table & excel button and set the radio button to not selected
			var tblGmid = this.getView().byId("tblGMIDRequest");
			tblGmid.setVisible(false);
			var excelHBox = this.getView().byId("excelHBox");
			excelHBox.setVisible(false);
			var rbgGMIDType = this.getView().byId("rbgGMIDType");
			rbgGMIDType.setSelectedIndex(-1);
			var btnSubmit = this.getView().byId("btnSubmit");
			btnSubmit.setVisible(false);
			var btnContinue = this.getView().byId("btnContinueToPlantSelection");
			btnContinue.setVisible(false);
			
        },
    	// Below function is used to prepare an empty object
    	addEmptyObject : function() {
	    	var aData  = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM");
	    	var emptyObject = {createNew: true, isError: false};
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
	        				createNew: false,
		    				isError: false
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
		    this._oSeed = this._oi18nModel.getProperty("seeds");
		    this._oCropProtection = this._oi18nModel.getProperty("cropProtection");
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
		// This function loops through all the rows on the form and checks each input to see if it is filled in
        validateTextFieldValues :function () {
    		
        	var returnValue = true;
        	var data = this._oViewModelData.GMIDShipToCountryVM;
            for(var i = 0; i < data.length - 1; i++) 
            {
            	if(this.checkForEmptyFields(data[i]))
            	{
            		data[i].isError = true;
            		if(data[i].errorSummary !== "")
	                {
	                	data[i].errorSummary += "\n";  
	                }
	            	data[i].errorSummary += "Please enter all mandatory fields highlighted in red.";
	            	returnValue = false;
            	}
            }
            return returnValue;
        },
        // This functions takes one row and check each field to see if it is filled in, if not -> highlight in red
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
            return errorsFound;
        },
        // This functions sets the value state of each control to None. This is to clear red input boxes when errors were found durin submission.
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
		            if((data[i].GMID !== "" &&  data[j].GMID !== "") && (data[i].COUNTRY_CODE_ID !== -1 &&  data[j].COUNTRY_CODE_ID !== -1) && (this.lpadstring(data[i].GMID) === this.lpadstring(data[j].GMID)) && (data[i].COUNTRY_CODE_ID === data[j].COUNTRY_CODE_ID))
		            {
		            	// highlight the GMID & Country input boxes in red
		            	 data[i].isError = true;
		            	 data[i].GMIDErrorState = "Error";
		            	 data[i].countryErrorState = "Error";
		            	 data[j].isError = true;
		            	 data[j].GMIDErrorState = "Error";
		            	 data[j].countryErrorState = "Error";
		            	 
		            	 if(data[i].errorSummary !== "")
	                	 {
	                		data[i].errorSummary += "\n";  
	                	 }
	            		 data[i].errorSummary += "Duplicate GMID/Country Combination found at row # " + (j + 1);
	            		 
	            		 if(data[j].errorSummary !== "")
	                	 {
	                		data[j].errorSummary += "\n";  
	                	 }
	            		 data[j].errorSummary += "Duplicate GMID/Country Combination found at row # " + (i + 1);
	            		 
		            	 returnValue = false;
		            }
	            } 
	        }
	        return returnValue;
        },
        // This function checks whether a crop protection has plants associated with it
        validateGmidShipFromPlant :function()
        {
        	var data = this._oViewModelData.GMIDShipToCountryVM;
             var viewpath = "V_GMID_SHIP_FROM_PLANT";
             // get all the GMID/Plants data for the GMIDS entered in UI
             var gmidPlantRecords = DataContext.getGMIDListFromDB(this._gmidList,viewpath); 
        	 var IsAllgmidHasPlant = true;
        	  // get the GMID status for i18n model
        	 var z1gmid = this._oi18nModel.getProperty("z1gmidstatus");
        	 var zcgmid = this._oi18nModel.getProperty("zcgmidstatus");
        	 var z9gmid = this._oi18nModel.getProperty("z9gmidstatus");
        	
	        for(var i = 0; i < data.length - 1; i++) 
	        {
	        	if(data[i].GMID !== "")
	        	{
	        		var gmidHasPlant = true;
	        		for(var k = 0; k < gmidPlantRecords.length; k++) 
                     {
	                    // loop the GMID Country Status Records to check whether GMID is valid
	                    if ((this.lpadstring(data[i].GMID)=== gmidPlantRecords[k].GMID) && (z1gmid !== gmidPlantRecords[k].MATERIAL_STATUS_FILTER && zcgmid !== gmidPlantRecords[k].MATERIAL_STATUS_FILTER
	                    			&& z9gmid !== gmidPlantRecords[k].MATERIAL_STATUS_FILTER ))
            			{
	                		gmidHasPlant = false;
            			}
			        	else
                		{
                	   		continue;
                		}
	        	  } // end for  for loop gmidPlantRecords
	        	  if (gmidHasPlant === false)
	        	  {
  	               IsAllgmidHasPlant = false;
	        		data[i].isError = true;
	        		data[i].GMIDErrorState = "Error";
	                if(data[i].errorSummary !== "")
	                {
	                	data[i].errorSummary += "\n";  
	                }
	                data[i].errorSummary += "No Valid Ship from Plants are available for the GMID.";
	        	  } // end for validgmidinput if
		        } // end for if(data[i].GMID !== "")
	        } // end for outer for loop
	        // if for each GMID a plant exists, return true, else return false
	        return IsAllgmidHasPlant;
        },
        // validating whether entered GMID have valid status
        validateGMIDbyStatus : function  () {
            var gmiddata = this._oViewModelData.GMIDShipToCountryVM;
             var viewpath = "V_VALIDATE_GMID";
             // below function will get all the GMID Country Records for the GMID's entered in UI
             var gmidCountryRecords = DataContext.getGMIDListFromDB(this._gmidList,viewpath);                           
        	 var oi18nModel = this.getView().getModel("i18n");
        	  // get the GMID status for i18n model
        	 var z1gmid = oi18nModel.getProperty("z1gmidstatus");
        	 var zcgmid = oi18nModel.getProperty("zcgmidstatus");
        	 var z9gmid = oi18nModel.getProperty("z9gmidstatus");
        	 var prdGMID = oi18nModel.getProperty("prdGMID");
        	 var IsAllvalidgmidswithstatus = true;
 
        	for(var i = 0; i < gmiddata.length - 1; i++) 
	        {
	        	if(gmiddata[i].GMID !== "")
	        	{
	        		var validgmidwithstatus = true;
	        		for(var k = 0; k < gmidCountryRecords.length; k++) 
                     {
	                    // loop the GMID Country Status Records to check whether GMID is valid and with valid material status
	                     if ((this.lpadstring(gmiddata[i].GMID) === gmidCountryRecords[k].GMID) && (z1gmid === gmidCountryRecords[k].MATERIAL_STATUS || zcgmid === gmidCountryRecords[k].MATERIAL_STATUS ||
	                    		z9gmid === gmidCountryRecords[k].MATERIAL_STATUS || prdGMID === gmidCountryRecords[k].SOURCE))
            			{
	                		validgmidwithstatus = false;
            			}
		               else
	            	   {
	            	   	 continue;
	            	   }
	        	   }
	        	  if (validgmidwithstatus === false)
	        	  {
		  		        IsAllvalidgmidswithstatus = false;
	            		gmiddata[i].isError = true;
	            		gmiddata[i].GMIDErrorState = "Error";
		                if(gmiddata[i].errorSummary !== "")
		                {
		                	gmiddata[i].errorSummary += "\n";  
		                }
		                gmiddata[i].errorSummary += "GMID has an invalid status or does not exists in PRM system.";  
	        	  } // end for validgmidinput if
	        	} // end for if(data[i].GMID !== "")
	        } // end for outer for loop
	        return IsAllvalidgmidswithstatus;
        },
        // below function will validate whether entered GMID is valid or not
        validateGMID : function()
        {
        	 var gmiddata = this._oViewModelData.GMIDShipToCountryVM;
             var viewpath = "V_VALIDATE_GMID";
             // get all the GMID's with the Status for the GMID's entered in UI
             var gmidRecords = DataContext.getGMIDListFromDB(this._gmidList,viewpath); 
         	 var IsAllvalidgmids = true;
        	for(var i = 0; i < gmiddata.length - 1; i++) 
	        { 
	        	if(gmiddata[i].GMID !== "")
	        	{
	        		var validgmid = false;
	        		for(var k = 0; k < gmidRecords.length; k++) 
                     {
	                    // loop the GMID  Records to check whether GMID is valid
	                     if ((this.lpadstring(gmiddata[i].GMID) === gmidRecords[k].GMID) && (this._oSelectedGMIDType.toUpperCase() === gmidRecords[k].VALUE_CENTER_DESC))
	                    	{
	                    		validgmid =  true;
			               }
			                else
	                	   {
	                	   		continue;
	                	   }
	        		}
	        	  if (validgmid === false)
		        	  {
	    	  		        IsAllvalidgmids = false;
	                		gmiddata[i].isError = true;
	                		gmiddata[i].GMIDErrorState = "Error";
			                if(gmiddata[i].errorSummary !== "")
			                {
			                	gmiddata[i].errorSummary += "\n";  
			                }
			                gmiddata[i].errorSummary += "Invalid GMID - GMID does not exist.";  
		        	  } // end for validgmidinput if
	        	  } // end for gmiddata[i].GMID !==
	        } // end for outre for loop
	        return IsAllvalidgmids;
        },
         // below function will left pad GMID with leading zeroes if length is less than 8
        lpadstring : function(gmid) {
    			while (gmid.length < 8)
        		gmid = "0" + gmid;
    		return gmid;
        },
        // below function will return the list of GMIDS from the UI
        gmidList : function(){
        	var gmiddata = this._oViewModelData.GMIDShipToCountryVM;
        	var gmid; 
        	 // prepare an array of GMIDs from the UI
            var gmidList = [];
            for(var j = 0; j < gmiddata.length - 1; j++) 
            {
	            // every time empty the GMID object
	             gmid= {"GMID": "" };
	             gmid.GMID = gmiddata[j].GMID;
	             gmidList.push(gmid);
            }
            return gmidList;
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
            	data[i].isError = false;
            	data[i].errorSummary = "";
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
		    // show GMID and Country inside Error Message
		    var GMID = oEvent.getSource().data("GMID");
		    var CountryCode = parseInt(oEvent.getSource().data("CountryCode"),10);
		    var countryList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Country");
		    // if no country is selected then update countrylabel to empty
		    var countryLabel;
		    if (CountryCode=== -1)
		    {
		    	countryLabel ="";
		    }
		    else
		    {
		    	countryLabel = countryList.find(function(data){return data.ID === CountryCode; }).LABEL;
		    }
			var GMIDCountry = "GMID : " + GMID + "\n" + "Country : " + countryLabel + "\n" + "\n";
		         MessageBox.alert(GMIDCountry + text, {
			     icon : MessageBox.Icon.ERROR,
			title : "Invalid Input"
			       });
        },
    	// Function to save the data into the database
    	onSubmit : function () {
    		var errorCount = 0;
    		var successCount = 0;
    		var GMIDShipToCountry = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM");
		
			
    		// if there are no GMIDs show a validation message
    		if (GMIDShipToCountry.length === 1)
    		{
				MessageBox.alert("Please enter at least one GMID.", {
	    			icon : MessageBox.Icon.ERROR,
					title : "Invalid Input"
	       		});
    			return;
    		}
    		
    		// reset the error message property to false before doing any validation
			this.resetValidationForModel();
			// reset error on page to false
			this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",false);
			// remove the file from the uploader
			var fileUploader = this.getView().byId("excelFileUploader");
			fileUploader.clear();
			
			//open busy dialog
			this._busyDialog.open();
			// need to declare local this variable to call global functions in the timeout function
			
			// prepare an array of GMIDs from the UI
            this._gmidList = this.gmidList();
			var t = this;
			
			// setting timeout function in order to show the busy dialog before doing all the validation
			setTimeout(function()
			{
				
				if (t.validateTextFieldValues() === false)
		        {
		        	// Set error message column to false (not visible by default)
			    	t._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
		        }
				// check of invalid GMID entry by checking the status of GMID
	        	if (t.validateGMIDbyStatus() === false)
	        	{
	        		t._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
	        	}
		        // if crop protection is selected and the GMID/plant combination does not exist, return error
		        if(t._oSelectedGMIDType === t._oCropProtection && t.validateGmidShipFromPlant() === false)
	        	{
	        		t._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
	        	}
		        // check for duplicate GMID/Country Combination
		        if(t.validateUniqueGmidCountry() === true)
	        	{
	        		t._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
	        	}
	        	// check for duplicate entries on the page
	        	if (t.validateDuplicateEntries() === false)
	        	{
	        		t._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
	        	}
	        	// check if GMID entered is valid
	        	if (t.validateGMID() === false)
	        	{
	        		t._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
	        	}
		        if(!t._oGMIDShipToCountryViewModel.getProperty("/ErrorOnPage"))
		        {
		        	// based on which template is selected, store the GMID in the appropriate table
		        	var tablePath = "";
		    	    if(t._oSelectedGMIDType === t._oCropProtection)
		    	    {
		    	    	tablePath = "/GMID_SHIP_TO_COUNTRY_STG";
		    	    	DataContext.deleteStagingData(loggedInUserID);
		    	    	
		    	    	// delete the records from staging table

		    	    }
		    	    else
		    	    {
		    	    	tablePath = "/GMID_SHIP_TO_COUNTRY";
		    	    }
		    	    
		    		// Create current timestamp
		    		var oDate = new Date();
		    		// Get the MaxID
		    	    var maxID =	DataContext.getMaxID(tablePath);
		    	    // Get the code id for GMID Country Status
		    	    var gmidcountrystatusID = DataContext.getGMIDCountryStatusID();
		    	    
		    		// loop through the rows and for each row insert data into database
		    		// each row contains GMID Ship To combination.
		    		for(var i = 0; i < GMIDShipToCountry.length - 1; i++) 
		    		{
						var GMID = t.lpadstring(GMIDShipToCountry[i].GMID);
						var countryID = parseInt(GMIDShipToCountry[i].COUNTRY_CODE_ID,10);
						var storedcurrencyID = parseInt(GMIDShipToCountry[i].CURRENCY_CODE_ID,10);
						var ibprelevancyID = parseInt(GMIDShipToCountry[i].IBP_RELEVANCY_CODE_ID,10);
						var nettingdefaultID = parseInt(GMIDShipToCountry[i].NETTING_DEFAULT_CODE_ID,10);
						var quadrantID = parseInt(GMIDShipToCountry[i].QUADRANT_CODE_ID,10);
						var channelID = parseInt(GMIDShipToCountry[i].CHANNEL_CODE_ID,10);
						var marketdefaultID = parseInt(GMIDShipToCountry[i].MARKET_DEFAULT_CODE_ID,10);
						var supplySystemFlag = parseInt(GMIDShipToCountry[i].SUPPLY_SYSTEM_FLAG_CODE_ID,10);
						var createdBy = loggedInUserID;
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
				        	TYPE: t._oSelectedGMIDType.toUpperCase(),
				        	GMID_COUNTRY_STATUS_CODE_ID: gmidcountrystatusID,
				        	CREATED_ON: oDate,
				        	CREATED_BY:createdBy
		    			};
		    			
		        		t._oDataModel.create(tablePath, newGMID,
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
	        			if(t._oSelectedGMIDType === t._oSeed)
	        			{
	        				var oRouter = t.getRouter();
	        				// once insertion is success, navigate to homepage
	        				MessageBox.alert("You have successfully submitted " + successCount + " GMID(s)",
								{
									icon : MessageBox.Icon.SUCCESS,
									title : "Success",
									onClose: function() {
					        			oRouter.navTo("home");
					        	}
							});
	        			}
	        			else
	        			{
	        				// navigate to plant selection
	                    	t.getOwnerComponent().getRouter().navTo("gmidPlantSelection");
	    				}
		    		}
		    		else 
		    		{
		        			MessageToast.show("Error: All GMID's are not submitted successfully. Please contact System Admin.");
		    		}
	    		
	        	}
	        	
	        	// close busy dialog
				t._busyDialog.close();
			},500); // end of timeout function
        },
        // method to check for duplicate Gmid and Country combination
        validateUniqueGmidCountry : function (){
            // loop through the rows and for each row check for duplicate entry in DB
            // each row contains GMID Ship To combination.
            var data = this._oViewModelData.GMIDShipToCountryVM;
	        // need to pass the above array to the DB to get the duplicate records
	        var viewpath = "V_VALIDATE_GMID_COUNTRY";
            var gmidCountryRecords = DataContext.getGMIDListFromDB(this._gmidList,viewpath);                           
            var isDuplicate = false;
            for(var i = 0; i < data.length - 1; i++) 
            {
                var GMID = this.lpadstring(data[i].GMID);
                var countryID = parseInt(data[i].COUNTRY_CODE_ID,10);
                // loop the GMID Country Records from DB to check Unique
                for(var k = 0; k < gmidCountryRecords.length; k++) 
                {
                    // check if GMID and Country Combinations exists in DB
		            if (GMID === gmidCountryRecords[k].GMID && countryID === gmidCountryRecords[k].COUNTRY_CODE_ID)
		            {
		                isDuplicate = true;
		                data[i].isError = true;
		                data[i].GMIDErrorState = "Error";
		                data[i].countryErrorState = "Error";
		                if(data[i].errorSummary !== "")
		                {
		        			data[i].errorSummary += "\n";  
		                }
		            	data[i].errorSummary += "GMID/Country Combination already exists in the system.";
		            }
		            else
		            {
		                continue;
		            }
                }
            }
            this._oGMIDShipToCountryViewModel.refresh();
            
            return isDuplicate;
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
				
				// open busy dialog
				t._busyDialog.open();
				
				// need to have timeout since otherwise the busy dialog does not show during importing
				setTimeout(function()
				{
					var strCSV = event.target.result;
				   
					var headerRow = ["GMID", "COUNTRY_CODE_ID", "CURRENCY_CODE_ID","IBP_RELEVANCY_CODE_ID",
					"NETTING_DEFAULT_CODE_ID","QUADRANT_CODE_ID","CHANNEL_CODE_ID","MARKET_DEFAULT_CODE_ID"];
	
			        var allTextLines = strCSV.split(/\r\n|\n/);
			        var excelColumnHeaders = allTextLines[0].split(",");
			        var validHeadersFlag = true;
			        
			        if (excelColumnHeaders.length !== parseInt(t._oi18nModel.getProperty("numOfHeaderColumns"),10))
	            	{
	            		MessageToast.show("Incorrect number of columns on template.");	
	            		validHeadersFlag = false;
	            	}
	            	else
	            	{
	            		for(var i = 0; i < excelColumnHeaders.length; i++) 
	            		{
	            			// Get proper column headers from the i18n model
			                var oGMID = t._oi18nModel.getProperty("eGMID");
			                var oCountry  = t._oi18nModel.getProperty("eCountry");
			                var oStoredCurrency =t._oi18nModel.getProperty("eStoredCurrency"); 
			                var oIbpRelevancy  = t._oi18nModel.getProperty("eIBPRelevancy");
			                var oNettingDefault = t._oi18nModel.getProperty("eNettingDefault");
			                var oQuadrant = t._oi18nModel.getProperty("eQuadrant");
			                var oChannel = t._oi18nModel.getProperty("eChannel");
			                var oMarketDefault = t._oi18nModel.getProperty("eMarketDefault");
			                
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
				        		"createNew" : false,
				        		"isError":false
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
			            // close busy dialog
						t._busyDialog.close();
			            // refresh the view model
			            t._oGMIDShipToCountryViewModel.refresh();
				            
				    }  // end valid headers flag check
				    else
				    {
				    	 // close busy dialog
						t._busyDialog.close();
				    }

				}, 500);
				
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
        	   	row[3] = this._defaultIBPRelevancy;
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
		}
  	});

});