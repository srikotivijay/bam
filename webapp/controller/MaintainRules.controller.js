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
	return Controller.extend("bam.controller.MaintainRules", {
		onInit : function(){
			if(firstTimePageLoad)
	    	{
				var oRouter = this.getRouter();
				oRouter.getRoute("maintainRules").attachMatched(this._onRouteMatched, this);
				firstTimePageLoad = false;
	    	}
	    	var oModel = new sap.ui.model.json.JSONModel();
		    this.getView().setModel(oModel);
		    oModel.setProperty("/showCURule",false);
			oModel.setProperty("/showPeopleAssigner",false);
	    	//
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			var maintainRule = this._oi18nModel.getProperty("Module.maintainRules");
			var demandManagerAssigner = this._oi18nModel.getProperty("Module.demandManagerAssigner");
	        var globalLeaderAssigner = this._oi18nModel.getProperty("Module.globalLeaderAssigner");
	        var marketingDirectorAssigner = this._oi18nModel.getProperty("Module.marketingDirectorAssigner");
	        var marketingManagerAssigner = this._oi18nModel.getProperty("Module.marketingManagerAssigner");
	        var masterPlannerAssigner = this._oi18nModel.getProperty("Module.masterPlannerAssigner");
	        var productManagerAssigner = this._oi18nModel.getProperty("Module.productManagerAssigner");
	        var regulatorSupplyChainManagerAssigner = this._oi18nModel.getProperty("Module.regulatorSupplyChainManagerAssigner");
	        var supplyChainManagerAssigner = this._oi18nModel.getProperty("Module.supplyChainManagerAssigner");
	        var supplyChainPlanningSpecialistAssigner = this._oi18nModel.getProperty("Module.supplyChainPlanningSpecialistAssigner");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === maintainRule)
				{
						hasAccess = true;
						oModel.setProperty("/showCURule",true);
						// break since the user may have more than one role, as long as one of the user roles has permission to edit we can show the button
						break;
				}
			}
			for(i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === demandManagerAssigner ||
					  permissions[i].ATTRIBUTE === globalLeaderAssigner ||
					  permissions[i].ATTRIBUTE === marketingDirectorAssigner ||
					  permissions[i].ATTRIBUTE === marketingManagerAssigner ||
					  permissions[i].ATTRIBUTE === masterPlannerAssigner ||
					  permissions[i].ATTRIBUTE === productManagerAssigner ||
					  permissions[i].ATTRIBUTE === regulatorSupplyChainManagerAssigner ||
					  permissions[i].ATTRIBUTE === supplyChainManagerAssigner ||
					  permissions[i].ATTRIBUTE === supplyChainPlanningSpecialistAssigner){
					  hasAccess = true;	
					  oModel.setProperty("/showPeopleAssigner",true);
					  break;
				}
			}			
			
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "maintainRules"
				});		
			}
		},
		// force init method to be called everytime we naviagte to Maintain Attribuets page 
		_onRouteMatched : function (oEvent) {
			if(DataContext.isBAMUser() === false)
			{
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else
			{
				this.onInit();
			}
		},		
		// Navigate to CU SUB CU Assignment page
		onGoToCuSubCuAssignment : function(){
			this.getOwnerComponent().getRouter().navTo("cuAssignment");
		},
		// Navigate to People Assignment page In Future
		onGoToPeopleAssignment : function(){
			this.getOwnerComponent().getRouter().navTo("peopleAssignment");
			//MessageBox.alert('Functionality coming soon');
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
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}		
  	});
});