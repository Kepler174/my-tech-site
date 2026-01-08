import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import RightSidebar from '@site/src/components/SidebarWidgets';

export default function BlogLayout(props) {
  const {sidebar, toc, children, ...layoutProps} = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          <BlogSidebar sidebar={sidebar} toc={toc} />
          <main
            className={clsx('col', {
              'col--8': hasSidebar,
              'col--10': !hasSidebar,
            })}
            itemScope
            itemType="http://schema.org/Blog">
            {children}
          </main>
          
          <div className="col col--2">
             {/* 我们的自定义部件：标签、日历、时钟 */}
            <RightSidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
}
