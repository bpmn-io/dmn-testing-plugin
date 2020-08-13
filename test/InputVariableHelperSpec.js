import fs from 'fs';

import { getInputVariables } from '../client/InputVariableHelper';

import DmnModdle from 'dmn-moddle';

import { expect } from 'chai';

describe('getInputVariables', function() {

  it('should find all decisions', async function() {

    // given
    const definitions = await read('./test/InputVarExtractionTestDiagram.dmn');

    // when
    const decisions = getInputVariables(definitions);

    // then
    expect(decisions.length).to.be.equal(2);
  });


  it('should parse variable types and decision structure', async function() {

    // given
    const definitions = await read('./test/InputVarExtractionTestDiagram.dmn');

    // when
    const decisions = getInputVariables(definitions);

    // then
    expect(decisions[0].decision).to.equal('decision_1');
    expect(decisions[0].variables[0]).to.include({ 'name': 'inputVar1', 'type': 'string' });
    expect(decisions[0].variables[1]).to.include({ 'name': 'inputVar2', 'type': 'boolean' });
    expect(decisions[0].variables[2]).to.include({ 'name': 'inputVar3', 'type': 'integer' });
  });


  it('should parse downstream decisions with depth = 1', async function() {

    // given
    const definitions = await read('./test/DependentDecisionsDiagram.dmn');

    // when
    const decisions = getInputVariables(definitions);

    console.log(decisions);

    // then
    expect(decisions.length).to.be.equal(3);
    expect(decisions[1].downstreamDecisions.length).to.be.equal(2);
    expect(decisions[1].downstreamDecisions[0]).to.be.equal('decision_1');
  });


  it('should ignore input expressions', async function() {

    // given
    const definitions = await read('./test/LiteralExpressionTest.dmn');

    // when
    const decisions = getInputVariables(definitions);

    // then
    expect(decisions.length).to.be.equal(1);
  });

});

// helpers

async function read(fileName, root = 'dmn:Definitions') {
  const moddle = new DmnModdle();

  return new Promise((resolve, reject) => {
    const file = fs.readFileSync(fileName, 'utf8');

    moddle.fromXML(file, root, (err, definitions) => {
      if (err) {
        reject(err);
      }

      resolve(definitions);
    });
  });
}