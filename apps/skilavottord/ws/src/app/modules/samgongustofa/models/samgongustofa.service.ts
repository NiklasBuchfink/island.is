import { VehicleInformation, DeRegisterVehicle } from '.'
import { Injectable, HttpService, Inject } from '@nestjs/common'
import xml2js from 'xml2js'
import { environment } from '../../../../environments'
import { Logger, LOGGER_PROVIDER } from '@island.is/logging'

//TODO: create partnerDummy list
@Injectable()
export class SamgongustofaService {
  vehicleInformationList: VehicleInformation[]
  constructor(
    @Inject(LOGGER_PROVIDER) private logger: Logger,
    private httpService: HttpService,
  ) {}

  async getVehicleInformation(nationalId: string) {
    try {
      this.logger.info(
        `---- Starting getVehicleInformation call on ${nationalId} ----`,
      )
      const { soapUrl, soapUsername, soapPassword } = environment.samgongustofa

      const parser = new xml2js.Parser()

      // First soap call to get all vehicles own by person with nationalId in input
      const xmlAllCarsBodyStr = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usx="https://xml.samgongustofa.is/scripts/WebObjects.dll/XML.woa/1/ws/.USXMLWS">
        <soapenv:Header/>
          <soapenv:Body>
            <usx:allVehiclesForPersidno soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
              <username xsi:type="xsd:string">${soapUsername}</username>
              <password xsi:type="xsd:string">${soapPassword}</password>
              <xmlVersion xsi:type="xsd:string">2</xmlVersion>
              <clientPersidno xsi:type="xsd:string">${nationalId}</clientPersidno>
              <lawyerPersidno xsi:type="xsd:string">${nationalId}</lawyerPersidno>
              <requestedPersidno xsi:type="xsd:string">${nationalId}</requestedPersidno>
              <showDeregistered xsi:type="xsd:boolean">true</showeregistered>
              <showHistory xsi:type="xsd:boolean">false</showHistory>
            </usx:allVehiclesForPersidno>
          </soapenv:Body>
        </soapenv:Envelope>`

      const headersRequest = {
        'Content-Type': 'application/xml',
      }

      this.logger.info('Start allVehiclesForPersidno Soap request.')
      const allCarsResponse = await this.httpService
        .post(soapUrl, xmlAllCarsBodyStr, { headers: headersRequest })
        .toPromise()
      if (allCarsResponse.status != 200) {
        this.logger.error(allCarsResponse.statusText)
        return []
      }
      this.logger.info(
        'allVehiclesForPersidno Soap request successed and start parsing xml to json',
      )

      const loggerReplacement = this.logger
      // Parse xml to Json all Soap and added all vehicles and their information to vehicleInformationList
      this.vehicleInformationList = await parser
        .parseStringPromise(allCarsResponse.data.replace(/(\t\n|\t|\n)/gm, ''))
        .then(function (allCarsResult) {
          // check if SOAP returns 200 status code but with Fault message
          if (
            Object.prototype.hasOwnProperty.call(
              allCarsResult['soapenv:Envelope']['soapenv:Body'][0],
              'soapenv:Fault',
            )
          ) {
            loggerReplacement.error(
              allCarsResult['soapenv:Envelope']['soapenv:Body'][0][
                'soapenv:Fault'
              ][0]['faultstring'][0],
            )
            return []
          }
          // parse xml to Json Result
          return parser
            .parseStringPromise(
              allCarsResult['soapenv:Envelope']['soapenv:Body'][0][
                'ns1:allVehiclesForPersidnoResponse'
              ][0]['allVehiclesForPersidnoReturn'][0]['_'],
            )
            .then(function (allCars) {
              let vehicleArr: VehicleInformation[]
              vehicleArr = []
              // TODO: will be fixed
              vehicleArr.push(
                new VehicleInformation(
                  'HX111',
                  'black',
                  'Nissan',
                  '01.01.2020',
                  true,
                  true,
                  'inUse',
                ),
              )
              vehicleArr = []
              allCars['persidnolookup']['vehicleList'][0]['vehicle'].forEach(
                (car) => {
                  loggerReplacement.info(
                    `getting information for ${car['permno'][0]}`,
                  )
                  let carIsRecyclable = true
                  let carStatus = 'inUse'
                  // If vehicle status is 'Afskráð' then the vehicle is 'deregistered'
                  // otherwise is 'inUse'
                  if (car['vehiclestatus'][0] == 'Afskráð') {
                    carStatus = 'deregistered'
                    carIsRecyclable = false
                  }
                  let carHasCoOwner = true
                  if (car['otherowners'][0] == '0') {
                    carHasCoOwner = false
                  }

                  // Create new Vehicle information object on each vehicle
                  const vehicleObj = new VehicleInformation(
                    car['permno'][0],
                    car['type'][0],
                    car['color'][0],
                    car['firstregdate'][0],
                    carIsRecyclable,
                    carHasCoOwner,
                    carStatus,
                  )
                  vehicleArr.push(vehicleObj)
                },
              )
              return vehicleArr
            })
            .catch(function (err) {
              loggerReplacement.error(err)
              return []
            })
        })
        .catch(function (err) {
          loggerReplacement.error(err)
          return []
        })

      this.logger.info('Finished extracting all vehicles')
      // TODO: connect to database and get 'pending' status
      const newVehicleArr = this.vehicleInformationList
      let isRequestSuccess = true

      // ForEach vehicle in vehicleInformationList, check and update vehicle's status
      for (let i = 0; i < newVehicleArr.length; i++) {
        const carObj = newVehicleArr[i]
        this.logger.info(
          `Starting extracting details information on ${carObj['permno']}`,
        )
        if (carObj['status'] == 'inUse') {
          // Vehicle information
          // Vehicle information's Soap body
          const xmlBasicInfoBodyStr = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usx="https://xml.samgongustofa.is/scripts/WebObjects.dll/XML.woa/1/ws/.USXMLWS">
            <soapenv:Header/>
            <soapenv:Body>
              <usx:basicVehicleInformation soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                  <username xsi:type="xsd:string">${soapUsername}</username>
                  <password xsi:type="xsd:string">${soapPassword}</password>
                  <xmlVersion xsi:type="xsd:string">8</xmlVersion>
                  <clientPersidno xsi:type="xsd:string">${nationalId}</clientPersidno>
                  <permno xsi:type="xsd:string">${carObj['permno']}</permno>
                  <regno xsi:type="xsd:string">null</regno>
                  <vin xsi:type="xsd:string">null</vin>
              </usx:basicVehicleInformation>
            </soapenv:Body>
          </soapenv:Envelope>`

          const basicInforesponse = await this.httpService
            .post(soapUrl, xmlBasicInfoBodyStr, { headers: headersRequest })
            .toPromise()
          if (basicInforesponse.status != 200) {
            this.logger.error(basicInforesponse.statusText)
            isRequestSuccess = false
            i = newVehicleArr.length
          }
          // parse xml to Json all Soap
          this.logger.info(
            `Finished basicVehicleInformation Soap request and starting parsing xml to json on ${carObj['permno']}`,
          )
          this.vehicleInformationList[i] = await parser
            .parseStringPromise(
              basicInforesponse.data.replace(/(\t\n|\t|\n)/gm, ''),
            )
            .then(function (basicResult) {
              // check if SOAP returns 200 status code but with Fault message
              if (
                Object.prototype.hasOwnProperty.call(
                  basicResult['soapenv:Envelope']['soapenv:Body'][0],
                  'soapenv:Fault',
                )
              ) {
                loggerReplacement.error(
                  basicResult['soapenv:Envelope']['soapenv:Body'][0][
                    'soapenv:Fault'
                  ][0]['faultstring'][0],
                )
                isRequestSuccess = false
                i = newVehicleArr.length
              }
              // parse xml to Json Result
              return parser
                .parseStringPromise(
                  basicResult['soapenv:Envelope']['soapenv:Body'][0][
                    'ns1:basicVehicleInformationResponse'
                  ][0]['basicVehicleInformationReturn'][0]['_'],
                )
                .then(function (basicInfo) {
                  // If there is any information in updatelocks, stolens, ownerregistrationerrors then we may not deregister it
                  if (
                    !(
                      basicInfo['vehicle']['updatelocks'][0] == '' &&
                      basicInfo['vehicle']['stolens'][0] == '' &&
                      basicInfo['vehicle']['ownerregistrationerrors'][0] == ''
                    )
                  ) {
                    newVehicleArr[i]['isRecyclable'] = false
                  }
                  return newVehicleArr[i]
                })
                .catch(function (err) {
                  loggerReplacement.error(err)
                  isRequestSuccess = false
                  i = newVehicleArr.length
                })
            })
            .catch(function (err) {
              loggerReplacement.error(err)
              isRequestSuccess = false
              i = newVehicleArr.length
            })
        }
      }
      if (!isRequestSuccess) {
        return []
      }

