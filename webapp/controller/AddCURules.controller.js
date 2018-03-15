sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/core/routing/History"
	], function (Controller,DataContext,MessageToast,MessageBox,ResourceModel,Filter,History) {
		"use strict";

  	var loggedInUserID;
	var firstTimePageLoad = true;
	return Controller.extend("bam.controller.AddCURules", {
		onInit : function () {
			// Get logged in user id
		    loggedInUserID = DataContext.getUserID();
			 // define a global variable for the oData model		    
		   	var oView = this.getView();
		   	oView.setModel(this.getOwnerComponent().getModel());
		   		// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
	    	//
	    	// checking the permission
	    	var maintainRule = this._oi18nModel.getProperty("Module.maintainRules");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === maintainRule && (permissions[i].ACTION === "EDIT" || permissions[i].ACTION === "ADD"))
				{
						hasAccess = true;
						break;
				}
			}
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else{
				this._isChanged = false;
			    var initData = [];
			    for(var j = 0; j < 5; j++){
			    	initData.push({
			    		"LEVEL_ID" : -1,
			    		"geographyErrorState" : "None",
			    		"PRODUCT_CODE" : -1,
			    		"productErrorStae" : "None",
			    		"RCU_CODE" : -1,
			    		"cuErrorState" : "None",
			    		"SUB_RCU_CODE" : -1,
			    		"subcuErrorState" : "None",
			    		"createNew" : false,
			    		"isError" :false
			    	});
			    }
				// Assigning view model for the page
			    this._oModel = new sap.ui.model.json.JSONModel({AssignRuleVM : initData});
			    // Create table model, set size limit to 300, add an empty row
			    this._oModel.setSizeLimit(2000);
			    // define a global variable for the view model, the view model data and oData model
			    this._oAssignRuleViewModel = this._oModel;
			    this._oViewModelData = this._oAssignRuleViewModel.getData();
			    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
	
			    this.getView().setModel(this._oModel);	
			    this.addEmptyObject();
			    
			    // get resource model
				this._oi18nModel = this.getOwnerComponent().getModel("i18n");

			// set all the dropdowns, get the data from the code master table
	    		this._oModel.setProperty("/AssignRuleVM/RuleSet",this.getRulesDropDown());
	    		this._oModel.setProperty("/AssignRuleVM/RCU",this.getRCUDropDown());
	    		this._oModel.setProperty("/AssignRuleVM/SubRCU",this.getSubRCUDropDown());
	    		this.setDefaultPropertyValues(initData);
			}
		},
		// This functions sets the value state of each control to None. This is to clear red input boxes when errors were found durin submission.
    	onChangeRuleSet: function(oEvent){
    		// update ischanged to true for any attribute changed
    		this._isChanged = true;
			var sourceControl = oEvent.getSource();
			// get the selected value
			var selectedRulekey = sourceControl.getSelectedItem().getKey();
			var rcuModel = this._oModel.getProperty("/AssignRuleVM/RuleSet");
			var geoLevel = rcuModel.find(function(data) {return data.CU_RULESET_SEQ == selectedRulekey;}).GEO_LEVEL;
			var productLevel = rcuModel.find(function(data) {return data.CU_RULESET_SEQ == selectedRulekey;}).PRODUCT_LEVEL;
			// from selected value fetch the Geolevel
			// bind the geo level dropdown based on rule
			if (selectedRulekey !== "-1")
			{
			this._oModel.setProperty("/AssignRuleVM/Geography",this.getGeoLevelDropDown(geoLevel));
			this._oModel.setProperty("/AssignRuleVM/Product",this.getProductLevelDropDown(productLevel));
			}
		},
		getRulesDropDown : function () {
			var result;
			// Create a filter & sorter array

			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("LABEL",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_CU_RULESET",{
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"CU_RULESET_SEQ":-1,
		              							"NAME":"Please Select a Rule Set"});
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for Rule Set Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		getGeoLevelDropDown : function (geolevel) {
			var result;
			// Create a filter & sorter array
			var filterArray = [];
			var geoLevelFilter = new Filter("GEO_LEVEL",sap.ui.model.FilterOperator.EQ,geolevel);
			filterArray.push(geoLevelFilter);
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("NAME",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/V_GEO_ALL_LEVEL",{
					filters: filterArray,
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"LEVEL_ID":-1,
		              							"NAME":"Select.."});
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for Geo Level Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		getProductLevelDropDown : function (productLevel) {
			var result;
			if (productLevel !== null )
			{
				// Create a filter & sorter array
				var filterArray = [];
				var geoLevelFilter = new Filter("PRODUCT_LEVEL",sap.ui.model.FilterOperator.EQ,productLevel);
				filterArray.push(geoLevelFilter);
				var sortArray = [];
				var sorter = new sap.ui.model.Sorter("LABEL",false);
				sortArray.push(sorter);
				// Get the Country dropdown list from the CODE_MASTER table
				this._oDataModel.read("/V_PRODUCT_ALL_LEVEL",{
						filters: filterArray,
						async: false,
		                success: function(oData, oResponse){
		                	// add Please select item on top of the list
			                oData.results.unshift({	"PRODUCT_CODE":-1,
			              							"PRODUCT_DESC":"Select.."});
			                // Bind the Country data to the GMIDShipToCountry model
			                result =  oData.results;
		                },
		    		    error: function(){
	    		    		MessageBox.alert("Unable to retrieve dropdown values for Product Level Please contact System Admin.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
		            		result = [];
		    			}
		    	});
			}
			else
			{
			result = [];
			result.unshift({"PRODUCT_CODE":0,
			              		"PRODUCT_DESC":"ALL"});
			}
	    	return result;
		},
		getRCUDropDown : function () {
			var result;
			// Create a filter & sorter array

			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("LABEL",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_RCU",{
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"RCU_CODE":-1,
		              							"RCU_DESC":"Select.."});
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for RCU Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		getSubRCUDropDown : function () {
			var result;
			// Create a filter & sorter array

			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("LABEL",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_SUB_RCU",{
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"SUB_RCU_CODE":-1,
		              							"SUB_RCU_DESC":"Select.."});
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for SUB RCU Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		// force init method to be called everytime we naviagte to Maintain Attribuets page 
		_onRouteMatched : function (oEvent) {
			// If the user does not exist in the BAM database, redirect them to the denied access page
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
		NavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("cuAssignment", true);
			}
		},
		onHome: function(){
			this.getOwnerComponent().getRouter().navTo("home");
		},
		addEmptyObject : function() {
	    	var aData  = this._oAssignRuleViewModel.getProperty("/AssignRuleVM");
	    	var emptyObject = {createNew: true, isError: false};
	    	aData.push(emptyObject);
	    	this._oAssignRuleViewModel.setProperty("/AssignRuleVM", aData);
		},
		disableControl:function(value){
			return !value;
		},
		enableControl : function(value){
			return !!value;
		},
		onChange : function(){},
		
		onRemoveRow:function(oEvent){
			this._isChanged = true;
			// Get the object to be deleted from the event handler
			var entryToDelete = oEvent.getSource().getBindingContext().getObject();
			// Get the # of rows in the VM, (this includes the dropdown objects such as Country, Currency, etc..)
			var rows = this._oViewModelData.AssignRuleVM;
			
			// loop through each row and check whether the passed object = the row object
			for(var i = 0; i < rows.length; i++){
				if(rows[i] === entryToDelete )
				{
					// found a match, remove this row from the data
					rows.splice(i,1);
					// refresh the GMID VM, this will automatically update the UI
					this._oAssignRuleViewModel.refresh();
					break;
				}
			}
		},
		
		onAddRow:function(oEvent){
			var path = oEvent.getSource().getBindingContext().getPath();
		    // create new empty rule object
		    var obj = {
			    		LEVEL_ID : -1,
			    		geographyErrorState : "None",
			    		PRODUCT_CODE : -1,
			    		productErrorStae : "None",
			    		RCU_CODE : -1,
			    		cuErrorState : "None",
			    		SUB_RCU_CODE : -1,
			    		ubcuErrorState : "None",
			    		createNew : false,
			    		isError :false
		    		};
		    // set default property values on the basis of selected gmid type
	    	obj = this.setDefaultPropertyValues(obj);
	    	this._oAssignRuleViewModel.setProperty(path, obj);
	    	this.addEmptyObject();			
		},
		setDefaultPropertyValues : function(obj){
			obj.LEVEL_ID = -1;
			obj.PRODUCT_CODE = -1;
			obj.RCU_CODE  = -1;
			obj.SUB_RCU_CODE  = -1;
        	return obj;
        },
		
		onSubmit : function(){

   // 		var errorCount = 0;
   // 		var successCount = 0;
   // 		var AssignRule = this._oAssignRuleViewModel.getProperty("/AssignRuleVM");

			// //open busy dialog
			// this._busyDialog.open();
			// // need to declare local this variable to call global functions in the timeout function
			
			// var t = this;
			
			// //permission to submit gmid without plants
			// //var hasPermission = false;
			
			// //CP plant validation
			// //var plantValidationArr = t.validateGmidShipFromPlant();
			// //var allHasPlants = plantValidationArr[0];
			// //var existPlant = plantValidationArr[1];
			// // setting timeout function in order to show the busy dialog before doing all the validation
			// setTimeout(function()
			// {
		 //       	var tablePath = "/MST_CU_RULE";
		 //       	var submitType = "";
		    	   
		 //   		// Create current timestamp
		 //   		var oDate = new Date();
		 //   	    // Get the code id for GMID Country Status
		 //   		// loop through the rows and for each row insert data into database
		 //   		// each row contains GMID Ship To combination.
		 //   		for(var i = 0; i < AssignRule.length - 1; i++) 
		 //   		{   
		 //   			// while saving we need to ignore the records which are not modified or altered
		 //   			// save only those records which are entered or updated
		 //   			if(t.checkEmptyRows(GMIDShipToCountry[i],strSubmission) === true)
		 //   			{
			// 				var GMID = t.lpadstring(GMIDShipToCountry[i].GMID);
			// 				var countryID = parseInt(GMIDShipToCountry[i].COUNTRY_CODE_ID,10);
			// 				var storedcurrencyID = parseInt(GMIDShipToCountry[i].CURRENCY_CODE_ID,10);
			// 				var ibprelevancyID = parseInt(GMIDShipToCountry[i].IBP_RELEVANCY_CODE_ID,10);
			// 				var nettingdefaultID = parseInt(GMIDShipToCountry[i].NETTING_DEFAULT_CODE_ID,10);
			// 				var quadrantID = parseInt(GMIDShipToCountry[i].QUADRANT_CODE_ID,10);
			// 				var channelID = parseInt(GMIDShipToCountry[i].CHANNEL_CODE_ID,10);
			// 				var marketdefaultID = parseInt(GMIDShipToCountry[i].MARKET_DEFAULT_CODE_ID,10);
			// 				var supplySystemFlag = parseInt(GMIDShipToCountry[i].SUPPLY_SYSTEM_FLAG_CODE_ID,10);
			// 				var createdBy = loggedInUserID;
			// 				// create new GMIDShipToCountry object
			// 				var newAssignRule = {
			// 		        	ID: 1 ,
			// 		        	GMID: GMID,
			// 		        	COUNTRY_CODE_ID: countryID,
			// 		        	CURRENCY_CODE_ID: storedcurrencyID,
			// 		        	IBP_RELEVANCY_CODE_ID: ibprelevancyID,
			// 		        	NETTING_DEFAULT_CODE_ID: nettingdefaultID,
			// 		        	QUADRANT_CODE_ID:quadrantID,
			// 		        	CHANNEL_CODE_ID: channelID,
			// 		        	MARKET_DEFAULT_CODE_ID: marketdefaultID,
			// 		        	SUPPLY_SYSTEM_FLAG_CODE_ID: supplySystemFlag,
			// 		        	TYPE: submitType,
			// 		        	GMID_COUNTRY_STATUS_CODE_ID: gmidcountrystatusID,
			// 		        	CREATED_ON: oDate,
			// 		        	CREATED_BY:createdBy
			//     			};
			    			
			//         		t._oDataModel.create(tablePath, newGMID,
			//         		{
			// 		        	success: function(){
			// 		        		successCount++;
			// 		    		},
			// 		    		error: function(){
			// 		    			errorCount++;
			// 					}
			//         		});
		 //   		}
		 //       }
		    		
	        		
	        	
	  //      	// close busy dialog
			// 	t._busyDialog.close();
			// },500); // end of timeout function
       // },
		}
  	});
});