import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const ChartComponent = ({ chartId, series, labels }) => {
    useEffect(() => {
        const options = {
            series: [series],
            chart: {
                type: 'radialBar',
                offsetY: -10,
                height: 250,
                sparkline: {
                    enabled: true
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            plotOptions: {
                radialBar: {
                    startAngle: -135,
                    endAngle: 135,
                    hollow: {
                        margin: 0,
                        size: '70%',
                        background: '#fff',
                        image: undefined,
                        imageOffsetX: 0,
                        imageOffsetY: 0,
                        position: 'front',
                        dropShadow: {
                            enabled: true,
                            top: 3,
                            left: 0,
                            blur: 4,
                            opacity: 0.24
                        }
                    },
                    track: {
                        background: "#f2f2f2",
                        strokeWidth: '97%',
                        margin: 5,
                        dropShadow: {
                            enabled: true,
                            top: -3,
                            left: 0,
                            blur: 4,
                            opacity: 0.15
                        }
                    },
                    dataLabels: {
                        name: {
                            show: true,
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#888',
                            offsetY: -10
                        },
                        value: {
                            offsetY: 0,
                            fontSize: '36px',
                            fontWeight: 700,
                            formatter: function (val) {
                                return val + '%';
                            }
                        }
                    }
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'horizontal',
                    shadeIntensity: 0.5,
                    gradientToColors: ['#1890ff'],
                    inverseColors: true,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 100]
                },
            },
            stroke: {
                lineCap: 'round'
            },
            labels: labels,
        };

        const chart = new ApexCharts(document.querySelector(`#${chartId}`), options);
        chart.render();

        return () => chart.destroy(); // Cleanup on component unmount
    }, [chartId, series, labels]);

    return (
        <div className="chart-wrapper">
            <div id={chartId} style={{ marginTop: '10px' }} />
        </div>
    );
};

export default ChartComponent;
