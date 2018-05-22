sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"bam/services/DataContext",
		"sap/ui/core/routing/History",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter"
	], function (Controller,MessageToast,MessageBox,DataContext,History,ResourceModel,Filter,Sorter) {
		"use strict";
	var loggedInUserID;
	var firstTimePageLoad = true;
	var dateFilter = [];
	var filter = [];
	return Controller.extend("bam.controller.RuleReport", {
			onInit : function () {
				
				// Get logged in user id
			    loggedInUserID = DataContext.getUserID();
				 // define a global variable for the oData model		    
		    	var oView = this.getView();
		    	oView.setModel(this.getOwnerComponent().getModel());
	    		
	    		//remove the selection column
	    		var oSmartTable = this.getView().byId("smartTblRuleReport");     //Get Hold of smart table
				var oTable = oSmartTable.getTable();          //Analytical Table embedded into SmartTable
				oTable.setSelectionMode("None");
				oTable.setEnableColumnFreeze(true);
				
		    	if(firstTimePageLoad)
		    	{
		    		//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    		var oRouter = this.getRouter();
					oRouter.getRoute("ruleReport").attachMatched(this._onRouteMatched, this);
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
			// navigate back to the homepage
			onHome: function(){
				this.getOwnerComponent().getRouter().navTo("home");
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
		},
			onBeforeRebindTable: function(oEvent){
				this.getOwnerComponent().getModel().refresh(true);
				
				this._oBindingParams = oEvent.getParameter("bindingParams");
	            // setting up filters
	            var aFilters = this._oBindingParams.filters;
            	
				if(dateFilter.length > 0){
	            	var dateFilters = new Filter ({
		                filters : dateFilter,
		                    bAnd : true
	                });
	                aFilters.push(dateFilters);
				}
			},
			smartFilterSearch: function(oEvent){
				var filterArray = [];
				filter = [];
				dateFilter = [];
				
				try{
					var fromDate = this.getView().byId("DPF")._getSelectedDate();
					var fromDateFilter = new Filter("OPERATION_ON",sap.ui.model.FilterOperator.GE, fromDate);
					dateFilter.push(fromDateFilter);
				}
				catch (err){
					
				}
				
				try{
					var toDate = this.getView().byId("DPT")._getSelectedDate();
					toDate.setHours(toDate.getHours() + 23);
					toDate.setMinutes(toDate.getMinutes() + 59);
					toDate.setSeconds(toDate.getSeconds() + 59);
					var toDateFilter = new Filter("OPERATION_ON",sap.ui.model.FilterOperator.LE, toDate);
					dateFilter.push(toDateFilter);
				}
				catch (err){
					
				}
				
			}
  	});
});