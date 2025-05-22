import React, { useEffect, useRef } from 'react';

function TaskDistributionChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // This is a placeholder for a real chart library
    // In a real implementation, you would use a library like Chart.js or Recharts
    const ctx = chartRef.current.getContext('2d');
    
    // Clear previous chart
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
    
    // Sample data
    const data = [
      { label: 'Bug Fixes', value: 35, color: '#3B82F6' },
      { label: 'New Features', value: 25, color: '#10B981' },
      { label: 'Documentation', value: 15, color: '#F59E0B' },
      { label: 'Testing', value: 25, color: '#8B5CF6' }
    ];
    
    // Draw simple bar chart
    const barWidth = 40;
    const spacing = 30;
    const startX = 50;
    const bottomY = chartRef.current.height - 40;
    const maxBarHeight = bottomY - 40;
    
    // Draw bars
    data.forEach((item, index) => {
      const x = startX + index * (barWidth + spacing);
      const barHeight = (item.value / 100) * maxBarHeight;
      const y = bottomY - barHeight;
      
      // Draw bar
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, bottomY + 20);
      
      // Draw value
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`${item.value}%`, x + barWidth / 2, y - 10);
    });
    
    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Task Types Distribution', chartRef.current.width / 2, 20);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <canvas ref={chartRef} width="400" height="200"></canvas>
    </div>
  );
}

export default TaskDistributionChart;