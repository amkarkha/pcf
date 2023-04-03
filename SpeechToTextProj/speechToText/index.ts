/*
Use Case Description:
---------------------
This PCF control allows users to speak into textboxes where the speech is converted into text. Ths control captures the speech input from microphone and converts it into text into three text boxes - Title, Tags, Description.  This control can be used on a quick create Case form to create a case primarily by dictating into these textboxes.

The control offers continuous speech recognition, which captures text until the speaker pauses for the next statement. After the pause, the subsequent speech input is appended to the prior text. The Continuous speech recognition poses a challenge in the user experience. If the user speaks a very long continous blurb, the text does not appear in the textbox for the long time, until the speaker stops. This user does not get a feedback of the speech until the . To solve for this issue, this PCF control provides a small font caption of the realtime speech to text conversion.

How to use this control?
-----------------------
Ths control demonstrates how to capture speech to text into 3 attributes, Title, Tags, Description. The Case form comes with out of the box Case Title and Description columns. You will have to add a custom column named 'Tags' to the Case form. Add these 3 textbox controls to the quick create form on the Case entity and mark them as not visible. Then use this PCF cotnrol on the form and map the 3 controls to the Title, Tags and Description properties.

How this control works?
-----------------------
The control uses the javascript SpeechSDK. It renders its own UI with these Title, Tags, Description. The control uses onchange, onfocus and onblur events on each of its textboxes. 
 - Onchane event is used to capture realtime text from the speech SDK. 
 - Onfocus event is used to determine which textbox has focus so that the control knows the appropriate caption lable control to display the real time text capture. 
 - Onblur event is used to update the react state which is then used in PCF framewotk's getoutputs() that updates the respective (hidden) controls on the D365 form. 
When the user uses clicks on the Save button on the quick create form, the data is saved as a new Case record in dataverse.

*/


import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { CaseFormUI, CaseFormUIError } from "./CaseFormUI";
import { CaseFormProps } from "./models";
import * as spsdk from "microsoft-cognitiveservices-speech-sdk";
import ReactDOM = require("react-dom");
import React = require("react");

