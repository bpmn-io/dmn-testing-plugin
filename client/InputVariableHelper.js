import { is } from 'dmn-js-shared/lib/util/ModelUtil';

/**
 *
 * @param {ModdleElement} moddle root element from where to extract the input variables
 *
 * @returns {Array<decisions>}
 */
export function getInputVariables(container) {

  // (1) get decisions
  const decisions = container.drgElement.filter((element) => 
    element && 
    element.$type === 'dmn:Decision' 
    && is(element.decisionLogic, 'dmn:DecisionTable'));

  // (2) get decisions dependencies as map with depth = 1
  let downstreamDecisions = { };
  // TODO implement as more performant for loop
  decisions.forEach(decision => {
    downstreamDecisions[decision.id] = (
      decision.informationRequirement && 
      decision.informationRequirement.length > 0 &&
      decision.informationRequirement.filter(infoReq => infoReq.requiredDecision).length > 0) ? 
      decision.informationRequirement.filter(infoReq => infoReq.requiredDecision)
        .map(infoReq => infoReq.requiredDecision.href.slice(1)) : 
    [];
  });

  // (3) for each decision, map name, variables and their types. Also add the downstream decisions
  const result = decisions.map((decision) => {
    const { decisionLogic } = decision;
    return {
      'decision': decision.name,
      'decisionId': decision.id,
      'variables': decision.decisionLogic.input.map((input) => {
        return {
          'name': input.label,
          'type': input.inputExpression.typeRef
        }
      }),
      'downstreamDecisions': downstreamDecisions[decision.id]
    };
  });

  return result;
}
