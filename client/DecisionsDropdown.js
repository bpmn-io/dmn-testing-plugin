/* eslint-disable no-unused-vars */
import React from 'react';

// we can even use hooks to render into the application
export default class DecisionsDropdown extends React.PureComponent {

    constructor(props) {
      super(props);

      this.state = {
          'decisions': props.decisions,
          'decisionsTaken': props.decisions[0],
          'changeDecision': props.changeDecision
      }

    }

    change = (event) => {
      console.log(event.target.value);
      changeDecision(event.target.value);
      this.setState({'decisionTaken': event.target.value});
    }

    render() {

      const {
        changeDecision
      } = this.props;

      const onChange = (value) => changeDecision(value);
  
      const dropdownItems = this.state.decisions.map((decision, index) => 
        <option key={index} value={decision}>{decision}</option>
      );

      return (
       <select
       onChange={
        event => {
            onChange(event.target.value);
        }
      }>
         { dropdownItems }
        </select>
      );
    }
  
  }
    