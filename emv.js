var util = require('./util.js');
var emv_tags = require('./tags.js');

function lookupKernel( tag, kernel, callback ){
	var found = emv_tags.filter(function(item) {
		if(item.tag == tag && item.kernel.toUpperCase() == kernel.toUpperCase())
			return true;			
		});
	callback (found.length && found[0].name);
};

function getValue( tag, emv_objects, callback ){
	var found = emv_objects.filter(function(item) {
		if(item.tag == tag)
			callback( item.value );
		});
};
function getElement( tag, emv_objects, callback ){
	var found = emv_objects.filter(function(item) {
		if(item.tag == tag)
			callback( item );
		});
};

function parse(emv_data, callback){
	var emv_objects = [];
	while(emv_data.length > 0){
		var tag_bin = util.Hex2Bin(emv_data.substring(0, 2));
		tag_bin = util.pad(tag_bin, 8);
		//console.log(tag_bin);
		var tag_limit = 2;
		var tag_class = tag_bin.substring(0, tag_limit);
		var tag_constructed = tag_bin.substring(2, 3);
		var tag_number = tag_bin.substring(3, 8);
		var tag_octet = '';

		if (tag_number == '11111'){
			do {
				// at least one more byte
				tag_limit += 2;
				tag_octet = util.Hex2Bin(emv_data.substring(tag_limit-2, tag_limit))
				tag_octet = util.pad(tag_octet, 8);

			} while (tag_octet.substring(0,1) == '1')
			//console.log('constructed tag');
			tag_bin = util.Hex2Bin(emv_data.substring(0, tag_limit));
			tag_bin = util.pad(tag_bin, 8*(tag_limit/2));
			tag_number = tag_bin.substring(3, 8*(tag_limit/2));
		}

		var tag = util.Bin2Hex(tag_class + tag_constructed + tag_number).toUpperCase();
		var lenHex = emv_data.substring(tag.length, tag.length + 2);

		var lenBin = util.pad(util.Hex2Bin(lenHex), 8);
		var byteToBeRead = 0;
		var len = util.Hex2Dec(lenHex) * 2;
		var offset = tag.length + 2 + len;

		if(lenHex.substring(0, 1) == "8"){
			byteToBeRead = util.Hex2Dec(lenHex.substring(1, 2));
			lenHex = emv_data.substring(tag.length, tag.length + 2 + byteToBeRead*2)
			console.log('lenHex: ' + lenHex + ' lenBin: '+ lenBin +' ---> len is more than 1 byte');
			// 	lenHex = emv_data.substring(tag.length, tag.length + 4);
			len = util.Hex2Dec(lenHex.substring(2)) * 2;
			offset = tag.length + 2 + (byteToBeRead*2)+len;
			console.log('length (decimals): ' + len + ' offset: '+ offset +' - this is for the substring of emv_data');
		}

		var value = emv_data.substring(tag.length + 2 + (byteToBeRead*2), offset);

		if (tag_constructed == '1') {
			parse(value, function(innerTags) {
				value = innerTags;
			});
		}

		emv_objects.push( { 'tag': tag, 'length': lenHex, 'value' : value} );
		emv_data = emv_data.substring(offset);
	}

	callback(emv_objects);

};

function describeKernel(emv_data, kernel, callback){
	var emv_objects = [];
	parse(emv_data, function(tlv_list){
		if(tlv_list != null){
			for(var i=0; i < tlv_list.length; i++){
				lookupKernel(tlv_list[i].tag, kernel, function(data){
					var inner_list = tlv_list[i].value;
					if( Array.isArray(inner_list) ){
						for(var j=0; j < inner_list.length; j++){
							lookupKernel(inner_list[j].tag, kernel, function(jdata){
								if(jdata){
									inner_list[j].description = jdata;
								}
							});
						}
					}
					if(data){
						tlv_list[i].description = data;
					}

					emv_objects.push( tlv_list[i] );
				});
			}
			callback(emv_objects);
		}
	});
};

