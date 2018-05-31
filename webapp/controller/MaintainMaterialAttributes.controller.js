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
			    this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			    var maintainMaterialAttributes = this._oi18nModel.getProperty("Module.maintainMaterialAttributes");
				var permissions = DataContext.getUserPermissions();
				var hasAccess = false;
				for(var j = 0; j < permissions.length; j++)
				{
					if(permissions[j].ATTRIBUTE === maintainMaterialAttributes)
					{
						hasAccess = true;
						break;
					}
				}
				
				if(hasAccess === false){
					this.getRouter().getTargets().display("accessDenied", {
						fromTarget : "maintainMaterialAttributes"
					});	
				}
				else
				{
				 // define a global variable for the oData model		    
		    	var oView = this.getView();
		    	oView.setModel(this.getOwnerComponent().getModel());
		    	
		    	this._oModel = new sap.ui.model.json.JSONModel();

	    		// add column freeze to table
	    		var oSmartTable = this.getView().byId("smartTblMaterialAttributes");   
	    		this._oSmartTable = oSmartTable;
				var oTable = oSmartTable.getTable();  
				oTable.setEnableColumnFreeze(true);
	    		this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);

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
				DataContext.clearPersFilter(this._oSmartTable,this._oBindingParams);
				this.getOwnerComponent().getRouter().navTo("home");
			},
			// navigate to edit attribute page on click of edit
			onEdit: function(){
				// get the smart table control
				this._oSmartTable = this.getView().byId("smartTblMaterialAttributes").getTable();
			
				// check if more than or less than 1 checkbox is checked
				var index,context,path,indexOfParentheses1,indexOfParentheses2;
				 if(this._oSmartTable.getSelectedIndices().length > 0){
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

					var oData = idArr;
					//add to model
					var oModel = new sap.ui.model.json.JSONModel(oData);
					sap.ui.getCore().setModel(oModel);
					this.getOwnerComponent().getRouter().navTo("editMaterialAttributes");
				}
				else
				{
					MessageBox.alert("Please select one Material for edit.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
						});
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
			},
			adjustTableColumnWidth : function(tableName, columnList){
  			var oSmartTable = this.getView().byId(tableName); 
  			var tableColumns = oSmartTable.getTable().getColumns();
  			var tableId = oSmartTable.getId();
  			for(var i = 0; i < tableColumns.length; i++){
  				for(var j = 0; j < columnList.length; j++){
  					if(tableColumns[i].getId() === tableId + "-" + columnList[j].columnName){
  						tableColumns[i].setWidth(columnList[j].width);
  						break;
  					}
  				}
  			}
  		},
  			onDataRecieved : function(){
				var columnList=[];
				columnList.push({columnName : "SOURCE", width : "10em"});
				columnList.push({columnName : "GMID", width : "10em"});
				columnList.push({columnName : "GMID_SHORTTEXT", width : "20em"});
				columnList.push({columnName : "TRADE_PRODUCT_CODE", width : "10em"});
				columnList.push({columnName : "TRADE_PRODUCT_DESC", width : "20em"});
				columnList.push({columnName : "BUSINESS_SEGMENT_DESC", width : "15em"});
				columnList.push({columnName : "ALERT_EXCLUSION_FLAG", width : "20em"});
				columnList.push({columnName : "ALERT_EXCLUSION_FLAG_CODE", width : "5em"});
				columnList.push({columnName : "BASE_UOM", width : "10em"});
				columnList.push({columnName : "BGT_DESC", width : "15em"});
				columnList.push({columnName : "BUSINESS_SEGMENT_CODE", width : "10em"});
				columnList.push({columnName : "CROP_MOLECULE_DESC", width : "15em"});
				columnList.push({columnName : "FAMILY_DESC", width : "15em"});
				columnList.push({columnName : "INV_TYPE", width : "10em"});
				columnList.push({columnName : "LOCAL_UOM", width : "10em"});
				columnList.push({columnName : "MASTER_SALES_SPEC_CODE", width : "10em"});
				columnList.push({columnName : "MASTER_SALES_SPEC_DESC", width : "20em"});
				columnList.push({columnName : "MATERIAL_CLASS", width : "15em"});
				columnList.push({columnName : "MATERIAL_STATE", width : "15em"});
				columnList.push({columnName : "MATERIAL_TYPE", width : "15em"});
				columnList.push({columnName : "PACKAGE_TYPE", width : "15em"});
				columnList.push({columnName : "PERFORMANCE_CENTER_CODE", width : "10em"});
				columnList.push({columnName : "PERFORMANCE_CENTER_DESC", width : "15em"});
				columnList.push({columnName : "PLAN_PRODUCT_CODE", width : "10em"});
				columnList.push({columnName : "PLAN_PRODUCT_DESC", width : "15em"});
				columnList.push({columnName : "PLATFORM_DESC", width : "15em"});
				columnList.push({columnName : "PORTFOLIO_DESC", width : "15em"});
				columnList.push({columnName : "PR_PRODUCT", width : "15em"});
				columnList.push({columnName : "PRIMARY_UOM", width : "10em"});
				columnList.push({columnName : "PROFIT_CENTER_CODE", width : "10em"});
				columnList.push({columnName : "PROFIT_CENTER_DESC", width : "15em"});
				columnList.push({columnName : "SPECIFIED_MATERIAL_CODE", width : "10em"});
				columnList.push({columnName : "SPECIFIED_MATERIAL_DESC", width : "15em"});
				columnList.push({columnName : "SUBCROP_MOLECULE_DESC", width : "15em"});
				columnList.push({columnName : "SUPPLY_GROUP", width : "15em"});
				columnList.push({columnName : "TRAIT", width : "15em"});
				columnList.push({columnName : "TREATMENT", width : "15em"});
				columnList.push({columnName : "VALUE_CENTER_CODE", width : "10em"});
				columnList.push({columnName : "VALUE_CENTER_DESC", width : "15em"});
				this.adjustTableColumnWidth("smartTblMaterialAttributes",columnList);  			
  		}
  	});
});