import { infer as zinfer } from 'zod'
import { estateSchema } from '@island.is/application/templates/estate'
import { filterAndRemoveRepeaterMetadata } from './filters'
import { ApplicationWithAttachments } from '@island.is/application/types'
import { UploadData } from '../types'
import {
  expandAssetFrames,
  expandBankAccounts,
  expandClaims,
  expandDebts,
  expandEstateMembers,
  expandStocks,
  trueOrHasYes,
} from './mappers'
type EstateSchema = zinfer<typeof estateSchema>

export const stringifyObject = <T extends Record<string, unknown>>(
  obj: T,
): Record<keyof T, string> => {
  const result: Record<keyof T, string> = {} as Record<keyof T, string>
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      result[key] = obj[key] as string
    } else {
      result[key] = JSON.stringify(obj[key])
    }
  }

  return result
}

export const generateRawUploadData = (
  answers: EstateSchema,
  externalData: EstateSchema,
  application: ApplicationWithAttachments,
) => {
  const relation =
    externalData?.estate.estateMembers?.find(
      (member) => member.nationalId === application.applicant,
    )?.relation ?? 'Óþekkt'

  const processedAssets = filterAndRemoveRepeaterMetadata<
    EstateSchema['estate']['assets']
  >(answers?.estate?.assets ?? externalData?.estate?.assets ?? [])

  const processedVehicles = filterAndRemoveRepeaterMetadata<
    EstateSchema['estate']['vehicles']
  >(answers?.estate?.vehicles ?? externalData?.estate?.vehicles ?? [])

  const processedEstateMembers = filterAndRemoveRepeaterMetadata<
    EstateSchema['estate']['estateMembers']
  >(answers?.estate?.estateMembers ?? externalData?.estate?.estateMembers ?? [])

  const processedGuns = filterAndRemoveRepeaterMetadata<
    EstateSchema['estate']['guns']
  >(answers?.estate?.guns ?? [])

  const uploadData: UploadData = {
    deceased: {
      name: externalData.estate.nameOfDeceased ?? '',
      ssn: externalData.estate.nationalIdOfDeceased ?? '',
      dateOfDeath: externalData.estate.dateOfDeath?.toString() ?? '',
      address: externalData.estate.addressOfDeceased ?? '',
    },
    districtCommissionerHasWill: trueOrHasYes(
      answers.estate?.testament?.wills ?? 'false',
    ),
    settlement: trueOrHasYes(answers.estate?.testament?.agreement ?? 'false'),
    dividedEstate: trueOrHasYes(answers.estate?.testament?.dividedEstate ?? ''),
    remarksOnTestament: answers.estate?.testament?.additionalInfo ?? '',
    guns: expandAssetFrames(processedGuns),
    applicationType: answers.selectedEstate,
    caseNumber: externalData?.estate?.caseNumber ?? '',
    assets: expandAssetFrames(processedAssets),
    claims: expandClaims(answers?.claims ?? []),
    bankAccounts: expandBankAccounts(answers.bankAccounts ?? []),
    debts: expandDebts(answers.debts ?? []),
    estateMembers: expandEstateMembers(processedEstateMembers),
    inventory: {
      info: answers.inventory?.info ?? '',
      value: answers.inventory?.value ?? '',
    },
    moneyAndDeposit: {
      info: answers.moneyAndDeposit?.info ?? '',
      value: answers.moneyAndDeposit?.value ?? '',
    },
    notifier: {
      email: answers.applicant.email ?? '',
      name: answers.applicant.name,
      phoneNumber: answers.applicant.phone,
      relation: relation ?? '',
      ssn: answers.applicant.nationalId,
    },
    otherAssets: {
      info: answers.otherAssets?.info ?? '',
      value: answers.otherAssets?.value ?? '',
    },
    stocks: expandStocks(answers.stocks ?? []),
    vehicles: expandAssetFrames(processedVehicles),
    estateWithoutAssetsInfo: {
      estateAssetsExist: trueOrHasYes(
        answers?.estateWithoutAssets?.estateAssetsExist ?? 'false',
      ),
      estateDebtsExist: trueOrHasYes(
        answers?.estateWithoutAssets?.estateDebtsExist ?? 'false',
      ),
    },
    ...(answers.representative?.name
      ? {
          representative: {
            email: answers.representative.email ?? '',
            name: answers.representative.name,
            phoneNumber: answers.representative.phone ?? '',
            ssn: answers.representative.nationalId ?? '',
          },
        }
      : { representative: undefined }),
    ...(answers.deceasedWithUndividedEstate?.spouse?.nationalId
      ? {
          deceasedWithUndividedEstate: {
            spouse: {
              name: answers.deceasedWithUndividedEstate.spouse.name ?? '',
              nationalId: answers.deceasedWithUndividedEstate.spouse.nationalId,
            },
            selection: trueOrHasYes(
              answers.deceasedWithUndividedEstate.selection ?? 'false',
            ),
          },
        }
      : {
          deceasedWithUndividedEstate: {
            spouse: {
              name: '',
              nationalId: '',
            },
            selection: 'false',
          },
        }),
  }

  return uploadData
}
