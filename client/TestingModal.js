/* eslint-disable no-unused-vars */
import React, { Fragment } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Modal } from 'camunda-modeler-plugin-helpers/components';


// we can even use hooks to render into the application
export default class ConfigModal extends React.PureComponent {

  constructor(props) {
    super(props);
  }

  render() {

    const {
      closeModal,
      evaluate
    } = this.props;

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
              initialValues={ { variables: [{
                'name': 'varA',
                'type': 'string',
                'value': 'foobar' }] } }
              onSubmit={
                values => {
                  onSubmit(values.variables);
                }

                // values => console.log(values.variables)
              }
              render={ ({ values }) => (
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
              ) }
            />

          </div>
        </Modal.Body>

        <Modal.Footer>
          <div id="autoSaveConfigButtons">
            <button type="submit" class="btn btn-primary" form="dmnTestingInputVarsForm">Test</button>
            <button type="button" class="btn btn-secondary" onClick={ () => onClose() }>Cancel</button>
          </div>
        </Modal.Footer>
      </Modal>

    );
  }

}

