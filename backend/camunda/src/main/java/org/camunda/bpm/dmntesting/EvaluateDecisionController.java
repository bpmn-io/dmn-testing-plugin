package org.camunda.bpm.dmntesting;

import static org.camunda.spin.Spin.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.camunda.bpm.dmn.engine.DmnDecision;
import org.camunda.bpm.dmn.engine.DmnDecisionResult;
import org.camunda.bpm.dmn.engine.DmnEngine;
import org.camunda.bpm.dmn.engine.DmnEngineConfiguration;
import org.camunda.bpm.dmn.engine.delegate.DmnDecisionLogicEvaluationEvent;
import org.camunda.bpm.dmn.engine.delegate.DmnDecisionTableEvaluationEvent;
import org.camunda.bpm.dmn.engine.delegate.DmnEvaluatedDecisionRule;
import org.camunda.bpm.dmn.engine.delegate.DmnEvaluatedOutput;
import org.camunda.bpm.dmn.engine.impl.DefaultDmnEngineConfiguration;
import org.camunda.bpm.engine.variable.VariableMap;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.spin.impl.json.jackson.JacksonJsonNode;
import org.camunda.spin.json.SpinJsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/evaluateDecision")
public class EvaluateDecisionController {

	private static Logger log = Logger.getLogger(EvaluateDecisionController.class);

	@Autowired
	private SimulatorDecisionTableEvaluationListener evaluationListener;

	@SuppressWarnings("unchecked")
	@RequestMapping(method = RequestMethod.POST)
	String evaluateDecision(@RequestBody String reqBody, HttpServletResponse resp) {

		log.debug("evaluateDecision called with requestBody:" + reqBody);

		SpinJsonNode rootNode = JSON("{}");
		try {

			SpinJsonNode requestNode = JSON(reqBody);
			String decisionToEvaluate = null;
			if (requestNode.hasProp("decision")) {
				decisionToEvaluate = requestNode.prop("decision").stringValue();
			}
			VariableMap variables = getVariables(requestNode);

			// get decision engine
			DmnEngine dmnEngine = buildDecisionEngine();

			// load decision table
			InputStream inputStream = new ByteArrayInputStream(
					requestNode.prop("xml").stringValue().getBytes(StandardCharsets.UTF_8));

			DmnDecision decision = parseDecision(decisionToEvaluate, dmnEngine, inputStream);

			DmnDecisionResult result = dmnEngine.evaluateDecision(decision, variables);

			SpinJsonNode decisionNode = JSON("{}");
			SpinJsonNode resultValues = JSON(result.getResultList());
			decisionNode.prop("results", resultValues.toString());
			rootNode.prop(decision.getKey(), decisionNode);

			getEvaluatedRules(rootNode);

		} catch (Exception e) {
			rootNode.prop("error", e.getMessage());
		}

		resp.setHeader("Content-Type", "application/json;charset=UTF-8");

		String json = rootNode.toString();
		log.debug("Result: " + json);
		return json;
	}

	@SuppressWarnings("unchecked")
	private void getEvaluatedRules(SpinJsonNode rootNode) {
		List<DmnDecisionTableEvaluationEvent> evaluationEvents = evaluationListener.getLastEvents();

		for (DmnDecisionTableEvaluationEvent evaluationEvent : evaluationEvents) {
			String currentDecisionKey = evaluationEvent.getDecision().getKey();
			List<Object> evaluatedRules = getEvaluatedRules(evaluationEvent);

			if (rootNode.hasProp(currentDecisionKey)) {
				SpinJsonNode currentDecisionNode = rootNode.prop(currentDecisionKey);
				currentDecisionNode.prop("rules", evaluatedRules);
			} else {
				SpinJsonNode rulesNode = JSON("{}");
				rulesNode.prop("rules", evaluatedRules);
				rootNode.prop(currentDecisionKey, rulesNode);
			}
		}
	}

