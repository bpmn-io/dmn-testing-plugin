const HIGHLIGHTING_STYLE = `{
  background-color: #a2c5ff !important;
  background-color: var(--blue-lighten-82) !important;
}`;

const TOGGLE_EVENTS = [ 'attach', 'detach' ];

export function createResultsHighlighting(dmnTestingPlugin) {
  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);
  const { sheet } = styleElement;

  let modeler;

  function clear() {
    if (sheet.cssRules.length) {
      sheet.removeRule(0);
    }

    if (modeler) {
      modeler.off(TOGGLE_EVENTS, toggleSheet);
    }
  }

  function highlightResults(results) {
    this.clear();

    const selector = getRulesSelector(results);

    sheet.insertRule(`${selector}${HIGHLIGHTING_STYLE}`, 0);
    sheet.disabled = false;

    modeler = dmnTestingPlugin.getModeler();
    modeler.on(TOGGLE_EVENTS, toggleSheet);
  }

  function destroy() {
    styleElement.remove();
  }

  function toggleSheet() {
    sheet.disabled = !sheet.disabled;
  }

  return {
    clear,
    highlightResults,
    destroy
  };
}

function getRulesSelector(results) {
  const ruleIds = getRuleIds(results);

  const rowSelectors = ruleIds.map(id => `[data-row-id=${id}]`);

  // select also "add input" cells in case of missing input
  const addInputSelectors = rowSelectors.map(rowSelector => `${rowSelector} + td`);

  return rowSelectors.concat(addInputSelectors)
    .join(',');
}

/**
 * Extract rule ids from results.
 *
 * @param {{ ruleId: string[] }[]} results
 * @returns {string[]}
 */
function getRuleIds(results) {
  return results.flatMap(result => result.ruleId);
}
