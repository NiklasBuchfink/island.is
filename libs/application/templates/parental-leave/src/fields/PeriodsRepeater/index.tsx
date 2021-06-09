import React, { FC } from 'react'

import { RepeaterProps } from '@island.is/application/core'
import { Box, Button } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { FieldDescription } from '@island.is/shared/form-fields'

import Timeline from '../components/Timeline'
import {
  formatPeriods,
  getExpectedDateOfBirth,
} from '../../lib/parentalLeaveUtils'
import { parentalLeaveFormMessages } from '../../lib/messages'
import { States } from '../../constants'

type FieldProps = {
  field?: {
    props?: {
      showDescription: boolean
    }
  }
}
type ScreenProps = RepeaterProps & FieldProps

const PeriodsRepeater: FC<ScreenProps> = ({
  removeRepeaterItem,
  application,
  expandRepeater,
  field,
}) => {
  const showDescription = field?.props?.showDescription ?? true
  const dob = getExpectedDateOfBirth(application)
  const { formatMessage } = useLocale()

  if (!dob) {
    return null
  }

  const dobDate = new Date(dob)
  const editable =
    application.state === States.DRAFT ||
    application.state === States.EDIT_OR_ADD_PERIODS

  return (
    <Box>
      {showDescription && (
        <FieldDescription
          description={formatMessage(
            parentalLeaveFormMessages.leavePlan.description,
          )}
        />
      )}
      <Box marginTop={showDescription ? 3 : undefined} marginBottom={3}>
        <Timeline
          initDate={dobDate}
          title={formatMessage(
            parentalLeaveFormMessages.shared.expectedDateOfBirthTitle,
          )}
          titleSmall={formatMessage(
            parentalLeaveFormMessages.shared.dateOfBirthTitle,
          )}
          periods={formatPeriods(application, formatMessage)}
          onDeletePeriod={removeRepeaterItem}
          editable={editable}
        />
      </Box>
      {editable && (
        <Button size="small" icon="add" onClick={expandRepeater}>
          {formatMessage(parentalLeaveFormMessages.leavePlan.addAnother)}
        </Button>
      )}
    </Box>
  )
}

export default PeriodsRepeater
