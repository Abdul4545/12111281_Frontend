import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import { DateRange } from 'react-date-range';
import { eachDayOfInterval, format } from 'date-fns';
import data from './data.json';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const Dashboard = () => {
  const [filteredData, setFilteredData] = useState(data);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(2015, 6, 1),
    endDate: new Date(2015, 6, 9),
    key: 'selection',
  });
  const [dateCategories, setDateCategories] = useState([]);

  useEffect(() => {
    const allDates = eachDayOfInterval({
      start: selectionRange.startDate,
      end: selectionRange.endDate,
    }).map((date) => format(date, 'dd-MMM')); 

    setDateCategories(allDates);

    const filtered = data.filter((entry) => {
      const entryDate = new Date(
        entry.arrival_date_year,
        new Date(entry.arrival_date_month + " 1, 2015").getMonth(),
        entry.arrival_date_day_of_month
      );
      return (
        entryDate >= selectionRange.startDate && entryDate <= selectionRange.endDate
      );
    });
    setFilteredData(filtered);
  }, [selectionRange]);


  const visitorsPerDay = dateCategories.reduce((acc, date) => {
    acc[date] = 0;
    return acc;
  }, {});

  filteredData.forEach((entry) => {
    const formattedDate = format(new Date(
      entry.arrival_date_year,
      new Date(entry.arrival_date_month + " 1, 2015").getMonth(),
      entry.arrival_date_day_of_month
    ), 'dd-MMM');

    const totalVisitors = entry.adults + entry.children + entry.babies;
    if (visitorsPerDay[formattedDate] !== undefined) {
      visitorsPerDay[formattedDate] += totalVisitors; 
    }
  });

  const visitorsPerCountry = filteredData.reduce((acc, entry) => {
    acc[entry.country] = (acc[entry.country] || 0) + entry.adults + entry.children + entry.babies;
    return acc;
  }, {});

  const adultsVisitors = filteredData.map((entry) => entry.adults);
  const childrenVisitors = filteredData.map((entry) => entry.children);

  return (
    <div className="dashboard">
      <h1>Visitor Dashboard</h1>

      {/* Date Range Picker */}
      <DateRange
        ranges={[selectionRange]}
        onChange={(ranges) => setSelectionRange(ranges.selection)}
        moveRangeOnFirstSelection={false}
        months={2}
        direction="horizontal"
      />

      {/* Time Series Chart - Visitors Per Day */}
      <ApexCharts
        options={{
          chart: {
            type: 'area',
            stacked: false,
            height: 350,
            zoom: {
              type: 'x',
              enabled: true,
              autoScaleYaxis: true,
            },
            toolbar: {
              autoSelected: 'zoom',
            },
          },
          colors: ['#FF5733'],
          dataLabels: {
            enabled: false,
          },
          markers: {
            size: 0,
          },
          title: {
            text: 'Visitors Per Day',
            align: 'left',
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              inverseColors: false,
              opacityFrom: 0.5,
              opacityTo: 0,
              stops: [0, 90, 100],
            },
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return val.toFixed(0); 
              },
            },
            title: {
              text: 'Visitors',
            },
          },
          xaxis: {
            type: 'category',
            categories: dateCategories,
          },
          tooltip: {
            shared: false,
            y: {
              formatter: function (val) {
                return val.toFixed(0); 
              },
            },
          },
        }}
        series={[{
          name: 'Visitors',
          data: Object.values(visitorsPerDay),
        }]}
        type="area"
        height={350}
      />

      {/* Column Chart - Visitors per Country */}
      <ApexCharts
        options={{
          chart: { id: 'visitors-country' },
          xaxis: { categories: Object.keys(visitorsPerCountry) },
          title: { text: 'Visitors Per Country' },
        }}
        series={[
          {
            name: 'Visitors',
            data: Object.values(visitorsPerCountry),
          },
        ]}
        type="bar"
        height={350}
      />

      {/* Sparkline Charts */}
      <div className="sparklines">
        <ApexCharts
          options={{ chart: { sparkline: { enabled: true } }, title: { text: 'Adult Visitors' } }}
          series={[{ data: adultsVisitors }]}
          type="line"
          height={150}
        />
        <ApexCharts
          options={{ chart: { sparkline: { enabled: true } }, title: { text: 'Children Visitors' } }}
          series={[{ data: childrenVisitors }]}
          type="line"
          height={150}
        />
      </div>
    </div>
  );
};

export default Dashboard;

