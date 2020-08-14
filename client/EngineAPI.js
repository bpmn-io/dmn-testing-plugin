export default class EngineAPI {
  constructor(restEndpoint) {
    this.restEndpoint = restEndpoint;
  }

  async evaluateDecision({ xml, decision, variables }) {
    const payload = this.getPayload(xml, decision, variables);
    const headers = {
      accept: 'application/json'
    };

    const res = await fetch(this.restEndpoint + '/evaluateDecision', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const body = await res.json();

    if (body.error) {
      throw new Error(body.error);
    }

    return body;
  }

  getPayload(xml, decision, variables) {
    const payload = {
      decision: decision.decisionId,
      xml,
      variables: {}
    };

    for (const { name, type, value } of variables) {
      payload.variables[name] = { type, value };

      // cast types when required
      if (type === 'boolean') {
        payload.variables[name].value = Boolean(value);
      } else if ([ 'integer', 'long', 'double' ].includes(type)) {
        payload.variables[name].value = Number(value);
      }
    }

    return payload;
  }
}