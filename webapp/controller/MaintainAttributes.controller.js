sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"bam/services/DataContext"
	], function (Controller,MessageToast,MessageBox,DataContext) {
		"use strict";

	return Controller.extend("bam.controller.MaintainAttributes", {
			onInit : function () {
				 // define a global variable for the oData model		    
		    	this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
		    	var oView = this.getView();
		    	oView.setModel(this._oDataModel);
		    	
		    	this._oModel = new sap.ui.model.json.JSONModel();
	    		this._oModel.setProperty("/showEditButton",false);
	    		this.getView().setModel(this._oModel,"MaintainAttributesVM");
		    	
		    	// getting permissions for the current logged in user
				var permissions = DataContext.getUserPermissions();
				// check to see if the permission list includes "EDIT" action for the MAINTAIN ATTRIBUTES Module
				// ATTRIBUTE in this case means MODULE
				for(var i = 0; i < permissions.length; i++)
				{
					if(permissions[i].ATTRIBUTE === "MAINTAIN_ATTRIBUTES" && permissions[i].ACTION === "EDIT")
					{
						this._oModel.setProperty("/showEditButton",true);
						// break since the user may have more than one role, as long as one of the user roles has permission to edit we can show the button
						break;
					}
				}
		    	
		    	//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    	var oRouter = this.getRouter();
				oRouter.getRoute("maintainAttributes").attachMatched(this._onRouteMatched, this);
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
					this.onInit();
				}
			},
			// navigate back to the homepage
			onHome: function(){
				this.getOwnerComponent().getRouter().navTo("home");
			},
			// navigate to edit attribute page on click of edit
			onEdit: function(){
				// get the smart table control
				this._oSmartTable = this.getView().byId("smartTblBAMAttributes").getTable();
				// check if more than or less than 1 checkbox is checked
				var index,context,path,indexOfParentheses1,indexOfParentheses2;
				if(this._oSmartTable.getSelectedIndices().length === 1){
					index = this._oSmartTable.getSelectedIndices();
					context = this._oSmartTable.getContextByIndex(index[0]); 
					path = context.getPath();
					indexOfParentheses1 = path.indexOf("(");
					indexOfParentheses2 = path.indexOf(")");
					// navigate to single edit page
					this.getOwnerComponent().getRouter().navTo("editAttributesSingle",{
						 editAttributesID : path.substring(indexOfParentheses1 + 1,indexOfParentheses2)
					});
				}
				else if(this._oSmartTable.getSelectedIndices().length > 1){
					index = this._oSmartTable.getSelectedIndices();
					var gmidids="";
					for (var i=0;i < index.length;i++)
					{
				
					context = this._oSmartTable.getContextByIndex(index[i]); 	
					path = context.getPath();
					indexOfParentheses1 = path.indexOf("(");
					indexOfParentheses2 = path.indexOf(")");
					gmidids+=path.substring(indexOfParentheses1 + 1,indexOfParentheses2);
					gmidids+=",";
					// navigate to multiple edit page
					}
					gmidids = gmidids.substring(0, gmidids.length - 1);
					//path = context.getPath();
					//indexOfParentheses1 = path.indexOf("(");
					//indexOfParentheses2 = path.indexOf(")");
					// navigate to multiple edit page
					this.getOwnerComponent().getRouter().navTo("editAttributesMultiple",{
						 editAttributesIDs : gmidids
					});
				}
				else
				{
					MessageBox.alert("Please select one GMID - Country record for edit.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
					});
				}
			}
  	});
});