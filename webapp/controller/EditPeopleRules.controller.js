sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/Filter",
	"sap/ui/core/routing/History",
	"bam/services/DataContext",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, MessageToast, MessageBox, ResourceModel,Filter,History,DataContext,FilterOperator) {
	"use strict";
	var attributeList = [];
	var loggedInUserID;
	var firstTimePageLoad = true;
	var selectedPeopleRuleIds;
	//
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
	return Controller.extend("bam.controller.EditPeopleRules", {
		onInit : function (){
			if(firstTimePageLoad){
				//attach _onRouteMatched to be called everytime on navigation to Edit Attributes Single page
				var oRouter = this.getRouter();
				oRouter.getRoute("editPeopleRules").attachMatched(this._onRouteMatched, this);
				firstTimePageLoad = false;
			}
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();
			// define a global variable for the oData model		    
			var oView = this.getView();
			oView.setModel(this.getOwnerComponent().getModel());
			// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			//
			this._oEditPeopleRulesViewModel = new sap.ui.model.json.JSONModel();
			//
			// checking the permission
			var hasAccess = this.checkPermission();
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "peopleAssignment"
				});					
			}
			else{
				this._isChanged = false;
				// Assigning view model for the page
				this._oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this._oModel);
				this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);				
				this.setEditCURulesVM();
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
				//
				// Load dropdown
				this.loadDropDowns();
				//
				// setting the defult values
				this._oModel.setProperty("/DEMAND_MANAGER_ID","-1");
				this._oModel.setProperty("/DEMAND_MANAGER_NAME","Select..");
				this._oModel.setProperty("/GLOBAL_LEADER_ID","-1");
				this._oModel.setProperty("/GLOBAL_LEADER_NAME","Select..");
				this._oModel.setProperty("/MARKETING_DIRECTOR_ID","-1");
				this._oModel.setProperty("/MARKETING_DIRECTOR_NAME","Select..");
				this._oModel.setProperty("/MARKETING_MANAGER_ID","-1");
				this._oModel.setProperty("/MARKETING_MANAGER_NAME","Select..");
				this._oModel.setProperty("/MASTER_PLANNER_ID","-1");
				this._oModel.setProperty("/MASTER_PLANNER_NAME","Select..");
				this._oModel.setProperty("/PRODUCT_MANAGER_ID","-1");
				this._oModel.setProperty("/PRODUCT_MANAGER_NAME","Select..");
				this._oModel.setProperty("/REGIONAL_SUPPLY_CHAIN_MANAGER_ID","-1");
				this._oModel.setProperty("/REGIONAL_SUPPLY_CHAIN_MANAGER_NAME","Select..");
				this._oModel.setProperty("/SUPPLY_CHAIN_MANAGER_ID","-1");
				this._oModel.setProperty("/SUPPLY_CHAIN_MANAGER_NAME","Select..");
				this._oModel.setProperty("/SUPPLY_CHAIN_PLANNING_SPECIALIST_ID","-1");
				this._oModel.setProperty("/SUPPLY_CHAIN_PLANNING_SPECIALIST_NAME","Select..");
			}
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_onRouteMatched : function (oEvent) {
			// If the user does not exist in the BAM database, redirect them to the denied access page
			if(DataContext.isBAMUser() === false)
			{
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else
			{
				this.onInit();
				//this._oEditAttributesID = oEvent.getParameter("arguments").editAttributesID;
				
					////get current list of ids from model
			    	//var core = sap.ui.getCore();
			    	////debugger; // eslint-disable-line
			    //	var globalModel = core.getModel();
			    	//globalIds = globalModel.getData();  
					////debugger; // eslint-disable-line
					//this.setEditCURulesVM(globalIds);
			}
		},
		// function to navigate back to the previous page
		onNavBack : function(){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("peopleAssignment", true);
			}			
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
		//
		setEditCURulesVM: function(){
			var core = sap.ui.getCore();
			var globalModel = core.getModel();
			if(globalModel !== undefined){
				selectedPeopleRuleIds = globalModel.getData();
				var initData = [];
				for (var i = 0; i < selectedPeopleRuleIds.length; i++) {
					initData.push({
						ID:selectedPeopleRuleIds[i]
					});
				}
				this._oModel.setProperty("/EDIT_ATTRIBUTES_ID_LIST",initData);
				this._oModel.setProperty("/RULE_COUNT",selectedPeopleRuleIds.length);				
			}
		},
		loadDropDowns : function(){
			//
			// load the dropdown from user table
			if(showDemandManager){
				var demandManager = this._oi18nModel.getProperty("DEMAND_MANAGER");
				this._oModel.setProperty("/DEMAND_MANAGER", this.getPeopleRoleDropDown(demandManager));
			}
			if(showGlobalLeader){
				var globalLeader = this._oi18nModel.getProperty("GLOBAL_LEADER");
				this._oModel.setProperty("/GLOBAL_LEADER", this.getPeopleRoleDropDown(globalLeader));
			}
			if(showMarketingDirector){
				var marketingDirector = this._oi18nModel.getProperty("MARKETING_DIRECTOR");
				this._oModel.setProperty("/MARKETING_DIRECTOR", this.getPeopleRoleDropDown(marketingDirector));
			}
			if(showMarketingManger){
				var marketingManager = this._oi18nModel.getProperty("MARKETING_MANAGER");
				this._oModel.setProperty("/MARKETING_MANAGER", this.getPeopleRoleDropDown(marketingManager));
			}
			if(showMasterPlanner){
				var masterPlanner = this._oi18nModel.getProperty("MASTER_PLANNER");
				this._oModel.setProperty("/MASTER_PLANNER", this.getPeopleRoleDropDown(masterPlanner));	
			}
			if(showProductManager){
				var productManager = this._oi18nModel.getProperty("PRODUCT_MANAGER");
				this._oModel.setProperty("/PRODUCT_MANAGER", this.getPeopleRoleDropDown(productManager));	
			}
			if(showRegionalSupplychainManager){
				var regionalSupplychainManager = this._oi18nModel.getProperty("REG_SUPPLY_CHAIN_MANAGER");
				this._oModel.setProperty("/REGIONAL_SUPPLY_CHAIN_MANAGER", this.getPeopleRoleDropDown(regionalSupplychainManager));	
			}
			if(showSupplyChainManager){
				var supplychainManager = this._oi18nModel.getProperty("SUPPLY_CHAIN_MANAGER");
				this._oModel.setProperty("/SUPPLY_CHAIN_MANAGER", this.getPeopleRoleDropDown(supplychainManager));	
			}
			if(showSupplyChainPlanningSpecialist){
				var supplychainPlanningSpecialist = this._oi18nModel.getProperty("SUPPLY_CHAIN_PLANNING_SPECIALIST");
				this._oModel.setProperty("/SUPPLY_CHAIN_PLANNING_SPECIALIST", this.getPeopleRoleDropDown(supplychainPlanningSpecialist));
			}
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
		              							"USER_NAME":"Select.."});
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
		}
	});
});