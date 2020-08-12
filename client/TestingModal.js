/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Modal } from 'camunda-modeler-plugin-helpers/components';


// we can even use hooks to render into the application
export default class ConfigModal extends React.PureComponent {

  constructor(props) {
    super(props);
  }

  render() {

    const {
      closeModal
    } = this.props;

    const onClose = () => closeModal();

    return (
      <Modal onClose={ onClose }>
        <Modal.Title>
          DMN Testing
        </Modal.Title>

        <Modal.Body>

          <div>
            <h3>Variable inputs</h3>
            <Formik
              id="dmnTestingInputVarsForm"
              initialValues={ { variables: [{ 
                'name': 'varA',
                'type': 'string',
                'value': 'foobar' }] } }
                onSubmit={ values => console.log(values.variables) }
              render={ ({ values }) => (
                <Form>
                  <FieldArray
                    name="variables"
                    render={ arrayHelpers => (
                      <div>
                        {values.variables && values.variables.length > 0 ? (
                          values.variables.map((_, index) => (
                            <div key={ index }>
                              <Field name={ `variables.${index}.name` } />
                              <Field name={ `variables.${index}.value` } />
                              <select
                                name="type"
                                value={ `variables.${index}.type` }
                                //onChange={ handleChange }
                              >
                                <option value="" label="Select variable type" />
                                <option value="string" label="string" />
                                <option value="boolean" label="boolean" />
                                <option value="integer" label="integer" />
                                <option value="long" label="long" />
                                <option value="double" label="double" />
                                <option value="date" label="date" />
                              </select>
                              <button
                                type="button"
                                onClick={ () => arrayHelpers.remove(index) } // remove a friend from the list
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={ () => arrayHelpers.insert(index, '') } // insert an empty string at a position
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
                                      <div>
                   <button type="submit">Submit</button>
                 </div>
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

  // we can use the built-in styles, e.g. by adding "btn btn-primary" class names

}

