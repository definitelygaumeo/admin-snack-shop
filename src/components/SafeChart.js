import React, { useRef, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Spin } from 'antd';

const SafeChart = ({ chartType, data, options, height }) => {
  const chartRef = useRef(null);

  // Kiểm tra dữ liệu biểu đồ hợp lệ
  const isValidData = data && 
                     data.labels && 
                     Array.isArray(data.labels) && 
                     data.datasets && 
                     Array.isArray(data.datasets);
  
  // Xử lý hủy chart khi component unmount hoặc data thay đổi
  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, [data]);

  if (!isValidData) {
    return (
      <div style={{ 
        height: height || 300, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f5f5f5' 
      }}>
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );
  }
  
  // Chọn component chart dựa vào loại
  const ChartComponent = chartType === 'line' ? Line : 
                       chartType === 'bar' ? Bar : 
                       chartType === 'pie' ? Pie : null;
  
  if (!ChartComponent) return null;
  
  const defaultOptions = { 
    maintainAspectRatio: false, 
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };
  
  return (
    <ChartComponent 
      ref={chartRef}
      data={data} 
      options={options || defaultOptions} 
      height={height || 300} 
    />
  );
};

export default SafeChart;