function aip(aip_data, callback){
	var aip_bin = util.pad(util.Hex2Bin(aip_data), 16);
	var data = [];
	var Byte1 = [
		{ 'bit' : '8' , 'value' : aip_bin.substring(0, 1), 'description' : 'XDA supported'},
		{ 'bit' : '7' , 'value' : aip_bin.substring(1, 2), 'description' : 'SDA supported'},
		{ 'bit' : '6' , 'value' : aip_bin.substring(2, 3), 'description' : 'DDA supported'},
		{ 'bit' : '5' , 'value' : aip_bin.substring(3, 4), 'description' : 'Cardholder verification is supported' } ,
		{ 'bit' : '4' , 'value' : aip_bin.substring(4, 5), 'description' : 'Terminal risk Management is to be performed' } ,
		{ 'bit' : '3' , 'value' : aip_bin.substring(5, 6), 'description' : 'Issuer authentication is supported'} ,
		{ 'bit' : '2' , 'value' : aip_bin.substring(6, 7), 'description' : 'On device cardholder verification is supported' } ,
		{ 'bit' : '1' , 'value' : aip_bin.substring(7, 8), 'description' : 'CDA supported'}
	];
	var Byte2 = [
		{ 'bit' : '8' , 'value' : aip_bin.substring(8, 9),   'description' : 'EMV mode is supported'},
		{ 'bit' : '7' , 'value' : aip_bin.substring(9, 10),  'description' : 'RFU'},
		{ 'bit' : '6' , 'value' : aip_bin.substring(10, 11), 'description' : 'RFU'},
		{ 'bit' : '5' , 'value' : aip_bin.substring(11, 12), 'description' : 'RFU'},
		{ 'bit' : '4' , 'value' : aip_bin.substring(12, 13), 'description' : 'RFU'},
		{ 'bit' : '3' , 'value' : aip_bin.substring(13, 14), 'description' : 'RFU'},
		{ 'bit' : '2' , 'value' : aip_bin.substring(14, 15), 'description' : 'RFU'},
		{ 'bit' : '1' , 'value' : aip_bin.substring(15, 16), 'description' : 'Relay resistance protocol is supported'},
	];
data.push(Byte1, Byte2);
	callback(data);
};



function cvm(cvm_data, callback){
	var cvm_bin = util.Hex2Bin(cvm_data);
	var data = [];

	data.push(cvm_bin.substring(1, 2) == '0' ? 'Fail cardholder verification if this CVM is unsuccessful' : 'Apply succeeding CV Rule if this CVM is unsuccessful');

	var cvm_code = cvm_bin.substring(2, 8);
	if(cvm_code == '000000')
	 	data.push('Fail CVM processing');
	else if(cvm_code == '000001')
		data.push('Plaintext PIN verification performed by ICC');
	else if(cvm_code == '000010')
		data.push('Enciphered PIN verified online');
	else if(cvm_code == '000011')
		data.push('Plaintext PIN verification performed by ICC and signature (paper)');
	else if(cvm_code == '000100')
		data.push('Enciphered PIN verification performed by ICC');
	else if(cvm_code == '000101')
		data.push('Enciphered PIN verification performed by ICC and signature (paper)');
	else if(cvm_code == '011110')
		data.push('Signature (paper)');
	else if(cvm_code == '011111')
		data.push('No CVM required');
	else if(cvm_code.startsWith('10'))
		data.push('Values in the range 100000-101111 reserved for use by the individual payment systems');
	else if(cvm_code.startsWith('11'))
		data.push('Values in the range 110000-111110 reserved for use by the issuer');
	else if(cvm_code == '11111')
		data.push('This value is not available for use');


	var condition_code = cvm.substring(2, 4);
	if(condition_code == '00')
		data.push('Condition: Always');
	else if(condition_code == '01')
		data.push('Condition: If unattended cash');
	else if(condition_code == '02')
		data.push('Condition: If not unattended cash and not manual cash and not purchase with cashback');
	else if(condition_code == '03')
		data.push('Condition: If terminal supports the CVM');
	else if(condition_code == '04')
		data.push('Condition: If manual cash');
	else if(condition_code == '05')
		data.push('Condition: If purchase with cashback');
	else if(condition_code == '06')
		data.push('Condition: If transaction is in the application currency 21 and is under X value (see section 10.5 for a discussion of “X”)');
	else if(condition_code == '07')
		data.push('Condition: If transaction is in the application currency and is over X value');
	else if(condition_code == '08')
		data.push('Condition: If transaction is in the application currency and is under Y value (see section 10.5 for a discussion of \'Y\')');
	else if(condition_code == '09')
		data.push('Condition: If transaction is in the application currency and is over Y value');
	else if( util.Hex2Dec('0A') <= util.Hex2Dec(condition_code) && util.Hex2Dec(condition_code) <= util.Hex2Dec('7F'))
		data.push('RFU');
	else if( util.Hex2Dec('80') <= util.Hex2Dec(condition_code) && util.Hex2Dec(condition_code) <= util.Hex2Dec('FF'))
		data.push('Reserved for use by individual payment systems');
	callback(data);
};


