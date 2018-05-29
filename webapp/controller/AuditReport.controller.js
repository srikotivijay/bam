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
	var filter = [];
	var dateFilter = [];
	var beginInitialColumns = "GMID,GMID_SHORTTEXT,COUNTRY";
	var endInitialColumns = "OPERATION_BY,OPERATION_ON";
	var initiallyVisibleCols = "BGT_DESC,BRAND_NAME,CHANNEL,CHANNEL_CODE,CONS_DEFAULT_FLAG,COUNTRY,COUNTRY_CODE,CURRENCY_CODE,CURRENCY_DESCRIPTION,DEMAND_ATTRIBUTE1,DEMAND_ATTRIBUTE2,DEMAND_MANAGER,DEMAND_MANAGER_ID,FINANCE_SYSTEM_FLAG,GLOBAL_BUSINESS_LEADER,GLOBAL_BUSINESS_LEADER_ID,GLOBAL_SUPPLY_CHAIN_MANAGER,GLOBAL_SUPPLY_CHAIN_MANAGER_ID,GMID,GMID_COUNTRY_STATUS,GMID_COUNTRY_STATUS_CODE,GMID_SHORTTEXT,IBP_RELEVANCY,IBP_RELEVANCY_CODE,IBP_STATUS,LAST_UPDATED_BY,LAST_UPDATED_DATE,LOCAL_UOM,MARKETING_ATTRIBUTE1,MARKETING_ATTRIBUTE2,MARKETING_DIRECTOR,MARKETING_MANAGER,MARKETING_SPECIALIST,MARKETING_SPECIALIST_ID,MARKET_DEFAULT,MARKET_DEFAULT_CODE,MASTER_SALES_SPEC_DESC,MATERIAL_STATUS,NETTING_DEFAULT,NETTING_DEFAULT_CODE,OPERATION,OPERATION_BY,OPERATION_ON,PACKAGE_TYPE,PERFORMANCE_CENTER_DESC,PLAN_PRODUCT_DESC,PRIOR_CHANNEL,PRIOR_CHANNEL_CODE_ID,PRIOR_CONS_DEFAULT_FLAG,PRIOR_CURRENCY_CODE,PRIOR_CURRENCY_DESCRIPTION,PRIOR_DEMAND_ATTRIBUTE1,PRIOR_DEMAND_ATTRIBUTE2,PRIOR_DEMAND_MANAGER,PRIOR_DEMAND_MANAGER_ID,PRIOR_FINANCE_SYSTEM_FLAG,PRIOR_GLOBAL_BUSINESS_LEADER,PRIOR_GLOBAL_BUSINESS_LEADER_ID,PRIOR_GLOBAL_SUPPLY_CHAIN_MANAGER,PRIOR_GLOBAL_SUPPLY_CHAIN_MANAGER_ID,PRIOR_GMID_COUNTRY_STATUS,PRIOR_GMID_COUNTRY_STATUS_CODE,PRIOR_IBP_RELEVANCY,PRIOR_IBP_RELEVANCY_CODE,PRIOR_IBP_STATUS,PRIOR_MARKETING_ATTRIBUTE1,PRIOR_MARKETING_ATTRIBUTE2,PRIOR_MARKETING_DIRECTOR,PRIOR_MARKETING_MANAGER,PRIOR_MARKETING_SPECIALIST,PRIOR_MARKETING_SPECIALIST_ID,PRIOR_MARKET_DEFAULT,PRIOR_MARKET_DEFAULT_CODE_ID,PRIOR_NETTING_DEFAULT,PRIOR_NETTING_DEFAULT_CODE,PRIOR_QUADRANT,PRIOR_QUADRANT_CODE_ID,PRIOR_RCU_CODE,PRIOR_RCU_DESC,PRIOR_REG_SUPPLY_CHAIN_MANAGER,PRIOR_REG_SUPPLY_CHAIN_MANAGER_ID,PRIOR_SUB_RCU_CODE,PRIOR_SUB_RCU_DESC,PRIOR_SUPPLY_ATTRIBUTE1,PRIOR_SUPPLY_ATTRIBUTE2,PRIOR_SUPPLY_CHAIN_PLANNING_SPECIALIST,PRIOR_SUPPLY_CHAIN_PLANNING_SPECIALIST_ID,PRIOR_SUPPLY_SYSTEM_FLAG,PRIOR_SUPPLY_SYSTEM_FLAG_CODE_ID,PRIOR_TRADE_AREA_CODE,PRIOR_TRADE_AREA_DESC,PROFIT_CENTER_DESC,QUADRANT,QUADRANT_CODE,RCU_CODE,RCU_DESC,REG_SUPPLY_CHAIN_MANAGER,REG_SUPPLY_CHAIN_MANAGER_ID,REQUESTED_BY,REQUESTED_DATE,SPECIFIED_MATERIAL_DESC,STORED_CURRENCY,SUB_RCU_CODE,SUB_RCU_DESC,SUPPLY_ATTRIBUTE1,SUPPLY_ATTRIBUTE2,SUPPLY_CHAIN_PLANNING_SPECIALIST,SUPPLY_CHAIN_PLANNING_SPECIALIST_ID,SUPPLY_SYSTEM_FLAG,SUPPLY_SYSTEM_FLAG_CODE,TRADE_AREA_CODE,TRADE_AREA_DESC,TRADE_PRODUCT_CODE,TRADE_PRODUCT_DESC,TREATMENT,VALUE_CENTER_CODE,VALUE_CENTER_DESC";
	return Controller.extend("bam.controller.AuditReport", {
			onInit : function () {
				// Get logged in user id
			    loggedInUserID = DataContext.getUserID();
				 // define a global variable for the oData model		    
		    	var oView = this.getView();
		    	oView.setModel(this.getOwnerComponent().getModel());
				this._oi18nModel = this.getOwnerComponent().getModel("i18n");
	    		//remove the selection column
	    		this._oSmartTable = this.getView().byId("smartTblBAMAttributes");     //Get Hold of smart table
				var oTable = this._oSmartTable.getTable();          //Analytical Table embedded into SmartTable
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
			    var initialColumns = this.getTableColumns("V_AUDIT_REPORT").join();
			    this._oSmartTable.setInitiallyVisibleFields(initialColumns);
			    // this._oModel.setProperty("InitiallyVisibleFields", beginInitialColumns, null, true);
		    	
		    	if(firstTimePageLoad)
		    	{
		    		//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    		var oRouter = this.getRouter();
					oRouter.getRoute("auditReport").attachMatched(this._onRouteMatched, this);
		    	}
		    	else{
		    		this.setSmartTablePersonalization(false);
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
				DataContext.clearPersFilter(this._oSmartTable,this._oBindingParams);
				this.getOwnerComponent().getRouter().navTo("home");
			},
			onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			DataContext.clearPersFilter(this._oSmartTable,this._oBindingParams);
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
	                if(aFilters.length > 0 && aFilters[0].aFilters != undefined){
		            	aFilters[0].bAnd = true;
		            	aFilters[0].aFilters.push(dateFilters);
		            }
		            else{
		            	aFilters.push(dateFilters);
		            }
				}
				
				if(filter.length > 0){
	            	var gmidFilterList = new Filter ({
	                    filters : filter,
	                        bAnd : false
	                    });
		            if(aFilters.length > 0 && aFilters[0].aFilters != undefined){
		            	aFilters[0].bAnd = true;
		            	aFilters[0].aFilters.push(gmidFilterList);
		            }
		            else{
		            	aFilters.push(gmidFilterList);
		            }
				}

			},
			tableInitialised: function(){
				var allColumns = this._oSmartTable.getTable().getColumns();
				for(var i = 0; i < allColumns.length; i++){ allColumns[i].setVisible(false);}
			
				this.setSmartTablePersonalization(false);
			},
			smartFilterSearch: function(oEvent){
				var changeAttributeList = this.getView().byId("cmbAttr").getSelectedKeys();
				var filterArray = [];
				filter = [];
				dateFilter = [];
				
				var fromDate = this._oModel.getProperty("/DateTimeFrom");
				if(fromDate != undefined){
					var fromDateFilter = new Filter("OPERATION_ON",sap.ui.model.FilterOperator.GE, fromDate);
					dateFilter.push(fromDateFilter);
				}
				
				var toDate = this._oModel.getProperty("/DateTimeTo");
				if(toDate != undefined){
					toDate.setHours(toDate.getHours() + 23);
					toDate.setMinutes(toDate.getMinutes() + 59);
					toDate.setSeconds(toDate.getSeconds() + 59);
					var toDateFilter = new Filter("OPERATION_ON",sap.ui.model.FilterOperator.LE, toDate);
					dateFilter.push(toDateFilter);
				}
				
				
				if(changeAttributeList.length > 0){

					var attributes = this.getAttributeMapping(changeAttributeList);
					var attributeColumns = [];
					for(var i = 0; i < attributes.length; i++){
						attributeColumns.push(attributes[i].MAPPED_ATTRIBUTE_NAME);
						if(attributes[i].MAPPED_ATTRIBUTE_NAME.includes("PRIOR")){
							var changeFilter = new Filter(attributes[i].MAPPED_ATTRIBUTE_NAME,sap.ui.model.FilterOperator.NE, "NO CHANGE");
							filter.push(changeFilter);
						}
					}
					
					var selectedAttributeColumns = beginInitialColumns + "," + attributeColumns.join() +  "," + endInitialColumns;
					
					var additionalColumns = this.findEligibleColumns(selectedAttributeColumns);
					
					if(additionalColumns.length > 0){
						selectedAttributeColumns = beginInitialColumns + "," + attributeColumns.join() + "," + additionalColumns.join() + "," + endInitialColumns;
					}
		    		//var oSmartTable = this.getView().byId("smartTblBAMAttributes");     //Get Hold of smart table
		    		//var fields = this._oModel.setProperty("InitiallyVisibleFields", initiallyVisibleColumns);
		    		//fields = initiallyVisibleColumns;
					//oSmartTable.setInitiallyVisibleFields(initiallyVisibleColumns);
					this.showHideColumns(selectedAttributeColumns);
					
					
					// this.getView().byId("smartTblBAMAttributes").getTable().getColumns()[30].setVisible(true);
					// oSmartTable.rerender();
					// var oTable = oSmartTable.getTable();
					// oTable.getColumns();
				}
				else{
					this.setSmartTablePersonalization(true);
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
			getAttributeMapping : function (changeAttributeList) {
				
				var fullAttributeList = [];
				var sortArray = [];
				var sorter = new sap.ui.model.Sorter("ORDER",false);
				sortArray.push(sorter);
				for(var i = 0; i < changeAttributeList.length; i++){
					var filterArray = [];
					var attrFilter = new Filter("CHANGE_ATTRIBUTE_ID",sap.ui.model.FilterOperator.EQ, changeAttributeList[i]);
					filterArray.push(attrFilter);
					var modFilter = new Filter("MODULE_ID",sap.ui.model.FilterOperator.EQ, this._moduleId);
					filterArray.push(modFilter);
				
					var result = [];
					this._oDataModel.read("/CHANGE_ATTRIBUTE_MAPPING",{
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
		    		
		    		for(var c = 0; c < result.length; c++){
		    			fullAttributeList.push(result[c]);
		    		}
				}
				
				
				
				// Get the Country dropdown list from the CODE_MASTER table
		    	return fullAttributeList;
			},
			getTableColumns : function (tableName) {
				var filterArray = [];
				var environmentFilter = new Filter("SCHEMA_NAME",sap.ui.model.FilterOperator.EQ,this._oi18nModel.getProperty("environment"));
				filterArray.push(environmentFilter);
				var tableFilter = new Filter("VIEW_NAME",sap.ui.model.FilterOperator.EQ,tableName);
				filterArray.push(tableFilter);
				var sortArray = [];
				var sorter = new sap.ui.model.Sorter("POSITION",false);
				sortArray.push(sorter);
				var result = [];
				// Get the Country dropdown list from the CODE_MASTER table
				this._oDataModel.read("/VIEW_COLUMNS",{
						filters: filterArray,
						sorters: sortArray,
						async: false,
		                success: function(oData, oResponse){
			                // Bind the Geography data
			                for (var i = 0; i < oData.results.length; i++){
			                	result.push(oData.results[i].COLUMN_NAME);
			                }
			                // result =  oData.results;
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
		    	result.splice(result.findIndex(function(ele){ return ele === "ID";}),1);
		    	return result;
			},
			showHideColumns: function(visibleFields){
				var oSmartTable = this.getView().byId("smartTblBAMAttributes");     //Get Hold of smart table
				var tableId = oSmartTable.getId() + "-";
				var columns = oSmartTable.getTable().getColumns();
				
				var table = this._oSmartTable.getTable();
				var visibleFieldCollection = visibleFields.split(",");
				// var columnMap = [];
				// 					if(visibleFieldCollection.indexOf(columnName) >= 0){
				// 		columns[i].setVisible(true);
				// 	}
				// 	else{
				// 		columns[i].setVisible(false);
				// 	}
				// 
				// for(var i = 0; i < columns.length; i++){
				// 	columnMap.push(columns[i].getId().replace(tableId,""));
				// }
				//reset all columns to visibility false
				//for(var i = 0; i < columns.length; i++){ columns[i].setVisible(false);}
				this.setSmartTablePersonalization(false);
				//remove and insert for proper order then set visible
				for(var i = 0; i < visibleFieldCollection.length; i++){
					var controlData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlData.columns.columnsItems.find(function(ele){ return ele.columnKey === visibleFieldCollection[i];}); 	// eslint-disable-line
					controlData.visible = true;
					controlData.index = i;
					var alreadyKnownPersistentData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.alreadyKnownPersistentData.columns.columnsItems.find(function(ele){ return ele.columnKey === visibleFieldCollection[i];}); 	// eslint-disable-line
					alreadyKnownPersistentData.visible = true;
					alreadyKnownPersistentData.index = i;
					var alreadyKnownRuntimeData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.alreadyKnownRuntimeData.columns.columnsItems.find(function(ele){ return ele.columnKey === visibleFieldCollection[i];}); 	// eslint-disable-line
					alreadyKnownRuntimeData.visible = true;
					alreadyKnownRuntimeData.index = i;
					var controlDataBase = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlDataBase.columns.columnsItems.find(function(ele){ return ele.columnKey === visibleFieldCollection[i];}); 	// eslint-disable-line
					controlDataBase.visible = true;
					controlDataBase.index = i;
					var column = columns.find(function(ele){ return ele.getId().replace(tableId,"") === visibleFieldCollection[i];});
					if(column != undefined){
						table.removeColumn(column);
						//var c_column = column.setVisible(true);
						table.insertColumn(column, i);
						column.setVisible(true);
					}
				}
			},
			setSmartTablePersonalization: function(visible){
				var columns = this._oSmartTable.getTable().getColumns();
				for(var i = 0; i < columns.length; i++){ columns[i].setVisible(visible);}
				var controlData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlData.columns.columnsItems; 	// eslint-disable-line
				for(var i = 0; i < controlData.length; i++){
					var current = controlData[i];
					current.visible = visible;
					current.index = visible ? i : -1;
				}
				var alreadyKnownPersistentData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.alreadyKnownPersistentData.columns.columnsItems; 	// eslint-disable-line
				for(var i = 0; i < alreadyKnownPersistentData.length; i++){
					var current = alreadyKnownPersistentData[i];
					current.visible = visible;
					current.index = visible ? i : -1;
				}
				var alreadyKnownRuntimeData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.alreadyKnownRuntimeData.columns.columnsItems; 	// eslint-disable-line
				for(var i = 0; i < alreadyKnownRuntimeData.length; i++){
					var current = alreadyKnownRuntimeData[i];
					current.visible = visible;
					current.index = visible ? i : -1;
				}
				var controlDataBase = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlDataBase.columns.columnsItems; 	// eslint-disable-line
				for(var i = 0; i < controlDataBase.length; i++){
					var current = controlDataBase[i];
					current.visible = visible;
					current.index = visible ? i : -1;
				}
			},
			findEligibleColumns: function(filterColumns){
				filterColumns = filterColumns.split(",");
				var eligibleColumns = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlData.columns.columnsItems; // eslint-disable-line
				var result = []; 
				for(var i = 0; i < eligibleColumns.length; i++){
					var currentColumn = eligibleColumns[i];
					if(currentColumn.visible === true){
						var addFlag = true;
						for(var a = 0; a < filterColumns.length; a++){
							if(filterColumns[a] === currentColumn.columnKey){
								addFlag = false;
								break;
							}
						}
						if(addFlag){
							result.push(currentColumn.columnKey);
						}
					}
				}
				return result;
			}
  	});
});