import React from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import { useColorMode } from '@docusaurus/theme-common';

export default function Playground({code = 'console.log("Hello World")'}: {code?: string}): JSX.Element {
  const {colorMode} = useColorMode();
  return (
    <Sandpack 
      template="node"
      files={{
        "index.js": code,
      }}
      theme={colorMode === 'dark' ? 'dark' : 'light'}
    />
  );
}
