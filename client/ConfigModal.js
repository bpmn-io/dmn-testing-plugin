/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Modal } from 'camunda-modeler-plugin-helpers/components';


// we can even use hooks to render into the application
export default function ConfigModal({ initValues, onClose }) {
  const [ enabled, setEnabled ] = useState(initValues.enabled);
  const [ interval, setAutoSaveInterval ] = useState(initValues.interval);

  const onSubmit = () => onClose({ enabled, interval });

  // we can use the built-in styles, e.g. by adding "btn btn-primary" class names
  return <Modal onClose={ onClose }>
    <Modal.Title>
      AutoSave Configuration
    </Modal.Title>

    <Modal.Body>
      <form id="autoSaveConfigForm" onSubmit={ onSubmit }>
        <p>
          <label>
            Enabled:
            <input
              type="checkbox"
              name="enabled"
              checked={ enabled }
              onChange={ () => setEnabled(!enabled) }
            />
          </label>
        </p>
        <p>
          <label>
            Interval (seconds):
            <input
              type="number"
              name="interval"
              min="1"
              value={ interval }
              onChange={ event => setAutoSaveInterval(Number(event.target.value)) }
            />
          </label>
        </p>
      </form>
    </Modal.Body>

    <Modal.Footer>
      <div id="autoSaveConfigButtons">
        <button type="submit" class="btn btn-primary" form="autoSaveConfigForm">Save</button>
        <button type="button" class="btn btn-secondary" onClick={ () => onClose() }>Cancel</button>
      </div>
    </Modal.Footer>
  </Modal>;
}

