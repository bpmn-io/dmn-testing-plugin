const fs = require('fs');

const getInputVariables = require('./InputVariableHelper').getInputVariables;

const DmnModdle = require('dmn-moddle');

const CamundaDmnModdle = require('camunda-dmn-moddle/resources/camunda.json')

const chai = require('chai');
const expect = chai.expect;

describe('getInputVariables', function() {

  it('should find all decisions', async function() {

    // given
    const definitions = await read('client/InputVarExtractionTestDiagram.dmn');

    // when
    const decisions = getInputVariables(definitions);

    // then
    expect(decisions.length).to.be.equal(2);
  });

   it('should parse variable types and decision structure', async function() {

    // given
    const definitions = await read('client/InputVarExtractionTestDiagram.dmn');

    // when
    const decisions = getInputVariables(definitions);

    // then
    expect(decisions[0].decision).to.equal('decision_1');
    expect(decisions[0].variables[0]).to.include({'name': 'inputVar1', 'type': 'string'});
    expect(decisions[0].variables[1]).to.include({'name': 'inputVar2', 'type': 'boolean'});
    expect(decisions[0].variables[2]).to.include({'name': 'inputVar3', 'type': 'integer'});
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