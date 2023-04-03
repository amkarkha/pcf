import * as React from 'react';
import { TextField, Stack, IStackTokens, IIconProps, CommandBarButton, BaseButton, Button, MessageBar } from '@fluentui/react';
import { CaseFormProps, CaseFormState, TextWithCaptionProps } from "./models";
import { DefaultButton } from '@fluentui/react/lib/Button';
import { useBoolean } from '@fluentui/react-hooks';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";

initializeIcons();
 
const volume0Icon: IIconProps = { iconName: 'Volume0' };
const volume3Icon: IIconProps = { iconName: 'Volume3' };

const stackTokens: IStackTokens = { childrenGap: 5 };
const styles = {
	caption: {
		fontSize: 9,
		color: "blue" //"#4a54f1"
		//textAlign: "center"
	}  
};
const horizontalGapStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 10,
};

export class CaseFormUI extends React.Component<CaseFormProps, CaseFormState> {
	private captionControlForTitle: any;
	private captionControlForTags: any;
	private captionControlForDescription: any;
	
	constructor(props: CaseFormProps) {
		super(props);
		this.state = {
		  title: "",
		  tags: "",
		  description: "",
		  buttonCaption: "Start Dictation",
		  buttonIcon: "Microphone"
		};

		this.captionControlForTitle = React.createRef();
		this.handleTitleChanged = this.handleTitleChanged.bind(this);
		this.captionControlForTags = React.createRef();
		this.handleTagsChanged = this.handleTagsChanged.bind(this);
		this.captionControlForDescription = React.createRef();
		this.handleDescriptionChanged = this.handleDescriptionChanged.bind(this);
		
		global.CaseFormState = this.state;
	}
	
	componentDidMount(){
		console.log("I mounted");
		console.log(this.state);
	}
	componentWillUnmount(){
		console.log("I will unmount");
		console.log(this.state);
	}
	//----------------------- onChange event handling is required to keep the state updated. -------------------------------
	handleTitleChanged = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string | undefined): void => {
		if(!newValue) newValue="";
		this.setState({ title: newValue });
		console.log("onclick event fired " + newValue);
	};
	handleTitleReceivedFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
		console.log("got focus");
		global.ControlInFocus=event.target; //event.target is basically the control element who received the focus.
		console.log("set ControlInFocus");
		global.CaptionControlForControlInFocus = this.captionControlForTitle.current;
	}
	handleTitleLostFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
		this.setState({ title: event.target.value });
		console.log("onblur event fired " + event.target.value);
		global.CaseFormState.title = event.target.value;
		this.props.notifyOutputChanged();
	};	
	//----------------------- onChange event handling is required to keep the state updated. -------------------------------
	handleTagsChanged = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string | undefined): void => {
		if(!newValue) newValue="";
		this.setState({ tags: newValue });
	};	
	handleTagsReceivedFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
		console.log("got focus");
		global.ControlInFocus=event.target; //event.target is basically the control element who received the focus.
		console.log("set ControlInFocus");
		global.CaptionControlForControlInFocus = this.captionControlForTags.current;
	};
	handleTagsLostFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
		this.setState({ tags: event.target.value });
		global.CaseFormState.tags = event.target.value;
		this.props.notifyOutputChanged();		
	};
	//----------------------- onChange event handling is required to keep the state updated. -------------------------------
	handleDescriptionChanged = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string | undefined): void => {
		if(!newValue) newValue="";
		this.setState({ description: newValue });
	};	
	handleDescriptionReceivedFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
		console.log("got focus");
		global.ControlInFocus=event.target; //event.target is basically the control element who received the focus.
		console.log("set ControlInFocus");
		global.CaptionControlForControlInFocus = this.captionControlForDescription.current;
	};
	handleDescriptionLostFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
		this.setState({ description: event.target.value });
		global.CaseFormState.description = event.target.value;
		this.props.notifyOutputChanged();
	};
	//------------------------------------------------------
	
	toggleSpeechRecognition = (caseFormUI: CaseFormUI)=>{  
		if(global.SpeechRecognizer){
			if(caseFormUI.state.buttonCaption=="Start Dictation"){
				global.SpeechRecognizer.startContinuousRecognitionAsync();
				caseFormUI.setState({buttonCaption:"Stop Dictation", buttonIcon: "MicOff2"});
			}
			else{
				global.SpeechRecognizer.stopContinuousRecognitionAsync();
				caseFormUI.setState({buttonCaption:"Start Dictation", buttonIcon: "Microphone"});

			}
			console.log("started");
		}
		else{
			console.log("failed");		
		}
	}

	render() {
		return (
		<form>
			<Stack tokens={stackTokens} >
				<Stack>
					<MessageBar>
						Click on the Start Dictation button first, then click in the textboxes where you want the speech to text occur. When you are done with dictation, click on Stop Dictation and then Save Record.
					</MessageBar>
					<TextField value={this.state.title} onChange={this.handleTitleChanged} onFocus={this.handleTitleReceivedFocus} onBlur={this.handleTitleLostFocus} label="Title" placeholder=""  />
					<label ref={this.captionControlForTitle} style={styles.caption} ></label>	
					<TextField value={this.state.tags} onChange={this.handleTagsChanged} onFocus={this.handleTagsReceivedFocus} onBlur={this.handleTagsLostFocus} label="Tags" placeholder=""/>
					<label ref={this.captionControlForTags} style={styles.caption} ></label>	
					<TextField  multiline rows={5} onChange={this.handleDescriptionChanged} autoAdjustHeight value={this.state.description} onFocus={this.handleDescriptionReceivedFocus} onBlur={this.handleDescriptionLostFocus} label="Description" placeholder=""/>
					<label ref={this.captionControlForDescription} style={styles.caption} ></label>	
					
					<Stack horizontal horizontalAlign="center" disableShrink tokens={horizontalGapStackTokens}>
						<DefaultButton onClick={()=> this.toggleSpeechRecognition(this)} iconProps={{ iconName: this.state.buttonIcon }} text={this.state.buttonCaption} />
					</Stack>
				</Stack>
			</Stack>
		</form>
		);
	}
}

export class CaseFormUIError extends React.Component{
	render() {
		return (
			<div> Speech to Text setup was not completed successfully. </div>
		);
	}
}