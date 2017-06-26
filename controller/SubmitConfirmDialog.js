sap.ui.define([
	"sap/ui/base/Object"]
	, function(UI5Object){
		"use strict";
	return UI5Object.extend("bam.controller.SubmitConfirmDialog", {
		constructor : function (oView) {
			this._oView = oView;	
		},
		open : function (view) {
			var oView = this._oView;
			if (view !== this._oView)
			{
				oView = view;
			}
			
			var oDialog = oView.byId("submitConfirmDialog");
			var component = this.getComponent();
			
			// create dialog lazily
			if (!oDialog) {
				var oFragmentController = {
					onCloseDialog : function () {
						oDialog.close();
						
						// for plant selection reset the data of the model
						if(oView.sViewName === "bam/view.PlantSelection")
						{
							var plantSelectionModel = oView.getModel();
							var data = plantSelectionModel.setProperty("/PlantSelectionVM",[]);
							plantSelectionModel.refresh();
						}
						else if(oView.sViewName === "bam/view.GMIDSubmission")
						{
							// hide the table & excel button and set the radio button to not selected
							var tblGmid = oView.byId("tblGMIDRequest");
							tblGmid.setVisible(false);
							var excelHBox = oView.byId("excelHBox");
							excelHBox.setVisible(false);
							var rbgGMIDType = oView.byId("rbgGMIDType");
							rbgGMIDType.setSelectedIndex(-1);
							var btnSubmit = oView.byId("btnSubmit");
							btnSubmit.setVisible(false);
							var btnContinue = oView.byId("btnContinueToPlantSelection");
							btnContinue.setVisible(false);
							
							// reset model to default 5 rows
							var GMIDShipToCountryModel = oView.getModel();
							var data = GMIDShipToCountryModel.getData().GMIDShipToCountryVM;
							for(var i = 0; i < data.length - 1; i++) 
	            			{
	        					data[i].GMID = "";
		            			data[i].COUNTRY_CODE_ID = -1;
		            			data[i].CURRENCY_CODE_ID = -1;
		            			data[i].IBP_RELEVANCY_CODE_ID = -1;
		            			data[i].NETTING_DEFAULT_CODE_ID = -1;
		            			data[i].QUADRANT_CODE_ID = -1;
		            			data[i].CHANNEL_CODE_ID = -1;
		            			data[i].MARKET_DEFAULT_CODE_ID = -1;
		            			data[i].CREATED_BY = "";
		            			data[i].createNew = "";
		            			data[i].errorMessage = false;
				            }
				            
				            // remove any extra rows, only want to show 5
				            data.splice(5,data.length - 5);
				            GMIDShipToCountryModel.refresh();
						}
						
						component.getRouter().navTo("home");
					}
				};
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "bam.view.SubmitConfirmDialog", oFragmentController);
				// connect dialog to the root view of this component (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		getComponent: function () {
	        var sComponentId = sap.ui.core.Component.getOwnerIdFor(this._oView);
	        return sap.ui.component(sComponentId);
    	}
	});
});