import { service, ServiceBuilder } from '../../../../infra/src/dsl/dsl'
import { Base, Client, NationalRegistry } from '../../../../infra/src/dsl/xroad'

const postgresInfo = {}
export const serviceSetup = (): ServiceBuilder<'regulations-admin-backend'> =>
  service('regulations-admin-backend')
    .image('regulations-admin-backend')
    .namespace('regulations-admin')
    .env({
      IDENTITY_SERVER_ISSUER_URL: {
        dev: 'https://identity-server.dev01.devland.is',
        staging: 'https://identity-server.staging01.devland.is',
        prod: 'https://innskra.island.is',
      },
      IDENTITY_SERVER_CLIENT_ID: '@island.is/clients/regulations-admin-api',
    })
    .postgres(postgresInfo)
    .initContainer({
      containers: [{ command: 'npx', args: ['sequelize-cli', 'db:migrate'] }],
      postgres: postgresInfo,
    })
    .secrets({
      REGULATIONS_API_URL: '/k8s/api/REGULATIONS_API_URL',
      IDENTITY_SERVER_CLIENT_SECRET:
        '/k8s/services-regulations-admin/IDENTITY_SERVER_CLIENT_SECRET',
      REGULATIONS_FILE_UPLOAD_KEY_DRAFT:
        '/k8s/api/REGULATIONS_FILE_UPLOAD_KEY_DRAFT',
      REGULATIONS_FILE_UPLOAD_KEY_PUBLISH:
        '/k8s/api/REGULATIONS_FILE_UPLOAD_KEY_PUBLISH',
      REGULATIONS_FILE_UPLOAD_KEY_PRESIGNED:
        '/k8s/api/REGULATIONS_FILE_UPLOAD_KEY_PRESIGNED',
    })
    .resources({
      limits: { cpu: '400m', memory: '512Mi' },
      requests: { cpu: '100m', memory: '256Mi' },
    })
    .xroad(Base, Client, NationalRegistry)
    .readiness('/liveness')
    .liveness('/liveness')
    .grantNamespaces('islandis')