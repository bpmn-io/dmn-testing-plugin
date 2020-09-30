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
import EngineAPI from './EngineAPI';
import ResultsModal from './ResultsModal';
import { map } from 'min-dash';

import { createResultsHighlighting } from './results-highlighting/ResultsHighlighting';

const ENGINE_ENDPOINT = 'http://localhost:9999';


export default class DmnTestingPlugin extends PureComponent {

  constructor(props) {
    super(props);

    this.modelersMap = new Map();

    this.state = {
      activeTab: null,
      modalOpen: false,
      decisions: null,
      evaluation: null
    };

    this.resultsHighlighting = createResultsHighlighting(this);
  }

  evaluateDmn = async ({ decision, variables }) => {
    const { activeTab } = this.state;
    const xml = activeTab.file.contents;

    const engineAPI = new EngineAPI(ENGINE_ENDPOINT);

    let evaluation;
    try {
      const rawResults = await engineAPI.evaluateDecision({ xml, decision, variables });
      const results = this.getResults(rawResults);

      evaluation = { results };
    } catch (error) {
      evaluation = { error };
    }

    this.setState({
      evaluation: evaluation
    });
  }

  // TODO @barmac: refactor
  getResults(rawResults) {
    const definitions = this.getDefinitions();
    const drg = definitions.get('drgElement');

    const results = map(rawResults, ({ rules }, decisionId) => {
      const businessObject = drg.find(({ id }) => id === decisionId);
      const {
        id,
        name,
        decisionLogic
      } = businessObject;

      const result = { id, name, outputs: [] };

      result.outputs = rules.map(rule => rule.outputs).flat();
      result.ruleId = rules.map(rule => rule.ruleId);

      const decisionOutputs = decisionLogic.get('output');
      const simpleOutputs = decisionOutputs.map(
        ({ id, name, expression }) => ({ id, name, expression, values: [] })
      );

      for (const output of result.outputs) {
        const [ id, value ] = Object.entries(output)[0];

        const actualOutput = simpleOutputs.find(o => o.id === id);
        actualOutput.values.push(value);
      }

      result.outputs = simpleOutputs;

      return result;
    });

    return results;
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

    const definitions = this.getDefinitions();
    const decisions = getInputVariables(definitions);

    this.setState({ modalOpen: true, decisions });
  }

  saveActiveTab() {
    const {
      triggerAction
    } = this.props;

    // trigger a tab save operation
    return triggerAction('save-tab', { tab: this.state.activeTab });
  }

  getDefinitions() {
    return this.getModeler().getDefinitions();
  }

  getModeler() {
    return this.modelersMap.get(this.state.activeTab);
  }

  getCurrentBodyRows() {
    return this.getModeler()._container.querySelectorAll('tbody tr');
  }

  closeResults = goBack => {
    if (goBack) {
      return this.setState({ evaluation: null });
    }

    // clear rule highlighting
    this.resultsHighlighting.clear();

    this.setState({
      evaluation: null,
      modalOpen: false
    });
  }

  highlightResults = () => {
    this.resultsHighlighting.highlightResults(this.state.evaluation.results);

    this.setState({
      modalOpen: false
    });
  }

  render() {
    const {
      activeTab,
      decisions,
      evaluation,
      modalOpen
    } = this.state;

    // we can use fills to hook React components into certain places of the UI
    return (activeTab && activeTab.type === 'dmn') ? <Fragment>
      <Fill slot="toolbar" group="9_autoSave">
        <button type="button" onClick={ this.openModal }>
          DMN Testing
        </button>
      </Fill>
      {
        modalOpen && evaluation ? (
          <ResultsModal
            closeModal={ this.closeResults }
            evaluation={ evaluation }
            displayInDiagram={ this.highlightResults }
          />
        ) : modalOpen ? (
          <TestingModal
            closeModal={ () => this.setState({ modalOpen: false }) }
            decisions={ decisions }
            initiallySelectedDecision={ decisions[0] }
            evaluate={ this.evaluateDmn }
          />
        ) : null
      }
    </Fragment> : null;
  }
}
