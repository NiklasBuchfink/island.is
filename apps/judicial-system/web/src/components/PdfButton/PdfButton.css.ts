import { style } from '@vanilla-extract/css'

import { theme } from '@island.is/island-ui/theme'

export const pdfRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  minHeight: `${theme.spacing[10]}px`,
  boxShadow: `inset 0 -1px 0 0 ${theme.color.blue200}`,
  padding: `0 ${theme.spacing[2]}px`,
})

export const cursor = style({ cursor: 'pointer' })

export const disabled = style({
  cursor: 'not-allowed',
  backgroundColor: theme.color.dark100,
  opacity: 0.5,
})

export const fileNameContainer = style({
  flexBasis: '50%',
  marginRight: theme.spacing[2],
  '@media': {
    [`screen and (min-width: ${theme.breakpoints.md}px)`]: {
      flexBasis: '70%',
    },
  },
})
