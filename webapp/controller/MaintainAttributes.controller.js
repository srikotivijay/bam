sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"bam/services/DataContext",
		"sap/ui/model/resource/ResourceModel"
	], function (Controller,MessageToast,MessageBox,DataContext,ResourceModel) {
		"use strict";

	var firstTimePageLoad = true;
	return Controller.extend("bam.controller.MaintainAttributes", {
			onInit : function () {
				 // define a global variable for the oData model		    
		    	this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
		    	var oView = this.getView();
		    	oView.setModel(this._oDataModel);
		    	
		    	this._oModel = new sap.ui.model.json.JSONModel();
	    		this._oModel.setProperty("/showEditButton",false);
	    		this.getView().setModel(this._oModel,"MaintainAttributesVM");
	    		
	    		
	    		
	    		var oi18nModel = new ResourceModel({
                	bundleName: "bam.i18n.i18n"
            	});
	    		// get the Module settings for i18n model
        		var maintainAttributes = oi18nModel.getProperty("Module.maintainAttributes");
        		var actionEdit = oi18nModel.getProperty("Module.actionEdit");
		    	
		    	// getting permissions for the current logged in user
				var permissions = DataContext.getUserPermissions();
				// check to see if the permission list includes "EDIT" action for the MAINTAIN ATTRIBUTES Module
				// ATTRIBUTE in this case means MODULE
				for(var i = 0; i < permissions.length; i++)
				{
					if(permissions[i].ATTRIBUTE === maintainAttributes && permissions[i].ACTION === actionEdit)
					{
						this._oModel.setProperty("/showEditButton",true);
						// break since the user may have more than one role, as long as one of the user roles has permission to edit we can show the button
						break;
					}
				}
		    	
		    	if(firstTimePageLoad)
		    	{
		    		//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    		var oRouter = this.getRouter();
					oRouter.getRoute("maintainAttributes").attachMatched(this._onRouteMatched, this);
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
			onFieldChange: function(source){
				var a = source;
				//this._oSmartTable = this.getView().byId("smartTblBAMAttributes").getTable();
				//this._oSmartTable.getSelectedIndices().
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
					var idArr = [];
					for (var i=0;i < index.length;i++)
					{
				
					context = this._oSmartTable.getContextByIndex(index[i]); 
					if(context != undefined){
						path = context.getPath();
						indexOfParentheses1 = path.indexOf("(");
						indexOfParentheses2 = path.indexOf(")");
						gmidids=path.substring(indexOfParentheses1 + 1,indexOfParentheses2);
						idArr.push(gmidids);
						//gmidids+=",";
						// navigate to multiple edit page
						}
					//else{
					//	MessageToast.show(context);
					//}
					}
					gmidids = gmidids.substring(0, gmidids.length - 1);
					//path = context.getPath();
					
					var oData = idArr;
					//add to model
					var oModel = new sap.ui.model.json.JSONModel(oData);
					sap.ui.getCore().setModel(oModel);
					//indexOfParentheses1 = path.indexOf("(");
					//indexOfParentheses2 = path.indexOf(")");
					// navigate to multiple edit page
					this.getOwnerComponent().getRouter().navTo("editAttributesMultiple");
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