const RestClient = require('./utils/sfmc-client')

(async() => {
  const result = await RestClient.triggerJourneyBuilder(
    JSON.stringify({
      ContactKey: '1515739406366075047',
      EventDefinitionKey: 'APIEvent-85139ee3-9d02-2a45-05cb-7080996f80b8',
      Data: {
        OAId: '1015448571833111846',
        ZaloId: '1515739406366075047',
      },
    })
  );
})()