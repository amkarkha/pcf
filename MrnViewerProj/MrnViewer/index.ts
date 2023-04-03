import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MrnViewerUI, MrnViewerProps, Patient, PatientProfile } from './MrnViewerUI';

export class MrnViewer implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private theContainer: HTMLDivElement;
	private props: MrnViewerProps;
	private theContext: ComponentFramework.Context<IInputs>;


	/**
	 * Empty constructor.
	 */
	constructor()
	{
		this.props = new MrnViewerProps();
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.theContainer = container;
		this.theContext = context;
		//this.props.api1 = context.parameters.api1.raw!;
		//this.props.api2 = context.parameters.api2.raw!;

		var mrnPlusRegion: string = context.parameters.mrnPlusRegion.raw!;
		if (mrnPlusRegion.indexOf("-") > -1) {
			var arr = mrnPlusRegion.split("-", 2);
			this.props.mrn = arr[0];
			if (arr.length > 1) {
				this.props.region = arr[1];
				var thisRef = this;
				this.getData(this.props.mrn, this.props.region)
					.then((data) => {
						thisRef.props.data = data;
						ReactDOM.render(
							React.createElement(
								MrnViewerUI,
								thisRef.props
							),
							thisRef.theContainer
						);
					})
					.catch(e => console.log("Exception occured in updateView: " + e));
				return; //all done
			}
			else {
				console.log("updateView(): Error type 2 - Invalid mrn or region. MrnViewer control will not be rendered");
			}
		}
		else {
			console.log("updateView(): Error type 1 - Invalid mrn or region");
		}
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{

	}
	private async getData(mrn: string, region: string): Promise<Patient> {
	  let patient = new Patient();
	  try {
		let url: string = '/api/data/v9.2/test_getData(kptest_mrn=@p1,kptest_region=@p2)?@p1=%27'+mrn+'%27&@p2=%27'+region+'%27';

		let response = await fetch(url);
		if (response.status == 200) {
		  let data = await response.json(); 
		  let patientProfileObj = JSON.parse(data.kptest_responseJson);
		  patient.patientProfile = patientProfileObj;
		}
		else{
			patient = this.getErrorPatient();
		}
	  } catch (error) {
		console.error(error);
		patient = this.getErrorPatient();
		throw new Error("getData Exception: Rethrown - " + error);
	  } finally{
		return patient;
	  }
	}
	
	private getErrorPatient(): Patient{
		return {
			patientProfile: {
				firstName: "John",
				lastName: "Doe",
				mrn: "1234567890",
				region: "NW",
				dateOfBirth: "01/01/1960",
				email: "john@doe.com",
				phone: "222-222-2222",
				addressForReceivingcare: "101 MLK Blvd, San Fran 90212",
				addressHome: "202 MLK Blvd, San Ramon 95093",
				preferredMethodOfContact: "Phone",
				fax: "333-333-3333",
				gateCode: "2012",
				arrivalTips: "Small dog at home",
				dataRefreshDemographics: "07/01/2021 12:00AM",
				dataRefreshOther: "07/01/2021 12:01AM"
			}
		};
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		ReactDOM.unmountComponentAtNode(this.theContainer);
	}
}