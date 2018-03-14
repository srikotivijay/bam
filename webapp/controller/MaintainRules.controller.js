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
		
	return Controller.extend("bam.controller.MaintainRules", {
		onInit : function(){
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			var maintainRule = this._oi18nModel.getProperty("Module.maintainRules");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === maintainRule)
				{
						hasAccess = true;
						// break since the user may have more than one role, as long as one of the user roles has permission to edit we can show the button
						break;
				}
			}
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
		},
		// Navigate to CU SUB CU Assignment page
		onGoToCuSubCuAssignment : function(){
			this.getOwnerComponent().getRouter().navTo("cuAssignment");
		},
		// Navigate to People Assignment page In Future
		onGoToPeopleAssignment : function(){
			//this.getOwnerComponent().getRouter().navTo("cuAssignment");
			MessageBox.alert('Functionality coming soon');
			return;
		},
			//navigate back from rules page
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