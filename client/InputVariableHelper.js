import { is } from 'dmn-js-shared/lib/util/ModelUtil';

/**
 *
 * @param {ModdleElement} container is the root element from where to extract the input variables
 *
 * @returns {Array<decisions>}
 */
export function getInputVariables(container) {
  // (1) get decisions
  const decisions = getDecisions(container);

  // (2) get downstream decisions
  const downstreamDecisions = getDownstreamDecisions(decisions);

  // (3) for each decision, map name, variables and their types. Also add the downstream decisions
  const result = decisions.map((decision) => {
    return {
      'decision': decision.name,
      'decisionId': decision.id,
      'variables': decision.decisionLogic.input.filter(input => !isOutput(input, decisions))
        .map((input) => {
          return {
            'name': input.label,
            'type': input.inputExpression.typeRef,
            'expression': input.inputExpression.text
          }
        }),
      'downstreamDecisions': downstreamDecisions[decision.id]
    };
  });

  return result;
}

/**
 * 
 * @param {ModdleElement} container is the root element from where to extract the decisions from
 * 
 * @returns {Array<decisions>} an array of moddle decision elements
 */
function getDecisions(container) {
  return container.drgElement.filter((element) => 
    element && 
    element.$type === 'dmn:Decision' 
    && is(element.decisionLogic, 'dmn:DecisionTable'));
}

/**
 * @param {Array<ModdleElement>} decisions an array of ModdleElements representing dmn decisions
 * 
 * @returns {DownstreamDecisionsObject} an object which represents a map of decision.id : [<string>downstreamDecisionIds]
 */
function getDownstreamDecisions(decisions) {
  // (1) create a simple dependency map
  let downstreamDecisionMap = { };

  decisions.forEach(decision => {
    let downstreamDecisions = (decision.informationRequirement && 
      decision.informationRequirement.length > 0 &&
      decision.informationRequirement.filter(infoReq => infoReq.requiredDecision).length > 0) ? 
      decision.informationRequirement.filter(infoReq => infoReq.requiredDecision)
        .map(infoReq => infoReq.requiredDecision.href.slice(1)) : 
    [];

    downstreamDecisionMap[decision.id] = downstreamDecisions;
  });

  // (2) get the transient dependencies
  for (const decId in downstreamDecisionMap) {
    downstreamDecisionMap[decId] = getTransientDecIds(decId, downstreamDecisionMap).filter(uniqueFilter);
  }

  // (3) return result
  return downstreamDecisionMap;

  // helpers //////////

  function getTransientDecIds(decId, downstreamDecisionMap) {
    if(downstreamDecisionMap[decId] === undefined || downstreamDecisionMap[decId].length == 0) {
      return []
    } else {
      return downstreamDecisionMap[decId]
        .concat(downstreamDecisionMap[decId]
          .map(transId => getTransientDecIds(transId, downstreamDecisionMap))).flat();
    }
  }

  function uniqueFilter(element, index, array) {
    return array.indexOf(element) === index;
  }
}

/**
 * 
 * @param {ModdleElement} input is a moddle element representing a DMN decision input
 * @param {Array<ModdleElement>} decisions an array of moddle element, each representing a DMN decision
 * 
 * @returns {boolean} will return a boolean indicating whether the input expression is also used as an output in one of the decisions
 */
function isOutput(input, decisions) {
  if(input && 
    input.inputExpression && 
    input.inputExpression.text) {
        const inputExp = input.inputExpression.text;
        const outputExpressions = getOutputExpressions(decisions);
        return outputExpressions.includes(inputExp) ? true : false;
  } else {
    return false;
  }
}

/**
 * 
 * @param {Array<ModdleElement>} decisions an array of moddle element, each representing a DMN decision
 * 
 * @returns {Array<string>} an array of strings, each the name of an output Expressions
 */
function getOutputExpressions(decisions) {
  const outputClauses = decisions.map(dec => dec.decisionLogic.output).flat();
  return outputClauses.filter(clause => clause.name).map(clause => clause.name);
}