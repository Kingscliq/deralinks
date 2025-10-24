import React, { ElementType, JSX } from 'react';

// extends ElementType shows that the generic type is now constrained to Elements like "div", "p" tags
type BoxProps<C extends ElementType> = {
  as?: C;
} & Omit<React.ComponentProps<C>, 'as'>;

/**
 * A polymorphic component that can render as any HTML element or custom component.
 *
 * @example
 * // As a div with onClick
 * <Box onClick={() => console.log('Clicked')}>Hello</Box>
 *
 * @example
 * // As a button
 * <Box as="button" type="button" onClick={handleClick}>Click me</Box>
 *
 * @example
 * // As a custom component
 * <Box as={MyComponent} customProp="value" />
 */
const Box = <C extends ElementType = 'div'>({
  as,
  ...props
}: BoxProps<C>): JSX.Element => {
  const Component = as || 'div';
  return <Component {...props} />;
};

Box.displayName = 'Box';

export default Box;
