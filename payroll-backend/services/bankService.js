// backend/services/bankService.js
class BankService {
  constructor() {
    this.supportedFormats = {
      'nibss': { name: 'NIBSS', extension: '.txt', description: 'Nigeria Inter-Bank Settlement System' },
      'aba': { name: 'ABA', extension: '.aba', description: 'Australian Bankers Association format' },
      'csv': { name: 'CSV', extension: '.csv', description: 'Comma Separated Values' },
      'xml': { name: 'XML', extension: '.xml', description: 'Extended Markup Language' }
    };
  }

  // Generate payment file based on bank format
  generatePaymentFile(transactions, bankCode, format) {
    const bank = this.getBankByCode(bankCode);
    if (!bank) {
      throw new Error(`Bank with code ${bankCode} not found`);
    }

    switch (format) {
      case 'nibss':
        return this.generateNIBSSFile(transactions, bank);
      case 'aba':
        return this.generateABAFile(transactions, bank);
      case 'csv':
        return this.generateCSVFile(transactions, bank);
      case 'xml':
        return this.generateXMLFile(transactions, bank);
      default:
        throw new Error(`Unsupported file format: ${format}`);
    }
  }

  generateNIBSSFile(transactions, bank) {
    // NIBSS format simulation
    let fileContent = '';
    
    // Header record
    fileContent += `01${bank.code}${this.formatDate(new Date())}${this.formatNumber(transactions.length, 6)}`;
    fileContent += `${this.formatNumber(this.calculateTotalAmount(transactions), 15)}`;
    fileContent += '\n';
    
    // Detail records
    transactions.forEach((transaction, index) => {
      fileContent += `02${this.formatNumber(index + 1, 6)}`;
      fileContent += `${transaction.bankAccount || ''}`.padEnd(10);
      fileContent += `${transaction.accountName || transaction.employeeName}`.padEnd(30);
      fileContent += `${this.formatNumber(transaction.amount, 15)}`;
      fileContent += `${transaction.reference || ''}`.padEnd(20);
      fileContent += '\n';
    });
    
    // Footer record
    fileContent += `03${this.formatNumber(transactions.length, 6)}`;
    fileContent += `${this.formatNumber(this.calculateTotalAmount(transactions), 15)}`;
    
    return {
      content: fileContent,
      fileName: `NIBSS_${bank.code}_${this.formatDate(new Date())}.txt`,
      format: 'nibss',
      recordCount: transactions.length,
      totalAmount: this.calculateTotalAmount(transactions)
    };
  }

  generateABAFile(transactions, bank) {
    // ABA format simulation (common in banking)
    let fileContent = '0'; // File header
    fileContent += '01'; // Immediate destination
    fileContent += bank.code.padEnd(3);
    fileContent += ' '.padEnd(26); // Filler
    fileContent += '\n';
    
    transactions.forEach(transaction => {
      fileContent += '1'; // Detail record
      fileContent += transaction.bankAccount || ''.padEnd(9);
      fileContent += ' '.padEnd(17); // Indicator and transaction code
      fileContent += this.formatNumber(transaction.amount * 100, 10); // Amount in cents
      fileContent += transaction.employeeName.padEnd(32);
      fileContent += transaction.reference?.padEnd(18) || ''.padEnd(18);
      fileContent += '00000000'; // Trace number
      fileContent += '\n';
    });
    
    fileContent += '7'; // File footer
    fileContent += '999999999'; // Total records
    fileContent += this.formatNumber(this.calculateTotalAmount(transactions) * 100, 15); // Total amount in cents
    fileContent += ' '.padEnd(40); // Filler
    
    return {
      content: fileContent,
      fileName: `ABA_${bank.code}_${this.formatDate(new Date())}.aba`,
      format: 'aba',
      recordCount: transactions.length,
      totalAmount: this.calculateTotalAmount(transactions)
    };
  }

