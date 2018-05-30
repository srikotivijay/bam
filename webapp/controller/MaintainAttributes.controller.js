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
	return Controller.extend("bam.controller.MaintainAttributes", {
			onInit : function () {
				filterBoolean = true;
				var btnclearfilter = this.getView().byId("btnClearFilter");
				// enable the button on page load
				btnclearfilter.setEnabled(true);
				// Get logged in user id
			    loggedInUserID = DataContext.getUserID();
				 // define a global variable for the oData model		    
		    	var oView = this.getView();
		    	oView.setModel(this.getOwnerComponent().getModel());
		    	
		    	this._oModel = new sap.ui.model.json.JSONModel();
	    		this._oModel.setProperty("/showEditButton",false);
	    		this.getView().setModel(this._oModel,"MaintainAttributesVM");
	    		
	    		// add column freeze to table
	    		var oSmartTable = this.getView().byId("smartTblBAMAttributes");   
	    		this._oSmartTable = oSmartTable;
				var oTable = oSmartTable.getTable();  
				oTable.setEnableColumnFreeze(true);
	    		this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);

	    		this._oi18nModel = this.getOwnerComponent().getModel("i18n");
	    		// get the Module settings for i18n model
        		var maintainAttributes = this._oi18nModel.getProperty("Module.maintainAttributes");
        		var actionEdit = this._oi18nModel.getProperty("Module.actionEdit");
		    	
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
		    	else
		    	{
		    		var oSmartTable = this.byId("smartTblBAMAttributes");
		    		oSmartTable.rebindTable();
		    	}
			},
			// applying default userid filters before binding
			onBeforeRebindTable : function(oEvent) {
				
				// refresh the odata model, this will force a refresh of the smart table UI
				this.getOwnerComponent().getModel().refresh(true);
				//Get bindinParams Object, which includes filters
				this._oBindingParams = oEvent.getParameter("bindingParams");
				if(filterBoolean){
					// Need to chcek the logged in user id in the following attributes
					// DEMAND_MANAGER_ID,GLOBAL_BUSINESS_LEADER_ID,SUPPLY_CHAIN_PLANNING_SPECIALIST_ID,
					// GLOBAL_SUPPLY_CHAIN_MANAGER_ID,MARKETING_SPECIALIST_ID,
					// REG_SUPPLY_CHAIN_MANAGER_ID,REQUESTED_BY,LAST_UPDATED_BY
					
				
			   // Create the aFilters array
				var aFilters = this._oBindingParams.filters;
				var demandmanagerFilter = new Filter("DEMAND_MANAGER_ID",sap.ui.model.FilterOperator.EQ,loggedInUserID);
				var globalbusinessleaderFilter = new Filter("GLOBAL_BUSINESS_LEADER_ID",sap.ui.model.FilterOperator.EQ,loggedInUserID);
				var supplychainplanningspecialistFilter = new Filter("SUPPLY_CHAIN_PLANNING_SPECIALIST_ID",sap.ui.model.FilterOperator.EQ,loggedInUserID);
			    var globalsupplychainmanagerFilter = new Filter("GLOBAL_SUPPLY_CHAIN_MANAGER_ID",sap.ui.model.FilterOperator.EQ,loggedInUserID);
				var marketspecialistFilter = new Filter("MARKETING_SPECIALIST_ID",sap.ui.model.FilterOperator.EQ,loggedInUserID);
			    var regsupplychainmanagerFilter = new Filter("REG_SUPPLY_CHAIN_MANAGER_ID",sap.ui.model.FilterOperator.EQ,loggedInUserID);
				var requestedbyFilter = new Filter("REQUESTED_BY",sap.ui.model.FilterOperator.EQ,loggedInUserID);
				var lastupdatedbyFilter = new Filter("LAST_UPDATED_BY",sap.ui.model.FilterOperator.EQ,loggedInUserID);
				
	            var gmidFilterList = new Filter ({
                    filters : [
                           demandmanagerFilter
                          ,globalbusinessleaderFilter
                          ,supplychainplanningspecialistFilter
                          ,globalsupplychainmanagerFilter
                          ,marketspecialistFilter
                          ,regsupplychainmanagerFilter
                          ,requestedbyFilter
                          ,lastupdatedbyFilter
                        ],
                        and : false
                    });
	           aFilters.push(gmidFilterList);
				
				}
				//
				// setting up sorters
				if (this._oBindingParams.sorter === undefined || this._oBindingParams.sorter.length === 0){
					this._oBindingParams.sorter.push(new sap.ui.model.Sorter("GMID_COUNTRY_STATUS", true));
					this._oBindingParams.sorter.push(new sap.ui.model.Sorter("GMID", false));
				}	
	        	
			},
			// clearing the default userid filters
			onClearFilter: function(oEvent){
				var oSmartTable = this.byId("smartTblBAMAttributes");
				var btnclearfilter = this.getView().byId("btnClearFilter");
				// get the confirmation message for i18n model
        		var clearfiltermsg = this._oi18nModel.getProperty("clearfilter");
				MessageBox.confirm(clearfiltermsg, {
            		icon: sap.m.MessageBox.Icon.WARNING,
            		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            		onClose: function(oAction) {
            			if (oAction === "YES") {
            				// resetting the filterboolean
            				filterBoolean =  false;
            				// disable the button after rebind
							btnclearfilter.setEnabled(false);
            		      	// clear the filters, rebind the smart table
	            			oSmartTable.rebindTable();
            			}
            		}
        		});
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
					this.getOwnerComponent().getRouter().navTo("editAttributesMultiple");
				}
				else
				{
					MessageBox.alert("Please select one Material/Country record for edit.",
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
					this._oDataModel.read("/V_MAINTAIN_ATTRIBUTES",{
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
				columnList.push({columnName : "GMID", width : "10em"});
				columnList.push({columnName : "GMID_SHORTTEXT", width : "20em"});
				columnList.push({columnName : "COUNTRY", width : "15em"});
				columnList.push({columnName : "COUNTRY_CODE", width : "5em"});
				columnList.push({columnName : "RCU_DESC", width : "15em"});
				columnList.push({columnName : "SUB_RCU_DESC", width : "15em"});
				columnList.push({columnName : "BRAND_NAME", width : "15em"});
				columnList.push({columnName : "DEMAND_MANAGER", width : "15em"});
				columnList.push({columnName : "MARKETING_SPECIALIST", width : "15em"});
				columnList.push({columnName : "GMID_COUNTRY_STATUS", width : "10em"});
				columnList.push({columnName : "REQUESTED_DATE", width : "15em"});
				this.adjustTableColumnWidth("smartTblBAMAttributes",columnList);  			
  		}
  	});
});
