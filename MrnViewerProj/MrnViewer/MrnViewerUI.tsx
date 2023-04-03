import * as React from 'react';
import { Label, ILabelStyles } from 'office-ui-fabric-react/lib/Label';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { PivotItem, IPivotItemProps, Pivot } from 'office-ui-fabric-react/lib/Pivot';
import { IStyleSet } from 'office-ui-fabric-react/lib/Styling';

import { Container, Row, Col, Card, Badge, Alert} from 'react-bootstrap';

//import 'bootstrap/dist/css/bootstrap.css';


const labelStyles: Partial<IStyleSet<ILabelStyles>> = {
  root: { marginTop: 10 },
};

export class MrnViewerProps {
	public mrn: string = "";
	public region: string = "";
	public data: Patient;
	public api1: string = "";
	public api2: string = "";
	constructor(){
		this.data = new Patient();
	}
};

export class PatientProfile{
	public firstName: string = "";
	public lastName: string = "";
	public mrn: string = "";
	public region: string = "";
	public dateOfBirth: string = "";
	public email: string = "";
	public phone: string = "";
	public addressForReceivingcare: string = "";
	public addressHome: string = "";
	
	public preferredMethodOfContact: string = "";
	public fax: string = "";
	public gateCode: string = "";
	public arrivalTips: string = "";
	public dataRefreshDemographics: string = "";
	public dataRefreshOther: string = "";
}
export class Patient{
	public patientProfile: PatientProfile;
	constructor(){
		this.patientProfile = new PatientProfile();
	}
}


export const MrnViewerUI: React.FunctionComponent<MrnViewerProps> = props => {
	if(props===undefined) return <div>MrnViewer Error: Invalid props</div>;
	else if (props.data===undefined) return <div>MrnViewer Error: Invalid props</div>;
	else if (props.data.patientProfile===undefined) return <div>MrnViewer Error: Invalid patientProfile. Likely cause - data access issue.</div>;
	else if (props.data.patientProfile===null) return <div>MrnViewer Error: patientProfile is null</div>;
	else if (props.data.patientProfile.firstName===null || props.data.patientProfile.firstName===undefined) return <div>MrnViewer Error: PatientProfile FirstName is null</div>;
	
	
	//props and data within it is good. Renfer the tabs/pivots now.
	
	const cardStyle = {
		textAlign: 'left',
		//width: '400px'
	};
  return (
    <div>
      <Pivot aria-label="MRN Viewer">
        <PivotItem headerText="Demographics" itemIcon="Emoji2">			
			<Card style={cardStyle}>
			  <Card.Body>
				<Card.Title>{props.data.patientProfile.firstName} {props.data.patientProfile.lastName}</Card.Title>
				<Card.Subtitle className="mb-2 text-muted">MRN: {props.data.patientProfile.mrn} | {props.data.patientProfile.region}</Card.Subtitle>
				<Card.Text>
				  <div>DOB: {props.data.patientProfile.dateOfBirth}</div>
				  <div>Email: {props.data.patientProfile.email}</div>
				  <div>Phone: {props.data.patientProfile.phone} 
					{
						props.data.patientProfile.preferredMethodOfContact==="Phone" &&
						<Badge variant="primary">preferred method</Badge>
					}
				  </div>
				  <div>Fax: {props.data.patientProfile.fax}</div>
				  <hr/>
					<div>Home: {props.data.patientProfile.addressHome}</div> 
					<div className="mb-2 text-muted">Address for receiving care: {props.data.patientProfile.addressForReceivingcare}</div>
					<div><Alert variant="warning">Arrival Tips: {props.data.patientProfile.arrivalTips} | Gate Code: {props.data.patientProfile.gateCode}</Alert></div> 
				  <hr/>
					<div style={{fontSize: '10px', color: 'gray'}}>Demographics data refreshed On: {props.data.patientProfile.dataRefreshDemographics} | Other data refreshed on: {props.data.patientProfile.dataRefreshOther}</div> 
				</Card.Text>
			  </Card.Body>
			</Card>
			
        </PivotItem>
        <PivotItem headerText="Care Team" itemCount={5} itemIcon="Recent">
          <Label styles={labelStyles}>Pivot #2</Label>
        </PivotItem>
        <PivotItem headerText="Ongoing Conditions" itemIcon="Globe">
          <Label styles={labelStyles}>Pivot #3</Label>
        </PivotItem>
        <PivotItem headerText="Referrals" itemIcon="Ringer" itemCount={4}>
          <Label styles={labelStyles}>Pivot #4</Label>
        </PivotItem>
        <PivotItem headerText="Schedule" itemIcon="Globe" itemCount={10} /*onRenderItemLink={_customRenderer}*/>
          <Label styles={labelStyles}>Customized Rendering</Label>
        </PivotItem>
		<PivotItem headerText="DME Orders" itemIcon="Globe" itemCount={9}>
          <Label styles={labelStyles}>Customized Rendering</Label>
        </PivotItem>
      </Pivot>
    </div>
  );
};

function _customRenderer(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element): JSX.Element {
  return (
    <span>
      {defaultRenderer(link)}
      <Icon iconName="Airplane" style={{ color: 'red' }} />
    </span>
  );
}
