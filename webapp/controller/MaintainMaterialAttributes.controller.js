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
	var filterBoolean = true;
	return Controller.extend("bam.controller.MaintainMaterialAttributes", {
			onInit : function () {
				filterBoolean = true;
				// Get logged in user id
			    loggedInUserID = DataContext.getUserID();
				 // define a global variable for the oData model		    
		    	var oView = this.getView();
		    	oView.setModel(this.getOwnerComponent().getModel());
		    	
		    	this._oModel = new sap.ui.model.json.JSONModel();

	    		// add column freeze to table
	    		var oSmartTable = this.getView().byId("smartTblMaterialAttributes");   
				var oTable = oSmartTable.getTable();  
				oTable.setEnableColumnFreeze(true);
	    		this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);

	    		this._oi18nModel = this.getOwnerComponent().getModel("i18n");
	    	
		    	
		    	if(firstTimePageLoad)
		    	{
		    		//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    		var oRouter = this.getRouter();
					oRouter.getRoute("maintainMaterialAttributes").attachMatched(this._onRouteMatched, this);
		    	}
		    	else
		    	{
		    		oSmartTable = this.byId("smartTblMaterialAttributes");
		    		oSmartTable.rebindTable();
		    	}
			},
			// applying default userid filters before binding
			onBeforeRebindTable : function(oEvent) {
				
				// refresh the odata model, this will force a refresh of the smart table UI
				this.getOwnerComponent().getModel().refresh(true);
				this._oBindingParams = oEvent.getParameter("bindingParams");
	        	// setting up sorters
				var aSorters = this._oBindingParams.sorter;
				var GMIDSorter = new Sorter("GMID",false);
				aSorters.push(GMIDSorter);

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
			//	var oSmartTable = this.byId("smartTblBAMAttributes");
				//oSmartTable.exit();
				this.getOwnerComponent().getRouter().navTo("home");
			},
			// navigate to edit attribute page on click of edit
			onEdit: function(){
				// get the smart table control
				this._oSmartTable = this.getView().byId("smartTblMaterialAttributes").getTable();
			
				// check if more than or less than 1 checkbox is checked
				var index,context,path,indexOfParentheses1,indexOfParentheses2;
				if(this._oSmartTable.getSelectedIndices().length === 1){
					index = this._oSmartTable.getSelectedIndices();
					context = this._oSmartTable.getContextByIndex(index[0]); 
					path = context.getPath();
					indexOfParentheses1 = path.indexOf("(");
					indexOfParentheses2 = path.indexOf(")");
					// navigate to single edit page
					this.getOwnerComponent().getRouter().navTo("editMaterialAttributes",{
						 editAttributesID : path.substring(indexOfParentheses1 + 1,indexOfParentheses2)
					});
				}
				else if(this._oSmartTable.getSelectedIndices().length > 1){
					index = this._oSmartTable.getSelectedIndices();
					var gmidids="";
					var idArr = [];
					var performFullList = false;
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
						else{
							//if undefined record is hit then stop and go do the full grab
							performFullList = true;
							break;
						}
					}
					if (performFullList){
						idArr = [];
						var editSelection = this.getAllMaterials();
						for (var j = 0; j < index.length; j++)
						{
							context = editSelection[index[j]]; 
							if(context !== undefined){
								idArr.push(context.ID);
							}
						}
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
					this.getOwnerComponent().getRouter().navTo("editMaterialAttributes");
				}
			},
			getAllMaterials : function () {
				var result;
				// Create a filter & sorter array
				var filterArray = [];
				var sortArray = [];
				var aApplicationFilters = this._oSmartTable.getBinding().aApplicationFilters;
				for (var a = 0; a < aApplicationFilters.length; a++){
					filterArray.push(aApplicationFilters[a]);
				}
				var aSorters = this._oSmartTable.getBinding().aSorters;
				for (var a = 0; a < aSorters.length; a++){
					sortArray.push(aSorters[a]);
				}
				
					// Get the Country dropdown list from the CODE_MASTER table
					this._oDataModel.read("/V_MAINTAIN_MATERIAL_ATTRIBUTES",{
							filters: filterArray,
							sorters: sortArray,
							async: false,
			                success: function(oData, oResponse){
				                result =  oData.results;
			                },
			    		    error: function(){
		    		    		MessageBox.alert("Unable to retreive values for edit. Please contact System Admin.",
								{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
								});
			            		result = [];
			    			}
			    	});
			    	return result;
			}
  	});
});