      this.logger.info(
        `---- Finished getVehicleInformation call on ${nationalId} ----`,
      )
      return this.vehicleInformationList
    } catch (err) {
      this.logger.error(err)
      return []
    }
  }

  async deRegisterVehicle(vehiclePermno: string, disposalStation: string) {
    function deRegisterVehicleReturn(bool: boolean) {
      return new DeRegisterVehicle(bool)
    }
    try {
      this.logger.info(
        `---- Starting deRegisterVehicle call on ${vehiclePermno} ----`,
      )
      const {
        restAuthUrl,
        restDeRegUrl,
        restUsername,
        restPassword,
        restReportingStation,
      } = environment.samgongustofa

      const jsonObj = {
        username: restUsername,
        password: restPassword,
      }
      const jsonAuthBody = JSON.stringify(jsonObj)

      const headerAuthRequest = {
        'Content-Type': 'application/json',
      }

      const authRes = await this.httpService
        .post(restAuthUrl, jsonAuthBody, { headers: headerAuthRequest })
        .toPromise()

      if (authRes.status > 299 || authRes.status < 200) {
        this.logger.error(authRes.statusText)
        return deRegisterVehicleReturn(false)
      }
      // DeRegisterd vehicle
      const jToken = authRes.data['jwtToken']

      this.logger.info(
        'Finished Authentication request and starting deRegister request',
      )
      const dateNow = new Date()
      const jsonDeRegBody = JSON.stringify({
        permno: vehiclePermno,
        deRegisterDate:
          dateNow.toLocaleDateString() +
          'T' +
          dateNow.toTimeString().split(' ')[0] +
          'Z',
        subCode: 'U',
        plateCount: 0,
        destroyed: 0,
        lost: 0,
        reportingStation: restReportingStation,
        reportingStationType: 'R',
        disposalStation: disposalStation,
        disposalStationType: 'M',
        explanation: 'TODO, what to put here?',
      })

      const headerDeRegRequest = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jToken,
      }

      const deRegRes = await this.httpService
        .post(restDeRegUrl, jsonDeRegBody, { headers: headerDeRegRequest })
        .toPromise()

      if (deRegRes.status < 300 && deRegRes.status >= 200) {
        this.logger.info(
          `---- Finished deRegisterVehicle call on ${vehiclePermno} ----`,
        )
        return deRegisterVehicleReturn(true)
      } else {
        this.logger.info(deRegRes.statusText)
        return deRegisterVehicleReturn(false)
      }
    } catch (err) {
      this.logger.error(err)
      return deRegisterVehicleReturn(false)
    }
  }
}
