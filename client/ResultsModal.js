import React, { Fragment } from 'react';
import { Modal } from 'camunda-modeler-plugin-helpers/components';


export default function ResultsModal(props) {
  const {
    closeModal,
    evaluation
  } = props;

  const { error, results } = evaluation;
  const goBack = () => closeModal(true);
  const onClose = () => closeModal();

  return (
    <Modal onClose={ onClose }>

      <Modal.Title>
        Test Results
      </Modal.Title>

      <Modal.Body>

        { error ? (
          <Fragment>
            <h3>
              Evaluation failed
            </h3>
            <div>
              { error.message }
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <h3>
              Successfully evaluated decision
            </h3>
            <div>
              Results:
              <pre>
                { asReadableJSON(results) }
              </pre>
            </div>
          </Fragment>
        )}

      </Modal.Body>

      <Modal.Footer>
        <div>
          <button type="button" className="btn btn-secondary" onClick={ goBack }>Go back</button>
          <button type="button" className="btn btn-primary" onClick={ onClose }>Close</button>
        </div>
      </Modal.Footer>
    </Modal>

  );
}

function asReadableJSON(object) {
  return JSON.stringify(object, null, 2);
}
