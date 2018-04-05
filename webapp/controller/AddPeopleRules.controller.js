sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/core/routing/History",
		"sap/ui/model/FilterOperator"
	] , 
	function (Controller,DataContext,MessageToast,MessageBox,ResourceModel,Filter,History,FilterOperator) {
		"use strict";
		var loggedInUserID;
		var firstTimePageLoad = true;
		var demandManagerAssigner;
		var globalLeaderAssigner;
		var marketingDirectorAssigner;
		var marketingManagerAssigner;
		var masterPlannerAssigner;
		var productManagerAssigner;
		var regionalSupplyChainManagerAssigner;
		var supplyChainManagerAssigner;
		var supplyChainPlanningSpecialistAssigner;
		var permissions;    
		var showDemandManager = false;
		var showGlobalLeader = false;
		var showMarketingDirector = false; 
		var showMarketingManger = false;
		var showMasterPlanner = false;
		var showProductManager = false;
		var showRegionalSupplychainManager = false;
		var showSupplyChainManager = false; 
		var showSupplyChainPlanningSpecialist = false;
		var filter = [];
		return Controller.extend("bam.controller.AddPeopleRules", {
			// Init function
			onInit: function() {
				// Get logged in user id
				loggedInUserID = DataContext.getUserID();
				 // define a global variable for the oData model		    
				//var oView = this.getView();
				//oView.setModel(this.getOwnerComponent().getModel());
				// get resource model
				this._oi18nModel = this.getOwnerComponent().getModel("i18n");			
		    	//
		    	// checking the permission
		    	var hasAccess = this.checkPermission();
				//	
				if(hasAccess === false){
					this.getRouter().getTargets().display("accessDenied", {
						fromTarget : "peopleAssignment"
					});					
				}
				else{
					this._isChanged = false;
				    var initData = this.addInitialObject();
				    // Assigning view model for the page
				    this._oModel = new sap.ui.model.json.JSONModel({AssignPeopleRuleVM : initData});
				    // Create table model, set size limit to 300, add an empty row
				    this._oModel.setSizeLimit(2000);
				    // define a global variable for the view model, the view model data and oData model
				    this._oAssignPeopleRuleViewModel = this._oModel;
				    this._oViewModelData = this._oAssignPeopleRuleViewModel.getData();
				    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
				    this.getView().setModel(this._oModel);	
				    // Adding empty row to the table
			    	this.addEmptyObject();
			    	//
			    	// Changing the visiblit of columns
			    	this._oModel.setProperty("/showDemandManager", showDemandManager);
			    	this._oModel.setProperty("/showGlobalLeader",showGlobalLeader);
			    	this._oModel.setProperty("/showMarketingDirector",showMarketingDirector);
			    	this._oModel.setProperty("/showMarketingManger",showMarketingManger);
			    	this._oModel.setProperty("/showMasterPlanner",showMasterPlanner);
			    	this._oModel.setProperty("/showProductManager",showProductManager);
			    	this._oModel.setProperty("/showRegionalSupplychainManager",showRegionalSupplychainManager);
			    	this._oModel.setProperty("/showSupplyChainManager",showSupplyChainManager);
			    	this._oModel.setProperty("/showSupplyChainPlanningSpecialist",showSupplyChainPlanningSpecialist);
			    	this._oModel.setProperty("/Users", this.getAllUsers());
			    	//
			    	if (!this._busyDialog) 
					{
						this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
						this.getView().addDependent(this._dialog);
					}
					// set all the dropdowns, get the data from the code master table
					// default load
					this._oModel.setProperty("/RuleSet",this.getRulesDropDown());
					this._oModel.setProperty("/PEOPLE_RULESET_SEQ",-1);
					this._oModel.setProperty("/NAME","Please Select a Rule Set");
				}
				if(firstTimePageLoad)
		    	{
		    		var oRouter = this.getRouter();
					oRouter.getRoute("addPeopleRules").attachMatched(this._onRouteMatched, this);
					firstTimePageLoad = false;
		    	}			
			},
			///
			// function to create the initial rows for the table
			addInitialObject : function(){
				var initData = [];
				for(var j = 0; j < 5; j++){
					initData.push({
						"LEVEL_ID" : -1,
						"geographyErrorState" : "None",
						"PRODUCT_CODE" : -1,
						"productErrorState" : "None",
						"DEMAND_MANAGER_ID" : -1,
						"demandManagerErrorState" : "None",
						"GLOBAL_LEADER_ID" : -1,
						"globalLeaderErrorState" : "None",
						"MARKETING_DIRECTOR_ID" : -1,
						"marketingDirectorErrorState" : "None",
						"MARKETING_MANAGER_ID" : -1,
						"marketingManagerErrorState" : "None",
						"MASTER_PLANNER_ID" : -1,
						"masterPlannerErrorState" : "None",
						"PRODUCT_MANAGER_ID" : -1,
						"productManagerErrorState" : "None",
						"REGIONAL_SUPPLY_CHAIN_MANAGER_ID" : -1,
						"regionalSupplyChainMangerErrorState" : "None",
						"SUPPLY_CHAIN_MANAGER_ID" : -1,
						"supplyChainManagerErrorState" : "None",
						"SUPPLY_CHAIN_PLANNING_SPECIALIST_ID" : -1,
						"supplyChainPlanningSpecialistErrorState" : "None",
						"createNew" : false,
						"isError" :false
					});
				}
				 return initData;
			},
			//
			// function to check the permission
			checkPermission : function(){
				demandManagerAssigner = this._oi18nModel.getProperty("Module.demandManagerAssigner");
		        globalLeaderAssigner = this._oi18nModel.getProperty("Module.globalLeaderAssigner");
		        marketingDirectorAssigner = this._oi18nModel.getProperty("Module.marketingDirectorAssigner");
		        marketingManagerAssigner = this._oi18nModel.getProperty("Module.marketingManagerAssigner");
		        masterPlannerAssigner = this._oi18nModel.getProperty("Module.masterPlannerAssigner");
		        productManagerAssigner = this._oi18nModel.getProperty("Module.productManagerAssigner");
		        regionalSupplyChainManagerAssigner = this._oi18nModel.getProperty("Module.regulatorSupplyChainManagerAssigner");
		        supplyChainManagerAssigner = this._oi18nModel.getProperty("Module.supplyChainManagerAssigner");
		        supplyChainPlanningSpecialistAssigner = this._oi18nModel.getProperty("Module.supplyChainPlanningSpecialistAssigner");			
				permissions = DataContext.getUserPermissions();
				var hasAccess = false;
				filter = [];
				for(var i = 0; i < permissions.length; i++)
				{
					if((permissions[i].ATTRIBUTE === demandManagerAssigner ||
						  permissions[i].ATTRIBUTE === globalLeaderAssigner ||
						  permissions[i].ATTRIBUTE === marketingDirectorAssigner ||
						  permissions[i].ATTRIBUTE === marketingManagerAssigner ||
						  permissions[i].ATTRIBUTE === masterPlannerAssigner ||
						  permissions[i].ATTRIBUTE === productManagerAssigner ||
						  permissions[i].ATTRIBUTE === regionalSupplyChainManagerAssigner ||
						  permissions[i].ATTRIBUTE === supplyChainManagerAssigner ||
						  permissions[i].ATTRIBUTE === supplyChainPlanningSpecialistAssigner) &&
						  (permissions[i].ACTION === "ADD" || permissions[i].ACTION === "EDIT")
						  )
					{
						//
						// Creatting the filer collection
						filter.push(new Filter(permissions[i].ATTRIBUTE.replace("_ASSIGNER",""),sap.ui.model.FilterOperator.NE,""));
						if(permissions[i].ATTRIBUTE === demandManagerAssigner){
							showDemandManager = true;	
						}
						if(permissions[i].ATTRIBUTE === globalLeaderAssigner){
							showGlobalLeader = true;	
						}	
						if(permissions[i].ATTRIBUTE === marketingDirectorAssigner){
							showMarketingDirector = true;	
						}	
						if(permissions[i].ATTRIBUTE === marketingManagerAssigner){
							showMarketingManger = true;	
						}
						if(permissions[i].ATTRIBUTE === masterPlannerAssigner){
							showMasterPlanner = true;	
						}
						if(permissions[i].ATTRIBUTE === productManagerAssigner){
							showProductManager = true;	
						}
						if(permissions[i].ATTRIBUTE === regionalSupplyChainManagerAssigner){
							showRegionalSupplychainManager = true;	
						}
						if(permissions[i].ATTRIBUTE === supplyChainManagerAssigner){
							showSupplyChainManager = true;	
						}
						if(permissions[i].ATTRIBUTE === supplyChainPlanningSpecialistAssigner){
							showSupplyChainPlanningSpecialist = true;	
						}
						hasAccess = true;
					}
				}
				return hasAccess;
			},
		// on navigate back button
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("peopleAssignment", true);
			}
		},
		onHome: function(){
			// this._oAssignRuleViewModel.refresh();
			this.getOwnerComponent().getRouter().navTo("home");
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
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
		addEmptyObject : function() {
	    	var aData  = this._oAssignPeopleRuleViewModel.getProperty("/AssignPeopleRuleVM");
	    	var emptyObject = {createNew: true, isError: false};
	    	aData.push(emptyObject);
	    	this._oAssignPeopleRuleViewModel.setProperty("/AssignPeopleRuleVM", aData);
		},
		getRulesDropDown : function () {
			var result;
			var filterArray = [];
			var validFlag = "T";
			var validFlagFilter = new Filter("VALID_FLAG",sap.ui.model.FilterOperator.EQ,validFlag);
			filterArray.push(validFlagFilter);
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("PEOPLE_RULESET_SEQ",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_PEOPLE_RULESET",{
					async: false,
					filters: filterArray,
					sorters: sortArray,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"PEOPLE_RULESET_SEQ":-1,
		              							"NAME":"Please Select a Rule Set"});
		                // Bind the CU RuleSet data
		                result =  oData.results;
	                },
	    		    error: function(error){
    		    		MessageBox.alert("Unable to retrieve dropdown values for Rule Set Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
        formatText : function(name, description){
        	if(description !== undefined){
        		return name + " (" + description + ")";
        	}
        	else{
        		return name;
        	}
        },
		// This functions sets the value state of each control to None. This is to clear red input boxes when errors were found durin submission.
    	onChangeRuleSet: function(oEvent){
    		// update ischanged to true for any attribute changed
    		this._isChanged = true;
    		// reset the error message property to false before doing any validation
			this.resetValidationForModel();
			var sourceControl = oEvent.getSource();
			// get the selected value
			var selectedRulekey = sourceControl.getSelectedItem().getKey();
			var rcuModel = this._oModel.getProperty("/RuleSet");
			var geoLevel = rcuModel.find(function(data) {return data.PEOPLE_RULESET_SEQ == selectedRulekey;}).GEO_LEVEL;
			var productLevel = rcuModel.find(function(data) {return data.PEOPLE_RULESET_SEQ == selectedRulekey;}).PRODUCT_LEVEL;
			// from selected value fetch the Geolevel
			// bind the geo level dropdown based on rule
			if (selectedRulekey !== "-1")
			{
				this._oModel.setProperty("/Geography",this.getGeoLevelDropDown(geoLevel));
				this._oModel.setProperty("/AssignPeopleRuleVM/Product",this.getProductLevelDropDown(productLevel));
				//
				// loading people role drop downs
				if(showDemandManager){
					var demandManager = this._oi18nModel.getProperty("DEMAND_MANAGER");
					this._oModel.setProperty("/AssignPeopleRuleVM/DemandManager", this.getPeopleRoleDropDown(demandManager));
				}
				if(showGlobalLeader){
					var globalLeader = this._oi18nModel.getProperty("GLOBAL_LEADER");
					this._oModel.setProperty("/AssignPeopleRuleVM/GlobalBusinessLeader", this.getPeopleRoleDropDown(globalLeader));
				}
				if(showMarketingDirector){
					var marketingDirector = this._oi18nModel.getProperty("MARKETING_DIRECTOR");
					this._oModel.setProperty("/AssignPeopleRuleVM/MarketingDirector", this.getPeopleRoleDropDown(marketingDirector));
				}
				if(showMarketingManger){
					var marketingManager = this._oi18nModel.getProperty("MARKETING_MANAGER");
					this._oModel.setProperty("/AssignPeopleRuleVM/MarketingManager", this.getPeopleRoleDropDown(marketingManager));
				}
				if(showMasterPlanner){
					var masterPlanner = this._oi18nModel.getProperty("MASTER_PLANNER");
					this._oModel.setProperty("/AssignPeopleRuleVM/MasterPlanner", this.getPeopleRoleDropDown(masterPlanner));	
				}
				if(showProductManager){
					var productManager = this._oi18nModel.getProperty("PRODUCT_MANAGER");
					this._oModel.setProperty("/AssignPeopleRuleVM/ProductManager", this.getPeopleRoleDropDown(productManager));	
				}
				if(showRegionalSupplychainManager){
					var regionalSupplychainManager = this._oi18nModel.getProperty("REG_SUPPLY_CHAIN_MANAGER");
					this._oModel.setProperty("/AssignPeopleRuleVM/RegionalSupplyChainManager", this.getPeopleRoleDropDown(regionalSupplychainManager));	
				}
				if(showSupplyChainManager){
					var supplychainManager = this._oi18nModel.getProperty("SUPPLY_CHAIN_MANAGER");
					this._oModel.setProperty("/AssignPeopleRuleVM/SupplyChainManager", this.getPeopleRoleDropDown(supplychainManager));	
				}
				if(showSupplyChainPlanningSpecialist){
					var supplychainPlanningSpecialist = this._oi18nModel.getProperty("SUPPLY_CHAIN_PLANNING_SPECIALIST");
					this._oModel.setProperty("/AssignPeopleRuleVM/SupplyChainPlanningSpecialist", this.getPeopleRoleDropDown(supplychainPlanningSpecialist));
				}
				//
		    	this.getDefaultPropertyValues();
				this.setDefaultValuesToGrid();
			}
			else
			{
				//this.onInit();
				this._isChanged = false;
				var initData = this.addInitialObject();
				this._oModel.setProperty("/AssignPeopleRuleVM",initData);
				this._oModel.setProperty("/Geography",null);
				// Adding empty row to the table
				this.addEmptyObject();
			}

		},
		getGeoLevelDropDown : function (geolevel) {
			var result;
			if(geolevel !== null){
				// Create a filter & sorter array
				var filterArray = [];
				var geoLevelFilter = new Filter("GEO_LEVEL",sap.ui.model.FilterOperator.EQ,geolevel);
				filterArray.push(geoLevelFilter);
				var sortArray = [];
				var sorter = new sap.ui.model.Sorter("NAME",false);
				sortArray.push(sorter);
				// Get the Country dropdown list from the CODE_MASTER table
				this._oDataModel.read("/V_GEO_ALL_LEVEL",{
						filters: filterArray,
						sorters: sortArray,
						async: false,
		                success: function(oData, oResponse){
		                	// add Please select item on top of the list
			                oData.results.unshift({	"LEVEL_ID":-1,
			              							"NAME":"Select.."});
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
			}
			else{
				result = [];
				result.unshift({"LEVEL_ID":0,
				              	"NAME":"ALL"});				
			}
	    	return result;
		},
		getProductLevelDropDown : function (productLevel) {
			var result;
			if (productLevel !== null )
			{
				// Create a filter & sorter array
				var filterArray = [];
				var geoLevelFilter = new Filter("PRODUCT_LEVEL",sap.ui.model.FilterOperator.EQ,productLevel);
				filterArray.push(geoLevelFilter);
				var sortArray = [];
				var sorter = new sap.ui.model.Sorter("PRODUCT_DESC",false);
				sortArray.push(sorter);
				// Get the Country dropdown list from the CODE_MASTER table
				this._oDataModel.read("/V_PRODUCT_ALL_LEVEL",{
						filters: filterArray,
						sorters: sortArray,
						async: false,
		                success: function(oData, oResponse){
		                	// add Please select item on top of the list
			                oData.results.unshift({	"PRODUCT_CODE":-1,
			              							"PRODUCT_DESC":"Select.."});
			                // Bind the Product data 
			                result =  oData.results;
		                },
		    		    error: function(){
	    		    		MessageBox.alert("Unable to retrieve dropdown values for Product Level Please contact System Admin.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
		            		result = [];
		    			}
		    	});
			}
			else
			{
			result = [];
			result.unshift({"PRODUCT_CODE":0,
			              		"PRODUCT_DESC":"ALL"});
			}
	    	return result;
		},
		disableControl:function(value){
			return !value;
		},
		enableControl : function(value){
			return !!value;
		},
		getDefaultPropertyValues : function(){
        	var geographyList = this._oAssignPeopleRuleViewModel.getProperty("/Geography");
        	if(geographyList !== undefined){
        		this._geographyList = geographyList.find(function(data){return data.LEVEL_ID === -1; });
        		if(this._geographyList === undefined){
        			this._geographyList = geographyList.find(function(data){return data.LEVEL_ID === 0; });
        		}
        	}
        	var productList = this._oAssignPeopleRuleViewModel.getProperty("/AssignPeopleRuleVM/Product");
        	if(productList !== undefined){
        		this._productList = productList.find(function(data){return data.PRODUCT_CODE === -1; });
        		if(this._productList === undefined){
        			this._productList = productList.find(function(data){return data.PRODUCT_CODE === 0; });
        		}
        	}
        },
        setDefaultValuesToGrid: function(){
        	var rows = this._oViewModelData.AssignPeopleRuleVM;
			// loop through each row and update the Quadrant, Channel and Marketing Flag property to default value for seeds
			for(var i = 0; i < rows.length; i++){
				rows[i] = this.setDefaultPropertyValues(rows[i]);
			}
			this._oAssignPeopleRuleViewModel.refresh();
        },
		
		setDefaultPropertyValues : function(obj){
			if(this._geographyList !== undefined){
				obj.LEVEL_ID = this._geographyList.LEVEL_ID;
				obj.NAME =  this._geographyList.NAME;
			}
			if(this._productList !== undefined){
				obj.PRODUCT_CODE = this._productList.PRODUCT_CODE;
				obj.PRODUCT_DESC = this._productList.PRODUCT_DESC;			
			}
			//
			// setting pople roles
			obj.DEMAND_MANAGER_ID = "-1";
			obj.DEMAND_MANAGER_NAME = " Select..";
			obj.GLOBAL_LEADER_ID = "-1";
			obj.GLOBAL_LEADER_NAME = " Select..";
			obj.MARKETING_DIRECTOR_ID = "-1";
			obj.MARKETING_DIRECTOR_NAME = " Select..";
			obj.MARKETING_MANAGER_ID = "-1";
			obj.MARKETING_MANAGER_NAME = " Select..";
			obj.MASTER_PLANNER_ID = "-1";
			obj.MASTER_PLANNER_NAME = " Select..";
			obj.PRODUCT_MANAGER_ID = "-1";
			obj.PRODUCT_MANAGER_NAME = " Select..";
			obj.REGIONAL_SUPPLY_CHAIN_MANAGER_ID = "-1";
			obj.REGIONAL_SUPPLY_CHAIN_MANAGER_NAME = " Select..";
			obj.SUPPLY_CHAIN_MANAGER_ID = "-1";
			obj.SUPPLY_CHAIN_MANAGER_NAME = " Select..";
			obj.SUPPLY_CHAIN_PLANNING_SPECIALIST_ID = "-1";
			obj.SUPPLY_CHAIN_PLANNING_SPECIALIST_NAME = " Select..";
        	return obj;
        },
		
		onRemoveRow:function(oEvent){
			this._isChanged = true;
			// Get the object to be deleted from the event handler
			var entryToDelete = oEvent.getSource().getBindingContext().getObject();
			// Get the # of rows in the VM, (this includes the dropdown objects such as Country, Currency, etc..)
			var rows = this._oViewModelData.AssignPeopleRuleVM;
			
			// loop through each row and check whether the passed object = the row object
			for(var i = 0; i < rows.length; i++){
				if(rows[i] === entryToDelete )
				{
					// found a match, remove this row from the data
					rows.splice(i,1);
					// refresh the AssignRuleVM VM, this will automatically update the UI
					this._oAssignPeopleRuleViewModel.refresh();
					break;
				}
			}
		},
		
		
		onAddRow:function(oEvent){
			var path = oEvent.getSource().getBindingContext().getPath();
			 var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
		    // create new empty rule object
		    if(selectedRulekey !== "-1"){
		    	//subRCU = this.getSubRCUDropDown(null);
		    }
		    var obj = {
			    		LEVEL_ID : -1,
			    		geographyErrorState : "None",
			    		PRODUCT_CODE : -1,
			    		productErrorState : "None",
			    		DEMAND_MANAGER_ID : -1,
			    		demandManagerErrorState : "None",
			    		GLOBAL_LEADER_ID : -1,
			    		globalLeaderErrorState : "None",
			    		MARKETING_DIRECTOR_ID : -1,
			    		marketingDirectorErrorState : "None",
			    		MARKETING_MANAGER_ID : -1,
			    		marketingManagerErrorState : "None",
			    		MASTER_PLANNER_ID : -1,
			    		masterPlannerErrorState : "None",
			    		PRODUCT_MANAGER_ID : -1,
			    		productManagerErrorState : "None",
			    		REGIONAL_SUPPLY_CHAIN_MANAGER_ID : -1,
			    		regionalSupplyChainMangerErrorState : "None",
			    		SUPPLY_CHAIN_MANAGER_ID : -1,
			    		supplyChainManagerErrorState : "None",
			    		SUPPLY_CHAIN_PLANNING_SPECIALIST_ID : -1,
			    		supplyChainPlanningSpecialistErrorState : "None",	
			    		createNew : false,
			    		isError :false
		    		};
		   
	    	if (selectedRulekey !== "-1") // added this cond to show default values only if valid rule set is selected
	    	{
	    		obj = this.setDefaultPropertyValues(obj);
	    	}
	    	this._oAssignPeopleRuleViewModel.setProperty(path, obj);
	    	this.addEmptyObject();	
		},
		getPeopleRoleDropDown : function (roleName) {
			var result;
			// Create a filter & sorter array
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("USER_NAME",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/V_USER_BY_PEOPLE_ROLE",{
					sorters: sortArray,
					filters: [ 
								new Filter("USER_ROLE", FilterOperator.EQ, roleName)
							],
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"USER_ID":"-1",
		              							"USER_NAME":" Select.."});
		                // Bind the RCU  data 
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for People Roles Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		// This function loops through all the rows on the form and checks each input to see if it is filled in
        validateTextFieldValues :function () {
    		
        	var returnValue = true;
        	var data = this._oViewModelData.AssignPeopleRuleVM;
            for(var i = 0; i < data.length - 1; i++) 
            {
            	if(this.checkForEmptyFields(data[i]))
            	{
            		data[i].isError = true;
            		if(data[i].errorSummary !== "")
	                {
	                	data[i].errorSummary += "\n";  
	                }
	            	data[i].errorSummary += "Please enter all mandatory fields highlighted in red.";
	            	returnValue = false;
            	}
            }
            return returnValue;
        },
        // method to check for duplicate Rule Set, Geography, Product
        validateUniqueRules : function (){
            // loop through the rows and for each row check for duplicate entry in DB
            var isDuplicate = false;
            var data = this._oViewModelData.AssignPeopleRuleVM;
	        // need to pass the above array to the DB to get the duplicate records
	        var viewpath = "V_PEOPLE_RULE";
	        var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
            if (selectedRulekey !== "-1")
	        {
	        	var userFilter = new Filter({
                    filters : filter,
                        and : false
                    });
                var peopleRuleFilter =[];
                peopleRuleFilter.push(new Filter("PEOPLE_RULESET_SEQ",sap.ui.model.FilterOperator.EQ,selectedRulekey));
                peopleRuleFilter.push(userFilter);
                var mainFilter = new Filter({
                	filters : peopleRuleFilter,
                	and:true
                });
				var ruleSetRecords = DataContext.getPeopleRulesFromDB(viewpath, mainFilter); 
				for(var i = 0; i < data.length - 1; i++) {
					var geoLevelId;
					if(parseInt(data[i].LEVEL_ID,10) === 0){
						geoLevelId = null;
					}
					else{
						geoLevelId = parseInt(data[i].LEVEL_ID,10);
					}
					var productCode;
					if (data[i].PRODUCT_CODE === 0 ) {
                    	productCode = null;
                    }
                    else {
                    	productCode = data[i].PRODUCT_CODE;
                    }
                    //
					// loop the Rule Set Records from DB to check Unique
					for(var k = 0; k < ruleSetRecords.length; k++) {
						// check if Rule already exists in system
						if (geoLevelId === ruleSetRecords[k].GEO_LEVEL_ID && productCode === ruleSetRecords[k].PRODUCT_CODE) {
							isDuplicate = true;
							data[i].isError = true;
							data[i].geographyErrorState = "Error";
							data[i].productErrorState = "Error";
						if(data[i].errorSummary !== "") {
								data[i].errorSummary += "\n";  
							}
							data[i].errorSummary += "Rule Combination already exists in the system.";
						}
						else {
							continue;
						}
					}
				}
			}
            this._oAssignPeopleRuleViewModel.refresh();
            return isDuplicate;
        },
        // function to check whether the user has entered a duplicate RuleSet/Geography,Product on the form
        validateDuplicateEntries :function(){
	        var returnValue = true;
	        var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
	        if (selectedRulekey !== "-1")
	        {
		        var data = this._oViewModelData.AssignPeopleRuleVM;
		        for(var i = 0; i < data.length - 1; i++) 
		        {
		            for( var j = i + 1; j < data.length - 1; j++)
		            { 
			            if((parseInt(data[i].LEVEL_ID,10) !== -1 &&  parseInt(data[j].LEVEL_ID,10) !== -1) && (data[i].PRODUCT_CODE !== -1 &&  data[j].PRODUCT_CODE !== -1) && (parseInt(data[i].LEVEL_ID,10) === parseInt(data[j].LEVEL_ID,10)) && (data[i].PRODUCT_CODE ===  data[j].PRODUCT_CODE))
			            {
			            	// highlight the geography and product boxed in red
			            	 data[i].isError = true;
			            	 data[i].geographyErrorState = "Error";
			            	 data[i].productErrorState = "Error";
			            	 data[j].isError = true;
			            	 data[j].geographyErrorState = "Error";
			            	 data[j].productErrorState = "Error";
			            	 
			            	 if(data[i].errorSummary !== "")
		                	 {
		                		data[i].errorSummary += "\n";  
		                	 }
		            		 data[i].errorSummary += "Duplicate RuleSet/Geography/Product Combination found at row # " + (j + 1);
		            		 
		            		 if(data[j].errorSummary !== "")
		                	 {
		                		data[j].errorSummary += "\n";  
		                	 }
		            		 data[j].errorSummary += "Duplicate RuleSet/Geography/Product Combination found at row # " + (i + 1);
		            		 
			            	 returnValue = false;
			            }
		            } 
		        }
	        }
	        return returnValue;
        },
        // This functions takes one row and check each field to see if it is filled in, if not -> highlight in red
        checkForEmptyFields: function (row) {
        	var errorsFound = false;
        	var strValidate = this._oi18nModel.getProperty("validation");
			if (this.checkEmptyRows(row,strValidate) === false)
			{
				return errorsFound;
			}
            if(parseInt(row.LEVEL_ID,10) === -1)
            {
            	row.geographyErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.PRODUCT_CODE,10) === -1)
            {
            	row.productErrorState = "Error";
            	errorsFound = true;
            }
            return errorsFound;
        },
         resetValidationForModel : function () {
        	var data = this._oViewModelData.AssignPeopleRuleVM;
            for(var i = 0; i < data.length - 1; i++) 
            {	
            	data[i].isError = false;
            	data[i].errorSummary = "";
            	data[i].geographyErrorState = "None";
            	data[i].productErrorState = "None";
            	data[i].demandManagerErrorState = "None";
				data[i].globalLeaderErrorState = "None";
				data[i].marketingDirectorErrorState = "None";
				data[i].marketingManagerErrorState = "None";
				data[i].masterPlannerErrorState = "None";
				data[i].productManagerErrorState = "None";
				data[i].regionalSupplyChainMangerErrorState = "None";
				data[i].supplyChainManagerErrorState = "None";
				data[i].supplyChainPlanningSpecialistErrorState = "None";
            }
            this._oAssignPeopleRuleViewModel.refresh();
        },
		showErrorMessage: function(oEvent)
        {
		    var text = oEvent.getSource().data("text");
		         MessageBox.alert(text, {
			     icon : MessageBox.Icon.ERROR,
			title : "Invalid Input"
			       });
        },
        //
        // function to check at least one rule is selected or not
        checkAtleastOnePeopleAssigned : function(){
        	var returnValue = true;
			var AssignPeopleRule = this._oViewModelData.AssignPeopleRuleVM;	
			for(var i = 0; i < AssignPeopleRule.length - 1; i++){
				if(parseInt(AssignPeopleRule[i].LEVEL_ID,10) !== -1 && parseInt(AssignPeopleRule[i].PRODUCT_CODE,10) !== -1){
					if(parseInt(AssignPeopleRule[i].DEMAND_MANAGER_ID,10) === -1 && 
						parseInt(AssignPeopleRule[i].GLOBAL_LEADER_ID,10) === -1 && 
						parseInt(AssignPeopleRule[i].MARKETING_DIRECTOR_ID,10) === -1 && 
						parseInt(AssignPeopleRule[i].MARKETING_MANAGER_ID,10) === -1 && 
						parseInt(AssignPeopleRule[i].MASTER_PLANNER_ID,10) === -1 && 
						parseInt(AssignPeopleRule[i].PRODUCT_MANAGER_ID,10) === -1 && 
						parseInt(AssignPeopleRule[i].REGIONAL_SUPPLY_CHAIN_MANAGER_ID,10) === -1 && 
						parseInt(AssignPeopleRule[i].SUPPLY_CHAIN_MANAGER_ID,10) === -1 && 
						parseInt(AssignPeopleRule[i].SUPPLY_CHAIN_PLANNING_SPECIALIST_ID,10) === -1)
					{
							AssignPeopleRule[i].isError = true;
							AssignPeopleRule[i].demandManagerErrorState = "Error";
							AssignPeopleRule[i].globalLeaderErrorState = "Error";
							AssignPeopleRule[i].marketingDirectorErrorState = "Error";
							AssignPeopleRule[i].marketingManagerErrorState = "Error";
							AssignPeopleRule[i].masterPlannerErrorState = "Error";
							AssignPeopleRule[i].productManagerErrorState = "Error";
							AssignPeopleRule[i].regionalSupplyChainMangerErrorState = "Error";
							AssignPeopleRule[i].supplyChainManagerErrorState = "Error";
							AssignPeopleRule[i].supplyChainPlanningSpecialistErrorState = "Error";
							 if(AssignPeopleRule[i].errorSummary !== "")
		                	 {
		                		AssignPeopleRule[i].errorSummary += "\n";  
		                	 }
							AssignPeopleRule[i].errorSummary += "Assign at least one role";
							returnValue = false;
					}
				}
			}
			return returnValue;
        },
         // below function will check if anything is changed  or modified in submission page
         chkIsModified: function() {
        	var AssignPeopleRule = this._oAssignPeopleRuleViewModel.getProperty("/AssignPeopleRuleVM");
        	var isModified = false;
        	var rcuModel = this._oModel.getProperty("/RuleSet");
        	 var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
        	 var productLevel = rcuModel.find(function(data) {return data.PEOPLE_RULESET_SEQ == selectedRulekey;}).PRODUCT_LEVEL;
        	 var geoLevel = rcuModel.find(function(data) {return data.PEOPLE_RULESET_SEQ == selectedRulekey;}).GEO_LEVEL;
	        if (productLevel !== null)
	        { // for Product level which is not ALL
	        	// loop through the rows and for each row check if is anything is modified or changed
		    		for(var i = 0; i < AssignPeopleRule.length - 1; i++) 
		    		{ 
		    			if (geoLevel !== null)
				    		{
				    			var objgeo;
				    			if (parseInt(AssignPeopleRule[i].LEVEL_ID,10) !== -1)
				    			{
				    				objgeo = true;
				    			}
				    		}
				    		else
				    		{
				    			if (parseInt(AssignPeopleRule[i].LEVEL_ID,10) !== 0)
				    			{
				    				objgeo = true;
				    			}
				    		}
			        			if (objgeo 
			        			|| (parseInt(AssignPeopleRule[i].PRODUCT_CODE,10) !== -1)
			        		    ||(parseInt(AssignPeopleRule[i].DEMAND_MANAGER_ID,10) !== -1) 
			        		    || (parseInt(AssignPeopleRule[i].GLOBAL_LEADER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[i].MARKETING_DIRECTOR_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[i].MARKETING_MANAGER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[i].MASTER_PLANNER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[i].PRODUCT_MANAGER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[i].REGIONAL_SUPPLY_CHAIN_MANAGER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[i].SUPPLY_CHAIN_MANAGER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[i].SUPPLY_CHAIN_PLANNING_SPECIALIST_ID,10) !== -1))
			        		     {
			        		    	isModified = true;
			        		    	break;
			        		     }
		    			}
	        }
	        else
	        { //for Product level which is not ALL
	        	// loop through the rows and for each row check if is anything is modified or changed
		    		for(var j = 0; j < AssignPeopleRule.length - 1; j++) 
		    		{   
		    			if (geoLevel !== null)
				    		{
				    			var objgeo1;
				    			if (parseInt(AssignPeopleRule[j].LEVEL_ID,10) !== -1)
				    			{
				    				objgeo1 = true;
				    			}
				    		}
				    		else
				    		{
				    			if (parseInt(AssignPeopleRule[j].LEVEL_ID,10) !== 0)
				    			{
				    				objgeo1 = true;
				    			}
				    		}
			        			if (objgeo1
			        			|| (parseInt(AssignPeopleRule[j].PRODUCT_CODE,10) !== 0)
			        		    || (parseInt(AssignPeopleRule[j].DEMAND_MANAGER_ID,10) !== -1) 
			        		    || (parseInt(AssignPeopleRule[j].GLOBAL_LEADER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[j].MARKETING_DIRECTOR_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[j].MARKETING_MANAGER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[j].MASTER_PLANNER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[j].PRODUCT_MANAGER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[j].REGIONAL_SUPPLY_CHAIN_MANAGER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[j].SUPPLY_CHAIN_MANAGER_ID,10) !== -1)
			        		    || (parseInt(AssignPeopleRule[j].SUPPLY_CHAIN_PLANNING_SPECIALIST_ID,10) !== -1))
			        		     {
			        		    	isModified = true;
			        		    	break;
			        		     }

		    			}
	        	
	        }
            	
		    		return isModified;
        },
		//
		// Submit function
		onSubmit : function(){
			var errorCount = 0;
            var successCount = 0;
            // reset the error message property to false before doing any validation
			this.resetValidationForModel();
            var AssignPeopleRule = this._oAssignPeopleRuleViewModel.getProperty("/AssignPeopleRuleVM");
            // current limit for saving is 200 records
            // check if Rule Submission Grid  has more than 200 records
            // if more than 200 than show a validation message to user
            var maxLimitSubmit = parseInt(this._oi18nModel.getProperty("MaxLimit"),10);
            var RulesMaxLimitSubmit = this._oi18nModel.getProperty("MaxLimitSubmit.text");
			if (AssignPeopleRule.length > (maxLimitSubmit)) {
                MessageBox.alert(RulesMaxLimitSubmit,{
                	icon : MessageBox.Icon.ERROR,
                    title : "Error"});
                return;
            }
            //
            // validation for Rule Set
            var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
			if (selectedRulekey === "-1"){
				MessageBox.alert("Please select rule set.", {
					icon : MessageBox.Icon.ERROR,
                    title : "Invalid Input"});
                return;
			}
			//
			// Check at leat one rule is entered
			if (AssignPeopleRule.length === 1 || this.chkIsModified() === false){
				MessageBox.alert("Please enter at least one rule.", {
					icon : MessageBox.Icon.ERROR,
                    title : "Invalid Input"});
                return;
            }
            // reset error on page to false
            this._oAssignPeopleRuleViewModel.setProperty("/ErrorOnPage",false);
            //open busy dialog
            this._busyDialog.open();
            // 
            // need to declare local this variable to call global functions in the timeout function
            var t = this;
            // 
            // setting timeout function in order to show the busy dialog before doing all the validation
            setTimeout(function(){
				if (t.validateTextFieldValues() === false){
					// Set error message column to false (not visible by default)
					t._oAssignPeopleRuleViewModel.setProperty("/ErrorOnPage",true);
		        }
		        // Rule Set, geography and product should be unique
		        // check duplicate entries in the system
		        if(t.validateUniqueRules() === true) {
					t._oAssignPeopleRuleViewModel.setProperty("/ErrorOnPage",true);
				}
		        // check for duplicate entries on the page
				if (t.validateDuplicateEntries() === false){
					t._oAssignPeopleRuleViewModel.setProperty("/ErrorOnPage",true);
				}
				//
				if(t.checkAtleastOnePeopleAssigned() === false){
					t._oAssignPeopleRuleViewModel.setProperty("/ErrorOnPage",true);
				}
				//
				// After all validation inserting to the table
                if(!t._oAssignPeopleRuleViewModel.getProperty("/ErrorOnPage")){
					// 
					// Check validations here 
					var tablePath = "/MST_PEOPLE_RULE";
					// Create current timestamp
					var oDate = new Date();                
					var ruleSetSeq = t._oViewModelData.PEOPLE_RULESET_SEQ;
					var strSubmission = t._oi18nModel.getProperty("submission");
					for(var i = 0; i < AssignPeopleRule.length - 1; i++) {
						if(t.checkEmptyRows(AssignPeopleRule[i],strSubmission) === true) {
							var productLevelCode;
							var geoLevelValId;
							var demandManagerID;
							var globalLeaderID;
							var marketingDirectorID;
							var marketingManagerID;
							var masterPlannerID;
							var productManagerID;
							var regionalsupplychainManagerID;
							var supplychainmanagerID;
							var supplychainplanningSpecialistID;
							geoLevelValId = parseInt(AssignPeopleRule[i].LEVEL_ID,10);
							// if(parseInt(AssignPeopleRule[i].LEVEL_ID,10) === 0){
							// 	geoLevelValId = '0';
							// }
							// else{
							// 	geoLevelValId = parseInt(AssignPeopleRule[i].LEVEL_ID,10);
							// }
							if (AssignPeopleRule[i].PRODUCT_CODE === 0 ) {
								productLevelCode = '';
							}
							else{
								productLevelCode = AssignPeopleRule[i].PRODUCT_CODE;
							}
							// Based on permissions assign values
							if(parseInt(AssignPeopleRule[i].DEMAND_MANAGER_ID,10) === -1){
								demandManagerID = '';
							}
							else {
								demandManagerID = AssignPeopleRule[i].DEMAND_MANAGER_ID;
							}
							if(parseInt(AssignPeopleRule[i].GLOBAL_LEADER_ID,10) === -1){
								globalLeaderID = '';
							}
							else{
								globalLeaderID = AssignPeopleRule[i].GLOBAL_LEADER_ID;
							}
							if(parseInt(AssignPeopleRule[i].MARKETING_DIRECTOR_ID,10) === -1){
								marketingDirectorID = '';
							}
							else{
								marketingDirectorID = AssignPeopleRule[i].MARKETING_DIRECTOR_ID;
							}
							if(parseInt(AssignPeopleRule[i].MARKETING_MANAGER_ID,10) === -1){
								marketingManagerID = '';
							}
							else{
								marketingManagerID = AssignPeopleRule[i].MARKETING_MANAGER_ID;
							}
							if(parseInt(AssignPeopleRule[i].MASTER_PLANNER_ID,10) === -1){
								masterPlannerID = '';
							}
							else{
								masterPlannerID = AssignPeopleRule[i].MASTER_PLANNER_ID;
							}
							if(parseInt(AssignPeopleRule[i].PRODUCT_MANAGER_ID,10) === -1){
								productManagerID = '';
							}
							else{
								productManagerID = AssignPeopleRule[i].PRODUCT_MANAGER_ID;
							}
							if(parseInt(AssignPeopleRule[i].REGIONAL_SUPPLY_CHAIN_MANAGER_ID,10) === -1){
								regionalsupplychainManagerID = '';
							}
							else{
								regionalsupplychainManagerID = AssignPeopleRule[i].REGIONAL_SUPPLY_CHAIN_MANAGER_ID;
							}
							if(parseInt(AssignPeopleRule[i].SUPPLY_CHAIN_MANAGER_ID,10) === -1){
								supplychainmanagerID = '';
							}
							else {
								supplychainmanagerID = AssignPeopleRule[i].SUPPLY_CHAIN_MANAGER_ID;
							}
							if(parseInt(AssignPeopleRule[i].SUPPLY_CHAIN_PLANNING_SPECIALIST_ID,10) === -1){
								supplychainplanningSpecialistID = '';
							}
							else {
								supplychainplanningSpecialistID = AssignPeopleRule[i].SUPPLY_CHAIN_PLANNING_SPECIALIST_ID;
							}
							//
							var newPeopleAssignRule = {
								PEOPLE_RULE_ID: 1,
                                PEOPLE_RULESET_SEQ : ruleSetSeq,
                                GEO_LEVEL_VAL_ID : geoLevelValId,
                                PRODUCT_LEVEL_VAL_CODE : productLevelCode,
                                MARKETING_MANAGER_ID : marketingManagerID,
                                MARKETING_DIRECTOR_ID : marketingDirectorID,
                                DEMAND_MANAGER_ID : demandManagerID,
                                GLOBAL_BUSINESS_LEADER_ID : globalLeaderID,
                                SUPPLY_CHAIN_PLANNING_SPECIALIST_ID : supplychainplanningSpecialistID,
                                MARKETING_SPECIALIST_ID : productManagerID,
                                GLOBAL_SUPPLY_CHAIN_MANAGER_ID : supplychainmanagerID,
                                REG_SUPPLY_CHAIN_MANAGER_ID : regionalsupplychainManagerID,
                                MASTER_PLANNER_ID : masterPlannerID,
                                VALID_FLAG : "T",
                                CREATED_ON : oDate,
                                CREATED_BY : loggedInUserID
							};
                            t._oDataModel.create(tablePath, newPeopleAssignRule,{
								success: function(){
									successCount++;
								},
								error: function(err){
									errorCount++;
								}
							});                                                                                           
                        }
					}
					//Show success or error message
					if(errorCount === 0) {
						var oRouter = t.getRouter();
						// once insertion is success, navigate to homepage
						MessageBox.alert("You have successfully submitted " + successCount + " Rule(s)",{
							icon : MessageBox.Icon.SUCCESS,
							title : "Success",
							onClose: function() {
								oRouter.navTo("peopleAssignment");
					        }
						});
		    		}
					else
					{
						MessageBox.alert("Error: There is an entry error on the page. Please correct.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
							});
					}
				}
				else
				{
	        		MessageBox.alert("Error: There is an entry error on the page. Please correct.",
							{
								icon : MessageBox.Icon.ERROR,
								title : "Error"
						});
	        	}
				// close busy dialog
				t._busyDialog.close();
            },500); // end of timeout function
    	},
		checkEmptyRows : function(row,strtype){
			var errorsFound = false;
			var data = this._oViewModelData.AssignPeopleRuleVM;
			//below check needs to be performed if we have more than one row, if only one row in grid no need to check
			//	dont validate the fields if nothing is changed for the row, i.e. user does not wnat to enter any data
			if ((data.length >= 2) && (this._isChanged === true)){
				if ((parseInt(row.LEVEL_ID,10) === -1 || parseInt(row.LEVEL_ID,10) === 0) && 
					(parseInt(row.PRODUCT_CODE,10) === -1 || parseInt(row.PRODUCT_CODE,10) === 0) && 
					(parseInt(row.DEMAND_MANAGER_ID,10) === -1)	&& (parseInt(row.GLOBAL_LEADER_ID,10) === -1) && 
					(parseInt(row.MARKETING_DIRECTOR_ID,10) === -1) && (parseInt(row.MARKETING_MANAGER_ID,10) === -1) && 
					(parseInt(row.MASTER_PLANNER_ID,10) === -1) && (parseInt(row.PRODUCT_MANAGER_ID,10) === -1) && 
					(parseInt(row.REGIONAL_SUPPLY_CHAIN_MANAGER_ID,10) === -1) && (parseInt(row.SUPPLY_CHAIN_MANAGER_ID,10) === -1) && 
					(parseInt(row.SUPPLY_CHAIN_PLANNING_SPECIALIST_ID,10) === -1)) {
						errorsFound = false;
						return errorsFound;
				}
				else {
					if (strtype === "Submission")
						return true;
				}
			}
        },
		//cancel click on Add CU Rules page
		onCancel: function(){
			var curr = this;
			MessageBox.confirm("Are you sure you want to cancel your changes and navigate back to the previous page?", {
				icon: sap.m.MessageBox.Icon.WARNING,
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function(oAction) {
					if(oAction === "YES"){
						curr.getOwnerComponent().getRouter().navTo("peopleAssignment");
					}
	           	}
			});			
		},
		//
		getAllUsers : function(){
           	var result;
			// Create a filter & sorter array
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("USER_NAME",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/USER",{
					sorters: sortArray,
					filters: [ 
								new Filter("VALID_FLAG", FilterOperator.EQ, "T")
							],
					async: false,
	                success: function(oData, oResponse){
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for People Roles Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		onSearch:function(oEvent){
			var entryToSearch = oEvent.getSource().getBindingContext().getObject();
			if(entryToSearch.PRODUCT_CODE !== -1 && entryToSearch.LEVEL_ID !== -1){
				this._selectedRow = oEvent.getSource().getBindingContext().getObject();
				this._searchRow = entryToSearch;
				if(oEvent.getSource().getId().indexOf("btnSearchDemandManger") > 0){
					this._searchColumn = "DemandManager";
				}
				else if(oEvent.getSource().getId().indexOf("btnSearchGlobalLeader") > 0){
					this._searchColumn = "GlobalLeader";
				}
				else if(oEvent.getSource().getId().indexOf("btnSearchMarketingDirector") > 0){
					this._searchColumn = "MarketingDirector";
				}
				else if(oEvent.getSource().getId().indexOf("btnSearchMarketingManager") > 0){
					this._searchColumn = "MarketingManager";
				}
				else if(oEvent.getSource().getId().indexOf("btnSearchMasterPlanner") > 0){
					this._searchColumn = "MasterPlanner";
				}
				else if(oEvent.getSource().getId().indexOf("btnSearchProductManager") > 0){
					this._searchColumn = "ProductManager";
				}
				else if(oEvent.getSource().getId().indexOf("btnSearchRegSupplyChainManager") > 0){
					this._searchColumn = "RegSupplyChainManager";
				}
				else if(oEvent.getSource().getId().indexOf("btnSupplyChainManager") > 0){
					this._searchColumn = "SupplyChainManager";
				}
				else if(oEvent.getSource().getId().indexOf("btnSupplyChainPlanningSpecialist") > 0){
					this._searchColumn = "SupplyChainPlanningSpecialist";
				}

				if(!this._Dialog){
					this._oDialog = sap.ui.xmlfragment("bam.view.SearchUser", this);
					this._oDialog.setModel(this.getView().getModel());
						
				}
				this._oDialog.setMultiSelect(false);
				// clear the old search filter
				this._oDialog.getBinding("items").filter([]);
	
				// toggle compact style
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
				this._oDialog.open();
			}
			else{
				MessageBox.alert("Select Geography and Product before searching the user",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
			}
		},
		handleSearch : function(oEvent){
			var sValue = oEvent.getParameter("value");
			var oFilter = [];
			oFilter.push(new Filter("USER_NAME", sap.ui.model.FilterOperator.Contains, sValue));
			oFilter.push(new Filter("USER_ID", sap.ui.model.FilterOperator.Contains, sValue));
			 var mainFilter = new Filter({
                	filters : oFilter,
                	and:false
                });
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([mainFilter]);
		},
		handleClose : function(oEvent){
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var selectedUser = [];
				aContexts.map(function(oContext) { selectedUser.push(oContext.getObject()); });
				var rows = this._oViewModelData.AssignPeopleRuleVM;
				var oFilter = [];
				var selectedDropDown;
				if(this._searchColumn === "DemandManager"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.DemandManager;
				}
				else if(this._searchColumn === "GlobalLeader"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.GlobalLeader;
				}
				else if(this._searchColumn === "MarketingDirector"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.MarketingDirector;
				}
				else if(this._searchColumn === "MarketingManager"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.MarketingManager;
				}
				else if(this._searchColumn === "MasterPlanner"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.MasterPlanner;
				}
				else if(this._searchColumn === "ProductManager"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.ProductManager;
				}
				else if(this._searchColumn === "RegSupplyChainManager"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.RegSupplyChainManager;
				}
				else if(this._searchColumn === "SupplyChainManager"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.SupplyChainManager;
				}
				else if(this._searchColumn === "SupplyChainPlanningSpecialist"){
					selectedDropDown = this._oViewModelData.AssignPeopleRuleVM.SupplyChainPlanningSpecialist;
				}
				
				for(var j =0 ; j< selectedUser.length; j++){
					if(selectedDropDown.find(function(x) {if(x.USER_ID === selectedUser[j].USER_ID){return x ;}}) === undefined){
						selectedDropDown.push({USER_ID : selectedUser[j].USER_ID, USER_NAME : selectedUser[j].USER_NAME});
					}
					selectedDropDown.sort(function(x, y){
						return(x.USER_NAME > y.USER_NAME) ? 1 : -1;
					});
					this._oModel.setProperty("/AssignPeopleRuleVM/DemandManager", selectedDropDown);
				}
				for(var i = 0; i < rows.length; i++){
					if(rows[i] === this._selectedRow){
						if(this._searchColumn === "DemandManager"){
							rows[i].DEMAND_MANAGER_ID = selectedUser[0].USER_ID;
							rows[i].DEMAND_MANAGER_NAME = selectedUser[0].USER_NAME;
						}
						else if(this._searchColumn === "GlobalLeader"){
							rows[i].GLOBAL_LEADER_ID = selectedUser[0].USER_ID;
							rows[i].GLOBAL_LEADER_NAME = selectedUser[0].USER_NAME;
						}
						else if(this._searchColumn === "MarketingDirector"){
							rows[i].MARKETING_DIRECTOR_ID = selectedUser[0].USER_ID;
							rows[i].MARKETING_DIRECTOR_NAME = selectedUser[0].USER_NAME;
						}
						else if(this._searchColumn === "MarketingManager"){
							rows[i].MARKETING_MANAGER_ID = selectedUser[0].USER_ID;
							rows[i].MARKETING_MANAGER_NAME = selectedUser[0].USER_NAME;
						}
						else if(this._searchColumn === "MasterPlanner"){
							rows[i].MASTER_PLANNER_ID = selectedUser[0].USER_ID;
							rows[i].MASTER_PLANNER_NAME = selectedUser[0].USER_NAME;
						}
						else if(this._searchColumn === "ProductManager"){
							rows[i].PRODUCT_MANAGER_ID = selectedUser[0].USER_ID;
							rows[i].PRODUCT_MANAGER_NAME = selectedUser[0].USER_NAME;
						}
						else if(this._searchColumn === "RegSupplyChainManager"){
							rows[i].REGIONAL_SUPPLY_CHAIN_MANAGER_ID = selectedUser[0].USER_ID;
							rows[i].REGIONAL_SUPPLY_CHAIN_MANAGER_NAME = selectedUser[0].USER_NAME;
						}
						else if(this._searchColumn === "SupplyChainManager"){
							rows[i].SUPPLY_CHAIN_MANAGER_ID = selectedUser[0].USER_ID;
							rows[i].SUPPLY_CHAIN_MANAGER_NAME = selectedUser[0].USER_NAME;
						}
						else if(this._searchColumn === "SupplyChainPlanningSpecialist"){
							rows[i].SUPPLY_CHAIN_PLANNING_SPECIALIST_ID = selectedUser[0].USER_ID;
							rows[i].SUPPLY_CHAIN_PLANNING_SPECIALIST_NAME = selectedUser[0].USER_NAME;
						}
						break;
					}
				}
			} 
			oEvent.getSource().getBinding("items").filter();
			this._oAssignPeopleRuleViewModel.refresh();
		}
	});
	});