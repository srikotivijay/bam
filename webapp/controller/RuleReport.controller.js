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
	var beginInitialColumns = "GMID,GMID_DESC,SHIP_TO_COUNTRY,RULE_TYPE,OPERATION,RULE_SET_DESCRIPTION,GEO_LEVEL_DESC,PRODUCT_CODE,PRODUCT_DESCRIPTION";
	var endInitialColumns = "CHANGED_BY,CHANGED_ON";
	return Controller.extend("bam.controller.RuleReport", {
			onInit : function () {
				
				// Get logged in user id
			    loggedInUserID = DataContext.getUserID();
				 // define a global variable for the oData model		    
		    	var oView = this.getView();
		    	oView.setModel(this.getOwnerComponent().getModel());
		    	this._oi18nModel = this.getOwnerComponent().getModel("i18n");
	    		
	    		//remove the selection column
	    		this._oSmartTable  = this.getView().byId("smartTblRuleReport");     //Get Hold of smart table
				var oTable = this._oSmartTable.getTable();          //Analytical Table embedded into SmartTable
				var oSmartFilterbar = this.getView().byId("smartFilterBar");
				oSmartFilterbar.clear(); // clear the existing filters
				oTable.setSelectionMode("None");
				oTable.setEnableColumnFreeze(true);
				
				this._oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this._oModel,"RuleAuditVM");
				this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
			    this._oModel.setProperty("/ChangeAttributes",this.getChangeAttributeDropDown());
			    //
			    //var initialColumns = this.getTableColumns("V_WEB_CU_PEOPLE_RULE_LOG").join();
			    //this._oSmartTable.setInitiallyVisibleFields(initialColumns);
				
		    	if(firstTimePageLoad)
		    	{
		    		//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    		var oRouter = this.getRouter();
					oRouter.getRoute("ruleReport").attachMatched(this._onRouteMatched, this);
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
	               if(aFilters.length > 0 && aFilters[0].aFilters !== undefined){
	               		aFilters[0].bAnd = true;
	               		aFilters[0].aFilters.push(dateFilters);
	               }
	               else{
	               		aFilters.push(dateFilters);
	               }
				}
				
				var userFilters = [];
               userFilters.push(new Filter("REQUESTED_BY",sap.ui.model.FilterOperator.EQ, loggedInUserID));
               var userFilter = new Filter ({
                                    filters : userFilters,
                                    bAnd : true
                                });
               if(aFilters.length > 0 && aFilters[0].aFilters !== undefined)
               {
                    aFilters[0].bAnd = true;
                    aFilters[0].aFilters.push(userFilter);
                }
                else{
                    aFilters.push(userFilter);
                }
				
				if(filter.length > 0){
	            	var gmidFilterList = new Filter ({
	                    filters : filter,
	                        bAnd : false
	                    });
		            if(aFilters.length > 0 && aFilters[0].aFilters !== undefined){
		            	aFilters[0].bAnd = true;
		            	aFilters[0].aFilters.push(gmidFilterList);
		            }
		            else{
		            	aFilters.push(gmidFilterList);
		            }
				}
			},
			smartFilterSearch: function(oEvent){
				var filterArray = [];
				filter = [];
				dateFilter = [];
				var changeAttributeList = this.getView().byId("cmbAttr").getSelectedKeys();
				
				var fromDate = this._oModel.getProperty("/DateTimeFrom");
				if(fromDate !== undefined && fromDate !== null){
					var fromDateFilter = new Filter("CHANGED_ON",sap.ui.model.FilterOperator.GE, fromDate);
					dateFilter.push(fromDateFilter);
				}
				
				var toDate = this._oModel.getProperty("/DateTimeTo");
				if(toDate !== undefined && toDate !== null){
					toDate.setHours(toDate.getHours() + 23);
					toDate.setMinutes(toDate.getMinutes() + 59);
					toDate.setSeconds(toDate.getSeconds() + 59);
					var toDateFilter = new Filter("CHANGED_ON",sap.ui.model.FilterOperator.LE, toDate);
					dateFilter.push(toDateFilter);
				}
				this.filterReport();

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
					this.showHideColumns(selectedAttributeColumns);
				}
				else{
					this.setSmartTablePersonalization(true);
				}
			},
			getChangeAttributeDropDown : function () {
				var result;
				// Create a filter & sorter array
				var filterArray = [];
				var moduleFilter = new Filter("MODULE_CODE_KEY",sap.ui.model.FilterOperator.EQ,"RULE_HISTORY");
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
		    	if(result[0] !== undefined){
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
			},
			showHideColumns: function(visibleFields){
				var oSmartTable = this.getView().byId("smartTblRuleReport");     //Get Hold of smart table
				var tableId = oSmartTable.getId() + "-";
				var columns = oSmartTable.getTable().getColumns();
				
				var table = this._oSmartTable.getTable();
				var visibleFieldCollection = visibleFields.split(",");

				this.setSmartTablePersonalization(false);
				//remove and insert for proper order then set visible
				for(var i = 0; i < visibleFieldCollection.length; i++){
					var controlData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlData.columns.columnsItems.find(function(ele){ return ele.columnKey === visibleFieldCollection[i];}); 	// eslint-disable-line
					if(controlData !== undefined){
						controlData.visible = true;
						controlData.index = i;
					}
					var alreadyKnownPersistentData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.alreadyKnownPersistentData.columns.columnsItems.find(function(ele){ return ele.columnKey === visibleFieldCollection[i];}); 	// eslint-disable-line
					if(alreadyKnownPersistentData !== undefined){
						alreadyKnownPersistentData.visible = true;
						alreadyKnownPersistentData.index = i;
					}
					var alreadyKnownRuntimeData = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.alreadyKnownRuntimeData.columns.columnsItems.find(function(ele){ return ele.columnKey === visibleFieldCollection[i];}); 	// eslint-disable-line
					if(alreadyKnownRuntimeData !== undefined){
						alreadyKnownRuntimeData.visible = true;
						alreadyKnownRuntimeData.index = i;
					}
					var controlDataBase = this._oSmartTable._oPersController.oModels.$sapuicomppersonalizationBaseController.oData.controlDataBase.columns.columnsItems.find(function(ele){ return ele.columnKey === visibleFieldCollection[i];}); 	// eslint-disable-line
					if(controlDataBase !== undefined){
						controlDataBase.visible = true;
						controlDataBase.index = i;
					}
					var column = columns.find(function(ele){ return ele.getId().replace(tableId,"") === visibleFieldCollection[i];});
					if(column !== undefined){
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
			tableInitialised: function(){
				var allColumns = this._oSmartTable.getTable().getColumns();
				for(var i = 0; i < allColumns.length; i++){ allColumns[i].setVisible(false);}
			
				this.setSmartTablePersonalization(false);
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
			filterReport : function(){
				// getting the filters
				var aFilters = this.getView().byId("smartFilterBar").getFilterData();
				var gmid = aFilters.GMID;
				var gmidValue; 
				if(gmid !== undefined){
					gmidValue = gmid.ranges[0].value1;
				}
				var country = aFilters.SHIP_TO_COUNTRY;
				var countryValue ;
				if(country !== undefined){
					countryValue = country.ranges[0].value1;
				}
				var operationByValue = "";
				var sourceValue = "";
				var updAppActivity = {
					ID:1,
    	    		GMID: gmidValue,
    	    		SHIP_TO_COUNTRY : countryValue,
    	    		OPERATION_BY : operationByValue,
    	    		RULE_TYPE : sourceValue,
    	    		REQUESTED_BY : loggedInUserID
				};
				this._oDataModel.create("/MATERIAL_RULE_HISTORY", updAppActivity,
	        		{
			        	success: function(){
			        		return true;
			    		},
			    		error: function(err){
			    		
			    			MessageBox.alert("Error while selecting the rule history",
									{
										icon : MessageBox.Icon.ERROR,
										title : "Error"
									});
							return false;		
						}
	        		});
		}
  	});
});