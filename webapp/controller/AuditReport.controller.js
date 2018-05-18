sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"bam/services/DataContext",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter"
	], function (Controller,MessageToast,MessageBox,DataContext,ResourceModel,Filter,Sorter) {
		"use strict";
	var loggedInUserID;
	var firstTimePageLoad = true;
	var beginInitialColumns = "GMID,GMID_SHORTTEXT,COUNTRY";
	var endInitialColumns = "OPERATION_BY,OPERATION_ON";
	return Controller.extend("bam.controller.AuditReport", {
			onInit : function () {
				// Get logged in user id
			    loggedInUserID = DataContext.getUserID();
				 // define a global variable for the oData model		    
		    	var oView = this.getView();
		    	oView.setModel(this.getOwnerComponent().getModel());

	    		//remove the selection column
	    		var oSmartTable = this.getView().byId("smartTblBAMAttributes");     //Get Hold of smart table
				var oTable = oSmartTable.getTable();          //Analytical Table embedded into SmartTable
				var oSmartFilterbar = this.getView().byId("smartFilterBar");
				oSmartFilterbar.clear(); // clear the existing filters
				oTable.setSelectionMode("None");
				oTable.setEnableColumnFreeze(true);
				//oSmartFilterbar.search();
				
				this._oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this._oModel,"AuditVM");
			    // define a global variable for the view model, the view model data and oData model
			    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
			    this._oModel.setProperty("/ChangeAttributes",this.getChangeAttributeDropDown());
			    oSmartTable.setInitiallyVisibleFields(beginInitialColumns);
			    // this._oModel.setProperty("InitiallyVisibleFields", beginInitialColumns, null, true);
		    	
		    	if(firstTimePageLoad)
		    	{
		    		//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    		var oRouter = this.getRouter();
					oRouter.getRoute("auditReport").attachMatched(this._onRouteMatched, this);
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
			onBeforeRebindTable: function(){
				this.getOwnerComponent().getModel().refresh(true);
			},
			smartFilterSearch: function(oEvent){
				var changeAttributeList = this.getView().byId("cmbAttr").getSelectedKeys();
				var filterArray = [];
				
				if(changeAttributeList.length > 0){
					for(var i = 0; i < changeAttributeList.length; i++){
						var attrFilter = new Filter("CHANGE_ATTRIBUTE_ID",sap.ui.model.FilterOperator.EQ, changeAttributeList[i]);
						filterArray.push(attrFilter);
						var modFilter = new Filter("MODULE_ID",sap.ui.model.FilterOperator.EQ, this._moduleId);
						filterArray.push(modFilter);
					}
					var attributes = this.getAttributeMapping(filterArray);
					var attributeColumns = [];
					for(var i = 0; i < attributes.length; i++){
						attributeColumns.push(attributes[i].MAPPED_ATTRIBUTE_NAME);
					}
					var initiallyVisibleColumns = beginInitialColumns + "," + attributeColumns.join() + "," + endInitialColumns;
		    		//var oSmartTable = this.getView().byId("smartTblBAMAttributes");     //Get Hold of smart table
		    		//var fields = this._oModel.setProperty("InitiallyVisibleFields", initiallyVisibleColumns);
		    		//fields = initiallyVisibleColumns;
					//oSmartTable.setInitiallyVisibleFields(initiallyVisibleColumns);
					this.showHideColumns(initiallyVisibleColumns);
					// this.getView().byId("smartTblBAMAttributes").getTable().getColumns()[30].setVisible(true);
					// oSmartTable.rerender();
					// var oTable = oSmartTable.getTable();
					// oTable.getColumns();
				}
				else{
					
				}
			},
			getChangeAttributeDropDown : function () {
				var result;
				// Create a filter & sorter array
				var filterArray = [];
				var moduleFilter = new Filter("MODULE_CODE_KEY",sap.ui.model.FilterOperator.EQ,"CHANGE_HISTORY");
				filterArray.push(moduleFilter);
				var sortArray = [];
				var sorter = new sap.ui.model.Sorter("ATTRIBUTE_LABEL",false);
				sortArray.push(sorter);
				// Get the Country dropdown list from the CODE_MASTER table
				this._oDataModel.read("/V_CHANGE_ATTRIBUTE_MODULE_MAPPING",{
						filters: filterArray,
						sorters: sortArray,
						async: false,
		                success: function(oData, oResponse){
			                // Bind the Geography data
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
		    	if(result[0] != undefined){
		    		this._moduleId = result[0].MODULE_ID;
		    	}
		    	return result;
			},
			getAttributeMapping : function (filterArray) {
				var result;
				// Get the Country dropdown list from the CODE_MASTER table
				this._oDataModel.read("/CHANGE_ATTRIBUTE_MAPPING",{
						filters: filterArray,
						async: false,
		                success: function(oData, oResponse){
			                // Bind the Geography data
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
			showHideColumns: function(visibleFields){
				var oSmartTable = this.getView().byId("smartTblBAMAttributes");     //Get Hold of smart table
				var tableId = oSmartTable.getId() + "-";
				var columns = oSmartTable.getTable().getColumns();
				var visibleFieldCollection = visibleFields.split(",");
				for(var i = 0; i < columns.length; i++){
					var columnName = columns[i].getId().replace(tableId,"");
					if(visibleFieldCollection.indexOf(columnName) >= 0){
						columns[i].setVisible(true);
					}
					else{
						columns[i].setVisible(false);
					}
				}
			}
  	});
});