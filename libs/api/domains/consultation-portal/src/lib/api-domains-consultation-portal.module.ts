import { Module } from '@nestjs/common'
import { AuthModule } from '@island.is/auth-nest-tools'
import { ConsultationPortalClientModule } from '@island.is/clients/consultation-portal'
import { FeatureFlagModule } from '@island.is/nest/feature-flags'
import { CasesResolver } from './cases/cases.resolver'
import { CasesService } from './cases/cases.service'
import { DocumentService } from './documents/documents.service'
import { DocumentResolver } from './documents/documents.resolver'
import { TypesService } from './types/types.service'
import { TypesResolver } from './types/types.resolver'
import { StatisticsService } from './statistics/statistics.service'
import { StatisticsResolver } from './statistics/statistics.resolver'
import { UserService } from './user/user.service'
import { UserResolver } from './user/user.resolver'

@Module({
  providers: [
    CasesResolver,
    CasesService,
    DocumentService,
    DocumentResolver,
    TypesService,
    TypesResolver,
    StatisticsService,
    StatisticsResolver,
    UserService,
    UserResolver,
  ],
  imports: [ConsultationPortalClientModule, AuthModule, FeatureFlagModule],
  exports: [],
})
export class ConsultationPortalModule {}
