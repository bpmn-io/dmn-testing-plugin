let instance = null;

function DmnJsBridge(injector) {
  instance = {
    getRoot
  };

  // const sheet = injector.get('sheet');

  function getRoot() {
    console.log(injector);

    const sheet = injector.get('sheet', false);
    const canvas = injector.get('canvas', false);

    if (sheet) {
      const decisionTable = sheet.getRoot().businessObject;

      return decisionTable.$parent.$parent;
    } else if (canvas) {
      return canvas.getRootElement().businessObject;
    } else {
      return injector.get('viewer').getDecision().$parent;
    }
  }

  return instance;
}

DmnJsBridge.$inject = [ 'injector' ];

DmnJsBridge.getInstance = function() {
  return instance;
};

export default DmnJsBridge;
