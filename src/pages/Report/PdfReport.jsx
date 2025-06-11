
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


