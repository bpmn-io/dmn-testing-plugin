import React from 'react'; // eslint-disable-line no-unused-vars

// we can even use hooks to render into the application
export default function DecisionsDropdown(props) {
  const { selected, decisions, onDecisionChanged } = props;

  const dropdownItems = decisions.map((decision, index) =>
    <option key={ index } value={ decision.decisionId }>{ decision.decision }</option>
  );

  const onChange = event => onDecisionChanged(
    decisions.find(decision => decision.decisionId === event.target.value)
  );

  return (
    <select
      onChange={ onChange }
      value={ selected.decisionId }
    >
      { dropdownItems }
    </select>
  );
}
