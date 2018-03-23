sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/core/routing/History"
	], function (Controller,DataContext,MessageToast,MessageBox,ResourceModel,Filter,History) {
		"use strict";

  	var loggedInUserID;
	var firstTimePageLoad = true;
	return Controller.extend("bam.controller.AddCURules", {
		onInit : function () {
			// Get logged in user id
		    loggedInUserID = DataContext.getUserID();
			 // define a global variable for the oData model		    
		   	var oView = this.getView();
		   	oView.setModel(this.getOwnerComponent().getModel());
		   		// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
	    	//
	    	// checking the permission
	    	var maintainRule = this._oi18nModel.getProperty("Module.maintainRules");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === maintainRule && (permissions[i].ACTION === "EDIT" || permissions[i].ACTION === "ADD"))
				{
						hasAccess = true;
						break;
				}
			}
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getOwnerComponent().getRouter().navTo("accessDenied");
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
			    		"RCU_CODE" : -1,
			    		"cuErrorState" : "None",
			    		"SUB_RCU_CODE" : -1,
			    		"subcuErrorState" : "None",
			    		"createNew" : false,
			    		"isError" :false
			    	});
			    }
				// Assigning view model for the page
			    this._oModel = new sap.ui.model.json.JSONModel({AssignRuleVM : initData});
			    // Create table model, set size limit to 300, add an empty row
			    this._oModel.setSizeLimit(2000);
			    // define a global variable for the view model, the view model data and oData model
			    this._oAssignRuleViewModel = this._oModel;
			    this._oViewModelData = this._oAssignRuleViewModel.getData();
			    this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
	
			    this.getView().setModel(this._oModel);	
		    	this.addEmptyObject();

				if (!this._busyDialog) 
				{
					this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
					this.getView().addDependent(this._dialog);
				}
			// set all the dropdowns, get the data from the code master table
			// default load
	    		this._oModel.setProperty("/AssignRuleVM/RuleSet",this.getRulesDropDown());
	    		this._oModel.setProperty("/CU_RULESET_SEQ",-1);
	    		this._oModel.setProperty("/NAME","Please Select a Rule Set");
	    		// this.getView().byId("cmbGeography").setValueStateText("");
	    		// this.getView().byId("cmbProduct").setValueStateText("");
	    		// this.getView().byId("cmbCU").setValueStateText("");
	    	 //   this.getView().byId("cmbSubCU").setValueStateText("");
	    	//	this.getDefaultPropertyValues();
		    //	this.setDefaultValuesToGrid();
			}
			if(firstTimePageLoad)
	    	{
	    		var oRouter = this.getRouter();
				oRouter.getRoute("addCURules").attachMatched(this._onRouteMatched, this);
				firstTimePageLoad = false;
	    	}
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
		// This functions sets the value state of each control to None. This is to clear red input boxes when errors were found durin submission.
    	onChangeRuleSet: function(oEvent){
    		// update ischanged to true for any attribute changed
    		this._isChanged = true;
			var sourceControl = oEvent.getSource();
			// get the selected value
			var selectedRulekey = sourceControl.getSelectedItem().getKey();
			var rcuModel = this._oModel.getProperty("/AssignRuleVM/RuleSet");
			var geoLevel = rcuModel.find(function(data) {return data.CU_RULESET_SEQ == selectedRulekey;}).GEO_LEVEL;
			var productLevel = rcuModel.find(function(data) {return data.CU_RULESET_SEQ == selectedRulekey;}).PRODUCT_LEVEL;
			// from selected value fetch the Geolevel
			// bind the geo level dropdown based on rule
			if (selectedRulekey !== "-1")
			{
				this._oModel.setProperty("/AssignRuleVM/Geography",this.getGeoLevelDropDown(geoLevel));
				this._oModel.setProperty("/AssignRuleVM/Product",this.getProductLevelDropDown(productLevel));
			    this._oModel.setProperty("/AssignRuleVM/RCU",this.getRCUDropDown());
		    	this._oModel.setProperty("/AssignRuleVM/SubRCU",this.getSubRCUDropDown());
		    	this.getDefaultPropertyValues();
				this.setDefaultValuesToGrid();
			}
			else
			{
				this.onInit();
			}

		},
		getRulesDropDown : function () {
			var result;
			// Create a filter & sorter array

			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("LABEL",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_CU_RULESET",{
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"CU_RULESET_SEQ":-1,
		              							"NAME":"Please Select a Rule Set"});
		                // Bind the CU RuleSet data
		                result =  oData.results;
	                },
	    		    error: function(){
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
		getGeoLevelDropDown : function (geolevel) {
			var result;
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
		getRCUDropDown : function () {
			var result;
			
			// Create a filter & sorter array

			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("RCU_DESC",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_RCU",{
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"RCU_CODE":-1,
		              							"RCU_DESC":"Select.."});
		                // Bind the RCU  data 
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for RCU Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		getSubRCUDropDown : function () {
			var result;
			// Create a filter & sorter array

			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("SUB_RCU_DESC",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_SUB_RCU",{
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"SUB_RCU_CODE":-1,
		              							"SUB_RCU_DESC":"Select.."});
		                // Bind the SUB RCU  data
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for SUB RCU Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		// on navigate back button
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("cuAssignment", true);
			}
		},
		onHome: function(){
			// this._oAssignRuleViewModel.refresh();
			this.getOwnerComponent().getRouter().navTo("home");
		},
		addEmptyObject : function() {
	    	var aData  = this._oAssignRuleViewModel.getProperty("/AssignRuleVM");
	    	var emptyObject = {createNew: true, isError: false};
	    	aData.push(emptyObject);
	    	this._oAssignRuleViewModel.setProperty("/AssignRuleVM", aData);
		},
		disableControl:function(value){
			return !value;
		},
		enableControl : function(value){
			return !!value;
		},
		onChange : function(oEvent){
			this._isChanged = true;
			var sourceControl = oEvent.getSource();
			sourceControl.setValueStateText("");
			sourceControl.setValueState(sap.ui.core.ValueState.None);			
		},
		
		onRemoveRow:function(oEvent){
			this._isChanged = true;
			// Get the object to be deleted from the event handler
			var entryToDelete = oEvent.getSource().getBindingContext().getObject();
			// Get the # of rows in the VM, (this includes the dropdown objects such as Country, Currency, etc..)
			var rows = this._oViewModelData.AssignRuleVM;
			
			// loop through each row and check whether the passed object = the row object
			for(var i = 0; i < rows.length; i++){
				if(rows[i] === entryToDelete )
				{
					// found a match, remove this row from the data
					rows.splice(i,1);
					// refresh the AssignRuleVM VM, this will automatically update the UI
					this._oAssignRuleViewModel.refresh();
					break;
				}
			}
		},
		
		onAddRow:function(oEvent){
			var path = oEvent.getSource().getBindingContext().getPath();
		    // create new empty rule object
		    var obj = {
			    		LEVEL_ID : -1,
			    		geographyErrorState : "None",
			    		PRODUCT_CODE : -1,
			    		productErrorState : "None",
			    		RCU_CODE : -1,
			    		cuErrorState : "None",
			    		SUB_RCU_CODE : -1,
			    		ubcuErrorState : "None",
			    		createNew : false,
			    		isError :false
		    		};
		    var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
	    	if (selectedRulekey !== "-1") // added this cond to show default values only if valid rule set is selected
	    	{
	    		obj = this.setDefaultPropertyValues(obj);
	    	}
	    	this._oAssignRuleViewModel.setProperty(path, obj);
	    	this.addEmptyObject();	
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
			if(this._rcuList !== undefined){
				obj.RCU_CODE  = this._rcuList .RCU_CODE;
				obj.RCU_DESC = this._rcuList.RCU_DESC;
			}
			if(this._subRcuList !== undefined){
				obj.SUB_RCU_CODE  = this._subRcuList.SUB_RCU_CODE;
				obj.SUB_RCU_DESC = this._subRcuList.SUB_RCU_DESC;
			}
        	return obj;
        },
		// This function loops through all the rows on the form and checks each input to see if it is filled in
        validateTextFieldValues :function () {
    		
        	var returnValue = true;
        	var data = this._oViewModelData.AssignRuleVM;
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
            var data = this._oViewModelData.AssignRuleVM;
	        // need to pass the above array to the DB to get the duplicate records
	        var viewpath = "V_VALIDATE_CU_RULES";
	        var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
            if (selectedRulekey !== "-1")
	        {
	        	var ruleSetRecords = DataContext.getrulesFromDB(selectedRulekey,viewpath); 
	            for(var i = 0; i < data.length - 1; i++) 
	            {
	                var geo_level_id = parseInt(data[i].LEVEL_ID,10);
	                var product_code;
	                if (data[i].PRODUCT_CODE === 0 )
                    {
                    	product_code = null;
                    }
                    else
                    {
                    	product_code = data[i].PRODUCT_CODE;
                    }
                                        
	                // loop the Rule Set Records from DB to check Unique
	                for(var k = 0; k < ruleSetRecords.length; k++) 
	                {
	                    // check if Rule already exists in system
	                    if (geo_level_id === ruleSetRecords[k].GEO_LEVEL_ID && product_code === ruleSetRecords[k].PRODUCT_CODE)
			            {
			                isDuplicate = true;
			                data[i].isError = true;
			                data[i].geographyErrorState = "Error";
			                data[i].productErrorState = "Error";
			                if(data[i].errorSummary !== "")
			                {
			        			data[i].errorSummary += "\n";  
			                }
			            	data[i].errorSummary += "Rule Combination already exists in the system.";
			            }
			            else
			            {
			                continue;
			            }
	                }
	            }
	          }
            this._oAssignRuleViewModel.refresh();
            
            return isDuplicate;
        },
        // function to check whether the user has entered a duplicate RuleSet/Geography,Product on the form
        validateDuplicateEntries :function(){
	        var returnValue = true;
	        var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
	        if (selectedRulekey !== "-1")
	        {
		        var data = this._oViewModelData.AssignRuleVM;
		        for(var i = 0; i < data.length - 1; i++) 
		        {
		            for( var j = i + 1; j < data.length - 1; j++)
		            { 
			            if((data[i].LEVEL_ID !== -1 &&  data[j].LEVEL_ID !== -1) && (data[i].PRODUCT_CODE !== -1 &&  data[j].PRODUCT_CODE !== -1) && (data[i].LEVEL_ID === data[j].LEVEL_ID) && (data[i].PRODUCT_CODE ===  data[j].PRODUCT_CODE))
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
            if(parseInt(row.RCU_CODE,10) === -1)
            {
            	row.cuErrorState = "Error";
            	errorsFound = true;
            }
            if(parseInt(row.SUB_RCU_CODE,10) === -1)
            {
            	row.subcuErrorState = "Error";
            	errorsFound = true;
            }
            return errorsFound;
        },
         resetValidationForModel : function () {
        	var data = this._oViewModelData.AssignRuleVM;
            for(var i = 0; i < data.length - 1; i++) 
            {	
            	data[i].isError = false;
            	data[i].errorSummary = "";
            	data[i].geographyErrorState = "None";
            	data[i].productErrorState = "None";
            }
            this._oAssignRuleViewModel.refresh();
        },
       showErrorMessage: function(oEvent)
        {
		    var text = oEvent.getSource().data("text");
		         MessageBox.alert(text, {
			     icon : MessageBox.Icon.ERROR,
			title : "Invalid Input"
			       });
        },
         // below function will check if anything is changed  or modified in submission page
        chkIsModified: function() {
        	var AssignRule = this._oAssignRuleViewModel.getProperty("/AssignRuleVM");
        	var isModified = false;
        	var rcuModel = this._oModel.getProperty("/AssignRuleVM/RuleSet");
        	 var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
        	 var productLevel = rcuModel.find(function(data) {return data.CU_RULESET_SEQ == selectedRulekey;}).PRODUCT_LEVEL;
	        if (productLevel !== null)
	        { // for Product level which is not ALL
	        	// loop through the rows and for each row check if is anything is modified or changed
		    		for(var i = 0; i < AssignRule.length - 1; i++) 
		    		{   
			        			if ((parseInt(AssignRule[i].LEVEL_ID,10) !== -1) 
			        			|| (parseInt(AssignRule[i].PRODUCT_CODE,10) !== -1)
			        		    ||	(parseInt(AssignRule[i].RCU_CODE,10) !== -1) 
			        		    || (parseInt(AssignRule[i].SUB_RCU_CODE,10) !== -1))
			        		     {
			        		    	isModified = true;
			        		    	break;
			        		     }

		    			}
	        }
	        else
	        { //for Product level which is not ALL
	        	// loop through the rows and for each row check if is anything is modified or changed
		    		for(var i = 0; i < AssignRule.length - 1; i++) 
		    		{   
			        			if ((parseInt(AssignRule[i].LEVEL_ID,10) !== -1) 
			        			|| (parseInt(AssignRule[i].PRODUCT_CODE,10) !== 0)
			        		    ||	(parseInt(AssignRule[i].RCU_CODE,10) !== -1) 
			        		    || (parseInt(AssignRule[i].SUB_RCU_CODE,10) !== -1))
			        		     {
			        		    	isModified = true;
			        		    	break;
			        		     }

		    			}
	        	
	        }
            	
		    		return isModified;
        },
		onSubmit : function(){
                    var errorCount = 0;
                    var successCount = 0;
                    var AssignRule = this._oAssignRuleViewModel.getProperty("/AssignRuleVM");
                      // current limit for saving is 200 records
                      // check if Rule Submission Grid  has more than 200 records
                      // if more than 200 than show a validation message to user
                    var maxLimitSubmit = parseInt(this._oi18nModel.getProperty("MaxLimit"),10) ;
                    var RulesMaxLimitSubmit = this._oi18nModel.getProperty("MaxLimitSubmit.text");
                    // adding one to account for the extra line at the bottom
	                   if (AssignRule.length > (maxLimitSubmit)) {
                               MessageBox.alert(RulesMaxLimitSubmit,{
                                                icon : MessageBox.Icon.ERROR,
                                                title : "Error"});
                            return;
                         }
                            // validation for Rule Set
                         	var selectedRulekey = this.getView().byId("cmbRuleSetList").getSelectedItem().getKey();
					        if (selectedRulekey === "-1")
					        {
					        	MessageBox.alert("Please select rule set.", {
                                    icon : MessageBox.Icon.ERROR,
                                    title : "Invalid Input"
                               });
                            return;
					        }
                        if (AssignRule.length === 1 || this.chkIsModified() === false)
                        {
                                    MessageBox.alert("Please enter at least one rule.", {
                                    icon : MessageBox.Icon.ERROR,
                                    title : "Invalid Input"
                               });
                            return;
                        }
                        // reset the error message property to false before doing any validation
						this.resetValidationForModel();
                        // reset error on page to false
                        this._oAssignRuleViewModel.setProperty("/ErrorOnPage",false);

                        //open busy dialog
                        this._busyDialog.open();
                        // // need to declare local this variable to call global functions in the timeout function
                        var t = this;

                        // // setting timeout function in order to show the busy dialog before doing all the validation
                        setTimeout(function()
                {
                if (t.validateTextFieldValues() === false)
		        {
		        	// Set error message column to false (not visible by default)
			    	t._oAssignRuleViewModel.setProperty("/ErrorOnPage",true);
		        }
		        // Rule Set, geography and product should be unique
		        // check duplicate entries in the system
		        if(t.validateUniqueRules() === true)
	        	{
	        		t._oAssignRuleViewModel.setProperty("/ErrorOnPage",true);
	        	}
		        // check for duplicate entries on the page
	        	if (t.validateDuplicateEntries() === false)
	        	{
	        		t._oAssignRuleViewModel.setProperty("/ErrorOnPage",true);
	        	}
                 if(!t._oAssignRuleViewModel.getProperty("/ErrorOnPage"))
		        	{
                        // 
                        // Check validations here 
                        var tablePath = "/MST_CU_RULE";
                        // Create current timestamp
                        var oDate = new Date();                
                       var ruleSetSeq = t._oViewModelData.CU_RULESET_SEQ;
                       var strSubmission = t._oi18nModel.getProperty("submission");
                        for(var i = 0; i < AssignRule.length - 1; i++) {
                                if(t.checkEmptyRows(AssignRule[i],strSubmission) === true)
                                {
                                		var productLevelCode;
                                		var rcuCode;
                                		var subRcuCode;
                                        var geoLevelValId = parseInt(AssignRule[i].LEVEL_ID,10);
                                        if (AssignRule[i].PRODUCT_CODE === 0 )
                                        {
                                        	productLevelCode = '';
                                        }
                                        else
                                        {
                                        	productLevelCode = AssignRule[i].PRODUCT_CODE;
                                        }
                                        if (AssignRule[i].RCU_CODE === -1 )
                                        {
                                        	rcuCode = '';
                                        }
                                        else
                                        {
                                        	 rcuCode = AssignRule[i].RCU_CODE;
                                        }
                                        if (AssignRule[i].SUB_RCU_CODE === -1 )
                                        {
                                        	subRcuCode = '';
                                        }
                                        else
                                        {
                                        	 subRcuCode	= AssignRule[i].SUB_RCU_CODE;
                                        }
                                        //
                                        var newAssignRule = {
                                        				CU_RULE_ID: 1,
                                                        CU_RULESET_SEQ : ruleSetSeq,
                                                        GEO_LEVEL_VAL_ID : geoLevelValId,
                                                        PRODUCT_LEVEL_VAL_CODE : productLevelCode,
                                                        RCU_CODE : rcuCode,
                                                        SUB_RCU_CODE : subRcuCode,
                                                        VALID_FLAG : "T",
                                                        CREATED_ON : oDate,
                                                        CREATED_BY : loggedInUserID
                                        };
                                            t._oDataModel.create(tablePath, newAssignRule,
                                            {
                                                    success: function(){
                                                                    successCount++;
                                                    },
                                                    error: function(){
                                                                    errorCount++;
                                                    }
                                            });                                                                                           
                                }
                       }
                       
                       //Show success or error message
		    		if(errorCount === 0) 
		    		{
	        				var oRouter = t.getRouter();
	        				// once insertion is success, navigate to homepage
	        				MessageBox.alert("You have successfully submitted " + successCount + " Rule(s)",
								{
									icon : MessageBox.Icon.SUCCESS,
									title : "Success",
									onClose: function() {
					        			oRouter.navTo("cuAssignment");
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
        var data = this._oViewModelData.AssignRuleVM;
        //below check needs to be performed if we have more than one row, if only one row in grid no need to check
        //	dont validate the fields if nothing is changed for the row, i.e. user does not wnat to enter any data
        	if ((data.length >= 2) && (this._isChanged === true)){
	        			if ((parseInt(row.LEVEL_ID,10) === -1) && (parseInt(row.PRODUCT_CODE,10) === -1 || parseInt(row.PRODUCT_CODE,10) === 0) && (parseInt(row.RCU_CODE,10) === -1)
	        		    &&	(parseInt(row.SUB_RCU_CODE,10) === -1))
	        		     {
	        		    	errorsFound = false;
	        		    	return errorsFound;
	        		     }
	        		    else
	        		    {
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
           				curr.getOwnerComponent().getRouter().navTo("cuAssignment");
           			}
           		}
      		});			
		},

		getDefaultPropertyValues : function(){
        	var geographyList = this._oAssignRuleViewModel.getProperty("/AssignRuleVM/Geography");
        	if(geographyList !== undefined){
        		this._geographyList = geographyList.find(function(data){return data.LEVEL_ID === -1; });
        	}
        	var productList = this._oAssignRuleViewModel.getProperty("/AssignRuleVM/Product");
        	if(productList !== undefined){
        		this._productList = productList.find(function(data){return data.PRODUCT_CODE === -1; });
        		if(this._productList === undefined){
        			this._productList = productList.find(function(data){return data.PRODUCT_CODE === 0; });
        		}
        	}
        	var rcuList = this._oAssignRuleViewModel.getProperty("/AssignRuleVM/RCU");
        	if(rcuList !== undefined){
        		this._rcuList = rcuList.find(function(data){return data.RCU_CODE === -1; });
        	}
        	var subRcuList = this._oAssignRuleViewModel.getProperty("/AssignRuleVM/SubRCU");
        	if(subRcuList !== undefined){
        		this._subRcuList = subRcuList.find(function(data){return data.SUB_RCU_CODE === -1; });
        	}
        },
        setDefaultValuesToGrid: function(){
        	var rows = this._oViewModelData.AssignRuleVM;
			// loop through each row and update the Quadrant, Channel and Marketing Flag property to default value for seeds
			for(var i = 0; i < rows.length; i++){
				rows[i] = this.setDefaultPropertyValues(rows[i]);
			}
			this._oAssignRuleViewModel.refresh();
        },
        formatText : function(name, description){
        	if(description !== undefined){
        		return name + " (" + description + ")";
        	}
        	else{
        		return name;
        	}
        }
  	});
});