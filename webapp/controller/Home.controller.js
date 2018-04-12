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
				oModel.setProperty("/showMaintainRule",false);
				oModel.setProperty("/showMaintainAttribute",false);
				oModel.setProperty("/showPlantAssignment",false);
				
				var oi18nModel = new ResourceModel({
	                bundleName: "bam.i18n.i18n"
	            });
				 
	        	 // get the Module settings for i18n model
	        	 var gmidSubmission = oi18nModel.getProperty("Module.gmidSubmission");
	        	 var maintainRule = oi18nModel.getProperty("Module.maintainRules");
	        	 var maintainAttributes = oi18nModel.getProperty("Module.maintainAttributes");
	        	 var plantAssignment = oi18nModel.getProperty("Module.plantAssignment");
	        	 var demandManagerAssigner = oi18nModel.getProperty("Module.demandManagerAssigner");
	        	 var globalLeaderAssigner = oi18nModel.getProperty("Module.globalLeaderAssigner");
	        	 var marketingDirectorAssigner = oi18nModel.getProperty("Module.marketingDirectorAssigner");
	        	 var marketingManagerAssigner = oi18nModel.getProperty("Module.marketingManagerAssigner");
	        	 var masterPlannerAssigner = oi18nModel.getProperty("Module.masterPlannerAssigner");
	        	 var productManagerAssigner = oi18nModel.getProperty("Module.productManagerAssigner");
	        	 var regulatorSupplyChainManagerAssigner = oi18nModel.getProperty("Module.regulatorSupplyChainManagerAssigner");
	        	 var supplyChainManagerAssigner = oi18nModel.getProperty("Module.supplyChainManagerAssigner");
	        	 var supplyChainPlanningSpecialistAssigner = oi18nModel.getProperty("Module.supplyChainPlanningSpecialistAssigner");
	        	 
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
				//
				// Checking maintain Attributes
				for(var k = 0; k < permissions.length; k++)
				{
					if(permissions[k].ATTRIBUTE === maintainAttributes)
					{
						oModel.setProperty("/showMaintainAttribute",true);
						// break since the user may have more than one role, as long as one of the user roles has permission we can show the tile
						break;
					}
				}
				//
				// Checking maintain Attributes
				for(var l = 0; l < permissions.length; l++)
				{
					if(permissions[l].ATTRIBUTE === plantAssignment)
					{
						oModel.setProperty("/showPlantAssignment",true);
						// break since the user may have more than one role, as long as one of the user roles has permission we can show the tile
						break;
					}
				}
				
				for(var j = 0; j  < permissions.length; j++)
				{
					if(permissions[j].ATTRIBUTE === maintainRule ||
					  permissions[j].ATTRIBUTE === demandManagerAssigner ||
					  permissions[j].ATTRIBUTE === globalLeaderAssigner ||
					  permissions[j].ATTRIBUTE === marketingDirectorAssigner ||
					  permissions[j].ATTRIBUTE === marketingManagerAssigner ||
					  permissions[j].ATTRIBUTE === masterPlannerAssigner ||
					  permissions[j].ATTRIBUTE === productManagerAssigner ||
					  permissions[j].ATTRIBUTE === regulatorSupplyChainManagerAssigner ||
					  permissions[j].ATTRIBUTE === supplyChainManagerAssigner ||
					  permissions[j].ATTRIBUTE === supplyChainPlanningSpecialistAssigner)
					{
						oModel.setProperty("/showMaintainRule",true);
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
			this.getOwnerComponent().getRouter().navTo("gmidPlant");
		},
		// Navigate to Maintain Attributes page
		onGoToAuditReport: function(){
			this.getOwnerComponent().getRouter().navTo("auditReport");
		},
		// Navigate to Maintain Rules Home page
		onGoTomaintainRules: function(){
			this.getOwnerComponent().getRouter().navTo("maintainRules");
		}
  	});
});