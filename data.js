module.exports = {
  Records: [
    {
      eventVersion: '2.0',
      eventSource: 'aws:s3',
      awsRegion: 'eu-central-1',
      eventTime: '2016-04-18T17:54:27.076Z',
      eventName: 'ObjectCreated:Put',
      userIdentity: {
        principalId: 'A2VGY9OGPAG0P9',
      },
      requestParameters: {
        sourceIPAddress: '54.239.6.36',
      },
      responseElements: {
        'x-amz-request-id': 'E7503FBB9C656144',
        'x-amz-id-2': 'HzaA23gMucglDagIBQqawt7qvTxFk7Sux62ek4KrCSenjaRZ3SRM7+rfRw8NFKa/fJkOXYF3wl8=',
      },
      s3: {
        s3SchemaVersion: '1.0',
        configurationId: '6f1aa74a-e749-49e4-bf71-7e6f2a329fbe',
        bucket: {
          name: 'ldtphotostore',
          ownerIdentity: {
            principalId: 'A2VGY9OGPAG0P9',
          },
          arn: 'arn:aws:s3:::ldtphotostore',
        },
        object: {
          key: 'images/uploaded/buttonsAI.mov',
          size: 849990,
          eTag: '291c93eebc96f39b16496596c13ed0fd',
          sequencer: '0057151F52B9C45CCD',
        },
      },
    },
  ],
}
