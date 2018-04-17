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
     var checkedNoPlant = false;
     var isAdmin = false;
	return Controller.extend("bam.controller.GMIDSubmission", {
		onInit : function () {
			
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();
			// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			var gmidSubmission = this._oi18nModel.getProperty("Module.gmidSubmission");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var j = 0; j < permissions.length; j++)
			{
				if(permissions[j].ATTRIBUTE === gmidSubmission)
				{
					hasAccess = true;
					break;
				}
			}
			
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "gmidSubmission"
				});	
			}
			else
			{
	
			// defualt set change varaible to false
            this._isChanged =  false;
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
        		"CONSENSUS_DEFAULT_CODE_ID": -1,
        		"consensusDefaultErrorState": "None",
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
	    	
	    	  // Set error message column to false (not visible by default)
		    this._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",false);
		    
		    // set the busy indicator
			// creating busy dialog lazily
    		if (!this._busyDialog) 
			{
				this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
				this.getView().addDependent(this._dialog);
			}
			

			// set all the dropdowns, get the data from the code master table
	    	oModel.setProperty("/GMIDShipToCountryVM/StoredCurrency",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddStoredCurrency")));
	    	oModel.setProperty("/GMIDShipToCountryVM/IBPRelevancyFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddIBPRelevancyFlag")));
	    	oModel.setProperty("/GMIDShipToCountryVM/NettingDefaultFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddNettingDefaultFlag")));
	    	oModel.setProperty("/GMIDShipToCountryVM/Quadrant",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddQuadrant")));
	    	oModel.setProperty("/GMIDShipToCountryVM/Channel",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddChannel")));
	    	oModel.setProperty("/GMIDShipToCountryVM/ConsensusDefaultFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddConsensusDefault")));
	    	oModel.setProperty("/GMIDShipToCountryVM/SupplySystemFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddSupplySystemFlag")));
	    	oModel.setProperty("/GMIDShipToCountryVM/MarketDefaultFlag",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddMarketDefault")));

	    	// attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
	    	// do not attach again if this is not the first time loading the page, if we attach it again performance is affected
	    	if(firstTimePageLoad)
	    	{
	    		this.checkIfAdmin();
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
	    	
	    		// load country dropdown
	    	// For Admin show all Countries
	    	// for Non Admin show only valid countries
	    	if(isAdmin){
	    		oModel.setProperty("/GMIDShipToCountryVM/Country",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddCountry")));
	    	}
	    	else
	    	{
	    		oModel.setProperty("/GMIDShipToCountryVM/Country",DataContext.getNonAdminDropdownValues(this._oi18nModel.getProperty("ddCountry")));
	    	}
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
		checkIfAdmin :function(){
        	
    		var gmidSubmission = this._oi18nModel.getProperty("Module.gmidSubmission");
			// break since the user may have more than one role, as long as one of the user roles has permission to edit we can show the button
    		var adminRole = this._oi18nModel.getProperty("Module.adminRole");
	    	
	    	// getting permissions for the current logged in user
			var permissions = DataContext.getUserPermissions();
			// check to see if the permission list includes "ADMIN" role for the GMID SUBMISSION Module
			// ATTRIBUTE in this case means MODULE
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === gmidSubmission && permissions[i].ROLE === adminRole)
				{
					isAdmin = true;
					// break since the user may have more than one role, as long as one of the user roles has permission we can show the checkbox
					break;
				}
			}
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
			
			//admin checkbox reset
			var chkNoPlant = this.getView().byId("chkNoPlant");
    		chkNoPlant.setVisible(false);
    		chkNoPlant.setSelected(false);
    		checkedNoPlant = false;
			
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
	        				CONSENSUS_DEFAULT_CODE_ID:this._defaultConsensusFlag,
	        				consensusDefaultErrorState: "None",
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
			this._isChanged = true;
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
	    	this._oSeed = this._oi18nModel.getProperty("seeds");
	    	this._oCropProtectionDASType  = this._oi18nModel.getProperty("cropProtectionDASType");
	    	this._oCropProtectionDCPType  = this._oi18nModel.getProperty("cropProtectionDCPType");
		    this._oCropProtection = this._oi18nModel.getProperty("cropProtection");
		    this._oCropProtectionDuPont = this._oi18nModel.getProperty("cropProtectionDuPont");
		    this._oSeedValueCenterCode = this._oi18nModel.getProperty("seedsValueCenterCode");
		    this._oSeedValueCenterCodePioneer = this._oi18nModel.getProperty("seedsValueCenterCodePioneer");
		    this._oCropProtectionValueCenterCode = this._oi18nModel.getProperty("cropProtectionValueCenterCode");
		    this._oCropProtectionDuPontValueCenterCode = this._oi18nModel.getProperty("cropProtectionDuPontValueCenterCode");
		    this._oSelectedValueCenterCode = [];
	    	// set the value center code for the selected type
	    	if(this._oSelectedGMIDType === this._oSeed)
	    	{
	    		this._oSelectedValueCenterCode.push(this._oSeedValueCenterCode);
	    		this._oSelectedValueCenterCode.push(this._oSeedValueCenterCodePioneer);
	    	}
	    	else if (this._oSelectedGMIDType === this._oCropProtection)
	    	{
	    		this._oSelectedValueCenterCode.push(this._oCropProtectionValueCenterCode);
	    	}
	    	else if (this._oSelectedGMIDType === this._oCropProtectionDuPont)
	    	{
         		this._oSelectedValueCenterCode.push(this._oCropProtectionDuPontValueCenterCode);
	    	}

	    	// get the crop protection and seeds value from i18n file

		    var tblGmid = this.getView().byId("tblGMIDRequest");
			var btnSubmit = this.getView().byId("btnSubmit");
			var btnContinue = this.getView().byId("btnContinueToPlantSelection");
			var chkNoPlant = this.getView().byId("chkNoPlant");
			
			if(this._oSelectedGMIDType === this._oSeed){
     			tblGmid.setVisible(true);
     			btnSubmit.setVisible(true);
     			btnContinue.setVisible(false);
     			
     			chkNoPlant.setVisible(false);
     			chkNoPlant.setSelected(false);
     			checkedNoPlant = false;
			}
			//if(this._oSelectedGMIDType === this._o)
    		else if (this._oSelectedGMIDType === this._oCropProtection)
    		{
    			if(isAdmin){
    				chkNoPlant.setVisible(true);
    			}
    			tblGmid.setVisible(true);
    			btnSubmit.setVisible(false);
    			btnContinue.setVisible(true);
    		}
    		else if (this._oSelectedGMIDType === this._oCropProtectionDuPont)
    		{
    			chkNoPlant.setVisible(false);
    			tblGmid.setVisible(true);
    			btnSubmit.setVisible(true);
    			btnContinue.setVisible(false);
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
		onCheck :function(){
			var btnSubmit = this.getView().byId("btnSubmit");
			var btnContinue = this.getView().byId("btnContinueToPlantSelection");
			var chkNoPlant = this.getView().byId("chkNoPlant");
			
			if(chkNoPlant.getSelected()){
				checkedNoPlant = true;
				btnSubmit.setVisible(true);
 				btnContinue.setVisible(false);
			}
			else
			{
				checkedNoPlant = false;
				btnSubmit.setVisible(false);
 				btnContinue.setVisible(true);
			}
			
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
        	var strValidate = this._oi18nModel.getProperty("validation");
			if (this.checkEmptyRows(row,strValidate) === false)
			{
				return errorsFound;
			}
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
            if(parseInt(row.CONSENSUS_DEFAULT_CODE_ID,10) === -1)
            {
            	row.consensusDefaultErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.CURRENCY_CODE_ID,10) === -1)
            {
            	row.currencyErrorState = "Error";
            	errorsFound = true;
            }
            return errorsFound;
        },
        checkEmptyRows : function(row,strtype){
        var errorsFound = false;
        var data = this._oViewModelData.GMIDShipToCountryVM;
        // below check needs to be performed if we have more than one row, if only one row in grid no need to check
        	// dont validate the fields if nothing is changed for the row, i.e. user does not wnat to enter any data
        	if ((data.length >= 2) && (this._isChanged === true)){
	        	if(this._oSelectedGMIDType === this._oCropProtection){
	        			if ((row.GMID === "") && (parseInt(row.COUNTRY_CODE_ID,10) === -1) && (parseInt(row.CURRENCY_CODE_ID,10) === -1)&& (parseInt(row.IBP_RELEVANCY_CODE_ID,10) === this._defaultIBPRelevancy)
	        		    &&	(parseInt(row.NETTING_DEFAULT_CODE_ID,10) === -1) && (parseInt(row.QUADRANT_CODE_ID,10) === -1) 
	        		    && (parseInt(row.CHANNEL_CODE_ID,10) === -1) && (parseInt(row.CONSENSUS_DEFAULT_CODE_ID,10) === this._defaultConsensusFlag))
	        		    {
	        		    	errorsFound = false;
	        		    	return errorsFound;
	        		    }
	        		    else
	        		    {
	        		    	if (strtype === "Submission")
	        		    	return true;
	        		    }
	        	}
	        	else
	        	{
	        			if ((row.GMID === "") && (parseInt(row.COUNTRY_CODE_ID,10) === -1) && (parseInt(row.CURRENCY_CODE_ID,10) === -1) && (parseInt(row.IBP_RELEVANCY_CODE_ID,10) === this._defaultIBPRelevancy)
	        		    &&	(parseInt(row.NETTING_DEFAULT_CODE_ID,10) === -1) && (parseInt(row.QUADRANT_CODE_ID,10) === this._defaultQuadrantForSeed)	&& (parseInt(row.CHANNEL_CODE_ID,10) === this._defaultChannelForSeed)
	        		    && (parseInt(row.CONSENSUS_DEFAULT_CODE_ID,10) === this._defaultConsensusFlag))
	        		     {
	        		    	errorsFound = false;
	        		    	return errorsFound;
	        		     }
	        		    else
	        		    {
	        		    	if (strtype === "Submission")
	        		    	return true;
	        		    }
	        	}
        	}
        },
        // This functions sets the value state of each control to None. This is to clear red input boxes when errors were found durin submission.
    	onChange: function(oEvent){
    		// update ischanged to true for any attribute changed
    		this._isChanged = true;
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
             var gmidPlantRecords = DataContext.getGMIDListFromDBByGMIDPad(this._gmidList,viewpath); 
        	 var IsAllgmidHasPlant = true;
        	 var existPlant = false;
        	 var returnArr = [];
        	  // get the GMID status for i18n model
        	 var z1gmid = this._oi18nModel.getProperty("z1gmidstatus");
        	 var zcgmid = this._oi18nModel.getProperty("zcgmidstatus");
        	 var z9gmid = this._oi18nModel.getProperty("z9gmidstatus");
        	
	        for(var i = 0; i < data.length - 1; i++) 
	        {
	        	if(data[i].GMID !== "")
	        	{
	        		var gmidHasPlant = false;
	        		for(var k = 0; k < gmidPlantRecords.length; k++) 
                     {
	                    // loop the GMID Country Status Records to check whether GMID is valid
	                    if ((this.lpadstring(data[i].GMID)=== gmidPlantRecords[k].GMID) && (z1gmid !== gmidPlantRecords[k].MATERIAL_STATUS_FILTER && zcgmid !== gmidPlantRecords[k].MATERIAL_STATUS_FILTER
	                    			&& z9gmid !== gmidPlantRecords[k].MATERIAL_STATUS_FILTER ))
            			{
	                		gmidHasPlant = true;
            			}
			        	else
                		{
                	   		continue;
                		}
	        	  } // end for  for loop gmidPlantRecords
	        	  if (gmidHasPlant === false && this._oSelectedGMIDType !== this._oCropProtectionDuPont)
	        	  {
  	            	IsAllgmidHasPlant = false;
	        		data[i].isError = true;
	        		data[i].GMIDErrorState = "Error";
	                if(data[i].errorSummary !== "")
	                {
	                	data[i].errorSummary += "\n";  
	                }
	                data[i].errorSummary += "No Valid Ship from Plants are available for the GMID.";
	        	  } 
	        	  else
	        	  {
	        			existPlant = true;
	        	  } // end for validgmidinput if
		        } // end for if(data[i].GMID !== "")
	        } // end for outer for loop
	        // if for each GMID a plant exists, return true, else return false
	        returnArr.push(IsAllgmidHasPlant);
	        returnArr.push(existPlant);
	        //return IsAllgmidHasPlant;
	        return returnArr;
        },
        // validating whether entered GMID have valid status
        validateGMIDbyStatus : function  () {
            var gmiddata = this._oViewModelData.GMIDShipToCountryVM;
             var viewpath = "V_VALIDATE_GMID";
             // below function will get all the GMID Country Records for the GMID's entered in UI
             var gmidCountryRecords = DataContext.getGMIDListFromDBByGMIDPad(this._gmidList,viewpath);                           
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
		                gmiddata[i].errorSummary += "GMID has an invalid status or does not exist in PRM system.";  
	        	  } // end for validgmidinput if
	        	} // end for if(data[i].GMID !== "")
	        } // end for outer for loop
	        return IsAllvalidgmidswithstatus;
        },
        // below function will validate whether entered GMID is valid or not
        validateGMID : function(gmiddataobject)
        {
        	 //var gmiddata = this._oViewModelData.GMIDShipToCountryVM;
        	 var gmiddata = gmiddataobject;
             var viewpath = "V_VALIDATE_GMID";
             // get all the GMID's with the Status for the GMID's entered in UI
             var gmidRecords = DataContext.getGMIDListFromDBByGMIDPad(this._gmidList,viewpath); 
         	 var IsAllvalidgmids = true;
         	 //var dasSource = this._oi18nModel.getProperty("dasSource");
         	 //var dcpSource = this._oi18nModel.getProperty("dcpSource");
        	for(var i = 0; i < gmiddata.length - 1; i++) 
	        { 
	        	if(gmiddata[i].GMID !== "")
	        	{
	        		var validgmid = false;
	        		for(var k = 0; k < gmidRecords.length; k++) 
                     {
	                     // loop the GMID  Records to check whether GMID is valid
	                     if ((this.lpadstring(gmiddata[i].GMID) === this.lpadstring(gmidRecords[k].GMID)))
	                     {
	                    	for(var g = 0; g < this._oSelectedValueCenterCode.length; g++){
	                    		if(this.lpadstring(this._oSelectedValueCenterCode[g]) === this.lpadstring(gmidRecords[k].VALUE_CENTER_CODE)){
	                    			validgmid =  true;
	                    			//set the used value to the database value
	                    			gmiddata[i].GMID = gmidRecords[k].GMID;
	                    			break;
	                    		}
	                    	}
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
			                gmiddata[i].errorSummary += "The GMID does not belong to " + this._oSelectedGMIDType.toUpperCase();  
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
	             gmid.GMID = this.lpadstring(gmiddata[j].GMID);
	             gmidList.push(gmid);
            }
            return gmidList;
        },
        // function to check if the field is numeric
        numValidationCheck : function (oEvent) {
        	// update ischanged to true for any GMID attribute changed
    		this._isChanged = true;
        	oEvent.getSource().setValueStateText("");
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
        	var sNumber = "";
			var value = oEvent.getSource().getValue();
            //var bNotnumber = isNaN(value);
            var bNotSpecial = new RegExp(/[~`!@#$%\^&*+=()_\-\[\]\\';.,/{}|\\":<>\?]/);
            if(bNotSpecial.test(value))
            {
            	oEvent.getSource().setValue(sNumber);
            }   
            else 
            {
            	sNumber = value;
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
            	data[i].consensusDefaultErrorState = "None";
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
        // below function will check if anything is changed  or modified in submission page
        chkIsModified: function() {
        	var GMIDShipToCountry = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM");
        	var isModified = false;
            	// loop through the rows and for each row check if is anything is modified or changed
		    		for(var i = 0; i < GMIDShipToCountry.length - 1; i++) 
		    		{   
		    			// handle the scenario when nothing is changed on the submission page
	        				if(this._oSelectedGMIDType === this._oSeed || this._oSelectedGMIDType === this._oCropProtectionDuPont){
			        			if ((GMIDShipToCountry[i].GMID !== "") || (parseInt(GMIDShipToCountry[i].COUNTRY_CODE_ID,10) !== -1) || (parseInt(GMIDShipToCountry[i].CURRENCY_CODE_ID,10) !== -1) || (parseInt(GMIDShipToCountry[i].IBP_RELEVANCY_CODE_ID,10) !== this._defaultIBPRelevancy)
			        		    ||	(parseInt(GMIDShipToCountry[i].NETTING_DEFAULT_CODE_ID,10) !== -1)|| (parseInt(GMIDShipToCountry[i].QUADRANT_CODE_ID,10) !== this._defaultQuadrantForSeed) 
			        		    || (parseInt(GMIDShipToCountry[i].CHANNEL_CODE_ID,10) !== this._defaultChannelForSeed) || (parseInt(GMIDShipToCountry[i].CONSENSUS_DEFAULT_CODE_ID,10) !== this._defaultConsensusFlag))
			        		    {
			        		    	isModified = true;
			        		    	break;
			        		    }
				        	}
				        	else
				        	{
			        			if ((GMIDShipToCountry[i].GMID !== "") || (parseInt(GMIDShipToCountry[i].COUNTRY_CODE_ID,10) !== -1) || (parseInt(GMIDShipToCountry[i].CURRENCY_CODE_ID,10) !== -1) || (parseInt(GMIDShipToCountry[i].IBP_RELEVANCY_CODE_ID,10) !== this._defaultIBPRelevancy)
			        		    ||	(parseInt(GMIDShipToCountry[i].NETTING_DEFAULT_CODE_ID,10) !== -1) || (parseInt(GMIDShipToCountry[i].QUADRANT_CODE_ID,10) !== -1)	|| (parseInt(GMIDShipToCountry[i].CHANNEL_CODE_ID,10) !== -1)
			        		    || (parseInt(GMIDShipToCountry[i].CONSENSUS_DEFAULT_CODE_ID,10) !== this._defaultConsensusFlag))
			        		     {
			        		    	isModified = true;
			        		    	break;
			        		     }
	        				}
		    			}
		    		return isModified;
        },
    	// Function to save the data into the database
    	onSubmit : function () {
    		var errorCount = 0;
    		var successCount = 0;
    		var GMIDShipToCountry = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM");
    		  // current limit for saving is 200 records
			  // check if GMID Submission Grid  has more than 200 records
			  // if more than 200 than show a validation message to user
			 var maxLimitSubmit = parseInt(this._oi18nModel.getProperty("MaxLimit"),10) ;
			 var maxLimitSubmitText = this._oi18nModel.getProperty("MaxLimitSubmit.text");
			 // adding one to account for the extra line at the bottom
		 	if (GMIDShipToCountry.length - 1 > (maxLimitSubmit))
		        {
		        	MessageBox.alert(maxLimitSubmitText,
		        	{
		        		icon : MessageBox.Icon.ERROR,
						title : "Error"
		        	});
		        	return;
		        }
			
			// reset the error message property to false before doing any validation
			this.resetValidationForModel();
			
    		// if there are no GMIDs show a validation message
    		// also if nothing is changed in page
    		if (GMIDShipToCountry.length === 1 || this.chkIsModified() === false)
    		{
				MessageBox.alert("Please enter at least one GMID.", {
	    			icon : MessageBox.Icon.ERROR,
					title : "Invalid Input"
	       		});
    			return;
    		}
    		
    		
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
			
			//permission to submit gmid without plants
			//var hasPermission = false;
			
			//CP plant validation
			//var plantValidationArr = t.validateGmidShipFromPlant();
			//var allHasPlants = plantValidationArr[0];
			//var existPlant = plantValidationArr[1];
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
		        //if admin and not checked or not admin
		        if(checkedNoPlant === false){
			        if(t._oSelectedGMIDType === t._oCropProtection && t.validateGmidShipFromPlant()[0] === false)
		        	{
		        		t._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
		        	}
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
	        	if (t.validateGMID(GMIDShipToCountry) === false)
	        	{
	        		t._oGMIDShipToCountryViewModel.setProperty("/ErrorOnPage",true);
	        	}
		        if(!t._oGMIDShipToCountryViewModel.getProperty("/ErrorOnPage"))
		        {
		        	// based on which template is selected, store the GMID in the appropriate table
		        	var tablePath = "";
		        	var submitType = "";
		    	    if(t._oSelectedGMIDType === t._oCropProtection)
		    	    { // For DAS Crop Protection GMIDS
		    	    	if(checkedNoPlant){
		    	    		submitType = "NON APO CROP PROTECTION";
		    	    		tablePath = "/GMID_SHIP_TO_COUNTRY";
		    	    	}
		    	    	else{
		    	    		submitType = t._oCropProtectionDASType; 
			    	    	tablePath = "/GMID_SHIP_TO_COUNTRY_STG";
			    	    	DataContext.deleteStagingData(loggedInUserID);
		    	    	}
		    	    	// delete the records from staging table

		    	    } // for Dupont Crop Protection GMIDS
	    	    	else if(t._oSelectedGMIDType === t._oCropProtectionDuPont)
	    	    	{
	    	    		submitType = t._oCropProtectionDCPType;
	    	    		tablePath = "/GMID_SHIP_TO_COUNTRY";
	    	    	}
		    	    else
		    	    { // For Seeds GMIDs
		    	    	submitType = t._oSelectedGMIDType.toUpperCase();
		    	    	tablePath = "/GMID_SHIP_TO_COUNTRY";
		    	    }
		    	    
		    		// Create current timestamp
		    		var oDate = new Date();
		    		// Get the MaxID
		    	    var maxID =	DataContext.getMaxID(tablePath);
		    	    // Get the code id for GMID Country Status
		    	    var gmidcountrystatusID = DataContext.getGMIDCountryStatusID();
		    	    var strSubmission = t._oi18nModel.getProperty("submission");
		    	    var mktFlagList = t._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/MarketDefaultFlag");
		    	    // prepare default values for market default for saving to database
		    	    var defaultmarketflagcodeID;
		    	      if(t._oSelectedGMIDType === t._oSeed)
		    	      {
		    	      	defaultmarketflagcodeID = mktFlagList.find(function(data){return data.CODE_KEY === "4"; }).ID;
		    	      }
		    	      else
		    	      {
		    	      	// for all others  i.e. DCP/DAS this is 0
							defaultmarketflagcodeID = mktFlagList.find(function(data){return data.CODE_KEY === "0"; }).ID;
		    	      }
		    	    
		    		// loop through the rows and for each row insert data into database
		    		// each row contains GMID Ship To combination.
		    		for(var i = 0; i < GMIDShipToCountry.length - 1; i++) 
		    		{   
		    			// while saving we need to ignore the records which are not modified or altered
		    			// save only those records which are entered or updated
		    			if(t.checkEmptyRows(GMIDShipToCountry[i],strSubmission) === true)
		    			{
							var GMID = GMIDShipToCountry[i].GMID;
							var countryID = parseInt(GMIDShipToCountry[i].COUNTRY_CODE_ID,10);
							var storedcurrencyID = parseInt(GMIDShipToCountry[i].CURRENCY_CODE_ID,10);
							var ibprelevancyID = parseInt(GMIDShipToCountry[i].IBP_RELEVANCY_CODE_ID,10);
							var nettingdefaultID = parseInt(GMIDShipToCountry[i].NETTING_DEFAULT_CODE_ID,10);
							var quadrantID = parseInt(GMIDShipToCountry[i].QUADRANT_CODE_ID,10);
							var channelID = parseInt(GMIDShipToCountry[i].CHANNEL_CODE_ID,10);
							var marketdefaultID = parseInt(defaultmarketflagcodeID,10);
							var supplySystemFlag = parseInt(GMIDShipToCountry[i].SUPPLY_SYSTEM_FLAG_CODE_ID,10);
							var consensusdefaultID = parseInt(GMIDShipToCountry[i].CONSENSUS_DEFAULT_CODE_ID,10);
							var createdBy = loggedInUserID;
							// create new GMIDShipToCountry object
							var newGMID = {
					        	ID: 1 ,
					        	GMID: GMID,
					        	COUNTRY_CODE_ID: countryID,
					        	CURRENCY_CODE_ID: storedcurrencyID,
					        	IBP_RELEVANCY_CODE_ID: ibprelevancyID,
					        	NETTING_DEFAULT_CODE_ID: nettingdefaultID,
					        	QUADRANT_CODE_ID:quadrantID,
					        	CHANNEL_CODE_ID: channelID,
					        	MARKET_DEFAULT_CODE_ID: marketdefaultID,
					        	SUPPLY_SYSTEM_FLAG_CODE_ID: supplySystemFlag,
					        	TYPE: submitType,
					        	GMID_COUNTRY_STATUS_CODE_ID: gmidcountrystatusID,
					        	CREATED_ON: oDate,
					        	CREATED_BY:createdBy,
					        	CONSENSUS_DEFAULT_CODE_ID : consensusdefaultID
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
		        	}
		        	//if there is something inserted into the table trigger the CU Rule SP
		        	if( tablePath === "/GMID_SHIP_TO_COUNTRY"  && successCount > 0){
		        		var userObj = {
		        				CALC_STG_ID: 1,
		        				GMID: "1",
		        				COUNTRY_CODE_ID: 1,
		        				CREATED_ON: oDate,
					        	CREATED_BY: loggedInUserID
		        		};
		        		t._oDataModel.create("/GMID_COUNTRY_RULE_CALC_STG", userObj,
			        		{
					        	success: function(){
					    		},
					    		error: function(){
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
	        			else if(t._oSelectedGMIDType === t._oCropProtectionDuPont)
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
	        			else if(checkedNoPlant)
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
	        			MessageBox.alert("Error: All GMID's are not submitted successfully. Please contact System Admin.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
						});
		    		}
	    		
	        	}else{
	        		MessageBox.alert("Error: There is an entry error on the page. Please correct.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
						});
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
            var gmidCountryRecords = DataContext.getGMIDListFromDBByGMIDPad(this._gmidList,viewpath);                           
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
	    	var mktFlagList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/ConsensusDefaultFlag");
			this._defaultConsensusFlag = mktFlagList.find(function(data){return data.CODE_KEY === "3"; }).ID; 
			
			// get default value's code ids for seed and crop protection for Supply System flag and set to global variable
	    	var supplySystemFlag = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/SupplySystemFlag");
			this._defaultSupplySystemFlagForSeed = supplySystemFlag.find(function(data){return data.CODE_KEY === "RR"; }).ID; 
			this._defaultSupplySystemFlagForCP = supplySystemFlag.find(function(data){return data.CODE_KEY === "APO"; }).ID; 
        },
        // set the default property values for the passed object
        setDefaultPropertyValues : function(selectedGMIDType, obj){
        	obj.IBP_RELEVANCY_CODE_ID = this._defaultIBPRelevancy;
        	obj.CONSENSUS_DEFAULT_CODE_ID = this._defaultConsensusFlag;
        	if(this._oSelectedGMIDType === this._oSeed){
				obj.QUADRANT_CODE_ID = this._defaultQuadrantForSeed;
				obj.CHANNEL_CODE_ID = this._defaultChannelForSeed;
				obj.SUPPLY_SYSTEM_FLAG_CODE_ID = this._defaultSupplySystemFlagForSeed;
        	}
        	else{
        		if (this._oSelectedGMIDType === this._oCropProtectionDuPont)
		    	{
	         		obj.QUADRANT_CODE_ID = this._defaultQuadrantForSeed;
					obj.CHANNEL_CODE_ID = this._defaultChannelForSeed;
		    	}
		    	else{
		    		obj.QUADRANT_CODE_ID = -1;
					obj.CHANNEL_CODE_ID = -1;
		    	}
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
					"NETTING_DEFAULT_CODE_ID","QUADRANT_CODE_ID","CHANNEL_CODE_ID","CONSENSUS_DEFAULT_CODE_ID"];
	
			        var allTextLines = strCSV.split(/\r\n|\n/);
			        var excelColumnHeaders = allTextLines[0].split(",");
			        var validHeadersFlag = true;
			        // current limit for excel upload is 200 records
			        // check if excel has more than 200 records
			        // if more than 200 than show a validation message to user
			        var maxLimitExcel = parseInt(t._oi18nModel.getProperty("MaxLimit"),10);
			        var maxLimitExcelText = t._oi18nModel.getProperty("MaxLimitExcel.text");
			        
			        // last row of file is empty when splitting the CSV
			        var lastRow = allTextLines[allTextLines.length - 1];
			        if(lastRow === "")
			        {
			        	allTextLines.splice(allTextLines.length - 1,1);
			        }
			        
			        // including the header column into the count for max excel
			        if (allTextLines.length > (maxLimitExcel + 1))
			        {
			        	MessageBox.alert(maxLimitExcelText,
			        	{
			        		icon : MessageBox.Icon.ERROR,
							title : "Error"
			        	});
			        	 // close busy dialog
						t._busyDialog.close();
			        	return;
			        }
			        if (excelColumnHeaders.length !== parseInt(t._oi18nModel.getProperty("numOfHeaderColumns"),10))
	            	{
	            		MessageBox.alert("Incorrect number of columns on template.",
								{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
							});
	            		validHeadersFlag = false;
	            	}
	            	else
	            	{
            			// Get proper column headers from the i18n model
		                var oGMID = t._oi18nModel.getProperty("eGMID");
		                var oCountry  = t._oi18nModel.getProperty("eCountry");
		                var oStoredCurrency =t._oi18nModel.getProperty("eStoredCurrency"); 
		                var oIbpRelevancy  = t._oi18nModel.getProperty("eIBPRelevancy");
		                var oNettingDefault = t._oi18nModel.getProperty("eNettingDefault");
		                var oQuadrant = t._oi18nModel.getProperty("eQuadrant");
		                var oChannel = t._oi18nModel.getProperty("eChannel");
		                //var oMarketDefault = t._oi18nModel.getProperty("eMarketDefault");
		                var oConsensusDefault = t._oi18nModel.getProperty("eConsensusDefault");
		                
			            if (excelColumnHeaders[0] !== oGMID)
			            {
			                MessageBox.alert("Incorrect template format found. The first column should be: GMID",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
			                validHeadersFlag = false;
			            }
			            else if (excelColumnHeaders[1] !== oCountry)
			            {
			            	MessageBox.alert("Incorrect template format found. The second column should be: Country",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
			                validHeadersFlag = false;
			            }
			            else if (excelColumnHeaders[2] !== oStoredCurrency)
			            {
			            	MessageBox.alert("Incorrect template format found. The third column should be: Stored Currency",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
			                 validHeadersFlag = false;
			            }
			            else if (excelColumnHeaders[3] !== oIbpRelevancy)
			            {
			            	MessageBox.alert("Incorrect template format found. The fourth column should be: IBP Relevancy",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
			                 validHeadersFlag = false;
			           	}
			    		else if (excelColumnHeaders[4] !== oNettingDefault)
			    		{
			    			MessageBox.alert("Incorrect template format found. The fifth column should be: Netting Default",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
			                 validHeadersFlag = false;
			    		}
			    	    else if (excelColumnHeaders[5] !== oQuadrant)
			    		{
			    			MessageBox.alert("Incorrect template format found. The sixth column should be: Quadrant",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
			                 validHeadersFlag = false;
			    		}
			    	    else if (excelColumnHeaders[6] !== oChannel)
			    		{
			    			MessageBox.alert("Incorrect template format found. The seventh column should be: Channel",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
			                 validHeadersFlag = false;
			    		}
			    	    else if (excelColumnHeaders[7] !== oConsensusDefault)
			    		{
			    			MessageBox.alert("Incorrect template format found. The eight column should be:  Consensus Default Flag",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
			                 validHeadersFlag = false;
			    		}
	            	} // end of else
	
					// if all the headers are correct
			        if(validHeadersFlag)
			        {
		            	// clear out the current data on the page
				        t._oViewModelData.GMIDShipToCountryVM.splice(0,t._oViewModelData.GMIDShipToCountryVM.length);
				        // loop through all the rows, the last row is empty so do not include it
			            for (var k = 1; k < allTextLines.length; k++) 
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
				    		MessageBox.alert("Invalid/empty fields were found and defaulted during import.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
				    	}
			            // add empty row a the bottom;
			            t.addEmptyObject();
			            // close busy dialog
						t._busyDialog.close();
						// set page changed global variable to true
						t._isChanged = true;
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
        	MessageBox.alert("Error reading CSV file, please ensure the file is in CSV format.",
			{
				icon : MessageBox.Icon.ERROR,
				title : "Error"
			});
        	
        },
        convertLabelToCodeId : function(row) {
        	// get all the dropdownlists
        	var countryList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Country");
        	var storedCurrencyList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/StoredCurrency");
        	var ibpRelevancyList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/IBPRelevancyFlag");
        	var nettingDefaultList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/NettingDefaultFlag");
        	var quadrantList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Quadrant");
        	var channelList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/Channel");
        	var consensusDefaultList = this._oGMIDShipToCountryViewModel.getProperty("/GMIDShipToCountryVM/ConsensusDefaultFlag");
        	// row[0] is the GMID, check if more than 8 chars or not a number
        	//new RegExp(/[~`!@#$%\^&*+=()_\-\[\]\\';.,/{}|\\":<>\?]/).test(row[0]);
        	if(row[0].length > 10 || new RegExp(/[~`!@#$%\^&*+=()_\-\[\]\\';.,/{}|\\":<>\?]/).test(row[0]) || row[0].indexOf(".") !== -1)
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
        		else if (this._oSelectedGMIDType === this._oCropProtectionDuPont)
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
        		else if (this._oSelectedGMIDType === this._oCropProtectionDuPont)
		    	{
	         		row[6] = this._defaultChannelForSeed;
		    	}
        		else
        		{
        			row[6] = -1;
        		}
        		this._validDataFlag=true;
        	}
        	var consensusDefauObj = consensusDefaultList.find(function(data){return data.LABEL === row[7].trim(); });
        	if (consensusDefauObj !== "" && consensusDefauObj !== undefined)
        	{
        		row[7] = consensusDefauObj.ID;
        	}
        	else
        	{
        		row[7] = this._defaultConsensusFlag;
        	}
        	return row;
        },
        onDownloadTemplate: function(){			
         	var oUploadCollection = this.getView().byId("ucDownloadTemplate");
			var oUploadCollectionItem = this.getView().byId("uciDownloadTemplate");
			oUploadCollection.downloadItem(oUploadCollectionItem, true);
		},
		
		getGMID : function(gmid){
			var result = gmid;
			var gmidList = [];
			var gmidId = {"GMID": "" };
			gmidId.GMID = this.lpadstring(gmid);
			gmidList.push(gmidId);

			var viewpath = "V_VALIDATE_GMID";
             // below function will get all the GMID Country Records for the GMID's entered in UI
             var gmidRecords = DataContext.getGMIDListFromDBByGMIDPad(gmidList,viewpath);   
             for(var k = 0; k < gmidRecords.length; k++) {
				result = gmidRecords[k].GMID;
				break;
             }
             return result;
		}
  	});

});