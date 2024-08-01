// import React from 'react';
// import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// // Utility function to get unique field names from the data
// const getUniqueFields = (data) => {
//   const fields = new Set();
//   data.forEach(item => {
//     Object.keys(item).forEach(key => fields.add(key));
//   });
//   return Array.from(fields);
// };

// const PDFReport = ({ project, data, workedBy }) => {
//   const fields = getUniqueFields(data); // Get all unique field names

//   return (
//     <Document>
//       <Page size="A3" style={styles.page}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Report for {project}</Text>
//           {workedBy && <Text style={styles.subtitle}>Worked by: {workedBy.label}</Text>}
//         </View>
//         <View style={styles.table}>
//           <View style={styles.tableRow}>
//             <Text style={styles.tableColHeader}>S.No.</Text>
//             {fields.map(field => (
//               <Text key={field} style={styles.tableColHeader}>{field}</Text>
//             ))}
//           </View>
//           {data.map((item, index) => (
//             <View key={item.flagId || index} style={styles.tableRow}>
//               <Text style={styles.tableCol}>{index + 1}</Text>
//               {fields.map(field => (
//                 <Text key={field} style={styles.tableCol}>
//                   {item[field] !== null && item[field] !== undefined ? item[field] : ''}
//                 </Text>
//               ))}
//             </View>
//           ))}
//         </View>
//       </Page>
//     </Document>
//   );
// };

// const styles = StyleSheet.create({
//   page: {
//     flexDirection: 'column',
//     backgroundColor: '#f5f5f5',
//     padding: 20,
//   },
//   header: {
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   title: {
//     fontSize: 26,
//     fontFamily: 'Helvetica-Bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 18,
//     fontFamily: 'Helvetica',
//     color: '#555',
//   },
//   table: {
//     display: 'table',
//     width: '100%',
//     borderStyle: 'solid',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderCollapse: 'collapse',
//     marginTop: 10,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     borderBottomStyle: 'solid',
//   },
//   tableColHeader: {
//     borderStyle: 'solid',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     padding: 10,
//     fontWeight: 'bold',
//     backgroundColor: '#f0f0f0',
//     textAlign: 'center',
//     fontFamily: 'Helvetica-Bold',
//     color: '#333',
//     flex: 1,
//   },
//   tableCol: {
//     borderStyle: 'solid',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     padding: 10,
//     textAlign: 'center',
//     fontFamily: 'Helvetica',
//     color: '#333',
//     flex: 1,
//   },
// });

// export default PDFReport;


// PdfReport.js
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Define the styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18, // Title font size
    marginBottom: 15,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 15,
    borderStyle: 'solid',
    borderWidth: 0.5, // Border width
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '20%', // Adjusted width for remaining columns
    borderStyle: 'solid',
    borderWidth: 0.5, // Border width
    borderColor: '#000',
    padding: 2, // Padding
  },
  tableCell: {
    fontSize: 8, // Cell font size
    margin: 'auto',
    textAlign: 'center',
  },
});

// Define the PDF document
const PDFReport = ({ data, selectedFields }) => {
  if (!data.length) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No data available to display.</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Report</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {selectedFields.map((field) => (
              <View style={styles.tableCol} key={field.value}>
                <Text style={styles.tableCell}>{field.label}</Text>
              </View>
            ))}
          </View>
          {data.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              {selectedFields.map((field) => (
                <View style={styles.tableCol} key={field.value}>
                  <Text style={styles.tableCell}>{item[field.value]}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default PDFReport;


