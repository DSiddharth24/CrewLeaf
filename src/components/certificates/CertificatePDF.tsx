import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer'

// Register fonts if needed, or use defaults
// Font.register({ family: 'Inter', src: ... })

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        border: '10px solid #8b5cf6',
    },
    title: {
        fontSize: 42,
        marginBottom: 20,
        color: '#1e1b4b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 40,
        color: '#64748b',
    },
    name: {
        fontSize: 32,
        marginBottom: 10,
        color: '#8b5cf6',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 60,
        color: '#334155',
        lineHeight: 1.6,
        maxWidth: 500,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 40,
        paddingHorizontal: 60,
    },
    signatureBox: {
        alignItems: 'center',
        borderTop: '1px solid #cbd5e1',
        paddingTop: 8,
        width: 150,
    },
    signatureName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    signatureRole: {
        fontSize: 10,
        color: '#64748b',
    },
    certNumber: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        fontSize: 8,
        color: '#94a3b8',
    }
})

export const CertificatePDF = ({ data }: { data: any }) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <Text style={styles.title}>{data.templateTitle || 'Certificate of Excellence'}</Text>
            <Text style={styles.subtitle}>This is to certify that</Text>
            <Text style={styles.name}>{data.participantName}</Text>
            <Text style={styles.description}>
                has successfully participated in "{data.eventTitle}"
                organized by {data.clubName} at {data.collegeName}.
                Their contribution and performance have been exemplary.
            </Text>

            <View style={styles.footer}>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureName}>{data.signatureLeftName || 'Club President'}</Text>
                    <Text style={styles.signatureRole}>{data.signatureLeftRole || 'Event Coordinator'}</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureName}>{data.signatureRightName || 'Faculty In-charge'}</Text>
                    <Text style={styles.signatureRole}>{data.signatureRightRole || 'HOD / Dean'}</Text>
                </View>
            </View>

            <Text style={styles.certNumber}>ID: {data.certificateNumber}</Text>
        </Page>
    </Document>
)
