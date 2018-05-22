sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"bam/services/DataContext",
		"sap/ui/core/routing/History",
		"sap/ui/model/resource/ResourceModel"
	], function (Controller,JSONModel, MessageToast, MessageBox, DataContext,History,ResourceModel) {
		"use strict";
	var firstTimePageLoad = true;
	return Controller.extend("bam.controller.Reports", {
	onInit : function () {
		    	if(firstTimePageLoad)
		    	{
		    		//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    		var oRouter = this.getRouter();
					oRouter.getRoute("reports").attachMatched(this._onRouteMatched, this);
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
			// Navigate to Maintain Attributes page
			onGoToAuditReport: function(){
				this.getOwnerComponent().getRouter().navTo("auditReport");
			},
			// Navigate to Maintain Attributes page
			onGoToRuleReport: function(){
				this.getOwnerComponent().getRouter().navTo("ruleReport");
			},
				onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("home", true);
			}
		}
  	});
});