function auc(auc_data, callback){
	var auc_bin = util.Hex2Bin(auc_data);
	var data = [];
	var Byte1 = [
		{ 'bit' : '8' , 'value' : auc_bin.substring(0, 1), 'description' : 'Valid for domestic cash transactions'},
		{ 'bit' : '7' , 'value' : auc_bin.substring(1, 2), 'description' : 'Valid for international cash transactions'},
		{ 'bit' : '6' , 'value' : auc_bin.substring(2, 3), 'description' : 'Valid for domestic goods'},
		{ 'bit' : '5' , 'value' : auc_bin.substring(3, 4), 'description' : 'Valid for international goods' } ,
		{ 'bit' : '4' , 'value' : auc_bin.substring(4, 5), 'description' : 'Valid for domestic services' } ,
		{ 'bit' : '3' , 'value' : auc_bin.substring(5, 6), 'description' : 'Valid for international services'} ,
		{ 'bit' : '2' , 'value' : auc_bin.substring(6, 7), 'description' : 'Valid at ATMs'} ,
		{ 'bit' : '1' , 'value' : auc_bin.substring(7, 8), 'description' : 'Valid at terminals other than ATMs'}
	];

	var Byte2 = [
		{ 'bit' : '8' , 'value' : auc_bin.substring(8, 9), 'description' : 'Domestic cashback allowed'},
		{ 'bit' : '7' , 'value' : auc_bin.substring(9, 10), 'description' : 'International cashback allowed'},
		{ 'bit' : '6' , 'value' : auc_bin.substring(10, 11), 'description' : 'RFU'},
		{ 'bit' : '5' , 'value' : auc_bin.substring(11, 12), 'description' : 'RFU'},
		{ 'bit' : '4' , 'value' : auc_bin.substring(12, 13), 'description' : 'RFU'},
		{ 'bit' : '3' , 'value' : auc_bin.substring(13, 14), 'description' : 'RFU'},
		{ 'bit' : '2' , 'value' : auc_bin.substring(14, 15), 'description' : 'RFU'},
		{ 'bit' : '1' , 'value' : auc_bin.substring(15, 16), 'description' : 'RFU'},
		];
	data.push(Byte1, Byte2);
	callback(data);
};


