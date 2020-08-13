/* eslint-disable no-unused-vars */
import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import DecisionsDropdown from './DecisionsDropdown';
import { Modal } from 'camunda-modeler-plugin-helpers/components';

// will be used for form initialization when no others are provided
const DEFAULT_VARIABLES = [{
  'decision': 'Example decision 1',
  'decisionId': 'Example decision 1',
  'variables': [ {
    'name': 'Variable 1',
    'type': 'boolean'
  },
  {
    'name': 'Variable 2',
    'type': 'string'
  }]
},
{
  'decision': 'Example decision 2',
  'decisionId': 'Example decision 2',
  'variables': [ {
    'name': 'Variable 1',
    'type': 'boolean'
  }]
}];


// we can even use hooks to render into the application
export default class ConfigModal extends React.PureComponent {

  constructor(props) {
    super(props);
  }

  updateDecision = () => {
    this.setState({'decisionTaken': event.target.value});
  }

  render() {

    const {
      closeModal,
      evaluate,
      inputVariables
    } = this.props;

    const initialValues = inputVariables || DEFAULT_VARIABLES;

    // flatten to make it easier to display and extend with own variables
    // TODO: get rid of nested loop
    let flattenedInitialValues = [];
    initialValues.forEach(element => {
      element.variables.forEach((variable) => {
        flattenedInitialValues.push({
          'decision': element.decision,
          'name': variable.name,
          'type': variable.type,
          'value': ''
        });
      });
    });

    const onClose = () => closeModal();

    const onSubmit = (variables) => evaluate( {
      variables: variables,
      decision: this.state.takenDecision
    });

    const updateDecision = (val) => this.setState({ takenDecision: val});

    return (
      <Modal onClose={ onClose }>

        <Modal.Title>
          DMN Testing
        </Modal.Title>

        <Modal.Body>

          <div>
          <h3>Decision to evaluate</h3>
          <DecisionsDropdown
            decisions={ initialValues.map(ele => ele.decisionId) } 
            changeDecision={ (val) => updateDecision(val) }/>
            <h3>Variable inputs</h3>
            <Formik
              initialValues={ {
                decisions: flattenedInitialValues
              } }
              onSubmit={
                values => {
                  onSubmit(values.decisions);
                }
              }
            >
              {({ values }) => (
                <Form
                  id="dmnTestingInputVarsForm">
                  <FieldArray
                    name="decisions"
                    render={ arrayHelpers => (
                      <div>
                        {values.decisions && values.decisions.length > 0 ? (
                          values.decisions.map((_, index) => (
                            <div key={ index }>
                              <Field name={ `decisions.${index}.decision` } disabled={ true } />
                              <Field name={ `decisions.${index}.name` } />
                              <Field name={ `decisions.${index}.value` } placeholder="<provide value>" />
                              <Field name={ `decisions.${index}.type` } component="select">
                                <option value="">Select type</option>
                                <option value="string">string</option>
                                <option value="integer">integer</option>
                                <option value="boolean">boolean</option>
                                <option value="long">long</option>
                                <option value="double">double</option>
                                <option value="date">date</option>
                              </Field>
                              <button
                                type="button"
                                onClick={ () => arrayHelpers.remove(index) }
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={ () => arrayHelpers.insert(index + 1, '') }
                              >
                                +
                              </button>
                            </div>
                          ))
                        ) : (
                          <button type="button" onClick={ () => arrayHelpers.push('') }>
                            Add a variable
                          </button>
                        )}
                      </div>
                    ) }
                  />
                </Form>
              )}
            </Formik>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div id="autoSaveConfigButtons">
            <button type="submit" className="btn btn-primary" form="dmnTestingInputVarsForm">Test</button>
            <button type="button" className="btn btn-secondary" onClick={ () => onClose() }>Cancel</button>
          </div>
        </Modal.Footer>
      </Modal>

    );
  }

}

