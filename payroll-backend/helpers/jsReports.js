const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

let logoBase64;

// Configure with environment variables
const JSREPORT_URL = process.env.JSREPORT_API_URL;

// Preload logo image during initialization
async function loadLogo() {
  try {
    const logoPath = path.join(__dirname, '../assets/NNPC_LOG.png');
    const data = await fs.readFile(logoPath);
    logoBase64 = `data:image/png;base64,${data.toString('base64')}`;
  } catch (error) {
    console.warn('Could not load logo image, using placeholder');
    // Create a transparent 1x1 pixel as fallback
    logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}

// const getOptimizedLogo = async () => {
//   const logoPath = path.join(__dirname, '../assets/NNPC_LOGO.png');
  
//   try {
//     const optimizedBuffer = await sharp(logoPath)
//       // Remove white background
//       .flatten({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
//       .resize(400, 200, {  // Increased dimensions
//         fit: 'contain',
//         background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent
//       })
//       .png({ 
//         compressionLevel: 9,
//         adaptiveFiltering: true,
//         progressive: true,
//         quality: 90
//       })
//       .toBuffer();

//     logoBase64 = `data:image/png;base64,${optimizedBuffer.toString('base64')}`;
//   } catch (error) {
//     console.error('Image processing failed:', error);
//     // Transparent fallback
//     logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NjYiPkxvZ28gTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
//   }
// }


// Helper functions as STRINGS (to avoid serialization issues)
const helperScript = `
  // const moment = require('moment');
  
  // function formatDate(date, format) {
  //   return moment(date).format(format);
  // }

  function formatDate(date, format) {
    // Use vanilla JS instead of moment
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      // Add more formatting as needed
    });
  }
  
  function split(str, delimiter, index) {
    return str.split(delimiter)[index];
  }
  
  function neq(a, b) {
    return a !== b;
  }
  
  function round(num, places) {
    return Number(num).toFixed(places);
  }
  
  function toLowerCase(str) {
    return str.toLowerCase();
  }
  
  function contains(str, substr) {
    return str.includes(substr);
  }

  function getLogo() {
    // Access the logo from template data
    return this.logo;
  }
  
  module.exports = {
    formatDate,
    getLogo,
    split,
    neq,
    round,
    toLowerCase,
    contains
  };
`;

loadLogo(); 

async function generatePDF(reportType, reportData, definition, log) {  
  try{
    const requestData = {
      template: {
        name: `${reportType}_template`, 
        content: definition.template,
        engine: "handlebars",
        recipe: "chrome-pdf",
        compile: {
          cache: false
        },
        helpers: helperScript,
        chrome: {
          landscape: true,
          printBackground: true,
          margin: "2cm",
          timeout: 180000,
          args: ["--disable-cache"],
          scale: 1.0
        }
      },
      data: {
        title: `${reportType} Report`,
        data: reportData.data,
        now: new Date(),
        start: reportData.startDate,
        end: reportData.endDate,
        logo: logoBase64
      },

    };
  
  
    log.Debug('JSREPORT_REQUEST', {
      url: JSREPORT_URL,
      reportType,
      dataSize: JSON.stringify(requestData).length,
    });

    const response = await axios({
      method: 'POST',
      headers: { 
       'Content-Type': 'application/json', 
       'Accept': 'application/pdf'
      },
      url: JSREPORT_URL,
      data: requestData,
      maxBodyLength: Infinity,
      responseType: 'arraybuffer', // Crucial for PDF
      timeout: 240000 
    });

    if (!response.data || response.data.length < 100) {
      throw new Error('Invalid PDF response from jsReport');
    }

    // Add version validation
    if (response.headers['x-jsreport-version']) {
      const serverVersion = response.headers['x-jsreport-version'];
      if (serverVersion !== definition.version.toString()) {
        log.Warn('VERSION_MISMATCH', {
          client: definition.version,
          server: serverVersion
        });
      }
    }

    return response.data;
  } catch (error) {
    // Enhanced error diagnostics
    log.Error('PDF_GENERATE_FAILED', {
        error: error.message,
        stack: error.stack
    });
  }
}

module.exports = { generatePDF };
