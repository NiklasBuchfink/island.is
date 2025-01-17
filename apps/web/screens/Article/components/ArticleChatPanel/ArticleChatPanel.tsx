import { GetSingleArticleQuery } from '@island.is/web/graphql/schema'
import {
  BoostChatPanel,
  boostChatPanelEndpoints,
  LiveChatIncChatPanel,
  WatsonChatPanel,
} from '@island.is/web/components'
import {
  defaultWatsonConfig,
  excludedOrganizationWatsonConfig,
  liveChatIncConfig,
  watsonConfig,
} from './config'
import { useI18n } from '@island.is/web/i18n'

interface ArticleChatPanelProps {
  article: GetSingleArticleQuery['getSingleArticle']
  pushUp?: boolean
}

export const ArticleChatPanel = ({
  article,
  pushUp,
}: ArticleChatPanelProps) => {
  const { activeLocale } = useI18n()

  let Component = null

  // LiveChatInc
  if (
    article?.organization?.some((o) => o.id in liveChatIncConfig[activeLocale])
  ) {
    const organizationId = article.organization.find(
      (o) => o.id in liveChatIncConfig[activeLocale],
    )?.id
    Component = (
      <LiveChatIncChatPanel
        {...liveChatIncConfig[activeLocale][organizationId ?? '']}
      />
    )
  }
  // Watson
  else if (article?.id && article.id in watsonConfig[activeLocale]) {
    Component = (
      <WatsonChatPanel
        {...watsonConfig[activeLocale][article.id]}
        pushUp={pushUp}
      />
    )
  } else if (
    article?.organization?.some((o) => o.id in watsonConfig[activeLocale])
  ) {
    const organizationId = article.organization.find(
      (o) => o.id in watsonConfig[activeLocale],
    )?.id
    Component = (
      <WatsonChatPanel
        {...watsonConfig[activeLocale][organizationId ?? '']}
        pushUp={pushUp}
      />
    )
  }
  // Boost
  else if (
    article?.organization?.some((o) => o.id in boostChatPanelEndpoints)
  ) {
    const organizationId = article.organization?.find(
      (o) => o.id in boostChatPanelEndpoints,
    )?.id as keyof typeof boostChatPanelEndpoints
    Component = <BoostChatPanel endpoint={organizationId} pushUp={pushUp} />
  } else if (
    !article?.organization?.some((o) =>
      excludedOrganizationWatsonConfig.includes(o.id),
    )
  ) {
    Component = (
      <WatsonChatPanel {...defaultWatsonConfig[activeLocale]} pushUp={pushUp} />
    )
  }

  return Component
}

export default ArticleChatPanel
