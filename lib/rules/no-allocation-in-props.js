/**
 * @fileoverview Disallow array and object literals as props values.
 * @author alexzherdev
 */

'use strict';

const Components = require('../util/Components');
const docsUrl = require('../util/docsUrl');
const isCreateElement = require('../util/isCreateElement');
const jsxUtil = require('../util/jsx');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const violationMessageStore = {
  array: 'Props should not use array allocations',
  object: 'Props should not use object allocations',
};

module.exports = {
  meta: {
    docs: {
      description: 'Disallow array and object literals as props values.',
      category: 'Best Practices',
      recommended: false,
      url: docsUrl('no-allocation-in-props'),
    },

    schema: [{
      type: 'object',
      properties: {
        allowArrays: {
          type: 'boolean',
          default: false,
        },
        allowObjects: {
          type: 'boolean',
          default: false,
        },
        ignoreDOMComponents: {
          type: 'boolean',
          default: false,
        },
      },
      additionalProperties: false,
    }],
  },

  create: Components.detect((context) => {
    const configuration = context.options[0] || {};

    // Keep track of all the variable names pointing to a bind call,
    // bind expression or an arrow function in different block statements
    const blockVariableNameSets = {};

    function setBlockVariableNameSet(blockStart) {
      blockVariableNameSets[blockStart] = {
        array: new Set(),
        object: new Set(),
      };
    }

    function getNodeViolationType(node) {
      const nodeType = node.type;

      if (
        nodeType === 'ConditionalExpression'
      ) {
        return getNodeViolationType(node.test)
               || getNodeViolationType(node.consequent)
               || getNodeViolationType(node.alternate);
      } if (
        !configuration.allowArrays
        && nodeType === 'ArrayExpression'
      ) {
        return 'array';
      } if (
        !configuration.allowObjects
        && nodeType === 'ObjectExpression'
      ) {
        return 'object';
      }

      return null;
    }

    function addVariableNameToSet(violationType, variableName, blockStart) {
      blockVariableNameSets[blockStart][violationType].add(variableName);
    }

    function getBlockStatementAncestors(node) {
      return context.getAncestors(node).reverse().filter(
        (ancestor) => ancestor.type === 'BlockStatement'
      );
    }

    function reportVariableViolation(node, name, blockStart) {
      const blockSets = blockVariableNameSets[blockStart];
      const violationTypes = Object.keys(blockSets);

      return violationTypes.find((type) => {
        if (blockSets[type].has(name)) {
          context.report({ node, message: violationMessageStore[type] });
          return true;
        }

        return false;
      });
    }

    function findVariableViolation(node, name) {
      getBlockStatementAncestors(node).find(
        (block) => reportVariableViolation(node, name, block.range[0])
      );
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    return {
      BlockStatement(node) {
        setBlockVariableNameSet(node.range[0]);
      },

      VariableDeclarator(node) {
        if (!node.init) {
          return;
        }
        const blockAncestors = getBlockStatementAncestors(node);
        const variableViolationType = getNodeViolationType(node.init);

        if (
          blockAncestors.length > 0
          && variableViolationType
          && node.parent.kind === 'const' // only support const right now
        ) {
          addVariableNameToSet(
            variableViolationType, node.id.name, blockAncestors[0].range[0]
          );
        }
      },

      JSXAttribute(node) {
        const isDOMComponent = jsxUtil.isDOMComponent(node.parent);
        if (configuration.ignoreDOMComponents && isDOMComponent) {
          return;
        }

        const valueNode = node.value.expression;
        const valueNodeType = valueNode.type;

        const nodeViolationType = getNodeViolationType(valueNode);

        if (valueNodeType === 'Identifier') {
          findVariableViolation(node, valueNode.name);
        } else if (nodeViolationType) {
          context.report({
            node, message: violationMessageStore[nodeViolationType],
          });
        }
      },

      CallExpression(node) {
        if (!isCreateElement(node, context) || node.arguments.length === 0) {
          return;
        }

        const isDOMComponent = node.arguments[0].type === 'Literal';

        if (configuration.ignoreDOMComponents && isDOMComponent) {
          return;
        }

        const propsArg = node.arguments[1];
        if (!propsArg || propsArg.type !== 'ObjectExpression') {
          return;
        }

        propsArg.properties.forEach((prop) => {
          if (prop.value) {
            const nodeViolationType = getNodeViolationType(prop.value);

            if (prop.value.type === 'Identifier') {
              findVariableViolation(node, prop.value.name);
            } else if (nodeViolationType) {
              context.report({
                node: prop, message: violationMessageStore[nodeViolationType],
              });
            }
          }
        });
      },
    };
  }),
};
