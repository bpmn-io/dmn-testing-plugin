# Camunda-DMN-Testserver

This is the backend component for the Camunda-DMN-Test-Plugin. It runs a Springboot application that provides a REST endpoint `/evaluateDecision` which takes the request, evaluates the decision and returns the results.

## How does it work?
The request object (json) contains the input data as variables object. Each variable consists of a name and an object having a value and a type. 
The xml with the DMN needs to be part of the request as well. It needs to be escaped properly.
 
Optionally a decision can be defined that needs to be evaluated in case of a DRD with multiple Decisions. If no decision is specified the top-level decision will be evaluated.

The response contains for every evaluated decision the matching rules and the ouput values for each rule. 
The top level decision also contains the output values directly in an attribute `results` as an JSON object (Strings are escaped)!

## How to run
The project requires a JDK >=1.8. 

The project contains a maven-wrapper, so it can be started locally (even without having Maven installed) with:

    ./mvnw clean spring-boot:run --server.port=8080
Requests then can be sent to `http://localhost:8080/evaluateDecision`


### Request structure example 
The whole example resides in `/src/test/resources/exampleRequest.json`

```json
{
  "variables" : {
    "guestsWithChildren" : { "value" : true, "type" : "Boolean" },
    "season" : { "value" : "Winter", "type" : "String" },
    "guestCount" : { "value" : 10, "type" : "Integer" }
  },
  "decision": "beverages",
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions ... >... </definitions>"
}
```

### Response structure example

```json
{
    "beverages": {
        "results": "[{\"beverages\":\"Guiness\"},{\"beverages\":\"Apple Juice\"}]",
        "rules": [
            {
                "ruleId": "row-506282952-8",
                "outputs": [
                    {
                        "OuputClause_99999": "Guiness"
                    }
                ]
            },
            {
                "ruleId": "row-506282952-11",
                "outputs": [
                    {
                        "OuputClause_99999": "Apple Juice"
                    }
                ]
            }
        ]
    },
    "dish": {
        "rules": [
            {
                "ruleId": "row-506282952-5",
                "outputs": [
                    {
                        "OutputClause_0lfar1z": "Stew"
                    }
                ]
            }
        ]
    }
}

```