function tsi(tsi_data, callback){
	var tsi_bin = util.Hex2Bin(tsi_data);
	var data = [];
	var Byte1 = [
		{ 'bit' : '8' , 'value' : tsi_bin.substring(0, 1), 'description' : 'Offline data authentication was performed' },
		{ 'bit' : '7' , 'value' : tsi_bin.substring(1, 2), 'description' : 'Cardholder verification was performed' },
		{ 'bit' : '6' , 'value' : tsi_bin.substring(2, 3), 'description' : 'Card risk management was performed' },
		{ 'bit' : '5' , 'value' : tsi_bin.substring(3, 4), 'description' : 'Issuer authentication was performed' } ,
		{ 'bit' : '4' , 'value' : tsi_bin.substring(4, 5), 'description' : 'Terminal risk management was performed' } ,
		{ 'bit' : '3' , 'value' : tsi_bin.substring(5, 6), 'description' : 'Script processing was performed' } ,
		{ 'bit' : '2' , 'value' : tsi_bin.substring(6, 7), 'description' : 'RFU' } ,
		{ 'bit' : '1' , 'value' : tsi_bin.substring(7, 8), 'description' : 'RFU' }
	];

	var Byte2 = [
		{ 'bit' : '8' , 'value' : tsi_bin.substring(8, 9),   'description' : 'RFU' },
		{ 'bit' : '7' , 'value' : tsi_bin.substring(9, 10),  'description' : 'RFU' },
		{ 'bit' : '6' , 'value' : tsi_bin.substring(10, 11), 'description' : 'RFU' },
		{ 'bit' : '5' , 'value' : tsi_bin.substring(11, 12), 'description' : 'RFU' },
		{ 'bit' : '4' , 'value' : tsi_bin.substring(12, 13), 'description' : 'RFU' },
		{ 'bit' : '3' , 'value' : tsi_bin.substring(13, 14), 'description' : 'RFU' },
		{ 'bit' : '2' , 'value' : tsi_bin.substring(14, 15), 'description' : 'RFU' },
		{ 'bit' : '1' , 'value' : tsi_bin.substring(15, 16), 'description' : 'RFU' },
	];
	data.push(Byte1, Byte2);
	callback(data);
};

function to_bits(hexData, callback){
	var bin_data = util.Hex2Bin(hexData);
	var data = [];
	var no_bytes = bin_data.length / 8;
	for(var i = 0; i < no_bytes; i++){
		var str = '{ byte : '+ i + ', bits : [';
		for(var j = 0; j < 8; j++){
			str += ' { bit : '+ j + ', value : ' + bin_data.substring(i, i + 1) + ' }' ;
			if(j != 7) str += ',';
		}
		str += ']}'
		data.push( str );
	}
	callback(data);
};


