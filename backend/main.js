

module.exports = executeOnce(main, []);

async function main(app) {
  const {
    startCamunda,
    stopCamunda
  } = require('./camunda');

  try {
    await startCamunda();
    console.log('[dmn-testing-plugin] started Camunda');
  } catch (error) {
    console.error('[dmn-testing-plugin] unable to start Camunda', error);
    return;
  }

  app.on('quit', () => {
    console.log('[dmn-testing-plugin] closing Camunda');
    return stopCamunda();
  });
}


/**
 * Wrapper to make sure that wrapped function is executed only once.
 *
 * @param {function} fn
 * @param {*} returnValue
 */
function executeOnce(fn, returnValue) {
  let executed = false;

  return function(...args) {
    if (executed) {
      return returnValue;
    }

    executed = true;
    fn(...args);

    return returnValue;
  };
}