	private VariableMap getVariables(SpinJsonNode requestNode) throws Exception {
		@SuppressWarnings({ "unchecked" })
		HashMap<String, String> mappedVariables = (HashMap<String, String>) requestNode.prop("variables")
				.mapTo(java.util.HashMap.class);

		VariableMap variables = Variables.createVariables();
		for (Entry<String, String> variable : mappedVariables.entrySet()) {

			SpinJsonNode valueJson = JSON(variable.getValue());
			SpinJsonNode valueJsonValueNode = valueJson.prop("value");
			if (valueJsonValueNode.isArray()) {
				JacksonJsonNode o = (JacksonJsonNode) valueJsonValueNode;
				ArrayList<Object> myVariable = o.mapTo(ArrayList.class);
				variables.putValue(variable.getKey(), myVariable);
			} else {
				Object valueObj = valueJsonValueNode.value();
				if (valueJson.hasProp("type")) {
					String type = valueJson.prop("type").stringValue();
					if (type.equalsIgnoreCase("String")) {
						variables.putValueTyped(variable.getKey(), Variables.stringValue((String) valueObj));
					} else if (type.equalsIgnoreCase("Boolean")) {
						variables.putValueTyped(variable.getKey(), Variables.booleanValue((Boolean) valueObj));
					} else if (type.equalsIgnoreCase("Integer")) {
						variables.putValueTyped(variable.getKey(), Variables.integerValue((Integer) valueObj));
					} else if (type.equalsIgnoreCase("Double")) {
						variables.putValueTyped(variable.getKey(), Variables.doubleValue((Double) valueObj));
					} else if (type.equalsIgnoreCase("Long")) {
						variables.putValueTyped(variable.getKey(), Variables.longValue((Long) valueObj));
					} else if (type.contains("Date")) {
						Date date = getDateObject((String) valueObj);
						if (date == null) {
							throw new RuntimeException("Could not parse Date from String: " + (String) valueObj);
						}
						variables.putValueTyped(variable.getKey(), Variables.dateValue(date));
					} else {
						// simply put the object as untyped value
						variables.putValue(variable.getKey(), valueObj);
					}
				} else {
					// simply put the object as untyped value
					variables.putValue(variable.getKey(), valueObj);
				}
			}
		}
		return variables;
	}

	private Date getDateObject(String dateString) {
		Date date = null;
		// @formatter:off
		String[] formats = new String[] { 
				"yyyy-MM-dd'T'HH:mm:ss.SSSZ",
				"yyyy-MM-dd'T'HH:mm:ssZ", 
				"yyyy-MM-dd'T'HH:mm:ss.SSS", 
				"yyyy-MM-dd'T'HH:mm:ss",
				"yyyy-MM-dd" 
				};
		// @formatter:on
		for (String format : formats) {
			DateFormat df = new SimpleDateFormat(format);
			try {
				date = df.parse(dateString);
				break;
			} catch (ParseException e) {
				// ignore and try the next possible format
			}
		}
		return date;

	}

	private DmnEngine buildDecisionEngine() {
		DefaultDmnEngineConfiguration engineConfiguration = (DefaultDmnEngineConfiguration) DmnEngineConfiguration
				.createDefaultDmnEngineConfiguration();
		engineConfiguration.getCustomPostDecisionTableEvaluationListeners().add(evaluationListener);
		engineConfiguration.setDefaultOutputEntryExpressionLanguage("feel");
		DmnEngine dmnEngine = engineConfiguration.buildEngine();
		return dmnEngine;
	}

	private List getEvaluatedRules(DmnDecisionLogicEvaluationEvent dmnDecisionLogicEvaluationEvent) {
		List rulesList = new LinkedList<SpinJsonNode>();
		if (dmnDecisionLogicEvaluationEvent instanceof DmnDecisionTableEvaluationEvent) {
			DmnDecisionTableEvaluationEvent dmnTableEvent = (DmnDecisionTableEvaluationEvent) dmnDecisionLogicEvaluationEvent;
			for (DmnEvaluatedDecisionRule matchedRule : dmnTableEvent.getMatchingRules()) {
				SpinJsonNode rulesNode = JSON("{}");
				rulesNode.prop("ruleId", matchedRule.getId());
				List outputList = new LinkedList();
				for (DmnEvaluatedOutput output : matchedRule.getOutputEntries().values()) {
					SpinJsonNode outputProp = JSON("{}");
					outputProp.prop(output.getId(), output.getValue().getValue().toString());
					outputList.add(outputProp);
				}

				rulesNode.prop("outputs", outputList);
				rulesList.add(rulesNode);
			}
		}
		return rulesList;
	}

	private DmnDecision parseDecision(String decisionToEvaluate, DmnEngine dmnEngine, InputStream inputStream) {
		DmnDecision decision;
		if (decisionToEvaluate != null && !decisionToEvaluate.trim().equals("")) {
			decision = dmnEngine.parseDecision(decisionToEvaluate, inputStream);
		} else {
			// get top level decision
			List<DmnDecision> decisions = dmnEngine.parseDecisions(inputStream);
			decision = getRootDecision(decisions);
		}
		return decision;
	}

	private DmnDecision getRootDecision(List<DmnDecision> decisions) {
		Set<DmnDecision> allRequiredDecisions = new TreeSet<DmnDecision>(new Comparator<DmnDecision>() {
			@Override
			public int compare(DmnDecision dec1, DmnDecision dec2) {

				return dec1.getKey().compareTo(dec2.getKey());
			}
		});

		for (DmnDecision dmnDecision : decisions) {
			Collection<DmnDecision> requiredDecisions = dmnDecision.getRequiredDecisions();
			allRequiredDecisions.addAll(requiredDecisions);
		}

		// return that single decision that is not required by another decision
		// ==> therefore supposed to be the uppermost decision within that DRD
		decisions.removeAll(allRequiredDecisions);
		return decisions.get(0);
	}

}
