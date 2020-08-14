# dmn-testing-plugin

This plugin allows to test DRD diagrams. Currently the plugin supports the following core features:
 * Parsing input variables for a given DRD and decision and letting the user define the respective values. 
 * Starting an embeded lightweight Camunda DMN decision engine as `JAVA` sub-process.
 * Evaluating the DRD with the given input values and displaying the results.

![](./resources/screencast.gif)

## How to use

1. Make sure to have `JAVA` installed (required to run the DMN decision engine).
2. Download and copy this repository into the `plugin` directory of the Camunda Modeler.
3. Start the Camunda Modeler
4. Start the `Testing` Modal by clicking the respective menu button.

Refer to the [plugins documentation](https://github.com/camunda/camunda-modeler/tree/master/docs/plugins#plugging-into-the-camunda-modeler) to get detailed information on how to create and integrate Camunda Modeler plugins.

## Development Setup

Clone this repository.

Install all dependencies
```
$ npm install
```

Build the plugin and copy to the `plugin` directory of the Camunda Modeler (see [How to use](./README.md#how-to-use)
```
$ npm run all
```

## Resources

* [Camunda Modeler plugins documentation](https://github.com/camunda/camunda-modeler/tree/master/docs/plugins#plugging-into-the-camunda-modeler)

## License

MIT
