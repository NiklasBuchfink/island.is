import {
  FaqList,
  FaqListProps,
  renderConnectedComponent,
  richText,
  SliceType,
} from '@island.is/island-ui/contentful'
import {
  defaultRenderComponentObject,
  defaultRenderMarkObject,
  defaultRenderNodeObject,
} from '@island.is/island-ui/contentful'
import { Locale } from '@island.is/shared/types'
import {
  AccordionSlice,
  AircraftSearch,
  AlcoholLicencesList,
  BrokersList,
  CatchQuotaCalculator,
  ChartsCard,
  DrivingInstructorList,
  EmailSignup,
  MasterList,
  OneColumnTextSlice,
  OverviewLinksSlice,
  PlateAvailableSearch,
  PowerBiSlice,
  PublicShipSearch,
  PublicVehicleSearch,
  SectionWithVideo,
  SelectedShip,
  ShipSearch,
  ShipSearchBoxedInput,
  SidebarShipSearchInput,
  SliceDropdown,
  StraddlingStockCalculator,
  TableSlice,
  TemporaryEventLicencesList,
  TwoColumnTextSlice,
} from '@island.is/web/components'
import {
  AccordionSlice as AccordionSliceSchema,
  Embed as EmbedSchema,
  FeaturedSupportQnAs as FeaturedSupportQNAsSchema,
  OverviewLinks as OverviewLinksSliceSchema,
  PowerBiSlice as PowerBiSliceSchema,
  SectionWithVideo as SectionWithVideoSchema,
  Slice,
  SliceDropdown as SliceDropdownSchema,
  TableSlice as TableSliceSchema,
} from '@island.is/web/graphql/schema'

import { MonthlyStatistics } from '../components/connected/electronicRegistrationStatistics'
import HousingBenefitCalculator from '../components/connected/HousingBenefitCalculator/HousingBenefitCalculator'
import FeaturedSupportQNAs from '../components/FeaturedSupportQNAs/FeaturedSupportQNAs'
import { EmbedSlice } from '../components/Organization/Slice/EmbedSlice/EmbedSlice'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore make web strict
export const webRenderConnectedComponent = (slice) => {
  const data = slice.json ?? {}

  switch (slice.componentType) {
    case 'Fiskistofa/ShipSearch':
      return <ShipSearch namespace={data} />
    case 'Fiskistofa/ShipSearchSidebarInput':
      return <SidebarShipSearchInput namespace={data} />
    case 'Fiskistofa/StraddlingStockCalculator':
      return <StraddlingStockCalculator namespace={data} />
    case 'Fiskistofa/CatchQuotaCalculator':
      return <CatchQuotaCalculator namespace={data} />
    case 'Fiskistofa/SelectedShip':
      return <SelectedShip />
    case 'ElectronicRegistrations/MonthlyStatistics':
      return <MonthlyStatistics slice={slice} />
    case 'Fiskistofa/ShipSearchBoxedInput':
      return <ShipSearchBoxedInput namespace={data} />
    case 'Áfengisleyfi/AlcoholLicences':
      return <AlcoholLicencesList slice={slice} />
    case 'Tækifærisleyfi/TemporaryEventLicences':
      return <TemporaryEventLicencesList slice={slice} />
    case 'Verðbréfamiðlarar/Brokers':
      return <BrokersList slice={slice} />
    case 'PublicVehicleSearch':
      return <PublicVehicleSearch slice={slice} />
    case 'AircraftSearch':
      return <AircraftSearch slice={slice} />
    case 'DrivingInstructorList':
      return <DrivingInstructorList slice={slice} />
    case 'PlateAvailableSearch':
      return <PlateAvailableSearch slice={slice} />
    case 'HousingBenefitCalculator':
      return <HousingBenefitCalculator slice={slice} />
    case 'PublicShipSearch':
      return <PublicShipSearch slice={slice} />
    case 'Meistaraleyfi/MasterLicences':
      return <MasterList slice={slice} />
    default:
      break
  }

  return renderConnectedComponent(slice)
}

const defaultRenderComponent = {
  PowerBiSlice: (slice: PowerBiSliceSchema) => <PowerBiSlice slice={slice} />,
  AccordionSlice: (slice: AccordionSliceSchema) =>
    slice.accordionItems && <AccordionSlice slice={slice} />,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore make web strict
  ConnectedComponent: (slice) => webRenderConnectedComponent(slice),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore make web strict
  GraphCard: (chart) => <ChartsCard chart={chart} />,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore make web strict
  OneColumnText: (slice) => <OneColumnTextSlice slice={slice} />,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore make web strict
  TwoColumnText: (slice) => <TwoColumnTextSlice slice={slice} />,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore make web strict
  EmailSignup: (slice) => <EmailSignup slice={slice} />,
  FaqList: (slice: FaqListProps) => slice?.questions && <FaqList {...slice} />,
  FeaturedSupportQNAs: (slice: FeaturedSupportQNAsSchema) => (
    <FeaturedSupportQNAs slice={slice} />
  ),
  SliceDropdown: (slice: SliceDropdownSchema) => (
    <SliceDropdown
      slices={slice.slices}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore make web strict
      sliceExtraText={slice.dropdownLabel}
      gridSpan="1/1"
      gridOffset="0"
      slicesAreFullWidth={true}
      dropdownMarginBottom={5}
    />
  ),
  SectionWithVideo: (slice: SectionWithVideoSchema) => (
    <SectionWithVideo slice={slice} />
  ),
  TableSlice: (slice: TableSliceSchema) => <TableSlice slice={slice} />,
  Embed: (slice: EmbedSchema) => <EmbedSlice slice={slice} />,
  OverviewLinks: (slice: OverviewLinksSliceSchema) => (
    <OverviewLinksSlice slice={slice} />
  ),
}

export const webRichText = (
  slices: Slice[] | SliceType[],
  options?: {
    renderComponent?: Record<string, unknown>
    renderMark?: Record<string, unknown>
    renderNode?: Record<string, unknown>
  },
  activeLocale?: Locale,
) => {
  return richText(
    slices as SliceType[],
    {
      renderComponent: {
        ...defaultRenderComponentObject,
        ...defaultRenderComponent,
        ...options?.renderComponent,
      },
      renderMark: {
        ...defaultRenderMarkObject,
        ...options?.renderMark,
      },
      renderNode: {
        ...defaultRenderNodeObject,
        ...options?.renderNode,
      },
    },
    activeLocale,
  )
}
