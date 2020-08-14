import React from 'react'; // eslint-disable-line no-unused-vars
import { Formik, Form, Field, FieldArray } from 'formik';
import DecisionsDropdown from './DecisionsDropdown';
import { Modal } from 'camunda-modeler-plugin-helpers/components';


// we can even use hooks to render into the application
export default class ConfigModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      decisionTaken: props.decisions[0]
    };
  }

  updateDecision = value => {
    this.setState({ decisionTaken: value });
  }

  handleSubmit = values => {
    this.props.evaluate({
      variables: values.variables,
      decision: this.state.decisionTaken
    });
  }

  render() {

    const {
      closeModal,
      decisions,
      initiallySelectedDecision
    } = this.props;

    const {
      decisionTaken = initiallySelectedDecision
    } = this.state;

    // flatten to make it easier to display and extend with own variables
    // TODO: get rid of nested loop
    const allInputVariables = decisions.flatMap(decision => {
      return decision.variables.map(variable => ({
        decision: decision.decision,
        decisionId: decision.decisionId,
        name: variable.expression,
        type: variable.type,
        value: ''
      }));
    });
    const allowedDecisions = [ decisionTaken.decisionId, ...decisionTaken.downstreamDecisions ];
    const filteredInputVariables = allInputVariables.filter(
      variable => allowedDecisions.includes(variable.decisionId)
    );
    const initialValues = { variables: filteredInputVariables };

    const onClose = () => closeModal();

    return (
      <Modal onClose={ onClose }>

        <Modal.Title>
          DMN Testing
        </Modal.Title>

        <Modal.Body>

          <div>
            <h3>Decision to evaluate</h3>
            <DecisionsDropdown
              selected={ decisionTaken }
              decisions={ decisions }
              onDecisionChanged={ this.updateDecision }
            />

            <h3>Variable inputs</h3>
            <Formik
              enableReinitialize
              initialValues={ initialValues }
              onSubmit={ this.handleSubmit }
            >
              {({ values }) => (
                <Form
                  id="dmnTestingInputVarsForm">
                  <FieldArray
                    name="variables"
                    render={ arrayHelpers => (
                      <div>
                        {values.variables && values.variables.length > 0 ? (
                          values.variables.map((_, index) => (
                            <div key={ index }>
                              <Field name={ `variables.${index}.decision` } disabled={ true } />
                              <Field name={ `variables.${index}.name` } />
                              <Field name={ `variables.${index}.value` } placeholder="<provide value>" />
                              <Field name={ `variables.${index}.type` } component="select">
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
            <button type="button" className="btn btn-secondary" onClick={ () => onClose() }>Cancel</button>
            <button type="submit" className="btn btn-primary" form="dmnTestingInputVarsForm">Test</button>
          </div>
        </Modal.Footer>
      </Modal>

    );
  }

}