export class speechToText implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	
	private thisContainer: HTMLDivElement;
	private _notifyOutputChanged: ()=> void;

    /**
     * Empty constructor.
     */
    constructor()
    {
	
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
		this.thisContainer = container; //so that we can destroy it in the destructor.
		this._notifyOutputChanged = notifyOutputChanged; //so that we can call this in getoutputs() later to indicate things have changed in the UI.
		
		let caseFormProps: CaseFormProps = { notifyOutputChanged:notifyOutputChanged}; //notifyOutputChanged needed on CaseFormUI component so that it can call notifyOutputChanged() so that the getOutputs() get called, so that the values from CaseFormUI's state are sent by this PCF control as IOutputs
		
		let success = this.setupSpeech2Text();
		if(success){
			ReactDOM.render(
				React.createElement(
					CaseFormUI,
					caseFormProps 
				),
				container
			);	
		}
		else{
			ReactDOM.render( 
				React.createElement(
					CaseFormUIError,
					null
				),
				container
			);
			
		}
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // Add code to update control view
		console.log("updateView() was called");
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
		console.log("getOutputs() fired");
        return {
			title: global.CaseFormState.title,
			tags: global.CaseFormState.tags,
			description: global.CaseFormState.description
		};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
		global.SpeechRecognizer.stopContinuousRecognitionAsync();
		ReactDOM.unmountComponentAtNode(this.thisContainer);
    }
	//-------------------------------Speech--------------------------------------------------
	private controlInFocus: any;
	private recognizer: spsdk.SpeechRecognizer;
	private setupSpeech2Text(): boolean	{
		
		try{
			// status fields and start button in UI
			var phraseDiv;
			var startRecognizeOnceAsyncButton;

			// subscription key and region for speech services.

			//Use token auth instead
			//----------------------
			var subscriptionKeyValue = "<Speech Service Key> ";// Create Seppech Service in Azure portal, go to Keys and Endpoints, get one of the keys and paste here.
			//----------------------
			//Use token auth instead.

			var serviceRegionValue = "eastus";
			var languageTargetOptionsValue = "en";
			var languageSourceOptionsValue = "en-US";
				
			if (subscriptionKeyValue === "" || subscriptionKeyValue === "subscription") {
			  alert("Please enter your Microsoft Cognitive Services Speech subscription key!");
			  //startRecognizeOnceAsyncButton.disabled = false;
			  return false;
			} 
			if (serviceRegionValue === "" || serviceRegionValue === "subscription") {
			  alert("Please enter your Microsoft Cognitive Services Speech subscription Region!");
			  //startRecognizeOnceAsyncButton.disabled = false;
			  return false;
			}
			//var speechConfig = spsdk.SpeechTranslationConfig.fromSubscription(subscriptionKeyValue, serviceRegionValue);
			var speechConfig = spsdk.SpeechConfig.fromSubscription(subscriptionKeyValue, serviceRegionValue);
			speechConfig.enableDictation();		
			speechConfig.speechRecognitionLanguage = languageSourceOptionsValue;
			//let language = languageTargetOptionsValue;
			//speechConfig.addTargetLanguage(language);

			var audioConfig  = spsdk.AudioConfig.fromDefaultMicrophoneInput();
			global.SpeechRecognizer = new spsdk.SpeechRecognizer(speechConfig, audioConfig); //Set it in a global variable so that we can use it in the CaseFormUI class.
	
			global.SpeechRecognizer.recognizing = (s: any, e: any) => {
				console.log(`RECOGNIZING: Text=${e.result.text}`);
				if(global.ControlInFocus){
					global.CaptionControlForControlInFocus.innerHTML = e.result.text;
				}
				else{
					console.log("RECOGNIZING: Could not find control in focus");
				}
				//dictationControl.value = e.result.text;
			};

			global.SpeechRecognizer.recognized = (s: any, e: any) => {
				if (e.result.reason == spsdk.ResultReason.RecognizedSpeech) {
					console.log(`RECOGNIZED: Text=${e.result.text}`);
					if(global.ControlInFocus){
						global.ControlInFocus.value += "..." + e.result.text; //Note - this will update the control, but that will not result in an onchange event. We need the onchange event because in that event we are updating the React state, which is used in the end when the user clicks the Save button.
						global.ControlInFocus.dispatchEvent(new Event('input', {bubbles:true}));//this is required so that the onchange event is triggered.
					}
					else{
						console.log("RECOGNIZING: Could not find control in focus");
					}
				}
				else if (e.result.reason == spsdk.ResultReason.NoMatch) {
					var msg = "Speech could not be recognized.";
					//global.CaptionControlForControlInFocus.innerHTML = msg;
					console.log(msg);
					//dictationControl.value = msg;

				}
			};

			global.SpeechRecognizer.canceled = (s: any, e: any) => {
				console.log(`CANCELED: Reason=${e.reason}`);

				if (e.reason == "Error"/* sdk.CancellationReason.Error*/) {
					console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
					console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
					console.log("CANCELED: Did you set the speech resource key and region values?");
				}

				global.SpeechRecognizer.stopContinuousRecognitionAsync();
			};

			global.SpeechRecognizer.sessionStopped = (s: any, e: any) => {
				console.log("\n    Session stopped event.");
				global.SpeechRecognizer.stopContinuousRecognitionAsync();
			};

			//recognizer.startContinuousRecognitionAsync();

			// Make the following call at some point to stop recognition:
			// recognizer.stopContinuousRecognitionAsync();

			//formContext.ui.setFormNotification("Speech service is setup successfully. Ciick on the light bulb icon near the 'Dictation' text box to start dictation.", "WARNING");
			
			console.log("Speech SDK setup successfully");
			
			return true;
		}
		catch(ex){
			//formContext?.ui.setFormNotification(ex)
			return false;
		}
	}

}
