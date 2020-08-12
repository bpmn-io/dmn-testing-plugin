/**
 *
 * @param {ModdleElement} moddle root element from where to extract the input variables
 *
 * @returns {Array<decisions>}
 */
function getInputVariables(container) {

  // (1) get decisions
  const decisions = container.drgElement.filter((element) => element && element.$type === 'dmn:Decision');

  // (2) for each decision, map name, variables and their types
  const result = decisions.map((decision) => {
    return {
      'decision': decision.name,
      'variables': decision.decisionLogic.input.map((input) => {
        return {
          'name': input.label,
          'type': input.inputExpression.typeRef
        };
      })
    };
  });

  return result;
}

module.exports.getInputVariables = getInputVariables;