import { SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";

export {};

declare global {
	var SpeechRecognizer: SpeechRecognizer;	
	var ControlInFocus: any;
	var CaptionControlForControlInFocus: any;
	var CaseFormState: CaseFormState; //needed in order to send form data from react component to StandardControl's getOutputs()
}
 