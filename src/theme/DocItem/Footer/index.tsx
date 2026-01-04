import React, {type ReactNode} from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type {WrapperProps} from '@docusaurus/types';
import Comments from '@site/src/components/Comments';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): ReactNode {
  return (
    <>
      <Footer {...props} />
      <Comments />
    </>
  );
}
