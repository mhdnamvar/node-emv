var emv = require('./emv.js');
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var diff = require('deep-diff').diff;




describe('emv.parse', function() {
  it('emv.parse should be able to parse 9F34030200009F26087DE7FED1071C1A279F270180 and return the json object array', function() {
    emv.parse('9F34030200009F26087DE7FED1071C1A279F270180', function(data) {
      if (data != null) {
        console.log("-----------------------------------------------------------------------------------------");
        console.log(data);
        console.log("-----------------------------------------------------------------------------------------");
      }
      var obj1 = {
        'tag': '9F34',
        'length': '03',
        'value': '020000'
      };
      var obj2 = {
        'tag': '9F26',
        'length': '08',
        'value': '7DE7FED1071C1A27'
      };
      var obj3 = {
        'tag': '9F27',
        'length': '01',
        'value': '80'
      };
      // console.log(diff(obj1,data[0]));
      // console.log(diff(obj2,data[1]));
      // console.log(diff(obj3,data[2]));
      // console.log("-----------------------------------------------------------------------------------------");
      expect(diff(obj1, data[0])).to.equal(undefined);
      expect(diff(obj2, data[1])).to.equal(undefined);
      expect(diff(obj3, data[2])).to.equal(undefined);
    });

  });
});

describe('emv.describe', function() {
  it('emv.parse should be able to describe 9F34030200009F26087DE7FED1071C1A279F270180 and return the json object array', function() {
    emv.describe('9F34030200009F26087DE7FED1071C1A279F270180', function(data) {
      if (data != null) {
        // console.log("-----------------------------------------------------------------------------------------");
        // console.log("data[0].description = " +data[0].description);
        // console.log("data[1].description = " +data[1].description);
        // console.log("data[2].description = " +data[2].description);
        // console.log("-----------------------------------------------------------------------------------------");
        expect(data[0].description).to.equal("Cardholder Verification Method (CVM) Results");
        expect(data[1].description).to.equal("Application Cryptogram");
        expect(data[2].description).to.equal("Cryptogram Information Data");

      }
    })

  });
});

describe('emv.lookup', function() {
  it('emv.lookup should be able to lookup tag 9F10 and return the json object relating to this tag', function() {
    // Lookup an EMV tag in node-emv dictionary
    emv.lookup('9F10', function(data) {
      if (data.length > 0) {
        // console.log(data[0].tag + ' ' + data[0].name);
        // [ { tag: '9F10', name: 'Issuer Application Data', source: '',format: '', template: '', length: '', 'p/c': 'primitive', description: '' } ]
        var obj1 = [{
          tag: '9F10',
          name: 'Issuer Application Data',
          source: '',
          format: '',
          template: '',
          length: '',
          'p/c': 'primitive',
          description: ''
        }];
        // console.log("-----------------------------------------------------------------------------------------");
        // console.log(data);
        // console.log("-----------------------------------------------------------------------------------------");
      }

      expect(diff(obj1, data)).to.equal(undefined);
    });

  });
});

describe('emv.tvr', function() {
  it('emv.tvr should be parsed correctly based on the definition', function() {


    emv.tvr('8000048000', function(data) {

      var tvrRef = [
        [{
          bit: '8',
          value: '1',
          description: 'Offline data authentication was not performed'
        }, {
          bit: '7',
          value: '0',
          description: 'SDA failed'
        }, {
          bit: '6',
          value: '0',
          description: 'ICC data missing'
        }, {
          bit: '5',
          value: '0',
          description: 'Card appears on terminal exception file'
        }, {
          bit: '4',
          value: '0',
          description: 'DDA failed'
        }, {
          bit: '3',
          value: '0',
          description: 'CDA failed'
        }, {
          bit: '2',
          value: '0',
          description: 'RFU'
        }, {
          bit: '1',
          value: '0',
          description: 'RFU'
        }],
        [{
          bit: '8',
          value: '0',
          description: 'ICC and terminal have different application versions'
        }, {
          bit: '7',
          value: '0',
          description: 'Expired application'
        }, {
          bit: '6',
          value: '0',
          description: 'Application not yet effective'
        }, {
          bit: '5',
          value: '0',
          description: 'Requested service not allowed for card product'
        }, {
          bit: '4',
          value: '0',
          description: 'New card'
        }, {
          bit: '3',
          value: '0',
          description: 'RFU'
        }, {
          bit: '2',
          value: '0',
          description: 'RFU'
        }, {
          bit: '1',
          value: '0',
          description: 'RFU'
        }],
        [{
          bit: '8',
          value: '0',
          description: 'Cardholder verification was not successful'
        }, {
          bit: '7',
          value: '0',
          description: 'Unrecognised CVM'
        }, {
          bit: '6',
          value: '0',
          description: 'PIN Try Limit exceeded'
        }, {
          bit: '5',
          value: '0',
          description: 'PIN entry required and PIN pad not present or not working'
        }, {
          bit: '4',
          value: '0',
          description: 'PIN entry required, PIN pad present, but PIN was not entered'
        }, {
          bit: '3',
          value: '1',
          description: 'Online PIN entered'
        }, {
          bit: '2',
          value: '0',
          description: 'RFU'
        }, {
          bit: '1',
          value: '0',
          description: 'RFU'
        }],
        [{
          bit: '8',
          value: '1',
          description: 'Transaction exceeds floor limit'
        }, {
          bit: '7',
          value: '0',
          description: 'Lower consecutive offline limit exceeded'
        }, {
          bit: '6',
          value: '0',
          description: 'Upper consecutive offline limit exceeded'
        }, {
          bit: '5',
          value: '0',
          description: 'Transaction selected randomly for online processing'
        }, {
          bit: '4',
          value: '0',
          description: 'Merchant forced transaction online'
        }, {
          bit: '3',
          value: '0',
          description: 'RFU'
        }, {
          bit: '2',
          value: '0',
          description: 'RFU'
        }, {
          bit: '1',
          value: '0',
          description: 'RFU'
        }],
        [{
          bit: '8',
          value: '0',
          description: 'Default TDOL used'
        }, {
          bit: '7',
          value: '0',
          description: 'Issuer authentication failed'
        }, {
          bit: '6',
          value: '0',
          description: 'Script processing failed before final GENERATE AC'
        }, {
          bit: '5',
          value: '0',
          description: 'Script processing failed after final GENERATE AC'
        }, {
          bit: '4',
          value: '0',
          description: 'RFU'
        }, {
          bit: '3',
          value: '0',
          description: 'RFU'
        }, {
          bit: '2',
          value: '0',
          description: 'RFU'
        }, {
          bit: '1',
          value: '0',
          description: 'RFU'
        }]
      ];

      // if (data.length > 0) {
      //   console.log("-----------------------------------------------------------------------------------------");
      //   console.log(data);
      //   console.log("-----------------------------------------------------------------------------------------");
      // }

      expect(diff(tvrRef, data)).to.equal(undefined);
    });
  });
});


// Try to get information about Application Interchange Profile(AIP)
emv.aip('0040', function(data) {
  if (data.length > 0) {
    console.log(data);
  }
});

//Application Usage Control tag
emv.auc('2A7F', function(data) {
  if (data.length > 0) {
    console.log(data);
  }
});
