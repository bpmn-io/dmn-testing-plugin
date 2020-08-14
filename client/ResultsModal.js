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

        {
          error ?
            <ErrorResults error={ error } /> :
            <SuccessResults results={ results } />
        }

      </Modal.Body>

      <Modal.Footer>
        <div>
          <button type="button" className="btn btn-secondary" onClick={ goBack }>Go back</button>
          <button type="button" className="btn btn-primary" onClick={ onClose } autoFocus>Close</button>
        </div>
      </Modal.Footer>
    </Modal>

  );
}

function ErrorResults(props) {
  const { error } = props;

  return (
    <Fragment>
      <h3>
        Evaluation failed
      </h3>
      <div>
        { error.message }
      </div>
    </Fragment>
  );
}

function SuccessResults(props) {
  const { results } = props;

  const Results = () => (
    <ul>
      {
        results.map(decision => (
          <li title={ 'id: ' + decision.id }>
            {decision.name}
            { decision.outputs.length ? (
              <ul>
                { decision.outputs.map(output => (
                  <li title={ 'id: ' + output.id }>{output.name}: {output.values.join(', ')}</li>
                )) }
              </ul>
            ) : null }
          </li>
        ))
      }
    </ul>
  );

  return (
    <Fragment>
      <h3>
        Successfully evaluated decision
      </h3>
      <div>
        Results per decision:
        <Results />
      </div>
    </Fragment>
  );
}