  generateCSVFile(transactions, bank) {
    // CSV format
    const headers = ['EmployeeID', 'EmployeeName', 'BankAccount', 'Amount', 'Reference', 'BankCode'];
    let fileContent = headers.join(',') + '\n';
    
    transactions.forEach(transaction => {
      const row = [
        transaction.employeeId,
        `"${transaction.employeeName}"`,
        transaction.bankAccount,
        transaction.amount,
        transaction.reference,
        bank.code
      ];
      fileContent += row.join(',') + '\n';
    });
    
    return {
      content: fileContent,
      fileName: `PAYMENT_${bank.code}_${this.formatDate(new Date())}.csv`,
      format: 'csv',
      recordCount: transactions.length,
      totalAmount: this.calculateTotalAmount(transactions)
    };
  }

  generateXMLFile(transactions, bank) {
    // XML format simulation
    let fileContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    fileContent += `<PaymentBatch bankCode="${bank.code}" date="${new Date().toISOString()}">\n`;
    
    transactions.forEach(transaction => {
      fileContent += '  <Transaction>\n';
      fileContent += `    <EmployeeID>${transaction.employeeId}</EmployeeID>\n`;
      fileContent += `    <EmployeeName>${this.escapeXML(transaction.employeeName)}</EmployeeName>\n`;
      fileContent += `    <BankAccount>${transaction.bankAccount}</BankAccount>\n`;
      fileContent += `    <Amount>${transaction.amount}</Amount>\n`;
      fileContent += `    <Reference>${transaction.reference}</Reference>\n`;
      fileContent += '  </Transaction>\n';
    });
    
    fileContent += `  <Summary recordCount="${transactions.length}" totalAmount="${this.calculateTotalAmount(transactions)}"/>\n`;
    fileContent += '</PaymentBatch>';
    
    return {
      content: fileContent,
      fileName: `PAYMENT_${bank.code}_${this.formatDate(new Date())}.xml`,
      format: 'xml',
      recordCount: transactions.length,
      totalAmount: this.calculateTotalAmount(transactions)
    };
  }

  // Helper methods
  formatDate(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  formatNumber(number, length) {
    return number.toString().padStart(length, '0');
  }

  calculateTotalAmount(transactions) {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  escapeXML(string) {
    return string.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
  }

  getBankByCode(code) {
    // This would typically query the database
    const banks = {
      'FBN': { code: 'FBN', name: 'First Bank of Nigeria' },
      'ZENITH': { code: 'ZENITH', name: 'Zenith Bank' },
      'GTB': { code: 'GTB', name: 'Guaranty Trust Bank' },
      'ACCESS': { code: 'ACCESS', name: 'Access Bank' },
      'UBA': { code: 'UBA', name: 'United Bank for Africa' }
    };
    return banks[code];
  }

  // Simulate bank API integration
  async simulateBankUpload(bankCode, fileContent, format) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate different responses based on bank
    const responses = {
      'FBN': { success: true, reference: `FBN${Date.now()}`, message: 'File uploaded successfully' },
      'ZENITH': { success: true, reference: `ZEN${Date.now()}`, message: 'Batch queued for processing' },
      'GTB': { success: true, reference: `GTB${Date.now()}`, message: 'Payment file accepted' },
      'ACCESS': { success: true, reference: `ACC${Date.now()}`, message: 'Upload successful' },
      'UBA': { success: true, reference: `UBA${Date.now()}`, message: 'File processed' }
    };
    
    return responses[bankCode] || { success: false, message: 'Bank not supported' };
  }

  // Validate bank account number (basic Nigerian validation)
  validateBankAccount(accountNumber, bankCode) {
    if (!accountNumber || accountNumber.length < 10) {
      return { valid: false, error: 'Account number must be at least 10 digits' };
    }
    
    // Basic format validation
    if (!/^\d+$/.test(accountNumber)) {
      return { valid: false, error: 'Account number must contain only digits' };
    }
    
    // Bank-specific validations (simplified)
    const bankValidations = {
      'FBN': accountNumber.length === 10,
      'ZENITH': accountNumber.length === 10,
      'GTB': accountNumber.length === 10,
      'ACCESS': accountNumber.length === 10,
      'UBA': accountNumber.length === 10
    };
    
    const isValid = bankValidations[bankCode] !== false;
    
    return {
      valid: isValid,
      error: isValid ? null : `Invalid account number format for ${bankCode}`
    };
  }
}

module.exports = new BankService();