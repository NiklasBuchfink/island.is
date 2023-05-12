import {
  Box,
  Logo,
  Button,
  GridColumn,
  GridRow,
  Divider,
  GridContainer,
  Columns,
  Column,
  ResponsiveSpace,
  Hidden,
  FocusableBox,
  UserMenu,
} from '@island.is/island-ui/core'
import * as styles from './Menu.css'
import React, { useContext } from 'react'
import { MenuLogo, MenuLogoMobile } from '../svg'
import { menuItems } from './MenuItems'
import MenuModal from '../Modal/MenuModal'
import {
  checkActiveHeaderLink,
  useIsMobile,
  useLogIn,
  useLogOut,
} from '../../utils/helpers'
import { useRouter } from 'next/router'
import { UserContext } from '../../context'
type MenuProps = {
  isFrontPage: boolean
}

export const Menu = ({ isFrontPage = false }: MenuProps) => {
  const { isAuthenticated, user } = useContext(UserContext)
  const { isMobile } = useIsMobile()

  const router = useRouter()
  const marginLeft = [1, 1, 1, 2] as ResponsiveSpace
  const biggerMarginLeft = [3, 3, 3, 4] as ResponsiveSpace

  const LogIn = useLogIn()
  const LogOut = useLogOut()

  return (
    <header className={styles.menu}>
      <Hidden print={true}>
        <GridContainer>
          <GridRow>
            <GridColumn span="12/12" paddingTop={3} paddingBottom={3}>
              <Columns alignY="center" space={2}>
                <Column width="content">
                  {isFrontPage ? <Logo /> : !isMobile && <Logo iconOnly />}
                </Column>
                {!isFrontPage && (
                  <>
                    {!isMobile && (
                      <Column width="content">
                        <Box
                          style={{
                            transform: 'rotate(90deg)',
                            width: 56,
                          }}
                          marginX={1}
                        >
                          <Divider />
                        </Box>
                      </Column>
                    )}
                    <Column width="content">
                      <FocusableBox href="/" alignItems="center">
                        {isMobile ? <MenuLogoMobile /> : <MenuLogo />}
                      </FocusableBox>
                    </Column>
                  </>
                )}
                <Column>
                  {isMobile ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flexEnd"
                      width="full"
                    >
                      <MenuModal
                        baseId="menuModal"
                        modalLabel="Menu modal"
                        isLoggedIn={isAuthenticated}
                        logIn={LogIn}
                        logOut={LogOut}
                        router={router}
                        isFrontPage={isFrontPage}
                      />
                    </Box>
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flexEnd"
                      width="full"
                    >
                      {menuItems.map((item, index) => {
                        return (
                          <FocusableBox
                            marginLeft={index !== 0 ? marginLeft : 0}
                            key={index}
                            href={item.href}
                          >
                            <div
                              style={{
                                backgroundColor: checkActiveHeaderLink(
                                  router,
                                  item.href,
                                )
                                  ? '#00E4CA'
                                  : 'transparent',
                                borderRadius: '8px',
                              }}
                            >
                              <Button variant="utility" size="small">
                                {item.label}
                              </Button>
                            </div>
                          </FocusableBox>
                        )
                      })}
                      <Box marginLeft={biggerMarginLeft}>
                        {isAuthenticated ? (
                          <UserMenu
                            username={user?.name}
                            authenticated={isAuthenticated}
                            language={'IS'}
                            onLogout={LogOut}
                            dropdownItems={<Divider />}
                          />
                        ) : (
                          <Button size="small" onClick={LogIn}>
                            Innskráning
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                </Column>
              </Columns>
            </GridColumn>
          </GridRow>
        </GridContainer>
      </Hidden>
    </header>
  )
}
export default Menu
