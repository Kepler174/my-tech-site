import React from 'react';
import Giscus from '@giscus/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useColorMode} from '@docusaurus/theme-common';

export default function Comments(): JSX.Element {
  const {colorMode} = useColorMode();
  
  return (
    <div style={{marginTop: '30px'}}>
      <Giscus
        id="comments"
        repo="Kepler174/my-tech-site"
        repoId="R_kgDOQzRzNA"
        category="Announcements"
        categoryId="DIC_kwDOQzRzNM4C0jEE"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={colorMode}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