function tvr(tvr_data, callback){
	var tvr_bin = util.Hex2Bin(tvr_data);
	var data = [];
	var Byte1 = [
		{ 'bit' : '8' , 'value' : tvr_bin.substring(0, 1), 'description' : 'Offline data authentication was not performed' },
		{ 'bit' : '7' , 'value' : tvr_bin.substring(1, 2), 'description' : 'SDA failed' },
		{ 'bit' : '6' , 'value' : tvr_bin.substring(2, 3), 'description' : 'ICC data missing' },
		{ 'bit' : '5' , 'value' : tvr_bin.substring(3, 4), 'description' : 'Card appears on terminal exception file' },
		{ 'bit' : '4' , 'value' : tvr_bin.substring(4, 5), 'description' : 'DDA failed' },
		{ 'bit' : '3' , 'value' : tvr_bin.substring(5, 6), 'description' : 'CDA failed' },
		{ 'bit' : '2' , 'value' : tvr_bin.substring(6, 7), 'description' : 'RFU' },
		{ 'bit' : '1' , 'value' : tvr_bin.substring(7, 8), 'description' : 'RFU' }
	];

	var Byte2 = [
		{ 'bit' : '8' , 'value' : tvr_bin.substring(8, 9),   'description' : 'ICC and terminal have different application versions' },
		{ 'bit' : '7' , 'value' : tvr_bin.substring(9, 10),  'description' : 'Expired application' },
		{ 'bit' : '6' , 'value' : tvr_bin.substring(10, 11), 'description' : 'Application not yet effective' },
		{ 'bit' : '5' , 'value' : tvr_bin.substring(11, 12), 'description' : 'Requested service not allowed for card product' },
		{ 'bit' : '4' , 'value' : tvr_bin.substring(12, 13), 'description' : 'New card' },
		{ 'bit' : '3' , 'value' : tvr_bin.substring(13, 14), 'description' : 'RFU' },
		{ 'bit' : '2' , 'value' : tvr_bin.substring(14, 15), 'description' : 'RFU' },
		{ 'bit' : '1' , 'value' : tvr_bin.substring(15, 16), 'description' : 'RFU' }
	];

	var Byte3 = [
		{ 'bit' : '8' , 'value' : tvr_bin.substring(16, 17), 'description' : 'Cardholder verification was not successful' },
		{ 'bit' : '7' , 'value' : tvr_bin.substring(17, 18), 'description' : 'Unrecognised CVM' },
		{ 'bit' : '6' , 'value' : tvr_bin.substring(18, 19), 'description' : 'PIN Try Limit exceeded' },
		{ 'bit' : '5' , 'value' : tvr_bin.substring(19, 20), 'description' : 'PIN entry required and PIN pad not present or not working' },
		{ 'bit' : '4' , 'value' : tvr_bin.substring(20, 21), 'description' : 'PIN entry required, PIN pad present, but PIN was not entered' },
		{ 'bit' : '3' , 'value' : tvr_bin.substring(21, 22), 'description' : 'Online PIN entered' },
		{ 'bit' : '2' , 'value' : tvr_bin.substring(22, 23), 'description' : 'RFU' },
		{ 'bit' : '1' , 'value' : tvr_bin.substring(23, 24), 'description' : 'RFU' }
	];

	var Byte4 = [
		{ 'bit' : '8' , 'value' : tvr_bin.substring(24, 25), 'description' : 'Transaction exceeds floor limit' },
		{ 'bit' : '7' , 'value' : tvr_bin.substring(25, 26), 'description' : 'Lower consecutive offline limit exceeded' },
		{ 'bit' : '6' , 'value' : tvr_bin.substring(26, 27), 'description' : 'Upper consecutive offline limit exceeded' },
		{ 'bit' : '5' , 'value' : tvr_bin.substring(27, 28), 'description' : 'Transaction selected randomly for online processing' },
		{ 'bit' : '4' , 'value' : tvr_bin.substring(28, 29), 'description' : 'Merchant forced transaction online' },
		{ 'bit' : '3' , 'value' : tvr_bin.substring(29, 30), 'description' : 'RFU' },
		{ 'bit' : '2' , 'value' : tvr_bin.substring(30, 31), 'description' : 'RFU' },
		{ 'bit' : '1' , 'value' : tvr_bin.substring(31, 32), 'description' : 'RFU' }
	];

	var Byte5 = [
		{ 'bit' : '8' , 'value' : tvr_bin.substring(32, 33), 'description' : 'Default TDOL used' },
		{ 'bit' : '7' , 'value' : tvr_bin.substring(33, 34), 'description' : 'Issuer authentication failed' },
		{ 'bit' : '6' , 'value' : tvr_bin.substring(34, 35), 'description' : 'Script processing failed before final GENERATE AC' },
		{ 'bit' : '5' , 'value' : tvr_bin.substring(35, 36), 'description' : 'Script processing failed after final GENERATE AC' },
		{ 'bit' : '4' , 'value' : tvr_bin.substring(36, 37), 'description' : 'RFU' },
		{ 'bit' : '3' , 'value' : tvr_bin.substring(37, 38), 'description' : 'RFU' },
		{ 'bit' : '2' , 'value' : tvr_bin.substring(38, 39), 'description' : 'RFU' },
		{ 'bit' : '1' , 'value' : tvr_bin.substring(39, 40), 'description' : 'RFU' }
	];

	data.push(Byte1, Byte2, Byte3, Byte4, Byte5);
	callback(data);
};



module.exports={
	parse : function(emv_data, callback){ parse(emv_data, callback); },
	describe : function(emv_data, callback){ describeKernel(emv_data, "Generic", callback); },
	lookup : function(emv_tag, callback){ lookupKernel(emv_tag, "Generic",callback); },
	describeKernel : function(emv_data, kernel, callback){ describeKernel(emv_data, kernel, callback); },
	lookupKernel : function(emv_tag, kernel, callback){ lookupKernel(emv_tag, kernel, callback); },
	getValue : function(emv_tag, emv_objects, callback){ getValue(emv_tag, emv_objects, callback); },
	getElement : function(emv_tag, emv_objects, callback){ getElement(emv_tag, emv_objects, callback); },
	aip : function(aip_data, callback){ aip(aip_data, callback); },
	auc	: function(auc_data, callback){ auc(auc_data, callback); },
	cvm : function(cvm_data, callback){ cvm(cvm_data, callback); },
	tvr : function(tvr_data, callback){ tvr(tvr_data, callback); },
	tsi : function(tsi_data, callback){ tvr(tsi_data, callback); }
};
