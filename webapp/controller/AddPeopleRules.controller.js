sap.ui.define(["sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/core/routing/History"
		], function(Controller,DataContext,MessageToast,MessageBox,ResourceModel,Filter,History) {
	"use strict";
  	var loggedInUserID;
	var firstTimePageLoad = true;
	var demandManagerAssigner;
	var globalLeaderAssigner;
	var marketingDirectorAssigner;
	var marketingManagerAssigner;
	var masterPlannerAssigner;
	var productManagerAssigner;
	var regulatorSupplyChainManagerAssigner;
	var supplyChainManagerAssigner;
    var supplyChainPlanningSpecialistAssigner;
	var permissions;    
	var showDemandManager = false;
	var showGlobalLeader = false;
	var showMarketingDirector = false; 
	var showMarketingManger = false;
	var showMasterPlanner = false;
	var showProductManager = false;
	var showRegulatorySupplychainManager = false;
	var showSupplyChainManager= false; 
	var showSupplyChainPlanningSpecialist = false;
	return Controller.extend("bam.controller.AddPeopleRules", {
		// Init function
		onInit: function() {
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();
			 // define a global variable for the oData model		    
			var oView = this.getView();
			oView.setModel(this.getOwnerComponent().getModel());
			// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");			
	    	//
	    	// checking the permission
			demandManagerAssigner = this._oi18nModel.getProperty("Module.demandManagerAssigner");
	        globalLeaderAssigner = this._oi18nModel.getProperty("Module.globalLeaderAssigner");
	        marketingDirectorAssigner = this._oi18nModel.getProperty("Module.marketingDirectorAssigner");
	        marketingManagerAssigner = this._oi18nModel.getProperty("Module.marketingManagerAssigner");
	        masterPlannerAssigner = this._oi18nModel.getProperty("Module.masterPlannerAssigner");
	        productManagerAssigner = this._oi18nModel.getProperty("Module.productManagerAssigner");
	        regulatorSupplyChainManagerAssigner = this._oi18nModel.getProperty("Module.regulatorSupplyChainManagerAssigner");
	        supplyChainManagerAssigner = this._oi18nModel.getProperty("Module.supplyChainManagerAssigner");
	        supplyChainPlanningSpecialistAssigner = this._oi18nModel.getProperty("Module.supplyChainPlanningSpecialistAssigner");			
			permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if((permissions[i].ATTRIBUTE === demandManagerAssigner ||
					  permissions[i].ATTRIBUTE === globalLeaderAssigner ||
					  permissions[i].ATTRIBUTE === marketingDirectorAssigner ||
					  permissions[i].ATTRIBUTE === marketingManagerAssigner ||
					  permissions[i].ATTRIBUTE === masterPlannerAssigner ||
					  permissions[i].ATTRIBUTE === productManagerAssigner ||
					  permissions[i].ATTRIBUTE === regulatorSupplyChainManagerAssigner ||
					  permissions[i].ATTRIBUTE === supplyChainManagerAssigner ||
					  permissions[i].ATTRIBUTE === supplyChainPlanningSpecialistAssigner) && (
					  	permissions[i].ACTION === "ADD" || permissions[i].ACTION === "EDIT"
					  	)
					  )
				{
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
					if(permissions[i].ATTRIBUTE === regulatorSupplyChainManagerAssigner){
						showRegulatorySupplychainManager = true;	
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
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "peopleAssignment"
				});					
			}
			else{
				this._isChanged = false;
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
			    		"REGULATORY_SUPPLY_CHAIN_MANAGER_ID" : -1,
			    		"regulatorySupplyChainMangerErrorState" : "None",
			    		"SUPPLY_CHAIN_MANAGER_ID" : -1,
			    		"supplyChainManagerErrorState" : "None",
			    		"SUPPLY_CHAIN_PLANNING_SPECIALIST_ID" : -1,
			    		"supplyChainPlanningSpecialistErrorState" : "None",
			    		"createNew" : false,
			    		"isError" :false
			    	});
			    }
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
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showDemandManager", showDemandManager);
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showGlobalLeader",showGlobalLeader);
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showMarketingDirector",showMarketingDirector);
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showMarketingManger",showMarketingManger);
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showMasterPlanner",showMasterPlanner);
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showProductManager",showProductManager);
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showRegulatorySupplychainManager",showRegulatorySupplychainManager);
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showSupplyChainManager",showSupplyChainManager);
		    	this._oModel.setProperty("/AssignPeopleRuleVM/showSupplyChainPlanningSpecialist",showSupplyChainPlanningSpecialist);
		    	//
		    	if (!this._busyDialog) 
				{
					this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
					this.getView().addDependent(this._dialog);
				}
				// set all the dropdowns, get the data from the code master table
				// default load
				this._oModel.setProperty("/AssignPeopleRuleVM/RuleSet",this.getRulesDropDown());
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
			// Create a filter & sorter array

			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("PEOPLE_RULESET_SEQ",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_PEOPLE_RULESET",{
					async: false,
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
			//this.resetValidationForModel();
			var sourceControl = oEvent.getSource();
			// get the selected value
			var selectedRulekey = sourceControl.getSelectedItem().getKey();
			var rcuModel = this._oModel.getProperty("/AssignPeopleRuleVM/RuleSet");
			var geoLevel = rcuModel.find(function(data) {return data.PEOPLE_RULESET_SEQ == selectedRulekey;}).GEO_LEVEL;
			var productLevel = rcuModel.find(function(data) {return data.PEOPLE_RULESET_SEQ == selectedRulekey;}).PRODUCT_LEVEL;
			// from selected value fetch the Geolevel
			// bind the geo level dropdown based on rule
			if (selectedRulekey !== "-1")
			{
				this._oModel.setProperty("/AssignPeopleRuleVM/Geography",this.getGeoLevelDropDown(geoLevel));
				this._oModel.setProperty("/AssignPeopleRuleVM/Product",this.getProductLevelDropDown(productLevel));
			   /* this._oModel.setProperty("/AssignRuleVM/RCU",this.getRCUDropDown());
			    var subRcuDropDown = this.getSubRCUDropDown(null);
			    var ruleVM = this._oViewModelData.AssignRuleVM;
			    for(var i = 0; i < ruleVM.length - 1; i++) {
			    	ruleVM[i].SUB_RCU =    subRcuDropDown;   
			    	ruleVM[i].SUB_RCU_CODE = "-1";
			    	ruleVM[i].SUB_RCU_DESC = "Select..";
			    }*/
		    	this.getDefaultPropertyValues();
				this.setDefaultValuesToGrid();
			}
			else
			{
				this.onInit();
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
        	var geographyList = this._oAssignPeopleRuleViewModel.getProperty("/AssignPeopleRuleVM/Geography");
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
        	/*var rcuList = this._oAssignRuleViewModel.getProperty("/AssignPeopleRuleVM/RCU");
        	if(rcuList !== undefined){
        		this._rcuList = rcuList.find(function(data){return data.RCU_CODE === -1; });
        	}
        	var subRcuList = this._oAssignRuleViewModel.getProperty("/AssignPeopleRuleVM/SubRCU");
        	if(subRcuList !== undefined){
        		this._subRcuList = subRcuList.find(function(data){return data.SUB_RCU_CODE === -1; });
        	}*/
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
/*			if(this._rcuList !== undefined){
				obj.RCU_CODE  = this._rcuList .RCU_CODE;
				obj.RCU_DESC = this._rcuList.RCU_DESC;
			}
			if(this._subRcuList !== undefined){
				obj.SUB_RCU_CODE  = this._subRcuList.SUB_RCU_CODE;
				obj.SUB_RCU_DESC = this._subRcuList.SUB_RCU_DESC;
			}*/
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
			    		REGULATORY_SUPPLY_CHAIN_MANAGER_ID : -1,
			    		regulatorySupplyChainMangerErrorState : "None",
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
		}		

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf bam.view.AddPeopleRules
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf bam.view.AddPeopleRules
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf bam.view.AddPeopleRules
		 */
		//	onExit: function() {
		//
		//	}

	});

});