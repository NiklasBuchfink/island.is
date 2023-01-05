import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@island.is/auth/react'
import { useRoutes } from '../components/PortalProvider'
import { PortalNavigationItem } from '../types/portalCore'
import { filterNavigationTree } from '../utils/filterNavigationTree/filterNavigationTree'

export const useNavigation = (navigation: PortalNavigationItem) => {
  const { userInfo } = useAuth()
  const routes = useRoutes()
  const { pathname } = useLocation()

  const filteredNavigation = useMemo(() => {
    if (userInfo) {
      return {
        ...navigation,
        children: navigation?.children?.filter((navItem) =>
          filterNavigationTree({
            item: navItem,
            routes,
            dynamicRouteArray: [],
            currentLocationPath: pathname,
          }),
        ),
      }
    }

    return undefined
  }, [userInfo, navigation, routes, pathname])

  return filteredNavigation
}
