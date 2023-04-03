export class CaseFormProps {
	constructor() {
    }
	public notifyOutputChanged:  () => void;
}
export class CaseFormState {
	public title: string;
	public tags: string;
	public description: string;
	public buttonCaption: string;
	public buttonIcon: string;

	constructor() {
		this.title = "";
		this.tags = "";
		this.description = "";
    }
}
 
export class TextWithCaptionProps {
	public label: string;
	public caption: string;
	constructor() {
    }
}

export interface IInputs {
	title: ComponentFramework.PropertyTypes.StringProperty;  
	tags: ComponentFramework.PropertyTypes.StringProperty;  
	description: ComponentFramework.PropertyTypes.StringProperty;  
}
export interface IOutputs {
	title?: string;  
	tags?: string;  
	description?: string;  
}