import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function AnalyticsScreen() {
    const screenWidth = Dimensions.get('window').width;

    const chartConfig = {
        backgroundGradientFrom: colors.white,
        backgroundGradientTo: colors.white,
        color: (opacity = 1) => `rgba(45, 95, 63, ${opacity})`, // primary color
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        labelColor: (opacity = 1) => colors.gray700,
    };

    const harvestData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                data: [120, 145, 110, 180, 200, 170, 90], // kg
                color: (opacity = 1) => `rgba(45, 95, 63, ${opacity})`,
                strokeWidth: 2,
            },
        ],
        legend: ['Coffee Harvest (kg)'],
    };

    const expenseData = {
        labels: ['Wages', 'Fuel', 'Maint.', 'Fert.', 'Other'],
        datasets: [
            {
                data: [45000, 12000, 5000, 8000, 2000],
            },
        ],
    };

    const taskDistribution = [
        {
            name: 'Harvesting',
            population: 45,
            color: colors.primary,
            legendFontColor: colors.gray700,
            legendFontSize: 12,
        },
        {
            name: 'Maintain',
            population: 25,
            color: colors.secondary,
            legendFontColor: colors.gray700,
            legendFontSize: 12,
        },
        {
            name: 'Weeding',
            population: 15,
            color: colors.accent,
            legendFontColor: colors.gray700,
            legendFontSize: 12,
        },
        {
            name: 'Other',
            population: 15,
            color: colors.gray400,
            legendFontColor: colors.gray700,
            legendFontSize: 12,
        },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Farm Analytics</Text>

            {/* Harvest Trends */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Weekly Harvest Yield</Text>
                <LineChart
                    data={harvestData}
                    width={screenWidth - spacing.lg * 2 - spacing.md * 2}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                />
            </View>

            {/* Expense Breakdown */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Monthly Expenses</Text>
                <BarChart
                    data={expenseData}
                    width={screenWidth - spacing.lg * 2 - spacing.md * 2}
                    height={220}
                    yAxisLabel="₹"
                    yAxisSuffix=""
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`, // secondary
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                />
            </View>

            {/* Task Distribution */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Task Distribution</Text>
                <PieChart
                    data={taskDistribution}
                    width={screenWidth - spacing.lg * 2 - spacing.md * 2}
                    height={200}
                    chartConfig={chartConfig}
                    accessor={'population'}
                    backgroundColor={'transparent'}
                    paddingLeft={'15'}
                    absolute
                />
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.lg,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
        ...shadows.sm,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.gray800,
        marginBottom: spacing.md,
        alignSelf: 'flex-start',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});
