const which = require('which');
const execa = require('execa');
const path = require('path');

const CAMUNDA_PATH = path.resolve(__dirname, 'camunda/artefacts/camundaDmnTestServer.jar');
let camundaProcess;


module.exports = {
  startCamunda,
  stopCamunda
};

async function startCamunda() {
  const javaPath = await which('java');
  const args = [
    '-jar',
    CAMUNDA_PATH,
    '--server.port=9999'
  ];

  camundaProcess = await execa(javaPath, args, {
    stdio: 'ignore'
  });
}

function stopCamunda() {
  if (!camundaProcess) {
    return;
  }

  camundaProcess.kill();
}
