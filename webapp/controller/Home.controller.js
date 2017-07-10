sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext"
	], function (Controller,DataContext) {
		"use strict";

	return Controller.extend("bam.controller.Home", {
		onInit : function()
		{
			// setting model for the page
			var oModel = new sap.ui.model.json.JSONModel();
	    	this.getView().setModel(oModel);
			
			// hide the GMID Submission tile by default, if the user has no roles then we hide the tile
			oModel.setProperty("/showGMIDSubmission",false);    
			
			// getting permissions for the current logged in user
			var permissions = DataContext.getUserPermissions();
			// check to see if the permission list includes "ADD" action for the GMID Submission Module
			// ATTRIBUTE in this case means MODULE
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === "GMID_SUBMISSION" && permissions[i].ACTION === "ADD")
				{
					oModel.setProperty("/showGMIDSubmission",true);
					// break since the user may have more than one role, as long as one of the user roles has permission we can show the tile
					break;
				}
			}
			
			//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
	    	var oRouter = this.getRouter();
			oRouter.getRoute("home").attachMatched(this._onRouteMatched, this);
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		// force init method to be called everytime we naviagte to the home page 
		_onRouteMatched : function (oEvent) {
			
			this.onInit();
		},
		// Navigate to GMID Submission page
		onGoToGMIDSubmission : function(){
			this.getOwnerComponent().getRouter().navTo("gmidSubmission");
		},
		// Navigate to Maintain Attributes page
		onGoToMaintainAttributes: function(){
			this.getOwnerComponent().getRouter().navTo("maintainAttributes");
		}
  	});
});