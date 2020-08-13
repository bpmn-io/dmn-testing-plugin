/* eslint-disable no-unused-vars */
import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Modal } from 'camunda-modeler-plugin-helpers/components';


// we can even use hooks to render into the application
export default class TestingModal extends React.PureComponent {

  constructor(props) {
    super(props);
  }

  render() {

    const {
      closeModal,
      evaluate,
      inputVariables
    } = this.props;

    let initialValues = inputVariables || {
      variables: [{
        'name': 'varA',
        'type': 'string',
        'value': 'foobar'
      }]
    };

    const onClose = () => closeModal();

    const onSubmit = (variables) => evaluate(variables);

    return (
      <Modal onClose={ onClose }>

        <Modal.Title>
          DMN Testing
        </Modal.Title>

        <Modal.Body>

          <div>
            <h3>Variable inputs</h3>
            <Formik
              initialValues={ initialValues }
              onSubmit={
                values => {
                  onSubmit(values.variables);
                }

                // values => console.log(values.variables)
              }
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
                              <Field name={ `variables.${index}.name` } />
                              <Field name={ `variables.${index}.value` } />
                              <Field name={ `variables.${index}.type` } component="select">
                                <option value="">Select variable type</option>
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
                                onClick={ () => arrayHelpers.insert(index, '') }
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

