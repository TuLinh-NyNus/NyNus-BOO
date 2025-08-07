/**
 * JSX namespace declaration for React components
 * Fixes TypeScript error: Cannot find namespace 'JSX'
 */

declare namespace JSX {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Element extends React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ElementClass extends React.Component<Record<string, unknown>> {}
  interface ElementAttributesProperty {
    props: Record<string, unknown>;
  }
  interface ElementChildrenAttribute {
    children: React.ReactNode;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntrinsicAttributes extends React.Attributes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
