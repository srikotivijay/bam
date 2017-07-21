sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/ui/model/resource/ResourceModel"
	], function (Controller,DataContext,ResourceModel) {
		"use strict";
		
	var firstTimePageLoad = true;

	return Controller.extend("bam.controller.Home", {
		onInit : function()
		{
			if(DataContext.isBAMUser() === false)
			{
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else
			{
				// setting model for the page
				var oModel = new sap.ui.model.json.JSONModel();
		    	this.getView().setModel(oModel);
				
				// hide the GMID Submission tile by default, if the user has no roles then we hide the tile
				oModel.setProperty("/showGMIDSubmission",false);    
				
				var oi18nModel = new ResourceModel({
	                bundleName: "bam.i18n.i18n"
	            });
				 
	        	 // get the Module settings for i18n model
	        	 var gmidSubmission = oi18nModel.getProperty("Module.gmidSubmission");
	        	 var actionAdd = oi18nModel.getProperty("Module.actionAdd");
				
				// getting permissions for the current logged in user
				var permissions = DataContext.getUserPermissions();
				// check to see if the permission list includes "ADD" action for the GMID Submission Module
				// ATTRIBUTE in this case means MODULE
				for(var i = 0; i < permissions.length; i++)
				{
					if(permissions[i].ATTRIBUTE === gmidSubmission && permissions[i].ACTION === actionAdd)
					{
						oModel.setProperty("/showGMIDSubmission",true);
						// break since the user may have more than one role, as long as one of the user roles has permission we can show the tile
						break;
					}
				}
			}
		},
		// Navigate to GMID Submission page
		onGoToGMIDSubmission : function(){
			this.getOwnerComponent().getRouter().navTo("gmidSubmission");
		},
		// Navigate to Maintain Attributes page
		onGoToMaintainAttributes: function(){
			this.getOwnerComponent().getRouter().navTo("maintainAttributes");
		},
		// Navigate to Maintain Attributes page
		onGoToPlantAssignment: function(){
			this.getOwnerComponent().getRouter().navTo("GMIDPlant");
		}
  	});
});