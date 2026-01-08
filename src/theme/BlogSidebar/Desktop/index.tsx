import React, {memo} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
// @ts-ignore
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from '@docusaurus/plugin-content-blog/client';
// @ts-ignore
import BlogSidebarContent from '@theme/BlogSidebar/Content';
import styles from './styles.module.css';
import {SiteInfoWidget} from '@site/src/components/SidebarWidgets';

const ListComponent = ({items}: {items: any[]}) => {
  return (
    <BlogSidebarItemList
      items={items}
      ulClassName={clsx(styles.sidebarItemList, 'clean-list')}
      liClassName={styles.sidebarItem}
      linkClassName={styles.sidebarItemLink}
      linkActiveClassName={styles.sidebarItemLinkActive}
    />
  );
};

function BlogSidebarDesktop({sidebar, toc}: {sidebar: any, toc: React.ReactNode}) {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  return (
    <aside className="col col--2">
      <nav
        className={clsx(styles.sidebar, 'thin-scrollbar', 'blog-left-sidebar')}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}>
        
        {/* Site Stats Widget */}
        <SiteInfoWidget />

        {/* Regular Blog Sidebar - Wrapped in Box */}
        <div className="blog-widget-box">
          <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md', 'blog-widget-header')}>
            {sidebar.title}
          </div>
          <BlogSidebarContent
            items={items}
            ListComponent={ListComponent}
            yearGroupHeadingClassName={styles.yearGroupHeading}
          />
        </div>
        
        {/* Table of Contents - Wrapped in Box */}
        {toc && (
           <div className="blog-widget-box">
             <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md', 'blog-widget-header')}>
               文章目录
             </div>
             {toc}
           </div>
        )}
      </nav>
    </aside>
  );
}
export default memo(BlogSidebarDesktop);
