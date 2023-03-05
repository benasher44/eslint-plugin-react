/**
 * @fileoverview Disallow array and object literals as props values.
 * @author alexzherdev
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/no-allocation-in-props');
const parsers = require('../../helpers/parsers');

const parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
};

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });
ruleTester.run('no-allocation-in-props', rule, {

  valid: parsers.all([
    // Not covered by the rule
    {
      code: 'React.createElement()',
    },
    {
      code: '<Foo bar={foo} />',
    },
    {
      code: '<Foo bar={foo} />',
    },
    {
      code: 'React.createElement(Foo, { bar: foo })',
    },
    {
      code: 'React.createElement(Foo, { bar: foo })',
    },

    // allowArrays
    {
      code: '<Foo bar={[1, 2, 3]} />',
      options: [{ allowArrays: true }],
    },
    {
      code: '<Foo bar={[1, 2, 3]} />',
      options: [{ allowArrays: true }],
    },
    {
      code: 'React.createElement(Foo, { bar: [1, 2, 3] })',
      options: [{ allowArrays: true }],
    },
    {
      code: 'React.createElement(Foo, { bar: [1, 2, 3] })',
      options: [{ allowArrays: true }],
    },

    // allowObjects
    {
      code: '<Foo bar={{ foo: 1 }} />',
      options: [{ allowObjects: true }],
    },
    {
      code: '<Foo bar={{ foo: 1 }} />',
      options: [{ allowObjects: true }],
    },
    {
      code: 'React.createElement(Foo, { bar: { foo: 1 }})',
      options: [{ allowObjects: true }],
    },
    {
      code: 'React.createElement(Foo, { bar: { foo: 1 }})',
      options: [{ allowObjects: true }],
    },

    // ignore DOM components
    {
      code: '<div style={{ foo: 1 }}></div>',
      options: [{ ignoreDOMComponents: true }],
    },
    {
      code: '<div style={{ foo: 1 }}></div>',
      options: [{ ignoreDOMComponents: true }],
    },
    {
      code: 'React.createElement("div", { style: { foo: 1 }})',
      options: [{ ignoreDOMComponents: true }],
    },
    {
      code: 'React.createElement("div", { style: { foo: 1 }})',
      options: [{ ignoreDOMComponents: true }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const style = { foo: 1 };
            return <div style={style}></div>;
          }
        };
      `,
      options: [{ ignoreDOMComponents: true }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const style = { foo: 1 };
            return <div style={style}></div>;
          }
        };
      `,
      options: [{ ignoreDOMComponents: true }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const style = { foo: 1 };
            return React.createElement('div', { style: style });
          }
        };
      `,
      options: [{ ignoreDOMComponents: true }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const style = { foo: 1 };
            return React.createElement('div', { style: style });
          }
        };
      `,
      options: [{ ignoreDOMComponents: true }],
    },
  ]),

  invalid: parsers.all([
    // arrays
    {
      code: '<Foo bar={[1, 2, 3]} />',
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: '<Foo bar={[1, 2, 3]} />',
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: 'React.createElement(Foo, { bar: [1, 2, 3] })',
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: 'React.createElement(Foo, { bar: [1, 2, 3] })',
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = [1, 2, 3];
            return <Foo bar={bar} />;
          }
        };
      `,
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = [1, 2, 3];
            return <Foo bar={bar} />;
          }
        };
      `,
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = [1, 2, 3];
            return React.createElement(Foo, { bar: bar });
          }
        };
      `,
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = [1, 2, 3];
            return React.createElement(Foo, { bar: bar });
          }
        };
      `,
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = [1, 2, 3];
            const renderFoo = () => {
              return <Foo bar={bar} />;
            };
            return renderFoo();
          }
        };
      `,
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = [1, 2, 3];
            const renderFoo = () => {
              return <Foo bar={bar} />;
            };
            return renderFoo();
          }
        };
      `,
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = [1, 2, 3];
            const renderFoo = () => {
              return React.createElement(Foo, { bar: bar });
            };
            return renderFoo();
          }
        };
      `,
      errors: [{ message: 'Props should not use array allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = [1, 2, 3];
            const renderFoo = () => {
              return React.createElement(Foo, { bar: bar });
            };
            return renderFoo();
          }
        };
      `,
      errors: [{ message: 'Props should not use array allocations' }],
    },

    // objects
    {
      code: '<Foo bar={{ foo: 1 }} />',
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: '<Foo bar={{ foo: 1 }} />',
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: 'React.createElement(Foo, { bar: { foo: 1 }})',
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: 'React.createElement(Foo, { bar: { foo: 1 }})',
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const style = { foo: 1 };
            return <div style={style}>Hello {this.state.name}</div>;
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const style = { foo: 1 };
            return <div style={style}>Hello {this.state.name}</div>;
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const style = { foo: 1 };
            return React.createElement('div', { style: style });
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const style = { foo: 1 };
            return React.createElement('div', { style: style });
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = { foo: 1 };
            return <Foo bar={bar} />;
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = { foo: 1 };
            return <Foo bar={bar} />;
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = { foo: 1 };
            return React.createElement(Foo, { bar: bar });
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = { foo: 1 };
            return React.createElement(Foo, { bar: bar });
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = { foo: 1 };
            const renderFoo = () => {
              return <Foo bar={bar} />;
            };
            return renderFoo();
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = { foo: 1 };
            const renderFoo = () => {
              return <Foo bar={bar} />;
            };
            return renderFoo();
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = { foo: 1 };
            const renderFoo = () => {
              return React.createElement(Foo, { bar: bar });
            };
            return renderFoo();
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
    {
      code: `
        class Hello extends React.Component {
          render() {
            const bar = { foo: 1 };
            const renderFoo = () => {
              return React.createElement(Foo, { bar: bar });
            };
            return renderFoo();
          }
        };
      `,
      errors: [{ message: 'Props should not use object allocations' }],
    },
  ]),
});
