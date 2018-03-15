sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/core/routing/History"
	], function (Controller,DataContext,ResourceModel,History) {
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
			    		"GEOGRAPHY_ID" : -1,
			    		"geographyErrorState" : "None",
			    		"PRODUCT_ID" : -1,
			    		"productErrorStae" : "None",
			    		"CU_ID" : -1,
			    		"cuErrorState" : "None",
			    		"SUBCU_ID" : -1,
			    		"subcuErrorState" : "None",
			    		"createNew" : false,
			    		"isError" :false
			    	});
			    }
				// Assigning view model for the page
			    var oModel = new sap.ui.model.json.JSONModel({AssignRuleVM : initData});
			    // Create table model, set size limit to 300, add an empty row
			    oModel.setSizeLimit(2000);
			    // define a global variable for the view model, the view model data and oData model
			    this._oAssignRuleViewModel = oModel;
			    this._oViewModelData = this._oAssignRuleViewModel.getData();
			    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
	
			    this.getView().setModel(oModel);	
			    this.addEmptyObject();
			}
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
		
		onRemoveRow:function(){},
		
		onAddRow:function(){},
		
		onSubmit : function(){
			
		}
  	});
});