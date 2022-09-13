import {
  Link as LinkSchema,
  LinkGroup,
  ProjectPage,
} from '@island.is/web/graphql/schema'
import { Navigation, NavigationItem } from '@island.is/island-ui/core'
import { LayoutProps } from '@island.is/web/layouts/main'
import Link from 'next/link'

const lightThemes = ['traveling-to-iceland', 'election', 'ukraine', 'default']

export const getThemeConfig = (
  theme: string,
): { themeConfig: Partial<LayoutProps> } => {
  const isLightTheme = lightThemes.includes(theme)
  if (!isLightTheme) {
    return {
      themeConfig: {
        headerButtonColorScheme: 'negative',
        headerColorScheme: 'white',
      },
    }
  }
  return { themeConfig: {} }
}

export const convertLinksToNavigationItem = (links: LinkSchema[]) =>
  links.map(({ text, url }) => {
    return {
      title: text,
      href: url,
      active: false,
    }
  })

export const convertLinkGroupsToNavigationItems = (
  linkGroups: LinkGroup[],
): NavigationItem[] =>
  linkGroups.map(({ primaryLink, childrenLinks }) => {
    return {
      title: primaryLink.text,
      href: primaryLink.url,
      active: false,
      items: convertLinksToNavigationItem(childrenLinks),
    }
  })

export const getActiveNavigationItemTitle = (
  navigationItems: NavigationItem[],
  clientUrl: string,
) => {
  for (const item of navigationItems) {
    if (clientUrl === item.href) {
      return item.title
    }
    for (const childItem of item.items) {
      if (clientUrl === childItem.href) {
        return childItem.title
      }
    }
  }
}

export const assignNavigationActive = (
  items: NavigationItem[],
  clientUrl: string,
): NavigationItem[] =>
  items.map((item) => {
    let isAnyChildActive = false
    const childItems = item.items.map((childItem) => {
      const isChildActive = clientUrl === childItem.href
      if (isChildActive) isAnyChildActive = isChildActive
      return {
        ...childItem,
        active: isChildActive,
      }
    })
    return {
      title: item.title,
      href: item.href,
      active: clientUrl === item.href || isAnyChildActive,
      items: childItems,
    }
  })

export const getSidebarNavigationComponent = (
  projectPage: ProjectPage,
  baseRouterPath: string,
  navigationTitle: string,
) => {
  const navigationList = assignNavigationActive(
    convertLinkGroupsToNavigationItems(projectPage.sidebarLinks),
    baseRouterPath,
  )

  const activeNavigationItemTitle = getActiveNavigationItemTitle(
    navigationList,
    baseRouterPath,
  )

  return (isMenuDialog = false) => (
    <Navigation
      isMenuDialog={isMenuDialog}
      baseId="pageNav"
      items={navigationList}
      activeItemTitle={activeNavigationItemTitle}
      title={navigationTitle}
      renderLink={(link, item) => {
        return item?.href ? <Link href={item?.href}>{link}</Link> : link
      }}
    />
  )
}