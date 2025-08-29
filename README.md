# Node EMV Parser

[![npm version](https://img.shields.io/npm/v/node-emv.svg)](https://www.npmjs.com/package/node-emv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive JavaScript library for parsing and analyzing EMV (Europay, Mastercard, and Visa) payment card data. This library provides complete TLV (Tag-Length-Value) parsing capabilities along with detailed interpretation of EMV-specific data structures.

## What is EMV?

EMV stands for Europay, MasterCard, and Visa, the three companies that originally created the standard. The standard is now managed by EMVCo, a consortium with control split equally among Visa, Mastercard, JCB, American Express, China UnionPay, and Discover.

EMV is the global standard for smart card payments, used in chip cards, contactless payments, EFT POS terminals, and transaction processing worldwide. EMV data is encoded in BER-TLV (Basic Encoding Rules Tag-Length-Value) format, which requires specialized parsing to extract meaningful information.

## Features

- **Complete TLV Parsing**: Parse EMV data strings into structured objects
- **Tag Dictionary**: Comprehensive database of EMV tags from multiple kernels (Generic, Visa, Mastercard, JCB, AMEX)
- **Data Description**: Convert raw EMV data into human-readable descriptions
- **Specialized Parsers**: Built-in parsers for specific EMV data types:
  - Terminal Verification Result (TVR)
  - Application Interchange Profile (AIP) 
  - Application Usage Control (AUC)
  - Cardholder Verification Method (CVM)
  - Transaction Status Information (TSI)
- **Multi-Kernel Support**: Support for different payment schemes and kernels
- **Tag Lookup**: Search EMV tag definitions by tag number
- **Value Extraction**: Extract specific tag values from parsed EMV objects

## Requirements

- Node.js 4.0+ (ES5 compatible)
- No external dependencies

## Installation

```bash
npm install node-emv
```

## Quick Start

```javascript
const emv = require('node-emv');

// Parse EMV data
emv.parse('9F34030200009F26087DE7FED1071C1A279F270180', function(data) {
    if (data != null) {
        console.log('Parsed EMV data:', data);
    }
});
```

## API Documentation

### Core Methods

#### `parse(emvData, callback)`
Parses raw EMV data string into structured TLV objects.

**Parameters:**
- `emvData` (string): Hexadecimal EMV data string
- `callback` (function): Callback function receiving parsed data array

**Example:**
```javascript
emv.parse('9F34030200009F26087DE7FED1071C1A279F270180', function(data) {
    console.log(data);
    // Output: [
    //   { tag: '9F34', length: '03', value: '020000' },
    //   { tag: '9F26', length: '08', value: '7DE7FED1071C1A27' },
    //   { tag: '9F27', length: '01', value: '80' }
    // ]
});
```

#### `describe(emvData, callback)`
Parses EMV data and adds human-readable descriptions for each tag.

**Parameters:**
- `emvData` (string): Hexadecimal EMV data string  
- `callback` (function): Callback function receiving described data array

**Example:**
```javascript
emv.describe('9F34030200009F26087DE7FED1071C1A279F270180', function(data) {
    console.log(data);
    // Output includes description field for each tag
});
```

#### `describeKernel(emvData, kernel, callback)`
Parses EMV data with kernel-specific tag descriptions.

**Parameters:**
- `emvData` (string): Hexadecimal EMV data string
- `kernel` (string): Kernel name ('Generic', 'VISA', 'MasterCard', 'JCB', 'AMEX')
- `callback` (function): Callback function receiving described data array

#### `lookup(tag, callback)`
Looks up EMV tag information in the generic tag dictionary.

**Parameters:**
- `tag` (string): EMV tag (e.g., '9F10')
- `callback` (function): Callback function receiving tag information

**Example:**
```javascript
emv.lookup('4F', function(data) {
    if (data) {
        console.log('Tag name:', data);
        // Note: lookup() searches in Generic kernel only
    } else {
        console.log('Tag not found in Generic kernel');
    }
});
```

#### `lookupKernel(tag, kernel, callback)`
Looks up EMV tag information for a specific kernel.

**Example:**
```javascript
// Look up a tag in a specific kernel
emv.lookupKernel('9F34', 'MasterCard', function(data) {
    if (data) {
        console.log('Tag name:', data);
        // Output: "Cardholder Verification Method (CVM) Results"
    }
});

// Look up a tag in VISA kernel
emv.lookupKernel('4F', 'VISA', function(data) {
    if (data) {
        console.log('Tag name:', data);
        // Output: "Application Identifier (ADF Name)"
    }
});
```

### Data Extraction Methods

#### `getValue(tag, emvObjects, callback)`
Extracts the value of a specific tag from parsed EMV objects.

**Parameters:**
- `tag` (string): EMV tag to find
- `emvObjects` (array): Array of parsed EMV objects
- `callback` (function): Callback function receiving the tag value

#### `getElement(tag, emvObjects, callback)`
Extracts the complete element (tag, length, value) from parsed EMV objects.

**Parameters:**
- `tag` (string): EMV tag to find
- `emvObjects` (array): Array of parsed EMV objects  
- `callback` (function): Callback function receiving the complete element

### Specialized Parsers

#### `tvr(tvrData, callback)`
Parses Terminal Verification Result (TVR) data into detailed bit-by-bit analysis.

**Parameters:**
- `tvrData` (string): 5-byte hex string representing TVR
- `callback` (function): Callback function receiving parsed TVR structure

**Example:**
```javascript
emv.tvr('8000048000', function(data) {
    console.log(data);
    // Returns array of 5 bytes, each with 8 bits described
});
```

#### `aip(aipData, callback)`
Parses Application Interchange Profile (AIP) data.

**Parameters:**
- `aipData` (string): 2-byte hex string representing AIP
- `callback` (function): Callback function receiving parsed AIP structure

**Example:**
```javascript
emv.aip('0040', function(data) {
    console.log(data);
    // Returns array describing supported features
});
```

#### `auc(aucData, callback)`
Parses Application Usage Control (AUC) data.

**Parameters:**
- `aucData` (string): Hex string representing AUC
- `callback` (function): Callback function receiving parsed AUC structure

#### `cvm(cvmData, callback)`
Parses Cardholder Verification Method (CVM) data.

**Parameters:**
- `cvmData` (string): Hex string representing CVM list
- `callback` (function): Callback function receiving parsed CVM structure

#### `tsi(tsiData, callback)`
Parses Transaction Status Information (TSI) data.

**Parameters:**
- `tsiData` (string): Hex string representing TSI
- `callback` (function): Callback function receiving parsed TSI structure

## Advanced Examples

### Parsing Complex EMV Data

```javascript
const emv = require('node-emv');

// Complex EMV data with nested TLV structures
const complexData = '4F07A00000000430605F2A02097882025C008407A0000000043060950500800080009A031508069C01009F02060000000001019F080200009F090200009F10120114000100000000000000E0DB2E438900FF';

emv.describe(complexData, function(data) {
    if (data != null) {
        data.forEach(function(item) {
            console.log(`Tag: ${item.tag}`);
            console.log(`Length: ${item.length}`);
            console.log(`Value: ${item.value}`);
            if (item.description) {
                console.log(`Description: ${item.description}`);
            }
            console.log('---');
        });
    } else {
        console.error('Failed to parse EMV data');
    }
});
```

### Kernel-Specific Parsing

```javascript
// Parse with Visa-specific tag descriptions
emv.describeKernel(emvData, 'VISA', function(data) {
    console.log('Visa kernel parsing result:', data);
});

// Parse with Mastercard-specific tag descriptions  
emv.describeKernel(emvData, 'MasterCard', function(data) {
    console.log('Mastercard kernel parsing result:', data);
});
```

### Error Handling

```javascript
emv.parse('9F34030200009F26087DE7FED1071C1A279F270180', function(data) {
    if (data === null) {
        console.error('Failed to parse EMV data - unexpected error');
        return;
    }
    
    if (data.length === 0) {
        console.warn('No EMV objects found in data');
        return;
    }
    
    // Validate parsed data structure
    const isValid = data.every(item => 
        item.tag && item.length && item.value !== undefined
    );
    
    if (!isValid) {
        console.error('Invalid data structure in parsed result');
        return;
    }
    
    // Process valid data
    console.log('Successfully parsed', data.length, 'EMV objects');
    data.forEach(item => {
        console.log(`Tag ${item.tag}: ${item.value}`);
    });
});

// Handle tag lookup errors
emv.lookup('INVALID', function(data) {
    if (!data) {
        console.log('Tag not found in Generic kernel database');
    }
});

// Handle kernel-specific lookup
emv.lookupKernel('9F34', 'Generic', function(data) {
    if (!data) {
        console.log('Tag 9F34 not found in Generic kernel, try MasterCard kernel');
        
        emv.lookupKernel('9F34', 'MasterCard', function(mcData) {
            if (mcData) {
                console.log('Found in MasterCard kernel:', mcData);
            }
        });
    }
});
```

## Supported EMV Kernels

- **Generic**: Standard EMV tags
- **Visa**: Visa-specific implementations and tags  
- **MasterCard**: Mastercard PayPass and related tags
- **JCB**: JCB J/Speedy implementation
- **AMEX**: American Express ExpressPay tags
- **kernel_21**: Additional kernel specifications

## Tag Database

The library includes a comprehensive database of EMV tags with over 5,000 entries covering:

- Standard EMV 4.x specification tags
- Kernel-specific proprietary tags  
- Payment scheme specific data elements
- Terminal and card application parameters
- Security and cryptographic elements
- Transaction processing fields

## Performance Notes

- **Memory Usage**: The tag database is loaded once when the module is required
- **Parsing Speed**: Optimized for typical EMV message sizes (100-2000 bytes)
- **Callback Pattern**: All methods use Node.js callback patterns for consistency
- **No Dependencies**: Pure JavaScript implementation with no external dependencies

## Browser Compatibility

While designed for Node.js, the library can be adapted for browser use with appropriate bundling tools. The library uses only standard JavaScript features compatible with ES5.

## Sample Application

Check out a desktop application using node-emv: [EMV Desktop App](https://github.com/mhdnamvar/emv-desktop-app)

## Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/node-emv.git`
3. Create a feature branch: `git checkout -b my-new-feature`
4. Make your changes
5. Test your changes: `node sample.js`
6. Commit your changes: `git commit -am 'Add some feature'`
7. Push to the branch: `git push origin my-new-feature`
8. Submit a pull request

### Guidelines

- Follow existing code style and patterns
- Add examples for new features
- Update documentation for API changes
- Test with various EMV data samples
- Ensure backward compatibility

### Reporting Issues

When reporting issues, please include:
- Node.js version
- Sample EMV data (anonymized)
- Expected vs actual behavior
- Error messages if any

## Changelog

### Version 1.0.23
- Current stable release
- Comprehensive EMV tag database
- Support for multiple kernels
- Specialized data parsers

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Resources

- [EMVCo Specifications](https://www.emvco.com/specifications/)
- [EMV 4.x Book 1: Application Independent ICC to Terminal Interface Requirements](https://www.emvco.com/document-search/)
- [ISO/IEC 7816 Smart Card Standards](https://www.iso.org/standard/54550.html)
- [Payment Card Industry Standards](https://www.pcisecuritystandards.org/)

---

**Disclaimer**: This library is for educational and development purposes. Ensure compliance with payment industry regulations and security standards when handling real payment card data.
