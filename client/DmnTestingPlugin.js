/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

/* eslint-disable no-unused-vars*/
import React, { Fragment, PureComponent } from 'camunda-modeler-plugin-helpers/react';
import { Fill } from 'camunda-modeler-plugin-helpers/components';
import TestingModal from './TestingModal';
import { getInputVariables } from './InputVariableHelper';


export default class DmnTestingPlugin extends PureComponent {

  constructor(props) {
    super(props);

    this.modelersMap = new Map();

    this.state = {
      activeTab: null,
      modalOpen: false,
      inputVariables: null
    };
  }

  evaluateDmn = async inputVariables => {
    const { activeTab } = this.state;

    const xml = activeTab.file.contents;

    console.log('Now send to DMN engine and retrieve results');
    console.log(inputVariables);
    console.log(xml);

    // TODO
  }

  componentDidMount() {

    /**
    * The component props include everything the Application offers plugins,
    * which includes:
    * - config: save and retrieve information to the local configuration
    * - subscribe: hook into application events, like <tab.saved>, <app.activeTabChanged> ...
    * - triggerAction: execute editor actions, like <save>, <open-diagram> ...
    * - log: log information into the Log panel
    * - displayNotification: show notifications inside the application
    */
    const {
      subscribe
    } = this.props;

    // subscribe to the event when the active tab changed in the application
    subscribe('app.activeTabChanged', ({ activeTab }) => {
      this.setState({ activeTab });
    });

    subscribe('dmn.modeler.created', ({ modeler, tab }) => {
      if (this.modelersMap.has(tab)) {
        return;
      }

      this.modelersMap.set(tab, modeler);
    });
  }

  openModal = async () => {
    const tab = await this.saveActiveTab();

    // don't open modal if tab has not been saved
    if (!tab) {
      return;
    }

    const modeler = this.getModeler();
    const definitions = modeler.getDefinitions();

    const inputVariables = getInputVariables(definitions);

    this.setState({ modalOpen: true, inputVariables });
  }

  saveActiveTab() {
    const {
      triggerAction
    } = this.props;

    // trigger a tab save operation
    return triggerAction('save-tab', { tab: this.state.activeTab });
  }

  getModeler() {
    return this.modelersMap.get(this.state.activeTab);
  }

  render() {
    const { activeTab, inputVariables, modalOpen } = this.state;

    // we can use fills to hook React components into certain places of the UI
    return (activeTab && activeTab.type === 'dmn') ? <Fragment>
      <Fill slot="toolbar" group="9_autoSave">
        <button type="button" onClick={ this.openModal }>
          Dmn Testing Plugin!
        </button>
      </Fill>
      { modalOpen && (
        <TestingModal
          closeModal={ () => this.setState({ modalOpen: false }) }
          inputVariables={ inputVariables }
          evaluate={ this.evaluateDmn }
        />
      )}
    </Fragment> : null;
  }
}
